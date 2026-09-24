import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }

    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

export const toast = {
  success: (title: string, message?: string, options?: { action?: ToastAction; duration?: number }) =>
    useToastStore.getState().addToast({ type: 'success', title, message, ...options }),
  error: (title: string, message?: string, options?: { action?: ToastAction; duration?: number }) =>
    useToastStore.getState().addToast({ type: 'error', title, message, ...options }),
  info: (title: string, message?: string, options?: { action?: ToastAction; duration?: number }) =>
    useToastStore.getState().addToast({ type: 'info', title, message, ...options }),
  warning: (title: string, message?: string, options?: { action?: ToastAction; duration?: number }) =>
    useToastStore.getState().addToast({ type: 'warning', title, message, ...options }),
};
