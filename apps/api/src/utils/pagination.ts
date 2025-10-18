import { z } from 'zod';

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

export const paginationSchema = z.object({
    page: z.string().optional().default('1').transform(Number).pipe(z.number().min(1)),
    limit: z.string().optional().default(String(DEFAULT_PAGE_SIZE)).transform(Number).pipe(z.number().min(1).max(MAX_PAGE_SIZE)),
});

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginationResult<T> {
    items: T[];
    pageInfo: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export const createPaginationResult = <T>(
    items: T[],
    totalItems: number,
    params: PaginationParams
): PaginationResult<T> => {
    const totalPages = Math.ceil(totalItems / params.limit);

    return {
        items,
        pageInfo: {
            currentPage: params.page,
            pageSize: params.limit,
            totalItems,
            totalPages,
            hasNextPage: params.page < totalPages,
            hasPreviousPage: params.page > 1,
        },
    };
};

export const calculateSkip = (params: PaginationParams): number => {
    return (params.page - 1) * params.limit;
};
