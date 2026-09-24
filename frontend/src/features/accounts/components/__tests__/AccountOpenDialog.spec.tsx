import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountOpenDialog } from '../AccountOpenDialog';

vi.mock('@/features/accounts/hooks/useFinancialProducts', () => ({
  useFinancialProducts: () => ({
    products: [
      {
        id: 'p-1',
        code: 'AH-BASICA',
        name: 'Ahorro Básico',
        interestRate: 2.5,
        minOpeningAmount: 10,
        status: 'ACTIVE',
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('AccountOpenDialog component', () => {
  it('renders step 1 safely without throwing products.find error', () => {
    render(
      <AccountOpenDialog
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Apertura de Cuenta Financiera/i)).toBeInTheDocument();
    expect(screen.getByText(/Paso 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Buscar Socio por Cédula/i)).toBeInTheDocument();
  });

  it('preselects client when preselectedClient prop is provided', () => {
    const mockClient = {
      id: 'client-1',
      memberCode: 'SOC-000001',
      firstName: 'Edison',
      lastName: 'Pérez',
      identificationNumber: '1712345678',
    } as any;

    render(
      <AccountOpenDialog
        open={true}
        onOpenChange={vi.fn()}
        preselectedClient={mockClient}
      />
    );

    expect(screen.getByText('Pérez Edison')).toBeInTheDocument();
    expect(screen.getByText('SOC-000001')).toBeInTheDocument();
  });
});
