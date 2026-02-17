import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PromptContent } from './PromptContent';
import { PromptActions } from './PromptActions';
import { Prompt } from '../../features/prompts/types';

interface PromptListViewProps {
  prompts: Prompt[];
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function PromptListView({
  prompts,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
}: PromptListViewProps) {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No prompts found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <Card key={prompt.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{prompt.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {prompt.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <PromptActions
                prompt={prompt}
                isFavorite={prompt.isFavorite}
                onEdit={() => onEdit(prompt)}
                onDelete={() => onDelete(prompt.id)}
                onDuplicate={() => onDuplicate(prompt.id)}
                onToggleFavorite={() => onToggleFavorite(prompt.id)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <PromptContent content={prompt.content} className="text-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
