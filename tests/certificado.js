// Verificación independiente: no usa Fraccion ni GaussJordan para revisar operaciones.
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const root=path.join(__dirname,'..');
const c={window:{}};vm.createContext(c);
for(const name of ['configuracion','fracciones','gauss-jordan'])vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),c);
function q(s){const p=String(s).split('/');return [BigInt(p[0]),BigInt(p[1]||1)];}
function norm([a,b]){assert.notEqual(b,0n);if(b<0n){a=-a;b=-b;}let x=a<0n?-a:a,y=b;while(y){[x,y]=[y,x%y];}return [a/x,b/x];}
const mul=(a,b)=>norm([a[0]*b[0],a[1]*b[1]]);
const sub=(a,b)=>norm([a[0]*b[1]-b[0]*a[1],a[1]*b[1]]);
const eq=(a,b)=>a[0]*b[1]===b[0]*a[1];
function revisar(original,ops,final,tipo){
 const m=original.map(r=>r.map(q)),n=m[0].length-1;
 for(const op of ops){
  assert(Number.isInteger(op.fila)&&op.fila>=0&&op.fila<m.length);
  if(op.tipo==='intercambio'||op.tipo==='restar')assert(Number.isInteger(op.otra)&&op.otra>=0&&op.otra<m.length&&op.otra!==op.fila);
  if(op.tipo==='intercambio')[m[op.fila],m[op.otra]]=[m[op.otra],m[op.fila]];
  else if(op.tipo==='dividir'){const a=q(op.factor);assert.notEqual(a[0],0n);m[op.fila]=m[op.fila].map(v=>mul(v,[a[1],a[0]]));}
  else if(op.tipo==='restar'){const a=q(op.factor);m[op.fila]=m[op.fila].map((v,j)=>sub(v,mul(a,m[op.otra][j])));}
  else throw Error('Operación desconocida');
 }
 assert.equal(final.length,m.length);let anterior=-1,nula=false,pivotes=0,incompatible=false;
 m.forEach((row,i)=>{
  assert.equal(final[i].length,row.length);row.forEach((v,j)=>assert(eq(v,q(final[i][j])),'La matriz final no coincide'));
  const k=row.findIndex(v=>v[0]!==0n);
  if(k<0){nula=true;return;}
  assert(!nula&&k>anterior,'Orden de pivotes');anterior=k;
  assert(eq(row[k],[1n,1n]),'Pivote unitario');
  m.forEach((r,j)=>{if(i!==j)assert.equal(r[k][0],0n);});
  if(k===n)incompatible=true;else pivotes++;
 });
 assert.equal(tipo,incompatible?'incompatible':pivotes===n?'unica':'infinitas');
 return true;
}
function calcular(original){const ops=[],f=c.window.Fraccion;const r=c.window.GaussJordan.reducir(original.map(row=>row.map(x=>f.desdeTexto(String(x)))),original[0].length-1,op=>ops.push(op));const final=r.matriz.map(row=>row.map(v=>v.aTexto()));revisar(original,ops,final,r.tipo);return {original,operaciones:ops,final,tipo:r.tipo,verificado:true};}
const cases=[
 {nombre:'Intercambio y solución única',a:[['0','1','1'],['1','1','3']]},
 {nombre:'Infinitas soluciones',a:[['1','1','3'],['2','2','6']]},
 {nombre:'Sin soluciones',a:[['1','1','3'],['2','2','7']]},
 {nombre:'Fracciones',a:[['1/2','1/3','1'],['1','-1','0']]},
 {nombre:'Columna libre',a:[['0','1','2'],['0','2','4']]},
 {nombre:'Contradicción tras fila nula',a:[['1','0'],['0','0'],['0','2']]},
 {nombre:'Matriz nula',a:[['0','0','0'],['0','0','0']]},
 {nombre:'Rectangular',a:[['1','0','1','3'],['0','1','1','4']]}
];
const demo=cases.map(x=>({nombre:x.nombre,...calcular(x.a)}));let total=demo.length,seed=413;
for(let k=0;k<500;k++){const rand=()=>{seed=(seed*16807)%2147483647;return seed;};const n=1+rand()%7,m=1+rand()%8;calcular(Array.from({length:m},()=>Array.from({length:n+1},()=>String(rand()%15-7))));total++;}
const max=Array.from({length:120},(_,i)=>Array.from({length:120},(_,j)=>j===119?String(i<119?i+1:0):String(Number(i===j))));calcular(max);total++;
let rejected=0;const good=demo[0];
for(const alter of [x=>x.final[0][2]='999',x=>x.tipo='infinitas',x=>x.operaciones[0]={tipo:'dividir',fila:0,factor:'0'},x=>x.operaciones[0]={tipo:'restar',fila:0,otra:0,factor:'1'}]){const x=JSON.parse(JSON.stringify(good));alter(x);assert.throws(()=>revisar(x.original,x.operaciones,x.final,x.tipo));rejected++;}
const report={fecha:'2026-11-21',casosVerificados:total,alteracionesRechazadas:rejected,alcance:'Registro del solucionador real; reproducción con aritmética independiente; RREF y clasificación. No valida transcripción de imágenes ni garantiza recursos ilimitados.',ejemplos:demo};
if(process.argv.includes('--guardar'))fs.writeFileSync(path.join(root,'output/venta-tlato/evidencia.json'),JSON.stringify(report,null,2));
console.log(`${total} sistemas certificados; ${rejected} alteraciones rechazadas.`);
module.exports={calcular,revisar};
