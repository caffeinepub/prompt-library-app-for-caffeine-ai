import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PromptContent } from './PromptContent';
import { Prompt } from '../../features/prompts/types';

interface PromptPreviewDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptPreviewDialog({
  prompt,
  open,
  onOpenChange,
}: PromptPreviewDialogProps) {
  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{prompt.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <PromptContent content={prompt.content} className="text-foreground" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
