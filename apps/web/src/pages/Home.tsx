import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSDK } from '../providers/SDKProvider';
import { Layout } from '../components/Layout';
import type { Question, Tag as TagType } from '@openask/sdk';
import { Card, Tag, Skeleton, EmptyState, ErrorState } from '@openask/ui';

export const Home: React.FC = () => {
  const sdk = useSDK();
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const sort = (searchParams.get('sort') as 'new' | 'votes' | 'answers') || 'new';
  const tag = searchParams.get('tag') || undefined;
  const searchQuery = searchParams.get('q') || undefined;

  useEffect(() => {
    loadData();
  }, [sort, tag, searchQuery, page]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [questionsData, tagsData] = await Promise.all([
        sdk.listQuestions({ q: searchQuery, tag, sort, page, limit: 20 }),
        sdk.getTopTags(),
      ]);

      console.log('🔍 Questions API Response:', questionsData);
      console.log('🔍 Questions array:', questionsData.questions);
      console.log('🔍 Questions length:', questionsData.questions?.length);

      setQuestions(questionsData.questions);
      setTotalPages(questionsData.totalPages);
      setTags(tagsData);
    } catch (err) {
      console.error('❌ Error loading questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort: 'new' | 'votes' | 'answers') => {
    setSearchParams({ ...Object.fromEntries(searchParams), sort: newSort });
    setPage(1);
  };

  const handleTagClick = (tagName: string) => {
    if (tag === tagName) {
      searchParams.delete('tag');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams), tag: tagName });
    }
    setPage(1);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {searchQuery ? `Search: "${searchQuery}"` : tag ? `Tag: ${tag}` : 'All Questions'}
            </h1>
            <Link
              to="/ask"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ask Question
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {(['new', 'votes', 'answers'] as const).map((sortOption) => (
              <button
                key={sortOption}
                onClick={() => handleSortChange(sortOption)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === sortOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {sortOption === 'new' ? 'Newest' : sortOption === 'votes' ? 'Most Votes' : 'Most Answers'}
              </button>
            ))}
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <Skeleton height="1.5rem" className="mb-4" />
                  <Skeleton height="4rem" className="mb-4" />
                  <div className="flex gap-2">
                    <Skeleton width="60px" height="1.5rem" />
                    <Skeleton width="60px" height="1.5rem" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : (questions?.length ?? 0) === 0 ? (
            <EmptyState
              title="No questions found"
              message={searchQuery || tag ? 'Try adjusting your search or filters' : 'Be the first to ask a question!'}
              action={
                <Link
                  to="/ask"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ask Question
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question._id} hover padding="lg">
                  <Link to={`/q/${question._id}`}>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center text-gray-500 text-sm space-y-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          <span className="font-semibold">{question.voteCount}</span>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{question.answerCount}</div>
                          <div className="text-xs">answers</div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
                          {question.title}
                        </h2>
                        <p className="text-gray-600 mb-3 line-clamp-2">{question.body.substring(0, 200)}...</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {question.tags.map((tagName: string) => (
                            <Tag key={tagName} active={tag === tagName}>
                              {tagName}
                            </Tag>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          Asked by {question.author?.name || 'Unknown'} •{' '}
                          {new Date(question.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Tags</h3>
            {(tags?.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-sm">No tags yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tagItem) => (
                  <Tag
                    key={tagItem.name}
                    onClick={() => handleTagClick(tagItem.name)}
                    active={tag === tagItem.name}
                  >
                    {tagItem.name} ({tagItem.count})
                  </Tag>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};
