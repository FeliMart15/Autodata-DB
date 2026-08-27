import React, { useState, useEffect } from 'react';
import { CreateModeloRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Save } from 'lucide-react';
import { marcasService } from '@/services/marcasService';

interface FormularioCargaModeloProps {
  onSave: (data: CreateModeloRequest & { marcaId?: number }) => Promise<void>;
  isLoading?: boolean;
}

export const FormularioCargaModelo: React.FC<FormularioCargaModeloProps> = ({
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<CreateModeloRequest>>({
    modelo: '',
    codigoModelo: '',
    familia: '',
    año: undefined,
    precioInicial: undefined,
  });
  
  const [marcas, setMarcas] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchMarcas = async () => {
      try {
        const marcasList = await marcasService.getAll();
        if (isMounted) {
          setMarcas(marcasList);
        }
      } catch (error) {
        console.error('Error al cargar marcas', error);
      }
    };
    fetchMarcas();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (campo: keyof CreateModeloRequest, valor: any) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleguardarProgreso = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Validate minimal identifying fields
    if (!formData.id_marca || !formData.modelo) {
      alert('Por favor complete al menos la marca y el modelo para guardar progreso');
      return;
    }
    
    const payload = {
      ...formData,
      marcaId: Number(formData.id_marca),
      id_marca: Number(formData.id_marca)
    };

    await onSave(payload as CreateModeloRequest & { marcaId?: number });
  };

  const handleEnviarAprobacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_marca || !formData.modelo || !formData.codigoModelo || !formData.familia || !formData.año || !formData.precioInicial) {
      alert('Por favor complete todos los campos obligatorios para mandar a revisión');
      return;
    }
    
    const payload = {
      ...formData,
      marcaId: Number(formData.id_marca),
      id_marca: Number(formData.id_marca)
    };

    await onSave(payload as CreateModeloRequest & { marcaId?: number });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Datos de Carga (Información Inicial)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEnviarAprobacion} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Marca <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
                required
                value={formData.id_marca || ''}
                onChange={(e) => handleChange('id_marca', Number(e.target.value))}
              >
                <option value="">Seleccione una marca...</option>
                {marcas.map(m => (
                  <option key={m.MarcaID || m.id_marca} value={m.MarcaID || m.id_marca}>
                    {m.Marca || m.marca || m.Descripcion}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Código de Modelo <span className="text-red-500">*</span></label>
              <input
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
                required
                placeholder="Ej. 0104"
                value={formData.codigoModelo || ''}
                onChange={(e) => handleChange('codigoModelo', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Modelo (Descripción) <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
                required
                placeholder="Ej. COROLLA 2.0"
                value={formData.modelo || ''}
                onChange={(e) => handleChange('modelo', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Familia <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
                required
                placeholder="Ej. TOYOTA COROLLA"
                value={formData.familia || ''}
                onChange={(e) => handleChange('familia', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Año <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
                required
                placeholder="Ej. 2026"
                value={formData.año || ''}
                onChange={(e) => handleChange('año', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Precio (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
                required
                placeholder="Ej. 25000"
                value={formData.precioInicial || ''}
                onChange={(e) => handleChange('precioInicial', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="button" variant="secondary" onClick={handleguardarProgreso} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Progreso
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar a Revisión'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};