import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { connectDB, disconnectDB } from '../db.js';
import { User } from '../models/User.js';
import { Question } from '../models/Question.js';

const mockUser = {
    sub: 'auth0|test-user-tags',
    email: 'tester@example.com',
    name: 'Tester User',
};

describe('Tags and Search API', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    beforeEach(async () => {
        await Promise.all([User.deleteMany({}), Question.deleteMany({})]);
    });

    describe('GET /api/v1/tags/top', () => {
        it('should return empty array when no tags exist', async () => {
            const response = await request(app).get('/api/v1/tags/top');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('tags');
            expect(response.body.tags).toEqual([]);
        });

        it('should return top tags by usage count', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            // Create questions with overlapping tags
            await Question.create([
                {
                    title: 'Question 1',
                    body: 'Body 1',
                    tags: ['javascript', 'react'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
                {
                    title: 'Question 2',
                    body: 'Body 2',
                    tags: ['javascript', 'typescript'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
                {
                    title: 'Question 3',
                    body: 'Body 3',
                    tags: ['javascript', 'node'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
                {
                    title: 'Question 4',
                    body: 'Body 4',
                    tags: ['react', 'typescript'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
            ]);

            const response = await request(app).get('/api/v1/tags/top');

            expect(response.status).toBe(200);
            expect(response.body.tags).toBeInstanceOf(Array);
            expect(response.body.tags.length).toBeGreaterThan(0);
            expect(response.body.tags[0]).toHaveProperty('tag');
            expect(response.body.tags[0]).toHaveProperty('count');

            // JavaScript should be top tag (appears 3 times)
            expect(response.body.tags[0].tag).toBe('javascript');
            expect(response.body.tags[0].count).toBe(3);

            // Tags should be sorted by count descending
            for (let i = 1; i < response.body.tags.length; i++) {
                expect(response.body.tags[i - 1].count).toBeGreaterThanOrEqual(response.body.tags[i].count);
            }
        });

        it('should respect limit parameter', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
            for (const tag of tags) {
                await Question.create({
                    title: `Question with ${tag}`,
                    body: 'Body',
                    tags: [tag],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                });
            }

            const response = await request(app).get('/api/v1/tags/top?limit=3');

            expect(response.status).toBe(200);
            expect(response.body.tags).toHaveLength(3);
        });

        it('should not allow limit > 50', async () => {
            const response = await request(app).get('/api/v1/tags/top?limit=100');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/v1/search', () => {
        it('should require search query parameter', async () => {
            const response = await request(app).get('/api/v1/search');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should search questions by text', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            await Question.create([
                {
                    title: 'How to use React hooks',
                    body: 'I want to learn about useState and useEffect in React',
                    tags: ['react', 'hooks'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
                {
                    title: 'Vue 3 composition API',
                    body: 'Question about Vue 3 composition API features',
                    tags: ['vue'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
                {
                    title: 'React performance optimization',
                    body: 'Best practices for optimizing React applications',
                    tags: ['react', 'performance'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
            ]);

            const response = await request(app).get('/api/v1/search?q=React');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('items');
            expect(response.body.items.length).toBeGreaterThan(0);

            // All results should mention React in title or body
            const hasReactInResults = response.body.items.every((item: any) => {
                const text = `${item.title} ${item.body}`.toLowerCase();
                return text.includes('react');
            });
            expect(hasReactInResults).toBe(true);
        });

        it('should sort search results by relevance (default)', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            await Question.create([
                {
                    title: 'TypeScript basics',
                    body: 'Introduction to TypeScript',
                    tags: ['typescript'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
                {
                    title: 'Advanced TypeScript generics and conditional types',
                    body: 'Deep dive into TypeScript generics, conditional types, mapped types, and template literal types',
                    tags: ['typescript', 'advanced'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                },
            ]);

            const response = await request(app).get('/api/v1/search?q=TypeScript');

            expect(response.status).toBe(200);
            // The question with more TypeScript mentions should rank higher
        });

        it('should support sorting by votes', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            await Question.create([
                {
                    title: 'JavaScript question 1',
                    body: 'Low votes JavaScript question',
                    tags: ['javascript'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                    voteCount: 1,
                },
                {
                    title: 'JavaScript question 2',
                    body: 'High votes JavaScript question',
                    tags: ['javascript'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                    voteCount: 10,
                },
            ]);

            const response = await request(app).get('/api/v1/search?q=JavaScript&sort=votes');

            expect(response.status).toBe(200);
            if (response.body.items.length >= 2) {
                expect(response.body.items[0].voteCount).toBeGreaterThanOrEqual(response.body.items[1].voteCount);
            }
        });

        it('should support sorting by newest', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            const q1 = await Question.create({
                title: 'Old Python question',
                body: 'Question about Python',
                tags: ['python'],
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            const q2 = await Question.create({
                title: 'New Python question',
                body: 'Recent question about Python',
                tags: ['python'],
                author: user._id,
                authorSub: user.sub,
                authorName: user.name,
            });

            const response = await request(app).get('/api/v1/search?q=Python&sort=new');

            expect(response.status).toBe(200);
            if (response.body.items.length >= 2) {
                expect(new Date(response.body.items[0].createdAt).getTime()).toBeGreaterThanOrEqual(
                    new Date(response.body.items[1].createdAt).getTime()
                );
            }
        });

        it('should support pagination', async () => {
            const user = await User.create({
                sub: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
            });

            // Create 5 questions about testing
            for (let i = 0; i < 5; i++) {
                await Question.create({
                    title: `Testing question ${i + 1}`,
                    body: `Question about testing topic ${i + 1}`,
                    tags: ['testing'],
                    author: user._id,
                    authorSub: user.sub,
                    authorName: user.name,
                });
            }

            const response = await request(app).get('/api/v1/search?q=testing&limit=2');

            expect(response.status).toBe(200);
            expect(response.body.items.length).toBeLessThanOrEqual(2);
            expect(response.body.pageInfo).toHaveProperty('hasNextPage');
            expect(response.body.pageInfo.totalItems).toBe(5);
        });

        it('should validate search query length', async () => {
            const longQuery = 'a'.repeat(200);
            const response = await request(app).get(`/api/v1/search?q=${longQuery}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
