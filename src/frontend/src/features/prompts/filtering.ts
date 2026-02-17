import { Prompt } from './types';

// Case-insensitive search across title, content, and category names
export function filterPrompts(
  prompts: Prompt[],
  searchQuery: string,
  selectedCategory: string | null,
  showFavoritesOnly: boolean
): Prompt[] {
  let filtered = prompts;

  // Filter by favorites
  if (showFavoritesOnly) {
    filtered = filtered.filter((p) => p.isFavorite);
  }

  // Filter by category
  if (selectedCategory) {
    filtered = filtered.filter((p) => p.categories.includes(selectedCategory));
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((p) => {
      const titleMatch = p.title.toLowerCase().includes(query);
      const contentMatch = p.content.toLowerCase().includes(query);
      const categoryMatch = p.categories.some((c) => c.toLowerCase().includes(query));
      return titleMatch || contentMatch || categoryMatch;
    });
  }

  return filtered;
}
