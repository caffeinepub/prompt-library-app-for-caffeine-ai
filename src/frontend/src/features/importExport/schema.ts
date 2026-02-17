import { Prompt } from '../prompts/types';

export interface ExportData {
  version: string;
  prompts: Prompt[];
  categories: string[];
  exportDate: number;
}

export function validateImportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  if (!Array.isArray(obj.prompts)) return false;
  
  return obj.prompts.every((p: unknown) => {
    if (!p || typeof p !== 'object') return false;
    const prompt = p as Record<string, unknown>;
    return (
      typeof prompt.id === 'string' &&
      typeof prompt.title === 'string' &&
      typeof prompt.content === 'string' &&
      Array.isArray(prompt.categories) &&
      typeof prompt.isFavorite === 'boolean' &&
      typeof prompt.dateAdded === 'number' &&
      typeof prompt.dateModified === 'number'
    );
  });
}
