(() => {
  const F = window.Fraccion;
  const fraccionVisual = window.FormatoMatematico.fraccion;

  const subtituloHeader = document.querySelector('.identidad-tlato p');
  const navMovil = document.querySelector('.unidad-actual-movil');
  const tarjetasUnidades = document.querySelectorAll('.tarjeta-unidad[data-unidad]');

  // Secciones de Unidad 1
  const bloquesU1 = [
    document.querySelector('.barra-herramientas'),
    document.getElementById('practica-proximamente'),
    document.getElementById('reabrir-guia-practica'),
    document.getElementById('editor-sistema'),
    document.getElementById('panel-cuadrada'),
    document.getElementById('panel-practica'),
    document.getElementById('seccion-resultado')
  ].filter(Boolean);

  const contenedorU2 = document.getElementById('contenedor-unidad-2');
  const panelU2 = document.getElementById('panel-unidad-2');
  const zonaVectores = document.getElementById('u2-zona-vectores');
  const errorEl = document.getElementById('u2-error');
  const resultadoEl = document.getElementById('u2-resultado');
  const veredictoEl = document.getElementById('u2-veredicto');
  const detalleEl = document.getElementById('u2-detalle');
  const matrizRrefEl = document.getElementById('u2-matriz-rref');

  let unidadActiva = '1';
  let actividad = 'generado'; // 'generado' | 'li-ld' | 'base' | 'completar'
  let numVectores = 3;
  let dimension = 3;

  let vectoresS = [
    ['0', '0', '0'],
    ['0', '0', '0'],
    ['0', '0', '0']
  ];
  let vectorGamma = ['0', '0', '0'];

  const textosActividad = {
    'generado': {
      titulo: '¿El vector γ pertenece al espacio generado ⟨S⟩?',
      desc: 'Captura el conjunto S = {α₁, …, αₙ} y el vector objetivo γ para comprobar si γ ∈ ⟨S⟩.',
      boton: 'Verificar si γ ∈ ⟨S⟩'
    },
    'li-ld': {
      titulo: '¿El conjunto S es linealmente independiente (LI) o dependiente (LD)?',
      desc: 'Analiza el conjunto S = {α₁, …, αₙ} mediante el sistema homogéneo [S | 0].',
      boton: 'Determinar LI o LD'
    },
    'base': {
      titulo: 'Extraer una base del espacio generado ⟨S⟩',
      desc: 'A partir de un conjunto S = {α₁, …, αₙ}, identifica los vectores pivote que forman una base.',
      boton: 'Obtener base de ⟨S⟩'
    },
    'completar': {
      titulo: 'Quitar / Añadir vectores para formar base de ℝⁿ',
      desc: 'Elimina vectores dependientes (LD → LI) y añade vectores canónicos independientes hasta completar una base de ℝⁿ.',
      boton: 'Completar base de ℝⁿ'
    }
  };

  function cambiarModoU2() {
    if (panelU2) panelU2.hidden = false;
    if (resultadoEl) resultadoEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
  }

  function cambiarUnidad(num) {
    if (num === unidadActiva) return;

    if (unidadActiva === '1') {
      bloquesU1.forEach(el => {
        el.dataset.u1Visible = el.hidden ? '0' : '1';
      });
    }

    unidadActiva = num;

    tarjetasUnidades.forEach(btn => {
      const esActual = btn.dataset.unidad === num;
      btn.classList.toggle('activa', esActual);
      if (esActual) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    const contenedorU3 = document.getElementById('contenedor-unidad-3');

    if (num === '1') {
      if (contenedorU2) contenedorU2.hidden = true;
      if (contenedorU3) contenedorU3.hidden = true;
      bloquesU1.forEach(el => {
        if (el.dataset.u1Visible === undefined) {
          el.hidden = !(el.classList.contains('barra-herramientas') || el.id === 'editor-sistema');
        } else {
          el.hidden = el.dataset.u1Visible === '0';
        }
      });
      if (subtituloHeader) subtituloHeader.textContent = 'Resolución de sistemas de ecuaciones lineales mediante Gauss-Jordan';
      if (navMovil) {
        navMovil.innerHTML = '<span class="indicador-activo" aria-hidden="true"></span> Unidad 1 <span class="detalle-unidad-movil">· Álgebra lineal</span>';
      }
    } else if (num === '2') {
      bloquesU1.forEach(el => { el.hidden = true; });
      if (contenedorU3) contenedorU3.hidden = true;
      if (contenedorU2) contenedorU2.hidden = false;
      if (subtituloHeader) subtituloHeader.textContent = 'Espacios vectoriales';
      if (navMovil) {
        navMovil.innerHTML = '<span class="indicador-activo" aria-hidden="true"></span> Unidad 2 <span class="detalle-unidad-movil">· Espacios vectoriales</span>';
      }
      cambiarModoU2();
      renderizarVectores();
    } else if (num === '3') {
      bloquesU1.forEach(el => { el.hidden = true; });
      if (contenedorU2) contenedorU2.hidden = true;
      if (contenedorU3) contenedorU3.hidden = false;
      if (subtituloHeader) subtituloHeader.textContent = 'Ortogonalidad';
      if (navMovil) {
        navMovil.innerHTML = '<span class="indicador-activo" aria-hidden="true"></span> Unidad 3 <span class="detalle-unidad-movil">· Ortogonalidad</span>';
      }
      if (typeof window.inicializarUnidad3 === 'function') {
        window.inicializarUnidad3();
      }
    }

    const nav = document.getElementById('navegacion-unidades');
    const menuBtn = document.getElementById('menu-unidades');
    if (nav && nav.classList.contains('abierta')) {
      nav.classList.remove('abierta');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  tarjetasUnidades.forEach(btn => {
    if (!btn.disabled) {
      btn.addEventListener('click', () => cambiarUnidad(btn.dataset.unidad));
    }
  });

  function crearTarjetaVector(nombre, datos, esGamma, idxVector) {
    const card = document.createElement('div');
    card.className = 'u2-vector-card' + (esGamma ? ' u2-gamma-card' : '');

    const etiqueta = document.createElement('span');
    etiqueta.className = 'u2-vector-nombre';
    etiqueta.textContent = nombre;
    card.append(etiqueta);

    const corchetes = document.createElement('div');
    corchetes.className = 'u2-vector-corchetes';

    datos.forEach((val, compIdx) => {
      const celda = document.createElement('button');
      celda.type = 'button';
      celda.className = 'celda';
      celda.setAttribute('aria-label', `${nombre}, componente ${compIdx + 1}`);
      try {
        const num = F.desdeTexto(val);
        celda.append(window.FormatoMatematico.expresion(val));
      } catch {
        celda.textContent = val || '—';
        celda.classList.add('invalida');
      }
      celda.addEventListener('click', () => editarComponente(esGamma, idxVector, compIdx, celda));
      corchetes.append(celda);
    });

    card.append(corchetes);
    return card;
  }

  function editarComponente(esGamma, idxVector, compIdx, boton) {
    const arreglo = esGamma ? vectorGamma : vectoresS[idxVector];
    window.EditorVectores.editar(boton, zonaVectores, arreglo[compIdx], valor => {
      arreglo[compIdx] = valor; errorEl.hidden = true;
    }, renderizarVectores, mostrarError);
  }

  function renderizarVectores() {
    resultadoEl.hidden = true;
    zonaVectores.replaceChildren();

    const bloqueS = document.createElement('div');
    bloqueS.className = 'u2-bloque-conjunto';
    const tituloS = document.createElement('span');
    tituloS.className = 'u2-etiqueta-conjunto';
    tituloS.textContent = `Conjunto S = {α₁, …, α${numVectores}}`;
    bloqueS.append(tituloS);

    const filaS = document.createElement('div');
    filaS.className = 'u2-fila-vectores';
    for (let v = 0; v < numVectores; v++) {
      filaS.append(crearTarjetaVector(`α${v + 1}`, vectoresS[v], false, v));
    }
    bloqueS.append(filaS);
    zonaVectores.append(bloqueS);

    if (actividad === 'generado') {
      const sep = document.createElement('span');
      sep.className = 'u2-separador-gamma';
      sep.setAttribute('aria-hidden', 'true');
      zonaVectores.append(sep);

      const bloqueG = document.createElement('div');
      bloqueG.className = 'u2-bloque-conjunto';
      const tituloG = document.createElement('span');
      tituloG.className = 'u2-etiqueta-conjunto';
      tituloG.textContent = 'Vector objetivo';
      bloqueG.append(tituloG);
      bloqueG.append(crearTarjetaVector('γ', vectorGamma, true, -1));
      zonaVectores.append(bloqueG);
    }

    document.getElementById('u2-dimensiones').textContent =
      `${numVectores} ${numVectores === 1 ? 'vector' : 'vectores'} · ℝ${dimension}`;
    document.getElementById('u2-agregar-vector').disabled = numVectores >= window.col_max - 1;
    document.getElementById('u2-quitar-vector').disabled = numVectores <= 1;
    document.getElementById('u2-agregar-comp').disabled = dimension >= Math.min(window.fila_max, window.col_max - 1);
    document.getElementById('u2-quitar-comp').disabled = dimension <= 1;
  }

  function cambiarActividad(nueva) {
    actividad = nueva;
    document.getElementById('u2-tab-generado').setAttribute('aria-pressed', String(nueva === 'generado'));
    document.getElementById('u2-tab-li-ld').setAttribute('aria-pressed', String(nueva === 'li-ld'));
    document.getElementById('u2-tab-base').setAttribute('aria-pressed', String(nueva === 'base'));
    document.getElementById('u2-tab-completar').setAttribute('aria-pressed', String(nueva === 'completar'));

    const info = textosActividad[nueva];
    document.getElementById('u2-titulo-actividad').textContent = info.titulo;
    document.getElementById('u2-desc-actividad').textContent = info.desc;
    document.getElementById('u2-calcular').innerHTML =
      `<span class="material-symbols-outlined" aria-hidden="true">calculate</span> ${info.boton}`;
    errorEl.hidden = true;
    renderizarVectores();
  }

  document.getElementById('u2-tab-generado').onclick = () => cambiarActividad('generado');
  document.getElementById('u2-tab-li-ld').onclick = () => cambiarActividad('li-ld');
  document.getElementById('u2-tab-base').onclick = () => cambiarActividad('base');
  document.getElementById('u2-tab-completar').onclick = () => cambiarActividad('completar');

  document.getElementById('u2-agregar-vector').onclick = () => {
    if (numVectores >= window.col_max - 1) return;
    vectoresS.push(Array(dimension).fill('0'));
    numVectores++;
    renderizarVectores();
  };

  document.getElementById('u2-quitar-vector').onclick = () => {
    if (numVectores <= 1) return;
    vectoresS.pop();
    numVectores--;
    renderizarVectores();
  };

  document.getElementById('u2-agregar-comp').onclick = () => {
    if (dimension >= Math.min(window.fila_max, window.col_max - 1)) return;
    vectoresS.forEach(v => v.push('0'));
    vectorGamma.push('0');
    dimension++;
    renderizarVectores();
  };

  document.getElementById('u2-quitar-comp').onclick = () => {
    if (dimension <= 1) return;
    vectoresS.forEach(v => v.pop());
    vectorGamma.pop();
    dimension--;
    renderizarVectores();
  };

  document.getElementById('u2-limpiar').onclick = () => {
    numVectores = 3;
    dimension = 3;
    vectoresS = Array.from({ length: numVectores }, () => Array(dimension).fill('0'));
    vectorGamma = Array(dimension).fill('0');
    errorEl.hidden = true;
    renderizarVectores();
  };

  function mostrarError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function agregarVector(nodo, vector) {
    nodo.append(' = (');
    vector.forEach((v, i) => { if (i) nodo.append(', '); nodo.append(fraccionVisual(v)); });
    nodo.append(')');
  }

  function renderizarRref(matriz, colsIncognitas) {
    const tabla = document.createElement('div');
    tabla.className = 'tabla-resultado';
    tabla.style.gridTemplateColumns = `repeat(${colsIncognitas}, minmax(56px, max-content)) 2px minmax(56px, max-content)`;
    matriz.forEach((fila, i) => {
      const filaEl = document.createElement('div');
      filaEl.className = 'fila-resultado';
      fila.forEach((val, j) => {
        const celda = document.createElement('span');
        celda.className = 'valor-matriz';
        celda.style.gridRow = i + 1;
        celda.style.gridColumn = j < colsIncognitas ? j + 1 : j + 2;
        if (j === colsIncognitas) celda.classList.add('aumentada');
        celda.append(fraccionVisual(val));
        filaEl.append(celda);
      });
      tabla.append(filaEl);
    });
    const sep = document.createElement('span');
    sep.className = 'separador-aumentada';
    sep.setAttribute('aria-hidden', 'true');
    sep.style.gridColumn = colsIncognitas + 1;
    sep.style.gridRow = `1 / span ${matriz.length}`;
    tabla.append(sep);
    matrizRrefEl.replaceChildren(tabla);
  }

  document.getElementById('u2-calcular').onclick = () => {
    errorEl.hidden = true;
    try {
      const datos = actividad === 'completar'
        ? window.Unidad2.completar(vectoresS)
        : window.Unidad2.analizar(vectoresS, vectorGamma, actividad);
      const res = datos.resultado;
      renderizarRref(res.matriz, numVectores);
      detalleEl.replaceChildren();

      if (actividad === 'generado') {
        if (res.tipo === 'incompatible') {
          veredictoEl.textContent = '✗ γ NO pertenece al espacio generado ⟨S⟩';
          const p = document.createElement('p');
          p.textContent = 'Al reducir [S | γ] aparece una fila contradictoria (0 = b con b ≠ 0), por lo que no existen escalares que generen a γ.';
          detalleEl.append(p);
        } else {
          veredictoEl.textContent = '✓ γ SÍ pertenece al espacio generado ⟨S⟩';
          const p = document.createElement('p');
          p.textContent = res.tipo === 'unica'
            ? 'Existen escalares únicos c₁, …, cₙ tales que γ = c₁α₁ + … + cₙαₙ:'
            : 'Existen infinitos escalares (asignando 0 a las variables libres, una solución particular es):';
          detalleEl.append(p);

          const lista = document.createElement('div');
          lista.className = 'u2-escalares';
          for (let j = 0; j < numVectores; j++) {
            const filaPiv = res.columnasPivote.indexOf(j);
            const valorEscalar = filaPiv !== -1 ? res.matriz[filaPiv][numVectores] : F.desdeTexto('0');
            const chip = document.createElement('span');
            chip.className = 'u2-chip';
            chip.append(`c${j + 1} = `, fraccionVisual(valorEscalar));
            lista.append(chip);
          }
          detalleEl.append(lista);
        }
      } else if (actividad === 'li-ld') {
        if (res.tipo === 'unica') {
          veredictoEl.textContent = '✓ Conjunto Linealmente Independiente (LI)';
          const p = document.createElement('p');
          p.textContent = `Los ${numVectores} vectores tienen pivote en cada columna (solo admite la solución trivial c₁ = … = c${numVectores} = 0). Ningún vector es redundante.`;
          detalleEl.append(p);
        } else {
          veredictoEl.textContent = '⚠ Conjunto Linealmente Dependiente (LD)';
          const libres = [];
          for (let j = 0; j < numVectores; j++) {
            if (!res.columnasPivote.includes(j)) libres.push(`α${j + 1}`);
          }
          const p = document.createElement('p');
          p.textContent = `Existen variables libres (${libres.join(', ')}), por lo que hay soluciones no triviales y al menos un vector depende de los demás.`;
          detalleEl.append(p);
        }
      } else if (actividad === 'base') {
        const indicesPivote = res.columnasPivote.filter(col => col < numVectores);
        const dimSubespacio = indicesPivote.length;

        if (dimSubespacio === 0) {
          veredictoEl.textContent = 'Espacio generado trivial {0} · dim(⟨S⟩) = 0';
          const p = document.createElement('p');
          p.textContent = 'Todos los vectores capturados son el vector cero; la base es el conjunto vacío ∅.';
          detalleEl.append(p);
        } else {
          veredictoEl.textContent = `Base extraída: B = {${indicesPivote.map(i => `α${i + 1}`).join(', ')}} · dim(⟨S⟩) = ${dimSubespacio}`;
          const p = document.createElement('p');
          p.textContent = 'Los vectores con columna pivote conservan el mismo espacio generado sin redundancias:';
          detalleEl.append(p);

          const lista = document.createElement('div');
          lista.className = 'u2-base-lista';
          for (let j = 0; j < numVectores; j++) {
            const enBase = indicesPivote.includes(j);
            const chip = document.createElement('span');
            chip.className = 'u2-chip' + (enBase ? '' : ' descartado');
            chip.textContent = enBase
              ? `✓ α${j + 1}`
              : `✗ α${j + 1} (redundante)`;
            if (enBase) agregarVector(chip, datos.originales[j]);
            lista.append(chip);
          }
          detalleEl.append(lista);
        }
      } else if (actividad === 'completar') {
        const indicesPivote = datos.indicesBase;
        const agregados = datos.agregados.map(a => ({nombre: `e${a.indice + 1}`, comps: a.vector.map(v => v.aTexto())}));

        const nombresFinales = [
          ...indicesPivote.map(i => `α${i + 1}`),
          ...agregados.map(a => a.nombre)
        ];

        veredictoEl.textContent = `✓ Base de ℝ${dimension}: B = {${nombresFinales.join(', ')}}`;

        const p = document.createElement('p');
        const quitadosCount = numVectores - indicesPivote.length;
        p.textContent = `Proceso: ${quitadosCount > 0 ? `se quitaron ${quitadosCount} vector(es) LD para obtener un conjunto LI` : 'el conjunto inicial ya era LI'}, y ${agregados.length > 0 ? `se añadieron ${agregados.length} vector(es) canónico(s) para alcanzar dim = ${dimension}` : `ya cubría toda la dimensión ℝ${dimension}`}:`;
        detalleEl.append(p);

        const lista = document.createElement('div');
        lista.className = 'u2-base-lista';

        for (let j = 0; j < numVectores; j++) {
          const conservado = indicesPivote.includes(j);
          const chip = document.createElement('span');
          chip.className = 'u2-chip' + (conservado ? '' : ' descartado');
          chip.textContent = conservado
            ? `✓ Conservado α${j + 1}`
            : `✗ Quitado α${j + 1} (LD)`;
          if (conservado) agregarVector(chip, datos.originales[j]);
          lista.append(chip);
        }

        agregados.forEach(ag => {
          const chip = document.createElement('span');
          chip.className = 'u2-chip agregado';
          chip.textContent = `+ Añadido ${ag.nombre}`;
          agregarVector(chip, ag.comps.map(F.desdeTexto));
          lista.append(chip);
        });

        detalleEl.append(lista);
      }

      resultadoEl.hidden = false;
    } catch (err) {
      mostrarError(err.message);
      resultadoEl.hidden = true;
    }
  };
})();