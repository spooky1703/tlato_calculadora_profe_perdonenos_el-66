// Ejecuta los botones reales con un DOM mínimo. Detecta fallos de conexión al motor.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
function nodo(){return {style:{},dataset:{},hidden:false,textContent:'',classList:{add(){},toggle(){},contains(){return false}},setAttribute(){},append(){},replaceChildren(){},addEventListener(){}};}
function preparar(entrada){
 const elementos=new Map();
 const c={window:{},document:{getElementById(id){if(!elementos.has(id))elementos.set(id,nodo());return elementos.get(id);},querySelector:nodo,querySelectorAll(){return []},createElement:nodo}};
 vm.createContext(c);
 for(const name of ['configuracion','fracciones','gauss-jordan','unidad2','unidad3'])vm.runInContext(fs.readFileSync(`${__dirname}/../js/${name}.js`,'utf8'),c);
 c.window.FormatoMatematico={fraccion:nodo,expresion:nodo};
 for(const name of ['unidad2-vectoriales','unidad3-ortogonalidad']){
  let code=fs.readFileSync(`${__dirname}/../js/${name}.js`,'utf8');
  code=code.replace(/let vectoresS = \[[\s\S]*?\n  \];/,`let vectoresS = ${JSON.stringify(entrada)};`);
  vm.runInContext(code,c);
 }
 return elementos;
}
for(const entrada of [[['1','1','-1'],['1','0','-1'],['1','-1','-1']],[['0','0','0'],['0','0','0'],['0','0','0']],[['1','0','0'],['0','1','0'],['0','0','1']]]){
 const e=preparar(entrada);
 for(const tab of ['generado','li-ld','base','completar']){
  e.get('u2-tab-'+tab).onclick();e.get('u2-calcular').onclick();
  assert(e.get('u2-error').hidden,e.get('u2-error').textContent);
  assert(!e.get('u2-resultado').hidden);
 }
 for(const tab of ['gs','ortonormal']){
  e.get('u3-tab-'+tab).onclick();e.get('u3-calcular').onclick();
  assert(e.get('u3-error').hidden,e.get('u3-error').textContent);
  assert(!e.get('u3-resultado').hidden);
 }
}
const e=preparar([['','1','0'],['0','1','0'],['0','0','1']]);
e.get('u2-calcular').onclick();assert(!e.get('u2-error').hidden);assert(e.get('u2-resultado').hidden);
e.get('u3-calcular').onclick();assert(!e.get('u3-error').hidden);assert(e.get('u3-resultado').hidden);
console.log('Interfaz U2/U3: seis botones, cero, LI/LD y rechazo de celdas vacías comprobados.');
