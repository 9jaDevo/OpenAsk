import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '@openask/ui';

export const About: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card padding="lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About OpenAsk</h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              OpenAsk is an open-source, community-driven Q&A platform that combines the power of
              AI with community knowledge to provide fast, accurate answers to your questions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <ol className="space-y-3 mb-6">
              <li>
                <strong>Ask Your Question</strong> - Post your question with relevant details and tags
              </li>
              <li>
                <strong>Get an AI Draft</strong> - Google Gemini instantly generates a helpful starting answer
              </li>
              <li>
                <strong>Community Refinement</strong> - Members can improve, vote, and provide better answers
              </li>
              <li>
                <strong>Best Answer Rises</strong> - Voting ensures the most helpful answers are visible
              </li>
            </ol>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-2 mb-6">
              <li>✨ AI-powered draft answers using Google Gemini</li>
              <li>🤝 Community-driven knowledge sharing</li>
              <li>⬆️ Vote system to highlight quality answers</li>
              <li>🏷️ Tag-based organization</li>
              <li>📝 Markdown support for rich formatting</li>
              <li>🔒 Secure authentication with Auth0</li>
              <li>🌐 100% open source</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Built With</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>React + TypeScript</li>
                  <li>Vite</li>
                  <li>Tailwind CSS</li>
                  <li>Auth0 React SDK</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>Node.js + Express</li>
                  <li>MongoDB + Mongoose</li>
                  <li>Google Gemini AI</li>
                  <li>TypeScript</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Open Source</h2>
            <p className="text-gray-700 mb-4">
              OpenAsk is released under the MIT License. We welcome contributions from the community!
              Check out our GitHub repository to get involved.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Get Involved</h3>
              <p className="text-blue-800 mb-4">
                Join our community and help make OpenAsk better for everyone.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View on GitHub
                </a>
                <a
                  href="/docs"
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Read the Docs
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
