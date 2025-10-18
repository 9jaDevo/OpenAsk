import { ApiClient } from './client';
import type {
    HealthResponse,
    User,
    ListQuestionsParams,
    ListQuestionsResponse,
    Question,
    CreateQuestionRequest,
    Answer,
    CreateAnswerRequest,
    VoteRequest,
    Tag,
} from './types';

export class OpenAskSDK {
    private client: ApiClient;

    constructor(config: {
        baseUrl: string;
        getToken?: () => Promise<string | null>;
        onUnauthorized?: () => void;
    }) {
        this.client = new ApiClient(config);
    }

    // Health
    async health(): Promise<HealthResponse> {
        return this.client.get<HealthResponse>('/api/v1/health');
    }

    // Profile
    async getProfile(): Promise<User> {
        return this.client.get<User>('/api/v1/profile');
    }

    // Questions
    async listQuestions(params?: ListQuestionsParams): Promise<ListQuestionsResponse> {
        return this.client.get<ListQuestionsResponse>('/api/v1/questions', params as any);
    }

    async getQuestion(id: string): Promise<Question> {
        return this.client.get<Question>(`/api/v1/questions/${id}`);
    }

    async createQuestion(data: CreateQuestionRequest): Promise<Question> {
        return this.client.post<Question>('/api/v1/questions', data);
    }

    async updateQuestion(
        id: string,
        data: Partial<Pick<Question, 'title' | 'body' | 'tags' | 'status'>>
    ): Promise<Question> {
        return this.client.patch<Question>(`/api/v1/questions/${id}`, data);
    }

    async voteQuestion(id: string, value: 1 | -1): Promise<{ voteCount: number }> {
        return this.client.post<{ voteCount: number }>(`/api/v1/questions/${id}/vote`, {
            value,
        } as VoteRequest);
    }

    // Answers
    async createAnswer(questionId: string, data: CreateAnswerRequest): Promise<Answer> {
        return this.client.post<Answer>(`/api/v1/questions/${questionId}/answers`, data);
    }

    async updateAnswer(id: string, data: CreateAnswerRequest): Promise<Answer> {
        return this.client.patch<Answer>(`/api/v1/answers/${id}`, data);
    }

    async voteAnswer(id: string, value: 1 | -1): Promise<{ voteCount: number }> {
        return this.client.post<{ voteCount: number }>(`/api/v1/answers/${id}/vote`, {
            value,
        } as VoteRequest);
    }

    // Tags
    async getTopTags(): Promise<Tag[]> {
        return this.client.get<Tag[]>('/api/v1/tags/top');
    }

    // Search
    async search(query: string, params?: Omit<ListQuestionsParams, 'q'>): Promise<ListQuestionsResponse> {
        return this.client.get<ListQuestionsResponse>('/api/v1/search', {
            q: query,
            ...params,
        } as any);
    }
}

// Export convenience function
export function createSDK(config: {
    baseUrl: string;
    getToken?: () => Promise<string | null>;
    onUnauthorized?: () => void;
}): OpenAskSDK {
    return new OpenAskSDK(config);
}
