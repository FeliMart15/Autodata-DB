const fs = require('fs');
let txt = fs.readFileSync('src/App.tsx', 'utf8');
txt = txt.replace(/import \{ AgregarEquipamientoPage \} from '@pages\/AgregarEquipamientoPage';/, "import { CargarDatosPage } from '@pages/CargarDatosPage';");
txt = txt.replace(/import \{ RevisarVehiculosPage \} from '@pages\/RevisarVehiculosPage';/, "import { RevisarPage } from '@pages/RevisarPage';");

txt = txt.replace(/<Route[\s\n]*path="\/agregar-equipamiento"[\s\n]*element=\{[\s\n]*<ProtectedRoute>[\s\n]*<Layout>[\s\n]*<AgregarEquipamientoPage \/>[\s\n]*<\/Layout>[\s\n]*<\/ProtectedRoute>[\s\n]*\}[\s\n]*\/>/g, `<Route
          path="/cargar-datos"
          element={
            <ProtectedRoute>
              <Layout>
                <CargarDatosPage />
              </Layout>
            </ProtectedRoute>
          }
        />`);

txt = txt.replace(/<Route[\s\n]*path="\/revisar-vehiculos"[\s\n]*element=\{[\s\n]*<ProtectedRoute>[\s\n]*<Layout>[\s\n]*<RevisarVehiculosPage \/>[\s\n]*<\/Layout>[\s\n]*<\/ProtectedRoute>[\s\n]*\}[\s\n]*\/>/g, `<Route
          path="/revisar-vehiculos"
          element={
            <ProtectedRoute>
              <Layout>
                <RevisarPage />
              </Layout>
            </ProtectedRoute>
          }
        />`);

fs.writeFileSync('src/App.tsx', txt);
console.log('done modifying App.tsx');
