// EmpadronamientosPage.tsx
// Página principal para carga de empadronamientos mensuales por departamento

import { useState, useEffect } from 'react';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { marcasService } from '@/services/marcasService';
import { familiasService, type Familia } from '@/services/familiasService';
import { obtenerDepartamentos } from '@/services/departamentosService';
import {
  obtenerEmpadronamientosPorFamilia,
  obtenerEmpadronamientosPeriodoAnterior,
  guardarEmpadronamientosBatch
} from '@/services/empadronamientosService';
import type { Marca } from '@/types/marca';
import type { Departamento, Empadronamiento, EmpadronamientoBatch } from '@/types/ventas.types';

export default function EmpadronamientosPage() {
  // Estados
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<number | null>(null);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<number | null>(null);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState<number | null>(null);
  const [periodo, setPeriodo] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [empadronamientos, setEmpadronamientos] = useState<Empadronamiento[]>([]);
  const [datosAnteriores, setDatosAnteriores] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);

  const { addToast } = useToast();

  // Cargar marcas y departamentos al montar
  useEffect(() => {
    cargarMarcas();
    cargarDepartamentos();
  }, []);

  // Cargar familias cuando cambia la marca
  useEffect(() => {
    if (marcaSeleccionada) {
      cargarFamilias();
    } else {
      setFamilias([]);
      setFamiliaSeleccionada('');
    }
  }, [marcaSeleccionada]);

  // Cargar empadronamientos cuando cambian los filtros
  useEffect(() => {
    if (marcaSeleccionada && departamentoSeleccionado && familiaSeleccionada && periodo) {
      cargarEmpadronamientos();
    }
  }, [marcaSeleccionada, departamentoSeleccionado, familiaSeleccionada, periodo]);

  const cargarMarcas = async () => {
    try {
      const data = await marcasService.getAll();
      setMarcas(data);
    } catch (error) {
      addToast('No se pudieron cargar las marcas', 'error');
    }
  };

  const cargarDepartamentos = async () => {
    try {
      const response = await obtenerDepartamentos();
      if (response.success) {
        setDepartamentos(response.data);
      }
    } catch (error) {
      addToast('No se pudieron cargar los departamentos', 'error');
    }
  };

  const cargarFamilias = async () => {
    if (!marcaSeleccionada) return;
    
    try {
      const data = await familiasService.obtenerFamilias(marcaSeleccionada);
      setFamilias(data);
      
      // Si había una familia seleccionada que ya no existe, limpiarla
      if (familiaSeleccionada && !data.find(f => f.FamiliaID === familiaSeleccionada)) {
        setFamiliaSeleccionada(null);
      }
    } catch (error) {
      addToast('No se pudieron cargar las familias', 'error');
      setFamilias([]);
    }
  };

  const cargarEmpadronamientos = async () => {
    if (!familiaSeleccionada || !departamentoSeleccionado || !periodo) return;

    setLoading(true);
    try {
      // Cargar empadronamientos actuales
      const response = await obtenerEmpadronamientosPorFamilia(
        familiaSeleccionada,
        departamentoSeleccionado,
        periodo
      );

      if (response.success) {
        setEmpadronamientos(response.data);
      }

      // Cargar datos del periodo anterior
      try {
        const responseAnterior = await obtenerEmpadronamientosPeriodoAnterior(
          familiaSeleccionada,
          departamentoSeleccionado,
          periodo
        );

        if (responseAnterior.success) {
          const mapAnterior: Record<number, number> = {};
          responseAnterior.data.forEach(item => {
            mapAnterior[item.ModeloID] = item.CantidadAnterior;
          });
          setDatosAnteriores(mapAnterior);
        }
      } catch (error) {
        console.error('Error al cargar datos anteriores:', error);
      }

      setCambiosPendientes(false);
    } catch (error) {
      addToast('No se pudieron cargar los empadronamientos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCantidadChange = (modeloId: number, cantidad: string) => {
    const valor = cantidad === '' ? 0 : parseInt(cantidad);
    if (isNaN(valor) || valor < 0) return;

    setEmpadronamientos(prev =>
      prev.map(e => (e.ModeloID === modeloId ? { ...e, Cantidad: valor } : e))
    );
    setCambiosPendientes(true);
  };

  const handleGuardar = async () => {
    if (!marcaSeleccionada || !departamentoSeleccionado || !familiaSeleccionada || !periodo) {
      addToast('Debe completar todos los filtros', 'error');
      return;
    }

    setGuardando(true);
    try {
      const empadronamientosBatch: EmpadronamientoBatch[] = empadronamientos
        .filter(e => e.Cantidad > 0)
        .map(e => ({
          modeloId: e.ModeloID,
          cantidad: e.Cantidad
        }));

      if (empadronamientosBatch.length === 0) {
        addToast('No hay empadronamientos con cantidad mayor a 0', 'warning');
        return;
      }

      const response = await guardarEmpadronamientosBatch({
        periodo,
        departamentoId: departamentoSeleccionado,
        empadronamientos: empadronamientosBatch
      });

      if (response.success) {
        addToast(`${response.affectedRows} empadronamientos guardados correctamente`, 'success');
        setCambiosPendientes(false);
        cargarEmpadronamientos();
      }
    } catch (error) {
      addToast('No se pudieron guardar los empadronamientos', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const marcaNombre = marcas.find(m => m.MarcaID === marcaSeleccionada)?.Marca || '';
  const departamentoNombre = departamentos.find(d => d.DepartamentoID === departamentoSeleccionado)?.Nombre || '';

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Empadronamientos</h1>
          <p className="text-gray-500 mt-1">
            Registre los empadronamientos mensuales por departamento
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Periodo */}
          <div>
            <label className="block text-sm font-medium mb-2">Periodo</label>
            <input
              type="month"
              value={periodo}
              onChange={e => setPeriodo(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium mb-2">Departamento</label>
            <select
              value={departamentoSeleccionado || ''}
              onChange={e => setDepartamentoSeleccionado(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Seleccione...</option>
              {departamentos.map(depto => (
                <option key={depto.DepartamentoID} value={depto.DepartamentoID}>
                  {depto.Nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium mb-2">Marca</label>
            <select
              value={marcaSeleccionada || ''}
              onChange={e => setMarcaSeleccionada(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Seleccione...</option>
              {marcas.map(marca => (
                <option key={marca.MarcaID} value={marca.MarcaID}>
                  {marca.Marca}
                </option>
              ))}
            </select>
          </div>

          {/* Familia */}
          <div>
            <label className="block text-sm font-medium mb-2">Familia</label>
            <select
              value={familiaSeleccionada || ''}
              onChange={e => setFamiliaSeleccionada(e.target.value ? Number(e.target.value) : null)}
              disabled={!marcaSeleccionada || familias.length === 0}
              className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
            >
              <option value="">Seleccione...</option>
              {familias.map(familia => (
                <option key={familia.FamiliaID} value={familia.FamiliaID}>
                  {familia.Nombre} ({familia.CantidadModelos || 0} modelos)
                </option>
              ))}
            </select>
          </div>

          {/* Botón Guardar */}
          <div className="flex items-end">
            <Button
              onClick={handleGuardar}
              disabled={!cambiosPendientes || guardando || !departamentoSeleccionado || !familiaSeleccionada}
              className="w-full"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabla de Empadronamientos */}
      {departamentoSeleccionado && familiaSeleccionada && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {departamentoNombre} - {marcaNombre} - {familias.find(f => f.FamiliaID === familiaSeleccionada)?.Nombre || ''}
            </h2>
            <span className="text-sm text-gray-500">
              {empadronamientos.length} modelos encontrados
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : empadronamientos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay modelos disponibles para esta combinación
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Modelo
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Mes Anterior
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Precio Actual
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {empadronamientos.map(empadronamiento => (
                    <tr key={empadronamiento.ModeloID} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {empadronamiento.DescripcionModelo}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">
                        {datosAnteriores[empadronamiento.ModeloID] || 0}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={empadronamiento.Cantidad || ''}
                          onChange={e => handleCantidadChange(empadronamiento.ModeloID, e.target.value)}
                          className="w-24 px-3 py-1 text-center border rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {empadronamiento.PrecioActual ? `$ ${empadronamiento.PrecioActual.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">
                        {empadronamiento.FechaPrecio ? new Date(empadronamiento.FechaPrecio).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Mensaje de ayuda */}
      {(!marcaSeleccionada || !departamentoSeleccionado || !familiaSeleccionada) && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-blue-800">
            👆 Seleccione periodo, departamento, marca y familia para comenzar a cargar empadronamientos
          </p>
        </Card>
      )}
    </div>
  );
}
