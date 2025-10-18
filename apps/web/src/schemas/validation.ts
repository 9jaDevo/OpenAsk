import { z } from 'zod';

export const questionSchema = z.object({
    title: z
        .string()
        .min(10, 'Title must be at least 10 characters')
        .max(160, 'Title must not exceed 160 characters'),
    body: z.string().min(20, 'Question body must be at least 20 characters'),
    tags: z
        .array(z.string())
        .min(1, 'At least one tag is required')
        .max(5, 'Maximum 5 tags allowed'),
});

export type QuestionFormData = z.infer<typeof questionSchema>;

export const answerSchema = z.object({
    body: z.string().min(20, 'Answer must be at least 20 characters'),
});

export type AnswerFormData = z.infer<typeof answerSchema>;
