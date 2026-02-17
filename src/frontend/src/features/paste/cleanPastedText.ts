/**
 * Cleans pasted text from Microsoft Word and other sources.
 * Removes HTML/CSS/comment artifacts while preserving basic structure
 * (line breaks, bullets, numbering).
 */
export function cleanPastedText(clipboardData: DataTransfer): string {
  // Prefer plain text when available (most reliable for structure)
  const plainText = clipboardData.getData('text/plain');
  const htmlText = clipboardData.getData('text/html');

  // If we have plain text, use it (it already has the structure we want)
  if (plainText) {
    return normalizePlainText(plainText);
  }

  // Fallback: extract text from HTML if no plain text available
  if (htmlText) {
    return extractTextFromHtml(htmlText);
  }

  return '';
}

/**
 * Normalizes plain text by cleaning up whitespace artifacts
 * while preserving line breaks and indentation.
 */
function normalizePlainText(text: string): string {
  return text
    // Normalize line endings (CRLF -> LF)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Replace non-breaking spaces with regular spaces
    .replace(/\u00A0/g, ' ')
    // Replace multiple spaces with single space (but preserve line breaks)
    .replace(/ +/g, ' ')
    // Preserve tabs for indentation
    .replace(/\t/g, '  ');
}

/**
 * Extracts readable text from HTML, converting structure to plain text
 * with preserved line breaks and list formatting.
 */
function extractTextFromHtml(html: string): string {
  // Remove Word-specific HTML comment blocks (e.g., <!-- /* Font Definitions */ ... -->)
  let cleaned = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove style blocks
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove script blocks
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove head, meta, link tags
  cleaned = cleaned.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  cleaned = cleaned.replace(/<meta[^>]*>/gi, '');
  cleaned = cleaned.replace(/<link[^>]*>/gi, '');

  // Create a temporary DOM element to parse
  const temp = document.createElement('div');
  temp.innerHTML = cleaned;

  // Convert block elements to line breaks
  const blockElements = temp.querySelectorAll('p, div, br, li');
  blockElements.forEach((el) => {
    if (el.tagName === 'LI') {
      // Add bullet or number prefix for list items
      const textContent = el.textContent || '';
      if (textContent.trim()) {
        el.textContent = '• ' + textContent;
      }
    }
    // Add newline after block elements
    if (el.nextSibling) {
      el.after(document.createTextNode('\n'));
    }
  });

  // Get text content (strips all HTML tags)
  let text = temp.textContent || '';

  // Normalize the extracted text
  return normalizePlainText(text)
    // Remove excessive blank lines (more than 2 consecutive)
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace
    .trim();
}
