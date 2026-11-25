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
  const avisoPracticaU2 = document.getElementById('u2-practica-proximamente');
  const zonaVectores = document.getElementById('u2-zona-vectores');
  const errorEl = document.getElementById('u2-error');
  const resultadoEl = document.getElementById('u2-resultado');
  const veredictoEl = document.getElementById('u2-veredicto');
  const detalleEl = document.getElementById('u2-detalle');
  const matrizRrefEl = document.getElementById('u2-matriz-rref');

  let unidadActiva = '1';
  let modoPracticaU2 = false;
  let actividad = 'generado'; // 'generado' | 'li-ld' | 'base'
  let numVectores = 3;
  let dimension = 3;

  let vectoresS = [
    ['1', '0', '2'],
    ['0', '1', '1'],
    ['1', '1', '3']
  ];
  let vectorGamma = ['3', '2', '8'];

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
    }
  };

  function cambiarModoU2(practica) {
    modoPracticaU2 = practica;
    document.getElementById('u2-modo-calculadora').setAttribute('aria-pressed', String(!practica));
    document.getElementById('u2-modo-practica').setAttribute('aria-pressed', String(practica));
    panelU2.hidden = practica;
    avisoPracticaU2.hidden = !practica;
    resultadoEl.hidden = true;
    errorEl.hidden = true;
  }

  document.getElementById('u2-modo-calculadora').onclick = () => cambiarModoU2(false);
  document.getElementById('u2-modo-practica').onclick = () => cambiarModoU2(true);
  document.getElementById('u2-volver-calculadora').onclick = () => cambiarModoU2(false);

  function cambiarUnidad(num) {
    if (num === unidadActiva) return;
    unidadActiva = num;

    tarjetasUnidades.forEach(btn => {
      const esActual = btn.dataset.unidad === num;
      btn.classList.toggle('activa', esActual);
      if (esActual) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    if (num === '2') {
      bloquesU1.forEach(el => { el.dataset.prevHidden = el.hidden ? '1' : '0'; el.hidden = true; });
      contenedorU2.hidden = false;
      subtituloHeader.textContent = 'Espacios vectoriales';
      if (navMovil) {
        navMovil.innerHTML = '<span class="indicador-activo" aria-hidden="true"></span> Unidad 2 <span class="detalle-unidad-movil">· Espacios vectoriales</span>';
      }
      cambiarModoU2(modoPracticaU2);
      renderizarVectores();
    } else {
      contenedorU2.hidden = true;
      bloquesU1.forEach(el => {
        if (el.dataset.prevHidden === '0') el.hidden = false;
      });
      subtituloHeader.textContent = 'Resolución de sistemas de ecuaciones lineales mediante Gauss-Jordan';
      if (navMovil) {
        navMovil.innerHTML = '<span class="indicador-activo" aria-hidden="true"></span> Unidad 1 <span class="detalle-unidad-movil">· Álgebra lineal</span>';
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
        celda.append(fraccionVisual(num));
      } catch {
        celda.textContent = val || '0';
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
    const entrada = document.createElement('input');
    entrada.className = 'celda';
    entrada.maxLength = 128;
    entrada.value = arreglo[compIdx];
    entrada.defaultValue = arreglo[compIdx];
    entrada.autocomplete = 'off';

    boton.replaceWith(entrada);
    entrada.focus();
    entrada.select();

    let guardado = false;
    const guardar = () => {
      if (guardado) return;
      guardado = true;
      arreglo[compIdx] = entrada.value.trim() === '' ? '0' : entrada.value.trim();
      errorEl.hidden = true;
      try {
        F.desdeTexto(arreglo[compIdx]);
      } catch (err) {
        mostrarError(`${esGamma ? 'γ' : `α${idxVector + 1}`}, fila ${compIdx + 1}: ${err.message}`);
      }
      renderizarVectores();
    };

    entrada.addEventListener('blur', guardar);
    entrada.addEventListener('keydown', e => {
      if (e.key === 'Escape') { entrada.value = entrada.defaultValue; entrada.blur(); }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        guardar();
      }
    });
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
    document.getElementById('u2-agregar-vector').disabled = numVectores >= 12;
    document.getElementById('u2-quitar-vector').disabled = numVectores <= 1;
    document.getElementById('u2-agregar-comp').disabled = dimension >= 12;
    document.getElementById('u2-quitar-comp').disabled = dimension <= 1;
  }

  function cambiarActividad(nueva) {
    actividad = nueva;
    document.getElementById('u2-tab-generado').setAttribute('aria-pressed', String(nueva === 'generado'));
    document.getElementById('u2-tab-li-ld').setAttribute('aria-pressed', String(nueva === 'li-ld'));
    document.getElementById('u2-tab-base').setAttribute('aria-pressed', String(nueva === 'base'));

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

  document.getElementById('u2-agregar-vector').onclick = () => {
    if (numVectores >= 12) return;
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
    if (dimension >= 12) return;
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
      const colsS = vectoresS.map((vec, vIdx) =>
        vec.map((txt, fIdx) => {
          try { return F.desdeTexto(txt); }
          catch (e) { throw new Error(`Vector α${vIdx + 1}, fila ${fIdx + 1}: ${e.message}`); }
        })
      );

      const colB = (actividad === 'generado' ? vectorGamma : Array(dimension).fill('0')).map((txt, fIdx) => {
        try { return F.desdeTexto(txt); }
        catch (e) { throw new Error(`Vector γ, fila ${fIdx + 1}: ${e.message}`); }
      });

      const matrizAumentada = Array.from({ length: dimension }, (_, i) => [
        ...colsS.map(col => col[i]),
        colB[i]
      ]);

      const res = GaussJordan.reducir(matrizAumentada, numVectores);
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
            const filaPiv = res.pivotes.indexOf(j);
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
            if (!res.pivotes.includes(j)) libres.push(`α${j + 1}`);
          }
          const p = document.createElement('p');
          p.textContent = `Existen variables libres (${libres.join(', ')}), por lo que hay soluciones no triviales y al menos un vector depende de los demás.`;
          detalleEl.append(p);
        }
      } else if (actividad === 'base') {
        const indicesPivote = res.pivotes.filter(col => col < numVectores);
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
              ? `✓ α${j + 1} = (${vectoresS[j].join(', ')})`
              : `✗ α${j + 1} (redundante)`;
            lista.append(chip);
          }
          detalleEl.append(lista);
        }
      }

      resultadoEl.hidden = false;
    } catch (err) {
      mostrarError(err.message);
      resultadoEl.hidden = true;
    }
  };
})();