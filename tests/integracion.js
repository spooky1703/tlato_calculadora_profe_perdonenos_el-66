// Detecta desconexiones entre módulos y elementos antes de abrir la página.
const fs = require('fs'), path = require('path'), assert = require('assert');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size, ids.length, 'No debe haber identificadores repetidos.');
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s+defer><\/script>/g)].map(m=>m[1]);
for (const nombre of ['tema','fracciones','gauss-jordan','espacio-soluciones','visualizacion-soluciones','app','ayuda']) {
 const archivo=`js/${nombre}.js`;
 assert(scripts.includes(archivo),`Falta cargar ${archivo}`);
 const codigo=fs.readFileSync(path.join(raiz,archivo),'utf8');
 for(const ref of codigo.matchAll(/(?:getElementById\(|\$\()'([^']+)'\)/g)) assert(ids.includes(ref[1]),`${archivo} depende de #${ref[1]}, ausente en la página`);
}
assert(scripts.indexOf('js/fracciones.js') < scripts.indexOf('js/gauss-jordan.js'));
assert(scripts.indexOf('js/espacio-soluciones.js') < scripts.indexOf('js/visualizacion-soluciones.js'));
assert(scripts.indexOf('js/visualizacion-soluciones.js') < scripts.indexOf('js/app.js'));
console.log('Integración: módulos, dependencias y elementos de la interfaz conectados.');
