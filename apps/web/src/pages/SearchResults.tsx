import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useSDK } from '../providers/SDKProvider';
import type { Question } from '@openask/sdk';
import { Card, Tag, Skeleton, EmptyState, ErrorState } from '@openask/ui';

const PAGE_SIZE = 20;

export const SearchResults: React.FC = () => {
  const sdk = useSDK();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q')?.trim() || '';
  const sort = (searchParams.get('sort') as 'relevance' | 'new' | 'votes' | 'answers') || 'relevance';
  const page = Number(searchParams.get('page') || '1');

  const [results, setResults] = useState<Question[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (!q) return 'Search';
    return `Results for "${q}"`;
  }, [q]);

  useEffect(() => {
    if (!q) return;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await sdk.search(q, { sort: sort === 'relevance' ? 'new' : (sort as any), page, limit: PAGE_SIZE });
        setResults(data.questions);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load search results');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [q, sort, page, sdk]);

  const setParam = (key: string, value: string | number | null) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') newParams.delete(key);
    else newParams.set(key, String(value));
    setSearchParams(newParams);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">{loading ? 'Searching…' : `${(results?.length ?? 0)} results on this page`}</p>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              {(['relevance', 'new', 'votes', 'answers'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setParam('sort', opt)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sort === opt ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt === 'relevance' ? 'Relevance' : opt === 'new' ? 'Newest' : opt === 'votes' ? 'Most Votes' : 'Most Answers'}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {(!q || q.length < 2) && !loading ? (
            <EmptyState title="Try a more specific search" message="Enter 2 or more characters to search questions." />
          ) : loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
            <ErrorState message={error} onRetry={() => setParam('page', 1)} />
          ) : results.length === 0 ? (
            <EmptyState
              title="No results"
              message="Try different keywords or filter options."
              action={
                <Link to="/ask" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Ask a Question
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {results.map((qst) => (
                <Card key={qst._id} hover padding="lg">
                  <Link to={`/q/${qst._id}`}>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center text-gray-500 text-sm space-y-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span className="font-semibold">{qst.voteCount}</span>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{qst.answerCount}</div>
                          <div className="text-xs">answers</div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">{qst.title}</h2>
                        <p className="text-gray-600 mb-3 line-clamp-2">{qst.body.substring(0, 200)}...</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {qst.tags.map((t: string) => (
                            <Tag key={t}>{t}</Tag>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          Asked by {qst.author?.name || 'Unknown'} • {new Date(qst.createdAt).toLocaleDateString()}
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
                onClick={() => setParam('page', Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">Page {page} of {totalPages}</span>
              <button
                onClick={() => setParam('page', Math.min(totalPages, page + 1))}
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
          <Card className="sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tips for better search</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Use specific keywords</li>
              <li>Try filtering by newest or most votes</li>
              <li>Open a question to see full context and answers</li>
            </ul>
            <div className="mt-4 text-sm text-gray-500">
              Can’t find it?
              <Link to="/ask" className="ml-2 text-blue-600 hover:underline">Ask a question →</Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
