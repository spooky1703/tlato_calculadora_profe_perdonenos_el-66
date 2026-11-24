const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{}};vm.createContext(c);
for(const p of ['configuracion','fracciones','gauss-jordan','espacio-soluciones'])vm.runInContext(fs.readFileSync(`${__dirname}/../js/${p}.js`,'utf8'),c);
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

// La clasificación no se decide con tolerancias visuales.
const racional=x=>F.desdeTexto(String(x));
const verificarPuntos=(fig,a,b)=>fig.puntos.forEach(p=>{
 assert(p.reduce((s,v,i)=>s.sumar(v.multiplicar(racional(a[i]))),F.CERO).restar(racional(b)).esCero(),'Cada vértice debe satisfacer exactamente la ecuación');
 p.forEach(v=>assert(Math.abs(E.numero(v))<=10));
});
for(const [a,b,cantidad] of [
 [[1,0,0],2,4],[[0,1,0],-3,4],[[0,0,1],0,4],[[1,1,1],0,6],
 [[1,1,1],30,1],[[1,0,0],11,0],[[0,1],3,2],[[1,0],-3,2],[[2],4,1],
 [['1/1000000000000000000000',0,0],'1/500000000000000000000',4]
]){
 const fig=E.cortarEcuacion(a.map(racional),racional(b),10);
 assert.equal(fig.puntos.length,cantidad);verificarPuntos(fig,a,b);
}
assert.equal(E.cortarEcuacion([F.CERO,F.CERO,F.CERO],F.CERO,10).tipo,'todo');
assert.equal(E.cortarEcuacion([F.CERO,F.CERO,F.CERO],F.UNO,10).tipo,'vacio');
for(const [a,tipo,d] of [
 [[[0,2,4,10],[2,1,-1,1],[1,-1,2,5]],'unica',0],
 [[[1,0,0,1],[0,1,0,2],[0,0,1,3]],'unica',0],
 [[[1,1,1,3],[2,2,2,6]],'infinitas',2],
 [[[1,1,0,3],[0,1,1,2]],'infinitas',1],
 [[[0,0,0,0]],'infinitas',3],
 [[[1,0,0,1],[1,0,0,2]],'incompatible',-1],
 [[[1,0,0,0],[0,1,0,0],[1,1,0,1]],'incompatible',-1],
 [[[0,0,0,1]],'incompatible',-1],
 [[[1,0,1],[0,1,2]],'unica',0],
 [[[1,1,2],[2,2,5]],'incompatible',-1],
 [[[1,2]],'unica',0],
 [[[0,0]],'infinitas',1],
 [[[0,1]],'incompatible',-1]
]){
 const m=modelo(a),n=m.n,im=m.proyectar(Array.from({length:Math.min(3,n)},(_,i)=>i));
 assert.equal(m.tipo,tipo);assert.equal(im.dimension,d);
 const fig=E.cortarFamilia(im,10);
 if(tipo==='incompatible'){assert.equal(fig.tipo,'vacio');assert.throws(()=>m.evaluar([]));}
 else {
  a.forEach(row=>verificarPuntos(fig,row.slice(0,n),row[n]));
  assert(m.evaluar(m.libres.map(()=>F.CERO)).comprobaciones.every(c=>c.izquierda.restar(c.derecha).esCero()));
 }
}
// Una solución fuera de la ventana no se confunde con un sistema incompatible.
const lejano=modelo([[1,0,100],[0,1,100]]);
assert.equal(lejano.tipo,'unica');assert.equal(E.cortarFamilia(lejano.proyectar([0,1]),10).puntos.length,0);
// Recta sin corte, tangente y coordenadas constantes.
assert.equal(E.cortarRecta([racional(20),F.CERO],[F.CERO,F.UNO],10).length,0);
assert.equal(E.cortarRecta([racional(10),F.CERO],[F.CERO,F.UNO],10).length,2);
// Proyectar cuatro variables no equivale a eliminar un coeficiente de cada ecuación.
const cuatro=modelo([[1,0,0,1,3],[0,1,0,0,2]]);
assert.equal(cuatro.proyectar([0,1,2]).dimension,2);
console.log('Geometría ampliada: tres clasificaciones, planos exactos, casos degenerados, recortes y proyecciones verificados.');

// La misma geometría debe sobrevivir al cambio de escala y a ecuaciones equivalentes.
let semilla=20261124;
const aleatorio=()=>{semilla=(Math.imul(1664525,semilla)+1013904223)>>>0;return semilla%11-5;};
const firma=fig=>Array.from(fig.puntos,p=>Array.from(p,v=>v.aTexto()).join(',')).sort().join(';');
for(let prueba=0;prueba<150;prueba++){
 const a=Array.from({length:3},aleatorio).map(racional),b=racional(aleatorio()),factor=racional(prueba%2?-7:3);
 for(const limite of [0.5,5,50]){
  const fig=E.cortarEcuacion(a,b,limite);
  assert.equal(firma(fig),firma(E.cortarEcuacion(a.map(v=>v.multiplicar(factor)),b.multiplicar(factor),limite)));
  for(const p of fig.puntos){
   assert(p.reduce((s,v,i)=>s.sumar(v.multiplicar(a[i])),F.CERO).restar(b).esCero());
   assert(p.every(v=>Math.abs(E.numero(v))<=limite+1e-12));
  }
 }
}
for(const limite of [0.5,5,50]){
 const m=modelo([[1,1,1,3],[0,1,-1,1]]),fig=E.cortarFamilia(m.proyectar([0,1,2]),limite);
 fig.puntos.forEach(p=>m.original.forEach(row=>assert(p.reduce((s,v,i)=>s.sumar(row[i].multiplicar(v)),F.CERO).restar(row[3]).esCero())));
}
// Una coordenada demasiado grande se puede detectar fuera de la vista sin convertirla a Number.
assert.equal(E.cortarFamilia({origen:[new F(10n**1000n)],base:[],dimension:0},5).puntos.length,0);
console.log('Auditoría: 450 recortes equivalentes, zoom, recta común y coordenadas extremas correctos.');
