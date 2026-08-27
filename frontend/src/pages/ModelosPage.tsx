import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@components/layout/PageHeader';
import { Button } from '@components/ui/Button';
import { DataTable } from '@components/ui/DataTable';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { Input } from '@components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/Select';
import { modeloService } from '@services/modeloService';
import { marcasService } from '@/services/marcasService';
import estadoService from '@services/estadoService';
import { Modelo, ModeloEstado, ModeloFilters, UserRole } from '@/types/index';
import { Marca as MarcaResponse } from '@/types/marca';
import { Plus, Filter, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDebounce } from '@hooks/useDebounce';
import { useAuth } from '@context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';

// Combustibles reconocidos por el sistema (mismo listado que Datos Mínimos)
const COMBUSTIBLES = ['NAFTA', 'DIESEL', 'ELÉCTRICO', 'HÍBRIDO', 'GNC'];

export function ModelosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [marcas, setMarcas] = useState<MarcaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ModeloFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingModelo, setDeletingModelo] = useState<Modelo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.rol === UserRole.ADMIN;

  useEffect(() => {
    loadMarcas();
  }, []);

  useEffect(() => {
    loadModelos();
  }, [debouncedSearch, filters]);

  const loadMarcas = async () => {
    try {
      const data = await marcasService.getAll();
      console.log('ModelosPage - Marcas loaded:', data);
      setMarcas(data || []);
    } catch (error: any) {
      console.error('Error loading marcas:', error);
      console.error('Error details:', error.response?.data);
      setMarcas([]);
    }
  };

  const loadModelos = async () => {
    setIsLoading(true);
    try {
      const filterParams: ModeloFilters = {
        ...filters,
        search: debouncedSearch || undefined,
      };
      console.log('Loading modelos with filters:', filterParams);
      const response = await modeloService.getAll(filterParams);
      console.log('Modelos response:', response);
      setModelos(response.data || []);
    } catch (error) {
      console.error('Error loading modelos:', error);
      setModelos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ModeloFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleDeletePermanente = async () => {
    if (!deletingModelo) return;
    setIsDeleting(true);
    try {
      await modeloService.deletePermanente(deletingModelo.ModeloID);
      setModelos((prev) => prev.filter((m) => m.ModeloID !== deletingModelo.ModeloID));
      setDeletingModelo(null);
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      alert(error.response?.data?.message || 'Error al eliminar el modelo');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Modelo>[] = [
    {
      accessorKey: 'MarcaNombre',
      header: 'Marca',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.MarcaNombre || '-'}</span>
      ),
    },
    {
      accessorKey: 'Modelo',
      header: 'Modelo',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.Modelo}</span>
      ),
    },
    {
      accessorKey: 'Familia',
      header: 'Familia',
      cell: ({ row }) => (
        <span>{row.original.Familia || '-'}</span>
      ),
    },
    {
      accessorKey: 'CodigoMarca',
      header: 'Cód. Marca',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.CodigoMarca || '-'}</span>
      ),
    },
    {
      accessorKey: 'CodigoModelo',
      header: 'Cód. Modelo',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.CodigoModelo || '-'}</span>
      ),
    },
    {
      accessorKey: 'Tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <span>{row.original.Tipo || '-'}</span>
      ),
    },
    {
      accessorKey: 'Estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.original.Estado;
        if (!estado) return <span className="text-muted-foreground text-sm">-</span>;

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoService.getEstadoBadgeColor(estado)}`}>
            {estadoService.getEstadoLabel(estado)}
          </span>
        );
      },
    },
    {
      accessorKey: 'FechaCreacion',
      header: 'Fecha Creación',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.FechaCreacion ? format(new Date(row.original.FechaCreacion), 'dd/MM/yyyy', { locale: es }) : '-'}
        </span>
      ),
    },
    ...(isAdmin ? [{
      id: 'acciones',
      header: '',
      cell: ({ row }: { row: { original: Modelo } }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
          onClick={(e) => {
            e.stopPropagation();
            setDeletingModelo(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    }] : []),
  ];

  if (isLoading && modelos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando modelos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Modelos"
        description="Administra y visualiza todos los modelos del sistema"
        actions={
          <Button onClick={() => navigate('/modelos/nuevo')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Modelo
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filtros</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Buscar modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select
            value={filters.marcaId?.toString() || 'all'}
            onValueChange={(value) => handleFilterChange('marcaId', value === 'all' ? undefined : Number(value))}
          >
            <SelectTrigger label="Marca">
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {marcas.map((marca) => (
                <SelectItem key={marca.MarcaID} value={marca.MarcaID.toString()}>
                  {marca.Marca}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.estado || 'all'}
            onValueChange={(value) => handleFilterChange('estado', value === 'all' ? undefined : (value as ModeloEstado))}
          >
            <SelectTrigger label="Estado">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.values(ModeloEstado).map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estadoService.getEstadoLabel(estado)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.combustible || 'all'}
            onValueChange={(value) => handleFilterChange('combustible', value === 'all' ? undefined : value)}
          >
            <SelectTrigger label="Combustible">
              <SelectValue placeholder="Todos los combustibles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los combustibles</SelectItem>
              {COMBUSTIBLES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={clearFilters} className="w-full">
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-card rounded-lg border p-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {modelos.length} modelo{modelos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <DataTable
          columns={columns}
          data={modelos}
          searchPlaceholder="Buscar en resultados..."
          onRowClick={(row) => navigate(`/modelos/${row.ModeloID}`)}
        />
      </div>

      {/* Diálogo confirmación eliminar permanente (solo admin) */}
      <AlertDialog open={!!deletingModelo} onOpenChange={(open) => !open && setDeletingModelo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar modelo definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar permanentemente el modelo{' '}
              <strong>{deletingModelo?.Modelo || deletingModelo?.DescripcionModelo || `ID ${deletingModelo?.ModeloID}`}</strong>.
              <br /><br />
              Esta acción <strong>no se puede deshacer</strong>. Se borrarán también todos sus datos de equipamiento, precios e historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePermanente}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar definitivamente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
