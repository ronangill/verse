import { Columns3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ColumnToggleProps {
  columns: { id: string; label: string }[];
  isVisible: (id: string) => boolean;
  toggle: (id: string) => void;
}

export function ColumnToggle({ columns, isVisible, toggle }: ColumnToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="bg-muted/50 flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5">
          <Columns3 className="text-muted-foreground h-3.5 w-3.5" />
          <span className="text-muted-foreground text-xs">Columns</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={isVisible(col.id)}
            onCheckedChange={() => {
              toggle(col.id);
            }}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
