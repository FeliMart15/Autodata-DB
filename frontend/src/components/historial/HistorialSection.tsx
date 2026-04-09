import {  useEffect, useState  } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { DataTable } from '@components/ui/DataTable';
import { Badge } from '@components/ui/Badge';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { Button } from '@components/ui/Button';
import { modeloService } from '@services/modeloService';
import { ModeloHistorial } from '@/types/index';
import { History, Download } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';

interface HistorialSectionProps {
  modeloId: number;
}

export function HistorialSection({ modeloId }: HistorialSectionProps) {
  const [historial, setHistorial] = useState<ModeloHistorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistorial();
  }, [modeloId]);

  const loadHistorial = async () => {
    try {
      const data = await modeloService.getHistorial(modeloId);
      setHistorial(data);
    } catch (error) {
      console.error('Error loading historial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = historial.map((item) => ({
      Fecha: format(new Date(item.fecha_modificacion), 'dd/MM/yyyy HH:mm', { locale: es }),
      Usuario: item.usuario_nombre,
      Campo: item.campo_modificado,
      'Valor Anterior': item.valor_anterior || '-',
      'Valor Nuevo': item.valor_nuevo || '-',
      Observaciones: item.observaciones || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');
    XLSX.writeFile(wb, `historial_modelo_${modeloId}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const columns: ColumnDef<ModeloHistorial>[] = [
    {
      accessorKey: 'fecha_modificacion',
      header: 'Fecha',
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.original.fecha_modificacion), 'dd/MM/yyyy HH:mm', { locale: es })}
        </span>
      ),
    },
    {
      accessorKey: 'usuario_nombre',
      header: 'Usuario',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.usuario_nombre}</span>
      ),
    },
    {
      accessorKey: 'campo_modificado',
      header: 'Campo',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.campo_modificado}</Badge>
      ),
    },
    {
      accessorKey: 'valor_anterior',
      header: 'Valor Anterior',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.valor_anterior || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'valor_nuevo',
      header: 'Valor Nuevo',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.valor_nuevo || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'observaciones',
      header: 'Observaciones',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.observaciones || '-'}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando historial..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Cambios
            </CardTitle>
            {historial.length > 0 && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {historial.length > 0 ? (
            <DataTable
              columns={columns}
              data={historial}
              searchPlaceholder="Buscar en historial..."
            />
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay cambios registrados para este modelo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline View */}
      {historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista de Línea de Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historial.slice(0, 10).map((item, index) => (
                <div key={item.id_historial} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    {index < historial.length - 1 && (
                      <div className="w-0.5 h-full bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.usuario_nombre}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.fecha_modificacion), 'dd MMM, HH:mm', { locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Modificó <span className="font-medium">{item.campo_modificado}</span>
                    </p>
                    {item.valor_anterior && item.valor_nuevo && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <span className="text-destructive">{item.valor_anterior}</span>
                        {' → '}
                        <span className="text-success">{item.valor_nuevo}</span>
                      </div>
                    )}
                    {item.observaciones && (
                      <p className="mt-2 text-sm italic text-muted-foreground">
                        "{item.observaciones}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {historial.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  Y {historial.length - 10} cambios más...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
