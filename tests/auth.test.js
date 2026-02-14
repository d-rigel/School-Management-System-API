const request = require('supertest');
const mongoose = require('mongoose');

const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Authentication API', () => {
    let superadminToken;
    let schoolAdminToken;

    beforeAll(async () => {
        // Login as superadmin
        const superadminLogin = await request(baseURL)
            .post('/api/auth/login')
            .send({
                email: 'superadmin@schoolsystem.com',
                password: 'Superadmin@123'
            });
        
        superadminToken = superadminLogin.body.data.tokens.accessToken;

        // Login as school admin
        const schoolAdminLogin = await request(baseURL)
            .post('/api/auth/login')
            .send({
                email: 'admin@greenwoodhigh.edu.ng',
                password: 'Admin@123'
            });
        
        schoolAdminToken = schoolAdminLogin.body.data.tokens.accessToken;
    });

    describe('POST /api/auth/register', () => {
        it('should register a new superadmin', async () => {
            const response = await request(baseURL)
                .post('/api/auth/register')
                .send({
                    email: `test${Date.now()}@test.com`,
                    password: 'Test@12345',
                    firstName: 'Test',
                    lastName: 'User',
                    role: 'superadmin'
                });

            expect(response.status).toBe(201);
            expect(response.body.ok).toBe(true);
            expect(response.body.data).toHaveProperty('email');
        });

        it('should fail with duplicate email', async () => {
            const response = await request(baseURL)
                .post('/api/auth/register')
                .send({
                    email: 'superadmin@schoolsystem.com',
                    password: 'Test@12345',
                    firstName: 'Test',
                    lastName: 'User',
                    role: 'superadmin'
                });

            expect(response.status).toBe(409);
            expect(response.body.ok).toBe(false);
        });

        it('should fail without required fields', async () => {
            const response = await request(baseURL)
                .post('/api/auth/register')
                .send({
                    email: 'test@test.com',
                    firstName: 'Test'
                });

            expect(response.status).toBe(400);
            expect(response.body.ok).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(baseURL)
                .post('/api/auth/login')
                .send({
                    email: 'superadmin@schoolsystem.com',
                    password: 'Superadmin@123'
                });

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.data).toHaveProperty('tokens');
            expect(response.body.data.tokens).toHaveProperty('accessToken');
        });

        it('should fail with invalid credentials', async () => {
            const response = await request(baseURL)
                .post('/api/auth/login')
                .send({
                    email: 'superadmin@schoolsystem.com',
                    password: 'WrongPassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.ok).toBe(false);
        });
    });

    describe('GET /api/auth/profile', () => {
        it('should get profile with valid token', async () => {
            const response = await request(baseURL)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${superadminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.data).toHaveProperty('email');
        });

        it('should fail without token', async () => {
            const response = await request(baseURL)
                .get('/api/auth/profile');

            expect(response.status).toBe(401);
            expect(response.body.ok).toBe(false);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const response = await request(baseURL)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${superadminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
        });
    });
});