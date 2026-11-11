(function (global) {
  'use strict';
  const F = global.Fraccion;

  function crear(original, n) {

    const resultado = global.GaussJordan.reducir(original, n);
    if (resultado.tipo !== 'infinitas') {
      throw new Error('Este archivo solo parametriza sistemas con infinitas soluciones.');
    }
    const { libres, expresiones } = global.GaussJordan.parametrizar(resultado, n);

    const nombres = libres.map(columna => `x${columna + 1}`);
    const origen = expresiones.map(terminos =>
      terminos.find(termino => termino.constante)?.coeficiente || F.CERO);
    const base = libres.map((_, k) => expresiones.map(terminos =>
      terminos.find(termino => termino.parametro === `t${k + 1}`)?.coeficiente || F.CERO));
    function expresion(i) {
      let texto = origen[i].esCero() ? '' : origen[i].aTexto();
      base.forEach((vector, k) => {
        const c = vector[i];
        if (c.esCero()) return;
        const negativo = c.n < 0n;
        const absoluto = negativo ? c.negar() : c;
        const termino = (absoluto.esUno() ? '' : `${absoluto.aTexto()}·`) + nombres[k];
        texto += (texto ? (negativo ? ' - ' : ' + ') : (negativo ? '-' : '')) + termino;
      });
      return texto || '0';
    }
    const componentes = Array.from({ length: n }, (_, i) => expresion(i));
    const vectorTexto = vector => `(${vector.map(v => v.aTexto()).join(', ')})`;

    original.forEach(fila => {
      const producto = vector => vector.reduce((s, v, j) => s.sumar(fila[j].multiplicar(v)), F.CERO);
      if (!producto(origen).restar(fila[n]).esCero() || base.some(v => !producto(v).esCero())) {
        throw new Error('La parametrización no satisface el sistema original.');
      }
    });

    function evaluar(valores) {
      if (!Array.isArray(valores) || valores.length !== libres.length ||
          valores.some(v => !(v instanceof F))) {
        throw new Error(`Introduce ${libres.length} parámetros de tipo Fraccion.`);
      }
      return origen.map((v, j) => base.reduce((s, direccion, k) =>
        s.sumar(direccion[j].multiplicar(valores[k])), v));
    }

    return {
      libres, parametros: nombres, origen, base,
      despejes: componentes.map((texto, i) => `x${i + 1} = ${texto}`),
      tupla: `(${componentes.join(', ')})`,
      formaVectorial: vectorTexto(origen) + base.map((v, k) => ` + ${nombres[k]}·${vectorTexto(v)}`).join(''),
      dominio: `${nombres.join(', ')} ∈ ℝ`,
      evaluar
    };
  }
  global.ParametrizacionCuaderno = { crear };
})(window);
