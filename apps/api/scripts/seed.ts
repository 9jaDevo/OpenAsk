#!/usr/bin/env tsx
/**
 * Seed script to populate the database with demo data
 * Run with: pnpm --filter api seed
 */

import { connectDB, disconnectDB } from '../src/db.js';
import { User } from '../src/models/User.js';
import { Question } from '../src/models/Question.js';
import { Answer } from '../src/models/Answer.js';
import { Vote } from '../src/models/Vote.js';
import { generateDraftAnswer } from '../src/services/ai/gemini.js';
import { logger } from '../src/logger.js';

const demoUsers = [
    {
        sub: 'auth0|demo-user-001',
        email: 'alice@example.com',
        name: 'Alice Johnson',
    },
    {
        sub: 'auth0|demo-user-002',
        email: 'bob@example.com',
        name: 'Bob Smith',
    },
    {
        sub: 'auth0|demo-user-003',
        email: 'charlie@example.com',
        name: 'Charlie Davis',
    },
    {
        sub: 'auth0|demo-user-004',
        email: 'diana@example.com',
        name: 'Diana Martinez',
    },
];

const demoQuestions = [
    {
        title: 'How do I implement authentication in React?',
        body: `I'm building a React application and need to add user authentication. What's the best approach?

I've heard about Auth0, Firebase Auth, and building custom auth with JWT. Which one should I choose for a production app?

\`\`\`javascript
// Current setup
function App() {
  return <div>My App</div>;
}
\`\`\`

Any recommendations?`,
        tags: ['react', 'authentication', 'javascript'],
    },
    {
        title: 'Best practices for MongoDB schema design?',
        body: `I'm designing a MongoDB schema for a social media app with users, posts, comments, and likes. Should I embed or reference related documents?

What are the tradeoffs between:
- Embedding comments in posts
- Referencing comments from posts
- Hybrid approach

Looking for production-tested patterns.`,
        tags: ['mongodb', 'database', 'schema-design'],
    },
    {
        title: 'TypeScript generic constraints explained',
        body: `Can someone explain TypeScript generic constraints with a practical example?

I'm trying to create a utility function that works with objects having an 'id' property:

\`\`\`typescript
function findById<T>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id); // Error: Property 'id' does not exist on type 'T'
}
\`\`\`

How do I constrain T to have an 'id' property?`,
        tags: ['typescript', 'generics', 'javascript'],
    },
    {
        title: 'How to optimize React performance with large lists?',
        body: `I have a React component rendering a list of 10,000+ items and it's very slow. What are the best optimization techniques?

I've tried:
- React.memo()
- useMemo() for expensive computations

But it's still sluggish. Should I look into virtualization? What libraries do you recommend?`,
        tags: ['react', 'performance', 'optimization'],
    },
    {
        title: 'Difference between REST and GraphQL?',
        body: `I'm starting a new project and trying to decide between REST and GraphQL for the API.

What are the main differences? When should I use one over the other?

I've heard GraphQL solves over-fetching and under-fetching problems, but is it worth the added complexity?`,
        tags: ['api', 'rest', 'graphql'],
    },
];

const demoAnswers = [
    {
        questionIndex: 0, // React auth question
        body: `For React authentication, I'd recommend **Auth0** for most production apps. Here's why:

### Pros of Auth0:
- Quick setup and integration
- Handles security best practices
- Social login out of the box
- MFA and enterprise features

### Basic implementation:

\`\`\`javascript
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

function App() {
  return (
    <Auth0Provider
      domain="your-domain.auth0.com"
      clientId="your-client-id"
      redirectUri={window.location.origin}
    >
      <MyApp />
    </Auth0Provider>
  );
}

function MyApp() {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  
  if (!isAuthenticated) {
    return <button onClick={loginWithRedirect}>Login</button>;
  }
  
  return (
    <div>
      <p>Welcome {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
\`\`\`

Firebase Auth is also great if you're already using Firebase. Custom JWT auth gives you full control but requires more security expertise.`,
    },
    {
        questionIndex: 0,
        body: `Another approach worth considering is **NextAuth.js** if you're using Next.js:

\`\`\`javascript
import { SessionProvider } from "next-auth/react"

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
\`\`\`

It supports multiple providers (Google, GitHub, Email, etc.) and works great with serverless environments.`,
    },
    {
        questionIndex: 1, // MongoDB schema question
        body: `For MongoDB schema design, the rule of thumb is:

### Embed when:
- Data is accessed together frequently
- One-to-few relationships (e.g., user profile with addresses)
- Data doesn't change often
- Document size stays under 16MB limit

### Reference when:
- One-to-many or many-to-many relationships
- Data is accessed independently
- Frequently updated data
- Large arrays that keep growing

### For your social media app:

\`\`\`javascript
// User document
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com",
  profile: { bio: "...", avatar: "..." } // Embedded
}

// Post document
{
  _id: ObjectId("..."),
  author: ObjectId("user_id"), // Referenced
  content: "...",
  likes: [ObjectId("user1"), ObjectId("user2")], // Embedded array
  commentCount: 42 // Denormalized counter
}

// Comment document (separate collection)
{
  _id: ObjectId("..."),
  post: ObjectId("post_id"), // Referenced
  author: ObjectId("user_id"),
  content: "..."
}
\`\`\`

This hybrid approach gives you flexibility and good performance.`,
    },
    {
        questionIndex: 2, // TypeScript generics question
        body: `You need to use a **generic constraint** to tell TypeScript that T must have an 'id' property:

\`\`\`typescript
// Define a constraint
interface HasId {
  id: string;
}

// Apply the constraint with 'extends'
function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id); // ✅ Works!
}

// Usage
interface User extends HasId {
  name: string;
  email: string;
}

const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

const user = findById(users, '1'); // ✅ Type is User | undefined
\`\`\`

The \`extends\` keyword constrains the generic type T to only accept types that have at least the properties defined in HasId.

You can also use inline constraints:

\`\`\`typescript
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
\`\`\`

This is more concise for simple constraints.`,
    },
    {
        questionIndex: 3, // React performance question
        body: `Yes, **virtualization** is exactly what you need for large lists! The most popular library is **react-window**:

\`\`\`bash
npm install react-window
\`\`\`

\`\`\`javascript
import { FixedSizeList } from 'react-window';

function MyList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
\`\`\`

This renders only the visible items plus a buffer, dramatically improving performance.

For variable-height items, use \`VariableSizeList\`. Also check out **react-virtual** by TanStack for more advanced use cases.`,
    },
    {
        questionIndex: 4, // REST vs GraphQL question
        body: `Great question! Here's a quick comparison:

### REST
**Pros:**
- Simple and well-understood
- Great caching with HTTP
- Easy to debug (just URLs)
- Works with any HTTP client

**Cons:**
- Over-fetching (getting too much data)
- Under-fetching (need multiple requests)
- Versioning can be tricky

### GraphQL
**Pros:**
- Get exactly the data you need
- Single endpoint for everything
- Strong typing with schema
- Great for mobile (reduce bandwidth)

**Cons:**
- More complex setup
- Caching is harder
- Learning curve for team
- Can be overkill for simple APIs

### When to use each:

**Use REST when:**
- Simple CRUD operations
- Public API with many consumers
- Team is familiar with REST
- Caching is critical

**Use GraphQL when:**
- Complex data requirements
- Building for mobile + web
- Frontend needs flexibility
- You have many related resources

For most new projects, I'd start with REST and migrate to GraphQL only if you hit its limitations.`,
    },
];

async function seed() {
    try {
        logger.info('Starting seed script...');

        // Connect to database
        await connectDB();
        logger.info('Connected to database');

        // Clear existing data
        logger.info('Clearing existing data...');
        await Promise.all([User.deleteMany({}), Question.deleteMany({}), Answer.deleteMany({}), Vote.deleteMany({})]);

        // Create users
        logger.info('Creating users...');
        const users = await User.create(demoUsers);
        logger.info(`Created ${users.length} users`);

        // Create questions with AI drafts
        logger.info('Creating questions...');
        const questions = [];
        for (let i = 0; i < demoQuestions.length; i++) {
            const q = demoQuestions[i];
            const author = users[i % users.length]; // Distribute across users

            // Generate AI draft answer
            const aiDraftAnswer = await generateDraftAnswer({ title: q.title, body: q.body });

            const question = await Question.create({
                title: q.title,
                body: q.body,
                tags: q.tags,
                author: author._id,
                authorSub: author.sub,
                authorName: author.name,
                aiDraftAnswer,
            });
            questions.push(question);
            logger.info(`Created question: "${question.title}"`);
        }

        // Create answers
        logger.info('Creating answers...');
        for (const answerData of demoAnswers) {
            const question = questions[answerData.questionIndex];
            const author = users[(answerData.questionIndex + 1) % users.length]; // Different author from question

            const answer = await Answer.create({
                question: question._id,
                body: answerData.body,
                author: author._id,
                authorSub: author.sub,
                authorName: author.name,
            });

            // Update question answer count
            question.answerCount += 1;
            await question.save();

            logger.info(`Created answer for question: "${question.title}"`);
        }

        // Create votes (random distribution)
        logger.info('Creating votes...');
        let voteCount = 0;

        // Vote on questions
        for (const question of questions) {
            const numVoters = Math.floor(Math.random() * users.length);
            for (let i = 0; i < numVoters; i++) {
                const voter = users[i];
                const value = Math.random() > 0.3 ? 1 : -1; // 70% upvote, 30% downvote

                await Vote.create({
                    targetType: 'question',
                    targetId: question._id,
                    userId: voter.sub,
                    value,
                });

                question.voteCount += value;
                voteCount++;
            }
            await question.save();
        }

        // Vote on answers
        const allAnswers = await Answer.find();
        for (const answer of allAnswers) {
            const numVoters = Math.floor(Math.random() * (users.length - 1)) + 1;
            for (let i = 0; i < numVoters; i++) {
                const voter = users[i];
                const value = Math.random() > 0.2 ? 1 : -1; // 80% upvote, 20% downvote

                await Vote.create({
                    targetType: 'answer',
                    targetId: answer._id,
                    userId: voter.sub,
                    value,
                });

                answer.voteCount += value;
                voteCount++;
            }
            await answer.save();
        }

        logger.info(`Created ${voteCount} votes`);

        // Summary
        logger.info('Seed completed successfully!');
        logger.info(`
Summary:
- Users: ${users.length}
- Questions: ${questions.length}
- Answers: ${allAnswers.length}
- Votes: ${voteCount}

Demo users:
${users.map((u) => `  - ${u.name} (${u.email})`).join('\n')}

Questions:
${questions.map((q) => `  - ${q.title} [${q.tags.join(', ')}] - ${q.voteCount} votes, ${q.answerCount} answers`).join('\n')}
    `);
    } catch (error) {
        logger.error('Seed failed:', error);
        process.exit(1);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

// Run seed
seed();
