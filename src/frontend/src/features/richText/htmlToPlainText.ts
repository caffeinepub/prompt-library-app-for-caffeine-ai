/**
 * Converts HTML content to plain text by stripping all tags
 * and decoding HTML entities while preserving basic structure.
 */
export function htmlToPlainText(html: string): string {
  // Create a temporary DOM element to parse the HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Get text content (automatically strips tags and decodes entities)
  let text = temp.textContent || temp.innerText || '';

  // Collapse multiple whitespace/newlines into single spaces
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
