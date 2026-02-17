import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Type } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createContentEditablePasteHandler } from '../paste/cleanPasteHandlers';

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Black', value: '#000000' },
];

export function SimpleRichTextEditor({
  value,
  onChange,
  placeholder = 'Enter your content here...',
  className = '',
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const applyFormat = useCallback((format: 'bold' | 'italic') => {
    execCommand(format);
  }, [execCommand]);

  const applyColor = useCallback((color: string) => {
    execCommand('foreColor', color);
  }, [execCommand]);

  // Use the shared paste cleaning handler
  const handlePaste = createContentEditablePasteHandler(handleInput);

  return (
    <div className={`border rounded-md ${className}`}>
      <TooltipProvider>
        <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyFormat('bold')}
                className="h-8 w-8 p-0"
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyFormat('italic')}
                className="h-8 w-8 p-0"
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Type className="h-4 w-4 text-muted-foreground mr-1" />
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => applyColor(color.value)}
                    className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </TooltipTrigger>
            <TooltipContent>Text Color</TooltipContent>
          </Tooltip>
        </div>

        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          className="min-h-[200px] p-3 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-b-md"
          data-placeholder={placeholder}
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        />
      </TooltipProvider>

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          position: absolute;
        }
      `}</style>
    </div>
  );
}
