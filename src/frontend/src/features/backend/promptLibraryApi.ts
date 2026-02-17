import { type backendInterface, type Prompt as BackendPrompt, type Category as BackendCategory } from '../../backend';
import { Prompt } from '../prompts/types';

/**
 * API layer for backend prompt library operations.
 * Maps between frontend Prompt types and backend Prompt types.
 */

// Generate stable category ID from name
function generateCategoryId(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-');
}

// Map frontend Prompt to backend Prompt
export function toBackendPrompt(prompt: Prompt): BackendPrompt {
  return {
    id: prompt.id,
    title: prompt.title,
    content: prompt.content, // HTML string preserved
    author: '', // Not used in frontend
    categories: prompt.categories,
    tags: [], // Not used in frontend
  };
}

// Map backend Prompt to frontend Prompt
export function fromBackendPrompt(backendPrompt: BackendPrompt): Prompt {
  return {
    id: backendPrompt.id,
    title: backendPrompt.title,
    content: backendPrompt.content, // HTML string preserved
    categories: backendPrompt.categories,
    isFavorite: false, // Not stored in backend, will be derived from local state
    dateAdded: Date.now(), // Backend doesn't store dates
    dateModified: Date.now(),
  };
}

// Map backend Category to frontend category string
export function fromBackendCategory(backendCategory: BackendCategory): string {
  return backendCategory.name;
}

// Map frontend category string to backend Category
export function toBackendCategory(categoryName: string): BackendCategory {
  const trimmed = categoryName.trim();
  return {
    id: generateCategoryId(trimmed),
    name: trimmed,
    description: '',
  };
}

export class PromptLibraryApi {
  constructor(private actor: backendInterface) {}

  async getAllPrompts(): Promise<Prompt[]> {
    const backendPrompts = await this.actor.getAllPrompts();
    return backendPrompts.map(fromBackendPrompt);
  }

  async savePrompt(prompt: Prompt): Promise<void> {
    const backendPrompt = toBackendPrompt(prompt);
    await this.actor.savePrompt(backendPrompt);
  }

  async deletePrompt(promptId: string): Promise<void> {
    await this.actor.deletePrompt(promptId);
  }

  async getAllCategories(): Promise<string[]> {
    const backendCategories = await this.actor.getAllCategories();
    return backendCategories.map(fromBackendCategory);
  }

  async saveCategory(categoryName: string): Promise<void> {
    const backendCategory = toBackendCategory(categoryName);
    await this.actor.saveCategory(backendCategory);
  }

  async renameCategory(oldName: string, newName: string): Promise<void> {
    await this.actor.updateCategoryName(oldName, newName);
  }

  async deleteCategory(categoryName: string): Promise<void> {
    const backendCategory = toBackendCategory(categoryName);
    await this.actor.deleteCategory(backendCategory.id);
  }
}
