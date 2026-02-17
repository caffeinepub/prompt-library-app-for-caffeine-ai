// Type definitions for prompts and related data structures
export interface Prompt {
  id: string;
  title: string;
  content: string;
  categories: string[];
  isFavorite: boolean;
  dateAdded: number;
  dateModified: number;
}

export type ViewMode = 'list' | 'grid' | 'table';

export type SortMode = 
  | 'dateAddedNewest'
  | 'dateAddedOldest'
  | 'alphabeticalAZ'
  | 'alphabeticalZA'
  | 'recentlyEdited'
  | 'favoritesFirst';
