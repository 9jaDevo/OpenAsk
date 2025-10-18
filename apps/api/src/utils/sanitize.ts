import sanitizeHtml from 'sanitize-html';

// Configure sanitizer for markdown content
// Allows safe markdown-rendered HTML while blocking scripts and dangerous tags
export const sanitizeMarkdown = (content: string): string => {
    return sanitizeHtml(content, {
        allowedTags: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'strong', 'em', 'u', 's', 'code', 'pre',
            'a', 'img',
            'ul', 'ol', 'li',
            'blockquote',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
        ],
        allowedAttributes: {
            a: ['href', 'title', 'target', 'rel'],
            img: ['src', 'alt', 'title', 'width', 'height'],
            code: ['class'],
            pre: ['class'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        allowedSchemesByTag: {
            img: ['http', 'https', 'data'],
        },
        transformTags: {
            a: (tagName, attribs) => {
                return {
                    tagName,
                    attribs: {
                        ...attribs,
                        rel: 'noopener noreferrer',
                        target: '_blank',
                    },
                };
            },
        },
    });
};
