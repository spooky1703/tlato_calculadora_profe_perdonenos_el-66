const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{}};vm.createContext(c);
for(const name of ['configuracion','fracciones','gauss-jordan','unidad2','unidad3'])vm.runInContext(fs.readFileSync(`${__dirname}/../js/${name}.js`,'utf8'),c);
const {Fraccion:F,GaussJordan:G,Unidad2:U2,Unidad3:U3}=c.window;
const rank=cols=>cols.length?G.reducir(Array.from({length:cols[0].length},(_,i)=>[...cols.map(v=>v[i]),F.CERO]),cols.length).rangoCoeficientes:0;
function comprobar(entrada,completa){
 const copia=JSON.stringify(entrada),r=U3.analizar(entrada,completa),a=entrada.map(v=>v.map(F.desdeTexto)),b=r.ortogonales;
 assert.equal(JSON.stringify(entrada),copia);
 assert.equal(rank(b),completa?a[0].length:rank(a));
 // La unión no aumenta la dimensión: el resultado conserva el espacio deseado.
 if(!completa)assert.equal(rank([...a,...b]),rank(a));
 for(let i=0;i<b.length;i++){
  const norma=U3.productoPunto(b[i],b[i]);assert(norma.n>0n);
  assert(norma.restar(r.normasCuadradas[i]).esCero());
  assert(norma.dividir(r.normasCuadradas[i]).esUno());
  for(let j=0;j<i;j++)assert(U3.productoPunto(b[i],b[j]).esCero());
 }
 return r;
}
const caso=[['1','1','-1'],['1','0','-1'],['1','-1','-1']];
assert(!U2.analizar(caso,null,'li-ld').independientes);
assert.equal(U2.completar(caso).agregados.length,1);
for(const entrada of [caso,[['0','0'],['0','0']],[['-2']],[['1','2'],['2','4']],[['1/2','-3/4'],['2/3','5/7']],[['1000000000000000','1']]]){
 comprobar(entrada,false);comprobar(entrada,true);
}
assert.equal(U3.analizar([['0','0']],false).dimension,0);
assert.equal(U3.analizar([['0','0']],true).dimension,2);
let seed=91;const azar=()=>seed=seed*16807%2147483647;
for(let k=0;k<100;k++){
 const d=1+azar()%5,n=1+azar()%7;
 const a=Array.from({length:n},()=>Array.from({length:d},()=>String(azar()%9-4)));
 comprobar(a,false);comprobar(a,true);
 const r=U2.completar(a);assert.equal(rank(r.baseCompleta),d);
 const base=r.base.slice();for(const extra of r.agregados){const antes=rank(base);base.push(extra.vector);assert.equal(rank(base),antes+1);}
}
for(const n of [0n,1n,2n,4n,8n,9n,10n,10n**500n+1n]){
 const r=U3.raizEntera(n);assert(r*r<=n&&(r+1n)*(r+1n)>n);
}
for(const a of [[],[null],[['']],[['1'],['2','3']],[['1/0']]])assert.throws(()=>U3.analizar(a,true));
assert.throws(()=>U3.productoPunto([F.UNO],[]));
assert.throws(()=>U3.raizEntera(-1n));
// La interfaz no debe volver a contener una aritmética ni un Gauss paralelos.
const ui=fs.readFileSync(`${__dirname}/../js/unidad3-ortogonalidad.js`,'utf8');
assert(!/obtenerIndicesPivote|crearFrac|mcdBigInt|ejecutarGramSchmidt/.test(ui));
console.log('U2/U3: captura LD, completar, cero, racionales, raíces grandes y 200 recorridos aleatorios comprobados.');
