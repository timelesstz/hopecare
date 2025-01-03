import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type ComparisonPeriod = 'previous' | 'year' | 'quarter' | 'none';

interface ComparisonSelectorProps {
  value: ComparisonPeriod;
  onChange: (period: ComparisonPeriod) => void;
}

const COMPARISON_OPTIONS = [
  { value: 'previous', label: 'Previous Period' },
  { value: 'year', label: 'Year Over Year' },
  { value: 'quarter', label: 'Quarter Over Quarter' },
  { value: 'none', label: 'No Comparison' },
] as const;

export function ComparisonSelector({ value, onChange }: ComparisonSelectorProps) {
  const selectedOption = COMPARISON_OPTIONS.find(option => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span>Compare: {selectedOption?.label}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {COMPARISON_OPTIONS.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex items-center justify-between"
          >
            {option.label}
            {value === option.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
