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
        catch { celda.textContent = valor || 'Editar'; celda.classList.add('invalida'); }
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

  function cambiarModo(practica) {
    if (!window.PracticaUI.salir()) return;
    modoPractica = practica;
    document.getElementById('modo-calculadora').setAttribute('aria-pressed', String(!practica));
    document.getElementById('modo-practica').setAttribute('aria-pressed', String(practica));
    document.getElementById('introduccion-practica').hidden = !practica;
    document.getElementById('reabrir-guia-practica').hidden = !practica;
    document.getElementById('resolver').textContent = practica ? 'Comenzar práctica' : 'Resolver';
    errorElemento.hidden = true; resultadoElemento.hidden = true; window.VisualizacionSoluciones.limpiar();
    if(practica) window.GuiaPractica.primeraVez();
  }
  document.getElementById('modo-practica').onclick = () => cambiarModo(true);
  document.getElementById('modo-calculadora').onclick = () => cambiarModo(false);

  const inputArchivo = document.getElementById('input-archivo');
  const btnSubir = document.getElementById('btn-subir');

  const procesarArchivo = (archivo) => {
    if (!archivo) return;

    const procesar = (datos) => {
      const limpia = [...datos];
      while (limpia.length > 0 && limpia[limpia.length - 1].every(c => c === undefined || c === null || String(c).trim() === '')) {
        limpia.pop();
      }

      if (!limpia.length) {
        mostrarError("Archivo vacío o inválido.");
        return;
      }

      const f = limpia.length;
      const maxCols = Math.max(...limpia.map(fila => fila.length));
      const c = maxCols - 1;

      if (f > fila_max || c > col_max - 1 || c < 1) {
        mostrarError(`Dimensiones no soportadas: ${f}x${c}.`);
        return;
      }

      let temp = [];
      let errores = [];

      for (let i = 0; i < f; i++) {
        const filaActual = limpia[i];

        if (!filaActual || filaActual.every(celda => celda === undefined || celda === null || String(celda).trim() === '')) {
          errores.push(`Fila ${i + 1} (fila completa vacía)`);
          continue;
        }

        let filaTemp = [];
        for (let j = 0; j <= c; j++) {
          const valorCrudo = filaActual[j];
          const val = (valorCrudo !== undefined && valorCrudo !== null) ? String(valorCrudo).trim() : '';

          if (val === '') {
            errores.push(`Fila ${i + 1}, Columna ${j + 1} (vacío)`);
            continue;
          }

          try {
            F.desdeTexto(val);
            filaTemp.push(val);
          } catch (err) {
            errores.push(`Fila ${i + 1}, Columna ${j + 1} ("${val}": ${err.message})`);
          }
        }
        temp.push(filaTemp);
      }

      if (errores.length > 0) {
        mostrarError(`Error en el archivo. Revisa las posiciones: ${errores.join(' | ')}`);
        return;
      }

      filas = f;
      incognitas = c;
      valores = temp;
      renderizarMatriz();
    };

    const nombre = archivo.name.toLowerCase();
    if (nombre.endsWith('.csv') || nombre.endsWith('.txt')) {
      const lector = new FileReader();
      lector.onload = (ev) => {
        const texto = ev.target.result
          .replace(/^\uFEFF/, '')
          .replace(/["']/g, '')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/\n+$/, ''); 

        if (!texto) { procesar([]); return; }

        const usaDelimitador = /[,;\t]/.test(texto);
        const filasTexto = texto.split('\n').map(linea => {
          if (linea === '') return [];
          return usaDelimitador ? linea.split(/[,;\t]/) : linea.split(' ');
        });

        procesar(filasTexto);
      };
      lector.readAsText(archivo);
    } else if (nombre.endsWith('.xlsx') || nombre.endsWith('.xls')) {
      if (typeof XLSX === 'undefined') {
        mostrarError("Librería Excel no cargada. Actualiza el HTML.");
        return;
      }
      const lector = new FileReader();
      lector.onload = (ev) => {
        const libro = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
        procesar(XLSX.utils.sheet_to_json(libro.Sheets[libro.SheetNames[0]], {
          header: 1,
          defval: '',
          blankrows: true
        }));
      };
      lector.readAsArrayBuffer(archivo);
    } else {
      mostrarError("Formato no soportado (.txt, .csv, .xlsx).");
    }
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
      inputArchivo.value = ''; 
    });
  }

  renderizarMatriz();
})();

