import { Prompt, SortMode } from './types';

export function sortPrompts(prompts: Prompt[], sortMode: SortMode): Prompt[] {
  const sorted = [...prompts];

  switch (sortMode) {
    case 'dateAddedNewest':
      return sorted.sort((a, b) => b.dateAdded - a.dateAdded);
    
    case 'dateAddedOldest':
      return sorted.sort((a, b) => a.dateAdded - b.dateAdded);
    
    case 'alphabeticalAZ':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    
    case 'alphabeticalZA':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    
    case 'recentlyEdited':
      return sorted.sort((a, b) => b.dateModified - a.dateModified);
    
    case 'favoritesFirst':
      return sorted.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) {
          return b.dateModified - a.dateModified;
        }
        return a.isFavorite ? -1 : 1;
      });
    
    default:
      return sorted;
  }
}
