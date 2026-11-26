(() => {
  const F = window.Fraccion;
  const fraccionVisual = window.FormatoMatematico.fraccion;

  const panelU3 = document.getElementById('panel-unidad-3');
  const zonaVectores = document.getElementById('u3-zona-vectores');
  const errorEl = document.getElementById('u3-error');
  const resultadoEl = document.getElementById('u3-resultado');
  const veredictoEl = document.getElementById('u3-veredicto');
  const baseVectoresEl = document.getElementById('u3-base-vectores');
  const pipelineEl = document.getElementById('u3-pipeline');
  const propiedadesBoxEl = document.getElementById('u3-propiedades-box');
  const propiedadesEl = document.getElementById('u3-propiedades');
  const verificacionEl = document.getElementById('u3-verificacion');

  let actividad = 'ortogonal'; // 'ortogonal' | 'ortonormal'
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

  // Obtiene de forma segura las columnas pivote (sin depender de propiedades opcionales)
  function obtenerIndicesPivote(columnas) {
    if (columnas.length === 0) return [];
    const filas = columnas[0].length;
    const cols = columnas.length;
    const matAumentada = Array.from({ length: filas }, (_, i) => [
      ...columnas.map(c => c[i]),
      fCero()
    ]);
    const res = GaussJordan.reducir(matAumentada, cols);
    if (Array.isArray(res?.pivotes)) {
      return res.pivotes.filter(c => c >= 0 && c < cols);
    }
    const pivotes = [];
    if (Array.isArray(res?.matriz)) {
      for (let i = 0; i < res.matriz.length; i++) {
        for (let j = 0; j < cols; j++) {
          if (!esCero(res.matriz[i][j])) {
            pivotes.push(j);
            break;
          }
        }
      }
    }
    return pivotes;
  }

  // Simplificación exacta de raíz cuadrada entera (BigInt)
  function raizExactaBigInt(m) {
    if (m === 0n) return { fuera: 0n, dentro: 1n };
    if (m === 1n) return { fuera: 1n, dentro: 1n };
    let fuera = 1n;
    let dentro = m;
    for (let d = 2n; d * d <= dentro; d++) {
      while (dentro % (d * d) === 0n) {
        fuera *= d;
        dentro /= (d * d);
      }
    }
    return { fuera, dentro };
  }

  // Representación simbólica exacta de comp / sqrt(normaSq)
  function normalizarComponenteVisual(comp, normaSq) {
    if (esCero(comp)) return fraccionVisual(fCero());

    const p = normaSq.n;
    const q = normaSq.d;
    const { fuera, dentro } = raizExactaBigInt(p * q);

    const coef = F.crear(comp.n * fuera, comp.d * p);

    if (dentro === 1n) {
      return fraccionVisual(coef);
    }

    const wrap = document.createElement('span');
    wrap.style.display = 'inline-flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '2px';

    if (coef.n < 0n) {
      wrap.append('−');
    }

    const absNum = coef.n < 0n ? -coef.n : coef.n;
    const absDen = coef.d;

    const rad = document.createElement('span');
    rad.className = 'u3-radical';
    const sym = document.createElement('span');
    sym.className = 'u3-radical-simbolo';
    sym.textContent = '√';
    const cont = document.createElement('span');
    cont.className = 'u3-radical-contenido';
    cont.textContent = dentro.toString();
    rad.append(sym, cont);

    if (absDen === 1n) {
      if (absNum !== 1n) wrap.append(absNum.toString());
      wrap.append(rad);
      return wrap;
    }

    const frac = document.createElement('span');
    frac.className = 'fraccion';
    const numSpan = document.createElement('span');
    numSpan.className = 'numerador';
    if (absNum !== 1n) numSpan.append(absNum.toString());
    numSpan.append(rad);

    const denSpan = document.createElement('span');
    denSpan.className = 'denominador';
    denSpan.textContent = absDen.toString();

    frac.append(numSpan, denSpan);
    wrap.append(frac);
    return wrap;
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

  function cambiarActividadU3(nueva) {
    actividad = nueva;
    document.getElementById('u3-tab-gs').setAttribute('aria-pressed', String(nueva === 'ortogonal'));
    document.getElementById('u3-tab-ortonormal').setAttribute('aria-pressed', String(nueva === 'ortonormal'));

    const titulo = document.getElementById('u3-titulo-actividad');
    const desc = document.getElementById('u3-desc-actividad');
    const btn = document.getElementById('u3-calcular');

    if (nueva === 'ortogonal') {
      titulo.textContent = 'Base ortogonal';
      desc.textContent = 'Captura S = {α₁, α₂, …, αₙ} para obtener una base ortogonal B = {u₁, u₂, …, uₙ} mediante Gram-Schmidt.';
      btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">calculate</span> Obtener base ortogonal';
    } else {
      titulo.textContent = 'Bases ortonormales';
      desc.textContent = 'Quita vectores LD → Añade vectores hasta formar base → Aplica Gram-Schmidt → Normaliza cada vector para cumplir que es base, conjunto ortogonal y unitario.';
      btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">calculate</span> Obtener base ortonormal';
    }

    resultadoEl.hidden = true;
    errorEl.hidden = true;
  }

  document.getElementById('u3-tab-gs').onclick = () => cambiarActividadU3('ortogonal');
  document.getElementById('u3-tab-ortonormal').onclick = () => cambiarActividadU3('ortonormal');

  function crearTarjetaVector(nombre, datos, idxVector, esResultado = false, normaSq = null) {
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
        if (normaSq) {
          celda.append(normalizarComponenteVisual(val, normaSq));
        } else {
          celda.append(fraccionVisual(val));
        }
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

  function ejecutarGramSchmidt(vectores) {
    const baseOrtogonal = [];
    vectores.forEach(alpha => {
      let u = [...alpha];
      baseOrtogonal.forEach(uPrev => {
        const num = productoPunto(alpha, uPrev);
        const den = productoPunto(uPrev, uPrev);
        const coef = divF(num, den);
        u = restarVectores(u, escalarPorVector(coef, uPrev));
      });
      if (!esVectorNulo(u)) {
        baseOrtogonal.push(u);
      }
    });
    return baseOrtogonal;
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

      if (actividad === 'ortogonal') {
        const baseOrtogonal = ejecutarGramSchmidt(entrada);
        if (baseOrtogonal.length === 0) {
          throw new Error('Todos los vectores capturados son el vector cero; no existe base ortogonal no trivial.');
        }

        pipelineEl.hidden = true;
        propiedadesBoxEl.hidden = true;

        veredictoEl.textContent = `✓ Base ortogonal B = {${baseOrtogonal.map((_, i) => `u${i + 1}`).join(', ')}} · ${baseOrtogonal.length} ${baseOrtogonal.length === 1 ? 'vector' : 'vectores'} a 90°`;

        baseVectoresEl.replaceChildren();
        const filaRes = document.createElement('div');
        filaRes.className = 'u2-fila-vectores';
        baseOrtogonal.forEach((uVec, idx) => {
          filaRes.append(crearTarjetaVector(`u${idx + 1}`, uVec, idx, true, null));
        });
        baseVectoresEl.append(filaRes);

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
      } else {
        // Proceso completo: Quitar LD -> LI -> Añadir -> Base Rn -> Gram-Schmidt -> Normalizar
        if (entrada.every(esVectorNulo)) {
          throw new Error('Todos los vectores capturados son el vector cero; captura al menos un vector no nulo para construir la base ortonormal.');
        }

        const indicesPivote = obtenerIndicesPivote(entrada);
        const vectoresBase = indicesPivote.map(i => entrada[i]);
        const nombresLI = indicesPivote.map(i => `α${i + 1}`);
        const nombresBase = [...nombresLI];

        for (let k = 0; k < dimension && vectoresBase.length < dimension; k++) {
          const canonico = Array.from({ length: dimension }, (_, i) => F.desdeTexto(i === k ? '1' : '0'));
          const prueba = [...vectoresBase, canonico];
          const pivPrueba = obtenerIndicesPivote(prueba);
          if (pivPrueba.length === prueba.length) {
            vectoresBase.push(canonico);
            nombresBase.push(`e${k + 1}`);
          }
        }

        const baseOrtogonal = ejecutarGramSchmidt(vectoresBase);
        const normasSq = baseOrtogonal.map(u => productoPunto(u, u));

        // Actualizar etapas visuales
        pipelineEl.hidden = false;
        document.getElementById('u3-etapa-li').textContent =
          nombresLI.length > 0 ? `{${nombresLI.join(', ')}}` : '∅';
        document.getElementById('u3-etapa-base').textContent =
          `{${nombresBase.join(', ')}}`;
        document.getElementById('u3-etapa-ortog').textContent =
          `{${baseOrtogonal.map((_, i) => `u${i + 1}`).join(', ')}}`;
        document.getElementById('u3-etapa-orton').textContent =
          `{${baseOrtogonal.map((_, i) => `v${i + 1}`).join(', ')}}`;

        veredictoEl.textContent = `✓ Base ortonormal de ℝ${dimension}: B = {${baseOrtogonal.map((_, i) => `v${i + 1}`).join(', ')}}`;

        baseVectoresEl.replaceChildren();
        const filaRes = document.createElement('div');
        filaRes.className = 'u2-fila-vectores';
        baseOrtogonal.forEach((uVec, idx) => {
          filaRes.append(crearTarjetaVector(`v${idx + 1}`, uVec, idx, true, normasSq[idx]));
        });
        baseVectoresEl.append(filaRes);

        // 3 Propiedades
        propiedadesBoxEl.hidden = false;
        propiedadesEl.replaceChildren();

        const props = [
          {
            titulo: '1. Es Base',
            desc: `${dimension} vectores linealmente independientes que generan todo ℝ${dimension} (dim = ${dimension}).`
          },
          {
            titulo: '2. Conjunto ortogonal',
            desc: `Todos sus pares cumplen ⟨vᵢ, vⱼ⟩ = 0 (perpendiculares a 90° entre sí).`
          },
          {
            titulo: '3. Vectores unitarios',
            desc: `Cada vector está dividido entre su norma: ‖vᵢ‖ = 1 para todo i = 1, …, ${dimension}.`
          }
        ];

        props.forEach(pr => {
          const card = document.createElement('div');
          card.className = 'u3-prop-card';
          const t = document.createElement('div');
          t.className = 'u3-prop-titulo';
          t.textContent = `✓ ${pr.titulo}`;
          const d = document.createElement('div');
          d.className = 'u3-prop-desc';
          d.textContent = pr.desc;
          card.append(t, d);
          propiedadesEl.append(card);
        });

        verificacionEl.replaceChildren();
        if (baseOrtogonal.length === 1) {
          const chip = document.createElement('span');
          chip.className = 'u2-chip';
          chip.textContent = '✓ Base unitaria de dimensión 1 (‖v₁‖ = 1)';
          verificacionEl.append(chip);
        } else {
          for (let i = 0; i < baseOrtogonal.length; i++) {
            for (let j = i + 1; j < baseOrtogonal.length; j++) {
              const dot = productoPunto(baseOrtogonal[i], baseOrtogonal[j]);
              const chip = document.createElement('span');
              chip.className = 'u2-chip';
              chip.append(`✓ ⟨v${i + 1}, v${j + 1}⟩ = `, fraccionVisual(dot), ' (90°)');
              verificacionEl.append(chip);
            }
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