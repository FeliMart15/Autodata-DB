const fs = require('fs');
const filePath = 'sql/migrations/scriptbd.sql';
const raw = fs.readFileSync(filePath);

// Detect UTF-16 LE by checking BOM
let encoding = 'utf8';
let text = '';
if (raw[0] === 0xff && raw[1] === 0xfe) {
    encoding = 'utf16le';
    text = raw.toString('utf16le');
} else {
    text = raw.toString('utf8');
}

// Split the script by GO to process by batches
const batches = text.split(/(?:\r?\n|^)GO(?:\r?\n|$)/i);
const initialCount = batches.length;

const cleanedBatches = batches.filter(batch => {
    // Remove database creation and configuration
    if (batch.includes('CREATE DATABASE [Autodata]')) return false;
    if (batch.includes('ALTER DATABASE [Autodata]')) return false;
    if (batch.includes('USE [master]')) return false;
    
    // Remove unnecessary staging schema and tables
    if (batch.includes('CREATE SCHEMA [stg]')) return false;
    if (batch.includes('CREATE TABLE [stg].[Claudio_Modelos]')) return false;
    
    // Remove backup table
    if (batch.includes('CREATE TABLE [dbo].[EquipamientoModelo_Backup_20260117]')) return false;
    
    return true;
});

// Rejoin the script
let newText = cleanedBatches.join('\r\nGO\r\n');

// Ensure the script starts with USE [Autodata] instead of master
if (!newText.includes('USE [Autodata]')) {
    newText = 'USE [Autodata]\r\nGO\r\n' + newText;
}

// Write back to the file using the original encoding
if (encoding === 'utf16le') {
    // Write BOM + content
    const bom = Buffer.from([0xff, 0xfe]);
    const buf = Buffer.from(newText, 'utf16le');
    fs.writeFileSync(filePath, Buffer.concat([bom, buf]));
} else {
    fs.writeFileSync(filePath, newText, 'utf8');
}

console.log('Borrado exitoso. Se elminaron ' + (initialCount - cleanedBatches.length) + ' bloques innecesarios.');
