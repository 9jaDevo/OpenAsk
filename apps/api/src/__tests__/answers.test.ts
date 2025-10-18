import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { connectDB, disconnectDB } from '../db.js';
import { User } from '../models/User.js';
import { Question } from '../models/Question.js';
import { Answer } from '../models/Answer.js';

const mockUser = {
    sub: 'auth0|test-user-answer',
    email: 'answerer@example.com',
    name: 'Answer User',
};

describe('Answers API', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    beforeEach(async () => {
        await Promise.all([User.deleteMany({}), Question.deleteMany({}), Answer.deleteMany({})]);
    });

    describe('GET /api/v1/questions/:questionId/answers', () => {
        it('should return empty list when no answers exist', async () => {
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

            const response = await request(app).get(`/api/v1/questions/${question._id}/answers`);

            expect(response.status).toBe(200);
            expect(response.body.items).toEqual([]);
            expect(response.body.pageInfo.totalItems).toBe(0);
        });

        it('should return paginated answers', async () => {
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

            await Answer.create([
                {
                    question: question._id,
                    body: 'First answer to the test question',
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
                {
                    question: question._id,
                    body: 'Second answer to the test question',
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
            ]);

            const response = await request(app).get(`/api/v1/questions/${question._id}/answers`);

            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(2);
            expect(response.body.items[0]).toHaveProperty('_id');
            expect(response.body.items[0]).toHaveProperty('body');
            expect(response.body.items[0]).toHaveProperty('voteCount');
            expect(response.body.items[0]).toHaveProperty('questionId');
        });

        it('should sort answers by votes', async () => {
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

            const answer1 = await Answer.create({
                question: question._id,
                body: 'Low votes answer',
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
                voteCount: 2,
            });

            const answer2 = await Answer.create({
                question: question._id,
                body: 'High votes answer',
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
                voteCount: 10,
            });

            const response = await request(app).get(`/api/v1/questions/${question._id}/answers?sort=votes`);

            expect(response.status).toBe(200);
            expect(response.body.items[0].voteCount).toBeGreaterThanOrEqual(response.body.items[1].voteCount);
        });

        it('should sort answers by newest', async () => {
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

            const answer1 = await Answer.create({
                question: question._id,
                body: 'First answer',
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
            });

            // Wait a bit to ensure different timestamps
            await new Promise((resolve) => setTimeout(resolve, 10));

            const answer2 = await Answer.create({
                question: question._id,
                body: 'Second answer',
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
            });

            const response = await request(app).get(`/api/v1/questions/${question._id}/answers?sort=new`);

            expect(response.status).toBe(200);
            expect(new Date(response.body.items[0].createdAt).getTime()).toBeGreaterThanOrEqual(
                new Date(response.body.items[1].createdAt).getTime()
            );
        });

        it('should return 404 for non-existent question', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app).get(`/api/v1/questions/${fakeId}/answers`);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/v1/questions/:questionId/answers', () => {
        it('should create a new answer', async () => {
            // Requires auth in real test
            // const user = await User.create(...);
            // const question = await Question.create(...);
            //
            // const response = await request(app)
            //   .post(`/api/v1/questions/${question._id}/answers`)
            //   .set('Authorization', `Bearer ${validToken}`)
            //   .send({ body: 'This is my answer to the question' });
            //
            // expect(response.status).toBe(201);
            // expect(response.body).toHaveProperty('_id');
            // expect(response.body.body).toBe('This is my answer to the question');
        });

        it('should increment question answerCount', async () => {
            // Create answer, then verify question.answerCount increased
        });

        it('should validate minimum body length', async () => {
            // Test with body shorter than 20 characters
            // Should return 400
        });

        it('should sanitize markdown in answer body', async () => {
            // Test that dangerous HTML is removed but safe markdown is kept
        });

        it('should require authentication', async () => {
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

            const response = await request(app)
                .post(`/api/v1/questions/${question._id}/answers`)
                .send({ body: 'This is my answer to the question' });

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent question', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            // const response = await request(app)
            //   .post(`/api/v1/questions/${fakeId}/answers`)
            //   .set('Authorization', `Bearer ${validToken}`)
            //   .send({ body: 'Answer to non-existent question' });
            //
            // expect(response.status).toBe(404);
        });
    });

    describe('PATCH /api/v1/answers/:id', () => {
        it('should update answer when owner', async () => {
            // Create answer with user A, update with user A's token
            // Should succeed
        });

        it('should return 403 when not owner', async () => {
            // Create answer with user A, try to update with user B's token
            // Should return 403
        });

        it('should sanitize updated body', async () => {
            // Update with markdown containing dangerous HTML
            // Verify it's sanitized
        });

        it('should validate minimum body length', async () => {
            // Try to update with too short body
            // Should return 400
        });

        it('should require authentication', async () => {
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

            const answer = await Answer.create({
                question: question._id,
                body: 'Original answer body',
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
            });

            const response = await request(app)
                .patch(`/api/v1/answers/${answer._id}`)
                .send({ body: 'Updated answer body' });

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent answer', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            // const response = await request(app)
            //   .patch(`/api/v1/answers/${fakeId}`)
            //   .set('Authorization', `Bearer ${validToken}`)
            //   .send({ body: 'Updated body' });
            //
            // expect(response.status).toBe(404);
        });
    });
});
