const fs = require('fs'), vm = require('vm'), assert = require('assert');
const c = { window: {} }; vm.createContext(c);
for (const n of ['configuracion', 'fracciones', 'importar-matriz']) vm.runInContext(fs.readFileSync(`${__dirname}/../js/${n}.js`, 'utf8'), c);
const I = c.window.ImportarMatriz;
const ejemplo = '1; 1; 1; 2; -1; 1\n3; -2; ,; 5; -1; 5\n2; -1; 3; 3; 0; 4\n';
let r = I.preparar(I.texto(ejemplo));
assert.equal(r.valores.length, 3); assert.equal(r.valores[0].length, 6);
assert.equal(r.errores.length, 1); assert.equal(r.errores[0].fila, 1); assert.equal(r.errores[0].columna, 2);
assert.equal(r.valores[1][2], ','); assert.equal(r.valores[1][3], '5');
r = I.preparar(I.texto('1;;3\n\n4;5'));
assert.equal(r.valores[1].length, 3); assert.equal(r.valores[2][2], ''); assert.equal(r.errores.length, 5);
for (const t of ['1;2\n3;4', '1,2\n3,4', '1\t2\n3\t4', ' 1   2\n3 4 ', '\uFEFF1;2\r\n3;4\r\n', '"1";"2"\n"3";"4"']) {
  assert.equal(I.preparar(I.texto(t), true).errores.length, 0);
}
for (const t of ['1/0', 'pi', '2+3', '=2+3', 'NaN', 'Infinity', '<script>', '1 2', '12abc']) {
  r = I.preparar([[t, '1']]); assert.equal(r.errores.length, 1); assert.equal(r.valores[0][0], t);
}
assert.equal(I.preparar([['+2', '-3/-4']]).errores.length, 0);
assert.throws(() => I.preparar([[1, 2, 3]], true));
assert.throws(() => I.preparar([]));
assert.throws(() => I.preparar(Array.from({length:121},()=>[1,2])));
assert.throws(() => I.preparar([Array(121).fill(1)]));
assert.throws(() => I.texto('"1"2;3'));
assert.throws(() => I.texto('"1;2'));
assert.equal(I.preparar([['7','2']],false,new Set(['0,0'])).errores.length,1);
(async () => {
  await assert.rejects(I.leer({name:'a.png',size:10},false));
  await assert.rejects(I.leer({name:'a.txt',size:6*1024*1024},false));
  const cargada = await I.leer({name:'a.txt',size:ejemplo.length,text:async()=>ejemplo},false);
  assert.equal(cargada.errores.length,1);
  console.log('Importación: posiciones conservadas, carga parcial, separadores, vacíos, comillas, límites y formatos comprobados.');
})().catch(e=>{console.error(e);process.exitCode=1;});
