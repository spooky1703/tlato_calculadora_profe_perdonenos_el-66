(function (global) {
  // Las dos unidades comparten la edición; el cálculo no depende de este archivo.
  function editar(boton, zona, valor, guardarValor, renderizar, mostrarError) {
    const botones = [...zona.querySelectorAll('button.celda')];
    const indice = botones.indexOf(boton);
    const entrada = document.createElement('input');
    entrada.className = 'celda'; entrada.maxLength = 256;
    entrada.value = valor; entrada.autocomplete = 'off'; entrada.spellcheck = false;
    entrada.setAttribute('aria-label', boton.getAttribute('aria-label'));
    let guardado = false;
    function guardar() {
      if (guardado) return;
      guardado = true; guardarValor(entrada.value);
      try { global.Fraccion.desdeTexto(entrada.value); }
      catch (e) { mostrarError(e.message); }
      renderizar();
    }
    function abrir(indiceNuevo) { zona.querySelectorAll('button.celda')[indiceNuevo]?.click(); }
    entrada.addEventListener('beforeinput', e => { if (/\s/.test(e.data || '')) e.preventDefault(); });
    entrada.addEventListener('paste', e => { if (/\s/.test(e.clipboardData.getData('text'))) { e.preventDefault(); mostrarError('Pega un valor sin espacios.'); } });
    entrada.addEventListener('blur', e => {
      const siguiente = botones.indexOf(e.relatedTarget);
      guardar(); if (siguiente >= 0) abrir(siguiente);
    });
    entrada.addEventListener('keydown', e => {
      if (e.key === 'Escape') { entrada.value = valor; entrada.blur(); }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault(); guardar();
        abrir((indice + (e.shiftKey ? -1 : 1) + botones.length) % botones.length);
      }
    });
    boton.replaceWith(entrada); entrada.focus(); entrada.select();
  }
  global.EditorVectores = { editar };
})(window);
