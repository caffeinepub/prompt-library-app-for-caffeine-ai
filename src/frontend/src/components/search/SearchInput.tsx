import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createInputPasteHandler } from '../../features/paste/cleanPasteHandlers';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const handlePaste = createInputPasteHandler(onChange, () => value);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search prompts by title, content, or category..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        className="pl-10"
      />
    </div>
  );
}
