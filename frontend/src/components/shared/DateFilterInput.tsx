import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  isoToDisplayDate,
  displayToIsoDate,
  maskDateInput,
  formatEcuadorDateYMD,
} from '@/utils/date';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover';

export interface DateFilterInputProps {
  value: string; // Formato ISO: YYYY-MM-DD o ''
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  align?: 'left' | 'right';
  'aria-label'?: string;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export function DateFilterInput({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  className,
  disabled = false,
  id,
  align = 'left',
  'aria-label': ariaLabel,
}: DateFilterInputProps) {
  const [displayText, setDisplayText] = useState<string>(() => isoToDisplayDate(value));
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fecha para navegar en el popover del calendario (año y mes)
  const [viewYear, setViewYear] = useState<number>(() => {
    if (value) {
      const parts = value.split('-');
      if (parts[0]) return parseInt(parts[0], 10);
    }
    return new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (value) {
      const parts = value.split('-');
      if (parts[1]) return parseInt(parts[1], 10) - 1;
    }
    return new Date().getMonth();
  });

  // Sincronizar texto cuando value cambie externamente (ej. reset o preset)
  useEffect(() => {
    setDisplayText(isoToDisplayDate(value));
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const oldCursor = input.selectionStart || 0;
    const prevLength = displayText.length;
    const raw = input.value;
    const isAtEnd = oldCursor >= prevLength;

    const masked = maskDateInput(raw);
    setDisplayText(masked);

    // Calcular posición inteligente del cursor para evitar saltos o quedar atrapado tras la barra
    let newCursor: number;
    if (isAtEnd) {
      newCursor = masked.length;
    } else {
      newCursor = oldCursor;
      if ((newCursor === 2 && masked[2] === '/') || (newCursor === 5 && masked[5] === '/')) {
        newCursor += 1;
      }
      newCursor = Math.min(newCursor, masked.length);
    }

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursor, newCursor);
      }
    });

    if (!masked) {
      onChange('');
      return;
    }

    if (masked.length === 10) {
      const iso = displayToIsoDate(masked);
      if (iso) {
        onChange(iso);
        const parts = iso.split('-');
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const input = inputRef.current;
      if (!input) return;
      const { selectionStart, selectionEnd } = input;
      // Si el cursor está justo tras una barra sin selección ("21/|10/2026"), borrar el dígito previo a la barra
      if (selectionStart === selectionEnd && (selectionStart === 3 || selectionStart === 6)) {
        e.preventDefault();
        const prev = displayText;
        const newText = prev.slice(0, selectionStart - 2) + prev.slice(selectionStart - 1);
        const masked = maskDateInput(newText);
        setDisplayText(masked);
        const newPos = selectionStart - 2;
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(newPos, newPos);
          }
        });
      }
    }
  };

  const handleBlur = () => {
    if (!displayText) {
      onChange('');
      return;
    }
    const iso = displayToIsoDate(displayText);
    if (iso) {
      onChange(iso);
      setDisplayText(isoToDisplayDate(iso));
    } else {
      setDisplayText(isoToDisplayDate(value));
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayText('');
    onChange('');
    setIsOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (dayDate: Date) => {
    const iso = formatEcuadorDateYMD(dayDate);
    onChange(iso);
    setDisplayText(isoToDisplayDate(iso));
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const todayIso = formatEcuadorDateYMD();
    onChange(todayIso);
    setDisplayText(isoToDisplayDate(todayIso));
    setIsOpen(false);
  };

  // Generar la cuadrícula de días para el mes
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Domingo
    const startOffset = (firstDayIndex + 6) % 7; // Lunes = 0, Domingo = 6
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{ dayNumber: number; isCurrentMonth: boolean; date: Date; isSelected: boolean; isToday: boolean }> = [];
    const todayIso = formatEcuadorDateYMD();

    // Días del mes anterior
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      const date = new Date(viewYear, viewMonth - 1, d, 12, 0, 0);
      const iso = formatEcuadorDateYMD(date);
      days.push({
        dayNumber: d,
        isCurrentMonth: false,
        date,
        isSelected: iso === value,
        isToday: iso === todayIso,
      });
    }

    // Días del mes actual
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d, 12, 0, 0);
      const iso = formatEcuadorDateYMD(date);
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        date,
        isSelected: iso === value,
        isToday: iso === todayIso,
      });
    }

    // Días del mes siguiente
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(viewYear, viewMonth + 1, d, 12, 0, 0);
      const iso = formatEcuadorDateYMD(date);
      days.push({
        dayNumber: d,
        isCurrentMonth: false,
        date,
        isSelected: iso === value,
        isToday: iso === todayIso,
      });
    }

    return days;
  }, [viewYear, viewMonth, value]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div
          className={cn('relative inline-flex items-center w-[148px] sm:w-[154px] select-none', className)}
        >
          {/* Botón de Calendario: SOLO este botón abre/cierra el popover */}
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors z-10 cursor-pointer',
                isOpen
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              )}
              title="Abrir calendario"
              aria-label="Abrir calendario"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>

          {/* Input de texto con formato dd/mm/aaaa: Puro campo de texto, al escribir o hacer click NO abre el calendario */}
          <input
            ref={inputRef}
            type="text"
            id={id}
            aria-label={ariaLabel}
            disabled={disabled}
            value={displayText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={12}
            className={cn(
              'w-full h-9 text-xs sm:text-sm pl-8 pr-7 font-normal',
              'bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg',
              'text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400',
              'focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900',
              'transition-all duration-150',
              isOpen && 'ring-1 ring-emerald-500 border-emerald-500 bg-white dark:bg-zinc-900',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />

          {/* Botón Clear (X) a la Derecha */}
          {displayText && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors z-10"
              title="Borrar fecha"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </PopoverAnchor>

      {/* Popover del Calendario: Renderizado a través de PopoverPortal directo en el document.body */}
      <PopoverContent
        align={align === 'right' ? 'end' : 'start'}
        side="bottom"
        sideOffset={6}
        className="w-[280px] p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 select-none z-50"
      >
        {/* Cabecera del Calendario: Mes, Año y Controles */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 select-none">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Días de la semana en Español */}
        <div className="grid grid-cols-7 mb-1.5 text-center">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 py-0.5 select-none"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Cuadrícula de días */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((d, index) => {
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectDay(d.date)}
                className={cn(
                  'h-8 w-8 mx-auto text-xs font-medium rounded-lg flex items-center justify-center transition-all cursor-pointer select-none',
                  d.isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs hover:bg-emerald-700'
                    : d.isToday
                    ? 'ring-2 ring-emerald-500/80 text-emerald-600 font-bold bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100'
                    : d.isCurrentMonth
                    ? 'text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
                    : 'text-zinc-300 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:text-zinc-500'
                )}
              >
                {d.dayNumber}
              </button>
            );
          })}
        </div>

        {/* Pie del Calendario: Atajos rápidos */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={handleSelectToday}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline py-0.5 cursor-pointer"
          >
            Seleccionar Hoy
          </button>

          <div className="flex items-center gap-2">
            {displayText && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-medium text-rose-500 hover:text-rose-600 hover:underline py-0.5 cursor-pointer"
              >
                Limpiar
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 py-0.5 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
