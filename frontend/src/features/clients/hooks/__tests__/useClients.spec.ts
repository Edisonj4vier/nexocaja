import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClients } from '../useClients';
import api from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('useClients hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useClients());

    expect(result.current.clients).toEqual([]);
    expect(result.current.pagination).toEqual({ total: 0, page: 1, lastPage: 1 });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should parse pagination metadata correctly when backend returns data with meta', async () => {
    const mockApiResponse = {
      data: {
        data: [
          { id: '1', firstName: 'Juan', lastName: 'Pérez', memberCode: 'SOC-000001' },
          { id: '2', firstName: 'María', lastName: 'López', memberCode: 'SOC-000002' },
        ],
        meta: {
          total: 21,
          page: 2,
          limit: 10,
          totalPages: 3,
        },
      },
    };

    (api.get as any).mockResolvedValueOnce(mockApiResponse);

    const { result } = renderHook(() => useClients());

    await act(async () => {
      await result.current.fetchClients({ page: 2 });
    });

    expect(result.current.clients).toHaveLength(2);
    expect(result.current.pagination).toEqual({
      total: 21,
      page: 2,
      lastPage: 3,
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle flat array responses gracefully', async () => {
    const mockApiResponse = {
      data: [
        { id: '1', firstName: 'Carlos', lastName: 'Gómez' },
      ],
    };

    (api.get as any).mockResolvedValueOnce(mockApiResponse);

    const { result } = renderHook(() => useClients());

    await act(async () => {
      await result.current.fetchClients();
    });

    expect(result.current.clients).toHaveLength(1);
    expect(result.current.pagination.total).toBe(1);
    expect(result.current.pagination.lastPage).toBe(1);
  });
});
