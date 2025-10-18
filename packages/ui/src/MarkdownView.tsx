import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Disable raw HTML for security
          html: () => null,
          // Style headings
          h1: ({ node: _node, ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
          h2: ({ node: _node, ...props }) => <h2 className="text-xl font-bold mb-3" {...props} />,
          h3: ({ node: _node, ...props }) => <h3 className="text-lg font-bold mb-2" {...props} />,
          // Style lists
          ul: ({ node: _node, ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
          ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
          li: ({ node: _node, ...props }) => <li className="mb-1" {...props} />,
          // Style paragraphs
          p: ({ node: _node, ...props }) => <p className="mb-4" {...props} />,
          // Style code
          code: ({ node: _node, ...props }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
          ),
          pre: ({ node: _node, ...props }) => (
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-4" {...props} />
          ),
          // Style links
          a: ({ node: _node, ...props }) => (
            <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
