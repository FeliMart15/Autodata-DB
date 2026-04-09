// VentasPage.tsx
// Página principal para carga de ventas mensuales

import { useState, useEffect } from 'react';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { marcasService } from '@/services/marcasService';
import { familiasService, type Familia } from '@/services/familiasService';
import { obtenerVentasPorFamilia, obtenerVentasPeriodoAnterior, guardarVentasBatch } from '@/services/ventasService';
import type { Marca } from '@/types/marca';
import type { Venta, VentaBatch } from '@/types/ventas.types';

export default function VentasPage() {
  // Estados
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<number | null>(null);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState<number | null>(null);
  const [periodo, setPeriodo] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [datosAnteriores, setDatosAnteriores] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);

  const { addToast } = useToast();

  // Cargar marcas al montar
  useEffect(() => {
    cargarMarcas();
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

  // Cargar ventas cuando cambian marca, familia o periodo
  useEffect(() => {
    if (marcaSeleccionada && familiaSeleccionada && periodo) {
      cargarVentas();
    }
  }, [marcaSeleccionada, familiaSeleccionada, periodo]);

  const cargarMarcas = async () => {
    try {
      const data = await marcasService.getAll();
      setMarcas(data);
    } catch (error) {
      addToast('No se pudieron cargar las marcas', 'error');
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

  const cargarVentas = async () => {
    if (!familiaSeleccionada || !periodo) return;

    setLoading(true);
    try {
      // Cargar ventas actuales
      const response = await obtenerVentasPorFamilia(familiaSeleccionada, periodo);
      
      if (response.success) {
        setVentas(response.data);
      }

      // Cargar datos del periodo anterior para referencia
      try {
        const responseAnterior = await obtenerVentasPeriodoAnterior(
          familiaSeleccionada,
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
        // No es crítico si falla la carga de datos anteriores
        console.error('Error al cargar datos anteriores:', error);
      }

      setCambiosPendientes(false);
    } catch (error) {
      addToast('No se pudieron cargar las ventas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCantidadChange = (modeloId: number, cantidad: string) => {
    const valor = cantidad === '' ? 0 : parseInt(cantidad);
    if (isNaN(valor) || valor < 0) return;

    setVentas(prev =>
      prev.map(v => (v.ModeloID === modeloId ? { ...v, Cantidad: valor } : v))
    );
    setCambiosPendientes(true);
  };

  const handleGuardar = async () => {
    if (!marcaSeleccionada || !familiaSeleccionada || !periodo) {
      addToast('Debe seleccionar marca, familia y periodo', 'error');
      return;
    }

    setGuardando(true);
    try {
      const ventasBatch: VentaBatch[] = ventas
        .filter(v => v.Cantidad > 0)
        .map(v => ({
          modeloId: v.ModeloID,
          cantidad: v.Cantidad
        }));

      if (ventasBatch.length === 0) {
        addToast('No hay ventas con cantidad mayor a 0', 'warning');
        return;
      }

      const response = await guardarVentasBatch({
        periodo,
        ventas: ventasBatch
      });

      if (response.success) {
        addToast(`${response.affectedRows} ventas guardadas correctamente`, 'success');
        setCambiosPendientes(false);
        cargarVentas(); // Recargar para actualizar timestamps
      }
    } catch (error) {
      addToast('No se pudieron guardar las ventas', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const marcaNombre = marcas.find(m => m.MarcaID === marcaSeleccionada)?.Marca || '';

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Ventas</h1>
          <p className="text-gray-500 mt-1">
            Registre las ventas mensuales por modelo
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium mb-2">Marca</label>
            <select
              value={marcaSeleccionada || ''}
              onChange={e => setMarcaSeleccionada(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Seleccione marca...</option>
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
              <option value="">Seleccione familia...</option>
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
              disabled={!cambiosPendientes || guardando || !marcaSeleccionada || !familiaSeleccionada}
              className="w-full"
            >
              {guardando ? 'Guardando...' : 'Guardar Ventas'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabla de Ventas */}
      {familiaSeleccionada && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {marcaNombre} - {familias.find(f => f.FamiliaID === familiaSeleccionada)?.Nombre || ''}
            </h2>
            <span className="text-sm text-gray-500">
              {ventas.length} modelos encontrados
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : ventas.length === 0 ? (
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
                      Periodo Anterior
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
                  {ventas.map(venta => (
                    <tr key={venta.ModeloID} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {venta.DescripcionModelo}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">
                        {datosAnteriores[venta.ModeloID] || 0}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={venta.Cantidad || ''}
                          onChange={e => handleCantidadChange(venta.ModeloID, e.target.value)}
                          className="w-24 px-3 py-1 text-center border rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {venta.PrecioActual ? `$ ${venta.PrecioActual.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">
                        {venta.FechaPrecio ? new Date(venta.FechaPrecio).toLocaleDateString() : '-'}
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
      {!marcaSeleccionada && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-blue-800">
            👆 Seleccione un periodo, marca y familia para comenzar a cargar ventas
          </p>
        </Card>
      )}
    </div>
  );
}
