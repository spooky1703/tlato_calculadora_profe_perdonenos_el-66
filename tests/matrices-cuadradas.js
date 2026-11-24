const fs = require('fs'), vm = require('vm'), assert = require('assert');
const c = { window: {} }; vm.createContext(c);
for (const nombre of ['configuracion', 'fracciones', 'gauss-jordan']) vm.runInContext(fs.readFileSync(`${__dirname}/../js/${nombre}.js`, 'utf8'), c);
const { Fraccion: F, GaussJordan: G } = c.window;
const matriz = a => a.map(f => f.map(v => F.desdeTexto(String(v))));
const clave = a => JSON.stringify(a.map(f => f.map(v => v.aTexto())));
// Referencia independiente del recorrido: expansión por cofactores.
function det(a) {
  if (a.length === 1) return a[0][0];
  let valor = F.CERO;
  for (let j = 0; j < a.length; j++) {
    let termino = a[0][j].multiplicar(det(a.slice(1).map(f => f.filter((_, k) => k !== j))));
    valor = valor.sumar(j % 2 ? termino.negar() : termino);
  }
  return valor;
}
let cantidad = 0;
function verificar(datos) {
  const a = matriz(datos), antes = clave(a), esperado = det(a);
  assert(G.determinante(a).valor.restar(esperado).esCero());
  const r = G.inversa(a);
  assert.equal(r.existe, !esperado.esCero());
  if (r.existe) {
    for (const [izq, der] of [[a, r.inversa], [r.inversa, a]]) {
      for (let i = 0; i < a.length; i++) for (let j = 0; j < a.length; j++) {
        let suma = F.CERO;
        for (let k = 0; k < a.length; k++) suma = suma.sumar(izq[i][k].multiplicar(der[k][j]));
        assert(suma.restar(i === j ? F.UNO : F.CERO).esCero());
      }
    }
  } else assert.equal(r.inversa, null);
  assert.equal(clave(a), antes); cantidad++;
}
[[[0]], [[5]], [[0,1],[1,0]], [[0,1,0],[0,0,1],[1,0,0]], [[1,2],[2,4]], [['1/2','2/3'],['-3/7','4/9']], [[0,0],[0,0]]].forEach(verificar);
let semilla = 203;
for (let k = 0; k < 200; k++) {
  const azar = () => semilla = semilla * 16807 % 2147483647;
  const n = 1 + azar() % 5;
  verificar(Array.from({ length: n }, () => Array.from({ length: n }, () => `${azar() % 11 - 5}/${1 + azar() % 4}`)));
}
for (const funcion of [G.inversa, G.determinante]) {
  for (const mala of [[], matriz([[1,2]]), matriz([[1],[2]]), [[null]]]) assert.throws(() => funcion(mala));
}
const grande = Array.from({length:120}, (_,i) => Array.from({length:120}, (_,j) => i === j ? F.UNO : F.CERO));
assert(G.determinante(grande).valor.esUno()); assert.equal(clave(G.inversa(grande).inversa), clave(grande));
console.log(`${cantidad} matrices: determinante contrastado con cofactores e inversa comprobada en ambos órdenes; tamaño 120 y entradas inválidas verificados.`);
