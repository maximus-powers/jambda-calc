'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { CopyIcon, CheckIcon } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Preprocess content to handle various code block formats
  const processedContent = React.useMemo(() => {
    let processed = content;

    // Fix triple backtick code blocks without proper spacing
    processed = processed
      .replace(/(\S)(\n```)/g, '$1\n\n```')
      .replace(/(```\w*\n[\s\S]*?```)(\n\S)/g, '$1\n\n$2');

    // Handle inline triple backticks that should be code blocks
    // This regex looks for triple backticks that are on a single line
    processed = processed.replace(/```([\w]*)\s+(.*?)```/g, (match, language, code) => {
      // Convert to proper code block format
      return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    });

    return processed;
  }, [content]);

  return (
    <div className="prose dark:prose-invert max-w-none prose-img:rounded-lg prose-headings:scroll-mt-20">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSanitize,
          [rehypeHighlight, { ignoreMissing: true, subset: false }],
        ]}
        components={{
          // Custom paragraph renderer to handle potential pre elements
          p: ({ node, children, ...props }) => {
            // Check if children contains any pre elements or components
            const hasPreElement = React.Children.toArray(children).some(
              (child) => React.isValidElement(child) && child.type === 'pre'
            );

            // If it does, just render the children directly to avoid nesting pre in p
            if (hasPreElement) {
              return <>{children}</>;
            }

            // Check if paragraph contains text that looks like inline code blocks
            const text = React.Children.toArray(children)
              .map((child) => (typeof child === 'string' ? child : ''))
              .join('');

            if (text.includes('```')) {
              // This might be an inline code block that wasn't properly processed
              // We'll handle it specially
              return (
                <div>
                  {text.split('```').map((part, index) => {
                    // Even indices are normal text, odd indices are code
                    if (index % 2 === 0) {
                      return part ? <p key={index}>{part}</p> : null;
                    } else {
                      // Extract language if specified
                      const match = part.match(/^(\w+)\s+(.+)$/s);
                      const language = match ? match[1] : '';
                      const code = match ? match[2] : part;

                      return (
                        <CodeBlock
                          key={index}
                          language={language}
                          code={code.trim()}
                          isCommand={code.includes('npm ') || code.includes('yarn ')}
                        />
                      );
                    }
                  })}
                </div>
              );
            }

            // Otherwise, render as normal paragraph
            return <p {...props}>{children}</p>;
          },
          // Custom code block renderer
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            // For inline code
            if (inline) {
              // Check if this looks like it should be a code block
              const text = String(children);
              if (text.startsWith('```') && text.endsWith('```')) {
                const innerText = text.slice(3, -3);
                const langMatch = innerText.match(/^(\w+)\s+(.+)$/s);
                const lang = langMatch ? langMatch[1] : '';
                const code = langMatch ? langMatch[2] : innerText;

                return <CodeBlock language={lang} code={code.trim()} />;
              }

              return (
                <code
                  className="inline-code bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // We'll handle code blocks in the pre renderer
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Custom pre renderer to add copy button and styling
          pre: ({ node, children, ...props }) => {
            const childArray = React.Children.toArray(children);
            const codeElement = childArray.find(
              (child) => React.isValidElement(child) && child.type === 'code'
            ) as React.ReactElement | undefined;

            if (!codeElement) {
              return <pre {...props}>{children}</pre>;
            }

            const code = React.Children.toArray(codeElement.props.children).join('');
            const className = codeElement.props.className || '';
            const match = /language-(\w+)/.exec(className);
            const language = match ? match[1] : '';
            const isCommand =
              code.includes('npm ') || code.includes('yarn ') || code.includes('jambda-calc');

            return <CodeBlock language={language} code={code} isCommand={isCommand} />;
          },
          // You can customize other markdown elements here
          a: ({ node, ...props }) => (
            <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
          ),
          img: ({ node, ...props }) => <img className="rounded-lg mx-auto" {...props} />,
          // Add more custom components as needed
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

interface CodeBlockProps {
  language: string;
  code: string;
  isCommand?: boolean;
}

function CodeBlock({ language, code, isCommand = false }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detect if this is a Math function example
  const isMathFunction =
    code.includes('Math.') &&
    (code.includes('Math.cos') || code.includes('Math.sin') || code.includes('Math.log'));

  // Set language to javascript for Math function examples
  const effectiveLanguage = isMathFunction ? 'js' : language || 'js';

  return (
    <div
      className={`code-card my-6 rounded-lg overflow-hidden shadow-md bg-gray-50 dark:bg-gray-800 ${isCommand ? 'command-card' : ''}`}
    >
      <div className="code-card-header flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <span className="code-card-lang text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
          {isCommand ? 'node' : effectiveLanguage}
        </span>
        <button
          onClick={copyToClipboard}
          className="code-card-copy flex items-center justify-center w-8 h-8 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Copy to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-500" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="code-card-content">
        <pre className={`m-0 p-4 bg-[#1e1e1e] overflow-x-auto ${isCommand ? 'command-pre' : ''}`}>
          <code className={`language-${effectiveLanguage}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}
