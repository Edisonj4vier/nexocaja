import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ClientWizardDialog } from '../ClientWizardDialog';

describe('ClientWizardDialog component', () => {
  const mockClient = {
    id: 'client-1',
    identificationType: 'Cédula',
    identificationNumber: '1752466951',
    firstName: 'Santiago',
    lastName: 'Guerrero',
    phone: '0991234567',
    email: 'santiago@example.com',
    occupation: 'Empleado',
    profession: 'Ingeniero',
    employerCompany: 'Tech Corp',
    monthlyIncome: 500,
    memberType: 'ACTIVO',
    agency: 'Matriz',
    totalContributions: 20,
  } as any;

  it('renders in edit mode and allows navigating through all 4 steps without premature saving', async () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <MemoryRouter>
        <ClientWizardDialog
          open={true}
          onOpenChange={onOpenChange}
          client={mockClient}
          onSubmit={onSubmit}
          isLoading={false}
        />
      </MemoryRouter>
    );

    // Initial: Step 1
    expect(screen.getByText(/Actualizar Ficha de Socio/i)).toBeInTheDocument();
    expect(screen.getByText(/Paso 1 de 4/i)).toBeInTheDocument();

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    await waitFor(() => {
      expect(screen.getByText(/Paso 2 de 4/i)).toBeInTheDocument();
    });

    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    await waitFor(() => {
      expect(screen.getByText(/Paso 3 de 4/i)).toBeInTheDocument();
    });

    // We are on Step 3
    expect(onSubmit).not.toHaveBeenCalled();

    // Advance to Step 4
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    await waitFor(() => {
      expect(screen.getByText(/Paso 4 de 4/i)).toBeInTheDocument();
    });

    // Should NOT have submitted yet!
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();

    // Now click Guardar Cambios on Step 4
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('pressing Enter on Step 3 input advances to Step 4 without submitting', async () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <MemoryRouter>
        <ClientWizardDialog
          open={true}
          onOpenChange={onOpenChange}
          client={mockClient}
          onSubmit={onSubmit}
          isLoading={false}
        />
      </MemoryRouter>
    );

    // Jump to Step 3 by clicking the step button
    fireEvent.click(screen.getByText(/Socioeconómico/i));
    await waitFor(() => {
      expect(screen.getByText(/Paso 3 de 4/i)).toBeInTheDocument();
    });

    // Find monthlyIncome input
    const incomeInput = screen.getByPlaceholderText(/Ej. 850.00/i);
    fireEvent.change(incomeInput, { target: { value: '5000' } });

    // Press Enter in input
    fireEvent.keyDown(incomeInput, { key: 'Enter', code: 'Enter' });

    // It should advance to Step 4 and NOT submit!
    await waitFor(() => {
      expect(screen.getByText(/Paso 4 de 4/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
