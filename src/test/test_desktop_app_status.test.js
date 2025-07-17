const request = require('supertest');
const app = require('../../../src/app'); // Assuming your Express app is exported from here
const desktopAppStatusService = require('../../../src/services/desktopAppStatusService');

// Mock the service layer that checks the desktop app status
jest.mock('../../../src/services/desktopAppStatusService');

// Mock the authentication middleware
// This mock will simulate a logged-in user for most tests
jest.mock('../../../src/middleware/auth', () => jest.fn((req, res, next) => {
    // Attach a mock user to the request object
    req.user = { id: 'c7a2a8a1-3c2a-4e4a-9e4a-ec2a3a4a5b6b', organizationId: 'org-123' };
    next();
}));

const authMiddleware = require('../../../src/middleware/auth');

describe('GET /api/v1/status/desktop-app', () => {

    beforeEach(() => {
        // Reset mocks before each test to ensure isolation
        jest.clearAllMocks();
        // By default, mock the auth middleware to pass
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: 'c7a2a8a1-3c2a-4e4a-9e4a-ec2a3a4a5b6b', organizationId: 'org-123' };
            next();
        });
    });

    describe('Successful Scenarios', () => {
        it('should return 200 with status ACTIVE when the desktop app has a recent heartbeat', async () => {
            // Arrange: Mock the service to return an active status
            desktopAppStatusService.checkStatus.mockResolvedValue(true);

            // Act
            const response = await request(app)
                .get('/api/v1/status/desktop-app')
                .set('Authorization', 'Bearer valid-token');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'ACTIVE' });
            expect(desktopAppStatusService.checkStatus).toHaveBeenCalledWith('c7a2a8a1-3c2a-4e4a-9e4a-ec2a3a4a5b6b');
            expect(desktopAppStatusService.checkStatus).toHaveBeenCalledTimes(1);
        });

        it('should return 200 with status INACTIVE when the desktop app has no recent heartbeat', async () => {
            // Arrange: Mock the service to return an inactive status
            desktopAppStatusService.checkStatus.mockResolvedValue(false);

            // Act
            const response = await request(app)
                .get('/api/v1/status/desktop-app')
                .set('Authorization', 'Bearer valid-token');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'INACTIVE' });
            expect(desktopAppStatusService.checkStatus).toHaveBeenCalledWith('c7a2a8a1-3c2a-4e4a-9e4a-ec2a3a4a5b6b');
            expect(desktopAppStatusService.checkStatus).toHaveBeenCalledTimes(1);
        });

        it('should return 200 with status UNKNOWN if the status check service throws an error', async () => {
            // Arrange: Mock the service to simulate an unexpected failure
            const errorMessage = 'Database connection failed';
            desktopAppStatusService.checkStatus.mockRejectedValue(new Error(errorMessage));

            // Act
            const response = await request(app)
                .get('/api/v1/status/desktop-app')
                .set('Authorization', 'Bearer valid-token');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'UNKNOWN' });
            expect(desktopAppStatusService.checkStatus).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Scenarios', () => {
        it('should return 401 Unauthorized if no authentication token is provided', async () => {
            // Arrange: Mock the auth middleware to fail
            authMiddleware.mockImplementation((req, res, next) => {
                // This simulates the real middleware's behavior for a missing token
                return res.status(401).json({ message: 'Unauthorized - Authentication token is missing or invalid.' });
            });

            // Act
            const response = await request(app).get('/api/v1/status/desktop-app'); // No Authorization header

            // Assert
            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Unauthorized - Authentication token is missing or invalid.' });
            expect(desktopAppStatusService.checkStatus).not.toHaveBeenCalled();
        });

        it('should return 401 Unauthorized if an invalid authentication token is provided', async () => {
            // Arrange: Mock the auth middleware to fail for an invalid token
            authMiddleware.mockImplementation((req, res, next) => {
                return res.status(401).json({ message: 'Unauthorized - Authentication token is missing or invalid.' });
            });

            // Act
            const response = await request(app)
                .get('/api/v1/status/desktop-app')
                .set('Authorization', 'Bearer invalid-token');

            // Assert
            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Unauthorized - Authentication token is missing or invalid.' });
            expect(desktopAppStatusService.checkStatus).not.toHaveBeenCalled();
        });
    });
});