// Pruebas ejecutables en Node.js: node tests/pruebas.js
const fs = require('fs');
const vm = require('vm');
const contexto = { window: {} };
vm.createContext(contexto);
vm.runInContext(fs.readFileSync(__dirname + '/../js/fracciones.js', 'utf8'), contexto);
vm.runInContext(fs.readFileSync(__dirname + '/../js/gauss-jordan.js', 'utf8'), contexto);
const F = contexto.window.Fraccion;
const G = contexto.window.GaussJordan;
let total = 0;
function afirmar(condicion, mensaje) { total++; if (!condicion) throw new Error(`FALLÓ: ${mensaje}`); }
function f(texto) { return F.desdeTexto(texto); }
function matriz(filas) { return filas.map(fila => fila.map(f)); }
function comprobar(filas, n, tipo, rangos) {
  const r = G.reducir(matriz(filas), n);
  afirmar(r.tipo === tipo, `clasificación ${tipo}; se obtuvo ${r.tipo}`);
  afirmar(r.rangoCoeficientes === rangos[0] && r.rangoAumentada === rangos[1], 'rangos correctos');
  return r;
}

// Aritmética racional exacta.
afirmar(f('0.25').aTexto() === '1/4', 'decimal exacto');
afirmar(f('-3/4').sumar(f('1/2')).aTexto() === '-1/4', 'suma con signo');
afirmar(f('1.75').aTexto() === '7/4', 'decimal periódico finito');
let divisionCero = false; try { f('1').dividir(f('0')); } catch { divisionCero = true; }
afirmar(divisionCero, 'detectar división entre cero');

// Solución única; incluye intercambio de filas por pivote inicial cero.
let r = comprobar([['0','1','2'], ['1','1','3']], 2, 'unica', [2,2]);
afirmar(r.matriz[0][2].aTexto() === '1' && r.matriz[1][2].aTexto() === '2', 'solución única correcta');
// Infinitas soluciones con columna libre al inicio.
r = comprobar([['0','1','2'], ['0','2','4']], 2, 'infinitas', [1,1]);
afirmar(G.parametrizar(r, 2).libres[0] === 0, 'columna sin pivote al inicio');
// Incompatible.
r = comprobar([['1','1','2'], ['2','2','5']], 2, 'incompatible', [1,2]);
afirmar(r.filaIncompatible >= 0, 'fila incompatible identificada');
// Más ecuaciones que incógnitas, fila nula.
comprobar([['1','2'], ['2','4'], ['0','0']], 1, 'unica', [1,1]);
// Más incógnitas que ecuaciones y dos variables libres.
r = comprobar([['1','0','1','3']], 3, 'infinitas', [1,1]);
afirmar(G.parametrizar(r, 3).libres.length === 2, 'varias variables libres');
// Fracciones, negativos y resultados fraccionarios.
r = comprobar([['2','1']], 1, 'unica', [1,1]);
afirmar(r.matriz[0][1].aTexto() === '1/2', 'resultado fraccionario');
// Dimensión máxima 15 x 15 (14 incógnitas + aumentada).
const grande = Array.from({length:15}, (_,i) => Array.from({length:15}, (_,j) => i < 14 && i === j ? '1' : '0'));
r = comprobar(grande, 14, 'unica', [14,14]);
console.log(`Correcto: ${total} comprobaciones.`);

for (const [entrada, esperado] of [['(2+3)/4','5/4'],['2^-3','1/8'],['-2^2','-4'],['2^3^2','512'],['1e-3','1/1000'],['1,25','5/4'],['2(3+1)','8'],['1/-2','-1/2'],['2pi/pi','2'],['e/e','1']]) afirmar(f(entrada).aTexto() === esperado, entrada);
for (const entrada of ['', '1/0', '2x', 'alert(1)', '2**3', '()', '1 2', '2^101', '0^0', '(2+1', 'Infinity']) {
 let fallo=false; try { f(entrada); } catch { fallo=true; } afirmar(fallo, `rechazar ${entrada}`);
}
function verificar(filas) {
 const original=matriz(filas), n=original[0].length-1, r=G.reducir(original,n);
 let ultima=-1;
 r.matriz.forEach((fila,i)=> {
  const p=fila.findIndex(v=>!v.esCero());
  if(p<0) return;
  afirmar(p>ultima,'orden de pivotes RREF'); ultima=p;
  afirmar(fila[p].esUno(),'pivote unitario');
  afirmar(r.matriz.every((f,j)=>j===i || f[p].esCero()),'columna pivote reducida');
 });
 if(r.tipo==='incompatible') { afirmar(r.matriz.some(f=>f.slice(0,n).every(v=>v.esCero()) && !f[n].esCero()),'contradicción'); return; }
 const {expresiones,libres}=G.parametrizar(r,n);
 // Verificar la constante y cada vector de la base prueba todos los parámetros.
 for(let k=-1;k<libres.length;k++) {
  const x=expresiones.map(ts=>ts.reduce((v,t)=>v.sumar((k===-1?t.constante:t.parametro===`t${k+1}`)?t.coeficiente:F.CERO),F.CERO));
  original.forEach(fila=>afirmar(fila.slice(0,n).reduce((v,a,j)=>v.sumar(a.multiplicar(x[j])),F.CERO).restar(k===-1?fila[n]:F.CERO).esCero(),'sustitución exacta de la familia'));
 }
}
[
 [['1','2','3'],['2','4','7'],['0','0','5']],
 [['0','1','2','3'],['0','2','4','6']],
 [['1/2','-3/4','1.25'],['-2','3','-5']],
 [['0','0','0'],['0','0','0']],
 [['1','0','2'],['0','1','3'],['1','1','5']],
 grande
].forEach(verificar);
let semilla=41;
function azar(){semilla=(semilla*16807)%2147483647;return semilla;}
for(let caso=0;caso<200;caso++) {
 const n=1+azar()%6,m=1+azar()%7;
 verificar(Array.from({length:m},()=>Array.from({length:n+1},()=>String(azar()%11-5))));
}
afirmar(f('euler').aTexto() === f('e').aTexto(), 'Euler es alias de e');
afirmar(f('2Euler/e').aTexto() === '2', 'Euler dentro de expresiones');
afirmar(F.contieneConstantes('euler') && F.contieneConstantes('2Euler'), 'aviso de aproximación de Euler');
for (const entrada of ['pi', 'π', 'e', 'Euler', '2e', '2euler', '(1+pi)/2']) afirmar(F.contieneConstantes(entrada), `reconocer constante: ${entrada}`);
for (const entrada of ['1e3', '1e-3', '2.5', '1/2']) afirmar(!F.contieneConstantes(entrada), `distinguir número: ${entrada}`);
console.log(`Validación ampliada: ${total} comprobaciones correctas.`);
