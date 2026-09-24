import React from 'react';
import { useToastStore, type ToastItem } from '@/stores/toast.store';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notificaciones"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-2.5 max-w-md w-[calc(100%-2.5rem)] pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onClose: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose }) => {
  const { type, title, message, action } = toast;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isWarning = type === 'warning';

  const borderColor = isSuccess
    ? 'border-emerald-500/50 dark:border-emerald-500/30'
    : isError
    ? 'border-rose-500/50 dark:border-rose-500/30'
    : isWarning
    ? 'border-amber-500/50 dark:border-amber-500/30'
    : 'border-slate-300 dark:border-zinc-700';

  const bgColor = isSuccess
    ? 'bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100'
    : isError
    ? 'bg-rose-50/90 dark:bg-rose-950/90 text-rose-950 dark:text-rose-100'
    : isWarning
    ? 'bg-amber-50/90 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100'
    : 'bg-white/95 dark:bg-zinc-900/95 text-slate-900 dark:text-zinc-100';

  const IconComponent = isSuccess
    ? CheckCircle2
    : isError
    ? AlertCircle
    : isWarning
    ? AlertTriangle
    : Info;

  const iconColor = isSuccess
    ? 'text-emerald-600 dark:text-emerald-400'
    : isError
    ? 'text-rose-600 dark:text-rose-400'
    : isWarning
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-sky-600 dark:text-sky-400';

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${borderColor} ${bgColor}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <IconComponent className={`w-5 h-5 ${iconColor}`} />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs sm:text-sm font-bold leading-tight">{title}</h4>
        {message && (
          <p className="text-xs mt-1 text-slate-600 dark:text-zinc-300 leading-snug">
            {message}
          </p>
        )}
        {action && (
          <div className="mt-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className="text-xs h-7 px-3 font-semibold bg-white dark:bg-zinc-800 shadow-2xs hover:bg-slate-100 dark:hover:bg-zinc-700"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex-shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
