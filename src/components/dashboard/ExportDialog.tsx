import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { reportService } from '@/services/reportService';
import type { AnalyticsDateRange } from '@/services/analyticsService';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: AnalyticsDateRange;
}

const REPORT_SECTIONS = [
  { id: 'summary', label: 'Summary Metrics' },
  { id: 'trends', label: 'Donation Trends' },
  { id: 'projects', label: 'Project Distribution' },
  { id: 'donors', label: 'Donor Analysis' },
  { id: 'retention', label: 'Donor Retention' },
  { id: 'growth', label: 'Growth Analysis' },
];

export function ExportDialog({ isOpen, onClose, dateRange }: ExportDialogProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('csv');
  const [includeComparison, setIncludeComparison] = useState(true);
  const [selectedSections, setSelectedSections] = useState<string[]>(
    REPORT_SECTIONS.map(s => s.id)
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await reportService.generateReport(dateRange, {
        format,
        sections: selectedSections,
        includeComparison,
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${dateRange.startDate.toISOString().split('T')[0]}-to-${
        dateRange.endDate.toISOString().split('T')[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700">Format</label>
            <div className="mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                />
                <span className="ml-2">CSV</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                />
                <span className="ml-2">JSON</span>
              </label>
            </div>
          </div>

          {/* Comparison Option */}
          <div>
            <label className="inline-flex items-center">
              <Checkbox
                checked={includeComparison}
                onCheckedChange={() => setIncludeComparison(!includeComparison)}
              />
              <span className="ml-2 text-sm text-gray-700">
                Include comparison with previous period
              </span>
            </label>
          </div>

          {/* Section Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Include Sections
            </label>
            <div className="mt-2 space-y-2">
              {REPORT_SECTIONS.map(section => (
                <label key={section.id} className="inline-flex items-center">
                  <Checkbox
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {section.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedSections.length === 0}
          >
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
