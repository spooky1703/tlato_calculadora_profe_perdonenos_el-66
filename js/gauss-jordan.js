(function (global) {
  const F = global.Fraccion;

  function reducir(matrizEntrada, numeroIncognitas) {
    if (!Number.isInteger(numeroIncognitas) || numeroIncognitas < 1 || numeroIncognitas > 14 || !Array.isArray(matrizEntrada) || matrizEntrada.length < 1 || matrizEntrada.length > 15 || matrizEntrada.some(f => !Array.isArray(f) || f.length !== numeroIncognitas + 1 || f.some(v => !(v instanceof F)))) throw new Error('Dimensiones o valores de matriz inválidos.');
    const matriz = matrizEntrada.map(fila => fila.map(v => new F(v.n, v.d)));
    const filas = matriz.length;
    let filaPivote = 0;
    const columnasPivote = [];

    for (let columna = 0; columna < numeroIncognitas && filaPivote < filas; columna++) {
      let candidata = filaPivote;
      while (candidata < filas && matriz[candidata][columna].esCero()) candidata++;
      if (candidata === filas) continue;

      if (candidata !== filaPivote) [matriz[candidata], matriz[filaPivote]] = [matriz[filaPivote], matriz[candidata]];

      const pivote = matriz[filaPivote][columna];
      for (let j = 0; j <= numeroIncognitas; j++) matriz[filaPivote][j] = matriz[filaPivote][j].dividir(pivote);

      for (let i = 0; i < filas; i++) {
        if (i === filaPivote) continue;
        const factor = matriz[i][columna];
        if (factor.esCero()) continue;
        for (let j = 0; j <= numeroIncognitas; j++) {
          matriz[i][j] = matriz[i][j].restar(factor.multiplicar(matriz[filaPivote][j]));
        }
      }
      columnasPivote.push(columna);
      filaPivote++;
    }

    const rangoCoeficientes = columnasPivote.length;
    const filaIncompatible = matriz.findIndex(fila =>
      fila.slice(0, numeroIncognitas).every(v => v.esCero()) && !fila[numeroIncognitas].esCero()
    );
    // La columna aumentada también tiene pivote si el sistema es incompatible.
    if (filaIncompatible >= 0) {
      const pivote = matriz[filaIncompatible][numeroIncognitas];
      matriz[filaIncompatible] = matriz[filaIncompatible].map(v => v.dividir(pivote));
      for (let i = 0; i < filas; i++) {
        if (i === filaIncompatible) continue;
        const factor = matriz[i][numeroIncognitas];
        matriz[i] = matriz[i].map((v, j) => v.restar(factor.multiplicar(matriz[filaIncompatible][j])));
      }
    }
    const rangoAumentada = rangoCoeficientes + (filaIncompatible >= 0 ? 1 : 0);
    let tipo;
    if (filaIncompatible >= 0) tipo = 'incompatible';
    else if (rangoCoeficientes === numeroIncognitas) tipo = 'unica';
    else tipo = 'infinitas';

    return { matriz, columnasPivote, rangoCoeficientes, rangoAumentada, filaIncompatible, tipo };
  }

  function parametrizar(resultado, numeroIncognitas) {
    if (resultado.tipo === 'incompatible') throw new Error('Un sistema incompatible no tiene parametrización.');
    const { matriz, columnasPivote } = resultado;
    const libres = Array.from({ length: numeroIncognitas }, (_, i) => i).filter(i => !columnasPivote.includes(i));
    const expresiones = Array(numeroIncognitas);
    libres.forEach((columna, indice) => { expresiones[columna] = [{ coeficiente: F.UNO, parametro: `t${indice + 1}` }]; });

    columnasPivote.forEach((columna, indiceFila) => {
      const fila = matriz[indiceFila];
      const terminos = [];
      if (!fila[numeroIncognitas].esCero()) terminos.push({ coeficiente: fila[numeroIncognitas], constante: true });
      libres.forEach((columnaLibre, indiceParametro) => {
        const coeficiente = fila[columnaLibre].negar();
        if (!coeficiente.esCero()) terminos.push({ coeficiente, parametro: `t${indiceParametro + 1}` });
      });
      expresiones[columna] = terminos;
    });
    return { libres, expresiones };
  }

  global.GaussJordan = { reducir, parametrizar };
})(window);
