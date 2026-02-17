import { Prompt } from '../prompts/types';

const STORAGE_KEY = 'prompt-library-data';

export interface StorageData {
  prompts: Prompt[];
  categories: string[];
  viewMode: string;
}

export function loadFromStorage(): StorageData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

export function saveToStorage(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}
