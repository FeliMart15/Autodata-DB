import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, DollarSign, TrendingUp, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/Dialog';
import { Input } from '@components/ui/Input';
import { precioService, PrecioModelo, CreatePrecioRequest } from '@services/precioService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PreciosViewProps {
  modeloId: number;
}

export function PreciosView({ modeloId }: PreciosViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePrecioRequest>>({
    modeloId,
    moneda: 'USD',
    fechaVigenciaDesde: new Date().toISOString().split('T')[0],
    fuente: 'Manual',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener todos los precios
  const { data: precios, isLoading } = useQuery({
    queryKey: ['precios', modeloId],
    queryFn: () => precioService.getPreciosByModelo(modeloId),
  });

  // Query para precio actual
  const { data: precioActual } = useQuery({
    queryKey: ['precio-actual', modeloId],
    queryFn: () => precioService.getPrecioActual(modeloId),
    retry: false,
  });

  // Mutation para crear precio
  const createMutation = useMutation({
    mutationFn: (data: CreatePrecioRequest) => precioService.createPrecio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precios', modeloId] });
      queryClient.invalidateQueries({ queryKey: ['precio-actual', modeloId] });
      setIsAddDialogOpen(false);
      toast('Precio agregado exitosamente', 'success');
      setFormData({
        modeloId,
        moneda: 'USD',
        fechaVigenciaDesde: new Date().toISOString().split('T')[0],
        fuente: 'Manual',
      });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || 'Error al agregar precio', 'error');
    },
  });

  // Mutation para eliminar precio
  const deleteMutation = useMutation({
    mutationFn: (precioId: number) => precioService.deletePrecio(precioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['precios', modeloId] });
      queryClient.invalidateQueries({ queryKey: ['precio-actual', modeloId] });
      toast('Precio eliminado exitosamente', 'success');
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || 'Error al eliminar precio', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createMutation.isPending) {
      return;
    }
    
    if (!formData.precio || !formData.fechaVigenciaDesde) {
      toast('Complete todos los campos requeridos', 'error');
      return;
    }
    
    createMutation.mutate(formData as CreatePrecioRequest);
  };

  const formatCurrency = (precio: number, moneda: string) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const isVigente = (precio: PrecioModelo, index: number) => {
    // El primer precio en la lista (más reciente) es el vigente
    return index === 0;
  };

  return (
    <div className="space-y-6">
      {/* Precio Actual */}
      {precioActual && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Precio Vigente</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-bold text-primary">
                    {formatCurrency(precioActual.Precio, precioActual.Moneda)}
                  </h2>
                  <span className="text-lg text-muted-foreground">{precioActual.Moneda}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vigente desde {format(new Date(precioActual.FechaVigenciaDesde), 'dd MMM yyyy', { locale: es })}
                </p>
              </div>
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de Precios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Historial de Precios
            </CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Precio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando precios...</div>
          ) : precios && precios.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Vigencia Desde</TableHead>
                  <TableHead>Vigencia Hasta</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {precios.map((precio, index) => (
                  <TableRow key={precio.PrecioID}>
                    <TableCell>
                      {isVigente(precio, index) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Vigente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          Histórico
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(precio.Precio, precio.Moneda)}
                    </TableCell>
                    <TableCell>{precio.Moneda}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(precio.FechaVigenciaDesde), 'dd/MM/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {precio.FechaVigenciaHasta ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(precio.FechaVigenciaHasta), 'dd/MM/yyyy')}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{precio.Fuente || '-'}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(precio.PrecioID)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay precios registrados para este modelo
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para agregar precio */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Precio</DialogTitle>
            <DialogDescription>
              Ingresa el nuevo precio para el modelo. El precio anterior se cerrará automáticamente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="number"
              label="Precio *"
              placeholder="Ej: 25000"
              step="0.01"
              value={formData.precio || ''}
              onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="Moneda *"
                placeholder="USD"
                value={formData.moneda || 'USD'}
                onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                required
              />
              
              <Input
                type="date"
                label="Fecha Vigencia Desde *"
                value={formData.fechaVigenciaDesde || ''}
                onChange={(e) => setFormData({ ...formData, fechaVigenciaDesde: e.target.value })}
                required
              />
            </div>
            
            <Input
              type="text"
              label="Fuente"
              placeholder="Ej: Manual, Importador, etc."
              value={formData.fuente || ''}
              onChange={(e) => setFormData({ ...formData, fuente: e.target.value })}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Guardando...' : 'Guardar Precio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
