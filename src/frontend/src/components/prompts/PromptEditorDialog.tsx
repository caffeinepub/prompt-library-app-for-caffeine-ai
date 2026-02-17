import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategoryPicker } from '../categories/CategoryPicker';
import { SimpleRichTextEditor } from '../../features/richText/SimpleRichTextEditor';
import { Prompt } from '../../features/prompts/types';
import { createInputPasteHandler } from '../../features/paste/cleanPasteHandlers';
import { Loader2 } from 'lucide-react';

interface PromptEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: Prompt;
  onSave: (data: Omit<Prompt, 'id' | 'dateAdded' | 'dateModified'>) => Promise<void>;
  canSave?: boolean;
  statusMessage?: string;
}

export function PromptEditorDialog({ 
  open, 
  onOpenChange, 
  prompt, 
  onSave,
  canSave = true,
  statusMessage,
}: PromptEditorDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(prompt?.title || '');
      setContent(prompt?.content || '');
      setCategories(prompt?.categories || []);
    }
  }, [open, prompt]);

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content,
        categories,
        isFavorite: prompt?.isFavorite || false,
      });
      onOpenChange(false);
    } catch (error) {
      // Error already handled by parent, keep dialog open
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = title.trim() && content.trim();
  const saveDisabled = !isFormValid || isSaving || !canSave;

  // Create paste handler for title input
  const handleTitlePaste = createInputPasteHandler(setTitle, () => title);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prompt ? 'Edit Prompt' : 'Add New Prompt'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {statusMessage && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md flex items-center gap-2">
              {!canSave && <Loader2 className="h-4 w-4 animate-spin" />}
              {statusMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onPaste={handleTitlePaste}
              placeholder="Enter prompt title"
              disabled={isSaving || !canSave}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <SimpleRichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Enter your prompt content here..."
            />
          </div>

          <div className="space-y-2">
            <Label>Categories</Label>
            <CategoryPicker
              selectedCategories={categories}
              onCategoriesChange={setCategories}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saveDisabled}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
