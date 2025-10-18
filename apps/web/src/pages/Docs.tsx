import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '@openask/ui';

export const Docs: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card padding="lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Documentation</h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Welcome to the OpenAsk documentation. Find guides, API references, and contribution
              guidelines below.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-4 mb-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">📖 README</h3>
                <p className="text-gray-600 text-sm">Quick start guide and project overview</p>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">🤝 CONTRIBUTING</h3>
                <p className="text-gray-600 text-sm">How to contribute to OpenAsk</p>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">📜 CODE_OF_CONDUCT</h3>
                <p className="text-gray-600 text-sm">Community guidelines and standards</p>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">🔒 SECURITY</h3>
                <p className="text-gray-600 text-sm">Security policy and vulnerability reporting</p>
              </a>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture</h2>
            <p className="text-gray-700 mb-4">
              OpenAsk is built as a monorepo with separate workspaces for the web frontend, API backend,
              shared UI components, SDK client, and configuration.
            </p>

            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`openask/
├── apps/
│   ├── web/     # React frontend
│   └── api/     # Express backend
└── packages/
    ├── ui/      # Reusable components
    ├── sdk/     # API client
    └── config/  # Shared configuration`}
              </pre>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">API Reference</h2>
            <p className="text-gray-700 mb-4">
              The OpenAsk API is RESTful and returns JSON responses. All endpoints are prefixed with
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">/api/v1</code>.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Endpoints</h3>
            <ul className="space-y-2 mb-6">
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">GET /questions</code> - List questions
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">POST /questions</code> - Create question (auth required)
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">GET /questions/:id</code> - Get question details
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">POST /questions/:id/vote</code> - Vote on question (auth required)
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">POST /questions/:id/answers</code> - Create answer (auth required)
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">GET /tags/top</code> - Get trending tags
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Development</h2>
            <p className="text-gray-700 mb-4">
              To run OpenAsk locally, you'll need Node.js 18+, pnpm 8+, and MongoDB.
            </p>

            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <pre className="text-sm text-gray-800">
{`# Install dependencies
pnpm install

# Run dev servers (API + Web)
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build`}
              </pre>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">License</h2>
            <p className="text-gray-700">
              OpenAsk is open source software licensed under the MIT License.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
