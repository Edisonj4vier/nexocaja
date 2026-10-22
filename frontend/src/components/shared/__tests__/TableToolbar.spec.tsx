import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableToolbar } from '../TableToolbar';
import { DateFilterInput } from '../DateFilterInput';

describe('DateFilterInput component', () => {
  it('renders with placeholder dd/mm/aaaa and displays dd/mm/yyyy when given ISO date', () => {
    const onChange = vi.fn();
    render(<DateFilterInput value="2026-10-21" onChange={onChange} aria-label="Fecha Test" />);

    const input = screen.getByRole('textbox', { name: /Fecha Test/i }) as HTMLInputElement;
    expect(input.value).toBe('21/10/2026');
    expect(input.placeholder).toBe('dd/mm/aaaa');
  });

  it('allows typing date with dd/mm/yyyy mask and calls onChange with ISO format', () => {
    const onChange = vi.fn();
    render(<DateFilterInput value="" onChange={onChange} aria-label="Fecha Test" />);

    const input = screen.getByRole('textbox', { name: /Fecha Test/i }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '25122026' } });

    expect(input.value).toBe('25/12/2026');
    expect(onChange).toHaveBeenCalledWith('2026-12-25');
  });

  it('clears date when clicking the X button', () => {
    const onChange = vi.fn();
    render(<DateFilterInput value="2026-10-21" onChange={onChange} aria-label="Fecha Test" />);

    const clearBtn = screen.getByTitle('Borrar fecha');
    fireEvent.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('opens Tailwind calendar popover when clicking calendar button and allows selecting today', () => {
    const onChange = vi.fn();
    render(<DateFilterInput value="" onChange={onChange} aria-label="Fecha Test" />);

    const calBtn = screen.getByTitle('Abrir calendario');
    fireEvent.click(calBtn);

    expect(screen.getByText(/Seleccionar Hoy/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Seleccionar Hoy/i));

    expect(onChange).toHaveBeenCalled();
  });

  it('does NOT open calendar popover when clicking the input text box', () => {
    const onChange = vi.fn();
    render(<DateFilterInput value="" onChange={onChange} aria-label="Fecha Test" />);

    const input = screen.getByRole('textbox', { name: /Fecha Test/i });
    fireEvent.click(input);

    expect(screen.queryByText(/Seleccionar Hoy/i)).not.toBeInTheDocument();
  });
});

describe('TableToolbar component', () => {
  it('renders search and date inputs with dd/mm/aaaa format', () => {
    const onSearchChange = vi.fn();
    const onStartDateChange = vi.fn();
    const onEndDateChange = vi.fn();

    render(
      <TableToolbar
        search=""
        onSearchChange={onSearchChange}
        startDate="2026-10-01"
        onStartDateChange={onStartDateChange}
        endDate="2026-10-21"
        onEndDateChange={onEndDateChange}
      />
    );

    const startInput = screen.getByRole('textbox', { name: /Fecha Desde/i }) as HTMLInputElement;
    const endInput = screen.getByRole('textbox', { name: /Fecha Hasta/i }) as HTMLInputElement;

    expect(startInput.value).toBe('01/10/2026');
    expect(endInput.value).toBe('21/10/2026');
  });

  it('shows Limpiar (reset) button when filters are active and clears all inputs on click', () => {
    const onSearchChange = vi.fn();
    const onStartDateChange = vi.fn();
    const onEndDateChange = vi.fn();
    const onReset = vi.fn();

    render(
      <TableToolbar
        search="Pérez"
        onSearchChange={onSearchChange}
        startDate="2026-10-01"
        onStartDateChange={onStartDateChange}
        endDate="2026-10-21"
        onEndDateChange={onEndDateChange}
        onReset={onReset}
      />
    );

    const resetBtn = screen.getByTitle('Restablecer todos los filtros');
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);

    expect(onSearchChange).toHaveBeenCalledWith('');
    expect(onStartDateChange).toHaveBeenCalledWith('');
    expect(onEndDateChange).toHaveBeenCalledWith('');
    expect(onReset).toHaveBeenCalled();
  });
});
