(() => {
  const F = window.Fraccion;
  const fraccionVisual = window.FormatoMatematico.fraccion;

  const panelU3 = document.getElementById('panel-unidad-3');
  const zonaVectores = document.getElementById('u3-zona-vectores');
  const errorEl = document.getElementById('u3-error');
  const resultadoEl = document.getElementById('u3-resultado');
  const veredictoEl = document.getElementById('u3-veredicto');
  const baseVectoresEl = document.getElementById('u3-base-vectores');
  const pasosEl = document.getElementById('u3-pasos');
  const verificacionEl = document.getElementById('u3-verificacion');

  let numVectores = 3;
  let dimension = 3;

  let vectoresS = [
    ['1', '1', '0'],
    ['1', '0', '1'],
    ['0', '1', '1']
  ];

  // Aritmética exacta sobre fracciones de Tlato
  const fCero = () => F.desdeTexto('0');
  const esCero = (x) => x.n === 0n;
  const sumarF = (a, b) => F.crear(a.n * b.d + b.n * a.d, a.d * b.d);
  const restarF = (a, b) => F.crear(a.n * b.d - b.n * a.d, a.d * b.d);
  const multF = (a, b) => F.crear(a.n * b.n, a.d * b.d);
  const divF = (a, b) => F.crear(a.n * b.d, a.d * b.n);

  function productoPunto(u, v) {
    let acc = fCero();
    for (let i = 0; i < u.length; i++) {
      acc = sumarF(acc, multF(u[i], v[i]));
    }
    return acc;
  }

  function escalarPorVector(k, v) {
    return v.map(comp => multF(k, comp));
  }

  function restarVectores(u, v) {
    return u.map((comp, i) => restarF(comp, v[i]));
  }

  function esVectorNulo(v) {
    return v.every(esCero);
  }

  function cambiarModoU3() {
    if (panelU3) panelU3.hidden = false;
    if (resultadoEl) resultadoEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
  }

  window.inicializarUnidad3 = () => {
    cambiarModoU3();
    renderizarVectores();
  };

  function crearTarjetaVector(nombre, datos, idxVector, esResultado = false) {
    const card = document.createElement('div');
    card.className = 'u2-vector-card' + (esResultado ? ' u3-vector-ortogonal' : '');

    const etiqueta = document.createElement('span');
    etiqueta.className = 'u2-vector-nombre';
    etiqueta.textContent = nombre;
    card.append(etiqueta);

    const corchetes = document.createElement('div');
    corchetes.className = 'u2-vector-corchetes';

    datos.forEach((val, compIdx) => {
      if (esResultado) {
        const celda = document.createElement('span');
        celda.className = 'valor-matriz';
        celda.append(fraccionVisual(val));
        corchetes.append(celda);
      } else {
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
        celda.addEventListener('click', () => editarComponente(idxVector, compIdx, celda));
        corchetes.append(celda);
      }
    });

    card.append(corchetes);
    return card;
  }

  function editarComponente(idxVector, compIdx, boton) {
    const arreglo = vectoresS[idxVector];
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
        mostrarError(`α${idxVector + 1}, fila ${compIdx + 1}: ${err.message}`);
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
    tituloS.textContent = `Conjunto de entrada S = {α₁, …, α${numVectores}}`;
    bloqueS.append(tituloS);

    const filaS = document.createElement('div');
    filaS.className = 'u2-fila-vectores';
    for (let v = 0; v < numVectores; v++) {
      filaS.append(crearTarjetaVector(`α${v + 1}`, vectoresS[v], v, false));
    }
    bloqueS.append(filaS);
    zonaVectores.append(bloqueS);

    document.getElementById('u3-dimensiones').textContent =
      `${numVectores} ${numVectores === 1 ? 'vector' : 'vectores'} · ℝ${dimension}`;
    document.getElementById('u3-agregar-vector').disabled = numVectores >= 12;
    document.getElementById('u3-quitar-vector').disabled = numVectores <= 1;
    document.getElementById('u3-agregar-comp').disabled = dimension >= 12;
    document.getElementById('u3-quitar-comp').disabled = dimension <= 1;
  }

  document.getElementById('u3-agregar-vector').onclick = () => {
    if (numVectores >= 12) return;
    vectoresS.push(Array(dimension).fill('0'));
    numVectores++;
    renderizarVectores();
  };

  document.getElementById('u3-quitar-vector').onclick = () => {
    if (numVectores <= 1) return;
    vectoresS.pop();
    numVectores--;
    renderizarVectores();
  };

  document.getElementById('u3-agregar-comp').onclick = () => {
    if (dimension >= 12) return;
    vectoresS.forEach(v => v.push('0'));
    dimension++;
    renderizarVectores();
  };

  document.getElementById('u3-quitar-comp').onclick = () => {
    if (dimension <= 1) return;
    vectoresS.forEach(v => v.pop());
    dimension--;
    renderizarVectores();
  };

  document.getElementById('u3-limpiar').onclick = () => {
    numVectores = 3;
    dimension = 3;
    vectoresS = Array.from({ length: numVectores }, () => Array(dimension).fill('0'));
    errorEl.hidden = true;
    renderizarVectores();
  };

  function mostrarError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function renderizarVectorInline(vec) {
    const span = document.createElement('span');
    span.append('(');
    vec.forEach((comp, idx) => {
      span.append(fraccionVisual(comp));
      if (idx < vec.length - 1) span.append(', ');
    });
    span.append(')');
    return span;
  }

  document.getElementById('u3-calcular').onclick = () => {
    errorEl.hidden = true;
    try {
      const entrada = vectoresS.map((vec, vIdx) =>
        vec.map((txt, fIdx) => {
          try { return F.desdeTexto(txt); }
          catch (e) { throw new Error(`Vector α${vIdx + 1}, fila ${fIdx + 1}: ${e.message}`); }
        })
      );

      const baseOrtogonal = [];
      const historialPasos = [];

      entrada.forEach((alpha, idx) => {
        let u = [...alpha];
        const proyeccionesTexto = [];

        baseOrtogonal.forEach((uPrev, j) => {
          const num = productoPunto(alpha, uPrev);
          const den = productoPunto(uPrev, uPrev);
          const coef = divF(num, den);
          const proy = escalarPorVector(coef, uPrev);
          u = restarVectores(u, proy);
          proyeccionesTexto.push(`proy_{u${j + 1}}(α${idx + 1})`);
        });

        if (esVectorNulo(u)) {
          historialPasos.push({
            descartado: true,
            titulo: `Vector α${idx + 1} descartado (linealmente dependiente)`,
            detalle: idx === 0
              ? 'α₁ es el vector nulo (0), por lo que no puede formar parte de una base.'
              : `Al restar las proyecciones (${proyeccionesTexto.join(' + ')}) resulta el vector cero; α${idx + 1} depende de los anteriores.`,
            vector: u
          });
        } else {
          const k = baseOrtogonal.length + 1;
          baseOrtogonal.push(u);
          historialPasos.push({
            descartado: false,
            titulo: `Vector ortogonal u${k} (a partir de α${idx + 1})`,
            detalle: k === 1
              ? 'Primer vector no nulo: se conserva intacto como u₁ = α₁.'
              : `u${k} = α${idx + 1} − (${proyeccionesTexto.join(' + ')})`,
            vector: u
          });
        }
      });

      if (baseOrtogonal.length === 0) {
        throw new Error('Todos los vectores capturados son el vector cero; no existe base ortogonal no trivial.');
      }

      veredictoEl.textContent = `✓ Base ortogonal B = {${baseOrtogonal.map((_, i) => `u${i + 1}`).join(', ')}} · ${baseOrtogonal.length} ${baseOrtogonal.length === 1 ? 'vector' : 'vectores'} a 90°`;

      baseVectoresEl.replaceChildren();
      const filaRes = document.createElement('div');
      filaRes.className = 'u2-fila-vectores';
      baseOrtogonal.forEach((uVec, idx) => {
        filaRes.append(crearTarjetaVector(`u${idx + 1}`, uVec, idx, true));
      });
      baseVectoresEl.append(filaRes);

      pasosEl.replaceChildren();
      historialPasos.forEach(paso => {
        const card = document.createElement('div');
        card.className = 'u3-paso-card' + (paso.descartado ? ' descartado' : '');

        const t = document.createElement('div');
        t.className = 'u3-paso-titulo';
        t.textContent = paso.titulo;

        const f = document.createElement('div');
        f.className = 'u3-paso-formula';
        f.textContent = paso.detalle;

        const vLine = document.createElement('div');
        vLine.className = 'u3-paso-vector';
        vLine.append('Resultado: ', renderizarVectorInline(paso.vector));

        card.append(t, f, vLine);
        pasosEl.append(card);
      });

      verificacionEl.replaceChildren();
      if (baseOrtogonal.length === 1) {
        const chip = document.createElement('span');
        chip.className = 'u2-chip';
        chip.textContent = '✓ Base de 1 solo vector no nulo (ortogonal por definición)';
        verificacionEl.append(chip);
      } else {
        for (let i = 0; i < baseOrtogonal.length; i++) {
          for (let j = i + 1; j < baseOrtogonal.length; j++) {
            const dot = productoPunto(baseOrtogonal[i], baseOrtogonal[j]);
            const chip = document.createElement('span');
            chip.className = 'u2-chip';
            chip.append(`✓ ⟨u${i + 1}, u${j + 1}⟩ = `, fraccionVisual(dot), ' (90°)');
            verificacionEl.append(chip);
          }
        }
      }

      resultadoEl.hidden = false;
    } catch (err) {
      mostrarError(err.message);
      resultadoEl.hidden = true;
    }
  };
})();