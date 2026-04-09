import { useState } from 'react';
import { PageHeader } from '@components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useToast } from '@context/ToastContext';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@services/api';

export function PreciosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { addToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      addToast('Selecciona un archivo Excel', 'warning');
      return;
    }

    setIsUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/import/excel-precios', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data);
      addToast('Archivo procesado con éxito', 'success');
      setFile(null);
      // reset file input
      const fileInput = document.getElementById('excel-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al procesar el archivo Excel', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Actualización de Precios Tabulada" 
        description="Importa un archivo Excel para actualizar los precios por Código Concatenado"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Importar Excel de Precios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg space-y-2 text-sm text-muted-foreground border">
            <p><strong>Formato requerido:</strong> Excel (.xlsx)</p>
            <p><strong>Columnas necesarias:</strong></p>
            <ul className="list-disc list-inside pl-4">
              <li><code>CODIGO CONCATENADO</code>: Código Marca + Código Modelo (identificador único).</li>
              <li><code>ULTIMO PRECIO</code>: El precio a actualizar (en USD).</li>
            </ul>
            <p>Las filas en el archivo que coincidan con un modelo se actualizarán con el precio proporcionado y la fecha de vigencia actual.</p>
          </div>

          <div className="grid gap-4 md:flex items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="excel-file" className="text-sm font-medium leading-none">
                Seleccionar Archivo Excel
              </label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Procesando...' : 'Importar Precios'}
            </Button>
          </div>

          {result && result.success && (
            <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg">
              <h3 className="flex items-center gap-2 font-medium text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                Resumen de Carga
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-green-700 pl-7 list-disc">
                <li>Precios actualizados: <strong>{result.creados.precios}</strong></li>
                <li>Filas ignoradas o sin cambios: <strong>{result.creados.ignorados}</strong></li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
