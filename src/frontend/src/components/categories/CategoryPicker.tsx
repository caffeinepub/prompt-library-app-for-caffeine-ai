import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCategoryStore } from '../../features/categories/categoryStore';

interface CategoryPickerProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export function CategoryPicker({ selectedCategories, onCategoriesChange }: CategoryPickerProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const categories = useCategoryStore((state) => state.categories);
  const addCategory = useCategoryStore((state) => state.addCategory);

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    
    // Check if category already exists (case-insensitive)
    const exists = categories.some(
      cat => cat.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (exists) {
      // Find the existing category with correct casing
      const existingCategory = categories.find(
        cat => cat.toLowerCase() === trimmed.toLowerCase()
      );
      
      // Select it if not already selected
      if (existingCategory && !selectedCategories.includes(existingCategory)) {
        onCategoriesChange([...selectedCategories, existingCategory]);
      }
    } else {
      // Add new category to store
      addCategory(trimmed);
      
      // Select the new category (avoid duplicates in selection)
      if (!selectedCategories.some(cat => cat.toLowerCase() === trimmed.toLowerCase())) {
        onCategoriesChange([...selectedCategories, trimmed]);
      }
    }
    
    setNewCategoryName('');
  };

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCategory();
            }
          }}
        />
        <Button type="button" onClick={handleAddCategory} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {categories.length > 0 && (
        <ScrollArea className="h-48 rounded-md border p-4">
          <div className="space-y-2">
            {categories.map((category) => (
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
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
