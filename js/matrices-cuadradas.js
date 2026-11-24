(function () {
  const F = window.Fraccion;
  const tabla = document.getElementById('tabla-cuadrada');
  const resultado = document.getElementById('resultado-cuadrada');
  const error = document.getElementById('error-cuadrada');
  let modo = 'inversa';
  let valores = Array.from({ length: 3 }, () => Array(3).fill('0'));
  const limite = Math.min(window.fila_max, window.col_max);

  function limpiarResultado() { resultado.hidden = true; error.hidden = true; }
  function dibujar() {
    tabla.replaceChildren();
    document.getElementById('agregar-cuadrada').disabled = valores.length >= limite;
    document.getElementById('quitar-cuadrada').disabled = valores.length <= 1;
    document.getElementById('dimensiones-cuadrada').textContent = `${valores.length} filas · ${valores.length} columnas`;
    document.getElementById('panel-cuadrada').style.setProperty('--orden-cuadrada', valores.length);
    valores.forEach((fila, i) => {
      const tr = tabla.insertRow();
      fila.forEach((valor, j) => {
        const input = document.createElement('input');
        input.type = 'text'; input.value = valor; input.className = 'celda';
        input.setAttribute('aria-label', `Fila ${i + 1}, columna ${j + 1}`);
        input.autocomplete = 'off'; input.spellcheck = false; input.maxLength = 256;
        const campo = document.createElement('div'); campo.className = 'campo-cuadrada';
        const vista = document.createElement('span'); vista.className = 'vista-cuadrada';
        vista.setAttribute('aria-hidden', 'true');
        function actualizarVista() {
          vista.replaceChildren(); campo.classList.remove('con-vista');
          input.removeAttribute('aria-invalid');
          try {
            vista.append(window.FormatoMatematico.expresion(input.value));
            campo.classList.add('con-vista');
          } catch { input.setAttribute('aria-invalid', 'true'); }
        }
        input.oninput = () => {
          valores[i][j] = input.value; limpiarResultado();
          campo.classList.remove('con-vista'); input.removeAttribute('aria-invalid');
        };
        input.onblur = actualizarVista;
        input.addEventListener('beforeinput', e => { if (/\s/.test(e.data || '')) e.preventDefault(); });
        input.addEventListener('paste', e => { if (/\s/.test(e.clipboardData.getData('text'))) e.preventDefault(); });
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const entradas = tabla.querySelectorAll('input');
            entradas[(i * valores.length + j + 1) % entradas.length].focus();
          }
        });
        campo.append(input, vista); tr.insertCell().append(campo);
        actualizarVista();
      });
    });
  }
  function cambiarTamano(cambio) {
    const n = valores.length + cambio;
    if (n < 1 || n > limite) return;
    if (cambio < 0 && valores.some((f, i) => f.some((v, j) => (i >= n || j >= n) && v !== '0' && v !== '')) && !confirm('Se quitarán la última fila y la última columna con sus valores. ¿Continuar?')) return;
    valores = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => valores[i]?.[j] ?? '0'));
    limpiarResultado(); dibujar();
  }
  document.getElementById('agregar-cuadrada').onclick = () => cambiarTamano(1);
  document.getElementById('quitar-cuadrada').onclick = () => cambiarTamano(-1);
  function mostrarMatriz(matriz) {
    const contenedor = document.createElement('div');
    contenedor.className = 'desplazamiento-matriz';
    const tablaResultado = document.createElement('table');
    const marco = document.createElement('div'); marco.className = 'marco-cuadrada';
    for (const fila of matriz) {
      const tr = tablaResultado.insertRow();
      for (const valor of fila) {
        const td = tr.insertCell(); td.append(window.FormatoMatematico.fraccion(valor)); td.style.padding = '.5rem 1rem';
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
        titulo.append(document.createTextNode('Determinante = '), window.FormatoMatematico.fraccion(r.valor));
      }
      resultado.hidden = false;
    } catch (e) { error.textContent = e.message; error.hidden = false; }
  };
  document.getElementById('limpiar-cuadrada').onclick = () => {
    valores = Array.from({ length: 3 }, () => Array(3).fill('0'));
    limpiarResultado(); dibujar();
  };
  window.MatricesCuadradas = { cambiarModo(nuevo) {
    modo = nuevo; limpiarResultado();
    document.getElementById('titulo-cuadrada').textContent = modo === 'inversa' ? 'Inversa' : 'Determinante';
    document.getElementById('calcular-cuadrada').textContent = modo === 'inversa' ? 'Calcular inversa' : 'Calcular determinante';
  } };
  dibujar();
})();
