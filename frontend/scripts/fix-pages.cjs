const fs = require('fs');
let txt = fs.readFileSync('src/pages/ModeloDetailPage.tsx', 'utf8');

txt = txt.replace(/ModeloEstado\.EN_REVISION/g, 'ModeloEstado.REVISION_EQUIPAMIENTO');
txt = txt.replace(/ModeloEstado\.EN_APROBACION/g, 'ModeloEstado.MINIMOS_APROBADOS');
txt = txt.replace(/ModeloEstado\.PARA_CORREGIR/g, 'ModeloEstado.CORREGIR_EQUIPAMIENTO');
txt = txt.replace(/'EN_REVISION'/g, "'REVISION_EQUIPAMIENTO'");
txt = txt.replace(/'EN_APROBACION'/g, "'MINIMOS_APROBADOS'");
txt = txt.replace(/'PARA_CORREGIR'/g, "'CORREGIR_EQUIPAMIENTO'");

// Also cast estado inside badge:
txt = txt.replace(/estado=\{modelo\.Estado \|\| modelo\.estado\}/g, 'estado={(modelo.Estado || modelo.estado) as ModeloEstado}');
txt = txt.replace(/estado=\{modelo.Estado\}/g, 'estado={(modelo.Estado) as ModeloEstado}');

fs.writeFileSync('src/pages/ModeloDetailPage.tsx', txt);
console.log('done fixing ModeloDetailPage');

// Let's quickly fix the remaining pages and dashboard too
try {
  let ag = fs.readFileSync('src/pages/AgregarEquipamientoPage.tsx', 'utf8');
  ag = ag.replace(/ModeloEstado\.REQUISITOS_MINIMOS/g, 'ModeloEstado.DATOS_MINIMOS');
  ag = ag.replace(/ModeloEstado\.EN_REVISION/g, 'ModeloEstado.REVISION_EQUIPAMIENTO');
  fs.writeFileSync('src/pages/AgregarEquipamientoPage.tsx', ag);
} catch(e){}

try {
  let rp = fs.readFileSync('src/pages/RevisarVehiculosPage.tsx', 'utf8');
  rp = rp.replace(/ModeloEstado\.EN_REVISION/g, 'ModeloEstado.REVISION_EQUIPAMIENTO');
  rp = rp.replace(/ModeloEstado\.PARA_CORREGIR/g, 'ModeloEstado.CORREGIR_EQUIPAMIENTO');
  fs.writeFileSync('src/pages/RevisarVehiculosPage.tsx', rp);
} catch(e){}

try {
  let db = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
  db = db.replace(/estado=\{modelo\.Estado\}/g, 'estado={modelo.Estado as ModeloEstado}');
  fs.writeFileSync('src/pages/DashboardPage.tsx', db);
} catch(e){}
