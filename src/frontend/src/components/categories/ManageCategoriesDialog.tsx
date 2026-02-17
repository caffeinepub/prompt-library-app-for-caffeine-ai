import React, { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCategoryStore } from '../../features/categories/categoryStore';
import { usePromptStore } from '../../features/prompts/promptStore';
import { usePromptLibrarySync } from '../../features/backend/usePromptLibrarySync';
import { ConfirmDialog } from '../prompts/ConfirmDialog';

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageCategoriesDialog({ open, onOpenChange }: ManageCategoriesDialogProps) {
  const categories = useCategoryStore((state) => state.categories);
  const prompts = usePromptStore((state) => state.prompts);
  const { renameCategory, deleteCategory } = usePromptLibrarySync();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ category: string; count: number } | null>(null);

  const getCategoryUsageCount = (category: string) => {
    return prompts.filter((p) => p.categories.includes(category)).length;
  };

  const handleStartEdit = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !editValue.trim()) return;
    
    if (editValue.trim() !== editingCategory) {
      await renameCategory(editingCategory, editValue.trim());
    }
    
    setEditingCategory(null);
    setEditValue('');
  };

  const handleDeleteClick = (category: string) => {
    const count = getCategoryUsageCount(category);
    setDeleteConfirm({ category, count });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    
    await deleteCategory(deleteConfirm.category);
    setDeleteConfirm(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Rename or delete categories. Deleting a category will remove it from all prompts.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No categories yet. Create one when adding a prompt.
                </p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {editingCategory === category ? (
                      <>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{category}</span>
                        <span className="text-xs text-muted-foreground">
                          {getCategoryUsageCount(category)} prompt{getCategoryUsageCount(category) !== 1 ? 's' : ''}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(category)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(category)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Category"
        description={
          deleteConfirm
            ? `Are you sure you want to delete "${deleteConfirm.category}"? This will remove it from ${deleteConfirm.count} prompt${deleteConfirm.count !== 1 ? 's' : ''}.`
            : ''
        }
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
