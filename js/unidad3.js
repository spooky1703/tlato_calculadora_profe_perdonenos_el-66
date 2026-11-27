(function (global) {
  const F = global.Fraccion;
  function productoPunto(u, v) {
    if (u.length !== v.length) throw new Error('Los vectores deben tener la misma dimensión.');
    let suma = F.CERO;
    for (let i = 0; i < u.length; i++) suma = suma.sumar(u[i].multiplicar(v[i]));
    return suma;
  }
  function analizar(vectores, completar = false) {
    const datos = completar ? global.Unidad2.completar(vectores) : global.Unidad2.analizar(vectores, null, 'base');
    const base = completar ? datos.baseCompleta : datos.base;
    const ortogonales = [];
    for (const vector of base) {
      let u = vector.slice();
      for (const anterior of ortogonales) {
        // u_k = v_k - suma ((v_k · u_j) / (u_j · u_j)) u_j
        const norma = productoPunto(anterior, anterior);
        if (norma.esCero()) throw new Error('No se puede proyectar sobre el vector cero.');
        const coef = productoPunto(vector, anterior).dividir(norma);
        u = u.map((valor, i) => valor.restar(coef.multiplicar(anterior[i])));
      }
      if (u.every(v => v.esCero())) throw new Error('La base perdió independencia durante el cálculo.');
      ortogonales.push(u);
    }
    const normasCuadradas = ortogonales.map(v => productoPunto(v, v));
    for (let i = 0; i < ortogonales.length; i++) {
      if (normasCuadradas[i].n <= 0n) throw new Error('No se puede normalizar un vector de norma cero.');
      for (let j = 0; j < i; j++) {
        if (!productoPunto(ortogonales[i], ortogonales[j]).esCero()) throw new Error('No se cumple la ortogonalidad.');
      }
    }
    // El vector unitario se conserva exactamente como u / sqrt(u·u).
    // Su norma al cuadrado es (u·u)/(u·u) = 1, sin redondeos.
    const unitarios = normasCuadradas.every(q => q.dividir(q).esUno());
    if (ortogonales.length !== base.length || !unitarios) throw new Error('La base no superó la comprobación final.');
    return {datos, ortogonales, normasCuadradas, dimension: base.length, unitarios};
  }
  // Raíz entera por Newton: no se prueban millones de divisores.
  function raizEntera(n) {
    if (n < 0n) throw new Error('La raíz requiere un valor no negativo.');
    if (n < 2n) return n;
    let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2));
    let y = (x + n / x) / 2n;
    while (y < x) { x = y; y = (x + n / x) / 2n; }
    return x;
  }
  global.Unidad3 = {analizar, productoPunto, raizEntera};
})(window);
