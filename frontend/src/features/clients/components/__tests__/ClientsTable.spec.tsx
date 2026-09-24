import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ClientsTable } from '../ClientsTable';
import type { Client } from '@/types';

describe('ClientsTable component', () => {
  const mockClients: Client[] = [
    {
      id: 'c-1',
      memberCode: 'SOC-000001',
      personType: 'NATURAL' as any,
      identificationType: 'CEDULA',
      identificationNumber: '1712345678',
      firstName: 'Edison',
      lastName: 'Pérez',
      phone: '0987654321',
      email: 'edison@test.com',
      status: 'ACTIVE',
      totalContributions: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accounts: [],
    } as any,
  ];

  it('renders clients table with rows and correct data', () => {
    render(
      <MemoryRouter>
        <ClientsTable
          data={mockClients}
          onEdit={vi.fn()}
          onView={vi.fn()}
          pagination={{ total: 1, page: 1, lastPage: 1 }}
          setPage={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Pérez Edison')).toBeInTheDocument();
    expect(screen.getByText('1712345678')).toBeInTheDocument();
    expect(screen.getByText('SOC-000001')).toBeInTheDocument();
  });

  it('renders pagination bar permanently with page indicator and total socios count', () => {
    const setPageMock = vi.fn();
    render(
      <MemoryRouter>
        <ClientsTable
          data={mockClients}
          onEdit={vi.fn()}
          onView={vi.fn()}
          pagination={{ total: 21, page: 2, lastPage: 3 }}
          setPage={setPageMock}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText(/socios registrados/i)).toBeInTheDocument();
    expect(screen.getByText(/Página/i)).toBeInTheDocument();

    const prevButton = screen.getByRole('button', { name: /Anterior/i });
    const nextButton = screen.getByRole('button', { name: /Siguiente/i });

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(prevButton);
    expect(setPageMock).toHaveBeenCalledTimes(1);
  });

  it('disables Anterior on page 1 and Siguiente on last page', () => {
    render(
      <MemoryRouter>
        <ClientsTable
          data={mockClients}
          onEdit={vi.fn()}
          onView={vi.fn()}
          pagination={{ total: 5, page: 1, lastPage: 1 }}
          setPage={vi.fn()}
        />
      </MemoryRouter>
    );

    const prevButton = screen.getByRole('button', { name: /Anterior/i });
    const nextButton = screen.getByRole('button', { name: /Siguiente/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
});
