const fs = require('fs'), vm = require('vm'), assert = require('assert');
const c = { window: {} }; vm.createContext(c);
for (const n of ['configuracion','fracciones','gauss-jordan','unidad2']) vm.runInContext(fs.readFileSync(`${__dirname}/../js/${n}.js`, 'utf8'), c);
const { Unidad2: U, Fraccion: F, GaussJordan: G } = c.window;
function evaluar(s, gamma, actividad) {
  const copia = JSON.stringify(s), r = U.analizar(s, gamma, actividad);
  assert.equal(JSON.stringify(s), copia);
  if (actividad === 'generado' && r.pertenece) {
    for (let i = 0; i < gamma.length; i++) {
      let suma = F.CERO;
      s.forEach((v,j) => { suma = suma.sumar(F.desdeTexto(v[i]).multiplicar(r.coeficientes[j])); });
      assert(suma.restar(F.desdeTexto(gamma[i])).esCero(), 'La combinación debe reproducir gamma');
    }
  }
  r.indicesBase.forEach((j,i) => assert.equal(JSON.stringify(r.base[i].map(v=>v.aTexto())), JSON.stringify(s[j].map(v=>F.desdeTexto(v).aTexto()))));
  return r;
}
const s = [['1','0','2'],['0','1','1'],['1','1','3']];
assert(evaluar(s,['3','2','8'],'generado').pertenece);
assert(!evaluar(s,['3','2','9'],'generado').pertenece);
assert(!evaluar(s,null,'li-ld').independientes);
assert.equal(evaluar(s,null,'base').indicesBase.join(','),'0,1');
assert(evaluar([['1','0'],['0','1']],null,'li-ld').independientes);
assert.equal(evaluar([['0','0'],['0','0']],null,'base').base.length,0);
assert(evaluar([['0','0']],['0','0'],'generado').pertenece);
assert(!evaluar([['0','0']],['1','0'],'generado').pertenece);
assert.equal(evaluar([['0','0'],['2','4']],null,'base').indicesBase.join(','),'1');
evaluar([['1/2','-3/4'],['2/3','5/7']],['1/3','-2/9'],'generado');
let semilla=91;
const azar=()=>semilla=semilla*16807%2147483647;
for(let k=0;k<150;k++) {
 const m=1+azar()%6,n=1+azar()%7;
 const s=Array.from({length:n},()=>Array.from({length:m},()=>String(azar()%9-4)));
 const pesos=Array.from({length:n},()=>F.desdeTexto(String(azar()%7-3)));
 const gamma=Array.from({length:m},(_,i)=>s.reduce((suma,v,j)=>suma.sumar(F.desdeTexto(v[i]).multiplicar(pesos[j])),F.CERO).aTexto());
 assert(evaluar(s,gamma,'generado').pertenece);
 const base=evaluar(s,null,'base');
 if(base.base.length) {
   const b=base.base.map(v=>v.map(x=>x.aTexto()));
   assert(evaluar(b,null,'li-ld').independientes);
   for(const v of s) assert(evaluar(b,v,'generado').pertenece);
 }
}
for(const args of [[[],null,'base'],[[['1'],['1','2']],null,'base'],[[['']],null,'base'],[[['1']],[], 'generado'],[[['1']],null,'otro']]) assert.throws(()=>U.analizar(...args));
// Una sola llamada al motor por actividad; ningún algoritmo de eliminación paralelo.
const original=G.reducir; let llamadas=0;
G.reducir=(...args)=>{llamadas++;return original(...args);};
for(const actividad of ['generado','li-ld','base']) U.analizar(s,['3','2','8'],actividad);
assert.equal(llamadas,3);
console.log('Unidad 2: pertenencia, LI/LD, base original, espacio cero, fracciones y 150 conjuntos aleatorios comprobados; solo usa GaussJordan.reducir.');
