import { useForm } from 'react-hook-form';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Label } from '@/components/ui/label';
import { CreateMarcaRequest, UpdateMarcaRequest, Marca } from '@/types/marca';

interface MarcaFormProps {
  marca?: Marca;
  onSubmit: (data: CreateMarcaRequest | UpdateMarcaRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MarcaForm({ marca, onSubmit, onCancel, isLoading }: MarcaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateMarcaRequest>({
    defaultValues: marca
      ? {
          codigoMarca: marca.CodigoMarca || '',
          marca: marca.Marca,
          paisOrigen: marca.PaisOrigen || '',
        }
      : {
          codigoMarca: '',
          marca: '',
          paisOrigen: '',
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {!marca && (
        <div className="space-y-2">
          <Label htmlFor="codigoMarca">
            Código de Marca <span className="text-red-500">*</span>
          </Label>
          <Input
            id="codigoMarca"
            {...register('codigoMarca', {
              required: 'El Código de la marca es requerido',
              pattern: {
                value: /^[0-9]+$/,
                message: 'Solo se permiten números (ej: 0001)',
              },
            })}
            placeholder="Ej: 0001"
            className={errors.codigoMarca ? 'border-red-500' : ''}
          />
          {errors.codigoMarca && (
            <p className="text-sm text-red-500">{errors.codigoMarca.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="marca">
          Nombre de la Marca <span className="text-red-500">*</span>
        </Label>
        <Input
          id="marca"
          {...register('marca', {
            required: 'El nombre de la marca es requerido',
            minLength: {
              value: 2,
              message: 'El nombre debe tener al menos 2 caracteres',
            },
          })}
          placeholder="Ej: Toyota, Ford, BMW"
          className={errors.marca ? 'border-red-500' : ''}
        />
        {errors.marca && (
          <p className="text-sm text-red-500">{errors.marca.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paisOrigen">País de Origen</Label>
        <Input
          id="paisOrigen"
          {...register('paisOrigen')}
          placeholder="Ej: Japón, Estados Unidos, Alemania"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : marca ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
