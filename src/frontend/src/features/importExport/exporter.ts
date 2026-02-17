import { Prompt } from '../prompts/types';
import { ExportData } from './schema';

export function exportPrompts(prompts: Prompt[], categories: string[]): void {
  const data: ExportData = {
    version: '1.0',
    prompts,
    categories,
    exportDate: Date.now(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `prompt-library-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
