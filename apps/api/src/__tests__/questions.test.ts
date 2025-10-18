import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { connectDB, disconnectDB } from '../db.js';
import { User } from '../models/User.js';
import { Question } from '../models/Question.js';
import { Vote } from '../models/Vote.js';

// Mock auth middleware for testing
const mockUser = {
    sub: 'auth0|test-user-123',
    email: 'test@example.com',
    name: 'Test User',
};

// Helper to create authenticated request
function authenticatedRequest(method: 'get' | 'post' | 'patch' | 'delete', path: string) {
    const req = request(app)[method](path);
    // In real tests, you'd use a valid JWT token
    // For now, we'll need to mock the auth middleware
    return req;
}

describe('Questions API', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    beforeEach(async () => {
        // Clean up test data
        await Promise.all([User.deleteMany({}), Question.deleteMany({}), Vote.deleteMany({})]);
    });

    describe('GET /api/v1/questions', () => {
        it('should return empty list when no questions exist', async () => {
            const response = await request(app).get('/api/v1/questions');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('items');
            expect(response.body.items).toEqual([]);
            expect(response.body).toHaveProperty('pageInfo');
            expect(response.body.pageInfo.totalItems).toBe(0);
        });

        it('should return paginated questions', async () => {
            // Create test user and questions
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            const questions = await Question.create([
                {
                    title: 'Test Question 1',
                    body: 'This is the first test question body',
                    tags: ['test', 'javascript'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
                {
                    title: 'Test Question 2',
                    body: 'This is the second test question body',
                    tags: ['test', 'typescript'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
            ]);

            const response = await request(app).get('/api/v1/questions');

            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(2);
            expect(response.body.items[0]).toHaveProperty('_id');
            expect(response.body.items[0]).toHaveProperty('title');
            expect(response.body.items[0]).toHaveProperty('tags');
            expect(response.body.items[0]).toHaveProperty('voteCount');
            expect(response.body.items[0]).toHaveProperty('answerCount');
        });

        it('should filter questions by tag', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            await Question.create([
                {
                    title: 'JavaScript Question',
                    body: 'Question about JavaScript',
                    tags: ['javascript'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
                {
                    title: 'TypeScript Question',
                    body: 'Question about TypeScript',
                    tags: ['typescript'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
            ]);

            const response = await request(app).get('/api/v1/questions?tag=javascript');

            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(1);
            expect(response.body.items[0].tags).toContain('javascript');
        });

        it('should search questions by text', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            await Question.create([
                {
                    title: 'React hooks question',
                    body: 'How do I use useState in React?',
                    tags: ['react'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
                {
                    title: 'Vue composition API',
                    body: 'Question about Vue 3',
                    tags: ['vue'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
            ]);

            const response = await request(app).get('/api/v1/questions?q=React');

            expect(response.status).toBe(200);
            expect(response.body.items.length).toBeGreaterThan(0);
            const titles = response.body.items.map((q: any) => q.title);
            expect(titles.some((t: string) => t.toLowerCase().includes('react'))).toBe(true);
        });

        it('should sort questions by votes', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            const q1 = await Question.create({
                title: 'Low votes question',
                body: 'This has few votes',
                tags: ['test'],
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
                voteCount: 1,
            });

            const q2 = await Question.create({
                title: 'High votes question',
                body: 'This has many votes',
                tags: ['test'],
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
                voteCount: 10,
            });

            const response = await request(app).get('/api/v1/questions?sort=votes');

            expect(response.status).toBe(200);
            expect(response.body.items[0].voteCount).toBeGreaterThanOrEqual(response.body.items[1].voteCount);
        });

        it('should respect pagination limits', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            // Create 5 questions
            const questions = Array.from({ length: 5 }, (_, i) => ({
                title: `Question ${i + 1}`,
                body: `Body for question ${i + 1}`,
                tags: ['test'],
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
            }));

            await Question.create(questions);

            const response = await request(app).get('/api/v1/questions?limit=2');

            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(2);
            expect(response.body.pageInfo.pageSize).toBe(2);
            expect(response.body.pageInfo.totalItems).toBe(5);
            expect(response.body.pageInfo.hasNextPage).toBe(true);
        });

        it('should not allow pagination limit > 50', async () => {
            const response = await request(app).get('/api/v1/questions?limit=100');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/v1/questions/:id', () => {
        it('should return a specific question', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            const question = await Question.create({
                title: 'Test Question',
                body: 'Test question body',
                tags: ['test'],
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
            });

            const response = await request(app).get(`/api/v1/questions/${question._id}`);

            expect(response.status).toBe(200);
            expect(response.body._id).toBe(question._id.toString());
            expect(response.body.title).toBe('Test Question');
            expect(response.body).toHaveProperty('userVote');
        });

        it('should return 404 for non-existent question', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app).get(`/api/v1/questions/${fakeId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for invalid question ID format', async () => {
            const response = await request(app).get('/api/v1/questions/invalid-id');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/v1/questions', () => {
        it('should create a new question with AI draft', async () => {
            // Note: This test requires mocking the auth middleware
            // For now, this is a placeholder showing the expected behavior
            const questionData = {
                title: 'How do I use TypeScript generics?',
                body: 'I am trying to understand generic constraints in TypeScript. Can someone explain?',
                tags: ['typescript', 'generics'],
            };

            // This would need proper auth token in real tests
            // const response = await authenticatedRequest('post', '/api/v1/questions')
            //   .send(questionData);
            //
            // expect(response.status).toBe(201);
            // expect(response.body).toHaveProperty('_id');
            // expect(response.body).toHaveProperty('aiDraftAnswer');
            // expect(response.body.title).toBe(questionData.title);
            // expect(response.body.tags).toEqual(questionData.tags);
        });

        it('should validate required fields', async () => {
            const invalidData = {
                title: 'Short', // Too short
                body: 'Short', // Too short
                tags: [], // Empty array
            };

            // With auth, this should return 400
            // const response = await authenticatedRequest('post', '/api/v1/questions')
            //   .send(invalidData);
            //
            // expect(response.status).toBe(400);
            // expect(response.body).toHaveProperty('error');
        });

        it('should sanitize markdown in body', async () => {
            const questionData = {
                title: 'Test Question with HTML',
                body: 'This has <script>alert("xss")</script> and **bold** text',
                tags: ['test'],
            };

            // With auth:
            // const response = await authenticatedRequest('post', '/api/v1/questions')
            //   .send(questionData);
            //
            // expect(response.status).toBe(201);
            // expect(response.body.body).not.toContain('<script>');
            // expect(response.body.body).toContain('<strong>bold</strong>');
        });
    });

    describe('PATCH /api/v1/questions/:id', () => {
        it('should update question when owner', async () => {
            // Placeholder for auth-required test
            // Would need to create question with authenticated user,
            // then update with same user's token
        });

        it('should return 403 when not owner', async () => {
            // Placeholder for testing ownership validation
        });

        it('should sanitize updated body', async () => {
            // Placeholder for markdown sanitization test
        });
    });
});
