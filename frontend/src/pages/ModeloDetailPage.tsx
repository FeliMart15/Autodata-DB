import {  useEffect, useState  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@components/layout/PageHeader';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/Tabs';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { Alert } from '@components/ui/Alert';
import { DatosMinimosForm } from '@components/modelos/DatosMinimosForm';
import { ModeloDetailView } from '@components/modelos/ModeloDetailView';
import { EquipamientoView } from '@components/equipamiento/EquipamientoView';
import { EquipamientoForm } from '@components/equipamiento/EquipamientoForm';
import { PreciosView } from '@components/precios/PreciosView';
import { HistorialSection } from '@components/historial/HistorialSection';
import { VentasHistorial } from '@components/ventas/VentasHistorial';
import { EmpadronamientosHistorial } from '@components/empadronamientos/EmpadronamientosHistorial';
import { modeloService } from '@services/modeloService';
import { Modelo, ModeloEstado, UserRole } from '@/types/index';
import { ArrowLeft, Save, Send, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';

export function ModeloDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [modelo, setModelo] = useState<Modelo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('datos');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const isNewModel = id === 'nuevo';

  useEffect(() => {
    if (id && !isNewModel) {
      loadModelo();
    } else if (isNewModel) {
      setIsLoading(false);
    }
  }, [id]);

  const loadModelo = async () => {
    try {
      const data = await modeloService.getById(Number(id));
      setModelo(data);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al cargar el modelo', 'error');
      navigate('/modelos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: ModeloEstado, observaciones?: string) => {
    if (!modelo) return;

    try {
      // Actualizar estado y comentario si existe
      const updateData: any = { Estado: nuevoEstado };
      if (observaciones) {
        updateData.UltimoComentario = observaciones;
      }
      
      await modeloService.update(modelo.ModeloID || modelo.id_modelo, updateData);
      addToast('Estado actualizado correctamente', 'success');
      loadModelo();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al cambiar estado', 'error');
    }
  };

  const canEdit = () => {
    if (!user || !modelo) return false;
    
    // Admin can always edit
    if (user.rol === UserRole.ADMIN) return true;
    
    const estadoActual = modelo.Estado || modelo.estado;
    
    // Role-based editing permissions
    switch (user.rol) {
      case UserRole.ENTRADA_DATOS:
        return [
          'IMPORTADO',
          'DATOS_MINIMOS',
          'EQUIPAMIENTO_CARGADO',
          'CORREGIR_EQUIPAMIENTO',
        ].includes(estadoActual);
      
      case UserRole.REVISION:
        return estadoActual === 'REVISION_EQUIPAMIENTO';
      
      case UserRole.APROBACION:
        return estadoActual === 'MINIMOS_APROBADOS';
      
      default:
        return false;
    }
  };

  const getAvailableActions = () => {
    if (!modelo || !user) return [];

    const actions: Array<{
      label: string;
      icon: any;
      variant: 'default' | 'success' | 'destructive' | 'warning';
      onClick: () => void;
      estado: string;
    }> = [];

    const estadoActual = modelo.Estado || modelo.estado;

    switch (estadoActual) {
      case 'EQUIPAMIENTO_CARGADO':
        if (user.rol === UserRole.ENTRADA_DATOS || user.rol === UserRole.ADMIN) {
          actions.push({
            label: 'Enviar a Revisión',
            icon: Send,
            variant: 'default',
            onClick: () => handleCambiarEstado(ModeloEstado.REVISION_EQUIPAMIENTO),
            estado: 'REVISION_EQUIPAMIENTO',
          });
        }
        break;

      case 'REVISION_EQUIPAMIENTO':
        if (user.rol === UserRole.REVISION || user.rol === UserRole.ADMIN) {
          actions.push(
            {
              label: 'Aprobar',
              icon: CheckCircle2,
              variant: 'success',
              onClick: () => handleCambiarEstado(ModeloEstado.MINIMOS_APROBADOS),
              estado: 'MINIMOS_APROBADOS',
            },
            {
              label: 'Devolver para Corrección',
              icon: XCircle,
              variant: 'destructive',
              onClick: () => handleCambiarEstado(ModeloEstado.CORREGIR_EQUIPAMIENTO, 'Requiere correcciones'),
              estado: 'CORREGIR_EQUIPAMIENTO',
            }
          );
        }
        break;

      case 'MINIMOS_APROBADOS':
        if (user.rol === UserRole.APROBACION || user.rol === UserRole.ADMIN) {
          actions.push(
            {
              label: 'Aprobar Definitivamente',
              icon: CheckCircle2,
              variant: 'success',
              onClick: () => handleCambiarEstado(ModeloEstado.DEFINITIVO),
              estado: 'DEFINITIVO',
            },
            {
              label: 'Rechazar',
              icon: XCircle,
              variant: 'destructive',
              onClick: () => handleCambiarEstado(ModeloEstado.CORREGIR_EQUIPAMIENTO, 'Rechazado por aprobador - Requiere correcciones'),
              estado: 'CORREGIR_EQUIPAMIENTO',
            }
          );
        }
        break;
    }

    return actions;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando modelo..." />
      </div>
    );
  }

  // Modo de creación de nuevo modelo
  if (isNewModel) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/modelos')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Nuevo Modelo</h1>
                <p className="text-muted-foreground mt-1">
                  Completa los datos mínimos para crear un nuevo modelo
                </p>
              </div>
            </div>
          }
        />

        <DatosMinimosForm
          modelo={null}
          onUpdate={(createdModeloId) => {
            addToast('Modelo creado exitosamente', 'success');
            // Redirigir al modelo recién creado en modo lectura
            if (createdModeloId) {
              navigate(`/modelos/${createdModeloId}`);
            }
          }}
          readOnly={false}
        />
      </div>
    );
  }

  if (!modelo) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          No se encontró el modelo solicitado
        </Alert>
      </div>
    );
  }

  const actions = getAvailableActions();

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/modelos')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  {modelo.MarcaNombre || 'Sin marca'} {modelo.DescripcionModelo || modelo.Modelo || modelo.modelo}
                </h1>
                {modelo.codigo_autodata && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-mono font-medium bg-purple-100 text-purple-800">
                    {modelo.codigo_autodata}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {modelo.Familia || modelo.familia}
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <Badge estado={(modelo.Estado || modelo.estado) as ModeloEstado} />
            <span className="text-sm text-muted-foreground">
              Etapa {modelo.Etapa || modelo.etapa}
            </span>
          </div>
        }
      />

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.estado}
              variant={action.variant}
              onClick={action.onClick}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="datos">Datos Mínimos</TabsTrigger>
          <TabsTrigger value="equipamiento">Equipamiento</TabsTrigger>
          <TabsTrigger value="precios">Precios</TabsTrigger>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="empadronamientos">Empadronamientos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="mt-6">
          <ModeloDetailView modelo={modelo} />
        </TabsContent>

        <TabsContent value="equipamiento" className="mt-6">
          <EquipamientoView modeloId={modelo.ModeloID || modelo.id_modelo} />
        </TabsContent>

        <TabsContent value="precios" className="mt-6">
          <PreciosView modeloId={modelo.ModeloID || modelo.id_modelo} />
        </TabsContent>

        <TabsContent value="ventas" className="mt-6">
          <VentasHistorial modeloId={modelo.ModeloID || modelo.id_modelo} />
        </TabsContent>

        <TabsContent value="empadronamientos" className="mt-6">
          <EmpadronamientosHistorial modeloId={modelo.ModeloID || modelo.id_modelo} />
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <HistorialSection modeloId={modelo.ModeloID || modelo.id_modelo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
