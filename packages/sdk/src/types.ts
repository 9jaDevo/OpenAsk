// API Response Types
export interface User {
    _id: string;
    auth0Id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface Question {
    _id: string;
    authorId: string;
    author?: User;
    title: string;
    body: string;
    tags: string[];
    aiDraftAnswer?: string;
    answerCount: number;
    voteCount: number;
    status: 'open' | 'resolved';
    createdAt: string;
    updatedAt: string;
}

export interface Answer {
    _id: string;
    questionId: string;
    authorId: string;
    author?: User;
    body: string;
    isEdited: boolean;
    voteCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Vote {
    _id: string;
    targetType: 'question' | 'answer';
    targetId: string;
    userId: string;
    value: 1 | -1;
}

export interface Tag {
    name: string;
    count: number;
}

// Request/Response types
export interface ListQuestionsParams {
    q?: string;
    tag?: string;
    sort?: 'new' | 'votes' | 'answers';
    page?: number;
    limit?: number;
}

export interface ListQuestionsResponse {
    questions: Question[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateQuestionRequest {
    title: string;
    body: string;
    tags: string[];
}

export interface CreateAnswerRequest {
    body: string;
}

export interface VoteRequest {
    value: 1 | -1;
}

export interface ApiError {
    error: string;
    message: string;
    statusCode: number;
}

export interface HealthResponse {
    ok: boolean;
    uptime: number;
    version: string;
}
