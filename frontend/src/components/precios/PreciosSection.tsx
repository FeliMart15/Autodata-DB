import {  useEffect, useState  } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { DataTable } from '@components/ui/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/Dialog';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { precioService } from '@services/precioService';
import { PrecioModelo } from '@/types/index';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@context/ToastContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PreciosSectionProps {
  modeloId: number;
  readOnly?: boolean;
}

export function PreciosSection({ modeloId, readOnly = false }: PreciosSectionProps) {
  const [precios, setPrecios] = useState<PrecioModelo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPrecio, setNewPrecio] = useState({
    precio: '',
    vigencia_desde: format(new Date(), 'yyyy-MM-dd'),
    moneda: 'USD',
    observaciones: '',
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadPrecios();
  }, [modeloId]);

  const loadPrecios = async () => {
    try {
      const data = await precioService.getPreciosByModelo(modeloId);
      setPrecios(data as any);
    } catch (error) {
      console.error('Error loading precios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPrecio = async () => {
    if (!newPrecio.precio) {
      addToast('El precio es requerido', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await precioService.createPrecio({
        id_modelo: modeloId,
        precio: Number(newPrecio.precio),
        vigencia_desde: newPrecio.vigencia_desde,
        moneda: newPrecio.moneda,
        observaciones: newPrecio.observaciones || undefined,
      });
      addToast('Precio agregado correctamente', 'success');
      setIsDialogOpen(false);
      setNewPrecio({
        precio: '',
        vigencia_desde: format(new Date(), 'yyyy-MM-dd'),
        moneda: 'USD',
        observaciones: '',
      });
      loadPrecios();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al agregar precio', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<PrecioModelo>[] = [
    {
      accessorKey: 'precio',
      header: 'Precio',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.moneda} {row.original.precio.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'vigencia_desde',
      header: 'Vigencia Desde',
      cell: ({ row }) => format(new Date(row.original.vigencia_desde), 'dd/MM/yyyy', { locale: es }),
    },
    {
      accessorKey: 'vigencia_hasta',
      header: 'Vigencia Hasta',
      cell: ({ row }) =>
        row.original.vigencia_hasta
          ? format(new Date(row.original.vigencia_hasta), 'dd/MM/yyyy', { locale: es })
          : 'Vigente',
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

  const chartData = precios
    .filter((p) => p.vigencia_desde)
    .map((p) => ({
      fecha: format(new Date(p.vigencia_desde), 'MMM yyyy', { locale: es }),
      precio: p.precio,
    }))
    .reverse();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando precios..." />
      </div>
    );
  }

  const precioActual = precios.find((p) => !p.vigencia_hasta);
  const precioAnterior = precios.filter((p) => p.vigencia_hasta).sort((a, b) => 
    new Date(b.vigencia_hasta!).getTime() - new Date(a.vigencia_hasta!).getTime()
  )[0];

  const variacion = precioActual && precioAnterior
    ? ((precioActual.precio - precioAnterior.precio) / precioAnterior.precio) * 100
    : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Precio Actual</p>
                <p className="text-2xl font-bold">
                  {precioActual
                    ? `${precioActual.moneda} ${precioActual.precio.toLocaleString()}`
                    : 'Sin precio'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Variación</p>
                <p className={`text-2xl font-bold ${
                  variacion !== null
                    ? variacion > 0
                      ? 'text-success'
                      : 'text-destructive'
                    : ''
                }`}>
                  {variacion !== null ? `${variacion > 0 ? '+' : ''}${variacion.toFixed(2)}%` : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total de Precios</p>
              <p className="text-2xl font-bold">{precios.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolución de Precios</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="precio" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historial de Precios</CardTitle>
            {!readOnly && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Precio
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={precios} searchPlaceholder="Buscar precios..." />
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Precio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              label="Precio"
              placeholder="15000"
              value={newPrecio.precio}
              onChange={(e) => setNewPrecio({ ...newPrecio, precio: e.target.value })}
              required
            />
            <Input
              type="date"
              label="Vigencia Desde"
              value={newPrecio.vigencia_desde}
              onChange={(e) => setNewPrecio({ ...newPrecio, vigencia_desde: e.target.value })}
              required
            />
            <Input
              label="Moneda"
              value={newPrecio.moneda}
              onChange={(e) => setNewPrecio({ ...newPrecio, moneda: e.target.value })}
              placeholder="USD"
            />
            <Input
              label="Observaciones"
              value={newPrecio.observaciones}
              onChange={(e) => setNewPrecio({ ...newPrecio, observaciones: e.target.value })}
              placeholder="Opcional"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPrecio} isLoading={isSaving}>
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
