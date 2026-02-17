import { create } from 'zustand';

interface CategoryStore {
  categories: string[];
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  setCategories: (categories: string[]) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  
  addCategory: (name) => set((state) => {
    const trimmed = name.trim();
    if (!trimmed || state.categories.includes(trimmed)) {
      return state;
    }
    return { categories: [...state.categories, trimmed] };
  }),
  
  renameCategory: (oldName, newName) => set((state) => {
    const trimmed = newName.trim();
    if (!trimmed || state.categories.includes(trimmed)) {
      return state;
    }
    return {
      categories: state.categories.map((c) => (c === oldName ? trimmed : c)),
    };
  }),
  
  deleteCategory: (name) => set((state) => ({
    categories: state.categories.filter((c) => c !== name),
  })),
  
  setCategories: (categories) => set({ categories }),
}));
