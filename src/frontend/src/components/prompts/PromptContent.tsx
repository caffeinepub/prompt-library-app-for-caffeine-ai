import React from 'react';
import { sanitizeHtml } from '../../features/richText/sanitizeHtml';

interface PromptContentProps {
  content: string;
  className?: string;
}

export function PromptContent({ content, className = '' }: PromptContentProps) {
  // Sanitize the HTML content before rendering to ensure no Word junk appears
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div
      className={`whitespace-pre-wrap text-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
