const fs = require('fs');
let code = fs.readFileSync('src/controllers/importController.js', 'utf8');

const s1 =               Anio, SegmentacionAutodata, Carroceria, OrigenCodigo, Importador, 
              TipoMotor, TipoVehiculoElectrico, TipoCaja, CC, HP, 
              Cilindros, Valvulas, Puertas, Asientos, PrecioInicial, CombustibleCodigo,
              Estado, Activo
            ) OUTPUT INSERTED.ModeloID VALUES (
              @p0, @p1, @p2, @p3, @p4, 
              @p5,
              @p6, @p7, @p8, @p9, @p10, 
              @p11, @p12, @p13, @p14, @p15, 
              @p16, @p17, @p18, @p19, @p20, @p21,
              'definitivo', 1
            )\, 
            [
              dbMarcaId, modeloDesc, codModelo, codigoAutodata, familiaDesc,
              familiaId,
              anioNum, segmentoDesc, carroceriaDesc, origenDesc, importadorDesc,
              tipoMotorDesc, vehiculoElectricoDesc, tipoCajaDesc, cilinCcNum, potenciaHpNum,
              cilindrosNum, valvulasNum, puertasNum, asientosNum, precioIniNum, combDesc
            ];

const r1 =               Anio, CategoriaCodigo, SegmentacionAutodata, Carroceria, OrigenCodigo, Importador, 
              TipoMotor, TipoVehiculoElectrico, TipoCaja, CC, HP, 
              Cilindros, Valvulas, Puertas, Asientos, PrecioInicial, CombustibleCodigo,
              Estado, Activo
            ) OUTPUT INSERTED.ModeloID VALUES (
              @p0, @p1, @p2, @p3, @p4, 
              @p5,
              @p6, @p7, @p8, @p9, @p10, @p11, 
              @p12, @p13, @p14, @p15, @p16, 
              @p17, @p18, @p19, @p20, @p21, @p22,
              'definitivo', 1
            )\, 
            [
              dbMarcaId, modeloDesc, codModelo, codigoAutodata, familiaDesc,
              familiaId,
              anioNum, categoriaDesc, segmentoDesc, carroceriaDesc, origenDesc, importadorDesc,
              tipoMotorDesc, vehiculoElectricoDesc, tipoCajaDesc, cilinCcNum, potenciaHpNum,
              cilindrosNum, valvulasNum, puertasNum, asientosNum, precioIniNum, combDesc
            ];

const s2 =               Anio = @p4, SegmentacionAutodata = @p5, Carroceria = @p6, OrigenCodigo = @p7, Importador = @p8,
              TipoMotor = @p9, TipoVehiculoElectrico = @p10, TipoCaja = @p11, CC = @p12, HP = @p13,
              Cilindros = @p14, Valvulas = @p15, Puertas = @p16, Asientos = @p17, PrecioInicial = @p18, CombustibleCodigo = @p19,
              Estado = 'definitivo'
            WHERE ModeloID = @p20\, 
            [
              modeloDesc, codigoAutodata, familiaDesc,
              familiaId,
              anioNum, segmentoDesc, carroceriaDesc, origenDesc, importadorDesc,
              tipoMotorDesc, vehiculoElectricoDesc, tipoCajaDesc, cilinCcNum, potenciaHpNum,
              cilindrosNum, valvulasNum, puertasNum, asientosNum, precioIniNum, combDesc,
              modeloIdDb
            ];

const r2 =               Anio = @p4, CategoriaCodigo = @p5, SegmentacionAutodata = @p6, Carroceria = @p7, OrigenCodigo = @p8, Importador = @p9,
              TipoMotor = @p10, TipoVehiculoElectrico = @p11, TipoCaja = @p12, CC = @p13, HP = @p14,
              Cilindros = @p15, Valvulas = @p16, Puertas = @p17, Asientos = @p18, PrecioInicial = @p19, CombustibleCodigo = @p20,
              Estado = 'definitivo'
            WHERE ModeloID = @p21\, 
            [
              modeloDesc, codigoAutodata, familiaDesc,
              familiaId,
              anioNum, categoriaDesc, segmentoDesc, carroceriaDesc, origenDesc, importadorDesc,
              tipoMotorDesc, vehiculoElectricoDesc, tipoCajaDesc, cilinCcNum, potenciaHpNum,
              cilindrosNum, valvulasNum, puertasNum, asientosNum, precioIniNum, combDesc,
              modeloIdDb
            ];

code = code.replace(s1, r1).replace(s2, r2);
fs.writeFileSync('src/controllers/importController.js', code);
