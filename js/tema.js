(() => {
  const boton = document.getElementById('toggle-tema');
  const icono = document.getElementById('icono-tema');
  const texto = document.getElementById('texto-tema');
  function aplicar(oscuro) {
    document.body.toggleAttribute('data-theme', oscuro);
    if (oscuro) document.body.setAttribute('data-theme', 'dark');
    icono.textContent = oscuro ? 'light_mode' : 'dark_mode';
    texto.textContent = oscuro ? 'Modo día' : 'Modo noche';
    boton.setAttribute('aria-pressed', String(oscuro));
  }
  let guardado;
  try { guardado = localStorage.getItem('tema-tlato'); } catch { /* El tema sigue funcionando sin almacenamiento. */ }
  aplicar(guardado === 'dark');
  boton.addEventListener('click', () => {
    const oscuro = document.body.getAttribute('data-theme') !== 'dark';
    aplicar(oscuro);
    try { localStorage.setItem('tema-tlato', oscuro ? 'dark' : 'light'); } catch { /* Preferencia solo para esta sesión. */ }
  });
})();
