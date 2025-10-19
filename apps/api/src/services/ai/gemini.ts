import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config.js';
import { logger } from '../../logger.js';

interface DraftAnswerInput {
    title: string;
    body: string;
}

let genAI: GoogleGenerativeAI | null = null;

if (config.geminiApiKey) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    logger.info('✨ Gemini AI service initialized');
} else {
    logger.info('⚠️  Gemini API key not provided, using deterministic mock');
}

export const generateDraftAnswer = async ({ title, body }: DraftAnswerInput): Promise<string> => {
    // If no API key, return deterministic mock
    if (!genAI) {
        return generateMockDraftAnswer({ title, body });
    }

    try {
        // Use gemini-2.0-flash-exp instead of gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `You are a helpful assistant answering questions on a Q&A platform similar to Stack Overflow.

Question Title: ${title}

Question Body:
${body}

Please provide a clear, concise, and helpful answer to this question. Focus on:
1. Directly addressing the question
2. Providing practical solutions or explanations
3. Using code examples when relevant
4. Being technically accurate

Keep the answer between 100-300 words.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        logger.info('Generated AI draft answer');
        return text;
    } catch (error) {
        logger.error(error, 'Failed to generate AI draft answer, falling back to mock');
        return generateMockDraftAnswer({ title, body });
    }
};

// Deterministic mock for development and when API key is absent
const generateMockDraftAnswer = ({ title, body }: DraftAnswerInput): string => {
    const hasCodeBlock = body.includes('```') || body.includes('`');
    const questionType = title.toLowerCase().includes('how') ? 'how-to' : 'conceptual';

    let mockAnswer = `Based on your question "${title}", here's a helpful approach:\n\n`;

    if (questionType === 'how-to') {
        mockAnswer += `To solve this, you can follow these steps:\n\n`;
        mockAnswer += `1. First, understand the core requirement\n`;
        mockAnswer += `2. Break down the problem into smaller parts\n`;
        mockAnswer += `3. Implement each part systematically\n\n`;
    } else {
        mockAnswer += `This is an interesting question. The key concept to understand is:\n\n`;
        mockAnswer += `The topic you're asking about involves several important aspects that work together.\n\n`;
    }

    if (hasCodeBlock) {
        mockAnswer += `Here's a simple example:\n\n`;
        mockAnswer += '```javascript\n';
        mockAnswer += `// Example solution\n`;
        mockAnswer += `function example() {\n`;
        mockAnswer += `  return "This is a mock AI-generated answer";\n`;
        mockAnswer += `}\n`;
        mockAnswer += '```\n\n';
    }

    mockAnswer += `Make sure to test your solution thoroughly and adjust based on your specific requirements.\n\n`;
    mockAnswer += `*Note: This is an AI-generated draft answer. Please verify and adjust as needed.*`;

    return mockAnswer;
};
