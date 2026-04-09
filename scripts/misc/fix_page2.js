const fs = require('fs');
let file = fs.readFileSync('frontend/src/pages/CargarDatosPage.tsx', 'utf8');

const regexFunc = /const handleEnviarARevision = async \(\) => \{[\s\S]*?loadModelos\(\);\n\s*\} catch \(error: any\) \{/s;

const newFunc = `const handleEnviarARevision = async (formData: any) => {
    if (!modeloSeleccionado) return;

    setIsSaving(true);
    try {
      let nuevoEstado: ModeloEstado;
      const isFaseMinimos = [
        ModeloEstado.DATOS_MINIMOS,
        ModeloEstado.IMPORTADO,
        ModeloEstado.CREADO,
        ModeloEstado.CORREGIR_MINIMOS
      ].includes(modeloSeleccionado.Estado);

      if (isFaseMinimos) {
        // Save first so validation uses updated data
        await modeloService.update(modeloSeleccionado.ModeloID, formData);

        // Validar datos minimos antes de enviar
        const validacion = await estadoService.validarDatosMinimos(modeloSeleccionado.ModeloID);
        if (!validacion.data.datosCompletos) {
          const camposFaltantes = validacion.data.camposFaltantes.join(', ');
          addToast(\`Faltan campos obligatorios: \${camposFaltantes}\`, 'error');
          return;
        }
        nuevoEstado = ModeloEstado.REVISION_MINIMOS;
      } else if (
        [ModeloEstado.EQUIPAMIENTO_CARGADO, ModeloEstado.CORREGIR_EQUIPAMIENTO, ModeloEstado.MINIMOS_APROBADOS].includes(modeloSeleccionado.Estado)
      ) {
        // Save equipamiento first
        if (equipamiento && equipamiento.EquipamientoID) {
          await equipamientoService.update(modeloSeleccionado.ModeloID, formData);
        } else {
          await equipamientoService.create({ ...formData, ModeloID: modeloSeleccionado.ModeloID });
        }
        nuevoEstado = ModeloEstado.REVISION_EQUIPAMIENTO;
      } else {
        addToast('El modelo no esta en un estado valido para enviar a revision', 'error');
        return;
      }

      await estadoService.cambiarEstado(modeloSeleccionado.ModeloID, { nuevoEstado });

      addToast('Enviado a revision correctamente', 'success');
      setModeloSeleccionado(null);
      loadModelos();
    } catch (error: any) {`;

file = file.replace(regexFunc, newFunc);

// Update TabsContent value="minimos"
const regexMinimos = /<FormularioDatosMinimos[\s\S]*?readonly=\{!isFaseMinimos\}\n\s*\/>\n\s*\{isFaseMinimos && \([\s\S]*?<\/div>\n\s*\)\}/s;
const newMinimos = `<FormularioDatosMinimos
            modelo={modeloSeleccionado}
            onSave={isFaseMinimos ? handleGuardarDatosMinimos : undefined}
            onSendRevision={isFaseMinimos ? handleEnviarARevision : undefined}
            onCancel={() => setModeloSeleccionado(null)}
            readonly={!isFaseMinimos}
          />`;
file = file.replace(regexMinimos, newMinimos);

// Update TabsContent value="equipamiento"
const regexEquip = /<FormularioEquipamiento[\s\S]*?readonly=\{!isFaseEquipamiento\}\n\s*\/>\n\s*\{isFaseEquipamiento && \([\s\S]*?<\/div>\n\s*\)\}/s;
const newEquip = `{!isFaseEquipamiento ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Debes completar y aprobar los Datos Mínimos antes de poder visualizar o editar el Equipamiento.</p>
            </div>
          ) : (
            <FormularioEquipamiento
              equipamiento={equipamiento || {}}
              onSave={isFaseEquipamiento ? handleGuardarEquipamiento : undefined}
              onSendRevision={isFaseEquipamiento ? handleEnviarARevision : undefined}
              onCancel={() => setModeloSeleccionado(null)}
              readonly={!isFaseEquipamiento}
            />
          )}`;
file = file.replace(regexEquip, newEquip);

file = file.replace(/<Tabs value=\{tabActiva\} onValueChange=\{\(v\) => setTabActiva/, `<Tabs value={tabActiva} onValueChange={(v) => { if (v === 'equipamiento' && !isFaseEquipamiento) { addToast('Se requieren datos mínimos primero', 'error'); return; } setTabActiva`);

fs.writeFileSync('frontend/src/pages/CargarDatosPage.tsx', file);
console.log('CargarDatosPage updated successfully');
