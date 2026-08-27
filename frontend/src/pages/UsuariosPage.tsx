import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Key, Shield } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
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
} from '@components/ui/Dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface Usuario {
  UsuarioID: number;
  Username: string;
  Nombre: string;
  Email: string;
  Rol: string;
  Activo: boolean;
  FechaCreacion: string;
  FechaUltimoAcceso?: string;
}

export function UsuariosPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);
  const [changingPassword, setChangingPassword] = useState<Usuario | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock data por ahora - conectar con API después
  const usuarios: Usuario[] = [
    {
      UsuarioID: 1,
      Username: 'santiago.martinez',
      Nombre: 'Santiago Martínez',
      Email: 'santiago.martinez@autodata.com',
      Rol: 'admin',
      Activo: true,
      FechaCreacion: '2024-01-01T00:00:00Z',
      FechaUltimoAcceso: '2026-01-13T12:00:00Z',
    },
    {
      UsuarioID: 2,
      Username: 'claudio.bustillo',
      Nombre: 'Claudio Bustillo',
      Email: 'claudio.bustillo@autodata.com',
      Rol: 'aprobacion',
      Activo: true,
      FechaCreacion: '2024-01-01T00:00:00Z',
      FechaUltimoAcceso: '2026-01-13T10:30:00Z',
    },
    {
      UsuarioID: 3,
      Username: 'yanina.dotti',
      Nombre: 'Yanina Dotti',
      Email: 'yanina.dotti@autodata.com',
      Rol: 'revision',
      Activo: true,
      FechaCreacion: '2024-01-01T00:00:00Z',
      FechaUltimoAcceso: '2026-01-12T15:20:00Z',
    },
    {
      UsuarioID: 4,
      Username: 'noel.capurro',
      Nombre: 'Noel Capurro',
      Email: 'noel.capurro@autodata.com',
      Rol: 'entrada_datos',
      Activo: true,
      FechaCreacion: '2024-01-01T00:00:00Z',
      FechaUltimoAcceso: '2026-01-13T09:00:00Z',
    },
  ];

  const getRolBadge = (rol: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      aprobacion: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      revision: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      entrada_datos: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };

    const labels: Record<string, string> = {
      admin: 'Administrador',
      aprobacion: 'Aprobación',
      revision: 'Revisión',
      entrada_datos: 'Entrada de Datos',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[rol] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
        {labels[rol] || rol}
      </span>
    );
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.Nombre.toLowerCase().includes(search.toLowerCase()) ||
    usuario.Username.toLowerCase().includes(search.toLowerCase()) ||
    usuario.Email.toLowerCase().includes(search.toLowerCase())
  );

  // Solo admin puede acceder a esta página
  if (user?.rol !== 'admin') {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes permisos para acceder a esta página.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios del sistema y sus roles
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsuarios.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsuarios.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.UsuarioID}>
                    <TableCell>
                      <span className="font-mono text-sm">{usuario.Username}</span>
                    </TableCell>
                    <TableCell className="font-medium">{usuario.Nombre}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{usuario.Email}</span>
                    </TableCell>
                    <TableCell>{getRolBadge(usuario.Rol)}</TableCell>
                    <TableCell>
                      {usuario.Activo ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          Inactivo
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {usuario.FechaUltimoAcceso
                          ? new Date(usuario.FechaUltimoAcceso).toLocaleString('es-UY')
                          : 'Nunca'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setChangingPassword(usuario)}
                          title="Cambiar contraseña"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUsuario(usuario)}
                          title="Editar usuario"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingUsuario(usuario)}
                          title="Desactivar usuario"
                          disabled={usuario.UsuarioID === user?.id}
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
              No se encontraron usuarios
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar usuario - TODO: Implementar */}
      <Dialog open={isCreateDialogOpen || editingUsuario !== null} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingUsuario(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUsuario
                ? 'Modifica los datos del usuario'
                : 'Completa los datos para crear un nuevo usuario'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              Formulario en desarrollo...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para cambiar contraseña - TODO: Implementar */}
      <Dialog open={changingPassword !== null} onOpenChange={(open) => {
        if (!open) setChangingPassword(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Usuario: {changingPassword?.Username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              Formulario en desarrollo...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para desactivar usuario */}
      <AlertDialog open={deletingUsuario !== null} onOpenChange={(open) => {
        if (!open) setDeletingUsuario(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas desactivar al usuario{' '}
              <strong>{deletingUsuario?.Nombre}</strong>? El usuario no podrá iniciar sesión pero
              sus datos se conservarán en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // TODO: Implementar desactivación
                toast('Usuario desactivado correctamente', 'success');
                setDeletingUsuario(null);
              }}
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
