(function (global) {
  function analizar(texto, filasEsperadas, columnasEsperadas) {
    if (!Number.isInteger(filasEsperadas) || filasEsperadas < 1 || filasEsperadas > global.fila_max ||
        !Number.isInteger(columnasEsperadas) || columnasEsperadas < 2 || columnasEsperadas > global.col_max) {
      throw new Error(`Indica las dimensiones: hasta ${global.fila_max} filas y ${global.col_max} columnas contando b.`);
    }
    const lineas = String(texto).trim().split(/\r?\n/);
    if (lineas.length !== filasEsperadas) throw new Error(`Esperas ${filasEsperadas} filas, pero hay ${lineas.length}. Revisa el recorte y el texto.`);
    return lineas.map((linea, i) => {
      let limpia = linea.trim().replace(/[−–—]/g, '-').replace(/π/g, 'pi');
      // Solo se retiran delimitadores exteriores de matriz, nunca caracteres dudosos dentro de un número.
      limpia = limpia.replace(/^[\[({]\s*/, '').replace(/\s*[\])}]$/, '');
      const barras = limpia.split('|');
      if (barras.length > 2) throw new Error(`Fila ${i + 1}: hay más de un separador de columna aumentada.`);
      const separar = s => s.includes(';') ? s.split(';').map(v => v.trim()) : s.trim().split(/\s+/);
      let valores;
      if (barras.length === 2) {
        const izquierda = separar(barras[0].trim());
        const derecha = separar(barras[1].trim());
        if (izquierda.length !== columnasEsperadas - 1 || derecha.length !== 1) throw new Error(`Fila ${i + 1}: la barra debe separar los coeficientes de un solo valor b.`);
        valores = [...izquierda, ...derecha];
      } else valores = separar(limpia);
      if (valores.length !== columnasEsperadas) throw new Error(`Fila ${i + 1}: se necesitan ${columnasEsperadas} valores; se encontraron ${valores.length}. No se rellenan ni se descartan casillas.`);
      valores.forEach((v, j) => {
        if (!v || !/^[+\-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:\/[+\-]?(?:\d+(?:[.,]\d+)?|[.,]\d+))?$/.test(v)) {
          throw new Error(`Fila ${i + 1}, columna ${j + 1}: «${v}» es ambiguo. Escribe un número o fracción, por ejemplo -2 o 1/2.`);
        }
        try { global.Fraccion.desdeTexto(v); }
        catch (e) { throw new Error(`Fila ${i + 1}, columna ${j + 1}: ${e.message}`); }
      });
      return valores;
    });
  }
  global.OCRMatriz = { analizar };
})(window);
