import { useState } from 'react';
import { PageHeader } from '@components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useToast } from '@context/ToastContext';
import { Upload, FileSpreadsheet, CheckCircle2, Download } from 'lucide-react';
import api from '@services/api';

export function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [completeFile, setCompleteFile] = useState<File | null>(null);
  const [minimosFile, setMinimosFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { addToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleCompleteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCompleteFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    // Apuntamos al nuevo endpoint de descarga usando el BASE_URL para archivos
    window.open(`${api.defaults.baseURL}/import/template-completo`, '_blank');
  };

  const handleUploadComplete = async () => {
    if (!completeFile) {
      addToast('Selecciona el archivo Excel Maestro', 'warning');
      return;
    }

    setIsUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', completeFile);

    try {
      const response = await api.post('/import/excel-completo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data);
      addToast(`Éxito: ${response.data.data.creados.modelos} modelos y ${response.data.data.creados.equipamientos} equipamientos cargados.`, 'success');
      setCompleteFile(null);
      
      const fileInput = document.getElementById('excel-completo-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al subir la Plantilla Maestra', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMinimosFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMinimosFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUploadMinimos = async () => {
    if (!minimosFile) {
      addToast('Selecciona el archivo Excel de datos mínimos', 'warning');
      return;
    }

    setIsUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', minimosFile);

    try {
      const response = await api.post('/import/excel-minimos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
      const r = response.data?.data?.resultado || {};
      addToast(`Mínimos: ${r.creados || 0} creados, ${r.preservados || 0} ya existían (no se tocaron).`, 'success');
      setMinimosFile(null);

      const fileInput = document.getElementById('excel-minimos-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al subir los datos mínimos', 'error');
    } finally {
      setIsUploading(false);
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
      const response = await api.post('/import/excel-modelos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data);
      addToast('Archivo procesado con éxito', 'success');
      setFile(null);
      
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
        title="Importación de Modelos" 
        description="Importación Masiva desde Plantilla Maestra"
      />

      {/* Nueva Tarjeta para Plantilla Completa */}
      <Card className="border-blue-200 dark:border-blue-800/50 shadow-md">
        <CardHeader className="bg-blue-50 border-b border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/40">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
            Importación Definitiva (Maestro Completo)
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-400">
            Utiliza este método para cargar todo el equipamiento, marca, modelo y precio desde una única planilla.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-muted border rounded-lg">
            <span className="text-sm flex-1 text-muted-foreground">
              <strong>Paso 1:</strong> Descargá la plantilla lista para completar. Viene con una pestaña de instrucciones.
            </span>
            <Button onClick={handleDownloadTemplate} variant="outline" className="shrink-0 gap-2">
              <Download className="h-4 w-4" />
              Descargar Plantilla Vacía
            </Button>
          </div>

          <div className="grid gap-4 md:flex items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="excel-completo-file" className="text-sm font-medium leading-none">
                <strong>Paso 2:</strong> Subir Plantilla Principal Completa
              </label>
              <Input
                id="excel-completo-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleCompleteFileChange}
                disabled={isUploading}
              />
            </div>
            <Button
              onClick={handleUploadComplete}
              disabled={!completeFile || isUploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Procesando...' : 'Cargar Vehículos Completos'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Importar SOLO datos mínimos (sin equipamiento) */}
      <Card className="border-amber-200 dark:border-amber-800/50 shadow-md">
        <CardHeader className="bg-amber-50 border-b border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/40">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <FileSpreadsheet className="h-6 w-6 text-amber-600" />
            Importar Mínimos (sin equipamiento)
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-400">
            Carga solo los datos mínimos desde la misma plantilla (ignora las columnas de equipamiento).
            Los modelos quedan en estado <strong>minimos_aprobados</strong>, listos para cargar el equipamiento.
            Si el modelo ya existe, completa/actualiza sus datos mínimos sin tocar equipamiento ni precio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:flex items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="excel-minimos-file" className="text-sm font-medium leading-none">
                Subir Excel de Datos Mínimos
              </label>
              <Input
                id="excel-minimos-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleMinimosFileChange}
                disabled={isUploading}
              />
            </div>
            <Button
              onClick={handleUploadMinimos}
              disabled={!minimosFile || isUploading}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Procesando...' : 'Importar Mínimos'}
            </Button>
          </div>

          {result && result.success && result.data?.resultado && (
            <div className="mt-2 p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800/50 rounded-lg">
              <h3 className="flex items-center gap-2 font-medium text-green-800 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
                Resumen de Mínimos
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-400 pl-7 list-disc">
                <li>Modelos creados: <strong>{result.data.resultado.creados || 0}</strong></li>
                <li>Ya existían (no se tocaron): <strong>{result.data.resultado.preservados || 0}</strong></li>
                <li>Familias nuevas: <strong>{result.data.resultado.familias || 0}</strong></li>
                <li>Omitidos por marca inexistente: <strong>{result.data.resultado.omitidos_marca || 0}</strong></li>
                {result.data.resultado.errores > 0 && (
                  <li className="text-amber-700 dark:text-amber-400">Filas con error: <strong>{result.data.resultado.errores}</strong></li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            Importar Excel de Modelos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg space-y-2 text-sm text-muted-foreground border">
            <p><strong>Formato requerido:</strong> Excel (.xlsx)</p>
            <p><strong>Columnas necesarias:</strong></p>
            <ul className="list-disc list-inside pl-4">
              <li><code>MARCOD</code>: Código de la Marca</li>
              <li><code>MARDSC</code>: Descripción de la Marca</li>
              <li><code>MARMODCOD</code>: Código del Modelo</li>
              <li><code>MARMODDSC</code>: Descripción del Modelo</li>
            </ul>
            <p><strong>Columnas opcionales:</strong></p>
            <ul className="list-disc list-inside pl-4">
               <li><code>FAMDSC</code>: Familia</li>
               <li><code>COMBDSC</code>: Combustible</li>
               <li><code>CATDSC</code>: Categoría</li>
               <li><code>MAEVALOR</code>: Precio Inicial</li>
            </ul>
            <p>Las marcas y modelos que no existan serán creados automáticamente.</p>
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Procesando...' : 'Importar Modelos'}
            </Button>
          </div>

          {result && result.success && (
            <div className="mt-6 p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800/50 rounded-lg">
              <h3 className="flex items-center gap-2 font-medium text-green-800 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
                Resumen de Carga
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-400 pl-7 list-disc">
                <li>Nuevas marcas creadas: <strong>{result.data?.creados?.marcas || 0}</strong></li>
                <li>Nuevos modelos creados: <strong>{result.data?.creados?.modelos || 0}</strong></li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
