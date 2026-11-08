const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{}};vm.createContext(c);
for(const nombre of ['fracciones','gauss-jordan','practica-modelo'])vm.runInContext(fs.readFileSync(`${__dirname}/../js/${nombre}.js`,'utf8'),c);
const {Fraccion:F,GaussJordan:G,PracticaModelo:M}=c.window;
const matriz=a=>a.map(f=>f.map(F.desdeTexto));
const textos=a=>a.map(f=>f.map(v=>v.aTexto()));
const clave=a=>JSON.stringify(textos(a));
let comprobaciones=0;
function verificar(a){
 const original=matriz(a),n=a[0].length-1,antes=clave(original),p=M.generar(original,n);
 assert.equal(clave(original),antes);assert.equal(clave(p.final),clave(G.reducir(original,n).matriz));
 let anterior=original,ascenso=false;
 for(const paso of p.pasos){
  assert.equal(clave(paso.anterior),clave(anterior));assert.notEqual(clave(paso.anterior),clave(paso.siguiente));
  if(paso.etapa==='Ceros encima')ascenso=true;else assert(!ascenso,'no volver al descenso');
  const op=paso.operacion,m=paso.anterior.map(f=>f.slice());
  if(op.tipo==='intercambio')[m[op.fila],m[op.otra]]=[m[op.otra],m[op.fila]];
  else if(op.tipo==='escala')m[op.fila]=m[op.fila].map(v=>v.multiplicar(op.factor));
  else m[op.fila]=m[op.fila].map((v,j)=>v.sumar(op.factor.multiplicar(m[op.otra][j])));
  assert.equal(clave(m),clave(paso.siguiente));anterior=paso.siguiente;comprobaciones++;
 }
 const sesion=M.sesion(p);
 for(const paso of p.pasos){
  assert.equal(sesion.avanzar(),false);
  const vacio=textos(paso.siguiente).map(f=>f.map(()=>''));
  assert.equal(sesion.verificar(vacio).estado,'invalida');assert.equal(sesion.errores,0);
  const respuesta=textos(paso.siguiente);
  assert.equal(sesion.verificar(respuesta).estado,'correcta');assert(sesion.correcto);
  assert.equal(sesion.verificar(respuesta).estado,'bloqueado');assert(sesion.avanzar());
 }
 assert(sesion.terminada);assert.equal(sesion.nota,p.pasos.length?10:null);
 return p;
}
[
 [[2,1,5],[1,1,3]], [[0,1,2],[1,1,3]], [[0,1,1,2],[0,2,2,4]],
 [[1,1,2],[2,2,5],[0,0,3]], [[0,0,0],[0,0,0]],
 [['1/2','-3/4','1.25'],['1/3','2/7','-4']],
 [[1,0,2],[0,1,3]], [[1,2,3,4]], [[2,4],[3,6],[0,0]],
 [[1,2,1,-1,3],[2,7,5,3,17],[1,4,4,3,11],[3,10,8,5,25]]
].forEach(verificar);
let semilla=23;const azar=()=>semilla=semilla*16807%2147483647;
for(let k=0;k<200;k++){const n=1+azar()%6,m=1+azar()%7;verificar(Array.from({length:m},()=>Array.from({length:n+1},()=>String(azar()%9-4))));}
verificar(Array.from({length:15},(_,i)=>Array.from({length:15},(_,j)=>i<14?(j===i?'2':j>i?'1':'0'):'0')));
const p=M.generar(matriz([[2,4]]),1),s=M.sesion(p);
assert.equal(s.verificar([['1','pi']]).estado,'invalida');assert.equal(s.errores,0);
assert.equal(s.verificar([['1','3']]).estado,'incorrecta');assert.equal(s.errores,1);assert.equal(s.nota,5);
assert.equal(s.verificar([['1','4/2']]).estado,'correcta');assert.equal(s.errores,1);assert(s.avanzar());assert(s.terminada);assert.equal(s.nota,5);
console.log(`Práctica: ${comprobaciones} operaciones verificadas; ruta RREF, casos límite, equivalencia de respuestas, bloqueo y calificación correctos.`);
const conPista=M.sesion(p);
assert(conPista.pedirPista());assert.equal(conPista.pistas,1);assert.equal(conPista.nota,5);
assert.equal(conPista.pedirPista(),false);assert.equal(conPista.pistas,1);
assert.equal(conPista.verificar([['1','2']]).estado,'correcta');assert.equal(conPista.pedirPista(),false);
assert(conPista.avanzar());assert.equal(conPista.pedirPista(),false);assert.equal(conPista.nota,5);
const combinada=M.sesion(p);combinada.pedirPista();combinada.verificar([['1','3']]);assert.equal(combinada.nota,10/3);
console.log('Pistas: descuento, combinación con errores y cobro único por paso correctos.');
