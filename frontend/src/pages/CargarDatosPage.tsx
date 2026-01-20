import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/Tabs';
import { Badge } from '@components/ui/Badge';
import { modeloService } from '@services/modeloService';
import estadoService from '@services/estadoService';
import { useToast } from '@context/ToastContext';
import { Modelo, ModeloEstado } from '@/types';
import { Search, Send, AlertCircle, FileText } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { FormularioDatosMinimos } from '@components/modelos/FormularioDatosMinimos';
import { FormularioEquipamiento } from '@components/modelos/FormularioEquipamiento';

export function CargarDatosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modeloSeleccionado, setModeloSeleccionado] = useState<Modelo | null>(null);
  const [equipamiento, setEquipamiento] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabActiva, setTabActiva] = useState<'minimos' | 'equipamiento'>('minimos');
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadModelos();
  }, []);

  useEffect(() => {
    // Determinar tab activa y cargar equipamiento al seleccionar modelo
    if (modeloSeleccionado) {
      if (
        modeloSeleccionado.Estado === ModeloEstado.IMPORTADO ||
        modeloSeleccionado.Estado === ModeloEstado.CREADO ||
        modeloSeleccionado.Estado === ModeloEstado.DATOS_MINIMOS ||
        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_MINIMOS
      ) {
        setTabActiva('minimos');
      } else if (
        modeloSeleccionado.Estado === ModeloEstado.MINIMOS_APROBADOS ||
        modeloSeleccionado.Estado === ModeloEstado.EQUIPAMIENTO_CARGADO ||
        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_EQUIPAMIENTO
      ) {
        setTabActiva('equipamiento');
        // Cargar equipamiento si está en fase de equipamiento
        loadEquipamiento(modeloSeleccionado.ModeloID);
      }
    }
  }, [modeloSeleccionado]);

  const loadEquipamiento = async (modeloId: number) => {
    try {
      // TODO: Crear servicio para obtener equipamiento
      // const equipamientoData = await equipamientoService.getByModeloId(modeloId);
      // setEquipamiento(equipamientoData);
      setEquipamiento({}); // Por ahora vacío
    } catch (error: any) {
      addToast('Error al cargar equipamiento', 'error');
    }
  };

  const loadModelos = async () => {
    try {
      setIsLoading(true);
      const response = await modeloService.getAll({
        page: 1,
        limit: 1000,
        estado: [
          ModeloEstado.IMPORTADO,
          ModeloEstado.CREADO,
          ModeloEstado.DATOS_MINIMOS,
          ModeloEstado.CORREGIR_MINIMOS,
          ModeloEstado.MINIMOS_APROBADOS,
          ModeloEstado.EQUIPAMIENTO_CARGADO,
          ModeloEstado.CORREGIR_EQUIPAMIENTO
        ].join(',')
      });
      setModelos(response.data || []);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al cargar modelos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuardarDatosMinimos = async (datosActualizados: Partial<Modelo>) => {
    if (!modeloSeleccionado) return;

    setIsSaving(true);
    try {
      await modeloService.update(modeloSeleccionado.ModeloID, datosActualizados);
      addToast('Datos guardados correctamente', 'success');
      
      // Recargar el modelo actualizado
      const modeloActualizado = await modeloService.getById(modeloSeleccionado.ModeloID);
      setModeloSeleccionado(modeloActualizado);
      loadModelos();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al guardar', 'error');
      throw error; // Propagar error para que el formulario sepa que falló
    } finally {
      setIsSaving(false);
    }
  };

  const handleGuardarEquipamiento = async (datosEquipamiento: any) => {
    if (!modeloSeleccionado) return;

    setIsSaving(true);
    try {
      // TODO: Implementar guardado de equipamiento
      await modeloService.update(modeloSeleccionado.ModeloID, { Estado: ModeloEstado.EQUIPAMIENTO_CARGADO });
      addToast('Equipamiento guardado correctamente', 'success');
      loadModelos();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al guardar equipamiento', 'error');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnviarARevision = async () => {
    if (!modeloSeleccionado) return;

    setIsSaving(true);
    try {
      // Determinar el estado de revisión según el estado actual
      let nuevoEstado: ModeloEstado;
      if (
        modeloSeleccionado.Estado === ModeloEstado.DATOS_MINIMOS ||
        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_MINIMOS
      ) {
        // Primero validar datos mínimos
        await estadoService.validarDatosMinimos(modeloSeleccionado.ModeloID);
        nuevoEstado = ModeloEstado.REVISION_MINIMOS;
      } else if (
        modeloSeleccionado.Estado === ModeloEstado.EQUIPAMIENTO_CARGADO ||
        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_EQUIPAMIENTO
      ) {
        nuevoEstado = ModeloEstado.REVISION_EQUIPAMIENTO;
      } else {
        addToast('El modelo no está en un estado válido para enviar a revisión', 'error');
        return;
      }

      await estadoService.cambiarEstado(modeloSeleccionado.ModeloID, {
        nuevoEstado,
      });

      addToast('Enviado a revisión correctamente', 'success');
      setModeloSeleccionado(null);
      loadModelos();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 
        error.response?.data?.camposFaltantes?.join(', ') || 
        'Error al enviar a revisión', 
        'error'
      );
    } finally {
      setIsSaving(false);
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
        title="Cargar Datos de Modelos"
        subtitle="Carga de datos mínimos y equipamiento de vehículos"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Lista de modelos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Modelos Pendientes ({modelosFiltrados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar modelo o marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {modelosFiltrados.map(modelo => (
                <div
                  key={modelo.ModeloID}
                  onClick={() => setModeloSeleccionado(modelo)}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                    modeloSeleccionado?.ModeloID === modelo.ModeloID ? 'bg-accent border-primary' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{modelo.MarcaNombre}</p>
                      <p className="text-sm text-gray-600">{modelo.DescripcionModelo}</p>
                      {modelo.CodigoAutodata && (
                        <p className="text-xs text-gray-500 mt-1">{modelo.CodigoAutodata}</p>
                      )}
                    </div>
                    <Badge color={estadoService.getEstadoBadgeColor(modelo.Estado)}>
                      {estadoService.getEstadoLabel(modelo.Estado)}
                    </Badge>
                  </div>
                  {modelo.ObservacionesRevision && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <strong>Observaciones:</strong> {modelo.ObservacionesRevision}
                    </div>
                  )}
                </div>
              ))}

              {modelosFiltrados.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay modelos pendientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formulario de carga */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {modeloSeleccionado
                ? `${modeloSeleccionado.MarcaNombre} - ${modeloSeleccionado.DescripcionModelo}`
                : 'Cargar Datos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!modeloSeleccionado ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Selecciona un modelo de la lista para comenzar a cargar datos</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Tabs value={tabActiva} onValueChange={(v) => setTabActiva(v as 'minimos' | 'equipamiento')}>
                  <TabsList>
                    <TabsTrigger value="minimos">Datos Mínimos (16 campos)</TabsTrigger>
                    <TabsTrigger value="equipamiento">Equipamiento (150+ campos)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="minimos">
                    <FormularioDatosMinimos
                      modelo={modeloSeleccionado}
                      onSave={handleGuardarDatosMinimos}
                      onCancel={() => setModeloSeleccionado(null)}
                    />
                    
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleEnviarARevision} disabled={isSaving} variant="default">
                        <Send className="h-4 w-4 mr-2" />
                        Enviar a Revisión
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="equipamiento">
                    <FormularioEquipamiento
                      equipamiento={equipamiento || {}}
                      onSave={handleGuardarEquipamiento}
                      onCancel={() => setModeloSeleccionado(null)}
                    />
                    
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleEnviarARevision} disabled={isSaving} variant="default">
                        <Send className="h-4 w-4 mr-2" />
                        Enviar a Revisión
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
