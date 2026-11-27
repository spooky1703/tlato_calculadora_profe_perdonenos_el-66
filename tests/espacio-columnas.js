const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{}};vm.createContext(c);
for(const n of ['configuracion','fracciones','gauss-jordan','espacio-columnas'])vm.runInContext(fs.readFileSync(`${__dirname}/../js/${n}.js`,'utf8'),c);
const {Fraccion:F,EspacioColumnas:E,GaussJordan:G}=c.window;
const m=a=>a.map(f=>f.map(v=>F.desdeTexto(String(v))));
function revisar(a){const original=m(a),n=a[0].length-1,r=E.crear(original,n);assert.equal(r.pertenece,G.reducir(original,n).tipo!=='incompatible');
 for(const L of [.5,5,50])for(const p of E.figura(r,L)){
 assert(p.every(v=>Math.abs(E.numero(v))<=L+1e-10));
 if(r.dimension===2)assert(E.punto(r.normal,p).esCero());
 if(r.dimension===1)assert(E.cruz(r.base[0],p).every(v=>v.esCero()));
 }return r;}
assert.equal(revisar([[1,0,2],[0,1,3],[0,0,0]]).dimension,2);
assert(!revisar([[1,0,2],[0,1,3],[0,0,1]]).pertenece);
assert.equal(revisar([[1,0,0,1],[0,1,0,2],[0,0,1,3]]).dimension,3);
assert.equal(revisar([[1,2,3],[2,4,6],[3,6,9]]).dimension,1);
assert(!revisar([[1,2,3],[2,4,6],[3,6,8]]).pertenece);
assert.equal(revisar([[0,0],[0,0],[0,0]]).dimension,0);
assert(!revisar([[0,1],[0,0],[0,0]]).pertenece);
revisar([[1,2,3,4,5,6]]);revisar([[1,0,3],[0,1,4]]);
assert.throws(()=>E.crear(m([[1,1],[2,2],[3,3],[4,4]]),1));
let seed=41;const rand=()=>seed=seed*16807%2147483647;
for(let k=0;k<300;k++){let rows=1+rand()%3,cols=1+rand()%6;revisar(Array.from({length:rows},()=>Array.from({length:cols+1},()=>String(rand()%9-4))));}
console.log('Espacio columna: 300 sistemas aleatorios, rangos 0–3, pertenencia exacta, producto cruz y recortes comprobados.');
const combinacion=revisar([[2,0,0,3],[0,2,0,1],[0,0,2,1]]);
assert.equal(combinacion.coeficientes.map(x=>x.aTexto()).join(','),'3/2,1/2,1/2');
assert.equal(combinacion.camino.at(-1).fin.map(x=>x.aTexto()).join(','),'3,1,1');
assert.equal(E.escala(combinacion),3.6);
const cancelacion=revisar([[1,1,1],[0,1,100]]);
assert(E.escala(cancelacion,true)>=E.escala(cancelacion));
for(const a of [[[1,2,3],[2,4,6]],[[0,0]],[[1,1],[0,1]]]) {
 const r=revisar(a);
 if(r.pertenece)assert(r.camino.at(-1).fin.every((x,i)=>x.restar(r.b[i]).esCero()));
 else assert.equal(r.coeficientes,null);
}
const corte=E.segmento(m([[-10,0,0]])[0],m([[10,0,0]])[0],5);
assert.equal(corte.map(v=>v.map(x=>x.aTexto()).join(',')).join(';'),'-5,0,0;5,0,0');
console.log('Combinación: coeficientes, llegada exacta a b, autoescala y recorte de segmentos verificados.');

assert.throws(()=>E.numero(new F(1n,10n**400n)), /escala/);
assert.throws(()=>E.numero(new F(10n**400n)), /escala/);
assert.equal(E.numero(F.CERO),0);
console.log('Gráfica: magnitudes no representables rechazadas, sin convertirlas en cero.');
