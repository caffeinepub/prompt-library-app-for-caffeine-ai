import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PromptActions } from './PromptActions';
import { PromptContent } from './PromptContent';
import { Prompt } from '../../features/prompts/types';

interface PromptGridViewProps {
  prompts: Prompt[];
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function PromptGridView({
  prompts,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
}: PromptGridViewProps) {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No prompts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {prompts.map((prompt) => {
        return (
          <Card key={prompt.id} className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2 flex-1">{prompt.title}</CardTitle>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
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
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 mb-3">
                <PromptContent 
                  content={prompt.content} 
                  className="line-clamp-4 text-muted-foreground"
                />
              </div>
              <div className="flex justify-end">
                <PromptActions
                  prompt={prompt}
                  isFavorite={prompt.isFavorite}
                  onEdit={() => onEdit(prompt)}
                  onDelete={() => onDelete(prompt.id)}
                  onDuplicate={() => onDuplicate(prompt.id)}
                  onToggleFavorite={() => onToggleFavorite(prompt.id)}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
