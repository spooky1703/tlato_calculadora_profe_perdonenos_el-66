(() => {
  const F = window.Fraccion;
  const matrizElemento = document.getElementById('matriz');
  const resultadoElemento = document.getElementById('seccion-resultado');
  const errorElemento = document.getElementById('error-entrada');
  let filas = 3, incognitas = 3, modoPractica = false;
  let valores = Array.from({ length: filas }, () => Array(incognitas + 1).fill('0'));

  let erroresImportados = new Map();
  const fraccionVisual = window.FormatoMatematico.fraccion;

  function renderizarMatriz() {
    resultadoElemento.hidden = true; window.VisualizacionSoluciones.limpiar();


    matrizElemento.style.setProperty('--columnas-editor', incognitas + 1);
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
          if (erroresImportados.get(`${i},${j}`) === valor) throw new Error('Corrige el valor importado.');
          const numero = F.desdeTexto(valor);
          if (F.contieneConstantes(valor)) {
            const simbolos = document.createElement('span');
            simbolos.className = 'expresion-constantes';
            simbolos.textContent = valor.toLowerCase().replace(/euler/g, 'e').replace(/pi/g, 'π').replace(/\*/g, '·').replace(/-/g, '−');
            celda.append(simbolos);
            celda.title = `Expresión: ${valor}. π y e se calculan con aproximaciones de 4 decimales.`;
          } else {
            celda.append(fraccionVisual(numero));
          }
        }
        catch { celda.textContent = valor || 'Vacío'; celda.classList.add('invalida'); celda.setAttribute('aria-invalid', 'true'); }
        celda.addEventListener('click', () => editarCelda(i, j, celda));
        filaElemento.append(celda);
      });
      matrizElemento.append(filaElemento);
    });
    agregarSeparador(matrizElemento, filas);
    document.getElementById('dimensiones').textContent = `${filas} ${filas === 1 ? "fila" : "filas"} · ${incognitas} ${incognitas === 1 ? "columna" : "columnas"}`;
    document.getElementById('agregar-fila').disabled = filas >= fila_max;
    document.getElementById('quitar-fila').disabled = filas <= 1;
    document.getElementById('agregar-columna').disabled = incognitas >= col_max - 1;
    document.getElementById('quitar-columna').disabled = incognitas <= 1;
  }

  function editarCelda(i, j, boton) {
    const entrada = document.createElement('input');
    entrada.style.cssText = boton.style.cssText;
    entrada.className = boton.className; entrada.maxLength = 256; entrada.value = valores[i][j]; entrada.defaultValue = valores[i][j]; entrada.autocomplete = 'off';
    entrada.setAttribute('aria-label', `Valor de fila ${i + 1}, columna ${j + 1}`);
    entrada.addEventListener('beforeinput', evento => { if (/\s/.test(evento.data || '')) evento.preventDefault(); });
    entrada.addEventListener('paste', evento => { if (/\s/.test(evento.clipboardData.getData('text'))) { evento.preventDefault(); mostrarError('Pega un valor sin espacios.'); } });
    boton.replaceWith(entrada); entrada.focus(); entrada.select();
    let guardado = false;
    const guardar = () => {
      if (guardado) return; guardado = true;
      valores[i][j] = entrada.value;
      erroresImportados.delete(`${i},${j}`);
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
      try {
        if (erroresImportados.get(`${i},${j}`) === valor) throw new Error('Corrige la celda roja importada.');
        return F.desdeTexto(valor);
      }
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

  document.getElementById('agregar-fila').addEventListener('click', () => {
    if (filas >= fila_max) return; valores.push(Array(incognitas + 1).fill('0')); filas++; renderizarMatriz();
  });
  document.getElementById('quitar-fila').addEventListener('click', () => {
    if (filas <= 1) return; if (valores[filas - 1].some(v => v !== '0') && !confirm('¿Eliminar la última fila y sus valores?')) return; valores.pop(); filas--; renderizarMatriz();
  });
  document.getElementById('agregar-columna').addEventListener('click', () => {
    if (incognitas >= col_max - 1) return; valores.forEach(fila => fila.splice(incognitas, 0, '0')); incognitas++; renderizarMatriz();
  });
  document.getElementById('quitar-columna').addEventListener('click', () => {
    if (incognitas <= 1) return; if (valores.some(f => f[incognitas - 1] !== '0') && !confirm('¿Eliminar la última incógnita y sus coeficientes?')) return; valores.forEach(fila => fila.splice(incognitas - 1, 1)); incognitas--; renderizarMatriz();
  });

  document.getElementById('limpiar').addEventListener('click', () => {
    erroresImportados.clear();
    filas = 3; incognitas = 3; valores = Array.from({ length: filas }, () => Array(incognitas + 1).fill('0'));
    resultadoElemento.hidden = true; window.VisualizacionSoluciones.limpiar(); errorElemento.hidden = true; renderizarMatriz();
  });

  document.getElementById('resolver').addEventListener('click', () => {
    try {
      const matriz = leerMatriz();
      const aproximado = valores.some(f => f.some(F.contieneConstantes));
      const presentar = () => {
      const resultado = GaussJordan.reducir(matriz, incognitas);
      renderizarMatrizResultado(resultado.matriz);
      window.VisualizacionSoluciones.preparar(resultado, matriz, incognitas, aproximado);
      const clasificacion = document.getElementById('clasificacion');
      const textos = {
        unica: 'sistema con solucion unica',
        infinitas: 'sistema con infinitas soluciones',
        incompatible: 'sistema sin soluciones'
      };
      clasificacion.textContent = textos[resultado.tipo];


      resultadoElemento.hidden = false;
      };
      if (modoPractica) {
        if (aproximado) throw new Error('En práctica usa enteros, decimales, fracciones o expresiones racionales, sin π ni Euler.');
        window.PracticaUI.iniciar(matriz, incognitas, presentar);
      } else presentar();
    } catch (error) {
      mostrarError(error.message, error.fila, error.columna);
      resultadoElemento.hidden = true; window.VisualizacionSoluciones.limpiar();
    }
  });

  let operacionActual = 'sistemas';
  function cambiarModo(practica, operacion = operacionActual) {
    if (!window.PracticaUI.salir()) return;
    modoPractica = practica;
    numeroCarga++;
    operacionActual = operacion;
    const cuadrada = operacion !== 'sistemas';
    const practicaSistema = practica && !cuadrada;
    document.getElementById('editor-sistema').hidden = cuadrada;
    document.getElementById('panel-cuadrada').hidden = !cuadrada || practica;
    document.getElementById('practica-proximamente').hidden = !cuadrada || !practica;
    document.getElementById('titulo-proximamente').textContent = operacion === 'inversa' ? 'Práctica de inversa' : 'Práctica de determinante';
    document.getElementById('modo-sistemas').setAttribute('aria-pressed', String(!cuadrada));
    document.getElementById('modo-inversa').setAttribute('aria-pressed', String(operacion === 'inversa'));
    document.getElementById('modo-determinante').setAttribute('aria-pressed', String(operacion === 'determinante'));
    if (cuadrada) window.MatricesCuadradas.cambiarModo(operacion);
    document.getElementById('modo-calculadora').setAttribute('aria-pressed', String(!practica));
    document.getElementById('modo-practica').setAttribute('aria-pressed', String(practica));
    document.getElementById('introduccion-practica').hidden = !practicaSistema;
    document.getElementById('credito-proyecto').hidden = practicaSistema;
    document.getElementById('reabrir-guia-practica').hidden = !practicaSistema;
    document.getElementById('resolver').textContent = practicaSistema ? 'Comenzar práctica' : 'Resolver';
    errorElemento.hidden = true; resultadoElemento.hidden = true; window.VisualizacionSoluciones.limpiar();
    if (practicaSistema) window.GuiaPractica.primeraVez();
  }
  document.getElementById('modo-practica').onclick = () => cambiarModo(true);
  document.getElementById('modo-calculadora').onclick = () => cambiarModo(false);
  document.getElementById('volver-calculadora').onclick = () => cambiarModo(false);
  document.getElementById('modo-sistemas').onclick = () => cambiarModo(modoPractica, 'sistemas');
  document.getElementById('modo-inversa').onclick = () => cambiarModo(modoPractica, 'inversa');
  document.getElementById('modo-determinante').onclick = () => cambiarModo(modoPractica, 'determinante');

  const inputArchivo = document.getElementById('input-archivo');
  const btnSubir = document.getElementById('btn-subir');

  let numeroCarga = 0;
  const procesarArchivo = async (archivo) => {
    if (!archivo) return;
    const solicitud = ++numeroCarga;
    const destino = operacionActual;
    const cuadrada = destino !== 'sistemas';
    const informar = mensaje => cuadrada ? window.MatricesCuadradas.mostrarError(mensaje) : mostrarError(mensaje);
    try {
      const carga = await window.ImportarMatriz.leer(archivo, cuadrada);
      // Una lectura vieja nunca reemplaza una carga más reciente ni otro modo.
      if (solicitud !== numeroCarga || destino !== operacionActual) return;
      if (cuadrada) window.MatricesCuadradas.cargar(carga);
      else {
        filas = carga.valores.length; incognitas = carga.valores[0].length - 1;
        valores = carga.valores;
        erroresImportados = new Map(carga.errores.map(e => [`${e.fila},${e.columna}`, valores[e.fila][e.columna]]));
        errorElemento.hidden = true; renderizarMatriz();
        if (carga.errores.length) mostrarError(window.ImportarMatriz.aviso(carga.errores));
      }
    } catch (error) {
      if (solicitud === numeroCarga && destino === operacionActual) informar(error.message);
    }
  };

  function recibirArchivos(archivos) {
    if (archivos.length !== 1) {
      const mensaje = 'Carga un solo archivo de matriz a la vez.';
      if (operacionActual === 'sistemas') mostrarError(mensaje);
      else window.MatricesCuadradas.mostrarError(mensaje);
      return;
    }
    procesarArchivo(archivos[0]);
  }
  for (const id of ['editor-sistema', 'panel-cuadrada']) {
    const zona = document.getElementById(id);
    zona.addEventListener('dragover', e => { e.preventDefault(); zona.classList.add('arrastrando'); });
    zona.addEventListener('dragleave', e => { if (!zona.contains(e.relatedTarget)) zona.classList.remove('arrastrando'); });
    zona.addEventListener('drop', e => {
      e.preventDefault(); zona.classList.remove('arrastrando'); recibirArchivos(e.dataTransfer.files);
    });
  }
  document.getElementById('btn-subir-cuadrada').onclick = () => inputArchivo.click();

  const zonaCargaGuia = document.getElementById('zona-carga-guia');
  zonaCargaGuia.addEventListener('dragover', e => { e.preventDefault(); zonaCargaGuia.classList.add('arrastrando'); });
  zonaCargaGuia.addEventListener('dragleave', e => {
    if (!zonaCargaGuia.contains(e.relatedTarget)) zonaCargaGuia.classList.remove('arrastrando');
  });
  zonaCargaGuia.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    zonaCargaGuia.classList.remove('arrastrando');
    const archivo = e.dataTransfer.files[0];
    if (!archivo) return;
    document.getElementById('modal-ayuda').close();
    errorElemento.hidden = true;
    recibirArchivos(e.dataTransfer.files);
  });

  if (btnSubir && inputArchivo) {
    btnSubir.addEventListener('click', () => window.GuiaImportacion.cargar(inputArchivo));
    inputArchivo.addEventListener('change', (e) => {
      errorElemento.hidden = true;
      if (e.target.files.length) recibirArchivos(e.target.files);
      inputArchivo.value = '';
    });
  }

  renderizarMatriz();
})();