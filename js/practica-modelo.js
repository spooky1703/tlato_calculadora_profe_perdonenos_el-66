(function (global) {
  const F = global.Fraccion;
  const copiar = matriz => matriz.map(fila => fila.slice());
  function generar(original, n) {
    const resultado = global.GaussJordan.reducir(original, n);
    const matriz = copiar(original), pasos = [], pivotes = [], columnasLibres = [];
    let fila = 0, notas = [];
    function registrar(operacion, objetivo, etapa, ejecutar) {
      const anterior = copiar(matriz);
      ejecutar();
      pasos.push({ anterior, siguiente: copiar(matriz), operacion, objetivo, etapa, notas: notas.slice() });
      notas = [];
    }
    // Incluir b permite terminar también los sistemas incompatibles en RREF.
    for (let col = 0; col <= n && fila < matriz.length; col++) {
      let candidata = fila;
      while (candidata < matriz.length && matriz[candidata][col].esCero()) candidata++;
      if (candidata === matriz.length) {
        if (col < n) { columnasLibres.push(col); notas.push(`La columna ${col + 1} no tiene pivote disponible; se continúa con la siguiente.`); }
        continue;
      }
      const actual = fila;
      const nombreColumna = col === n ? 'b' : String(col + 1);
      if (candidata !== actual) {
        const otra = candidata;
        registrar({ tipo: 'intercambio', fila: actual, otra }, `Busca un pivote no nulo en la columna ${nombreColumna} y llévalo a la fila ${actual + 1}. Usa la primera fila inferior disponible.`, 'Buscar pivote', () => {
          [matriz[actual],matriz[otra]] = [matriz[otra],matriz[actual]];
        });
      }
      const pivote = matriz[actual][col];
      if (!pivote.esUno()) {
        const factor = F.UNO.dividir(pivote);
        registrar({ tipo: 'escala', fila: actual, factor }, `Haz 1 el pivote de la fila ${actual + 1}, columna ${nombreColumna}.`, 'Normalizar pivote', () => {
          matriz[actual] = matriz[actual].map(v => v.multiplicar(factor));
        });
      }
      for (let i = actual + 1; i < matriz.length; i++) {
        const factor = matriz[i][col].negar();
        if (factor.esCero()) continue;
        registrar({ tipo: 'suma', fila: i, otra: actual, factor }, `Usa la fila pivote ${actual + 1} para hacer cero la casilla de la fila ${i + 1}, columna ${nombreColumna}.`, 'Ceros debajo', () => {
          matriz[i] = matriz[i].map((v,j) => v.sumar(factor.multiplicar(matriz[actual][j])));
        });
      }
      pivotes.push({ fila: actual, col }); fila++;
    }
    // Orden solicitado: eliminar arriba por columnas pivote, de izquierda a derecha.
    for (const { fila: pivote, col } of pivotes) {
      for (let i = 0; i < pivote; i++) {
        const factor = matriz[i][col].negar();
        if (factor.esCero()) continue;
        registrar({ tipo: 'suma', fila: i, otra: pivote, factor }, `Usa la fila pivote ${pivote + 1} para hacer cero la casilla de la fila ${i + 1}, columna ${col === n ? 'b' : col + 1}.`, 'Ceros encima', () => {
          matriz[i] = matriz[i].map((v,j) => v.sumar(factor.multiplicar(matriz[pivote][j])));
        });
      }
    }
    return { original: copiar(original), pasos, final: copiar(matriz), resultado, columnasLibres };
  }
  function describir(op) {
    if (op.tipo === 'intercambio') return `F${op.fila + 1} ↔ F${op.otra + 1}`;
    if (op.tipo === 'escala') return `(${op.factor.aTexto()}) F${op.fila + 1} → F${op.fila + 1}`;
    const negativo = op.factor.n < 0n, factor = negativo ? op.factor.negar() : op.factor;
    return `F${op.fila + 1} ${negativo ? '−' : '+'} ${factor.esUno() ? '' : `(${factor.aTexto()}) `}F${op.otra + 1} → F${op.fila + 1}`;
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
