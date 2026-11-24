// Detecta desconexiones entre módulos y elementos antes de abrir la página.
const fs = require('fs'), path = require('path'), assert = require('assert');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size, ids.length, 'No debe haber identificadores repetidos.');
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s+defer><\/script>/g)].map(m=>m[1].split('?')[0]);
for (const nombre of ['configuracion','espacio-soluciones','visualizacion-soluciones','tema','navegacion','guia-importacion','fracciones','gauss-jordan','practica-modelo','practica-ui','guia-practica','app','ayuda','matrices-cuadradas']) {
 const archivo=`js/${nombre}.js`;
 assert(scripts.includes(archivo),`Falta cargar ${archivo}`);
 const codigo=fs.readFileSync(path.join(raiz,archivo),'utf8');
 for(const ref of codigo.matchAll(/(?:getElementById\(|\$\()'([^']+)'\)/g)) assert(ids.includes(ref[1]),`${archivo} depende de #${ref[1]}, ausente en la página`);
}
assert(scripts.indexOf('js/fracciones.js') < scripts.indexOf('js/gauss-jordan.js'));
console.log('Integración: módulos, dependencias y elementos de la interfaz conectados.');

assert(scripts.indexOf('js/practica-modelo.js') < scripts.indexOf('js/practica-ui.js'));
assert(scripts.indexOf('js/practica-ui.js') < scripts.indexOf('js/app.js'));

assert(scripts.indexOf('js/configuracion.js') < scripts.indexOf('js/gauss-jordan.js'));
assert(scripts.indexOf('js/visualizacion-soluciones.js') < scripts.indexOf('js/app.js'));
