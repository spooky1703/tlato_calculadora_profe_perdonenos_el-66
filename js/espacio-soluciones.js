(function (global) {
  const F = global.Fraccion;
  function crear(resultado, original, n) {
    if (resultado.tipo !== 'infinitas') throw new Error('Esta vista requiere infinitas soluciones.');
    const { libres, expresiones } = global.GaussJordan.parametrizar(resultado, n);
    const origen = expresiones.map(ts => ts.find(t => t.constante)?.coeficiente || F.CERO);
    const base = libres.map((_, k) => expresiones.map(ts => ts.find(t => t.parametro === `t${k + 1}`)?.coeficiente || F.CERO));
    function evaluar(parametros) {
      if (parametros.length !== libres.length) throw new Error('Faltan parámetros.');
      const punto = origen.map((v, j) => base.reduce((s, b, k) => s.sumar(b[j].multiplicar(parametros[k])), v));
      const comprobaciones = original.map(fila => ({ izquierda: fila.slice(0,n).reduce((s,v,j) => s.sumar(v.multiplicar(punto[j])), F.CERO), derecha: fila[n] }));
      return { punto, comprobaciones };
    }
    function proyectar(ejes) {
      if (!ejes.length || ejes.length > 3 || new Set(ejes).size !== ejes.length || ejes.some(i => !Number.isInteger(i) || i < 0 || i >= n)) throw new Error('Elige ejes distintos.');
      // Las filas independientes son una base exacta de la imagen proyectada.
      const m = base.map(v => [...ejes.map(i => v[i]), F.CERO]);
      const reducida = global.GaussJordan.reducir(m, ejes.length);
      return { origen: ejes.map(i => origen[i]), base: reducida.matriz.slice(0, reducida.rangoCoeficientes).map(f => f.slice(0,ejes.length)), dimension: reducida.rangoCoeficientes };
    }
    return { n, libres, origen, base, evaluar, proyectar };
  }
  function numero(v) {
    if (v.esCero()) return 0;
    const n = (v.n < 0n ? -v.n : v.n).toString(), d = v.d.toString();
    const x = Number(n.slice(0,15)) / Number(d.slice(0,15)) * 10 ** (Math.max(0,n.length-15) - Math.max(0,d.length-15)) * (v.n < 0n ? -1 : 1);
    if (!Number.isFinite(x) || x === 0 || Math.abs(x) > 1e100 || Math.abs(x) < 1e-100) throw new Error('La escala numérica excede el rango de esta gráfica. La solución exacta sigue disponible.');
    return x;
  }
  global.EspacioSoluciones = { crear, numero };
})(window);
