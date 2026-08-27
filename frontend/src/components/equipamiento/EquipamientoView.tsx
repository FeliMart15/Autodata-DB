import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { Alert } from '@components/ui/Alert';
import { equipamientoService } from '@services/equipamientoService';
import { labelEquip } from '@components/equipamiento/equipamientoLabels';
import { CheckCircle2, XCircle } from 'lucide-react';

interface EquipamientoViewProps {
  modeloId: number;
}

export function EquipamientoView({ modeloId }: EquipamientoViewProps) {
  const [equipamiento, setEquipamiento] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEquipamiento();
  }, [modeloId]);

  const loadEquipamiento = async () => {
    try {
      setIsLoading(true);
      const data = await equipamientoService.getByModeloId(modeloId);
      setEquipamiento(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar equipamiento');
    } finally {
      setIsLoading(false);
    }
  };

  const BooleanBadge = ({ value }: { value: any }) => {
    // Treat string 'No' or false as false, 'Si' 'N/A' etc accordingly
    if (value === true || value === 'Si' || value === 'Sí') {
        return <Badge variant="success" className="gap-1 bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3" /> Sí</Badge>;
    }
    if (value === false || value === 'No') {
        return <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" /> No</Badge>;
    }
    if (value === 'N/A' || value === 'N/D') {
        return <Badge variant="outline" className="gap-1 border-border text-muted-foreground">{value}</Badge>;
    }
    return <></>; // Won't be reached usually
  };

  const InfoRow = ({ label, value }: { label: string; value: any }) => {
    const vacio = value === null || value === undefined || value === '';
    const isBooleanish = value === true || value === false || value === 'Si' || value === 'No' || value === 'Sí' || value === 'N/A';

    return (
      <div className="flex items-center justify-between py-2 border-b border-border/60 last:border-b-0">
        <span className="text-sm font-medium text-muted-foreground w-2/3 pr-4 leading-tight break-words">{label}</span>
        <div className="text-sm font-semibold text-foreground text-right">
            {vacio ? <span className="text-muted-foreground">—</span> : (isBooleanish ? <BooleanBadge value={value} /> : value)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner text="Cargando equipamiento..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        {error}
      </Alert>
    );
  }

  if (!equipamiento) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equipamiento del VehÃ­culo</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <div className="space-y-2">
              <p className="font-medium">No hay equipamiento cargado para este modelo</p>   
              <p className="text-sm text-muted-foreground">
                El equipamiento se carga en la fase correspondiente del flujo de trabajo.   
                Una vez completados los datos mÃ­nimos y aprobados, podrÃ¡s cargar los campos de equipamiento.                                                                                        </p>
            </div>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Helper to split object into sensible chunks
  const keys = Object.keys(equipamiento).filter(k => !['EquipamientoID', 'ModeloID', 'FechaCreacion', 'FechaModificacion', 'OtrosDatos', 'CreadoPorID', 'ModificadoPorID', '__schema'].includes(k));

  // ¿Tiene algún dato cargado? (algún campo no vacío)
  const hayDatos = keys.some(k => {
    const v = (equipamiento as any)[k];
    return v !== null && v !== undefined && v !== '';
  });

  // Etiquetas legibles compartidas con el form de equipamiento.
  const formatLabel = (key: string) => labelEquip(key);

  return (
    <div className="space-y-6">
      {!hayDatos && (
        <Alert>
          <div className="space-y-1">
            <p className="font-medium">Aún no hay equipamiento cargado para este modelo</p>
            <p className="text-sm text-muted-foreground">
              Se muestran todos los campos con "—". El equipamiento se carga en la fase correspondiente del flujo de trabajo.
            </p>
          </div>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">

        <Card className="border shadow-sm overflow-hidden border-border col-span-full">
          <CardHeader className="bg-muted/50 border-b border-border py-3">
            <CardTitle className="text-base text-foreground">Equipamiento Completo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 px-4 py-2">
              {keys.map(key => (
                <InfoRow key={key} label={formatLabel(key)} value={equipamiento[key]} />
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
