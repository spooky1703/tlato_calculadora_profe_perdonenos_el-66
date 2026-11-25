(function (global) {
  const F = global.Fraccion;
  // La importación conserva posiciones. Nunca inventa ceros ni elimina celdas erróneas.
  function texto(contenido) {
    const lineas = contenido.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
    while (lineas.length && !lineas[lineas.length - 1].trim()) lineas.pop();
    const primera = lineas.find(l => l.trim()) || '';
    const separador = primera.includes(';') ? ';' : primera.includes('\t') ? '\t' : primera.includes(',') ? ',' : null;
    return lineas.map(linea => {
      if (!linea.trim()) return [];
      if (!separador) return linea.trim().split(/\s+/);
      // CSV sencillo con comillas: una celda entre comillas conserva su contenido.
      const celdas = []; let campo = '', comillas = false, cerradas = false;
      for (let i = 0; i < linea.length; i++) {
        const letra = linea[i];
        if (letra === '"') {
          if (comillas && linea[i + 1] === '"') { campo += '"'; i++; }
          else if (comillas) { comillas = false; cerradas = true; }
          else {
            if (campo.trim() || cerradas) throw new Error('Hay comillas en una posición inválida. Revisa el archivo.');
            comillas = true;
          }
        } else if (letra === separador && !comillas) { celdas.push(campo); campo = ''; cerradas = false; }
        else {
          if (cerradas && letra.trim()) throw new Error('Hay texto después de una celda entre comillas. Revisa el separador.');
          campo += letra;
        }
      }
      if (comillas) throw new Error('Hay comillas sin cerrar. Revisa el archivo; cada fila debe ocupar una sola línea.');
      celdas.push(campo); return celdas;
    });
  }
  function preparar(datos, cuadrada = false, rechazadas = new Set()) {
    const filas = datos.slice();
    while (filas.length && filas[filas.length - 1].every(v => v == null || String(v).trim() === '')) filas.pop();
    if (!filas.length) throw new Error('El archivo está vacío.');
    if (filas.length > global.fila_max) throw new Error('El archivo supera el límite de filas.');
    const ancho = Math.max(...filas.map(f => f.length));
    if (filas.length > global.fila_max || ancho > global.col_max || ancho < (cuadrada ? 1 : 2)) {
      throw new Error(`Dimensiones no admitidas: ${filas.length} filas y ${ancho} columnas.`);
    }
    if (cuadrada && filas.length !== ancho) throw new Error('Inversa y determinante necesitan igual número de filas y columnas, sin columna aumentada.');
    const errores = [];
    const valores = filas.map((fila, i) => Array.from({ length: ancho }, (_, j) => {
      const crudo = fila[j];
      const valor = crudo == null ? '' : String(crudo).trim();
      let motivo = '';
      // Restricciones del importador: números y fracciones, no expresiones ni constantes.
      if (rechazadas.has(`${i},${j}`)) motivo = 'Usa un valor, no una fórmula ni un dato especial de Excel.';
      else if (!valor) motivo = 'Celda vacía.';
      else if (valor.length > 256) motivo = 'Valor demasiado largo.';
      else if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+|\d+\/[+-]?\d+)$/.test(valor)) motivo = 'Número o fracción no válidos.';
      else { try { F.desdeTexto(valor); } catch (e) { motivo = e.message; } }
      if (motivo) errores.push({ fila: i, columna: j, motivo });
      return valor;
    }));
    return { valores, errores };
  }
  async function leer(archivo, cuadrada) {
    if (archivo.size > 5 * 1024 * 1024) throw new Error('El archivo supera 5 MB. Guarda únicamente la matriz que quieres cargar.');
    const nombre = archivo.name.toLowerCase();
    if (/\.(txt|csv)$/.test(nombre)) return preparar(texto(await archivo.text()), cuadrada);
    if (!/\.(xlsx|xls)$/.test(nombre)) throw new Error('Usa un archivo TXT, CSV, XLSX o XLS.');
    if (!global.XLSX) throw new Error('No se pudo cargar el lector de Excel. Intenta de nuevo o usa TXT.');
    let libro;
    try { libro = global.XLSX.read(await archivo.arrayBuffer(), { type: 'array', cellDates: true, sheetRows: global.fila_max + 1 }); }
    catch { throw new Error('No se pudo abrir el archivo Excel. Comprueba que no esté dañado o protegido.'); }
    const hoja = libro.Sheets[libro.SheetNames[0]];
    if (!hoja || !hoja['!ref']) throw new Error('La primera hoja está vacía.');
    const rango = global.XLSX.utils.decode_range(hoja['!fullref'] || hoja['!ref']);
    if (rango.e.r >= global.fila_max || rango.e.c >= global.col_max) throw new Error('La primera hoja supera el límite de filas o columnas. Guarda solo la matriz desde A1.');
    if (hoja['!merges']?.length) throw new Error('Separa las celdas combinadas de Excel antes de cargar la matriz.');
    const rechazadas = new Set();
    const datos = Array.from({ length: rango.e.r + 1 }, (_, i) => Array.from({ length: rango.e.c + 1 }, (_, j) => {
      const celda = hoja[global.XLSX.utils.encode_cell({ r: i, c: j })];
      if (!celda) return '';
      if (celda.f || ['e', 'b', 'd'].includes(celda.t)) rechazadas.add(`${i},${j}`);
      // No usar el resultado guardado de una fórmula como si fuera un dato verificado.
      return celda.f ? `=${celda.f}` : celda.v ?? '';
    }));
    return preparar(datos, cuadrada, rechazadas);
  }
  function aviso(errores) {
    const primeras = errores.slice(0, 6).map(e => `fila ${e.fila + 1}, columna ${e.columna + 1}`);
    return `Matriz cargada. Corrige ${errores.length === 1 ? 'la celda roja' : `las ${errores.length} celdas rojas`}: ${primeras.join('; ')}${errores.length > 6 ? '; …' : ''}. Después podrás calcular.`;
  }
  global.ImportarMatriz = { texto, preparar, leer, aviso };
})(window);
