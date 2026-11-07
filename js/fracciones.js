(function (global) {
  function mcd(a, b) {
    a = a < 0n ? -a : a; b = b < 0n ? -b : b;
    while (b !== 0n) { const resto = a % b; a = b; b = resto; }
    return a;
  }

  class Fraccion {
    constructor(numerador, denominador = 1n) {
      let n = BigInt(numerador), d = BigInt(denominador);
      if (d === 0n) throw new Error('El denominador no puede ser cero.');
      if (d < 0n) { n = -n; d = -d; }
      const divisor = mcd(n, d) || 1n;
      this.n = n / divisor;
      this.d = d / divisor;
    }
    static desdeTexto(texto) {
      const valor = String(texto).trim().replace(/−/g, '-').replace(/,/g, '.');
      if (!valor) throw new Error('La celda está vacía.');
      if (/^[+-]?\d+\s*\/\s*[+-]?\d+$/.test(valor)) {
        const [n, d] = valor.split('/').map(x => x.trim());
        return new Fraccion(BigInt(n), BigInt(d));
      }
      if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(valor)) {
        const negativo = valor.startsWith('-');
        const limpio = valor.replace(/^[+-]/, '');
        const partes = limpio.split('.');
        const decimales = partes[1] || '';
        const denominador = 10n ** BigInt(decimales.length);
        const numerador = BigInt((partes[0] || '0') + decimales);
        return new Fraccion(negativo ? -numerador : numerador, denominador);
      }
      throw new Error('Usa un entero, decimal o fracción válida. No se admiten letras.');
    }
    sumar(otra) { return new Fraccion(this.n * otra.d + otra.n * this.d, this.d * otra.d); }
    restar(otra) { return new Fraccion(this.n * otra.d - otra.n * this.d, this.d * otra.d); }
    multiplicar(otra) { return new Fraccion(this.n * otra.n, this.d * otra.d); }
    dividir(otra) {
      if (otra.n === 0n) throw new Error('No se puede dividir entre cero.');
      return new Fraccion(this.n * otra.d, this.d * otra.n);
    }
    negar() { return new Fraccion(-this.n, this.d); }
    esCero() { return this.n === 0n; }
    esUno() { return this.n === this.d; }
    esMenosUno() { return this.n === -this.d; }
    aTexto() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
  }
  Fraccion.CERO = new Fraccion(0n);
  Fraccion.UNO = new Fraccion(1n);
  global.Fraccion = Fraccion;
})(window);
