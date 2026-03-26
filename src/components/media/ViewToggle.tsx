import { Button } from '@/components/ui/button';
import { Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn('bg-muted/50 flex items-center gap-0.5 rounded-md p-0.5', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          onChange('grid');
        }}
        className={cn(
          'h-6 gap-1.5 px-2 text-xs transition-all',
          value === 'grid'
            ? 'border-input bg-background text-foreground border shadow-sm'
            : 'text-muted-foreground hover:text-foreground border border-transparent'
        )}
        aria-label="Grid view"
        aria-pressed={value === 'grid'}
      >
        <Grid3x3 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          onChange('list');
        }}
        className={cn(
          'h-6 gap-1.5 px-2 text-xs transition-all',
          value === 'list'
            ? 'border-input bg-background text-foreground border shadow-sm'
            : 'text-muted-foreground hover:text-foreground border border-transparent'
        )}
        aria-label="List view"
        aria-pressed={value === 'list'}
      >
        <List className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">List</span>
      </Button>
    </div>
  );
}
