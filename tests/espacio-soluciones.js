const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{}};vm.createContext(c);
for(const p of ['fracciones','gauss-jordan','espacio-soluciones'])vm.runInContext(fs.readFileSync(`${__dirname}/../js/${p}.js`,'utf8'),c);
const {Fraccion:F,GaussJordan:G,EspacioSoluciones:E}=c.window;
const modelo=filas=>{const a=filas.map(f=>f.map(F.desdeTexto)),n=a[0].length-1;return E.crear(G.reducir(a,n),a,n);};
for(const [a,dimension] of [
 [[[1,1,1,3],[2,2,2,6]],2],
 [[[1,1,0,3],[0,1,1,2]],1],
 [[[0,0,0,0]],3],
 [[[0,0,0]],2],
 [[[0,0]],1],
 [[[1,0,0,0,0],[0,1,0,0,0]],2]
]){
 const m=modelo(a);assert.equal(m.libres.length,dimension);
 for(const valor of ['0','-3/4','2.1']){
  const r=m.evaluar(m.libres.map(()=>F.desdeTexto(valor)));
  assert(r.comprobaciones.every(c=>c.izquierda.restar(c.derecha).esCero()));
 }
}
const m=modelo([[1,0,0,0,0],[0,1,0,0,0]]);
assert.equal(m.proyectar([0,1]).dimension,0);
assert.equal(m.proyectar([0,1,2]).dimension,1);
assert.equal(m.proyectar([0,2,3]).dimension,2);
assert.throws(()=>m.proyectar([0,0,1]));
assert.equal(E.numero(F.desdeTexto('0.125')),0.125);
assert.throws(()=>E.numero(new F(10n**1000n)));
console.log('Geometría: dimensión, proyección, parámetros y sustitución exacta correctos.');
