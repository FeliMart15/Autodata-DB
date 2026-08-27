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
import { equipamientoService } from '@services/equipamientoService';
import { useToast } from '@context/ToastContext';
import { Modelo, ModeloEstado } from '@/types';
import { Search, Send, AlertCircle, FileText, Filter } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/Select';
import { FormularioDatosMinimos } from '@components/modelos/FormularioDatosMinimos';
import { FormularioEquipamiento } from '@components/modelos/FormularioEquipamiento';

export function CargarDatosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modeloSeleccionado, setModeloSeleccionado] = useState<Modelo | null>(null);
  const [equipamiento, setEquipamiento] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
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
      const equipamientoData = await equipamientoService.getByModeloId(modeloId);
      setEquipamiento(equipamientoData || {});
    } catch (error: any) {
      addToast('Error al cargar equipamiento', 'error');
      setEquipamiento({});
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

  const handleSelectModelo = async (modelo: Modelo) => {
    try {
      setIsLoading(true);
      // Fetch completo para obtener Cylindros, CC, HP, que no vienen en el getAll
      const modeloCompleto = await modeloService.getById(modelo.ModeloID);
      setModeloSeleccionado(modeloCompleto);
    } catch (error) {
      console.error('Error fetching full model:', error);
      addToast('Error al cargar datos del modelo', 'error');
      setModeloSeleccionado(modelo); // Fallback to basic
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuardarDatosMinimos = async (datosActualizados: Partial<Modelo>) => {
    if (!modeloSeleccionado) return;

    setIsSaving(true);
    try {
      await modeloService.update(modeloSeleccionado.ModeloID, datosActualizados);
      addToast('Borrador guardado correctamente. Puedes continuar más tarde.', 'success');
      
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
      // Save equipamiento data
      if (equipamiento && equipamiento.EquipamientoID) {
        await equipamientoService.update(modeloSeleccionado.ModeloID, datosEquipamiento);
      } else {
        await equipamientoService.create({ ...datosEquipamiento, modeloId: modeloSeleccionado.ModeloID });
      }
      
      // Recargar equipamiento
      const req = await equipamientoService.getByModeloId(modeloSeleccionado.ModeloID);
      setEquipamiento(req || {});

    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al guardar equipamiento', 'error');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

const handleEnviarARevision = async (formData: any) => {
    if (!modeloSeleccionado) return;

    setIsSaving(true);
    try {
      let nuevoEstado: ModeloEstado;
      const isFaseMinimos = [
        ModeloEstado.DATOS_MINIMOS,
        ModeloEstado.IMPORTADO,
        ModeloEstado.CREADO,
        ModeloEstado.CORREGIR_MINIMOS
      ].includes(modeloSeleccionado.Estado);

      if (isFaseMinimos) {
        // Guardar antes de enviar (evita que falten campos si no han guardado explícitamente)
        await modeloService.update(modeloSeleccionado.ModeloID, formData);

        // Validar datos mínimos antes de enviar usando el backend
        const validacion = await estadoService.validarDatosMinimos(modeloSeleccionado.ModeloID);
        if (!validacion.data.datosCompletos) {
          const camposFaltantes = validacion.data.camposFaltantes.join(', ');
          addToast(`Faltan campos obligatorios: ${camposFaltantes}`, 'error');
          return;
        }
        nuevoEstado = ModeloEstado.REVISION_MINIMOS;
      } else if (
        [ModeloEstado.EQUIPAMIENTO_CARGADO, ModeloEstado.CORREGIR_EQUIPAMIENTO, ModeloEstado.MINIMOS_APROBADOS].includes(modeloSeleccionado.Estado)
      ) {
        if (equipamiento && equipamiento.EquipamientoID) {
          await equipamientoService.update(modeloSeleccionado.ModeloID, formData);
        } else {
          await equipamientoService.create({ ...formData, modeloId: modeloSeleccionado.ModeloID });
        }
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
      console.error('Error al enviar a revisión:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.detalles?.join(', ') ||
                      error.message ||
                      'Error al enviar a revisión';
      addToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const modelosFiltrados = modelos.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      m.DescripcionModelo?.toLowerCase().includes(searchLower) ||
      m.MarcaNombre?.toLowerCase().includes(searchLower) ||
      m.CodigoAutodata?.includes(searchLower);

    let matchesEstado = true;
    if (estadoFilter === 'minimos_pendientes') {
      matchesEstado = [ModeloEstado.IMPORTADO, ModeloEstado.CREADO, ModeloEstado.DATOS_MINIMOS].includes(m.Estado);
    } else if (estadoFilter === 'minimos_corregir') {
      matchesEstado = m.Estado === ModeloEstado.CORREGIR_MINIMOS;
    } else if (estadoFilter === 'equipamiento_pendiente') {
      matchesEstado = [ModeloEstado.MINIMOS_APROBADOS, ModeloEstado.EQUIPAMIENTO_CARGADO].includes(m.Estado);
    } else if (estadoFilter === 'equipamiento_corregir') {
      matchesEstado = m.Estado === ModeloEstado.CORREGIR_EQUIPAMIENTO;
    }

    return matchesSearch && matchesEstado;
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
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar modelo o marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los pendientes</SelectItem>
                    <SelectItem value="minimos_pendientes">Carga Datos Mínimos</SelectItem>
                    <SelectItem value="minimos_corregir">A corregir Mínimos</SelectItem>
                    <SelectItem value="equipamiento_pendiente">Carga Equipamiento</SelectItem>
                    <SelectItem value="equipamiento_corregir">A corregir Equipamiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {modelosFiltrados.map(modelo => (
                <div
                  key={modelo.ModeloID}
                    onClick={() => handleSelectModelo(modelo)}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                    modeloSeleccionado?.ModeloID === modelo.ModeloID ? 'bg-accent border-primary' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{modelo.MarcaNombre}</p>
                      <p className="text-sm text-muted-foreground">{modelo.DescripcionModelo}</p>
                      {modelo.codigo_autodata && (
                        <p className="text-xs text-muted-foreground mt-1">{modelo.codigo_autodata}</p>
                      )}
                    </div>
                    <Badge color={estadoService.getEstadoBadgeColor(modelo.Estado)}>
                      {estadoService.getEstadoLabel(modelo.Estado)}
                    </Badge>
                  </div>
                  {modelo.ObservacionesRevision && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50 rounded text-xs">
                      <strong>Observaciones:</strong> {modelo.ObservacionesRevision}
                    </div>
                  )}
                </div>
              ))}

              {modelosFiltrados.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
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
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>Selecciona un modelo de la lista para comenzar a cargar datos</p>
              </div>
            ) : (
              <div className="space-y-4">
                  <Tabs value={tabActiva} onValueChange={(v) => { 
                    const isEq = [ModeloEstado.MINIMOS_APROBADOS, ModeloEstado.EQUIPAMIENTO_CARGADO, ModeloEstado.CORREGIR_EQUIPAMIENTO].includes(modeloSeleccionado.Estado);
                    if (v === 'equipamiento' && !isEq) { addToast('Se requieren datos mínimos primero', 'error'); return; } 
                    setTabActiva(v as 'minimos' | 'equipamiento'); 
                  }}>
  {(() => {
    const isFaseMinimos = [
      ModeloEstado.IMPORTADO,
      ModeloEstado.CREADO,
      ModeloEstado.DATOS_MINIMOS,
      ModeloEstado.CORREGIR_MINIMOS
    ].includes(modeloSeleccionado.Estado);

    const isFaseEquipamiento = [
      ModeloEstado.MINIMOS_APROBADOS,
      ModeloEstado.EQUIPAMIENTO_CARGADO,
      ModeloEstado.CORREGIR_EQUIPAMIENTO
    ].includes(modeloSeleccionado.Estado);

    return (
      <>
        <TabsList>
          <TabsTrigger value="minimos">Datos M\u00ednimos (16 campos)</TabsTrigger>
          <TabsTrigger value="equipamiento" disabled={!isFaseEquipamiento}>Equipamiento (150+ campos)</TabsTrigger>
        </TabsList>

        <TabsContent value="minimos">
          {modeloSeleccionado.Estado === ModeloEstado.CORREGIR_MINIMOS && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50 rounded-md text-red-800 dark:text-red-300">
              <h4 className="font-semibold flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Correcciones solicitadas (Mínimos)</h4>
              <p className="mt-1">{(modeloSeleccionado as any).ObservacionesRevision || "Revisa los datos mínimos, se han solicitado correcciones."}</p>
            </div>
          )}
          <FormularioDatosMinimos
            modelo={modeloSeleccionado}
            onSave={isFaseMinimos ? handleGuardarDatosMinimos : undefined}
            onCancel={() => setModeloSeleccionado(null)}
            readonly={!isFaseMinimos}
            onSendRevision={isFaseMinimos ? handleEnviarARevision : undefined}
          />
        </TabsContent>

        <TabsContent value="equipamiento">
          {modeloSeleccionado.Estado === ModeloEstado.CORREGIR_EQUIPAMIENTO && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50 rounded-md text-red-800 dark:text-red-300">
              <h4 className="font-semibold flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Correcciones solicitadas (Equipamiento)</h4>
              <p className="mt-1">{(modeloSeleccionado as any).ObservacionesRevision || "Revisa el equipamiento, se han solicitado correcciones."}</p>
            </div>
          )}

          <FormularioEquipamiento
            equipamiento={equipamiento || {}}
            onSave={isFaseEquipamiento ? handleGuardarEquipamiento : undefined}
            onCancel={() => setModeloSeleccionado(null)}
            readonly={!isFaseEquipamiento}
            onSendRevision={isFaseEquipamiento ? handleEnviarARevision : undefined}
            modeloHP={modeloSeleccionado?.HP}
          />
        </TabsContent>
      </>
    );
  })()}
</Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
