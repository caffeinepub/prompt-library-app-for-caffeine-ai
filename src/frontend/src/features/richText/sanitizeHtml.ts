/**
 * Sanitizes HTML content to allow only safe formatting tags and attributes
 * produced by the rich text editor (bold, italic, and color spans/fonts).
 * Drops unsafe/Word-noise nodes (style/script/head/meta/link/comments) entirely.
 * Converts browser-generated <font color="..."> tags to <span style="color: ..."> for consistency.
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

    // Drop comment nodes entirely
    if (node.nodeType === Node.COMMENT_NODE) {
      return null;
    }

    // Only allow specific element nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      // Drop unsafe/noise tags entirely (including their contents)
      const unsafeTags = ['style', 'script', 'head', 'meta', 'link', 'title', 'base'];
      if (unsafeTags.includes(tagName)) {
        return null;
      }

      // Handle <font> tags by converting them to <span> with color style
      if (tagName === 'font') {
        const fontElement = element as HTMLFontElement;
        const color = fontElement.color || fontElement.getAttribute('color');
        
        const spanElement = document.createElement('span');
        if (color) {
          spanElement.style.color = color;
        }
        
        // Recursively clean and append child nodes
        Array.from(element.childNodes).forEach((child) => {
          const cleanChild = cleanNode(child);
          if (cleanChild) {
            spanElement.appendChild(cleanChild);
          }
        });
        
        return spanElement;
      }

      // Allowed tags
      const allowedTags = ['b', 'strong', 'i', 'em', 'span', 'br', 'p', 'div'];
      
      if (!allowedTags.includes(tagName)) {
        // For disallowed tags, preserve their children but not the tag itself
        const fragment = document.createDocumentFragment();
        Array.from(element.childNodes).forEach((child) => {
          const cleanChild = cleanNode(child);
          if (cleanChild) {
            fragment.appendChild(cleanChild);
          }
        });
        return fragment;
      }

      // Create a clean version of the element
      const cleanElement = document.createElement(tagName);

      // For span elements, preserve color styling
      if (tagName === 'span') {
        const color = element.style.color;
        if (color) {
          cleanElement.style.color = color;
        }
        // Also check for inline color attribute from Word or other sources
        const styleAttr = element.getAttribute('style');
        if (styleAttr && styleAttr.includes('color:')) {
          const colorMatch = styleAttr.match(/color:\s*([^;]+)/);
          if (colorMatch) {
            cleanElement.style.color = colorMatch[1].trim();
          }
        }
      }

      // For p and div, convert to br for line breaks
      if (tagName === 'p' || tagName === 'div') {
        const fragment = document.createDocumentFragment();
        Array.from(element.childNodes).forEach((child) => {
          const cleanChild = cleanNode(child);
          if (cleanChild) {
            fragment.appendChild(cleanChild);
          }
        });
        // Add line break after paragraph
        if (element.nextSibling) {
          fragment.appendChild(document.createElement('br'));
        }
        return fragment;
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
