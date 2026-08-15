import { useEffect, useState } from 'react';
import { useCashRegister } from './hooks/useCashRegister';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Landmark, DoorOpen, DoorClosed } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CashRegisterPage() {
  const {
    currentRegister,
    isLoading,
    error,
    fetchCurrent,
    openRegister,
    closeRegister,
  } = useCashRegister();

  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [openObservations, setOpenObservations] = useState('');
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [closeObservations, setCloseObservations] = useState('');

  useEffect(() => {
    fetchCurrent();
  }, [fetchCurrent]);

  const handleOpen = async () => {
    const balance = parseFloat(openingBalance);
    if (isNaN(balance) || balance < 0) return;
    const success = await openRegister(balance, openObservations || undefined);
    if (success) {
      setIsOpenDialogOpen(false);
      setOpeningBalance('');
      setOpenObservations('');
    }
  };

  const handleClose = async () => {
    const success = await closeRegister(closeObservations || undefined);
    if (success) {
      setIsCloseConfirmOpen(false);
      setCloseObservations('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Caja Registradora
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gestiona la apertura y cierre de tu caja diaria.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-zinc-500 py-10">
          Consultando estado de caja...
        </div>
      ) : currentRegister ? (
        /* ===== CAJA ABIERTA ===== */
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Landmark className="h-5 w-5 text-emerald-500" />
                Caja Abierta
              </CardTitle>
              <StatusBadge status="OPEN" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                <div>
                  <p className="text-sm text-zinc-500">Saldo Inicial</p>
                  <p className="text-2xl font-bold">${Number(currentRegister.openingBalance).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Abierta Desde</p>
                  <p className="text-lg font-medium">
                    {new Date(currentRegister.openedAt).toLocaleString('es-EC')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Movimientos</p>
                  <p className="text-2xl font-bold">{currentRegister.movements?.length || 0}</p>
                </div>
                {currentRegister.observations && (
                  <div>
                    <p className="text-sm text-zinc-500">Observaciones</p>
                    <p className="text-sm">{currentRegister.observations}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            variant="destructive"
            size="lg"
            onClick={() => setIsCloseConfirmOpen(true)}
          >
            <DoorClosed className="mr-2 h-4 w-4" /> Cerrar Caja
          </Button>
        </div>
      ) : (
        /* ===== NO HAY CAJA ABIERTA ===== */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <DoorOpen className="h-16 w-16 text-zinc-300" />
            <h2 className="text-xl font-semibold text-zinc-600 dark:text-zinc-400">
              No hay una caja abierta
            </h2>
            <p className="text-sm text-zinc-500 max-w-md text-center">
              Debes abrir una caja con un saldo inicial antes de poder registrar depósitos y retiros.
            </p>
            <Button size="lg" onClick={() => setIsOpenDialogOpen(true)}>
              <DoorOpen className="mr-2 h-4 w-4" /> Abrir Caja
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Open Cash Register Dialog */}
      <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Abrir Caja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Saldo Inicial ($)</Label>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openObservations">Observaciones <span className="text-zinc-400 text-xs">(Opcional)</span></Label>
              <Input
                id="openObservations"
                placeholder="Notas al abrir..."
                value={openObservations}
                onChange={(e) => setOpenObservations(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleOpen} disabled={!openingBalance || isLoading}>
                {isLoading ? 'Abriendo...' : 'Abrir Caja'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Cash Register Confirm */}
      <Dialog open={isCloseConfirmOpen} onOpenChange={setIsCloseConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cerrar Caja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              ¿Estás seguro de cerrar la caja? Se calculará el saldo final automáticamente.
            </p>
            <div className="space-y-2">
              <Label htmlFor="closeObservations">Observaciones <span className="text-zinc-400 text-xs">(Opcional)</span></Label>
              <Input
                id="closeObservations"
                placeholder="Notas al cerrar..."
                value={closeObservations}
                onChange={(e) => setCloseObservations(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCloseConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleClose} disabled={isLoading}>
                {isLoading ? 'Cerrando...' : 'Cerrar Caja'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
