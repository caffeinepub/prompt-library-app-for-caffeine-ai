import React, { useState } from 'react';
import { Star, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  onCategoryRename?: (oldName: string, newName: string) => void;
  onCategoryDelete?: (categoryName: string) => void;
}

export function CategoryFilterBar({
  selectedCategory,
  showFavoritesOnly,
  onCategorySelect,
  onFavoritesToggle,
  onCategoryRename,
  onCategoryDelete,
}: CategoryFilterBarProps) {
  const categories = useCategoryStore((state) => state.categories);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: string) => {
    // Toggle category selection
    if (selectedCategory === category) {
      onCategorySelect(null);
    } else {
      onCategorySelect(category);
    }
  };

  const handleRenameClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    setRenamingCategory(category);
    setNewCategoryName(category);
    setRenameDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    setDeleteConfirmCategory(category);
  };

  const handleRenameSubmit = () => {
    if (!renamingCategory || !newCategoryName.trim()) return;
    
    const trimmedName = newCategoryName.trim();
    if (trimmedName === renamingCategory) {
      setRenameDialogOpen(false);
      return;
    }

    if (onCategoryRename) {
      onCategoryRename(renamingCategory, trimmedName);
    }
    
    setRenameDialogOpen(false);
    setRenamingCategory(null);
    setNewCategoryName('');
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmCategory) return;
    
    if (onCategoryDelete) {
      onCategoryDelete(deleteConfirmCategory);
    }
    
    setDeleteConfirmCategory(null);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={onFavoritesToggle}
          >
            <Star className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </Button>
        </div>

        {categories.length > 0 && (
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="relative group"
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Badge
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/80 transition-colors pr-16"
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </Badge>
                  {hoveredCategory === category && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-background/80"
                        onClick={(e) => handleRenameClick(e, category)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-destructive/80 hover:text-destructive-foreground"
                        onClick={(e) => handleDeleteClick(e, category)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Category</DialogTitle>
            <DialogDescription>
              Enter a new name for the category "{renamingCategory}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onPaste={createInputPasteHandler(
                  (value) => setNewCategoryName(value),
                  () => newCategoryName
                )}
                placeholder="Enter category name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRenameSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!newCategoryName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirmCategory}
        onOpenChange={(open) => !open && setDeleteConfirmCategory(null)}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${deleteConfirmCategory}"? Prompts using this category will not be deleted, but the category will be removed from them.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
