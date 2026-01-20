import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/Tabs';
import { Textarea } from '@components/ui/Textarea';
import { Label } from '@components/ui/label';
import { modeloService } from '@services/modeloService';
import estadoService from '@services/estadoService';
import { useToast } from '@context/ToastContext';
import { Modelo, ModeloEstado } from '@/types';
import { Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Input } from '@components/ui/Input';

export function RevisarPage() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modeloSeleccionado, setModeloSeleccionado] = useState<Modelo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabActiva, setTabActiva] = useState<'minimos' | 'equipamiento'>('minimos');
  const [observaciones, setObservaciones] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    loadModelos();
  }, []);

  const loadModelos = async () => {
    try {
      setIsLoading(true);
      
      // Cargar modelos en revisión
      const [responseMinimos, responseEquipamiento] = await Promise.all([
        modeloService.getAll({ estado: ModeloEstado.REVISION_MINIMOS }),
        modeloService.getAll({ estado: ModeloEstado.REVISION_EQUIPAMIENTO }),
      ]);

      const todosModelos = [
        ...(responseMinimos.data || []),
        ...(responseEquipamiento.data || []),
      ];
      
      setModelos(todosModelos);
    } catch (error: any) {
      addToast('Error al cargar modelos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeleccionarModelo = async (modelo: Modelo) => {
    try {
      const detalleCompleto = await modeloService.getById(modelo.ModeloID);
      setModeloSeleccionado(detalleCompleto);
      setObservaciones('');

      // Determinar qué tab mostrar según el estado
      if (detalleCompleto.Estado === ModeloEstado.REVISION_MINIMOS) {
        setTabActiva('minimos');
      } else {
        setTabActiva('equipamiento');
      }
    } catch (error: any) {
      addToast('Error al cargar detalles del modelo', 'error');
    }
  };

  const handleAprobar = async () => {
    if (!modeloSeleccionado) return;

    try {
      setIsProcessing(true);
      
      let nuevoEstado: ModeloEstado;
      if (modeloSeleccionado.Estado === ModeloEstado.REVISION_MINIMOS) {
        nuevoEstado = ModeloEstado.MINIMOS_APROBADOS;
      } else {
        nuevoEstado = ModeloEstado.DEFINITIVO;
      }

      await estadoService.cambiarEstado(modeloSeleccionado.ModeloID, {
        nuevoEstado,
        observaciones: 'Aprobado',
      });

      addToast('Modelo aprobado correctamente', 'success');
      setModeloSeleccionado(null);
      loadModelos();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al aprobar modelo', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRechazar = async () => {
    if (!modeloSeleccionado) return;

    if (!observaciones.trim()) {
      addToast('Debe ingresar observaciones para rechazar', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      
      let nuevoEstado: ModeloEstado;
      if (modeloSeleccionado.Estado === ModeloEstado.REVISION_MINIMOS) {
        nuevoEstado = ModeloEstado.CORREGIR_MINIMOS;
      } else {
        nuevoEstado = ModeloEstado.CORREGIR_EQUIPAMIENTO;
      }

      await estadoService.cambiarEstado(modeloSeleccionado.ModeloID, {
        nuevoEstado,
        observaciones,
      });

      addToast('Modelo enviado a corrección', 'success');
      setModeloSeleccionado(null);
      setObservaciones('');
      loadModelos();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al rechazar modelo', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const modelosFiltrados = modelos.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    return (
      m.DescripcionModelo?.toLowerCase().includes(searchLower) ||
      m.MarcaNombre?.toLowerCase().includes(searchLower) ||
      m.CodigoAutodata?.includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Revisar Modelos"
        description="Revisión y aprobación de datos mínimos y equipamiento"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Lista de modelos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Modelos en Revisión</CardTitle>
            <div className="mt-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {modelosFiltrados.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay modelos para revisar</p>
              ) : (
                modelosFiltrados.map((modelo) => (
                  <div
                    key={modelo.ModeloID}
                    onClick={() => handleSeleccionarModelo(modelo)}
                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 transition ${
                      modeloSeleccionado?.ModeloID === modelo.ModeloID ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium">{modelo.MarcaNombre} {modelo.DescripcionModelo}</div>
                    <div className="text-sm text-gray-500">{modelo.CodigoAutodata}</div>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        estadoService.getEstadoBadgeColor(modelo.Estado)
                      }`}>
                        {estadoService.getEstadoLabel(modelo.Estado)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel de revisión */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {modeloSeleccionado
                ? `${modeloSeleccionado.MarcaNombre} ${modeloSeleccionado.DescripcionModelo}`
                : 'Selecciona un modelo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!modeloSeleccionado ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Selecciona un modelo de la lista para comenzar la revisión</p>
              </div>
            ) : (
              <div>
                <Tabs value={tabActiva} onValueChange={(v) => setTabActiva(v as 'minimos' | 'equipamiento')}>
                  <TabsList>
                    <TabsTrigger value="minimos">Datos Mínimos</TabsTrigger>
                    <TabsTrigger value="equipamiento">Equipamiento</TabsTrigger>
                  </TabsList>

                  <TabsContent value="minimos">
                    <div className="space-y-4 mt-4">
                      {/* Vista de datos mínimos completa */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Segmento</Label>
                          <p className="font-medium">{modeloSeleccionado.SegmentacionAutodata || '-'}</p>
                        </div>
                        <div>
                          <Label>Modelo</Label>
                          <p className="font-medium">{modeloSeleccionado.Modelo1 || '-'}</p>
                        </div>
                        <div>
                          <Label>Tipo de Carrocería</Label>
                          <p className="font-medium">{modeloSeleccionado.Tipo2_Carroceria || '-'}</p>
                        </div>
                        <div>
                          <Label>Origen</Label>
                          <p className="font-medium">{modeloSeleccionado.OrigenCodigo || '-'}</p>
                        </div>
                        <div>
                          <Label>Cilindros</Label>
                          <p className="font-medium">{modeloSeleccionado.Cilindros || '-'}</p>
                        </div>
                        <div>
                          <Label>Válvulas</Label>
                          <p className="font-medium">{modeloSeleccionado.Valvulas || '-'}</p>
                        </div>
                        <div>
                          <Label>Cilindrada (CC)</Label>
                          <p className="font-medium">{modeloSeleccionado.CC || '-'}</p>
                        </div>
                        <div>
                          <Label>Potencia (HP)</Label>
                          <p className="font-medium">{modeloSeleccionado.HP || '-'}</p>
                        </div>
                        <div>
                          <Label>Tipo de Caja</Label>
                          <p className="font-medium">{modeloSeleccionado.TipoCajaAut || '-'}</p>
                        </div>
                        <div>
                          <Label>Puertas</Label>
                          <p className="font-medium">{modeloSeleccionado.Puertas || '-'}</p>
                        </div>
                        <div>
                          <Label>Asientos</Label>
                          <p className="font-medium">{modeloSeleccionado.Asientos || '-'}</p>
                        </div>
                        <div>
                          <Label>Tipo de Motor</Label>
                          <p className="font-medium">{modeloSeleccionado.TipoMotor || '-'}</p>
                        </div>
                        <div>
                          <Label>Tipo Vehículo Eléctrico</Label>
                          <p className="font-medium">{modeloSeleccionado.TipoVehiculoElectrico || '-'}</p>
                        </div>
                        <div>
                          <Label>Importador</Label>
                          <p className="font-medium">{modeloSeleccionado.Importador || '-'}</p>
                        </div>
                        <div>
                          <Label>Precio Inicial</Label>
                          <p className="font-medium">{modeloSeleccionado.PrecioInicial ? `$${modeloSeleccionado.PrecioInicial.toLocaleString()}` : '-'}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="equipamiento">
                    <div className="space-y-4 mt-4">
                      <p className="text-sm text-gray-600">
                        Revisión de equipamiento (150+ campos)
                      </p>
                      {/* TODO: Mostrar campos de equipamiento */}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Sección de observaciones y acciones */}
                <div className="mt-6 pt-6 border-t">
                  <div className="mb-4">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Ingrese observaciones o motivo de rechazo..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAprobar}
                      disabled={isProcessing}
                      variant="success"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button
                      onClick={handleRechazar}
                      disabled={isProcessing}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
