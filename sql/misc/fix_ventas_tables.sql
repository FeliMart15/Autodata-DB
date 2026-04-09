USE Autodata;
GO

-- Crear tabla Venta
IF OBJECT_ID('Venta', 'U') IS NOT NULL
    DROP TABLE Venta;
GO

CREATE TABLE Venta (
    VentaID INT IDENTITY(1,1) PRIMARY KEY,
    ModeloID INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 0,
    Periodo NVARCHAR(7) NOT NULL,
    Año INT NOT NULL,
    Mes INT NOT NULL CHECK (Mes BETWEEN 1 AND 12),
    
    CreadoPorID INT NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPorID INT NULL,
    FechaModificacion DATETIME2 NULL,
    
    CONSTRAINT FK_Venta_Modelo FOREIGN KEY (ModeloID) 
        REFERENCES Modelo(ModeloID) ON DELETE CASCADE,
    CONSTRAINT FK_Venta_CreadoPor FOREIGN KEY (CreadoPorID) 
        REFERENCES Usuario(UsuarioID),
    CONSTRAINT FK_Venta_ModificadoPor FOREIGN KEY (ModificadoPorID) 
        REFERENCES Usuario(UsuarioID),
    
    CONSTRAINT CK_Venta_Cantidad CHECK (Cantidad >= 0),
    CONSTRAINT UQ_Venta_Modelo_Periodo UNIQUE (ModeloID, Periodo)
);
GO

CREATE INDEX IX_Venta_ModeloID ON Venta(ModeloID);
CREATE INDEX IX_Venta_Periodo ON Venta(Periodo DESC);
CREATE INDEX IX_Venta_Año_Mes ON Venta(Año DESC, Mes DESC);
GO

PRINT 'Tabla Venta creada';
GO

-- Crear tabla Empadronamiento
IF OBJECT_ID('Empadronamiento', 'U') IS NOT NULL
    DROP TABLE Empadronamiento;
GO

CREATE TABLE Empadronamiento (
    EmpadronamientoID INT IDENTITY(1,1) PRIMARY KEY,
    ModeloID INT NOT NULL,
    DepartamentoID INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 0,
    Periodo NVARCHAR(7) NOT NULL,
    Año INT NOT NULL,
    Mes INT NOT NULL CHECK (Mes BETWEEN 1 AND 12),
    
    CreadoPorID INT NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPorID INT NULL,
    FechaModificacion DATETIME2 NULL,
    
    CONSTRAINT FK_Empadronamiento_Modelo FOREIGN KEY (ModeloID) 
        REFERENCES Modelo(ModeloID) ON DELETE CASCADE,
    CONSTRAINT FK_Empadronamiento_Departamento FOREIGN KEY (DepartamentoID) 
        REFERENCES Departamento(DepartamentoID),
    CONSTRAINT FK_Empadronamiento_CreadoPor FOREIGN KEY (CreadoPorID) 
        REFERENCES Usuario(UsuarioID),
    CONSTRAINT FK_Empadronamiento_ModificadoPor FOREIGN KEY (ModificadoPorID) 
        REFERENCES Usuario(UsuarioID),
    
    CONSTRAINT CK_Empadronamiento_Cantidad CHECK (Cantidad >= 0),
    CONSTRAINT UQ_Empadronamiento_Modelo_Dpto_Periodo UNIQUE (ModeloID, DepartamentoID, Periodo)
);
GO

CREATE INDEX IX_Empadronamiento_ModeloID ON Empadronamiento(ModeloID);
CREATE INDEX IX_Empadronamiento_DepartamentoID ON Empadronamiento(DepartamentoID);
CREATE INDEX IX_Empadronamiento_Periodo ON Empadronamiento(Periodo DESC);
GO

PRINT 'Tabla Empadronamiento creada';
GO

SELECT 'Tablas creadas exitosamente' AS Resultado;
GO
