(() => {
  const navegacion = document.getElementById('navegacion-unidades');
  const boton = document.getElementById('menu-unidades');
  const lista = document.getElementById('lista-unidades');
  const movil = matchMedia('(max-width: 620px)');
  function abrir(valor, devolverFoco = false) {
    navegacion.classList.toggle('abierta', valor);
    boton.setAttribute('aria-expanded', String(valor));
    boton.setAttribute('aria-label', valor ? 'Cerrar menú de unidades' : 'Abrir menú de unidades');
    if (devolverFoco) boton.focus();
  }
  boton.addEventListener('click', () => abrir(boton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('click', evento => {
    if (!navegacion.contains(evento.target)) abrir(false);
  });
  document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' && navegacion.classList.contains('abierta')) abrir(false, true);
  });
  navegacion.addEventListener('focusout', evento => {
    if (evento.relatedTarget && !navegacion.contains(evento.relatedTarget)) abrir(false);
  });
  lista.addEventListener('click', evento => {
    if (movil.matches && evento.target.closest('.tarjeta-unidad:not(:disabled)')) abrir(false, true);
  });
  movil.addEventListener('change', () => {
    const focoOculto = movil.matches && lista.contains(document.activeElement);
    abrir(false, focoOculto);
  });
})();
