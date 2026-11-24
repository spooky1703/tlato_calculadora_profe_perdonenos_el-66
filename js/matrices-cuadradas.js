(function () {
  const F = window.Fraccion;
  const tabla = document.getElementById('tabla-cuadrada');
  const resultado = document.getElementById('resultado-cuadrada');
  const error = document.getElementById('error-cuadrada');
  const orden = document.getElementById('orden-cuadrada');
  let modo = 'inversa';
  let valores = Array.from({ length: 3 }, () => Array(3).fill('0'));
  const limite = Math.min(window.fila_max, window.col_max);
  orden.max = limite;

  function limpiarResultado() { resultado.hidden = true; error.hidden = true; }
  function dibujar() {
    tabla.replaceChildren();
    document.getElementById('dimensiones-cuadrada').textContent = `${valores.length} filas · ${valores.length} columnas`;
    document.getElementById('panel-cuadrada').style.setProperty('--orden-cuadrada', valores.length);
    valores.forEach((fila, i) => {
      const tr = tabla.insertRow();
      fila.forEach((valor, j) => {
        const input = document.createElement('input');
        input.type = 'text'; input.value = valor; input.className = 'celda';
        input.setAttribute('aria-label', `Fila ${i + 1}, columna ${j + 1}`);
        input.autocomplete = 'off'; input.spellcheck = false;
        input.oninput = () => { valores[i][j] = input.value; limpiarResultado(); };
        tr.insertCell().append(input);
      });
    });
  }
  document.getElementById('cambiar-orden-cuadrada').onclick = () => {
    const n = Number(orden.value);
    if (!Number.isInteger(n) || n < 1 || n > limite) {
      error.textContent = `El tamaño debe ser un entero entre 1 y ${limite}.`; error.hidden = false; return;
    }
    if (n < valores.length && valores.some((f, i) => f.some((v, j) => (i >= n || j >= n) && v !== '0' && v !== '')) && !confirm('Al reducir el tamaño se quitarán las últimas filas y columnas. ¿Continuar?')) return;
    valores = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => valores[i]?.[j] ?? '0'));
    limpiarResultado(); dibujar();
  };
  function mostrarMatriz(matriz) {
    const contenedor = document.createElement('div');
    contenedor.className = 'desplazamiento-matriz';
    const tablaResultado = document.createElement('table');
    const marco = document.createElement('div'); marco.className = 'marco-cuadrada';
    for (const fila of matriz) {
      const tr = tablaResultado.insertRow();
      for (const valor of fila) {
        const td = tr.insertCell(); td.textContent = valor.aTexto(); td.style.padding = '.5rem 1rem';
      }
    }
    marco.append(tablaResultado); contenedor.append(marco); resultado.append(contenedor);
  }
  document.getElementById('calcular-cuadrada').onclick = () => {
    limpiarResultado(); resultado.replaceChildren();
    try {
      const matriz = valores.map((fila, i) => fila.map((v, j) => {
        try { return F.desdeTexto(v); }
        catch (e) { throw new Error(`Fila ${i + 1}, columna ${j + 1}: ${e.message}`); }
      }));
      const titulo = document.createElement('h3');
      resultado.append(titulo);
      // Un modo elige la operación; todo el cálculo está en gauss-jordan.js.
      if (modo === 'inversa') {
        const r = window.GaussJordan.inversa(matriz);
        titulo.textContent = r.existe ? 'Matriz inversa' : 'Esta matriz no tiene inversa.';
        if (r.existe) mostrarMatriz(r.inversa);
      } else {
        const r = window.GaussJordan.determinante(matriz);
        titulo.textContent = `Determinante = ${r.valor.aTexto()}`;
      }
      resultado.hidden = false;
    } catch (e) { error.textContent = e.message; error.hidden = false; }
  };
  document.getElementById('limpiar-cuadrada').onclick = () => {
    valores = Array.from({ length: 3 }, () => Array(3).fill('0'));
    orden.value = '3'; limpiarResultado(); dibujar();
  };
  window.MatricesCuadradas = { cambiarModo(nuevo) {
    modo = nuevo; limpiarResultado();
    document.getElementById('titulo-cuadrada').textContent = modo === 'inversa' ? 'Inversa' : 'Determinante';
    document.getElementById('calcular-cuadrada').textContent = modo === 'inversa' ? 'Calcular inversa' : 'Calcular determinante';
  } };
  dibujar();
})();
