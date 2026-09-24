import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionVoucherModal } from '../TransactionVoucherModal';
import type { TransactionVoucher } from '@/types';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('TransactionVoucherModal', () => {
  const mockVoucher: TransactionVoucher = {
    id: 'mov-1234',
    documentNumber: 'VCH-2026-A1B2C3D4',
    type: 'DEPOSIT',
    amount: 250,
    previousBalance: 500,
    newBalance: 750,
    observations: 'Depósito inicial para ahorro',
    createdAt: '2026-09-23T14:30:00.000Z',
    accountId: 'acc-1',
    accountNumber: '210100000001',
    productName: 'Ahorro a la Vista',
    agency: 'Matriz',
    clientId: 'cli-1',
    clientName: 'Edison Javier Rochina',
    cashierName: 'Juan Pérez',
  };

  it('renders nothing when closed or voucher is null', () => {
    const { container } = render(
      <TransactionVoucherModal
        open={false}
        onOpenChange={vi.fn()}
        voucher={null}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders deposit voucher with correct banking elements and QR note', () => {
    render(
      <TransactionVoucherModal
        open={true}
        onOpenChange={vi.fn()}
        voucher={mockVoucher}
      />,
    );

    expect(screen.getByText('¡Depósito exitoso!')).toBeInTheDocument();
    expect(screen.getByText('$250.00')).toBeInTheDocument();
    expect(screen.getByText(/Edison Javier Rochina/i)).toBeInTheDocument();
    expect(screen.getByText('210100000001')).toBeInTheDocument();
    expect(screen.getByText('VCH-2026-A1B2C3D4')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('$750.00')).toBeInTheDocument();
    expect(screen.getByText(/Verificar la transacción con este QR/i)).toBeInTheDocument();
    expect(screen.getByText('Imprimir')).toBeInTheDocument();
    expect(screen.getByText('Descargar PDF')).toBeInTheDocument();
  });

  it('renders withdrawal voucher title appropriately', () => {
    const withdrawalVoucher: TransactionVoucher = {
      ...mockVoucher,
      type: 'WITHDRAWAL',
      amount: 100,
      previousBalance: 750,
      newBalance: 650,
    };

    render(
      <TransactionVoucherModal
        open={true}
        onOpenChange={vi.fn()}
        voucher={withdrawalVoucher}
      />,
    );

    expect(screen.getByText('¡Retiro exitoso!')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });
});
