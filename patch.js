const fs = require('fs');
let text = fs.readFileSync('src/controllers/importController.js', 'utf8');

text = text.replace(
  /Anio, SegmentacionAutodata, Carroceria, OrigenCodigo, Importador,([\s\S]*?)anioNum, segmentoDesc, carroceriaDesc, origenDesc, importadorDesc,/g,
  Anio, CategoriaCodigo, SegmentacionAutodata, Carroceria, OrigenCodigo, Importador,, categoriaDesc, segmentoDesc, carroceriaDesc, origenDesc, importadorDesc,
);

text = text.replace(
  /Anio = @p4, SegmentacionAutodata = @p5, Carroceria = @p6, OrigenCodigo = @p7, Importador = @p8,([\s\S]*?)WHERE ModeloID = @p20([\s\S]*?)anioNum, segmentoDesc, carroceriaDesc, origenDesc, importadorDesc,/g,
  Anio = @p4, CategoriaCodigo = @p5, SegmentacionAutodata = @p6, Carroceria = @p7, OrigenCodigo = @p8, Importador = @p9, ModeloID = @p21, categoriaDesc, segmentoDesc, carroceriaDesc, origenDesc, importadorDesc,
);

let pMap = {};
// increment the @p indexes in UPDATE query to accommodate the newly added @p5
text = text.replace(/((?:TipoMotor|Cilindros).*?)(@p\d+)/g, (match, before, pToken) => {
  let num = parseInt(pToken.substring(2));
  if(num >= 5) {
     return before + '@p' + (num + 1);
  }
  return match;
});

fs.writeFileSync('src/controllers/importController.js', text);
