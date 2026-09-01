import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModuleType = 'DASHBOARD' | 'ATENCION_CLIENTE' | 'CAJAS' | 'ADMINISTRACION' | 'REPORTES' | null;

interface UiState {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeModule: null,
      setActiveModule: (module) => set({ activeModule: module }),
    }),
    {
      name: 'nexocaja-ui-storage',
    }
  )
);
