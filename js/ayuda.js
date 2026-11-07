(() => {
  const $ = id => document.getElementById(id);
  const ayuda = $('modal-ayuda');
  const svgNS = 'http://www.w3.org/2000/svg';
  const valores = ['1', '1', '0', '3', '0', '1', '1', '2', '1', '0', '1', '3'];
  const celdas = valores.map((valor, i) => {
    const x = 48 + (i % 4) * 85, y = 77 + Math.floor(i / 4) * 56;
    const rect = document.createElementNS(svgNS, 'rect');
    Object.entries({x, y, width: 68, height: 44, rx: 7, fill: 'white', stroke: '#cbd0d8'}).forEach(([k,v]) => rect.setAttribute(k,v));
    const texto = document.createElementNS(svgNS, 'text');
    texto.setAttribute('x', x + 34); texto.setAttribute('y', y + 28); texto.setAttribute('text-anchor', 'middle');
    $('demo-celdas').append(rect, texto);
    return {texto, x, y, valor};
  });
  function svgElemento(tipo, atributos, padre, texto) {
    const el = document.createElementNS(svgNS, tipo);
    Object.entries(atributos).forEach(([k,v]) => el.setAttribute(k,v));
    if (texto !== undefined) el.textContent = texto;
    padre.append(el); return el;
  }
  const rejilla = [];
  for (let fila = 0; fila < 4; fila++) {
    for (let col = 0; col < 5; col++) {
      const grupo = svgElemento('g', {}, $('demo-rejilla'));
      svgElemento('rect', {width: 47, height: 30, rx: 5, fill: 'white', stroke: '#cbd0d8'}, grupo);
      svgElemento('text', {x: 23.5, y: 21, 'text-anchor': 'middle'}, grupo, '0');
      if (col === 4) svgElemento('path', {d: 'M-5 -3 V33', stroke: '#252a34'}, grupo);
      rejilla.push({grupo, fila, col});
    }
  }
  const botonesDimension = ['+ Fila', '+ Incógnita', '− Fila', '− Incógnita'].map((texto, i) => {
    const grupo = svgElemento('g', {}, $('demo-botones-dimension'));
    const rect = svgElemento('rect', {x: 410, y: 78 + i * 43, width: 149, height: 34, rx: 7, fill: 'white', stroke: '#cbd0d8'}, grupo);
    svgElemento('text', {x: 484, y: 100 + i * 43, 'text-anchor': 'middle'}, grupo, texto);
    return rect;
  });
  const pasos = [
    ['1. Fracciones con formato matemático', 'Escribe 1/2 y sal de la celda con Tab, Enter o un clic. Se mostrará un medio con numerador, barra y denominador. Al editarla puedes volver a modificar el texto.'],
    ['2. Constantes y expresiones', 'Puedes usar e o euler para Euler y pi o π para pi, también dentro de expresiones como 2pi o (1+e)/2. Estas constantes se calculan con aproximaciones de 40 decimales.'],
    ['3. Agrega o quita filas y columnas', 'Cada fila añade una ecuación y cada columna de incógnita añade una variable. Los botones − eliminan la última fila o incógnita; la columna b se conserva. Máximo: 15 filas y 14 incógnitas.'],
    ['4. Escribe los coeficientes', 'Pulsa una celda y escribe. Cada fila es una ecuación; b es el término independiente. Tab o Enter avanza a la siguiente celda.'],
    ['5. Pulsa Resolver', 'Ajusta las filas e incógnitas a tu sistema y pulsa Resolver. En el ejemplo: x₁ + x₂ = 3, x₂ + x₃ = 2 y x₁ + x₃ = 3.'],
    ['6. Lee la solución', 'Este sistema tiene una solución única: x₁ = 2, x₂ = 1 y x₃ = 1. Otros sistemas pueden tener infinitas soluciones con parámetros o no tener solución.']
  ];
  let tiempo = 0, anterior = null, reproduciendo = false, frame = null, pasoActual = -1;
  const duracion = 40000;
  const suave = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  function dibujar() {
    const t = Math.max(0, tiempo - 22000);
    const paso = tiempo < 6000 ? 0 : tiempo < 12000 ? 1 : tiempo < 22000 ? 2 : t < 10000 ? 3 : t < 13500 ? 4 : 5;
    if (paso !== pasoActual) {
      pasoActual = paso;
      $('titulo-paso').textContent = pasos[paso][0]; $('texto-paso').textContent = pasos[paso][1];
      $('contador-paso').textContent = `${paso + 1} / 6`;
    }
    let x = 390, y = 265;
    const indice = Math.min(11, Math.max(0, Math.floor((t - 500) / 750)));
    const destino = celdas[indice], origen = indice ? celdas[indice - 1] : {x: 370, y: 235};
    const fase = (t - 500 - indice * 750) / 750;
    const movimiento = suave(fase / .42);
    x = origen.x + 40 + (destino.x - origen.x) * movimiento;
    y = origen.y + 25 + (destino.y - origen.y) * movimiento;
    celdas.forEach((c, i) => { c.texto.textContent = t > 500 + i * 750 + 420 ? c.valor : '0'; });
    $('demo-foco').setAttribute('x', destino.x); $('demo-foco').setAttribute('y', destino.y);
    $('demo-foco').style.opacity = t < 9750 && fase > .4 ? '1' : '0';
    let clic = t < 9750 ? Math.max(0, 1 - Math.abs(fase - .5) * 8) : 0;
    if (t >= 10000) {
      const m = suave((t - 10000) / 1000);
      x = 343 + (483 - 343) * m; y = 214 + (165 - 214) * m;
      clic = Math.max(0, 1 - Math.abs(t - 11700) / 300);
    }
    $('demo-cursor').setAttribute('transform', `translate(${x} ${y})`);
    $('demo-clic').style.opacity = clic;
    $('demo-clic').setAttribute('r', 10 + (1 - clic) * 12);
    $('demo-resolver').setAttribute('transform', `translate(${483 * clic * .025} ${163 * clic * .025}) scale(${1 - clic * .025})`);
    const revelation = suave((t - 13500) / 650);
    $('demo-editor').style.opacity = 1 - revelation;
    $('demo-resolver').style.opacity = 1 - revelation;
    $('demo-cursor').style.opacity = 1 - revelation;
    $('demo-respuesta').style.opacity = revelation;
    $('demo-respuesta').setAttribute('transform', `translate(0 ${(1 - revelation) * 14})`);
    [...$('demo-soluciones').children].forEach((el, i) => { el.style.opacity = suave((t - 14000 - i * 350) / 500); });
    $('demo-leyenda').textContent = paso === 3 ? 'Escribe los valores · Tab para avanzar' : paso === 4 ? (t > 11800 ? 'Calculando con fracciones exactas…' : 'Todo listo. Resolvamos el sistema.') : 'Sustituye los valores para comprobar las ecuaciones';
    if (tiempo < 22000) {
      $('demo-editor').style.opacity = '0'; $('demo-resolver').style.opacity = '0'; $('demo-respuesta').style.opacity = '0';
    }
    ['demo-fracciones', 'demo-constantes', 'demo-dimensiones'].forEach((id, i) => { $(id).style.opacity = paso === i ? '1' : '0'; });
    if (paso === 0) {
      const escrito = Math.max(0, Math.min(3, Math.floor((tiempo - 900) / 550)));
      $('demo-fraccion-texto').textContent = '1/2'.slice(0, escrito);
      const aparece = suave((tiempo - 3000) / 750);
      $('demo-fraccion-bonita').style.opacity = aparece;
      $('demo-fraccion-bonita').setAttribute('transform', `translate(0 ${(1 - aparece) * 12})`);
      x = 145 + (365 - 145) * suave((tiempo - 2600) / 800); y = 175 + 44 * suave((tiempo - 2600) / 800);
      $('demo-cursor').style.opacity = '1';
      $('demo-clic').style.opacity = Math.max(0, 1 - Math.abs(tiempo - 800) / 250);
      $('demo-leyenda').textContent = 'Escribe 1/2 → sal de la celda → aparece la fracción';
    }
    if (paso === 1) {
      const local = tiempo - 6000;
      const texto = local < 3200 ? 'euler' : '2pi';
      $('demo-constante-texto').textContent = texto.slice(0, Math.max(0, Math.floor((local % 3200 - 300) / 300)));
      $('demo-constante-valor').style.opacity = suave((local - 1600) / 600);
      x = 180; y = 159; $('demo-cursor').style.opacity = '1'; $('demo-clic').style.opacity = '0';
      $('demo-leyenda').textContent = 'Constantes numéricas, sin variables simbólicas';
    }
    if (paso === 2) {
      const local = tiempo - 12000, fase = Math.min(3, Math.floor(local / 2500));
      const progreso = suave((local % 2500 - 750) / 650);
      const extraFila = fase === 0 ? progreso : fase === 1 ? 1 : fase === 2 ? 1 - progreso : 0;
      const extraColumna = fase === 0 ? 0 : fase < 3 ? (fase === 1 ? progreso : 1) : 1 - progreso;
      rejilla.forEach(({grupo, fila, col}) => {
        const columna = col === 4 ? 3 + extraColumna : col;
        grupo.setAttribute('transform', `translate(${55 + columna * 60} ${85 + fila * 37})`);
        grupo.style.opacity = (fila === 3 ? extraFila : 1) * (col === 3 ? extraColumna : 1);
      });
      botonesDimension.forEach((rect, i) => { rect.setAttribute('fill', i === fase ? '#e4ecff' : 'white'); rect.setAttribute('stroke', i === fase ? '#4773e8' : '#cbd0d8'); });
      const desde = fase === 0 ? 240 : 95 + (fase - 1) * 43;
      x = 490; y = desde + (95 + fase * 43 - desde) * suave((local % 2500) / 700);
      $('demo-clic').style.opacity = Math.max(0, 1 - Math.abs(local % 2500 - 750) / 250);
      $('demo-cursor').style.opacity = '1';
      $('demo-tamano').textContent = `${3 + Math.round(extraFila)} ecuaciones · ${3 + Math.round(extraColumna)} incógnitas · b al final`;
      $('demo-leyenda').textContent = ['Añade una fila: otra ecuación', 'Añade una columna: otra incógnita', 'Quita la última fila', 'Quita la última incógnita; b permanece'][fase];
    }
    $('demo-cursor').setAttribute('transform', `translate(${x} ${y})`);
    $('progreso-guia').style.width = `${tiempo / duracion * 100}%`;
  }
  function animar(ahora) {
    if (!reproduciendo) return;
    if (anterior !== null) tiempo = (tiempo + Math.min(ahora - anterior, 100)) % duracion;
    anterior = ahora; dibujar(); frame = requestAnimationFrame(animar);
  }
  function reproducir(valor) {
    reproduciendo = valor; anterior = null; cancelAnimationFrame(frame);
    $('animar-ayuda').textContent = valor ? 'Pausar animación' : 'Reproducir animación';
    if (valor) frame = requestAnimationFrame(animar);
  }
  $('como-usar').onclick = () => {
    tiempo = 0; pasoActual = -1; ayuda.showModal(); dibujar();
    reproducir(!matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  $('cerrar-ayuda').onclick = () => ayuda.close();
  $('animar-ayuda').onclick = () => reproducir(!reproduciendo);
  function ir(delta) { const paso = (pasoActual + delta + 6) % 6; tiempo = [3800, 8500, 13200, 22000, 32500, 37500][paso]; anterior = null; dibujar(); }
  $('siguiente-ayuda').onclick = () => ir(1);
  $('anterior-ayuda').onclick = () => ir(-1);
  ayuda.addEventListener('close', () => reproducir(false));
  document.addEventListener('visibilitychange', () => { anterior = null; });
})();
