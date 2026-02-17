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
import { ConfirmDialog } from '../prompts/ConfirmDialog';

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageCategoriesDialog({ open, onOpenChange }: ManageCategoriesDialogProps) {
  const categories = useCategoryStore((state) => state.categories);
  const renameCategory = useCategoryStore((state) => state.renameCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const prompts = usePromptStore((state) => state.prompts);
  const removeCategoryFromPrompts = usePromptStore((state) => state.removeCategoryFromPrompts);
  const renameCategoryInPrompts = usePromptStore((state) => state.renameCategoryInPrompts);

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

  const handleSaveEdit = () => {
    if (editingCategory && editValue.trim() && editValue !== editingCategory) {
      renameCategory(editingCategory, editValue.trim());
      renameCategoryInPrompts(editingCategory, editValue.trim());
    }
    setEditingCategory(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const handleDeleteClick = (category: string) => {
    const count = getCategoryUsageCount(category);
    setDeleteConfirm({ category, count });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deleteCategory(deleteConfirm.category);
      removeCategoryFromPrompts(deleteConfirm.category);
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Rename or delete categories. Deleting a category will remove it from all prompts.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-96 rounded-md border p-4">
            {categories.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No categories yet. Add categories when creating prompts.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {editingCategory === category ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium">{category}</p>
                          <p className="text-sm text-muted-foreground">
                            Used in {getCategoryUsageCount(category)} prompt(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleStartEdit(category)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(category)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Category"
        description={
          deleteConfirm
            ? `Are you sure you want to delete "${deleteConfirm.category}"? This will remove it from ${deleteConfirm.count} prompt(s).`
            : ''
        }
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
