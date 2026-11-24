(function (global) {
  // Formato común de matrices y resultados: nunca presentar n/d como texto.
  // aTexto() se reserva para edición, cálculos y almacenamiento.
  function fraccion(valor) {
    const nodo = document.createElement('span');
    if (valor.d === 1n) {
      nodo.textContent = String(valor.n);
      return nodo;
    }
    nodo.className = 'fraccion';
    nodo.setAttribute('aria-label', `${valor.n} sobre ${valor.d}`);
    for (const [clase, texto] of [['numerador', valor.n], ['barra', ''], ['denominador', valor.d]]) {
      const parte = document.createElement('span');
      parte.className = clase;
      parte.textContent = String(texto);
      parte.setAttribute('aria-hidden', 'true');
      nodo.append(parte);
    }
    return nodo;
  }
  function expresion(texto) {
    const numero = global.Fraccion.desdeTexto(texto);
    if (!global.Fraccion.contieneConstantes(texto)) return fraccion(numero);
    const nodo = document.createElement('span');
    nodo.className = 'expresion-constantes';
    nodo.textContent = texto.toLowerCase().replace(/euler/g, 'e').replace(/pi/g, 'π').replace(/\*/g, '·').replace(/-/g, '−');
    return nodo;
  }
  global.FormatoMatematico = { fraccion, expresion };
})(window);
