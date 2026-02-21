import React, { useState } from 'react';
import { Star, Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategoryStore } from '../../features/categories/categoryStore';
import { ConfirmDialog } from '../prompts/ConfirmDialog';
import { createInputPasteHandler } from '../../features/paste/cleanPasteHandlers';

interface CategoryFilterBarProps {
  selectedCategory: string | null;
  showFavoritesOnly: boolean;
  onCategorySelect: (category: string | null) => void;
  onFavoritesToggle: () => void;
  onCategoryRename?: (oldName: string, newName: string) => Promise<void>;
  onCategoryDelete?: (categoryName: string) => Promise<void>;
  onCategoryCreate?: (categoryName: string) => Promise<void>;
  backendReady?: boolean;
  backendError?: boolean;
  backendStatusMessage?: string;
}

export function CategoryFilterBar({
  selectedCategory,
  showFavoritesOnly,
  onCategorySelect,
  onFavoritesToggle,
  onCategoryRename,
  onCategoryDelete,
  onCategoryCreate,
  backendReady = true,
  backendError = false,
  backendStatusMessage,
}: CategoryFilterBarProps) {
  const categories = useCategoryStore((state) => state.categories);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createValue, setCreateValue] = useState('');

  const handleRenameClick = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingCategory(category);
    setRenameValue(category);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!renamingCategory || !renameValue.trim() || !onCategoryRename) return;
    
    if (renameValue.trim() !== renamingCategory) {
      await onCategoryRename(renamingCategory, renameValue.trim());
    }
    
    setRenameDialogOpen(false);
    setRenamingCategory(null);
    setRenameValue('');
  };

  const handleDeleteClick = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(category);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm && onCategoryDelete) {
      await onCategoryDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleCreateClick = () => {
    setCreateValue('');
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!createValue.trim() || !onCategoryCreate) return;
    
    await onCategoryCreate(createValue.trim());
    setCreateDialogOpen(false);
    setCreateValue('');
  };

  // Create paste handlers
  const handleRenamePaste = createInputPasteHandler(setRenameValue, () => renameValue);
  const handleCreatePaste = createInputPasteHandler(setCreateValue, () => createValue);

  return (
    <>
      <div className="w-full">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          {/* Favorites Toggle */}
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={onFavoritesToggle}
            className="w-full"
          >
            <Star className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </Button>

          {/* Create Category Button */}
          {onCategoryCreate && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateClick}
              disabled={!backendReady}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          )}

          {/* Category Badges */}
          {categories.map((category) => (
            <div
              key={category}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Badge
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer w-full justify-center pr-8 h-9 text-sm"
                onClick={() => onCategorySelect(selectedCategory === category ? null : category)}
              >
                {category}
              </Badge>
              {hoveredCategory === category && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-background/95 rounded px-1">
                  {onCategoryRename && (
                    <button
                      onClick={(e) => handleRenameClick(category, e)}
                      className="p-0.5 hover:bg-accent rounded"
                      title="Rename category"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                  {onCategoryDelete && (
                    <button
                      onClick={(e) => handleDeleteClick(category, e)}
                      className="p-0.5 hover:bg-destructive/10 text-destructive rounded"
                      title="Delete category"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Backend Error State */}
        {backendError && (
          <div className="text-xs text-destructive px-2 py-1 bg-destructive/10 rounded mt-2">
            Unable to load categories: {backendStatusMessage || 'Connection error'}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Category</DialogTitle>
            <DialogDescription>
              Enter a new name for the category. All prompts using this category will be updated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-input">Category Name</Label>
              <Input
                id="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onPaste={handleRenamePaste}
                placeholder="Enter category name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!renameValue.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Enter a name for the new category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-input">Category Name</Label>
              <Input
                id="create-input"
                value={createValue}
                onChange={(e) => setCreateValue(e.target.value)}
                onPaste={handleCreatePaste}
                placeholder="Enter category name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSubmit();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={!createValue.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteConfirm}"? This will remove it from all prompts.`}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
