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
    ['0', '0', '0'],
    ['0', '0', '0'],
    ['0', '0', '0']
  ];

  function normalizarComponenteVisual(comp, normaSq) {
    if (comp.esCero()) return fraccionVisual(comp);
    const rn = window.Unidad3.raizEntera(normaSq.n);
    const rd = window.Unidad3.raizEntera(normaSq.d);
    if (rn * rn === normaSq.n && rd * rd === normaSq.d) {
      return fraccionVisual(comp.dividir(new F(rn, rd)));
    }
    const frac = document.createElement('span'); frac.className = 'fraccion';
    const num = document.createElement('span'); num.className = 'numerador'; num.append(fraccionVisual(comp));
    const barra = document.createElement('span'); barra.className = 'barra';
    const den = document.createElement('span'); den.className = 'denominador';
    const raiz = document.createElement('span'); raiz.className = 'u3-radical';
    const signo = document.createElement('span'); signo.className = 'u3-radical-simbolo'; signo.textContent = '√';
    const contenido = document.createElement('span'); contenido.className = 'u3-radical-contenido'; contenido.append(fraccionVisual(normaSq));
    raiz.append(signo, contenido); den.append(raiz); frac.append(num, barra, den);
    frac.setAttribute('aria-label', `${comp.aTexto()} dividido entre la raíz de ${normaSq.aTexto()}`);
    return frac;
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
          celda.append(window.FormatoMatematico.expresion(val));
        } catch {
          celda.textContent = val || '—';
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
    document.getElementById('u3-agregar-vector').disabled = numVectores >= window.col_max - 1;
    document.getElementById('u3-quitar-vector').disabled = numVectores <= 1;
    document.getElementById('u3-agregar-comp').disabled = dimension >= Math.min(window.fila_max, window.col_max - 1);
    document.getElementById('u3-quitar-comp').disabled = dimension <= 1;
  }

  document.getElementById('u3-agregar-vector').onclick = () => {
    if (numVectores >= window.col_max - 1) return;
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
    if (dimension >= Math.min(window.fila_max, window.col_max - 1)) return;
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

  document.getElementById('u3-calcular').onclick = () => {
    errorEl.hidden = true;
    try {
      const completa = actividad === 'ortonormal';
      const r = window.Unidad3.analizar(vectoresS, completa);
      const base = r.ortogonales;
      pipelineEl.hidden = !completa;
      propiedadesBoxEl.hidden = !completa;
      if (completa) {
        const nombres = r.datos.indicesBase.map(i => `α${i + 1}`);
        document.getElementById('u3-etapa-li').textContent = nombres.length ? `{${nombres.join(', ')}}` : '∅';
        document.getElementById('u3-etapa-base').textContent = `{${[...nombres, ...r.datos.agregados.map(a => `e${a.indice + 1}`)].join(', ')}}`;
        document.getElementById('u3-etapa-ortog').textContent = `{${base.map((_, i) => `u${i + 1}`).join(', ')}}`;
        document.getElementById('u3-etapa-orton').textContent = `{${base.map((_, i) => `v${i + 1}`).join(', ')}}`;
      }
      veredictoEl.textContent = completa
        ? `Base ortonormal de ℝ${dimension} · ${r.dimension} vectores`
        : base.length ? `Base ortogonal del espacio generado ⟨S⟩ · dimensión ${r.dimension}` : 'Espacio generado {0}: su base es el conjunto vacío ∅.';
      baseVectoresEl.replaceChildren();
      const fila = document.createElement('div'); fila.className = 'u2-fila-vectores';
      base.forEach((v, i) => fila.append(crearTarjetaVector(`${completa ? 'v' : 'u'}${i + 1}`, v, i, true, completa ? r.normasCuadradas[i] : null)));
      baseVectoresEl.append(fila);
      propiedadesEl.replaceChildren();
      if (completa) {
        for (const texto of [`✓ Base: ${r.dimension} vectores independientes en ℝ${dimension}.`, '✓ Ortogonales: los productos punto entre vectores distintos son cero.', '✓ Unitarios: al dividir por su norma, cada norma al cuadrado es uno.']) {
          const p = document.createElement('p'); p.textContent = texto; propiedadesEl.append(p);
        }
      }
      verificacionEl.replaceChildren();
      const p = document.createElement('p');
      p.textContent = base.length > 1
        ? 'Se comprobaron todos los productos punto entre pares: son cero.'
        : base.length === 1 ? 'Un vector no nulo forma una base ortogonal de su recta.' : 'No hay vectores que normalizar.';
      verificacionEl.append(p);
      resultadoEl.hidden = false;
    } catch (err) { mostrarError(err.message); resultadoEl.hidden = true; }
  };
})();
