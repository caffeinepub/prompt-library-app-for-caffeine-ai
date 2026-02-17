import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCategoryStore } from '../../features/categories/categoryStore';

interface CategoryFilterBarProps {
  selectedCategory: string | null;
  showFavoritesOnly: boolean;
  onCategorySelect: (category: string | null) => void;
  onFavoritesToggle: () => void;
}

export function CategoryFilterBar({
  selectedCategory,
  showFavoritesOnly,
  onCategorySelect,
  onFavoritesToggle,
}: CategoryFilterBarProps) {
  const categories = useCategoryStore((state) => state.categories);

  const handleCategoryClick = (category: string) => {
    // Toggle category selection
    if (selectedCategory === category) {
      onCategorySelect(null);
    } else {
      onCategorySelect(category);
    }
  };

  return (
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
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
