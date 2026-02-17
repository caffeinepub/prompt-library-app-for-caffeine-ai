import { create } from 'zustand';
import { Prompt } from './types';
import { generateId } from './id';

interface PromptStore {
  prompts: Prompt[];
  addPrompt: (prompt: Omit<Prompt, 'id' | 'dateAdded' | 'dateModified'>) => void;
  updatePrompt: (id: string, updates: Partial<Omit<Prompt, 'id' | 'dateAdded'>>) => void;
  deletePrompt: (id: string) => void;
  duplicatePrompt: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setPrompts: (prompts: Prompt[]) => void;
  removeCategoryFromPrompts: (category: string) => void;
  renameCategoryInPrompts: (oldName: string, newName: string) => void;
}

export const usePromptStore = create<PromptStore>((set) => ({
  prompts: [],
  
  addPrompt: (prompt) => set((state) => ({
    prompts: [
      ...state.prompts,
      {
        ...prompt,
        id: generateId(),
        dateAdded: Date.now(),
        dateModified: Date.now(),
      },
    ],
  })),
  
  updatePrompt: (id, updates) => set((state) => ({
    prompts: state.prompts.map((p) =>
      p.id === id
        ? { ...p, ...updates, dateModified: Date.now() }
        : p
    ),
  })),
  
  deletePrompt: (id) => set((state) => ({
    prompts: state.prompts.filter((p) => p.id !== id),
  })),
  
  duplicatePrompt: (id) => set((state) => {
    const original = state.prompts.find((p) => p.id === id);
    if (!original) return state;
    
    return {
      prompts: [
        ...state.prompts,
        {
          ...original,
          id: generateId(),
          title: `${original.title} (Copy)`,
          dateAdded: Date.now(),
          dateModified: Date.now(),
        },
      ],
    };
  }),
  
  toggleFavorite: (id) => set((state) => ({
    prompts: state.prompts.map((p) =>
      p.id === id
        ? { ...p, isFavorite: !p.isFavorite, dateModified: Date.now() }
        : p
    ),
  })),
  
  setPrompts: (prompts) => set({ prompts }),
  
  removeCategoryFromPrompts: (category) => set((state) => ({
    prompts: state.prompts.map((p) => ({
      ...p,
      categories: p.categories.filter((c) => c !== category),
    })),
  })),
  
  renameCategoryInPrompts: (oldName, newName) => set((state) => ({
    prompts: state.prompts.map((p) => ({
      ...p,
      categories: p.categories.map((c) => (c === oldName ? newName : c)),
    })),
  })),
}));
