const request = require('supertest');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Mock dependencies
const db = require('../../src/lib/mysql_connection');
const desktopAppService = require('../../src/services/desktopAppService');
const jobQueue = require('../../src/services/jobQueue');
const authMiddleware = require('../../src/middleware/auth');
const interactionController = require('../../src/controllers/interactionController');

// Mock the modules
jest.mock('../../src/lib/mysql_connection');
jest.mock('../../src/services/desktopAppService');
jest.mock('../../src/services/jobQueue');
jest.mock('../../src/middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { id: 'user-uuid-123', workspace_id: 'ws-uuid-456' };
  next();
}));

// Setup the test application
const app = express();
app.use(express.json());
app.post('/api/v1/interactions', authMiddleware, interactionController.createInteraction);

// Test suite for POST /api/v1/interactions
describe('POST /api/v1/interactions', () => {

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Success Scenarios', () => {
    it('should return 201 and create a new interaction when inputs are valid', async () => {
      const newInteractionId = uuidv4();
      const requestBody = {
        participant_ids: [uuidv4(), uuidv4()],
        objective: 'Finalize Q4 budget planning'
      };

      // Mock dependencies for a successful flow
      desktopAppService.isAppRunning.mockResolvedValue(true);
      db.query.mockResolvedValueOnce([ { insertId: newInteractionId } ]); // For creating the interaction
      db.query.mockResolvedValueOnce([{}]); // For inserting participants
      jobQueue.add.mockResolvedValue({ id: 'job-123' }); // For the background job

      const response = await request(app)
        .post('/api/v1/interactions')
        .send(requestBody);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('interaction_id', newInteractionId);
      expect(response.body).toHaveProperty('status', 'pending_analysis');
      expect(response.body).toHaveProperty('objective', requestBody.objective);
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('redirect_url');

      // Verify database calls
      expect(db.query).toHaveBeenCalledTimes(2);
      // 1. Insert into interactions table
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO interactions (id, user_id, workspace_id, objective, status) VALUES (?, ?, ?, ?, ?)',
        [expect.any(String), 'user-uuid-123', 'ws-uuid-456', requestBody.objective, 'pending_analysis']
      );
      // 2. Insert into interaction_participants table
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO interaction_participants (interaction_id, contact_id) VALUES ?',
        [[[newInteractionId, requestBody.participant_ids[0]], [newInteractionId, requestBody.participant_ids[1]]]]
      );

      // Verify background job was triggered
      expect(jobQueue.add).toHaveBeenCalledTimes(1);
      expect(jobQueue.add).toHaveBeenCalledWith('interaction-analysis', { interactionId: newInteractionId });
    });
  });

  describe('Error Scenarios', () => {
    it('should return 400 if participant_ids is missing', async () => {
      const response = await request(app)
        .post('/api/v1/interactions')
        .send({ objective: 'A valid objective' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Bad Request - 'participant_ids' must be a non-empty array and 'objective' must not be empty.");
      expect(db.query).not.toHaveBeenCalled();
      expect(jobQueue.add).not.toHaveBeenCalled();
    });

    it('should return 400 if participant_ids is an empty array', async () => {
        const response = await request(app)
          .post('/api/v1/interactions')
          .send({ participant_ids: [], objective: 'A valid objective' });
  
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Bad Request - 'participant_ids' must be a non-empty array and 'objective' must not be empty.");
        expect(db.query).not.toHaveBeenCalled();
        expect(jobQueue.add).not.toHaveBeenCalled();
      });

    it('should return 400 if objective is missing or empty', async () => {
      const response = await request(app)
        .post('/api/v1/interactions')
        .send({ participant_ids: [uuidv4()] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Bad Request - 'participant_ids' must be a non-empty array and 'objective' must not be empty.");
      expect(db.query).not.toHaveBeenCalled();
      expect(jobQueue.add).not.toHaveBeenCalled();
    });

    it('should return 424 if the desktop application is not running', async () => {
      // Mock desktop app service to return false
      desktopAppService.isAppRunning.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/interactions')
        .send({ 
            participant_ids: [uuidv4()],
            objective: 'This will fail'
        });

      expect(response.status).toBe(424);
      expect(response.body.message).toBe('Failed Dependency - Relaivaint desktop application is not running.');
      expect(desktopAppService.isAppRunning).toHaveBeenCalledTimes(1);
      expect(db.query).not.toHaveBeenCalled();
      expect(jobQueue.add).not.toHaveBeenCalled();
    });

    it('should return 401 if authentication fails', async () => {
        // Create a separate app instance for this test without the mocked auth middleware
        const unauthenticatedApp = express();
        unauthenticatedApp.use(express.json());
        // This mock simulates the real middleware failing and not calling next()
        const realAuthFailure = (req, res, next) => {
            res.status(401).json({ message: 'Unauthorized - Authentication token is missing or invalid.' });
        };
        unauthenticatedApp.post('/api/v1/interactions', realAuthFailure, interactionController.createInteraction);

        const response = await request(unauthenticatedApp)
            .post('/api/v1/interactions')
            .send({ 
                participant_ids: [uuidv4()],
                objective: 'This will be unauthorized'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized - Authentication token is missing or invalid.');
    });

    it('should return 500 if database query fails', async () => {
        desktopAppService.isAppRunning.mockResolvedValue(true);
        db.query.mockRejectedValue(new Error('DB connection error'));

        const response = await request(app)
            .post('/api/v1/interactions')
            .send({ 
                participant_ids: [uuidv4()],
                objective: 'Test DB failure'
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
        expect(jobQueue.add).not.toHaveBeenCalled();
    });
  });
});