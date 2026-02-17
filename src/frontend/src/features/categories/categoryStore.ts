import { create } from 'zustand';

interface CategoryStore {
  categories: string[];
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  setCategories: (categories: string[]) => void;
  clearCategories: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  
  addCategory: (name) => set((state) => {
    const trimmed = name.trim();
    if (!trimmed) return state;
    
    // Check for case-insensitive duplicates
    const exists = state.categories.some(
      existing => existing.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (exists) return state;
    
    return { categories: [...state.categories, trimmed] };
  }),
  
  renameCategory: (oldName, newName) => set((state) => {
    const trimmed = newName.trim();
    if (!trimmed) return state;
    
    // Check for case-insensitive duplicates (excluding the old name)
    const exists = state.categories.some(
      existing => existing !== oldName && existing.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (exists) return state;
    
    return {
      categories: state.categories.map((c) => (c === oldName ? trimmed : c)),
    };
  }),
  
  deleteCategory: (name) => set((state) => ({
    categories: state.categories.filter((c) => c !== name),
  })),
  
  setCategories: (categories) => set({ categories }),
  
  clearCategories: () => set({ categories: [] }),
}));
