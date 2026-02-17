import React from 'react';
import { LayoutList, LayoutGrid, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewMode } from '../../features/prompts/types';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex gap-1 border rounded-lg p-1">
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
}
