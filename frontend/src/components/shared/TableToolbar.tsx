import { Input } from '@/components/ui/input';
import { Search, FileSpreadsheet, FileText, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateFilterInput } from './DateFilterInput';

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
  onReset?: () => void;
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
  onReset,
}: TableToolbarProps) {
  const hasActiveFilters = Boolean(search || startDate || endDate);

  const handleReset = () => {
    onSearchChange('');
    onStartDateChange('');
    onEndDateChange('');
    if (onReset) onReset();
  };

  return (
    <div className="relative z-30 flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs transition-all duration-200 hover:shadow-md">
      {/* Buscador general */}
      <div className="relative w-full sm:w-96 md:w-[440px] lg:max-w-[480px] group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200/60 dark:border-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900 transition-all rounded-lg text-xs sm:text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded transition-colors"
            title="Limpiar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filtros de Fecha (dd/mm/aaaa) y Botones de Acción */}
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Desde</span>
          <DateFilterInput
            value={startDate}
            onChange={onStartDateChange}
            placeholder="dd/mm/aaaa"
            aria-label="Fecha Desde"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Hasta</span>
          <DateFilterInput
            value={endDate}
            onChange={onEndDateChange}
            placeholder="dd/mm/aaaa"
            align="right"
            aria-label="Fecha Hasta"
          />
        </div>

        {/* Botón de Reset / Limpiar filtros */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-9 px-2.5 text-xs text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg gap-1.5 transition-all shadow-xs"
            title="Restablecer todos los filtros"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-medium">Limpiar</span>
          </Button>
        )}

        {/* Botones de Exportación */}
        {(onExportExcel || onExportPdf) && (
          <div className="flex items-center gap-1.5 ml-auto sm:ml-1 border-l border-zinc-200/60 dark:border-zinc-700/60 pl-2.5">
            {onExportExcel && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 rounded-lg text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20 transition-all shadow-xs"
                onClick={onExportExcel}
                disabled={isExporting}
                title="Exportar a Excel"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden md:inline font-medium">Excel</span>
              </Button>
            )}
            {onExportPdf && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 rounded-lg text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20 transition-all shadow-xs"
                onClick={onExportPdf}
                disabled={isExporting}
                title="Exportar a PDF"
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
