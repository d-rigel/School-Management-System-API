const request = require('supertest');

const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Schools API', () => {
    let superadminToken;
    let schoolAdminToken;
    let testSchoolId;

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

    describe('POST /api/schools', () => {
        it('should create a school as superadmin', async () => {
            const response = await request(baseURL)
                .post('/api/schools')
                .set('Authorization', `Bearer ${superadminToken}`)
                .send({
                    name: `Test School ${Date.now()}`,
                    code: `TST${Date.now()}`,
                    address: {
                        street: '123 Test St',
                        city: 'Test City',
                        state: 'Test State',
                        country: 'Nigeria',
                        postalCode: '100001'
                    },
                    contactInfo: {
                        email: `test${Date.now()}@school.com`,
                        phone: '+234-123-456-7890'
                    },
                    totalCapacity: 500
                });

            expect(response.status).toBe(201);
            expect(response.body.ok).toBe(true);
            testSchoolId = response.body.data._id;
        });

        it('should fail as school admin', async () => {
            const response = await request(baseURL)
                .post('/api/schools')
                .set('Authorization', `Bearer ${schoolAdminToken}`)
                .send({
                    name: 'Unauthorized School',
                    code: 'UNS001',
                    address: {
                        street: '123 Test St',
                        city: 'Test City',
                        state: 'Test State',
                        country: 'Nigeria',
                        postalCode: '100001'
                    },
                    contactInfo: {
                        email: 'unauthorized@school.com',
                        phone: '+234-123-456-7890'
                    },
                    totalCapacity: 500
                });

            expect(response.status).toBe(403);
            expect(response.body.ok).toBe(false);
        });
    });

    describe('GET /api/schools', () => {
        it('should list all schools as superadmin', async () => {
            const response = await request(baseURL)
                .get('/api/schools')
                .set('Authorization', `Bearer ${superadminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.data).toHaveProperty('schools');
            expect(Array.isArray(response.body.data.schools)).toBe(true);
        });

        it('should show only assigned school for school admin', async () => {
            const response = await request(baseURL)
                .get('/api/schools')
                .set('Authorization', `Bearer ${schoolAdminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.data.schools).toHaveLength(1);
        });
    });

    describe('GET /api/schools/:id', () => {
        it('should get a school by ID', async () => {
            const schoolsList = await request(baseURL)
                .get('/api/schools')
                .set('Authorization', `Bearer ${superadminToken}`);

            const schoolId = schoolsList.body.data.schools[0]._id;

            const response = await request(baseURL)
                .get(`/api/schools/${schoolId}`)
                .set('Authorization', `Bearer ${superadminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.data._id).toBe(schoolId);
        });
    });

    describe('PUT /api/schools/:id', () => {
        it('should update a school as superadmin', async () => {
            if (!testSchoolId) {
                const schoolsList = await request(baseURL)
                    .get('/api/schools')
                    .set('Authorization', `Bearer ${superadminToken}`);
                testSchoolId = schoolsList.body.data.schools[0]._id;
            }

            const response = await request(baseURL)
                .put(`/api/schools/${testSchoolId}`)
                .set('Authorization', `Bearer ${superadminToken}`)
                .send({
                    principalName: 'Updated Principal Name'
                });

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
        });
    });

    describe('GET /api/schools/:id/stats', () => {
        it('should get school statistics', async () => {
            const schoolsList = await request(baseURL)
                .get('/api/schools')
                .set('Authorization', `Bearer ${superadminToken}`);

            const schoolId = schoolsList.body.data.schools[0]._id;

            const response = await request(baseURL)
                .get(`/api/schools/${schoolId}/stats`)
                .set('Authorization', `Bearer ${superadminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.data).toHaveProperty('totalClassrooms');
            expect(response.body.data).toHaveProperty('totalStudents');
        });
    });
});