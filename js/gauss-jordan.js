(function (global) {
  const F = global.Fraccion;

  // Validación y copia: nunca modificamos la matriz que escribió el usuario.
  function copiar(entrada, columnas) {
    if (!Array.isArray(entrada) || entrada.length < 1 || entrada.length > global.fila_max) {
      throw new Error(`La matriz debe tener entre 1 y ${global.fila_max} filas.`);
    }
    return entrada.map(fila => {
      if (!Array.isArray(fila) || fila.length !== columnas) throw new Error('Las filas no tienen las dimensiones esperadas.');
      return fila.map(v => {
        if (!(v instanceof F)) throw new Error('La matriz contiene un valor inválido.');
        return new F(v.n, v.d);
      });
    });
  }
  function cuadrada(entrada) {
    if (!Array.isArray(entrada) || entrada.length < 1 || entrada.length > global.col_max) {
      throw new Error('Introduce una matriz cuadrada dentro del límite permitido.');
    }
    return copiar(entrada, entrada.length);
  }

  // Operaciones compartidas por sistemas, inversas, determinantes y práctica.
  function buscarPivote(matriz, fila, columna) {
    while (fila < matriz.length && matriz[fila][columna].esCero()) fila++;
    return fila < matriz.length ? fila : -1;
  }
  function intercambiar(matriz, fila, otra, registrar) {
    if (fila === otra) return;
    [matriz[fila], matriz[otra]] = [matriz[otra], matriz[fila]];
    if (registrar) registrar({ tipo: 'intercambio', fila, otra });
  }
  function hacerUno(matriz, fila, columna, registrar) {
    const pivote = matriz[fila][columna];
    if (pivote.esUno()) return;
    matriz[fila] = matriz[fila].map(v => v.dividir(pivote));
    if (registrar) registrar({ tipo: 'dividir', fila, factor: pivote.aTexto() });
  }
  function hacerCero(matriz, fila, pivote, columna, registrar) {
    if (matriz[fila][columna].esCero()) return;
    // También sirve cuando el pivote no es 1 (determinante).
    const factor = matriz[fila][columna].dividir(matriz[pivote][columna]);
    matriz[fila] = matriz[fila].map((v, j) => v.restar(factor.multiplicar(matriz[pivote][j])));
    if (registrar) registrar({ tipo: 'restar', fila, otra: pivote, factor: factor.aTexto() });
  }
  function cerosAbajo(matriz, fila, columna, registrar) {
    for (let i = fila + 1; i < matriz.length; i++) hacerCero(matriz, i, fila, columna, registrar);
  }
  function cerosArriba(matriz, fila, columna, registrar) {
    for (let i = 0; i < fila; i++) hacerCero(matriz, i, fila, columna, registrar);
  }

  // Recorrido completo. Cada aviso corresponde a UNA operación elemental.
  // detalle es opcional: práctica necesita las matrices antes y después.
  function recorrido(matriz, columnas, registrar, detalle, saltar) {
    let fila = 0;
    const pivotes = [];
    function ejecutar(columna, etapa, accion) {
      let anterior = detalle ? matriz.map(f => f.slice()) : null;
      accion(op => {
        if (registrar) registrar(op);
        if (detalle) {
          const siguiente = matriz.map(f => f.slice());
          detalle(op, anterior, siguiente, columna, etapa);
          anterior = siguiente;
        }
      });
    }
    for (let col = 0; col < columnas && fila < matriz.length; col++) {
      const candidata = buscarPivote(matriz, fila, col);
      if (candidata < 0) { if (saltar) saltar(col); continue; }
      ejecutar(col, 'Buscar pivote', aviso => intercambiar(matriz, fila, candidata, aviso));
      ejecutar(col, 'Normalizar pivote', aviso => hacerUno(matriz, fila, col, aviso));
      // Registrar por separado conserva una matriz por operación en práctica.
      ejecutar(col, 'Ceros debajo', aviso => cerosAbajo(matriz, fila, col, aviso));
      pivotes.push({ fila, col });
      fila++;
    }
    // Ceros arriba por columnas de izquierda a derecha, igual que en práctica.
    for (const p of pivotes) {
      ejecutar(p.col, 'Ceros encima', aviso => cerosArriba(matriz, p.fila, p.col, aviso));
    }
    return pivotes;
  }

  // SISTEMAS: reducir [A | b], incluyendo b si aparece una contradicción.
  function reducir(entrada, n, registrar = null, detalle = null, saltar = null) {
    if (!Number.isInteger(n) || n < 1 || n >= global.col_max) throw new Error(`El número de incógnitas debe estar entre 1 y ${global.col_max - 1}.`);
    const matriz = copiar(entrada, n + 1);
    const pivotes = recorrido(matriz, n + 1, registrar, detalle, saltar);
    const columnasPivote = pivotes.filter(p => p.col < n).map(p => p.col);
    const contradiccion = pivotes.find(p => p.col === n);
    const filaIncompatible = contradiccion ? contradiccion.fila : -1;
    const rangoCoeficientes = columnasPivote.length;
    const rangoAumentada = pivotes.length;
    const tipo = contradiccion ? 'incompatible' : rangoCoeficientes === n ? 'unica' : 'infinitas';
    return { matriz, columnasPivote, rangoCoeficientes, rangoAumentada, filaIncompatible, tipo };
  }

  // INVERSA: colocar I a la derecha y operar toda la fila, en ambos lados.
  function inversa(entrada) {
    const matriz = cuadrada(entrada), n = matriz.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) matriz[i].push(i === j ? F.UNO : F.CERO);
    }
    // Los pivotes se buscan solamente dentro de A, nunca dentro de I.
    const pivotes = recorrido(matriz, n);
    const existe = pivotes.length === n;
    return { existe, matriz, inversa: existe ? matriz.map(fila => fila.slice(n)) : null };
  }

  // DETERMINANTE: aquí NO hacemos 1 los pivotes ni hacemos ceros arriba.
  function determinante(entrada) {
    const matriz = cuadrada(entrada);
    let intercambios = 0;
    for (let col = 0; col < matriz.length; col++) {
      const candidata = buscarPivote(matriz, col, col);
      // Sin pivote en esta columna, la matriz cuadrada es singular.
      if (candidata < 0) return { valor: F.CERO, matriz, intercambios };
      if (candidata !== col) {
        intercambiar(matriz, col, candidata);
        intercambios++;
      }
      // Restar un múltiplo de otra fila NO cambia el determinante.
      cerosAbajo(matriz, col, col);
    }
    // Ya es triangular: multiplicamos los números de la diagonal.
    let valor = F.UNO;
    for (let i = 0; i < matriz.length; i++) valor = valor.multiplicar(matriz[i][i]);
    // Cada intercambio cambia el signo. Dos intercambios lo dejan igual.
    if (intercambios % 2 === 1) valor = valor.negar();
    return { valor, matriz, intercambios };
  }
  global.GaussJordan = { reducir, inversa, determinante, buscarPivote, intercambiar, hacerUno, cerosAbajo, cerosArriba };
})(window);
