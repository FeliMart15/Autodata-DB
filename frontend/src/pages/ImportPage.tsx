import {  useState, useCallback  } from 'react';
import { useDropzone } from 'react-dropzone';
import { PageHeader } from '@components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Alert } from '@components/ui/Alert';
import { DataTable } from '@components/ui/DataTable';
import { Badge } from '@components/ui/Badge';
import { importService } from '@services/importService';
import { ImportFileData, ImportPreviewResult } from '@/types/index';
import { Upload, FileSpreadsheet, Download, CheckCircle2, XCircle } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@context/ToastContext';
import { useNavigate } from 'react-router-dom';

export function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const result = await importService.directImport(selectedFile);
      addToast('Importación exitosa: ' + (result.data?.modelos || 0) + ' modelos creados', 'success');
      navigate('/modelos');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al procesar el archivo', 'error');
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  }, [addToast, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!preview || preview.valid.length === 0) return;

    setIsImporting(true);
    try {
      const result = await importService.importData(preview.valid);
      addToast(`${result.imported} modelos importados correctamente`, 'success');
      navigate('/modelos');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al importar datos', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await importService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_importacion.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast('Plantilla descargada', 'success');
    } catch (error) {
      addToast('Error al descargar plantilla', 'error');
    }
  };

  const validColumns: ColumnDef<ImportFileData>[] = [
    { accessorKey: 'marca', header: 'Marca' },
    { accessorKey: 'modelo', header: 'Modelo' },
    { accessorKey: 'familia', header: 'Familia' },
    { accessorKey: 'año', header: 'Año' },
    { accessorKey: 'combustible', header: 'Combustible' },
    { accessorKey: 'tipo', header: 'Tipo' },
  ];

  const errorColumns: ColumnDef<any>[] = [
    { accessorKey: 'row', header: 'Fila' },
    { accessorKey: 'field', header: 'Campo' },
    { accessorKey: 'message', header: 'Error' },
    { 
      accessorKey: 'value', 
      header: 'Valor',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.value || '-'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Importar Modelos"
        description="Carga masiva de modelos desde archivos Excel o CSV"
        actions={
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
        }
      />

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>1. Seleccionar Archivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Suelta el archivo aquí...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Arrastra un archivo o haz clic para seleccionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Formatos soportados: CSV, XLS, XLSX
                </p>
              </>
            )}
            {file && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && (
        <>
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Filas</p>
                  <p className="text-3xl font-bold">{preview.totalRows}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <p className="text-sm text-muted-foreground">Válidas</p>
                  </div>
                  <p className="text-3xl font-bold text-success">{preview.validRows}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-muted-foreground">Con Errores</p>
                  </div>
                  <p className="text-3xl font-bold text-destructive">{preview.errorRows}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Errors */}
          {preview.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Errores Detectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive" className="mb-4">
                  Se encontraron {preview.errors.length} errores. Corrige estos errores antes de importar.
                </Alert>
                <DataTable
                  columns={errorColumns}
                  data={preview.errors}
                  searchPlaceholder="Buscar errores..."
                />
              </CardContent>
            </Card>
          )}

          {/* Valid Data Preview */}
          {preview.valid.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  Datos Válidos ({preview.validRows})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={validColumns}
                  data={preview.valid}
                  searchPlaceholder="Buscar en datos válidos..."
                />
              </CardContent>
            </Card>
          )}

          {/* Import Button */}
          {preview.valid.length > 0 && (
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                isLoading={isImporting}
                disabled={isImporting || preview.errorRows > 0}
                size="lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar {preview.validRows} Modelos
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
