const fs = require('fs');
const filePath = 'sql/migrations/scriptbd.sql';
let raw = fs.readFileSync(filePath);
let text = raw.length > 2 && raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le') : raw.toString('utf8');

let originalLength = text.length;

// Remove CREATE DATABASE and ALTER DATABASE blocks
text = text.replace(/CREATE DATABASE \[Autodata\].*?(GO\r?\n)/is, '');
text = text.replace(/ALTER DATABASE \[Autodata\].*?(GO\r?\n)/isg, '');
text = text.replace(/EXEC \[Autodata\]\.sys\.sp_.*?(GO\r?\n)/isg, '');

// Remove stg.Claudio_Modelos table completely
text = text.replace(/\/\*\*\*\*\*\* Object:  Table \[stg\]\.\[Claudio_Modelos\].*?\nGO\r?\n/isg, '');
text = text.replace(/CREATE TABLE \[stg\]\.\[Claudio_Modelos\].*?\nGO\r?\n/isg, '');

// Remove any View with stg. as well!
text = text.replace(/\/\*\*\*\*\*\* Object:  View \[stg\].*?\nGO\r?\n/isg, '');
text = text.replace(/CREATE(?: OR ALTER)? VIEW \[stg\].*?\nGO\r?\n/isg, '');

// Remove the schema stg
text = text.replace(/\/\*\*\*\*\*\* Object:  Schema \[stg\].*?\nGO\r?\n/isg, '');
text = text.replace(/CREATE SCHEMA \[stg\].*?\nGO\r?\n/isg, '');

// Remove Backup table
text = text.replace(/\/\*\*\*\*\*\* Object:  Table \[dbo\]\.\[EquipamientoModelo_Backup_20260117\].*?\nGO\r?\n/isg, '');
text = text.replace(/CREATE TABLE \[dbo\]\.\[EquipamientoModelo_Backup_20260117\].*?\nGO\r?\n/isg, '');

// Save back
const buf = Buffer.from(text, 'utf16le');
const bom = Buffer.from([0xff, 0xfe]);
fs.writeFileSync(filePath, Buffer.concat([bom, buf]));

console.log('Script procesado. Reducción de caracteres:', originalLength - text.length);
