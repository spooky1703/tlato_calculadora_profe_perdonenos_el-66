(function (global) {
  const F = global.Fraccion;
  const copiar = matriz => matriz.map(fila => fila.slice());
  function generar(original, n) {
    const pasos = [], columnasLibres = [];
    let notas = [];
    // La práctica usa el mismo recorrido que la calculadora; solo agrega pistas.
    const resultado = global.GaussJordan.reducir(original, n, null, (op, anterior, siguiente, col, etapa) => {
      const columna = col === n ? 'b' : String(col + 1);
      let operacion, objetivo;
      if (op.tipo === 'intercambio') {
        operacion = op;
        objetivo = `Busca un pivote no nulo en la columna ${columna} y llévalo a la fila ${op.fila + 1}. Usa la primera fila inferior disponible.`;
      } else if (op.tipo === 'dividir') {
        operacion = { tipo: 'escala', fila: op.fila, factor: F.UNO.dividir(F.desdeTexto(op.factor)) };
        objetivo = `Haz 1 el pivote de la fila ${op.fila + 1}, columna ${columna}.`;
      } else {
        operacion = { tipo: 'suma', fila: op.fila, otra: op.otra, factor: F.desdeTexto(op.factor).negar() };
        objetivo = `Usa la fila pivote ${op.otra + 1} para hacer cero la casilla de la fila ${op.fila + 1}, columna ${columna}.`;
      }
      pasos.push({ anterior, siguiente, operacion, objetivo, etapa, notas: notas.slice() });
      notas = [];
    }, col => {
      if (col < n) {
        columnasLibres.push(col);
        notas.push(`La columna ${col + 1} no tiene pivote disponible; se continúa con la siguiente.`);
      }
    });
    return { original: copiar(original), pasos, final: copiar(resultado.matriz), resultado, columnasLibres };
  }

  function describir(op) {
    if (op.tipo === 'intercambio') return `R${op.fila + 1} ↔ R${op.otra + 1}`;
    if (op.tipo === 'escala') return `R${op.fila + 1} ← (${op.factor.aTexto()}) R${op.fila + 1}`;
    const negativo = op.factor.n < 0n, factor = negativo ? op.factor.negar() : op.factor;
    return `R${op.fila + 1} ← R${op.fila + 1} ${negativo ? '−' : '+'} ${factor.esUno() ? '' : `(${factor.aTexto()}) `}R${op.otra + 1}`;
  }
  function sesion(plan) {
    let indice = 0, errores = 0, erroresDelPaso = 0, resuelto = false;
    const intentos = [], pistas = new Set();
    return {
      plan,
      get indice() { return indice; }, get errores() { return errores; }, get pistas() { return pistas.size; },
      get correcto() { return resuelto; }, get terminada() { return indice >= plan.pasos.length; },
      get nota() { return plan.pasos.length ? 10 * plan.pasos.length / (plan.pasos.length + errores + pistas.size) : null; },
      get intentos() { return intentos.slice(); },
      pedirPista() {
        if (indice >= plan.pasos.length || resuelto || pistas.has(indice)) return false;
        pistas.add(indice); return true;
      },
      verificar(textos) {
        if (indice >= plan.pasos.length || resuelto) return { estado: 'bloqueado' };
        const esperado = plan.pasos[indice].siguiente;
        if (textos.length !== esperado.length || textos.some((f,i) => f.length !== esperado[i].length)) throw new Error('La matriz debe conservar sus dimensiones.');
        const invalidas = [], incorrectas = [];
        textos.forEach((f,i) => f.forEach((valor,j) => {
          try {
            if (F.contieneConstantes(valor)) throw new Error('En práctica usa valores racionales, sin π ni Euler.');
            const v = F.desdeTexto(valor);
            if (!v.restar(esperado[i][j]).esCero()) incorrectas.push([i,j]);
          } catch (error) { invalidas.push({ fila: i, columna: j, mensaje: error.message }); }
        }));
        if (invalidas.length) return { estado: 'invalida', invalidas };
        if (incorrectas.length) { errores++; erroresDelPaso++; return { estado: 'incorrecta', incorrectas }; }
        intentos.push({ paso: indice, errores: erroresDelPaso, pista: pistas.has(indice) }); resuelto = true;
        return { estado: 'correcta', operacion: describir(plan.pasos[indice].operacion) };
      },
      avanzar() { if (!resuelto) return false; indice++; erroresDelPaso = 0; resuelto = false; return true; }
    };
  }
  global.PracticaModelo = { generar, describir, sesion };
})(window);
