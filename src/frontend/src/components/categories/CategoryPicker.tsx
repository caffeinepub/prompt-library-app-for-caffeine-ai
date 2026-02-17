import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useCategoryStore } from '../../features/categories/categoryStore';
import { usePromptLibrarySync } from '../../features/backend/usePromptLibrarySync';
import { createInputPasteHandler } from '../../features/paste/cleanPasteHandlers';

interface CategoryPickerProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export function CategoryPicker({ selectedCategories, onCategoriesChange }: CategoryPickerProps) {
  const categories = useCategoryStore((state) => state.categories);
  const { saveCategory } = usePromptLibrarySync();
  const [newCategory, setNewCategory] = useState('');

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    // Check for case-insensitive duplicates
    const normalizedName = trimmed.toLowerCase();
    const isDuplicate = categories.some(cat => cat.toLowerCase() === normalizedName);
    
    if (isDuplicate) {
      toast.error('A category with this name already exists');
      return;
    }

    try {
      await saveCategory(trimmed);
      onCategoriesChange([...selectedCategories, trimmed]);
      setNewCategory('');
      toast.success('Category created successfully');
    } catch (error) {
      // Error already shown by sync hook
    }
  };

  // Create paste handler for new category input
  const handlePaste = createInputPasteHandler(setNewCategory, () => newCategory);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCategory();
            }
          }}
        />
        <Button type="button" onClick={handleAddCategory} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-4">
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No categories yet. Create one above.
            </p>
          ) : (
            categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleToggleCategory(category)}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
