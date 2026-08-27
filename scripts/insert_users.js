const db = require('../src/config/db-simple.js');

async function seed() {
  try {
    const q1 = \INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('admin', '\\\\\\\\\/ZwhkSSCcpGhmwfiLchOkrvbGR7oCIPLT.MgqRQvzOr9SZmL3ei', 'Admin', 'admin@autodata.com', 'admin');\;
    const q2 = \INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('santiago.martinez', '\\\\\\\\\/ZwhkSSCcpGhmwfiLchOkrvbGR7oCIPLT.MgqRQvzOr9SZmL3ei', 'Santiago Martinez', 'santiago.martinez@autodata.com', 'admin');\;
    const q3 = \INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('claudio.bustillo', '\\\\\\\\\.rJjRFGFkWVhMoFwe5DeGSS76X5yoPnCj1ob3RgrTMsU7e0mUTa', 'Claudio Bustillo', 'claudio.bustillo@autodata.com', 'aprobacion');\;
    const q4 = \INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('yanina.dotti', '\\\\\\\\\.ON5ZAKUCFTCD4vmu.3l1srAXh/EIAIKLNXvDiilVfs2X4v.', 'Yanina Dotti', 'yanina.dotti@autodata.com', 'revision');\;
    const q5 = \INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('noel.capurro', '\\\\\\\\\', 'Noel Capurro', 'noel.capurro@autodata.com', 'entrada_datos');\;

    await db.queryRaw(q1);
    await db.queryRaw(q2);
    await db.queryRaw(q3);
    await db.queryRaw(q4);
    await db.queryRaw(q5);
    
    console.log('Usuarios agregados');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
