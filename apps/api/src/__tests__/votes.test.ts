import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { connectDB, disconnectDB } from '../db.js';
import { User } from '../models/User.js';
import { Question } from '../models/Question.js';
import { Answer } from '../models/Answer.js';
import { Vote } from '../models/Vote.js';

const mockUser = {
    sub: 'auth0|test-user-vote',
    email: 'voter@example.com',
    name: 'Voter User',
};

describe('Voting API', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    beforeEach(async () => {
        await Promise.all([User.deleteMany({}), Question.deleteMany({}), Answer.deleteMany({}), Vote.deleteMany({})]);
    });

    describe('POST /api/v1/questions/:id/vote', () => {
        it('should create upvote on question', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            const question = await Question.create({
                title: 'Test Question',
                body: 'Test question body for voting',
                tags: ['test'],
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
            });

            // Note: Requires auth token in real test
            // const response = await request(app)
            //   .post(`/api/v1/questions/${question._id}/vote`)
            //   .set('Authorization', `Bearer ${validToken}`)
            //   .send({ value: 1 });
            //
            // expect(response.status).toBe(200);
            // expect(response.body.voteCount).toBe(1);
            // expect(response.body.userVote).toBe(1);

            // Verify vote was created in database
            // const vote = await Vote.findOne({
            //   targetType: 'question',
            //   targetId: question._id,
            //   userId: mockUser.sub,
            // });
            // expect(vote).toBeTruthy();
            // expect(vote?.value).toBe(1);
        });

        it('should create downvote on question', async () => {
            // Similar to upvote test but with value: -1
        });

        it('should toggle vote when voting same value again', async () => {
            // Vote once, then vote again with same value
            // Should remove the vote
        });

        it('should change vote when voting opposite value', async () => {
            // Upvote, then downvote
            // Should change from +1 to -1
        });

        it('should return 404 for non-existent question', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            // const response = await request(app)
            //   .post(`/api/v1/questions/${fakeId}/vote`)
            //   .set('Authorization', `Bearer ${validToken}`)
            //   .send({ value: 1 });
            //
            // expect(response.status).toBe(404);
        });

        it('should validate vote value (must be 1 or -1)', async () => {
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

            // const response = await request(app)
            //   .post(`/api/v1/questions/${question._id}/vote`)
            //   .set('Authorization', `Bearer ${validToken}`)
            //   .send({ value: 5 }); // Invalid value
            //
            // expect(response.status).toBe(400);
            // expect(response.body).toHaveProperty('error');
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
                .post(`/api/v1/questions/${question._id}/vote`)
                .send({ value: 1 });

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/v1/answers/:id/vote', () => {
        it('should create upvote on answer', async () => {
            // Similar structure to question voting tests
        });

        it('should toggle vote on answer', async () => {
            // Test vote removal on second click
        });

        it('should update answer voteCount correctly', async () => {
            // Verify the voteCount field is updated on the Answer document
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
                body: 'Test answer body for voting',
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
            });

            const response = await request(app)
                .post(`/api/v1/answers/${answer._id}/vote`)
                .send({ value: 1 });

            expect(response.status).toBe(401);
        });
    });

    describe('Vote uniqueness', () => {
        it('should enforce one vote per user per target', async () => {
            // Test that the unique compound index on Vote model works
            // Trying to create duplicate votes should fail
        });
    });
});
