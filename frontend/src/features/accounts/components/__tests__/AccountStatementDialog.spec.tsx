import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AccountStatementDialog } from '../AccountStatementDialog';
import api from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('AccountStatementDialog', () => {
  const mockStatementData = {
    account: {
      id: 'acc-1',
      accountNumber: '210100000001',
      productName: 'Ahorro Ordinario',
      status: 'ACTIVE',
      agency: 'Matriz',
    },
    client: {
      id: 'cli-1',
      fullName: 'Edison Javier Rochina',
      identificationNumber: '1712345678',
      phone: '0991234567',
      address: 'Quito, Ecuador',
      memberCode: 'SOC-000001',
    },
    period: {
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    },
    conciliation: {
      saldoAnterior: 100,
      totalCreditos: 250,
      totalDebitos: 50,
      saldoActual: 300,
      saldoPromedio: 200,
    },
    movements: [
      {
        id: 'mov-1',
        date: '05-09-2026',
        time: '14:30:00',
        transaction: 'DEPÓSITO EN EFECTIVO',
        detail: 'Depósito en ventanilla matriz',
        document: 'VCH-2026-A1B2C3D4',
        debit: 0,
        credit: 250,
        balance: 350,
      },
    ],
  };

  it('renders statement with cooperative layout and conciliation box when opened', async () => {
    (api.get as any).mockResolvedValueOnce({ data: mockStatementData });

    render(
      <AccountStatementDialog
        open={true}
        onOpenChange={vi.fn()}
        accountId="acc-1"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('COOP. NEXOCAJA LTDA.')).toBeInTheDocument();
    });

    expect(screen.getByText('Estado de Cuenta Oficial')).toBeInTheDocument();
    expect(screen.getByText('ESTADO DE CUENTA')).toBeInTheDocument();
    expect(screen.getByText(/SALDO ANTERIOR:/i)).toBeInTheDocument();
    expect(screen.getByText(/SALDO ACTUAL:/i)).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getAllByText('VCH-2026-A1B2C3D4').length).toBeGreaterThan(0);
    expect(screen.getByText(/DEPÓSITO EN EFECTIVO/i)).toBeInTheDocument();
  });
});
