import { useState, useEffect } from 'react';
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
import { Search, Send, AlertCircle, FileText, CheckSquare } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { FormularioDatosMinimos } from '@components/modelos/FormularioDatosMinimos';
import { FormularioEquipamiento } from '@components/modelos/FormularioEquipamiento';

export function AgregarDatosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modeloSeleccionado, setModeloSeleccionado] = useState<Modelo | null>(null);
  const [equipamiento, setEquipamiento] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabActiva, setTabActiva] = useState<'minimos' | 'equipamiento'>('minimos');
  const [formDataMinimos, setFormDataMinimos] = useState<Partial<Modelo>>({});
  const { addToast } = useToast();

  useEffect(() => {
    loadModelos();
  }, []);

  useEffect(() => {
    // Determinar tab activa y cargar equipamiento al seleccionar modelo
    if (modeloSeleccionado) {
      // Si está en fase de datos mínimos
      if (
        modeloSeleccionado.Estado === ModeloEstado.IMPORTADO ||
        modeloSeleccionado.Estado === ModeloEstado.CREADO ||
        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_MINIMOS
      ) {
        setTabActiva('minimos');
      } 
      // Si está en fase de equipamiento
      else if (
        modeloSeleccionado.Estado === ModeloEstado.MINIMOS_APROBADOS ||
        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_EQUIPAMIENTO
      ) {
        setTabActiva('equipamiento');
        // Cargar equipamiento si está en fase de equipamiento
        loadEquipamiento(modeloSeleccionado.ModeloID);
      }
    }
  }, [modeloSeleccionado]);

  const loadEquipamiento = async (_modeloId: number) => {
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
      const response = await modeloService.getAll({});
      // Filtrar manualmente por estados que necesitan carga de datos
      // (excluir los que están en revisión)
      const estadosPermitidos = [
        ModeloEstado.IMPORTADO,
        ModeloEstado.CREADO,
        ModeloEstado.CORREGIR_MINIMOS,
        ModeloEstado.MINIMOS_APROBADOS,
        ModeloEstado.CORREGIR_EQUIPAMIENTO
      ];
      const modelosFiltrados = (response.data || []).filter((m: Modelo) => 
        estadosPermitidos.includes(m.Estado as ModeloEstado)
      );
      setModelos(modelosFiltrados);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al cargar modelos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuardarEquipamiento = async (equipamientoData: any) => {
    if (!modeloSeleccionado) return;

    setIsSaving(true);
    try {
      // TODO: Implementar servicio de equipamiento cuando esté listo
      // await equipamientoService.saveEquipamiento(modeloSeleccionado.ModeloID, equipamientoData);
      console.log('Equipamiento a guardar:', equipamientoData);
      
      // Cambiar estado a EQUIPAMIENTO_CARGADO
      await estadoService.cambiarEstado(modeloSeleccionado.ModeloID, { 
        nuevoEstado: ModeloEstado.EQUIPAMIENTO_CARGADO 
      });

      addToast('Equipamiento guardado correctamente', 'success');
      loadModelos();
      
      // Actualizar el modelo seleccionado
      const modeloActualizado = await modeloService.getById(modeloSeleccionado.ModeloID);
      setModeloSeleccionado(modeloActualizado);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Error al guardar equipamiento', 
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnviarARevision = async () => {
    if (!modeloSeleccionado) return;

    setIsSaving(true);
    try {
      let nuevoEstado: ModeloEstado;
      
      if (
        modeloSeleccionado.Estado === ModeloEstado.CREADO ||
        modeloSeleccionado.Estado === ModeloEstado.IMPORTADO ||
        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_MINIMOS
      ) {
        // Guardar datos mínimos
        await modeloService.update(modeloSeleccionado.ModeloID, formDataMinimos);
        nuevoEstado = ModeloEstado.REVISION_MINIMOS;
      } else if (
        modeloSeleccionado.Estado === ModeloEstado.MINIMOS_APROBADOS ||
        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_EQUIPAMIENTO
      ) {
        // Guardar equipamiento (TODO: implementar cuando esté listo)
        nuevoEstado = ModeloEstado.REVISION_EQUIPAMIENTO;
      } else {
        addToast('Estado no válido', 'error');
        return;
      }

      // Cambiar estado
      await estadoService.cambiarEstado(modeloSeleccionado.ModeloID, { nuevoEstado });

      addToast('Enviado a revisión correctamente', 'success');
      setModeloSeleccionado(null);
      loadModelos();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Error al enviar a revisión', 
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
        title="Agregar Datos de Modelos"
        description="Complete los datos mínimos (15 campos) y el equipamiento (150+ campos) de los vehículos"
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
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              {modeloSeleccionado
                ? `${modeloSeleccionado.MarcaNombre} - ${modeloSeleccionado.DescripcionModelo}`
                : 'Agregar Datos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!modeloSeleccionado ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Selecciona un modelo de la lista para comenzar a agregar datos</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Flujo de Trabajo:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li><strong>Datos Mínimos:</strong> Complete los 15 campos obligatorios (Combustible ya cargado)</li>
                    <li><strong>Enviar a Revisión:</strong> Los datos serán validados</li>
                    <li><strong>Aprobación:</strong> Si se aprueban, puede cargar el equipamiento</li>
                    <li><strong>Equipamiento:</strong> Complete los 150+ campos de equipamiento</li>
                    <li><strong>Enviar a Revisión Final:</strong> Revisión y aprobación final</li>
                  </ol>
                </div>

                <Tabs value={tabActiva} onValueChange={(v) => setTabActiva(v as 'minimos' | 'equipamiento')}>
                  <TabsList>
                    <TabsTrigger 
                      value="minimos"
                      disabled={
                        modeloSeleccionado.Estado === ModeloEstado.MINIMOS_APROBADOS ||
                        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_EQUIPAMIENTO
                      }
                    >
                      Datos Mínimos (15 campos obligatorios)
                      {(modeloSeleccionado.Estado === ModeloEstado.MINIMOS_APROBADOS ||
                        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_EQUIPAMIENTO) && (
                        <span className="ml-2 text-xs text-gray-500">(ya completado y aprobado)</span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="equipamiento" 
                      disabled={
                        modeloSeleccionado.Estado === ModeloEstado.IMPORTADO ||
                        modeloSeleccionado.Estado === ModeloEstado.CREADO ||
                        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_MINIMOS
                      }
                    >
                      Equipamiento (150+ campos)
                      {(modeloSeleccionado.Estado === ModeloEstado.IMPORTADO ||
                        modeloSeleccionado.Estado === ModeloEstado.CREADO ||
                        modeloSeleccionado.Estado === ModeloEstado.CORREGIR_MINIMOS) && (
                        <span className="ml-2 text-xs text-gray-500">(requiere aprobación de datos mínimos)</span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="minimos">
                    <FormularioDatosMinimos
                      modelo={modeloSeleccionado}
                      readonly={false}
                      onChange={(datos) => setFormDataMinimos(datos)}
                    />
                    
                    {/* Botones siempre visibles */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => {
                          // Cerrar sin guardar
                          setModeloSeleccionado(null);
                        }} 
                        variant="outline"
                        disabled={isSaving}
                      >
                        Cancelar
                      </Button>
                      
                      {/* Botón de enviar a revisión - siempre visible en fase de datos mínimos */}
                      <Button 
                        onClick={handleEnviarARevision} 
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar a Revisión
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="equipamiento">
                    <FormularioEquipamiento
                      equipamiento={equipamiento || {}}
                      onSave={handleGuardarEquipamiento}
                      onCancel={() => setModeloSeleccionado(null)}
                    />
                    
                    {/* Solo mostrar botón de revisión si está en EQUIPAMIENTO_CARGADO o CORREGIR_EQUIPAMIENTO */}
                    {(modeloSeleccionado.Estado === ModeloEstado.EQUIPAMIENTO_CARGADO ||
                      modeloSeleccionado.Estado === ModeloEstado.CORREGIR_EQUIPAMIENTO) && (
                      <div className="flex gap-2 mt-4">
                        <Button onClick={handleEnviarARevision} disabled={isSaving} variant="default">
                          <Send className="h-4 w-4 mr-2" />
                          Enviar a Revisión Final
                        </Button>
                      </div>
                    )}
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
