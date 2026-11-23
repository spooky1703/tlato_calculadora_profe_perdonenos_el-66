(function (global) {
  const F = global.Fraccion;

  function reducir(matrizEntrada, numeroIncognitas, registrar = null) {
    const anotar = operacion => { if (registrar) registrar(operacion); };
    if (!Number.isInteger(numeroIncognitas) || numeroIncognitas < 1 || numeroIncognitas >= global.col_max) {
      throw new Error(`El número de incógnitas debe estar entre 1 y ${global.col_max - 1}.`);
    }
    if (!Array.isArray(matrizEntrada) || matrizEntrada.length < 1 || matrizEntrada.length > global.fila_max) {
      throw new Error(`La matriz debe tener entre 1 y ${global.fila_max} filas.`);
    }

    const matriz = [];
    for (let i = 0; i < matrizEntrada.length; i++) {
      const fila = matrizEntrada[i];
      if (!Array.isArray(fila) || fila.length !== numeroIncognitas + 1) {
        throw new Error('Cada fila debe incluir los coeficientes y la columna aumentada.');
      }
      matriz[i] = [];
      for (let j = 0; j < fila.length; j++) {
        if (!(fila[j] instanceof F)) throw new Error('La matriz contiene un valor inválido.');
        matriz[i][j] = new F(fila[j].n, fila[j].d);
      }
    }
    const filas = matriz.length;
    let filaPivote = 0;
    const columnasPivote = [];

    for (let columna = 0; columna < numeroIncognitas && filaPivote < filas; columna++) {
      let candidata = filaPivote;
      while (candidata < filas && matriz[candidata][columna].esCero()) candidata++;
      if (candidata === filas) continue;

      if (candidata !== filaPivote) {
        const temporal = matriz[filaPivote];
        matriz[filaPivote] = matriz[candidata];
        matriz[candidata] = temporal;
        anotar({tipo: "intercambio", fila: filaPivote, otra: candidata});
      }

      const pivote = matriz[filaPivote][columna];
      for (let j = 0; j <= numeroIncognitas; j++) matriz[filaPivote][j] = matriz[filaPivote][j].dividir(pivote);
      anotar({tipo: "dividir", fila: filaPivote, factor: pivote.aTexto()});

      for (let i = 0; i < filas; i++) {
        if (i === filaPivote) continue;
        const factor = matriz[i][columna];
        if (factor.esCero()) continue;
        for (let j = 0; j <= numeroIncognitas; j++) {
          matriz[i][j] = matriz[i][j].restar(factor.multiplicar(matriz[filaPivote][j]));
        }
        anotar({tipo: "restar", fila: i, otra: filaPivote, factor: factor.aTexto()});
      }
      columnasPivote.push(columna);
      filaPivote++;
    }

    const rangoCoeficientes = columnasPivote.length;
    let filaIncompatible = -1;
    for (let i = 0; i < filas; i++) {
      let todosCero = true;
      for (let j = 0; j < numeroIncognitas; j++) {
        if (!matriz[i][j].esCero()) todosCero = false;
      }
      if (todosCero && !matriz[i][numeroIncognitas].esCero()) {
        filaIncompatible = i;
        break;
      }
    }
    // la columna aumentada también tiene pivote si el sistema es incompatible.
    if (filaIncompatible >= 0) {
      // el pivote de b debe quedar antes de las filas nulas para completar RREF.
      if (filaIncompatible !== rangoCoeficientes) {
        const temporal = matriz[rangoCoeficientes];
        matriz[rangoCoeficientes] = matriz[filaIncompatible];
        matriz[filaIncompatible] = temporal;
        anotar({tipo: "intercambio", fila: rangoCoeficientes, otra: filaIncompatible});
        filaIncompatible = rangoCoeficientes;
      }
      const pivote = matriz[filaIncompatible][numeroIncognitas];
      for (let j = 0; j <= numeroIncognitas; j++) {
        matriz[filaIncompatible][j] = matriz[filaIncompatible][j].dividir(pivote);
      }
      anotar({tipo: "dividir", fila: filaIncompatible, factor: pivote.aTexto()});
      for (let i = 0; i < filas; i++) {
        if (i === filaIncompatible) continue;
        const factor = matriz[i][numeroIncognitas];
        for (let j = 0; j <= numeroIncognitas; j++) {
          matriz[i][j] = matriz[i][j].restar(factor.multiplicar(matriz[filaIncompatible][j]));
        }
        anotar({tipo: "restar", fila: i, otra: filaIncompatible, factor: factor.aTexto()});
      }
    }
    const rangoAumentada = rangoCoeficientes + (filaIncompatible >= 0 ? 1 : 0);
    let tipo;
    if (filaIncompatible >= 0) tipo = 'incompatible';
    else if (rangoCoeficientes === numeroIncognitas) tipo = 'unica';
    else tipo = 'infinitas';

    return { matriz, columnasPivote, rangoCoeficientes, rangoAumentada, filaIncompatible, tipo };
  }

  global.GaussJordan = { reducir };
})(window);
