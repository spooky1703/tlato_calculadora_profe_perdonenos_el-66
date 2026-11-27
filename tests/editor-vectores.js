const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{}};vm.createContext(c);
vm.runInContext(fs.readFileSync(`${__dirname}/../js/fracciones.js`,'utf8'),c);
let input,guardado,error,abierto=-1;
c.document={createElement(){input={value:'',setAttribute(){},addEventListener(k,f){this[k]=f;},focus(){},select(){}};return input;}};
vm.runInContext(fs.readFileSync(`${__dirname}/../js/editor-vectores.js`,'utf8'),c);
const botones=[0,1,2].map(i=>({getAttribute(){return 'componente'},replaceWith(){},click(){abierto=i;}}));
const zona={querySelectorAll(){return botones}};
function abrir(){c.window.EditorVectores.editar(botones[1],zona,'1/2',v=>guardado=v,()=>{},e=>error=e);}
abrir();input.value='';input.keydown({key:'Tab',preventDefault(){}});
assert.equal(guardado,'');assert(error.includes('vacía'));assert.equal(abierto,2);
abrir();input.value='3/4';input.keydown({key:'Tab',shiftKey:true,preventDefault(){}});assert.equal(abierto,0);assert.equal(guardado,'3/4');
let bloqueado=false;input.beforeinput({data:' ',preventDefault(){bloqueado=true;}});assert(bloqueado);
console.log('Editor compartido: vacío conservado, fracciones, Tab/Shift+Tab y espacios verificados.');
