(() => {
  const F = window.Fraccion;
  const matrizElemento = document.getElementById('matriz');
  const resultadoElemento = document.getElementById('seccion-resultado');
  const errorElemento = document.getElementById('error-entrada');
  let filas = 3, incognitas = 3, modoPractica = false;
  let valores = Array.from({ length: filas }, () => Array(incognitas + 1).fill('0'));

  function fraccionVisual(fraccion) {
    if (fraccion.d === 1n) return document.createTextNode(String(fraccion.n));
    const contenedor = document.createElement('span');
    contenedor.className = 'fraccion';
    const numerador = document.createElement('span'); numerador.className = 'numerador'; numerador.textContent = String(fraccion.n);
    const barra = document.createElement('span'); barra.className = 'barra';
    const denominador = document.createElement('span'); denominador.className = 'denominador'; denominador.textContent = String(fraccion.d);
    contenedor.append(numerador, barra, denominador);
    return contenedor;
  }

  function renderizarMatriz() {
    resultadoElemento.hidden = true;

    window.VisualizacionSoluciones.limpiar();

    matrizElemento.replaceChildren();
    matrizElemento.style.gridTemplateColumns = `repeat(${incognitas}, max-content) 2px max-content`;
    matrizElemento.style.gridTemplateRows = `repeat(${filas}, auto)`;
    valores.forEach((fila, i) => {
      const filaElemento = document.createElement('div'); filaElemento.className = 'fila-matriz';
      fila.forEach((valor, j) => {
        const celda = document.createElement('button');
        celda.dataset.fila = i; celda.dataset.columna = j;
        celda.type = 'button'; celda.className = 'celda';
        celda.style.gridRow = i + 1; celda.style.gridColumn = j < incognitas ? j + 1 : j + 2;
        if (j === incognitas) celda.classList.add('celda-aumentada');
        celda.setAttribute('aria-label', `Editar fila ${i + 1}, ${j === incognitas ? 'término independiente' : `coeficiente de x${j + 1}`}`);
        try {
          const numero = F.desdeTexto(valor);
          if (F.contieneConstantes(valor)) {
            const simbolos = document.createElement('span');
            simbolos.className = 'expresion-constantes';
            simbolos.textContent = valor.toLowerCase().replace(/euler/g, 'e').replace(/pi/g, 'π').replace(/\*/g, '·').replace(/-/g, '−');
            celda.append(simbolos);
            celda.title = `Expresión: ${valor}. π y e se calculan con aproximaciones de 40 decimales.`;
          } else {
            celda.append(fraccionVisual(numero));
          }
        }
        catch { celda.textContent = valor || 'Editar'; celda.classList.add('invalida'); }
        celda.addEventListener('click', () => editarCelda(i, j, celda));
        filaElemento.append(celda);
      });
      matrizElemento.append(filaElemento);
    });
    agregarSeparador(matrizElemento, filas);
    document.getElementById('dimensiones').textContent = `${filas} ecuaciones · ${incognitas} incógnitas`;
    document.getElementById('agregar-fila').disabled = filas >= 15;
    document.getElementById('quitar-fila').disabled = filas <= 1;
    document.getElementById('agregar-columna').disabled = incognitas >= 14;
    document.getElementById('quitar-columna').disabled = incognitas <= 1;
  }

  function editarCelda(i, j, boton) {
    const entrada = document.createElement('input');
    entrada.style.cssText = boton.style.cssText;
    entrada.className = boton.className; entrada.maxLength = 256; entrada.value = valores[i][j]; entrada.defaultValue = valores[i][j]; entrada.autocomplete = 'off';
    entrada.setAttribute('aria-label', `Valor de fila ${i + 1}, columna ${j + 1}`);
    boton.replaceWith(entrada); entrada.focus(); entrada.select();
    let guardado = false;
    const guardar = () => {
      if (guardado) return; guardado = true;
      valores[i][j] = entrada.value.trim();
      errorElemento.hidden = true;
      try { F.desdeTexto(valores[i][j]); } catch (error) { mostrarError(`Fila ${i + 1}, columna ${j + 1}: ${error.message}`); }
      renderizarMatriz();
    };
    entrada.addEventListener('blur', evento => {
      const destino = evento.relatedTarget;
      guardar();
      if (destino?.dataset.fila !== undefined) {
        const fila = Number(destino.dataset.fila), columna = Number(destino.dataset.columna);
        const nueva = matrizElemento.querySelectorAll('.fila-matriz')[fila]?.children[columna];
        if (nueva) editarCelda(fila, columna, nueva);
      }
    });
    entrada.addEventListener('keydown', evento => {
      if (evento.key === 'Escape') { entrada.value = entrada.defaultValue; entrada.blur(); }
      if (evento.key === 'Tab' || evento.key === 'Enter') {
        evento.preventDefault();
        const siguiente = (i * (incognitas + 1) + j + (evento.shiftKey ? -1 : 1) + filas * (incognitas + 1)) % (filas * (incognitas + 1));
        guardar();
        matrizElemento.querySelectorAll('.celda')[siguiente].click();
      }
    });
  }

  function mostrarError(mensaje, i = -1, j = -1) {
    errorElemento.textContent = mensaje;
    errorElemento.hidden = false;
    if (i >= 0 && j >= 0) {
      const celda = matrizElemento.querySelectorAll('.fila-matriz')[i]?.children[j];
      if (celda) celda.classList.add('invalida');
    }
  }

  function leerMatriz() {
    errorElemento.hidden = true;
    return valores.map((fila, i) => fila.map((valor, j) => {
      try { return F.desdeTexto(valor); }
      catch (error) { throw Object.assign(new Error(`Fila ${i + 1}, columna ${j + 1}: ${error.message}`), { fila: i, columna: j }); }
    }));
  }

  function agregarSeparador(destino, numeroFilas) {
    const separador = document.createElement('span');
    separador.className = 'separador-aumentada';
    separador.setAttribute('aria-hidden', 'true');
    separador.style.gridColumn = incognitas + 1;
    separador.style.gridRow = `1 / span ${numeroFilas}`;
    destino.append(separador);
  }

  function renderizarMatrizResultado(matriz) {
    const tabla = document.createElement('div'); tabla.className = 'tabla-resultado';
    tabla.style.gridTemplateColumns = `repeat(${incognitas}, minmax(56px, max-content)) 2px minmax(56px, max-content)`;
    matriz.forEach((fila, i) => {
      const filaElemento = document.createElement('div'); filaElemento.className = 'fila-resultado';
      fila.forEach((valor, j) => {
        const celda = document.createElement('span'); celda.className = 'valor-matriz';
        celda.style.gridRow = i + 1; celda.style.gridColumn = j < incognitas ? j + 1 : j + 2;
        if (j === incognitas) celda.classList.add('aumentada');
        celda.append(fraccionVisual(valor)); filaElemento.append(celda);
      });
      tabla.append(filaElemento);
    });
    agregarSeparador(tabla, matriz.length);
    const destino = document.getElementById('matriz-resultado'); destino.replaceChildren(tabla);
  }

  function sumarTermino(contenedor, texto, clase = '') {
    const span = document.createElement('span'); span.textContent = texto; if (clase) span.className = clase; contenedor.append(span);
  }

  function renderizarSolucion(resultado) {
    const destino = document.getElementById('detalle-solucion'); destino.replaceChildren();
    const encabezado = document.createElement('h3'); encabezado.textContent = 'Solución'; destino.append(encabezado);
    if (resultado.tipo === 'incompatible') {
      const p = document.createElement('p'); p.textContent = `El sistema no tiene solución. La fila ${resultado.filaIncompatible + 1} contiene únicamente ceros en los coeficientes y un término independiente distinto de cero.`;
      destino.append(p); return;
    }
    const lista = document.createElement('div'); lista.className = 'solucion-lista';
    if (resultado.tipo === 'unica') {
      resultado.columnasPivote.forEach((columna, i) => {
        const linea = document.createElement('div'); linea.className = 'solucion-linea';
        sumarTermino(linea, `x${columna + 1} =`); linea.append(fraccionVisual(resultado.matriz[i][incognitas])); lista.append(linea);
      });
    } else {
      const { libres, expresiones } = GaussJordan.parametrizar(resultado, incognitas);
      expresiones.forEach((terminos, indice) => {
        const linea = document.createElement('div'); linea.className = 'solucion-linea';
        sumarTermino(linea, `x${indice + 1} =`);
        if (!terminos.length) sumarTermino(linea, '0');
        let primero = true;
        terminos.forEach(termino => {
          const coef = termino.coeficiente;
          const negativo = coef.n < 0n;
          if (!primero) sumarTermino(linea, negativo ? ' − ' : ' + ');
          else if (negativo) sumarTermino(linea, '−');
          const absoluto = new F(coef.n < 0n ? -coef.n : coef.n, coef.d);
          if (termino.constante || !absoluto.esUno()) linea.append(fraccionVisual(absoluto));
          if (termino.parametro) sumarTermino(linea, termino.parametro);
          primero = false;
        });
        lista.append(linea);
      });
      const nota = document.createElement('p'); nota.className = 'parametros';
      nota.textContent = `Variables pivote: ${resultado.columnasPivote.map(i => `x${i + 1}`).join(', ') || 'ninguna'}. Variables libres: ${libres.map(i => `x${i + 1}`).join(', ')}. ${libres.map((col, i) => `t${i + 1} = x${col + 1}`).join('; ')}. Cada parámetro puede tomar cualquier valor real.`;
      destino.append(lista, nota); return;
    }
    destino.append(lista);
  }

  document.getElementById('agregar-fila').addEventListener('click', () => {
    if (filas >= 15) return; valores.push(Array(incognitas + 1).fill('0')); filas++; renderizarMatriz();
  });
  document.getElementById('quitar-fila').addEventListener('click', () => {
    if (filas <= 1) return; if (valores[filas - 1].some(v => v !== '0') && !confirm('¿Eliminar la última fila y sus valores?')) return; valores.pop(); filas--; renderizarMatriz();
  });
  document.getElementById('agregar-columna').addEventListener('click', () => {
    if (incognitas >= 14) return; valores.forEach(fila => fila.splice(incognitas, 0, '0')); incognitas++; renderizarMatriz();
  });
  document.getElementById('quitar-columna').addEventListener('click', () => {
    if (incognitas <= 1) return; if (valores.some(f => f[incognitas - 1] !== '0') && !confirm('¿Eliminar la última incógnita y sus coeficientes?')) return; valores.forEach(fila => fila.splice(incognitas - 1, 1)); incognitas--; renderizarMatriz();
  });

  document.getElementById('limpiar').addEventListener('click', () => {
    filas = 3; incognitas = 3; valores = Array.from({ length: filas }, () => Array(incognitas + 1).fill('0'));
    resultadoElemento.hidden = true; errorElemento.hidden = true; renderizarMatriz();
  });

  document.getElementById('resolver').addEventListener('click', () => {
    try {
      const matriz = leerMatriz();
      const aproximado = valores.some(f => f.some(F.contieneConstantes));
      const presentar = () => {
      document.getElementById('aviso-precision').hidden = !aproximado;
      const resultado = GaussJordan.reducir(matriz, incognitas);
      renderizarMatrizResultado(resultado.matriz);
      const clasificacion = document.getElementById('clasificacion');
      const textos = {
        unica: 'Sistema compatible determinado: existe una solución única.',
        infinitas: 'Sistema compatible indeterminado: existen infinitas soluciones.',
        incompatible: 'Sistema incompatible: no existe solución.'
      };
      clasificacion.textContent = `${aproximado ? 'Modelo racional aproximado: ' : ''}${textos[resultado.tipo]} Rango(A) = ${resultado.rangoCoeficientes}; rango(A|b) = ${resultado.rangoAumentada}.`;
      renderizarSolucion(resultado);

      window.VisualizacionSoluciones.preparar(resultado, matriz, incognitas, aproximado);

      resultadoElemento.hidden = false;
      };
      if (modoPractica) {
        if (aproximado) throw new Error('En práctica usa enteros, decimales, fracciones o expresiones racionales, sin π ni Euler.');
        window.PracticaUI.iniciar(matriz, incognitas, presentar);
      } else presentar();
    } catch (error) {
      mostrarError(error.message, error.fila, error.columna);
      resultadoElemento.hidden = true;
    }
  });

  function cambiarModo(practica) {
    if (!window.PracticaUI.salir()) return;
    modoPractica = practica;
    document.getElementById('modo-calculadora').setAttribute('aria-pressed', String(!practica));
    document.getElementById('modo-practica').setAttribute('aria-pressed', String(practica));
    document.getElementById('introduccion-practica').hidden = !practica;
    document.getElementById('resolver').textContent = practica ? 'Comenzar práctica' : 'Resolver';
    errorElemento.hidden = true; resultadoElemento.hidden = true;
    window.VisualizacionSoluciones.limpiar();
  }
  document.getElementById('modo-practica').onclick = () => cambiarModo(true);
  document.getElementById('modo-calculadora').onclick = () => cambiarModo(false);

  const modal = document.getElementById('modal-video');
  const video = document.getElementById('video');
  const audioBroma = document.getElementById('audio-broma');
  const avisoAudioBroma = document.getElementById('error-audio-broma');
  video.defaultMuted = true;
  video.addEventListener('volumechange', () => { if (!video.muted) video.muted = true; });
  document.getElementById('ver-pasos').addEventListener('click', () => {
    modal.hidden = false;
    document.getElementById('error-video').hidden = true;
    avisoAudioBroma.hidden = true;
    video.muted = true;
    video.currentTime = 0;
    audioBroma.currentTime = 0;
    const sonido = audioBroma.play();
    if (sonido?.catch) sonido.catch(() => { if (!modal.hidden) avisoAudioBroma.hidden = false; });
    document.getElementById('cerrar-video').focus();
    const promesa = video.play();
    if (promesa && promesa.catch) promesa.catch(() => {});
  });

  function cerrarModal() {
    video.pause(); audioBroma.pause();
    video.currentTime = 0; audioBroma.currentTime = 0;
    modal.hidden = true;
    document.getElementById('ver-pasos').focus();
  }
  audioBroma.addEventListener('error', () => { avisoAudioBroma.textContent = 'No se pudo cargar el audio de las risas.'; avisoAudioBroma.hidden = false; });
  document.getElementById('cerrar-video').addEventListener('click', cerrarModal);
  modal.addEventListener('click', evento => { if (evento.target === modal) cerrarModal(); });
  video.addEventListener('error', () => { document.getElementById('error-video').hidden = false; });
  document.addEventListener('keydown', evento => { if (evento.key === 'Escape' && !modal.hidden) cerrarModal(); });

  const inputArchivo = document.getElementById('input-archivo');
  const btnSubir = document.getElementById('btn-subir');

  const procesarArchivo = (archivo) => {
    if (!archivo) return;
    const procesar = (datos) => {
      const limpia = datos.filter(f => f.some(c => c !== undefined && c !== null && c !== ''));
      if (!limpia.length) { mostrarError("Archivo vacío o inválido."); return; }
      const f = limpia.length, c = limpia[0].length - 1;
      if (f > 15 || c > 14 || c < 1) { mostrarError(`Dimensiones no soportadas: ${f}x${c}.`); return; }
      let temp = [];
      try {
        for (let i = 0; i < f; i++) {
          let filaTemp = [];
          for (let j = 0; j <= c; j++) {
            let val = limpia[i][j] !== undefined ? String(limpia[i][j]).trim() : '0';
            if (val === '') val = '0';
            F.desdeTexto(val);
            filaTemp.push(val);
          }
          temp.push(filaTemp);
        }
      } catch (err) { mostrarError(`Datos inválidos: ${err.message}`); return; }
      filas = f; incognitas = c; valores = temp; renderizarMatriz();
    };
    
    const nombre = archivo.name.toLowerCase();
    if (nombre.endsWith('.csv') || nombre.endsWith('.txt')) {
      const lector = new FileReader();
      lector.onload = (ev) => procesar(ev.target.result.trim().split('\n').map(f => f.trim().split(/[\t,; ]+/)));
      lector.readAsText(archivo);
    } else if (nombre.endsWith('.xlsx') || nombre.endsWith('.xls')) {
      if (typeof XLSX === 'undefined') { mostrarError("Librería Excel no cargada. Actualiza el HTML."); return; }
      const lector = new FileReader();
      lector.onload = (ev) => {
        const libro = XLSX.read(new Uint8Array(ev.target.result), {type: 'array'});
        procesar(XLSX.utils.sheet_to_json(libro.Sheets[libro.SheetNames[0]], {header: 1}));
      };
      lector.readAsArrayBuffer(archivo);
    } else mostrarError("Formato no soportado (.txt, .csv, .xlsx).");
  };

  matrizElemento.addEventListener('dragover', (e) => { e.preventDefault(); matrizElemento.classList.add('arrastrando'); });
  matrizElemento.addEventListener('dragleave', (e) => { e.preventDefault(); matrizElemento.classList.remove('arrastrando'); });
  matrizElemento.addEventListener('drop', (e) => {
    e.preventDefault(); matrizElemento.classList.remove('arrastrando'); errorElemento.hidden = true;
    procesarArchivo(e.dataTransfer.files[0]);
  });

  if (btnSubir && inputArchivo) {
    btnSubir.addEventListener('click', () => window.GuiaImportacion.cargar(inputArchivo));
    inputArchivo.addEventListener('change', (e) => {
      errorElemento.hidden = true;
      procesarArchivo(e.target.files[0]);
      inputArchivo.value = ''; // Permite cargar el mismo archivo dos veces seguidas si hay modificaciones
    });
  }

  renderizarMatriz();
})();
