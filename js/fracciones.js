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
      return interpretar(texto);
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
  // Analizador cerrado: nunca ejecuta código ingresado por el usuario.
  function interpretar(texto) {
    const valor = String(texto).trim().toLowerCase().replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/euler/g, 'e').replace(/π/g, 'pi').replace(/,/g, '.');
    if (!valor) throw new Error('La celda está vacía. Escribe 0 si no hay coeficiente.');
    if (valor.length > 256) throw new Error('Usa expresiones de hasta 256 caracteres.');
    const tokens = valor.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|pi|e|[()+*/^−-]/g) || [];
    if (tokens.join('') !== valor.replace(/\s/g, '')) throw new Error('Usa números, pi, e, paréntesis y + − * / ^. No se admiten variables ni funciones.');
    let i = 0;
    function controlar(v) {
      if (v.n.toString().length > 2000 || v.d.toString().length > 2000) throw new Error('La expresión es demasiado grande.');
      return v;
    }
    function numero(t) {
      const [mantisa, exponente = '0'] = t.split('e');
      const exp = Number(exponente);
      if (Math.abs(exp) > 100) throw new Error('El exponente científico debe estar entre −100 y 100.');
      const [entero, decimal = ''] = mantisa.split('.');
      const n = BigInt((entero || '0') + decimal);
      const escala = decimal.length - exp;
      return escala >= 0 ? new Fraccion(n, 10n ** BigInt(escala)) : new Fraccion(n * 10n ** BigInt(-escala));
    }
    function primario() {
      const t = tokens[i++];
      if (t === '(') {
        const v = suma();
        if (tokens[i++] !== ')') throw new Error('Falta cerrar un paréntesis.');
        return v;
      }
      if (t === 'pi') return numero('3.1415926535897932384626433832795028841971');
      if (t === 'e') return numero('2.7182818284590452353602874713526624977572');
      if (t && /^\d|^\./.test(t)) return numero(t);
      throw new Error('Falta un número o un paréntesis.');
    }
    function potencia() {
      let v = primario();
      if (tokens[i] === '^') {
        i++; const exp = unario();
        if (exp.d !== 1n || exp.n < -100n || exp.n > 100n) throw new Error('Usa potencias enteras entre −100 y 100.');
        if (v.esCero() && exp.n <= 0n) throw new Error('La potencia de cero no está definida para ese exponente.');
        const n = exp.n < 0n ? -exp.n : exp.n;
        v = controlar(exp.n < 0n ? new Fraccion(v.d ** n, v.n ** n) : new Fraccion(v.n ** n, v.d ** n));
      }
      return v;
    }
    function unario() {
      if (tokens[i] === '+') { i++; return unario(); }
      if (tokens[i] === '-') { i++; return unario().negar(); }
      return potencia();
    }
    function producto() {
      let v = unario();
      while (tokens[i] === '*' || tokens[i] === '/' || tokens[i] === '(' || tokens[i] === 'pi' || tokens[i] === 'e') {
        const op = tokens[i];
        if (op === '*' || op === '/') i++;
        const otro = unario();
        v = controlar(op === '/' ? v.dividir(otro) : v.multiplicar(otro));
      }
      return v;
    }
    function suma() {
      let v = producto();
      while (tokens[i] === '+' || tokens[i] === '-') {
        const op = tokens[i++], otro = producto();
        v = controlar(op === '+' ? v.sumar(otro) : v.restar(otro));
      }
      return v;
    }
    const resultado = suma();
    if (i !== tokens.length) throw new Error('Revisa los operadores y los paréntesis.');
    return resultado;
  }
  Fraccion.contieneConstantes = texto => /pi|π|(^|[^0-9.])e(?![+-]?\d)/i.test(String(texto));
  Fraccion.CERO = new Fraccion(0n);
  Fraccion.UNO = new Fraccion(1n);
  global.Fraccion = Fraccion;
})(window);
