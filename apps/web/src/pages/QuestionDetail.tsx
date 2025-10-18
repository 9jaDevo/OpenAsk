import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Layout } from '../components/Layout';
import { useSDK } from '../providers/SDKProvider';
import type { Question, Answer } from '@openask/sdk';
import {
  Card,
  Button,
  Textarea,
  Tag,
  Skeleton,
  SkeletonText,
  ErrorState,
  MarkdownView,
  VoteWidget,
} from '@openask/ui';
import { answerSchema, type AnswerFormData } from '../schemas/validation';

export const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const sdk = useSDK();
  const { isAuthenticated } = useAuth0();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema),
  });

  useEffect(() => {
    loadQuestion();
  }, [id]);

  const loadQuestion = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await sdk.getQuestion(id);
      setQuestion(data);
      // In a real implementation, answers would be part of the question response
      // or fetched separately
      setAnswers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteQuestion = async (value: 1 | -1) => {
    if (!id) throw new Error('No question ID');
    const result = await sdk.voteQuestion(id, value);
  setQuestion((prev: Question | null) => (prev ? { ...prev, voteCount: result.voteCount } : null));
    return result;
  };

  const handleVoteAnswer = async (answerId: string, value: 1 | -1) => {
    const result = await sdk.voteAnswer(answerId, value);
    setAnswers((prev) =>
      prev.map((a) => (a._id === answerId ? { ...a, voteCount: result.voteCount } : a))
    );
    return result;
  };

  const onSubmitAnswer = async (data: AnswerFormData) => {
    if (!id) return;

    setSubmittingAnswer(true);

    try {
      const answer = await sdk.createAnswer(id, data);
      setAnswers((prev) => [...prev, answer]);
      toast.success('Answer posted successfully!');
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Card padding="lg" className="mb-6">
            <Skeleton height="2rem" className="mb-4" />
            <SkeletonText lines={5} />
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !question) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <ErrorState message={error || 'Question not found'} onRetry={loadQuestion} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Question */}
        <Card padding="lg">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <VoteWidget
                voteCount={question.voteCount}
                onVote={handleVoteQuestion}
                disabled={!isAuthenticated}
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>

              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                <span>
                  Asked by {question.author?.name || 'Unknown'}
                </span>
                <span>•</span>
                <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{question.answerCount} answers</span>
              </div>

              <div className="prose max-w-none mb-6">
                <MarkdownView content={question.body} />
              </div>

              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag: string) => (
                  <Link key={tag} to={`/?tag=${tag}`}>
                    <Tag>{tag}</Tag>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* AI Draft Answer */}
        {question.aiDraftAnswer && (
          <Card padding="lg" className="border-2 border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3 mb-4">
              <svg
                className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-blue-900 mb-2">
                  AI-Generated Draft Answer
                </h2>
                <p className="text-sm text-blue-700 mb-4">
                  This is an AI-generated starting point. Community members can improve it below.
                </p>
                <div className="prose max-w-none">
                  <MarkdownView content={question.aiDraftAnswer} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Community Answers */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {answers.length} Community {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          <div className="space-y-4">
            {answers.map((answer) => (
              <Card key={answer._id} padding="lg">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <VoteWidget
                      voteCount={answer.voteCount}
                      onVote={(value: 1 | -1) => handleVoteAnswer(answer._id, value)}
                      disabled={!isAuthenticated}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="prose max-w-none mb-4">
                      <MarkdownView content={answer.body} />
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        {answer.isEdited && <span className="text-gray-400 mr-2">(edited)</span>}
                        Answered by {answer.author?.name || 'Unknown'}
                      </div>
                      <div>{new Date(answer.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Answer Form */}
        {isAuthenticated ? (
          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Answer</h2>
            <form onSubmit={handleSubmit(onSubmitAnswer)} className="space-y-4">
              <Textarea
                {...register('body')}
                error={errors.body?.message}
                rows={8}
                placeholder="Write your answer here. Markdown supported."
              />
              <Button type="submit" variant="primary" loading={submittingAnswer}>
                Post Answer
              </Button>
            </form>
          </Card>
        ) : (
          <Card padding="lg" className="text-center">
            <p className="text-gray-600 mb-4">You must be logged in to post an answer</p>
            <Button variant="primary" onClick={() => {}}>
              Login to Answer
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
};
