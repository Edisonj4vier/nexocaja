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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Client } from '@/types';
import {
  User,
  Phone,
  Briefcase,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

const clientSchema = z.object({
  // Step 1: Personal
  personType: z.enum(['NATURAL', 'LEGAL']),
  identificationType: z.string().min(1, 'Seleccione tipo de identificación'),
  identificationNumber: z.string().min(8, 'Debe tener al menos 8 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().default('Ecuatoriana'),

  // Step 2: Contact
  phone: z.string().min(7, 'El teléfono principal es requerido'),
  secondaryPhone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  province: z.string().optional(),
  city: z.string().optional(),
  parish: z.string().optional(),
  address: z.string().optional(),
  addressReference: z.string().optional(),

  // Step 3: Socioeconomic
  occupation: z.string().optional(),
  profession: z.string().optional(),
  employerCompany: z.string().optional(),
  monthlyIncome: z.number().min(0).optional(),
  economicActivity: z.string().optional(),
  workAddress: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),

  // Step 4: Member
  memberType: z.string().default('ACTIVO'),
  agency: z.string().default('Matriz'),
  totalContributions: z.number().min(0).default(0),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const STEPS = [
  { id: 1, title: 'Datos Personales', icon: User },
  { id: 2, title: 'Contacto y Domicilio', icon: Phone },
  { id: 3, title: 'Socioeconómico', icon: Briefcase },
  { id: 4, title: 'Afiliación de Socio', icon: ShieldCheck },
];

export function ClientWizardDialog({
  open,
  onOpenChange,
  client,
  onSubmit,
  isLoading,
}: ClientWizardDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      personType: 'NATURAL',
      identificationType: 'Cédula',
      identificationNumber: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'MASCULINO',
      maritalStatus: 'SOLTERO',
      nationality: 'Ecuatoriana',
      phone: '',
      secondaryPhone: '',
      email: '',
      province: 'Pichincha',
      city: 'Quito',
      parish: '',
      address: '',
      addressReference: '',
      occupation: '',
      profession: '',
      employerCompany: '',
      monthlyIncome: 0,
      economicActivity: '',
      workAddress: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      memberType: 'ACTIVO',
      agency: 'Matriz',
      totalContributions: 0,
    },
  });

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      if (client) {
        form.reset({
          personType: client.personType || 'NATURAL',
          identificationType: client.identificationType || 'Cédula',
          identificationNumber: client.identificationNumber || '',
          firstName: client.firstName || '',
          lastName: client.lastName || '',
          birthDate: client.birthDate ? client.birthDate.split('T')[0] : '',
          gender: client.gender || 'MASCULINO',
          maritalStatus: client.maritalStatus || 'SOLTERO',
          nationality: client.nationality || 'Ecuatoriana',
          phone: client.phone || '',
          secondaryPhone: client.secondaryPhone || '',
          email: client.email || '',
          province: client.province || 'Pichincha',
          city: client.city || 'Quito',
          parish: client.parish || '',
          address: client.address || '',
          addressReference: client.addressReference || '',
          occupation: client.occupation || '',
          profession: client.profession || '',
          employerCompany: client.employerCompany || '',
          monthlyIncome: Number(client.monthlyIncome || 0),
          economicActivity: client.economicActivity || '',
          workAddress: client.workAddress || '',
          emergencyContactName: client.emergencyContactName || '',
          emergencyContactRelationship: client.emergencyContactRelationship || '',
          emergencyContactPhone: client.emergencyContactPhone || '',
          memberType: client.memberType || 'ACTIVO',
          agency: client.agency || 'Matriz',
          totalContributions: Number(client.totalContributions || 0),
        });
      } else {
        form.reset();
      }
    }
  }, [open, client, form]);

  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await form.trigger([
        'personType',
        'identificationType',
        'identificationNumber',
        'firstName',
        'lastName',
      ]);
    } else if (currentStep === 2) {
      isValid = await form.trigger(['phone', 'email']);
    } else {
      isValid = true;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onFormSubmit = async (values: ClientFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              {client ? 'Actualizar Ficha de Socio' : 'Registro de Nuevo Socio'}
            </DialogTitle>
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
              Paso {currentStep} de 4
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Expediente integral del socio para operaciones de ahorro, créditos y aportaciones.
          </p>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 pt-4">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <button
                  type="button"
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : isCompleted
                      ? 'text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800'
                      : 'text-slate-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                  </div>
                  <span className="hidden sm:inline truncate">{step.title}</span>
                </button>
              );
            })}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6 pt-2">
            {/* STEP 1: INFORMACIÓN PERSONAL */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="personType"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-semibold">Tipo de Persona *</FormLabel>
                      <div className="flex gap-2 pt-1">
                        <Button
                          type="button"
                          variant={field.value === 'NATURAL' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => field.onChange('NATURAL')}
                          className={`text-xs h-8 ${
                            field.value === 'NATURAL'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'text-slate-600'
                          }`}
                        >
                          Persona Natural
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === 'LEGAL' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => field.onChange('LEGAL')}
                          className={`text-xs h-8 ${
                            field.value === 'LEGAL'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'text-slate-600'
                          }`}
                        >
                          Persona Jurídica (Empresa/Organización)
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="identificationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Tipo de Identificación *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cédula">Cédula de Identidad</SelectItem>
                            <SelectItem value="RUC">RUC</SelectItem>
                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="identificationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Número de Identificación *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 1712345678" {...field} className="h-9 font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Apellidos *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Pérez Gómez" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Nombres *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Edison Javier" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Fecha de Nacimiento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Género</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MASCULINO">Masculino</SelectItem>
                            <SelectItem value="FEMENINO">Femenino</SelectItem>
                            <SelectItem value="OTRO">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Estado Civil</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SOLTERO">Soltero/a</SelectItem>
                            <SelectItem value="CASADO">Casado/a</SelectItem>
                            <SelectItem value="UNION_LIBRE">Unión Libre</SelectItem>
                            <SelectItem value="DIVORCIADO">Divorciado/a</SelectItem>
                            <SelectItem value="VIUDO">Viudo/a</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: CONTACTO Y DOMICILIO */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Teléfono Principal *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 0999999999" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondaryPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Teléfono Secundario / Convencional</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 022233444" {...field} className="h-9" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ejemplo@correo.com" {...field} className="h-9" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Provincia</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Pichincha" {...field} className="h-9" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Ciudad / Cantón</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Quito" {...field} className="h-9" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parish"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Parroquia</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. San Francisco" {...field} className="h-9" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Dirección de Domicilio</FormLabel>
                      <FormControl>
                        <Input placeholder="Calle Principal y Secundaria, N° de casa" {...field} className="h-9" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Referencia de Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="Frente a la farmacia / diagonal a la iglesia" {...field} className="h-9" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* STEP 3: SOCIOECONÓMICO Y REFERENCIAS */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Ocupación / Cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Empleado privado / Comerciante" {...field} className="h-9" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Profesión</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Ingeniero / Bachiller" {...field} className="h-9" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employerCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Empresa / Empleador</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre de la empresa o negocio" {...field} className="h-9" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Ingresos Mensuales Estimados (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Ej. 850.00" {...field} className="h-9" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-3">
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Contacto de Emergencia / Referencia Familiar
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px]">Nombres y Apellidos</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. María Gómez" {...field} className="h-8 text-xs" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px]">Parentesco</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Madre / Cónyuge" {...field} className="h-8 text-xs" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px]">Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 0988776655" {...field} className="h-8 text-xs" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: AFILIACIÓN DE SOCIO */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      SOC
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        Generación Automática de Expediente
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Al guardar, el sistema asignará el código de socio correlativo oficial (ej. <span className="font-mono font-bold">SOC-000101</span>).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="memberType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Tipo de Socio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVO">Socio Activo</SelectItem>
                            <SelectItem value="FUNDADOR">Socio Fundador</SelectItem>
                            <SelectItem value="HONORARIO">Socio Honorario</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Agencia de Registro</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9" readOnly />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="totalContributions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Aportación Social Inicial (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ej. 20.00" {...field} className="h-9" />
                      </FormControl>
                      <p className="text-[11px] text-slate-400">
                        Monto voluntario u obligatorio de capital social aportado al registrarse.
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-4">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevStep}
                  className="gap-1.5 text-xs"
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

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleNextStep}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-semibold"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-semibold shadow-xs"
                  >
                    {isLoading ? 'Guardando...' : client ? 'Guardar Cambios' : 'Registrar Socio'}
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
