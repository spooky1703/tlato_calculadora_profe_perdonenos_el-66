(function (global) {
  const F = global.Fraccion;
  const cero = () => [F.CERO, F.CERO, F.CERO];
  const comparar = (a,b) => a.n*b.d < b.n*a.d ? -1 : a.n*b.d > b.n*a.d ? 1 : 0;
  function punto(a,b) {
    let suma = F.CERO;
    for (let i=0;i<3;i++) suma = suma.sumar(a[i].multiplicar(b[i]));
    return suma;
  }
  // u × v = (uy vz − uz vy, uz vx − ux vz, ux vy − uy vx).
  function cruz(u,v) {
    return [u[1].multiplicar(v[2]).restar(u[2].multiplicar(v[1])),
      u[2].multiplicar(v[0]).restar(u[0].multiplicar(v[2])),
      u[0].multiplicar(v[1]).restar(u[1].multiplicar(v[0]))];
  }
  function crear(original,n) {
    if (original.length > 3) throw new Error('no es posible graficar correctamente un espacio mayor a R3');
    const r = global.GaussJordan.reducir(original,n);
    const columnas = [];
    for (let j=0;j<n;j++) {
      const v=cero();
      for(let i=0;i<original.length;i++) v[i]=original[i][j];
      columnas.push(v);
    }
    const b=cero();
    for(let i=0;i<original.length;i++) b[i]=original[i][n];
    const base=r.columnasPivote.map(j=>columnas[j]);
    let normal=null, comprobacion=null;
    let pertenece=r.tipo!=='incompatible';
    if(base.length===2) {
      // Plano ax + by + cz + d = 0. Pasa por el origen, por eso d = 0.
      normal=cruz(base[0],base[1]);
      comprobacion=punto(normal,b);
      pertenece=comprobacion.esCero();
    }
    if(base.length===1) pertenece=cruz(base[0],b).every(v=>v.esCero());
    if(base.length===0) pertenece=b.every(v=>v.esCero());
    let coeficientes=null, camino=[];
    if(pertenece) {
      coeficientes=Array(n).fill(F.CERO);
      for(let i=0;i<r.columnasPivote.length;i++)coeficientes[r.columnasPivote[i]]=r.matriz[i][n];
      let inicio=cero();
      for(let j=0;j<n;j++) {
        const fin=inicio.map((x,i)=>x.sumar(coeficientes[j].multiplicar(columnas[j][i])));
        camino.push({inicio,fin,indice:j});inicio=fin;
      }
    }
    return {coeficientes,camino,columnas,b,base,normal,comprobacion,pertenece,dimension:base.length,ambiente:original.length,tipo:r.tipo,indices:r.columnasPivote};
  }
  function numero(v) {
    if(v.esCero()) return 0;
    const n=(v.n<0n?-v.n:v.n).toString(), d=v.d.toString();
    const x=Number(n.slice(0,15))/Number(d.slice(0,15))*10**(Math.max(0,n.length-15)-Math.max(0,d.length-15))*(v.n<0n?-1:1);
    if(!Number.isFinite(x)||x===0||Math.abs(x)<1e-100||Math.abs(x)>1e100) throw new Error('La escala numérica excede el rango de esta gráfica. El resultado exacto sigue disponible.');
    return x;
  }
  // Recortar dentro de un cubo sin cambiar la dirección ni la escala de los ejes.
  function extremo(v,limite) {
    const L=F.desdeTexto(String(limite));
    let max=F.CERO;
    for(const x of v) { const a=x.n<0n?x.negar():x;if(comparar(a,max)>0)max=a; }
    const fuera=comparar(max,L)>0;
    const factor=fuera?L.dividir(max):F.UNO;
    return {punto:v.map(x=>x.multiplicar(factor)),fuera};
  }
  function figura(modelo,limite) {
    const L=F.desdeTexto(String(limite));
    if(modelo.dimension===0) return [cero()];
    if(modelo.dimension===1) {
      const v=modelo.base[0];let max=F.CERO;
      for(const x of v){const a=x.n<0n?x.negar():x;if(comparar(a,max)>0)max=a;}
      const fin=v.map(x=>x.multiplicar(L.dividir(max)));
      return [fin.map(x=>x.negar()),fin];
    }
    const esquinas=Array.from({length:8},(_,k)=>[0,1,2].map(j=>(k>>j)&1?L:L.negar()));
    if(modelo.dimension===3) return esquinas;
    const puntos=[];
    function agregar(p){if(!puntos.some(q=>q.every((x,i)=>comparar(x,p[i])===0)))puntos.push(p);}
    // Cruce del plano n·p=0 con las doce aristas del cubo.
    for(let k=0;k<8;k++)for(let j=0;j<3;j++)if(!(k&(1<<j))) {
      const a=esquinas[k],b=esquinas[k|(1<<j)];
      const da=punto(modelo.normal,a),db=punto(modelo.normal,b);
      if(da.esCero())agregar(a);
      if(db.esCero())agregar(b);
      if(da.n*db.n<0n) {
        const t=da.dividir(da.restar(db));
        agregar(a.map((x,i)=>x.sumar(b[i].restar(x).multiplicar(t))));
      }
    }
    return puntos;
  }
  function escala(modelo,combinacion=false) {
    const vectores=[...modelo.columnas,modelo.b];
    if(combinacion)for(const paso of modelo.camino)vectores.push(paso.fin);
    let max=F.CERO;
    for(const v of vectores)for(const x of v){const a=x.n<0n?x.negar():x;if(comparar(a,max)>0)max=a;}
    if(max.esCero())return 1;
    const margen=numero(max.multiplicar(new F(6n,5n)));
    if(!Number.isFinite(margen)||margen<1e-100||margen>1e100)throw new Error('La magnitud excede la escala disponible para dibujar.');
    return Number(margen.toPrecision(12));
  }
  // Recorte de un segmento punta a cola: p(t)=a+t(b-a), 0≤t≤1.
  function segmento(a,b,limite) {
    const L=F.desdeTexto(String(limite));let menor=F.CERO,mayor=F.UNO;
    for(let i=0;i<3;i++) {
      const d=b[i].restar(a[i]);
      if(d.esCero()){if(comparar(a[i],L)>0||comparar(a[i],L.negar())<0)return [];continue;}
      let t1=L.negar().restar(a[i]).dividir(d),t2=L.restar(a[i]).dividir(d);
      if(comparar(t1,t2)>0)[t1,t2]=[t2,t1];
      if(comparar(t1,menor)>0)menor=t1;if(comparar(t2,mayor)<0)mayor=t2;
      if(comparar(menor,mayor)>0)return [];
    }
    return [menor,mayor].map(t=>a.map((x,i)=>x.sumar(b[i].restar(x).multiplicar(t))));
  }
  global.EspacioColumnas={crear,cruz,punto,numero,extremo,figura,escala,segmento};
})(window);
