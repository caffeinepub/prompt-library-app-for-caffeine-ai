import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PromptActions } from './PromptActions';
import { PromptPreviewDialog } from './PromptPreviewDialog';
import { Prompt } from '../../features/prompts/types';

interface PromptTableViewProps {
  prompts: Prompt[];
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function PromptTableView({
  prompts,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
}: PromptTableViewProps) {
  const [previewPrompt, setPreviewPrompt] = useState<Prompt | null>(null);

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No prompts found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Title</TableHead>
              <TableHead className="w-[40%]">Categories</TableHead>
              <TableHead className="w-[15%]">Modified</TableHead>
              <TableHead className="w-[15%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow 
                key={prompt.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setPreviewPrompt(prompt)}
              >
                <TableCell className="font-medium">{prompt.title}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {prompt.categories.slice(0, 3).map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {prompt.categories.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{prompt.categories.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(prompt.dateModified).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <PromptActions
                    prompt={prompt}
                    isFavorite={prompt.isFavorite}
                    onEdit={() => onEdit(prompt)}
                    onDelete={() => onDelete(prompt.id)}
                    onDuplicate={() => onDuplicate(prompt.id)}
                    onToggleFavorite={() => onToggleFavorite(prompt.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PromptPreviewDialog
        prompt={previewPrompt}
        open={!!previewPrompt}
        onOpenChange={(open) => !open && setPreviewPrompt(null)}
      />
    </>
  );
}
