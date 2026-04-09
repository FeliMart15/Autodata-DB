const fs = require('fs');
let file = fs.readFileSync('frontend/src/components/modelos/FormularioDatosMinimos.tsx', 'utf8');

file = file.replace(/onCancel\?: \(\) => void;/, 'onCancel?: () => void;\n  onSendRevision?: (data: Partial<Modelo>) => Promise<void>;');

file = file.replace(/onCancel,/, 'onCancel,\n  onSendRevision,');

const buttonsRegex = /\{onSave && \([\s\S]*?Guardar Progreso\s*<\/button>\s*\)\}/;
const newButtons = \{onSave && (
                  <button
                    type="button"
                    onClick={() => onSave(formData)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Guardar Progreso
                  </button>
                )}
                {onSendRevision && (
                  <button
                    type="button"
                    onClick={() => onSendRevision(formData)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Enviar a Revisión
                  </button>
                )}\;
file = file.replace(buttonsRegex, newButtons);

fs.writeFileSync('frontend/src/components/modelos/FormularioDatosMinimos.tsx', file);
console.log('FormularioDatosMinimos updated');
