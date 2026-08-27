USE Autodata;
GO

INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('admin', '$2b$10$YE/ZwhkSSCcpGhmwfiLchOkrvbGR7oCIPLT.MgqRQvzOr9SZmL3ei', N'Admin', 'admin@autodata.com', 'admin');
INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('santiago.martinez', '$2b$10$YE/ZwhkSSCcpGhmwfiLchOkrvbGR7oCIPLT.MgqRQvzOr9SZmL3ei', N'Santiago Martinez', 'santiago.martinez@autodata.com', 'admin');
INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('claudio.bustillo', '$2b$10$Cs.rJjRFGFkWVhMoFwe5DeGSS76X5yoPnCj1ob3RgrTMsU7e0mUTa', N'Claudio Bustillo', 'claudio.bustillo@autodata.com', 'aprobacion');
INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('yanina.dotti', '$2b$10$pelt4.ON5ZAKUCFTCD4vmu.3l1srAXh/EIAIKLNXvDiilVfs2X4v.', N'Yanina Dotti', 'yanina.dotti@autodata.com', 'revision');
INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('noel.capurro', '$2b$10$KlvzEeS6Q7lEmqGSezlxHumQFmrpiuoUwpxKuTWa0kq7TP6wluH56', N'Noel Capurro', 'noel.capurro@autodata.com', 'entrada_datos');

PRINT 'Usuarios creados exitosamente';
GO
