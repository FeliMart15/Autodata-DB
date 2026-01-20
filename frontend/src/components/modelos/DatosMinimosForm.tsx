import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/Select';
import { Textarea } from '@components/ui/Textarea';
import { Button } from '@components/ui/Button';
import { Alert } from '@components/ui/Alert';
import { Checkbox } from '@components/ui/Checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/Dialog';
import { Label } from '@components/ui/label';
import { modeloService } from '@services/modeloService';
import { marcasService } from '@services/marcasService';
import { Modelo, UpdateModeloRequest } from '@types/index';
import { Marca as MarcaResponse, CreateMarcaRequest } from '@/types/marca';
import { Save, CheckCircle2, Plus } from 'lucide-react';
import { useToast } from '@context/ToastContext';
import { useAutosave } from '@hooks/useAutosave';

interface DatosMinimosFormProps {
  modelo: Modelo | null;
  onUpdate: (modeloId?: number) => void;
  readOnly?: boolean;
}

export function DatosMinimosForm({ modelo, onUpdate, readOnly = false }: DatosMinimosFormProps) {
  const [formData, setFormData] = useState<UpdateModeloRequest>({
    id_marca: modelo?.MarcaID || modelo?.id_marca || undefined,
    modelo: modelo?.Modelo || modelo?.modelo || '',
    familia: modelo?.Familia || modelo?.familia || '',
    origen: modelo?.Origen || modelo?.origen || '',
    combustible: modelo?.Combustible || modelo?.combustible || '',
    año: modelo?.Anio || modelo?.año || new Date().getFullYear(),
    tipo: modelo?.Tipo || modelo?.tipo || '',
    tipo2: modelo?.Tipo2 || modelo?.tipo2 || '',
    cc: modelo?.CC || modelo?.cc || undefined,
    hp: modelo?.HP || modelo?.hp || undefined,
    traccion: modelo?.Traccion || modelo?.traccion || '',
    caja: modelo?.Caja || modelo?.caja || '',
    tipo_caja: modelo?.TipoCaja || modelo?.tipo_caja || '',
    turbo: modelo?.Turbo || modelo?.turbo || false,
    puertas: modelo?.Puertas || modelo?.puertas || undefined,
    pasajeros: modelo?.Pasajeros || modelo?.pasajeros || undefined,
    tipo_vehiculo: modelo?.TipoVehiculo || modelo?.tipo_vehiculo || '',
    segmento: modelo?.Segmento || modelo?.segmento || '',
    categoria: modelo?.Categoria || modelo?.categoria || '',
    importador: modelo?.Importador || modelo?.importador || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [marcas, setMarcas] = useState<MarcaResponse[]>([]);
  const [isLoadingMarcas, setIsLoadingMarcas] = useState(true);
  const [isCreateMarcaOpen, setIsCreateMarcaOpen] = useState(false);
  const [newMarca, setNewMarca] = useState<CreateMarcaRequest>({
    marca: '',
    paisOrigen: '',
  });
  const [isCreatingMarca, setIsCreatingMarca] = useState(false);
  const { addToast } = useToast();
  const isNewModel = !modelo;

  useEffect(() => {
    loadMarcas();
  }, []);

  const loadMarcas = async () => {
    setIsLoadingMarcas(true);
    try {
      const data = await marcasService.getAll();
      console.log('DatosMinimosForm - Marcas loaded:', data);
      console.log('DatosMinimosForm - Marcas count:', data?.length);
      console.log('DatosMinimosForm - First marca:', data?.[0]);
      setMarcas(data || []);
    } catch (error: any) {
      console.error('DatosMinimosForm - Error loading marcas:', error);
      console.error('DatosMinimosForm - Error response:', error.response?.data);
      addToast('Error al cargar marcas', 'error');
      setMarcas([]);
    } finally {
      setIsLoadingMarcas(false);
    }
  };

  const handleCreateMarca = async () => {
    if (!newMarca.marca.trim()) {
      addToast('El nombre de la marca es requerido', 'error');
      return;
    }

    setIsCreatingMarca(true);
    try {
      const createdMarca = await marcasService.create(newMarca);
      addToast('Marca creada exitosamente', 'success');
      setIsCreateMarcaOpen(false);
      setNewMarca({ marca: '', paisOrigen: '' });
      await loadMarcas();
      // Auto-seleccionar la marca recién creada
      handleChange('id_marca', createdMarca.MarcaID);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al crear marca', 'error');
    } finally {
      setIsCreatingMarca(false);
    }
  };

  const handleSave = async (data: UpdateModeloRequest) => {
    if (isNewModel) {
      // Crear nuevo modelo - transformar datos al formato del backend
      const createData = {
        marcaId: data.id_marca,
        modelo: data.modelo,
        familia: data.familia,
        origen: data.origen,
        combustible: data.combustible,
        anio: data.año,
        tipo: data.tipo,
        tipo2: data.tipo2,
        cc: data.cc,
        hp: data.hp,
        traccion: data.traccion,
        caja: data.caja,
        tipo_caja: data.tipo_caja,
        turbo: data.turbo,
        puertas: data.puertas,
        pasajeros: data.pasajeros,
        tipo_vehiculo: data.tipo_vehiculo,
        segmento: data.segmento,
        categoria: data.categoria,
        importador: data.importador,
      };
      const createdModelo = await modeloService.create(createData as any);
      onUpdate(createdModelo.ModeloID);
    } else {
      // Actualizar modelo existente
      await modeloService.update(modelo.ModeloID || modelo.id_modelo, data);
      onUpdate();
    }
  };

  const { lastSaved, error: autosaveError } = useAutosave({
    data: formData,
    onSave: handleSave,
    delay: 3000,
    enabled: !readOnly && !isNewModel, // Disable autosave for new models
  });

  const handleChange = (field: keyof UpdateModeloRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleManualSave = async () => {
    // Validación para nuevo modelo
    if (isNewModel) {
      if (!formData.id_marca || !formData.modelo) {
        addToast('Marca y Modelo son campos requeridos', 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      await handleSave(formData);
      addToast(isNewModel ? 'Modelo creado correctamente' : 'Datos guardados correctamente', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {!isNewModel && lastSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Último guardado: {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : !isNewModel ? (
              <span>Autoguardado activado</span>
            ) : (
              <span>Complete los campos requeridos (*)</span>
            )}
          </div>
          <Button onClick={handleManualSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isNewModel ? 'Crear Modelo' : 'Guardar Manualmente'}
          </Button>
        </div>
      )}

      {autosaveError && (
        <Alert variant="destructive" onClose={() => {}}>
          {autosaveError}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos de Carga</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Complete los 5 campos obligatorios para crear el modelo. Luego podrá agregar los datos mínimos completos.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isNewModel && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Select
                        value={formData.id_marca?.toString() || ''}
                        onValueChange={(value) => handleChange('id_marca', Number(value))}
                        disabled={readOnly}
                      >
                        <SelectTrigger label="Marca *">
                          <SelectValue placeholder="Seleccionar marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingMarcas ? (
                            <SelectItem value="0" disabled>Cargando marcas...</SelectItem>
                          ) : marcas.length === 0 ? (
                            <SelectItem value="0" disabled>No hay marcas disponibles</SelectItem>
                          ) : (
                            marcas.map((marca) => (
                              <SelectItem key={marca.MarcaID} value={marca.MarcaID.toString()}>
                                {marca.Marca}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsCreateMarcaOpen(true)}
                      title="Crear nueva marca"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Input
                  label="Modelo *"
                  value={formData.modelo || ''}
                  onChange={(e) => handleChange('modelo', e.target.value)}
                  disabled={readOnly}
                  placeholder="Ej: Corolla, Focus, etc."
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Familia *"
                  value={formData.familia || ''}
                  onChange={(e) => handleChange('familia', e.target.value)}
                  disabled={readOnly}
                  placeholder="SUV, Sedan, Hatchback, etc."
                  required
                />
                <Select
                  value={formData.combustible || ''}
                  onValueChange={(value) => handleChange('combustible', value)}
                  disabled={readOnly}
                >
                  <SelectTrigger label="Combustible *">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasolina">Gasolina</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Eléctrico">Eléctrico</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                    <SelectItem value="GNC">GNC</SelectItem>
                    <SelectItem value="HibridoEnchufable">Híbrido Enchufable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Categoría *"
                  value={formData.categoria || ''}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  disabled={readOnly}
                  placeholder="Económico, Compacto, Premium, etc."
                  required
                />
              </div>
            </>
          )}
          {!isNewModel && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Familia"
                  value={formData.familia || ''}
                  onChange={(e) => handleChange('familia', e.target.value)}
                  disabled={readOnly}
                  placeholder="SUV, Sedan, etc."
                />
                <Input
                  label="Origen"
                  value={formData.origen || ''}
                  onChange={(e) => handleChange('origen', e.target.value)}
                  disabled={readOnly}
                  placeholder="Nacional, Importado"
                />
                <Select
                  value={formData.combustible || ''}
                  onValueChange={(value) => handleChange('combustible', value)}
                  disabled={readOnly}
                >
                  <SelectTrigger label="Combustible">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nafta">Nafta</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Eléctrico">Eléctrico</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                    <SelectItem value="GNC">GNC</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  label="Año"
                  value={formData.año || ''}
                  onChange={(e) => handleChange('año', Number(e.target.value))}
                  disabled={readOnly}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!isNewModel && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Tipo y Categoría</CardTitle>
            </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Tipo"
              value={formData.tipo || ''}
              onChange={(e) => handleChange('tipo', e.target.value)}
              disabled={readOnly}
              placeholder="4x2, 4x4, etc."
            />
            <Input
              label="Tipo 2"
              value={formData.tipo2 || ''}
              onChange={(e) => handleChange('tipo2', e.target.value)}
              disabled={readOnly}
            />
            <Input
              label="Tipo de Vehículo"
              value={formData.tipo_vehiculo || ''}
              onChange={(e) => handleChange('tipo_vehiculo', e.target.value)}
              disabled={readOnly}
              placeholder="Automóvil, Camioneta, etc."
            />
            <Input
              label="Segmento"
              value={formData.segmento || ''}
              onChange={(e) => handleChange('segmento', e.target.value)}
              disabled={readOnly}
              placeholder="Premium, Medio, Bajo"
            />
            <Input
              label="Categoría"
              value={formData.categoria || ''}
              onChange={(e) => handleChange('categoria', e.target.value)}
              disabled={readOnly}
            />
            <Input
              label="Importador"
              value={formData.importador || ''}
              onChange={(e) => handleChange('importador', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Especificaciones Técnicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              type="number"
              label="Cilindrada (CC)"
              value={formData.cc || ''}
              onChange={(e) => handleChange('cc', e.target.value ? Number(e.target.value) : undefined)}
              disabled={readOnly}
              placeholder="1500"
            />
            <Input
              type="number"
              label="Potencia (HP)"
              value={formData.hp || ''}
              onChange={(e) => handleChange('hp', e.target.value ? Number(e.target.value) : undefined)}
              disabled={readOnly}
              placeholder="150"
            />
            <div className="flex items-end pb-2">
              <Checkbox
                label="Turbo"
                checked={formData.turbo || false}
                onCheckedChange={(checked) => handleChange('turbo', checked)}
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              value={formData.traccion || ''}
              onValueChange={(value) => handleChange('traccion', value)}
              disabled={readOnly}
            >
              <SelectTrigger label="Tracción">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Delantera">Delantera</SelectItem>
                <SelectItem value="Trasera">Trasera</SelectItem>
                <SelectItem value="4x4">4x4</SelectItem>
                <SelectItem value="AWD">AWD</SelectItem>
              </SelectContent>
            </Select>

            <Input
              label="Caja"
              value={formData.caja || ''}
              onChange={(e) => handleChange('caja', e.target.value)}
              disabled={readOnly}
              placeholder="Manual, Automática"
            />

            <Input
              label="Tipo de Caja"
              value={formData.tipo_caja || ''}
              onChange={(e) => handleChange('tipo_caja', e.target.value)}
              disabled={readOnly}
              placeholder="CVT, DSG, etc."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capacidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              type="number"
              label="Puertas"
              value={formData.puertas || ''}
              onChange={(e) => handleChange('puertas', e.target.value ? Number(e.target.value) : undefined)}
              disabled={readOnly}
              placeholder="4"
            />
            <Input
              type="number"
              label="Pasajeros"
              value={formData.pasajeros || ''}
              onChange={(e) => handleChange('pasajeros', e.target.value ? Number(e.target.value) : undefined)}
              disabled={readOnly}
              placeholder="5"
            />
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {/* Dialog para crear marca */}
      <Dialog open={isCreateMarcaOpen} onOpenChange={setIsCreateMarcaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Marca</DialogTitle>
            <DialogDescription>
              Agrega una nueva marca al sistema para poder seleccionarla.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="marca-nombre">Nombre de la Marca *</Label>
              <Input
                id="marca-nombre"
                value={newMarca.marca}
                onChange={(e) => setNewMarca({ ...newMarca, marca: e.target.value })}
                placeholder="Ej: Toyota, Ford, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca-pais">País de Origen</Label>
              <Input
                id="marca-pais"
                value={newMarca.paisOrigen || ''}
                onChange={(e) => setNewMarca({ ...newMarca, paisOrigen: e.target.value })}
                placeholder="Ej: Japón, USA, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateMarcaOpen(false);
                setNewMarca({ marca: '', paisOrigen: '' });
              }}
              disabled={isCreatingMarca}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateMarca} isLoading={isCreatingMarca}>
              Crear Marca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
