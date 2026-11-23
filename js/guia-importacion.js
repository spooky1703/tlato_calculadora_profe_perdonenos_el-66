(() => {
  const $ = id => document.getElementById(id), modal = $('modal-ayuda');
  const tabs = [$('ejemplo-txt'), $('ejemplo-excel')];
  const contenido = '1;1;0;3\n0;1;1;2\n1;0;1;3';
  const clavePrimeraCarga = 'tlato-guia-primera-carga-v1';
  let cargaVista = false;
  try { cargaVista = localStorage.getItem(clavePrimeraCarga) === '1'; } catch { /* Se recuerda durante esta visita. */ }
  let formato = 0, frame, inicio, entrada;
  function animar(ahora) {
    if (!modal.open || $('guia-archivo').hidden) return;
    if (inicio === null) inicio = ahora;
    const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tiempo = reducido ? 10000 : ahora - inicio;
    const caracteres = Math.min(contenido.length, Math.floor(tiempo / 85));
    $('texto-ejemplo-archivo').textContent = contenido.slice(0, caracteres);
    [...$('panel-ejemplo-excel').querySelectorAll('td')].forEach((el,i) => {
      const visible = tiempo > i * 260;
      el.classList.toggle('visible', visible);
      el.classList.toggle('escribiendo', visible && tiempo < (i+1)*260);
    });
    const transfiriendo = tiempo >= 3000 && tiempo < 4200;
    const progreso = Math.max(0, Math.min(1, (tiempo - 3000) / 1200));
    const suavizado = progreso * progreso * (3 - 2 * progreso);
    $('dato-transferido').style.setProperty('--avance-transferencia', suavizado);
    $('dato-transferido').style.opacity = transfiriendo ? String(Math.sin(progreso * Math.PI)) : '0';
    [...$('matriz-desde-txt').children].forEach((el,i) => el.classList.toggle('cargada', tiempo >= 4200 + i * 80));
    const terminado = tiempo >= 5300;
    $('zona-carga-guia').style.setProperty('--avance-carga', suavizado);
    $('zona-carga-guia').classList.toggle('demostrando-carga', transfiriendo && !reducido);
    $('estado-matriz-txt').textContent = tiempo < 3000 ? 'Esperando archivo' : tiempo < 5300 ? 'Cargando los valores…' : '✓ 3 filas · 3 columnas';
    $('matriz-desde-txt').classList.toggle('matriz-lista', tiempo >= 5300);
    $('listo-ejemplo-archivo').textContent = terminado ? (formato ? '✓ Listo para cargar' : '✓ Así queda en Tlato') : tiempo >= 3000 && !formato ? 'Cargando matriz…' : 'Escribiendo…';
    $('listo-ejemplo-archivo').classList.toggle('listo', terminado);
    if (tiempo < 5500) frame = requestAnimationFrame(animar);
  }
  function mostrar(indice, foco = false) {
    formato = indice;
    tabs.forEach((tab,i) => { tab.setAttribute('aria-selected',String(i===indice));tab.tabIndex=i===indice?0:-1; });
    $('panel-ejemplo-txt').hidden = indice !== 0;
    $('panel-ejemplo-excel').hidden = indice !== 1;
    $('nombre-ejemplo-archivo').textContent = indice ? 'mi-sistema.xlsx' : 'mi-sistema.txt';
    $('consejo-ejemplo-archivo').textContent = indice ? 'Excel: empieza en A1, en la primera hoja. Solo valores, sin fórmulas ni celdas combinadas.' : 'TXT: una fila por línea. Separa valores con ; y escribe expresiones sin espacios: 1/2.';
    $('archivo-demo-carga').textContent = indice ? 'XLSX' : 'TXT';
    cancelAnimationFrame(frame); inicio = null; frame = requestAnimationFrame(animar);
    if(foco) tabs[indice].focus();
  }
  function abrir(input) { entrada=input;mostrar(0); }
  tabs.forEach((tab,i) => {
    tab.onclick=()=>mostrar(i);
    tab.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();mostrar(e.key==='Home'?0:e.key==='End'?1:1-formato,true);}};
  });
  $('cerrar-guia-archivo').onclick=()=>window.AyudaTlato.mostrar('calculadora');
  $('repetir-ejemplo-archivo').onclick=()=>mostrar(formato);
  $('elegir-archivo-guia').onclick=()=>{modal.close();entrada?.click();};
  modal.addEventListener('close',()=>cancelAnimationFrame(frame));
  window.GuiaImportacion={
    iniciar(){abrir($('input-archivo'));},
    detener(){cancelAnimationFrame(frame);},
    cargar(input){
      if (cargaVista) { input.click(); return; }
      if (!modal.open) modal.showModal();
      window.AyudaTlato.mostrar('archivo');
      entrada = input;
      cargaVista = true;
      try { localStorage.setItem(clavePrimeraCarga, '1'); } catch { /* El botón sigue funcionando sin almacenamiento. */ }
    }
  };
})();
