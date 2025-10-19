import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useSDK } from '../providers/SDKProvider';
import type { User, Question } from '@openask/sdk';
import { Card, Skeleton, ErrorState, EmptyState, Tag } from '@openask/ui';

export const Profile: React.FC = () => {
  const sdk = useSDK();
  const { user: auth0User } = useAuth0();
  const [user, setUser] = useState<User | null>(null);
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const profileData = await sdk.getProfile();
      setUser(profileData);
      // In a real implementation, we'd fetch user's questions
      setMyQuestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Card padding="lg">
            <Skeleton height="4rem" className="mb-4" />
            <Skeleton height="2rem" />
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <ErrorState message={error} onRetry={loadProfile} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card padding="lg">
          <div className="flex items-center gap-6">
            {auth0User?.picture ? (
              <img
                src={auth0User.picture}
                alt={auth0User.name}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-4xl text-gray-600 font-bold">
                  {auth0User?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.name || auth0User?.name || 'User'}
              </h1>
              <p className="text-gray-600">{user?.email || auth0User?.email}</p>
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                <span>
                  <strong className="text-gray-900">0</strong> questions
                </span>
                <span>
                  <strong className="text-gray-900">0</strong> answers
                </span>
                <span>
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'questions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Questions
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'answers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Answers
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'questions' ? (
          (myQuestions?.length ?? 0) === 0 ? (
            <EmptyState
              title="No questions yet"
              message="You haven't asked any questions. Start by asking your first question!"
              action={
                <Link
                  to="/ask"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ask Your First Question
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {myQuestions.map((question) => (
                <Card key={question._id} hover padding="lg">
                  <Link to={`/q/${question._id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
                      {question.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{question.body.substring(0, 200)}...</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {question.tags.map((tag: string) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{question.voteCount} votes</span>
                      <span>{question.answerCount} answers</span>
                      <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )
        ) : (
          <EmptyState
            title="No answers yet"
            message="You haven't answered any questions. Browse questions and share your knowledge!"
            action={
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse Questions
              </Link>
            }
          />
        )}
      </div>
    </Layout>
  );
};
