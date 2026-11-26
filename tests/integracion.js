// Detecta desconexiones entre módulos y elementos antes de abrir la página.
const fs = require('fs'), path = require('path'), assert = require('assert');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size, ids.length, 'No debe haber identificadores repetidos.');
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s+defer><\/script>/g)].map(m=>m[1].split('?')[0]);
for (const nombre of ['espacio-soluciones','visualizacion-soluciones','configuracion','espacio-columnas','grafica-columnas','tema','navegacion','guia-importacion','fracciones','gauss-jordan','practica-modelo','practica-ui','guia-practica','app','ayuda','matrices-cuadradas','formato-matematico','importar-matriz','unidad2','editor-vectores','unidad2-vectoriales','unidad3-ortogonalidad']) {
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
assert(scripts.indexOf('js/grafica-columnas.js') < scripts.indexOf('js/app.js'));

for (const consumidor of ['app', 'practica-ui', 'matrices-cuadradas']) {
 assert(scripts.indexOf('js/formato-matematico.js') < scripts.indexOf(`js/${consumidor}.js`));
}

assert.equal(new Set(scripts).size, scripts.length, 'No cargar un módulo dos veces');
assert(scripts.indexOf('js/gauss-jordan.js') < scripts.indexOf('js/unidad2.js'));
assert(scripts.indexOf('js/unidad2.js') < scripts.indexOf('js/unidad2-vectoriales.js'));
