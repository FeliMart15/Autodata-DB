import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { StatCard } from '@components/layout/StatCard';
import { PageHeader } from '@components/layout/PageHeader';
import { Badge } from '@components/ui/Badge';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { Button } from '@components/ui/Button';
import { useAuth } from '@context/AuthContext';
import { modeloService } from '@services/modeloService';
import { Modelo, ModeloEstado, UserRole } from '@types/index';
import estadoService from '@services/estadoService';
import { 
  Car, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  FileText,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentModels, setRecentModels] = useState<Modelo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Cargar estadísticas por estado
      const [allModels, importadosFetch, datosMinFetch, revMinFetch, corregirMinFetch, minimosAprobFetch, equipamientoFetch, revEquipFetch, corregirEquipFetch, definitivoFetch] = await Promise.all([
        modeloService.getAll({ page: 1, limit: 10 }),
        modeloService.getAll({ estado: ModeloEstado.IMPORTADO }),
        modeloService.getAll({ estado: ModeloEstado.DATOS_MINIMOS }),
        modeloService.getAll({ estado: ModeloEstado.REVISION_MINIMOS }),
        modeloService.getAll({ estado: ModeloEstado.CORREGIR_MINIMOS }),
        modeloService.getAll({ estado: ModeloEstado.MINIMOS_APROBADOS }),
        modeloService.getAll({ estado: ModeloEstado.EQUIPAMIENTO_CARGADO }),
        modeloService.getAll({ estado: ModeloEstado.REVISION_EQUIPAMIENTO }),
        modeloService.getAll({ estado: ModeloEstado.CORREGIR_EQUIPAMIENTO }),
        modeloService.getAll({ estado: ModeloEstado.DEFINITIVO })
      ]);

      setRecentModels(allModels.data || []);
      setStats({
        total: allModels.pagination?.total || 0,
        importado: importadosFetch.pagination?.total || 0,
        datos_minimos: datosMinFetch.pagination?.total || 0,
        revision_minimos: revMinFetch.pagination?.total || 0,
        corregir_minimos: corregirMinFetch.pagination?.total || 0,
        minimos_aprobados: minimosAprobFetch.pagination?.total || 0,
        equipamiento_cargado: equipamientoFetch.pagination?.total || 0,
        revision_equipamiento: revEquipFetch.pagination?.total || 0,
        corregir_equipamiento: corregirEquipFetch.pagination?.total || 0,
        definitivo: definitivoFetch.pagination?.total || 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  const getEstadoBadgeColor = (estado: string) => {
    return estadoService.getEstadoBadgeColor(estado);
  };

  const getRoleQuickActions = () => {
    switch (user?.role) {
      case UserRole.ENTRADA_DATOS:
      case UserRole.ADMIN:
        return [
          { label: 'Importar Modelos CSV', href: '/import', icon: Upload, description: 'Importar desde archivo' },
          { label: 'Cargar Datos', href: '/cargar-datos', icon: FileText, description: 'Completar datos mínimos y equipamiento' },
          { label: 'Ver Todos los Modelos', href: '/modelos', icon: Car, description: `${stats?.total || 0} modelos totales` },
        ];
      case UserRole.REVISION:
        return [
          { label: 'Revisar Modelos', href: '/revisar', icon: CheckCircle2, description: `${(stats?.revision_minimos || 0) + (stats?.revision_equipamiento || 0)} pendientes` },
          { label: 'Ver Modelos', href: '/modelos', icon: Car, description: 'Ver todos los modelos' },
        ];
      case UserRole.APROBACION:
        return [
          { label: 'Revisar Modelos', href: '/revisar', icon: CheckCircle2, description: `${(stats?.revision_minimos || 0) + (stats?.revision_equipamiento || 0)} para revisar` },
          { label: 'Ver Modelos', href: '/modelos', icon: Car, description: 'Ver todos los modelos' },
        ];
      default:
        return [
          { label: 'Ver Modelos', href: '/modelos', icon: Car, description: 'Ver catálogo completo' },
        ];
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bienvenido, ${user?.nombre || user?.username}`}
        description="Panel de control del sistema Autodata"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Modelos"
          value={stats?.total || 0}
          icon={Car}
          description="En el sistema"
        />
        <StatCard
          title="Datos Mínimos"
          value={(stats?.datos_minimos || 0) + (stats?.revision_minimos || 0) + (stats?.corregir_minimos || 0)}
          icon={Clock}
          description={`${stats?.revision_minimos || 0} en revisión`}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/cargar-datos')}
        />
        <StatCard
          title="Equipamiento"
          value={(stats?.equipamiento_cargado || 0) + (stats?.revision_equipamiento || 0) + (stats?.corregir_equipamiento || 0)}
          icon={AlertCircle}
          description={`${stats?.revision_equipamiento || 0} en revisión`}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/cargar-datos')}
        />
        <StatCard
          title="Definitivos"
          value={stats?.definitivo || 0}
          icon={CheckCircle2}
          description="Aprobados y publicables"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {getRoleQuickActions().map((action) => (
              <button
                key={action.href}
                onClick={() => navigate(action.href)}
                className="w-full flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{action.label}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Estado por Workflow */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-sm font-medium">Datos Mínimos</span>
              <span className="text-2xl font-bold text-blue-600">{stats?.requisitos_minimos || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <span className="text-sm font-medium">Equipamiento Cargado</span>
              <span className="text-2xl font-bold text-yellow-600">{stats?.equipamiento_cargado || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
              <span className="text-sm font-medium">En Revisión</span>
              <span className="text-2xl font-bold text-orange-600">{stats?.en_revision || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
              <span className="text-sm font-medium">En Aprobación</span>
              <span className="text-2xl font-bold text-purple-600">{stats?.en_aprobacion || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
              <span className="text-sm font-medium">Para Corregir</span>
              <span className="text-2xl font-bold text-red-600">{stats?.para_corregir || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <span className="text-sm font-medium">Definitivos</span>
              <span className="text-2xl font-bold text-green-600">{stats?.definitivo || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Models */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Modelos Recientes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/modelos')}>
              Ver Todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentModels.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay modelos recientes</p>
          ) : (
            <div className="space-y-3">
              {recentModels.slice(0, 5).map((modelo) => (
                <div
                  key={modelo.ModeloID}
                  onClick={() => navigate(`/modelos/${modelo.ModeloID}`)}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {modelo.MarcaNombre} {modelo.Modelo}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {modelo.Familia} • {modelo.Anio}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {modelo.CodigoAutodata && (
                      <span className="text-xs font-mono px-2 py-1 rounded bg-purple-100 text-purple-800">
                        {modelo.CodigoAutodata}
                      </span>
                    )}
                    <Badge estado={modelo.Estado} />
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}