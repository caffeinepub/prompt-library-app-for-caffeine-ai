import React, { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePromptStore } from '../../features/prompts/promptStore';
import { useCategoryStore } from '../../features/categories/categoryStore';
import { exportPrompts } from '../../features/importExport/exporter';
import { importPrompts } from '../../features/importExport/importer';
import { toast } from 'sonner';

export function ImportExportControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prompts = usePromptStore((state) => state.prompts);
  const setPrompts = usePromptStore((state) => state.setPrompts);
  const categories = useCategoryStore((state) => state.categories);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    exportPrompts(prompts, categories);
    toast.success('Prompts exported successfully');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importPrompts(file, prompts);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        setPrompts([...prompts, ...result.prompts]);
        result.categories.forEach((cat) => addCategory(cat));
        toast.success(`Imported ${result.prompts.length} prompt(s)`);
      }
    } catch (error) {
      toast.error('Failed to import file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" size="sm" onClick={handleImportClick} disabled={importing}>
        <Upload className="h-4 w-4 mr-2" />
        {importing ? 'Importing...' : 'Import'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
