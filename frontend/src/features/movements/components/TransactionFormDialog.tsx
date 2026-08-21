import { useState, useEffect } from 'react';
import type { Account } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownToLine, ArrowUpFromLine, Search, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'deposit' | 'withdrawal';
  onSubmit: (data: { accountId: string; amount: number; observations?: string }) => Promise<boolean>;
  isLoading: boolean;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  type,
  onSubmit,
  isLoading,
}: TransactionFormDialogProps) {
  const [accountSearch, setAccountSearch] = useState('');
  const [foundAccount, setFoundAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState('');
  const [observations, setObservations] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Reset internal state when dialog opens or closes
  useEffect(() => {
    if (open) {
      setAccountSearch('');
      setFoundAccount(null);
      setAmount('');
      setObservations('');
      setSearchError('');
      setIsSearching(false);
    }
  }, [open]);

  const searchAccount = async () => {
    if (!accountSearch.trim()) {
      setSearchError('Por favor ingresa un número de cuenta');
      return;
    }

    try {
      setIsSearching(true);
      setSearchError('');
      setFoundAccount(null);

      const response = await api.get('/accounts', {
        params: { accountNumber: accountSearch.trim() },
      });
      const data = response.data;
      const accounts = Array.isArray(data) ? data : data.data || [];

      if (accounts.length > 0) {
        const acc = accounts[0];
        if (acc.status === 'INACTIVE' || acc.status === 'BLOCKED') {
          setSearchError(`La cuenta está ${acc.status === 'BLOCKED' ? 'bloqueada' : 'inactiva'}`);
        } else {
          setFoundAccount(acc);
        }
      } else {
        setSearchError('No se encontró ninguna cuenta con ese número');
      }
    } catch {
      setSearchError('Error al buscar la cuenta en el servidor');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundAccount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (type === 'withdrawal' && parsedAmount > Number(foundAccount.balance)) {
      setSearchError(`Saldo insuficiente. El saldo disponible es $${Number(foundAccount.balance).toFixed(2)}`);
      return;
    }

    const payload: { accountId: string; amount: number; observations?: string } = {
      accountId: foundAccount.id,
      amount: parsedAmount,
    };
    if (observations.trim()) {
      payload.observations = observations.trim();
    }

    const success = await onSubmit(payload);
    if (success) {
      onOpenChange(false);
    }
  };

  const isDeposit = type === 'deposit';
  const parsedAmount = parseFloat(amount);
  const isInsufficient = !isDeposit && foundAccount && !isNaN(parsedAmount) && parsedAmount > Number(foundAccount.balance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDeposit ? (
              <>
                <ArrowDownToLine className="h-5 w-5 text-green-600" />
                Registrar Depósito
              </>
            ) : (
              <>
                <ArrowUpFromLine className="h-5 w-5 text-rose-600" />
                Registrar Retiro
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Account search */}
          <div className="space-y-2">
            <Label htmlFor="accountSearchInput">Buscar Cuenta</Label>
            <div className="flex gap-2">
              <Input
                id="accountSearchInput"
                placeholder="Número de cuenta (ej. 8885400285)..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchAccount();
                  }
                }}
                disabled={isSearching}
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={searchAccount}
                disabled={isSearching || !accountSearch.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {searchError && (
              <div className="flex items-center gap-1.5 text-sm text-red-500 mt-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* Found account details */}
          {foundAccount && (
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-1.5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Cuenta Titular:</p>
                  <p className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {foundAccount.accountNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 font-medium">Saldo Disponible:</p>
                  <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                    ${Number(foundAccount.balance).toFixed(2)}
                  </p>
                </div>
              </div>

              {foundAccount.client && (
                <div className="pt-1 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
                  <span className="font-medium">Cliente:</span> {foundAccount.client.firstName} {foundAccount.client.lastName} ({foundAccount.client.identificationNumber})
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amountInput">Monto ($)</Label>
            <Input
              id="amountInput"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!foundAccount}
            />
            {isInsufficient && (
              <p className="text-xs text-rose-500">
                El monto a retirar supera el saldo disponible (${Number(foundAccount?.balance).toFixed(2)}).
              </p>
            )}
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="obsInput">
              Observaciones <span className="text-zinc-400 text-xs">(Opcional)</span>
            </Label>
            <Input
              id="obsInput"
              placeholder="Notas de la transacción..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              disabled={!foundAccount}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!foundAccount || !amount || parseFloat(amount) <= 0 || isInsufficient || isLoading}
              className={isDeposit ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              variant={isDeposit ? 'default' : 'destructive'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : isDeposit ? (
                'Registrar Depósito'
              ) : (
                'Registrar Retiro'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
