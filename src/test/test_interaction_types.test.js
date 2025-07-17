const request = require('supertest');
const app = require('../../../../app'); // Assuming the Express app is exported
const db = require('../../../../db'); // Assuming a database module
const { requireAdminAuth } = require('../../../../middleware/auth'); // Assuming an auth middleware

// Mock the dependencies
jest.mock('../../../../db');
jest.mock('../../../../middleware/auth', () => ({
  requireAdminAuth: jest.fn((req, res, next) => next()), // Default mock allows access
}));

describe('GET /api/v1/admin/interaction-types', () => {
  const mockInteractionTypes = [
    {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      name: 'Email',
      icon_name: 'email',
      is_deletable: false,
      display_order: 1,
    },
    {
      id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
      name: 'Call',
      icon_name: 'phone',
      is_deletable: false,
      display_order: 2,
    },
    {
      id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
      name: 'Meeting',
      icon_name: 'calendar',
      is_deletable: true,
      display_order: 3,
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Restore the default 'pass-through' implementation for the auth mock
    requireAdminAuth.mockImplementation((req, res, next) => next());
  });

  describe('Success Scenarios', () => {
    it('should return a list of all interaction types sorted by display_order by default', async () => {
      db.query.mockResolvedValue([mockInteractionTypes]);

      const response = await request(app)
        .get('/api/v1/admin/interaction-types')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual(mockInteractionTypes);
      expect(db.query).toHaveBeenCalledTimes(1);
      const [query, params] = db.query.mock.calls[0];
      // Check for the base query and default sort order
      expect(query).toContain('SELECT id, name, icon_name, is_deletable, display_order FROM interaction_types');
      expect(query).toContain('ORDER BY display_order asc');
      expect(params).toEqual([]);
    });

    it('should return a filtered list based on the search query', async () => {
      const filteredData = mockInteractionTypes.filter((it) => it.name === 'Email');
      db.query.mockResolvedValue([filteredData]);

      const response = await request(app)
        .get('/api/v1/admin/interaction-types?search=Email')
        .expect(200);

      expect(response.body).toEqual(filteredData);
      expect(db.query).toHaveBeenCalledTimes(1);
      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain('WHERE name LIKE ?');
      expect(params).toEqual(['%Email%']);
    });

    it('should return a list sorted by name in descending order', async () => {
      const sortedData = [...mockInteractionTypes].sort((a, b) => b.name.localeCompare(a.name));
      db.query.mockResolvedValue([sortedData]);

      const response = await request(app)
        .get('/api/v1/admin/interaction-types?sortBy=name&order=desc')
        .expect(200);

      expect(response.body).toEqual(sortedData);
      expect(db.query).toHaveBeenCalledTimes(1);
      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain('ORDER BY name desc');
      expect(params).toEqual([]);
    });

    it('should return an empty array when no interaction types are found', async () => {
      db.query.mockResolvedValue([[]]);

      const response = await request(app)
        .get('/api/v1/admin/interaction-types')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Scenarios', () => {
    it('should return 401 Unauthorized if the user is not authenticated', async () => {
      // Override the auth mock to simulate an unauthorized user
      requireAdminAuth.mockImplementation((req, res, next) => {
        return res.status(401).json({ message: 'Unauthorized.' });
      });

      const response = await request(app)
        .get('/api/v1/admin/interaction-types')
        .expect(401);

      expect(response.body).toEqual({ message: 'Unauthorized.' });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should return 500 Internal Server Error if the database query fails', async () => {
      const dbError = new Error('Database connection lost');
      db.query.mockRejectedValue(dbError);

      const response = await request(app)
        .get('/api/v1/admin/interaction-types')
        .expect(500);

      expect(response.body).toEqual({ message: 'Internal Server Error.' });
      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });
});