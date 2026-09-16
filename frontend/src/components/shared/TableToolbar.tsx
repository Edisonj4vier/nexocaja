import { Input } from '@/components/ui/input';
import { Search, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TableToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  placeholder?: string;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isExporting?: boolean;
}

export function TableToolbar({
  search,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  placeholder = 'Buscar...',
  onExportExcel,
  onExportPdf,
  isExporting = false,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative w-full sm:w-96 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200/60 dark:border-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900 transition-all rounded-lg"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Desde</span>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-[145px] h-9 text-sm bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200/60 dark:border-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900 rounded-lg transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Hasta</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-[145px] h-9 text-sm bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200/60 dark:border-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900 rounded-lg transition-colors"
          />
        </div>

        {/* Export Buttons */}
        {(onExportExcel || onExportPdf) && (
          <div className="flex items-center gap-2 ml-auto sm:ml-2 border-l border-zinc-200/60 dark:border-zinc-700/60 pl-3">
            {onExportExcel && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 rounded-lg text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20 transition-all hover:shadow-sm"
                onClick={onExportExcel}
                disabled={isExporting}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden md:inline font-medium">Excel</span>
              </Button>
            )}
            {onExportPdf && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 rounded-lg text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20 transition-all hover:shadow-sm"
                onClick={onExportPdf}
                disabled={isExporting}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline font-medium">PDF</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
