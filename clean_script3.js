const fs = require('fs');
const filePath = 'sql/migrations/scriptbd.sql';
let raw = fs.readFileSync(filePath);
let text = raw.length > 2 && raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le') : raw.toString('utf8');

text = text.replace(/CREATE\s+VIEW\s+\[stg\].*?\nGO/isg, '');
text = text.replace(/CREATE\s+SCHEMA\s+\[stg\].*?\nGO/isg, '');
text = text.replace(/\/\*\*\*\*\*\* Object:[^\n]*\[stg\].*?\nGO\r?\n/isg, '');
text = text.replace(/-- Vista para datos pendientes de procesar/isg, '');

const buf = Buffer.from(text, 'utf16le');
const bom = Buffer.from([0xff, 0xfe]);
fs.writeFileSync(filePath, Buffer.concat([bom, buf]));
