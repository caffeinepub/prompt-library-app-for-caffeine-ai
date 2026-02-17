import { cleanPastedText } from './cleanPastedText';

/**
 * Creates a paste handler for standard input/textarea elements.
 * Cleans pasted content and inserts it at the cursor position.
 */
export function createInputPasteHandler(
  setValue: (value: string) => void,
  getValue: () => string
) {
  return (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    
    const cleanedText = cleanPastedText(e.clipboardData);
    if (!cleanedText) return;

    const input = e.currentTarget;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = getValue();

    // Insert cleaned text at cursor position
    const newValue = 
      currentValue.substring(0, start) + 
      cleanedText + 
      currentValue.substring(end);

    setValue(newValue);

    // Set cursor position after inserted text
    setTimeout(() => {
      const newCursorPos = start + cleanedText.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
}

/**
 * Creates a paste handler for contentEditable elements.
 * Cleans pasted content and inserts it as plain text at cursor.
 */
export function createContentEditablePasteHandler(
  onInput: () => void
) {
  return (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const cleanedText = cleanPastedText(e.clipboardData);
    if (!cleanedText) return;

    // Insert as plain text at cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // Insert text preserving line breaks
      const lines = cleanedText.split('\n');
      lines.forEach((line, index) => {
        range.insertNode(document.createTextNode(line));
        if (index < lines.length - 1) {
          range.insertNode(document.createElement('br'));
        }
      });
      
      // Move cursor to end
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    onInput();
  };
}
