const request = require('supertest');
const app = require('../../../app'); // Assuming your Express app is exported
const db = require('../../../config/db'); // Assuming a centralized db module

// Mock the database module
jest.mock('../../../config/db');

// Mock any authentication middleware
jest.mock('../../../middleware/auth', () => ({
  isAdmin: (req, res, next) => next(), // Bypass auth for tests
}));

// Mock any validation middleware
jest.mock('../../../middleware/validators', () => ({
    updateCustomFieldValidator: (req, res, next) => next(), // Bypass validation for most tests
}));

describe('PUT /api/v1/admin/custom-fields/:id', () => {
    let mockConnection;

    beforeEach(() => {
        mockConnection = {
            beginTransaction: jest.fn().mockResolvedValue(),
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue(),
            query: jest.fn(),
            release: jest.fn(),
        };
        db.promise = jest.fn().mockReturnValue({
            getConnection: jest.fn().mockResolvedValue(mockConnection),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Successful Updates', () => {
        test('should 200 OK and update only the label when field_type is unchanged', async () => {
            const fieldId = 1;
            const updatePayload = { label: 'Updated Contact Name', field_type: 'TEXT' };
            const existingField = [{ id: fieldId, label: 'Contact Name', field_type: 'TEXT' }];

            mockConnection.query.mockResolvedValueOnce([existingField]); // Find field

            const response = await request(app)
                .put(`/api/v1/admin/custom-fields/${fieldId}`)
                .send(updatePayload);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE `custom_fields`'), [updatePayload.label, updatePayload.field_type, fieldId]);
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.rollback).not.toHaveBeenCalled();
        });

        test('should 200 OK and update field_type when no data exists for the field', async () => {
            const fieldId = 2;
            const updatePayload = { label: 'Lead Score', field_type: 'NUMBER' };
            const existingField = [{ id: fieldId, label: 'Lead Status', field_type: 'TEXT' }];

            mockConnection.query
                .mockResolvedValueOnce([existingField]) // Find field
                .mockResolvedValueOnce([[{ count: 0 }]]); // Check for existing values

            const response = await request(app)
                .put(`/api/v1/admin/custom-fields/${fieldId}`)
                .send(updatePayload);

            expect(response.status).toBe(200);
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE `custom_fields`'), [updatePayload.label, updatePayload.field_type, fieldId]);
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        test('should 200 OK and update field_type with confirmation, nullifying existing data', async () => {
            const fieldId = 3;
            const updatePayload = { label: 'Deal Size', field_type: 'NUMBER', confirm_data_loss: true };
            const existingField = [{ id: fieldId, label: 'Deal Size', field_type: 'TEXT' }];

            mockConnection.query
                .mockResolvedValueOnce([existingField]) // Find field
                .mockResolvedValueOnce([[{ count: 150 }]]); // Check for existing values

            const response = await request(app)
                .put(`/api/v1/admin/custom-fields/${fieldId}`)
                .send(updatePayload);

            expect(response.status).toBe(200);
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE `custom_field_values` SET `value` = NULL'), [fieldId]);
            expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE `custom_fields` SET'), [updatePayload.label, updatePayload.field_type, fieldId]);
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        test('should 200 OK and delete options when changing from SELECT to TEXT', async () => {
            const fieldId = 4;
            const updatePayload = { label: 'Source Details', field_type: 'TEXT' };
            const existingField = [{ id: fieldId, label: 'Source', field_type: 'SELECT' }];

            mockConnection.query
                .mockResolvedValueOnce([existingField]) // Find field
                .mockResolvedValueOnce([[{ count: 0 }]]); // Check for existing values

            const response = await request(app)
                .put(`/api/v1/admin/custom-fields/${fieldId}`)
                .send(updatePayload);

            expect(response.status).toBe(200);
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM `custom_field_options`'), [fieldId]);
            expect(mockConnection.commit).toHaveBeenCalled();
        });
    });

    describe('Error Responses', () => {
        test('should 409 Conflict when changing type with existing data without confirmation', async () => {
            const fieldId = 5;
            const updatePayload = { label: 'Lead Source', field_type: 'SELECT' };
            const existingField = [{ id: fieldId, label: 'Lead Source', field_type: 'TEXT' }];

            mockConnection.query
                .mockResolvedValueOnce([existingField]) // Find field
                .mockResolvedValueOnce([[{ count: 42 }]]); // Check for existing values

            const response = await request(app)
                .put(`/api/v1/admin/custom-fields/${fieldId}`)
                .send(updatePayload);

            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                message: 'Conflict - Changing field type may result in data loss for existing entries. Please confirm to proceed.',
                body: { requires_confirmation: true }
            });
            expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
        });

        test('should 404 Not Found if custom field does not exist', async () => {
            const fieldId = 999;
            mockConnection.query.mockResolvedValueOnce([[]]); // No field found

            const response = await request(app)
                .put(`/api/v1/admin/custom-fields/${fieldId}`)
                .send({ label: 'Non-existent Field', field_type: 'TEXT' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Custom field not found.');
        });

        test('should 500 Internal Server Error on database transaction failure', async () => {
            const fieldId = 1;
            const updatePayload = { label: 'Updated Label', field_type: 'TEXT' };
            const existingField = [{ id: fieldId, label: 'Original Label', field_type: 'TEXT' }];
            const dbError = new Error('DB connection failed');

            mockConnection.query
                .mockResolvedValueOnce([existingField]) // Find field succeeds
                .mockRejectedValueOnce(dbError); // Update query fails

            const response = await request(app)
                .put(`/api/v1/admin/custom-fields/${fieldId}`)
                .send(updatePayload);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('An internal server error occurred.');
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(mockConnection.commit).not.toHaveBeenCalled();
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });
});