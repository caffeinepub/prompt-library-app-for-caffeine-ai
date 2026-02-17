/**
 * Sanitizes HTML content to allow only safe formatting tags and attributes
 * produced by the rich text editor (bold, italic, and color spans).
 */
export function sanitizeHtml(html: string): string {
  // Create a temporary DOM element to parse the HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Recursively clean the DOM tree
  function cleanNode(node: Node): Node | null {
    // Text nodes are always safe
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(false);
    }

    // Only allow specific element nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      // Allowed tags
      const allowedTags = ['b', 'strong', 'i', 'em', 'span', 'br'];
      
      if (!allowedTags.includes(tagName)) {
        // For disallowed tags, just return their text content
        const textNode = document.createTextNode(element.textContent || '');
        return textNode;
      }

      // Create a clean version of the element
      const cleanElement = document.createElement(tagName);

      // For span elements, only allow color/style attributes
      if (tagName === 'span') {
        const color = element.style.color;
        if (color) {
          cleanElement.style.color = color;
        }
      }

      // Recursively clean and append child nodes
      Array.from(element.childNodes).forEach((child) => {
        const cleanChild = cleanNode(child);
        if (cleanChild) {
          cleanElement.appendChild(cleanChild);
        }
      });

      return cleanElement;
    }

    return null;
  }

  // Clean all child nodes
  const cleanDiv = document.createElement('div');
  Array.from(temp.childNodes).forEach((child) => {
    const cleanChild = cleanNode(child);
    if (cleanChild) {
      cleanDiv.appendChild(cleanChild);
    }
  });

  return cleanDiv.innerHTML;
}
