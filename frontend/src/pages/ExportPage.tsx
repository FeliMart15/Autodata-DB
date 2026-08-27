import { useState } from 'react';
import { Download, CalendarDays, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

export function ExportPage() {
  const { addToast } = useToast();
  const [tipoExport, setTipoExport] = useState('ventas');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  const [caroneFile, setCaroneFile] = useState<File | null>(null);
  const [shortnameFile, setShortnameFile] = useState<File | null>(null);

  // Generar opciones para años (últimos 5 años)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Meses
  const months = [
    { id: 1, name: 'Enero' },
    { id: 2, name: 'Febrero' },
    { id: 3, name: 'Marzo' },
    { id: 4, name: 'Abril' },
    { id: 5, name: 'Mayo' },
    { id: 6, name: 'Junio' },
    { id: 7, name: 'Julio' },
    { id: 8, name: 'Agosto' },
    { id: 9, name: 'Septiembre' },
    { id: 10, name: 'Octubre' },
    { id: 11, name: 'Noviembre' },
    { id: 12, name: 'Diciembre' }
  ];

  const handleExport = async () => {
    if (tipoExport === 'carone') {
      if (!caroneFile || !shortnameFile) {
        addToast('Subí los dos archivos (catálogo Carone y SHORTNAME)', 'error');
        return;
      }
      setIsExporting(true);
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('carone', caroneFile);
        formData.append('shortname', shortnameFile);

        const response = await fetch('/api/export/carone', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.message || 'Error al generar el export de Carone');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CARONE_actualizado.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        addToast('Export de Carone generado correctamente', 'success');
      } catch (error: any) {
        addToast(error.message || 'Error al exportar', 'error');
      } finally {
        setIsExporting(false);
      }
      return;
    }

    setIsExporting(true);
    try {
      let endpoint = '';
      if (tipoExport === 'ventas') {
        endpoint = `/api/export/ventas?anio=${anio}&mes=${mes}`;
      } else if (tipoExport === 'empadronamientos') {
        endpoint = `/api/export/empadronamientos?anio=${anio}&mes=${mes}`;
      } else if (tipoExport === 'plantilla') {
        endpoint = `/api/export/plantilla`;
      }

      const token = localStorage.getItem('token');

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
             throw new Error('No se encontraron datos para el mes y año seleccionados');
        }
        throw new Error('Error al generar el export');
      }

      // Convertir la respuesta a blob y descargar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tipoExport === 'plantilla' ? 'Autodata_Plantilla_Maestra.xlsx' : `${tipoExport === 'ventas' ? 'Ventas' : 'Empadronamientos'}_${anio}_${mes}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast('Export generado correctamente', 'success');
    } catch (error: any) {
      addToast(error.message || 'Error al exportar', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Exportar Datos (Excel)</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Descarga los archivos Excel compatibles con el formato histórico.
        </p>
      </div>

      <div className="bg-card rounded-lg shadow border border-border mx-auto max-w-2xl mt-8">
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Exportación
              </label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoExport('ventas')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    tipoExport === 'ventas'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'border-border text-muted-foreground hover:border-indigo-300 hover:bg-muted dark:hover:border-indigo-700'
                  }`}
                >
                  <FileSpreadsheet className="h-6 w-6 mb-2" />
                  <span className="font-medium text-sm text-center">Ventas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoExport('empadronamientos')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    tipoExport === 'empadronamientos'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'border-border text-muted-foreground hover:border-emerald-300 hover:bg-muted dark:hover:border-emerald-700'
                  }`}
                >
                  <FileSpreadsheet className="h-6 w-6 mb-2" />
                  <span className="font-medium text-sm text-center">Empadronamientos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoExport('plantilla')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    tipoExport === 'plantilla'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'border-border text-muted-foreground hover:border-blue-300 hover:bg-muted dark:hover:border-blue-700'
                  }`}
                >
                  <FileSpreadsheet className="h-6 w-6 mb-2" />
                  <span className="font-medium text-sm text-center">Plantilla Maestra</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoExport('carone')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    tipoExport === 'carone'
                      ? 'border-amber-600 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'border-border text-muted-foreground hover:border-amber-300 hover:bg-muted dark:hover:border-amber-700'
                  }`}
                >
                  <FileSpreadsheet className="h-6 w-6 mb-2" />
                  <span className="font-medium text-sm text-center">CarOne</span>
                </button>
              </div>
            </div>

            {(tipoExport === 'ventas' || tipoExport === 'empadronamientos') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Mes
                    </div>
                  </label>
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {months.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Año
                </label>
                <select
                  value={anio}
                  onChange={(e) => setAnio(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            )}

            {tipoExport === 'carone' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Matchea el catálogo de Carone (MARCOD/MARMODCOD) contra nuestros modelos en estado
                  "definitivo" y completa las columnas de specs en el formato que espera su sistema.
                </p>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Catálogo Carone (.xlsx, .xls o .csv)
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setCaroneFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-muted file:text-foreground file:cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    SHORTNAME.csv
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setShortnameFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-muted file:text-foreground file:cursor-pointer"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="bg-muted px-6 py-4 border-t border-border rounded-b-lg">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-2.5 text-base flex justify-center items-center gap-2"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando Excel...
              </span>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Exportar Excel
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
