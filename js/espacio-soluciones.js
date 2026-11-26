(function (global) {
  const F = global.Fraccion;
  function crear(resultado, original, n) {
    const vacio = resultado.tipo === 'incompatible';
    const F = global.Fraccion;
    const libres = [];
    for (let j = 0; j < n; j++) {
      if (!resultado.columnasPivote.includes(j)) libres.push(j);
    }
    const origen = Array(n).fill(F.CERO);
    const base = libres.map(() => Array(n).fill(F.CERO));
    for (let k = 0; k < libres.length; k++) base[k][libres[k]] = F.UNO;
    for (let i = 0; i < resultado.columnasPivote.length; i++) {
      const columna = resultado.columnasPivote[i];
      origen[columna] = resultado.matriz[i][n];
      for (let k = 0; k < libres.length; k++) {
        base[k][columna] = resultado.matriz[i][libres[k]].negar();
      }
    }
    function evaluar(parametros) {
      if (vacio) throw new Error('El sistema no tiene un punto solución.');
      if (parametros.length !== libres.length) throw new Error('Faltan parámetros.');
      const punto = origen.map((v, j) => base.reduce((s, b, k) => s.sumar(b[j].multiplicar(parametros[k])), v));
      const comprobaciones = original.map(fila => ({ izquierda: fila.slice(0,n).reduce((s,v,j) => s.sumar(v.multiplicar(punto[j])), F.CERO), derecha: fila[n] }));
      return { punto, comprobaciones };
    }
    function proyectar(ejes) {
      if (!ejes.length || ejes.length > 3 || new Set(ejes).size !== ejes.length || ejes.some(i => !Number.isInteger(i) || i < 0 || i >= n)) throw new Error('Elige ejes distintos.');
      // Las filas independientes son una base exacta de la imagen proyectada.
      if (vacio) return { origen: [], base: [], dimension: -1 };
      if (!base.length) return { origen: ejes.map(i => origen[i]), base: [], dimension: 0 };
      const m = base.map(v => [...ejes.map(i => v[i]), F.CERO]);
      const reducida = global.GaussJordan.reducir(m, ejes.length);
      return { origen: ejes.map(i => origen[i]), base: reducida.matriz.slice(0, reducida.rangoCoeficientes).map(f => f.slice(0,ejes.length)), dimension: reducida.rangoCoeficientes };
    }
    return { n, tipo: resultado.tipo, original, libres: vacio ? [] : libres, origen, base, evaluar, proyectar };
  }
  function numero(v) {
    if (v.esCero()) return 0;
    const n = (v.n < 0n ? -v.n : v.n).toString(), d = v.d.toString();
    const x = Number(n.slice(0,15)) / Number(d.slice(0,15)) * 10 ** (Math.max(0,n.length-15) - Math.max(0,d.length-15)) * (v.n < 0n ? -1 : 1);
    if (!Number.isFinite(x) || x === 0 || Math.abs(x) > 1e100 || Math.abs(x) < 1e-100) throw new Error('La escala numérica excede el rango de esta gráfica. La solución exacta sigue disponible.');
    return x;
  }
  // Intersecciones con una caja común: todos los cálculos son racionales.
  // Solo se convierten a Number al proyectar los puntos sobre la pantalla.
  const comparar = (a,b) => { const d=a.n*b.d-b.n*a.d; return d<0n?-1:d>0n?1:0; };
  const producto = (a,b) => a.reduce((s,v,i)=>s.sumar(v.multiplicar(b[i])),F.CERO);
  function cortarEcuacion(coeficientes, termino, limite) {
    const n=coeficientes.length, L=F.desdeTexto(String(limite));
    if(n<1 || n>3 || comparar(L,F.CERO)<=0) throw new Error('La ventana requiere de uno a tres ejes y un límite positivo.');
    if(coeficientes.every(v=>v.esCero())) return {tipo:termino.esCero()?'todo':'vacio',puntos:[]};
    const vertices=Array.from({length:2**n},(_,i)=>Array.from({length:n},(_,j)=>(i>>j)&1?L:L.negar()));
    const puntos=[], claves=new Set();
    const agregar=p=>{const key=p.map(v=>v.aTexto()).join(';');if(!claves.has(key)){claves.add(key);puntos.push(p);}};
    for(let i=0;i<vertices.length;i++) for(let j=0;j<n;j++) {
      const k=i^(1<<j);if(k<i)continue;
      const a=vertices[i],b=vertices[k],da=producto(coeficientes,a).restar(termino),db=producto(coeficientes,b).restar(termino);
      if(da.esCero())agregar(a);if(db.esCero())agregar(b);
      if(comparar(da,F.CERO)*comparar(db,F.CERO)<0){
        const t=da.dividir(da.restar(db));
        agregar(a.map((v,c)=>v.sumar(b[c].restar(v).multiplicar(t))));
      }
    }
    return {tipo:n===3?'plano':n===2?'recta':'punto',puntos};
  }
  function cortarRecta(origen,direccion,limite) {
    const L=F.desdeTexto(String(limite));let minimo=null,maximo=null;
    for(let i=0;i<origen.length;i++){
      if(direccion[i].esCero()){if(comparar(origen[i],L)>0||comparar(origen[i],L.negar())<0)return [];continue;}
      let a=L.negar().restar(origen[i]).dividir(direccion[i]),b=L.restar(origen[i]).dividir(direccion[i]);
      if(comparar(a,b)>0)[a,b]=[b,a];
      if(minimo===null||comparar(a,minimo)>0)minimo=a;
      if(maximo===null||comparar(b,maximo)<0)maximo=b;
    }
    if(minimo===null||comparar(minimo,maximo)>0)return [];
    return [minimo,maximo].map(t=>origen.map((v,i)=>v.sumar(direccion[i].multiplicar(t))));
  }
  function cortarFamilia(imagen,limite) {
    const {origen,base,dimension}=imagen,L=F.desdeTexto(String(limite));
    if(dimension<0)return {tipo:'vacio',puntos:[]};
    if(!dimension)return {tipo:'punto',puntos:origen.every(v=>comparar(v,L)<=0&&comparar(v,L.negar())>=0)?[origen]:[]};
    if(dimension===origen.length)return {tipo:'todo',puntos:[]};
    if(dimension===1)return {tipo:'recta',puntos:cortarRecta(origen,base[0],limite)};
    const [a,b]=base;
    const normal=[a[1].multiplicar(b[2]).restar(a[2].multiplicar(b[1])),a[2].multiplicar(b[0]).restar(a[0].multiplicar(b[2])),a[0].multiplicar(b[1]).restar(a[1].multiplicar(b[0]))];
    return cortarEcuacion(normal,producto(normal,origen),limite);
  }
  global.EspacioSoluciones = { crear, numero, cortarEcuacion, cortarRecta, cortarFamilia };
})(window);
