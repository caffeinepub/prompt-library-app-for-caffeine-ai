import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CategoryPicker } from '../categories/CategoryPicker';
import { SimpleRichTextEditor } from '../../features/richText/SimpleRichTextEditor';
import { sanitizeHtml } from '../../features/richText/sanitizeHtml';
import { Prompt } from '../../features/prompts/types';

interface PromptEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: Prompt;
  onSave: (data: Omit<Prompt, 'id' | 'dateAdded' | 'dateModified'>) => void;
}

export function PromptEditorDialog({
  open,
  onOpenChange,
  prompt,
  onSave,
}: PromptEditorDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setCategories(prompt.categories);
      setIsFavorite(prompt.isFavorite);
    } else {
      setTitle('');
      setContent('');
      setCategories([]);
      setIsFavorite(false);
    }
  }, [prompt, open]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const sanitizedContent = sanitizeHtml(content);
    
    if (!trimmedTitle || !sanitizedContent.trim()) return;

    onSave({
      title: trimmedTitle,
      content: sanitizedContent,
      categories,
      isFavorite,
    });

    onOpenChange(false);
  };

  const isContentEmpty = !content.trim() || content === '<br>';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prompt ? 'Edit Prompt' : 'Add New Prompt'}</DialogTitle>
          <DialogDescription>
            {prompt ? 'Update your prompt details below.' : 'Create a new prompt for your library.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter prompt title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <SimpleRichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Enter your prompt content here. Use the toolbar to format text with bold, italic, and colors. Paste from Word to preserve formatting."
            />
          </div>

          <div className="space-y-2">
            <Label>Categories</Label>
            <CategoryPicker
              selectedCategories={categories}
              onCategoriesChange={setCategories}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="favorite"
              checked={isFavorite}
              onCheckedChange={setIsFavorite}
            />
            <Label htmlFor="favorite">Mark as favorite</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || isContentEmpty}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
