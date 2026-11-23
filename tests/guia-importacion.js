const fs = require('fs'), vm = require('vm'), assert = require('assert');
const codigo = fs.readFileSync(`${__dirname}/../js/guia-importacion.js`, 'utf8');
function visita(almacen = new Map(), sinAlmacenamiento = false) {
  const elementos = new Map();
  function elemento(id) {
    if (!elementos.has(id)) elementos.set(id, {
      open: false, hidden: false, clics: 0, aperturas: 0, children: [], eventos: {},
      style: {setProperty() {}}, classList: {toggle() {}},
      setAttribute() {}, focus() {}, querySelectorAll() { return []; },
      addEventListener(nombre, fn) { this.eventos[nombre] = fn; },
      click() { this.clics++; }, showModal() { this.open = true; this.aperturas++; },
      close() { this.open = false; this.eventos.close?.(); }
    });
    return elementos.get(id);
  }
  const c = {window: {}, document: {getElementById: elemento},
    requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, matchMedia() { return {matches: false}; },
    localStorage: {
      getItem(k) { if (sinAlmacenamiento) throw Error('bloqueado'); return almacen.get(k); },
      setItem(k, v) { if (sinAlmacenamiento) throw Error('bloqueado'); almacen.set(k, v); }
    }
  };
  vm.createContext(c); vm.runInContext(codigo, c);
  c.window.AyudaTlato = {mostrar(tema) { assert.equal(tema, 'archivo'); c.window.GuiaImportacion.iniciar(); }};
  return {guia: c.window.GuiaImportacion, elemento};
}
const memoria = new Map([['tlato-recorrido-visto', '1']]);
const primera = visita(memoria), input = primera.elemento('input-archivo');
// Ver el ejemplo dentro de Cómo usar no evita la guía del primer clic en Cargar.
primera.guia.iniciar();
primera.guia.cargar(input);
assert.equal(input.clics, 0);
assert.equal(primera.elemento('modal-ayuda').aperturas, 1);
primera.elemento('elegir-archivo-guia').onclick();
assert.equal(input.clics, 1);
assert.equal(primera.elemento('modal-ayuda').open, false);
primera.guia.cargar(input);
assert.equal(input.clics, 2);
const siguiente = visita(memoria), input2 = siguiente.elemento('input-archivo');
siguiente.guia.cargar(input2);
assert.equal(input2.clics, 1);
assert.equal(siguiente.elemento('modal-ayuda').aperturas, 0);
// Con almacenamiento bloqueado, el selector sigue disponible tras ver la guía.
const privada = visita(new Map(), true), input3 = privada.elemento('input-archivo');
privada.guia.cargar(input3); privada.elemento('modal-ayuda').close(); privada.guia.cargar(input3);
assert.equal(privada.elemento('modal-ayuda').aperturas, 1);
assert.equal(input3.clics, 1);
console.log('Guía de carga: primera visita independiente, selector, persistencia y almacenamiento bloqueado correctos.');
