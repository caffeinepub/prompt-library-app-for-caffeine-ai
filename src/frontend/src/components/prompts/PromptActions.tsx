import React from 'react';
import { Copy, Edit, Trash2, Star, Copy as CopyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCopyToClipboard } from '../../features/clipboard/useCopyToClipboard';
import { htmlToPlainText } from '../../features/richText/htmlToPlainText';
import { Prompt } from '../../features/prompts/types';

interface PromptActionsProps {
  prompt: Prompt;
  isFavorite: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
}

export function PromptActions({
  prompt,
  isFavorite,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
}: PromptActionsProps) {
  const { copy, copied } = useCopyToClipboard();

  const handleCopy = () => {
    const plainText = htmlToPlainText(prompt.content);
    copy(plainText);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8"
            >
              {copied ? <CopyIcon className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="h-8 w-8"
            >
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isFavorite ? 'Unfavorite' : 'Favorite'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDuplicate}
              className="h-8 w-8"
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicate</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
