import { Prompt } from '../prompts/types';
import { validateImportData } from './schema';
import { generateId } from '../prompts/id';

export async function importPrompts(
  file: File,
  existingPrompts: Prompt[]
): Promise<{ prompts: Prompt[]; categories: string[]; error?: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!validateImportData(data)) {
      return { prompts: [], categories: [], error: 'Invalid file format' };
    }

    const existingIds = new Set(existingPrompts.map((p) => p.id));
    const importedPrompts = data.prompts.map((p) => {
      // If ID collision, generate new ID
      if (existingIds.has(p.id)) {
        return { ...p, id: generateId() };
      }
      return p;
    });

    return {
      prompts: importedPrompts,
      categories: data.categories || [],
    };
  } catch (error) {
    return {
      prompts: [],
      categories: [],
      error: error instanceof Error ? error.message : 'Failed to import file',
    };
  }
}
