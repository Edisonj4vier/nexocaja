import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFinancialProducts } from '../hooks/useFinancialProducts';
import type { Client } from '@/types';
import api from '@/lib/axios';
import {
  Wallet,
  User,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';

const beneficiarySchema = z.object({
  fullName: z.string().min(2, 'Nombre requerido'),
  identificationNumber: z.string().optional(),
  relationship: z.string().min(1, 'Parentesco requerido'),
  percentage: z.coerce.number().min(1).max(100),
});

const accountSchema = z.object({
  clientId: z.string().min(1, 'Debe seleccionar un socio'),
  productId: z.string().min(1, 'Debe seleccionar un producto financiero'),
  openingAmount: z.number().min(0).default(0),
  agency: z.string().default('Matriz'),
  beneficiaries: z.array(beneficiarySchema).default([]),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountOpenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClient?: Client | null;
  onSuccess?: () => void;
}

export function AccountOpenDialog({
  open,
  onOpenChange,
  preselectedClient,
  onSuccess,
}: AccountOpenDialogProps) {
  const [step, setStep] = useState(1);
  const { products } = useFinancialProducts();
  const productsList = Array.isArray(products) ? products : [];

  // Search clients state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Beneficiaries state
  const [beneficiaries, setBeneficiaries] = useState<
    Array<{ fullName: string; identificationNumber?: string; relationship: string; percentage: number }>
  >([]);
  const [newBenName, setNewBenName] = useState('');
  const [newBenRelation, setNewBenRelation] = useState('');
  const [newBenPercentage, setNewBenPercentage] = useState('100');

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      clientId: '',
      productId: '',
      openingAmount: 10,
      agency: 'Matriz',
      beneficiaries: [],
    },
  });

  useEffect(() => {
    if (open) {
      setStep(1);
      setBeneficiaries([]);
      if (preselectedClient) {
        setSelectedClient(preselectedClient);
        form.setValue('clientId', preselectedClient.id);
        setStep(2); // Jump to product selection
      } else {
        setSelectedClient(null);
        form.setValue('clientId', '');
      }
    }
  }, [open, preselectedClient, form]);

  // Search clients with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await api.get(`/clients?search=${encodeURIComponent(searchQuery)}&limit=5`);
          setSearchResults(res.data?.data || []);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    form.setValue('clientId', client.id);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddBeneficiary = () => {
    if (!newBenName || !newBenRelation || !newBenPercentage) return;
    const perc = Number(newBenPercentage);
    if (isNaN(perc) || perc <= 0) return;

    const updated = [
      ...beneficiaries,
      {
        fullName: newBenName,
        relationship: newBenRelation,
        percentage: perc,
      },
    ];
    setBeneficiaries(updated);
    form.setValue('beneficiaries', updated);
    setNewBenName('');
    setNewBenRelation('');
    setNewBenPercentage('0');
  };

  const handleRemoveBeneficiary = (index: number) => {
    const updated = beneficiaries.filter((_, i) => i !== index);
    setBeneficiaries(updated);
    form.setValue('beneficiaries', updated);
  };

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);

  const selectedProductId = form.watch('productId');
  const selectedProduct = productsList.find((p) => p.id === selectedProductId);

  const handleNext = async () => {
    if (step === 1) {
      if (!selectedClient) {
        form.setError('clientId', { message: 'Seleccione un socio' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedProductId) {
        form.setError('productId', { message: 'Seleccione un producto financiero' });
        return;
      }
      setStep(3);
    }
  };

  const handlePrev = () => {
    if (step === 2 && preselectedClient) return;
    if (step > 1) setStep((prev) => prev - 1);
  };

  const onSubmit = async (values: AccountFormValues) => {
    try {
      const payload = {
        ...values,
        beneficiaries,
      };
      await api.post('/accounts', payload);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al aperturar la cuenta');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Apertura de Cuenta Financiera
            </DialogTitle>
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
              Paso {step} de 3
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Asignación de producto financiero y libreta de ahorros sin redundancia de datos.
          </p>

          {/* Stepper Bar */}
          <div className="grid grid-cols-3 gap-2 pt-3">
            <div
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                step === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-400 bg-slate-50'
              }`}
            >
              <span>1. Titular Socio</span>
            </div>
            <div
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                step === 2 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-400 bg-slate-50'
              }`}
            >
              <span>2. Producto Financiero</span>
            </div>
            <div
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                step === 3 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-400 bg-slate-50'
              }`}
            >
              <span>3. Beneficiarios & Saldo</span>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            {/* PASO 1: SELECCIONAR SOCIO */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 block mb-1">
                    Buscar Socio por Cédula, Código o Nombres
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <Input
                      placeholder="Ej. 1712345678 o SOC-000101 o Edison Pérez..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>

                  {isSearching && (
                    <p className="text-[11px] text-slate-400 mt-1">Buscando socios...</p>
                  )}

                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
                      {searchResults.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectClient(c)}
                          className="p-3 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <p className="font-bold text-slate-800">
                              {c.lastName} {c.firstName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {c.identificationType}: {c.identificationNumber} • {c.memberCode || 'SOC-N/A'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50">
                            Seleccionar
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedClient && (
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {selectedClient.lastName} {selectedClient.firstName}
                        </p>
                        <p className="text-[11px] text-emerald-800 font-mono">
                          {selectedClient.identificationType}: {selectedClient.identificationNumber} • {selectedClient.memberCode}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white text-emerald-700 font-semibold text-[10px]">
                      Socio Verificado
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* PASO 2: PRODUCTO FINANCIERO */}
            {step === 2 && (
              <div className="space-y-4">
                {selectedClient && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Titular de la Cuenta:</span>
                      <strong className="text-slate-800">{selectedClient.lastName} {selectedClient.firstName}</strong>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {selectedClient.memberCode}
                    </Badge>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold text-slate-800 mb-2">
                    Selecciona el Producto Financiero de Ahorro:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productsList.map((prod) => {
                      const isSelected = form.watch('productId') === prod.id;
                      return (
                        <div
                          key={prod.id}
                          onClick={() => form.setValue('productId', prod.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[10px] font-bold text-slate-400">
                              {prod.code}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900">{prod.name}</h4>
                          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
                            <span className="text-slate-400">Tasa Interés:</span>
                            <strong className="text-emerald-700">{Number(prod.interestRate).toFixed(2)}%</strong>
                          </div>
                          <div className="flex justify-between text-[11px] mt-0.5">
                            <span className="text-slate-400">Mínimo Apertura:</span>
                            <span className="text-slate-700 font-semibold">${Number(prod.minOpeningAmount).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: CONFIGURACIÓN Y BENEFICIARIOS */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Producto</span>
                    <strong className="text-slate-800">{selectedProduct?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tasa de Interés</span>
                    <strong className="text-emerald-600">{Number(selectedProduct?.interestRate || 0).toFixed(2)}% anual</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Número de Cuenta</span>
                    <span className="font-mono text-slate-600 font-semibold">Generado al guardar</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Monto de Depósito Inicial (USD) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} className="h-9 font-bold text-emerald-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Agencia Emisora</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9" readOnly />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* BENEFICIARIOS */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Beneficiarios de la Cuenta</h4>
                      <p className="text-[10px] text-slate-400">Designación en caso de fallecimiento (opcional, debe sumar 100%).</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-semibold ${totalPercentage === 100 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700'}`}>
                      Total: {totalPercentage}%
                    </Badge>
                  </div>

                  {beneficiaries.length > 0 && (
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden text-xs">
                      {beneficiaries.map((b, i) => (
                        <div key={i} className="p-2.5 flex items-center justify-between bg-white">
                          <div>
                            <span className="font-bold text-slate-800">{b.fullName}</span>
                            <span className="text-slate-400 ml-2 font-medium">({b.relationship})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-700">{b.percentage}%</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBeneficiary(i)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Beneficiary row */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                    <Input
                      placeholder="Nombres completos"
                      value={newBenName}
                      onChange={(e) => setNewBenName(e.target.value)}
                      className="h-8 text-xs sm:col-span-2"
                    />
                    <Input
                      placeholder="Parentesco (ej. Cónyuge)"
                      value={newBenRelation}
                      onChange={(e) => setNewBenRelation(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        placeholder="%"
                        value={newBenPercentage}
                        onChange={(e) => setNewBenPercentage(e.target.value)}
                        className="h-8 text-xs w-16"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddBeneficiary}
                        className="h-8 px-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Stepper Buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              {step > 1 && (!preselectedClient || step > 2) ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleNext}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs font-semibold"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs font-semibold shadow-xs"
                  >
                    Aperturar Cuenta
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
