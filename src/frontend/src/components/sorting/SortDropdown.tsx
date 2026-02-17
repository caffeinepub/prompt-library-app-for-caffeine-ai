import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortMode } from '../../features/prompts/types';

interface SortDropdownProps {
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
}

export function SortDropdown({ sortMode, onSortModeChange }: SortDropdownProps) {
  return (
    <Select value={sortMode} onValueChange={(value) => onSortModeChange(value as SortMode)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dateAddedNewest">Newest First</SelectItem>
        <SelectItem value="dateAddedOldest">Oldest First</SelectItem>
        <SelectItem value="alphabeticalAZ">A → Z</SelectItem>
        <SelectItem value="alphabeticalZA">Z → A</SelectItem>
        <SelectItem value="recentlyEdited">Recently Edited</SelectItem>
        <SelectItem value="favoritesFirst">Favorites First</SelectItem>
      </SelectContent>
    </Select>
  );
}
