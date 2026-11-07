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
