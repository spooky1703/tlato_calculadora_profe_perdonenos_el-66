const fs=require('fs'),vm=require('vm'),assert=require('assert');const c={window:{}};vm.createContext(c);
for(const f of ['js/configuracion.js','js/fracciones.js','revision-ocr/parser.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const analizar=c.window.OCRMatriz.analizar;
assert.equal(JSON.stringify(analizar('1;2;-3\n4;5;6',2,3)),JSON.stringify([['1','2','-3'],['4','5','6']]));
assert.equal(analizar('[1 2 | −3]\n[4 5 | 6]',2,3)[0][2],'-3');
assert.equal(analizar('1/2; -3/4; 0,25',1,3)[0][2],'0,25');
for(const s of ['1;;3\n4;5;6','1;2\n4;5;6','1;2;3;7\n4;5;6','1;O;3\n4;5;6','1;l;3\n4;5;6','1;1/0;3\n4;5;6','1;2;3\n\n4;5;6','1 2|3 4\n4 5|6','1;2;x3\n4;5;6','1 2 - 3\n4 5 6']) assert.throws(()=>analizar(s,2,3),s);
assert.throws(()=>analizar('1;2',1,121));assert.throws(()=>analizar('1;2',1.5,2));
console.log('OCR: valores, signos, fracciones, huecos, dimensiones, caracteres ambiguos y división cero verificados.');
