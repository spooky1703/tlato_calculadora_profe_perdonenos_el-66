(function (global) {
  const F = global.Fraccion;
  const G = global.GaussJordan;

  function analizar(vectores, gamma, actividad) {
    if (!['generado', 'li-ld', 'base'].includes(actividad)) throw new Error('Actividad no válida.');
    if (!Array.isArray(vectores) || !vectores.length || vectores.length >= global.col_max) throw new Error('Cantidad de vectores no válida.');
    const dimension = vectores[0].length;
    if (!dimension || dimension > global.fila_max || vectores.some(v => !Array.isArray(v) || v.length !== dimension)) throw new Error('Todos los vectores deben tener la misma dimensión.');
    if (actividad === 'generado' && (!Array.isArray(gamma) || gamma.length !== dimension)) throw new Error('γ debe tener la misma dimensión que los vectores.');

    const originales = vectores.map((v, j) => v.map((texto, i) => {
      try { return F.desdeTexto(texto); }
      catch (e) { throw new Error(`Vector α${j + 1}, componente ${i + 1}: ${e.message}`); }
    }));
    const objetivo = Array(dimension).fill(F.CERO);
    if (actividad === 'generado') {
      for (let i = 0; i < dimension; i++) {
        try { objetivo[i] = F.desdeTexto(gamma[i]); }
        catch (e) { throw new Error(`Vector γ, componente ${i + 1}: ${e.message}`); }
      }
    }

    // Cada vector es una columna. Para LI/LD y base usamos el sistema homogéneo.
    const matriz = [];
    for (let i = 0; i < dimension; i++) {
      matriz[i] = originales.map(v => v[i]);
      matriz[i].push(objetivo[i]);
    }
    const resultado = G.reducir(matriz, vectores.length);
    const indicesBase = resultado.columnasPivote;
    const libres = [];
    for (let j = 0; j < vectores.length; j++) {
      if (!indicesBase.includes(j)) libres.push(j);
    }

    // Elegir las variables libres en cero da una combinación particular de γ.
    let coeficientes = null;
    if (resultado.tipo !== 'incompatible') {
      coeficientes = Array(vectores.length).fill(F.CERO);
      for (let i = 0; i < indicesBase.length; i++) {
        coeficientes[indicesBase[i]] = resultado.matriz[i][vectores.length];
      }
    }
    return {
      resultado,
      pertenece: resultado.tipo !== 'incompatible',
      independientes: indicesBase.length === vectores.length,
      indicesBase,
      // Se eligen columnas de la matriz ORIGINAL, no de la reducida.
      base: indicesBase.map(j => originales[j]),
      originales,
      libres,
      coeficientes
    };
  }
  global.Unidad2 = { analizar };
})(window);
