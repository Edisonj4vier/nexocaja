import { useState, useCallback } from 'react';
import api from '@/lib/axios';

export function useReports() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReportPreview = useCallback(
    async (endpoint: string, params: Record<string, any> = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/reports/${endpoint}`, {
          params: { ...params, format: 'json' },
        });
        setReportData(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Error al obtener datos del reporte',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const downloadFile = async (
    endpoint: string,
    params: Record<string, any>,
    format: 'xlsx' | 'pdf',
    filenamePrefix: string,
  ) => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await api.get(`/reports/${endpoint}`, {
        params: { ...params, format },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type:
          format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Error al descargar el archivo de reporte.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    reportData,
    isLoading,
    isExporting,
    error,
    fetchReportPreview,
    downloadFile,
    clearData: () => setReportData(null),
  };
}
