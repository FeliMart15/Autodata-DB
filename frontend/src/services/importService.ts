import apiClient from './api';
import { ImportFileData, ImportPreviewResult } from '@/types/index';

export const importService = {
  directImport: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/import/excel-modelos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  previewFile: async (file: File): Promise<ImportPreviewResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ImportPreviewResult>('/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  importData: async (data: ImportFileData[]): Promise<{ success: boolean; imported: number; errors: any[] }> => {
    const response = await apiClient.post('/import/execute', { data });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get('/import/template', {
      responseType: 'blob',
    });
    return response.data;
  },
};
