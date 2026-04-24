const fs = require('fs');
const filePath = 'sql/migrations/scriptbd.sql';
let raw = fs.readFileSync(filePath);
let text = raw.length > 2 && raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le') : raw.toString('utf8');

text = text.replace(/CREATE NONCLUSTERED INDEX [^\n]+ ON \[stg\]\.\[Claudio_Modelos\].*?\nGO/isg, '');
text = text.replace(/ALTER TABLE \[stg\]\.\[Claudio_Modelos\].*?\nGO/isg, '');

const buf = Buffer.from(text, 'utf16le');
const bom = Buffer.from([0xff, 0xfe]);
fs.writeFileSync(filePath, Buffer.concat([bom, buf]));
