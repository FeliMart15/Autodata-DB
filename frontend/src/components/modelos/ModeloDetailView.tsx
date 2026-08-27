import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { Modelo } from '@/types/index';

interface ModeloDetailViewProps {
  modelo: Modelo;
}

export function ModeloDetailView({ modelo }: ModeloDetailViewProps) {
  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="grid grid-cols-3 gap-4 py-2 border-b last:border-b-0">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2">{value || '-'}</dd>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* DATOS OBLIGATORIOS (5 campos) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Datos de Carga Obligatorios</CardTitle>
            <Badge variant={modelo.Estado === 'DEFINITIVO' ? 'success' : 'default'}>
              {modelo.Estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <InfoRow label="Marca" value={modelo.MarcaNombre} />
            <InfoRow label="Familia" value={modelo.Familia} />
            <InfoRow label="Modelo" value={modelo.Modelo || modelo.DescripcionModelo} />
            <InfoRow label="Combustible" value={modelo.CombustibleCodigo} />
            <InfoRow label="Categoría de Vehículo" value={modelo.Tipo} />
          </dl>
        </CardContent>
      </Card>

      {/* DATOS MÍNIMOS - Información Básica (3 campos) */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <InfoRow label="Segmento" value={modelo.SegmentacionAutodata} />
            <InfoRow label="Carrocería" value={modelo.Carroceria} />
            <InfoRow label="Origen" value={modelo.OrigenCodigo} />
          </dl>
        </CardContent>
      </Card>

      {/* DATOS MÍNIMOS - Especificaciones del Motor (6 campos) */}
      <Card>
        <CardHeader>
          <CardTitle>Especificaciones del Motor</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <InfoRow label="Cilindros" value={modelo.Cilindros} />
            <InfoRow label="Válvulas" value={modelo.Valvulas} />
            <InfoRow label="Cilindrada (CC)" value={modelo.CC} />
            <InfoRow label="Potencia (HP)" value={modelo.HP} />
            <InfoRow label="Tipo de Motor" value={modelo.TipoMotor} />
            <InfoRow label="Tipo de Vehículo Eléctrico" value={modelo.TipoVehiculoElectrico || 'N/A'} />
          </dl>
        </CardContent>
      </Card>

      {/* DATOS MÍNIMOS - Datos Físicos y Comerciales (4 campos) */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Físicos y Comerciales</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <InfoRow label="Tipo de Caja" value={modelo.TipoCajaAut} />
            <InfoRow label="Puertas" value={modelo.Puertas} />
            <InfoRow label="Asientos" value={modelo.Asientos} />
            <InfoRow label="Importador" value={modelo.Importador} />
          </dl>
        </CardContent>
      </Card>

      {/* Información adicional de identificación */}
      <Card>
        <CardHeader>
          <CardTitle>Códigos de Identificación</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <InfoRow label="ID Modelo" value={modelo.ModeloID} />
            <InfoRow label="Código Autodata" value={modelo.codigo_autodata} />
            <InfoRow label="Código Modelo" value={modelo.CodigoModelo} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
