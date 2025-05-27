const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/userModel');
let authToken;
let userId;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

beforeEach(async () => {
    await User.deleteMany({});
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe('User Service', () => {
    // Registration Tests
    describe('POST /api/users/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                });
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('User created successfully');
        });

        it('should not register user with duplicate email', async () => {
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser1',
                    email: 'test@example.com',
                    password: 'password123',
                });

            const response = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser2',
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toContain('User already exists');
        });
    });

    // Login Tests
    describe('POST /api/users/login', () => {
        it('should login an existing user', async () => {
            // Create user first
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                });

            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });
            
            expect(response.statusCode).toBe(200);
            expect(response.body.token).toBeDefined();
            authToken = response.body.token;
            userId = response.body.user.id;
        });

        it('should not login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });
            
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Invalid credentials');
        });
    });

    // Get User Tests
    describe('GET /api/users/:userId', () => {
        it('should get user details', async () => {
            const response = await request(app)
                .get(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data.email).toBe('test@example.com');
            expect(response.body.data.password).toBeUndefined();
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/users/nonexistentid')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(404);
        });
    });

    // Update User Tests
    describe('PUT /api/users/:userId', () => {
        it('should update user details', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    username: 'updateduser'
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.data.username).toBe('updateduser');
        });

        it('should not update user without auth token', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({
                    username: 'updateduser'
                });

            expect(response.statusCode).toBe(401);
        });
    });

    // Delete User Tests
    describe('DELETE /api/users/:userId', () => {
        it('should delete user', async () => {
            const response = await request(app)
                .delete(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            
            // Verify user is deleted
            const getResponse = await request(app)
                .get(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(getResponse.statusCode).toBe(404);
        });
    });
});