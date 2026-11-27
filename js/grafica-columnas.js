(function(global) {
  const E=global.EspacioColumnas, $=id=>document.getElementById(id);
  const modal=$('modal-columnas'),canvas=$('grafica-columnas'),ctx=canvas.getContext('2d');
  const colores=['#8747a0','#ae601b','#285b40','#606875'];
  let modelo=null,limite=5,azimut=-2.18,elevacion=-.38,arrastre=null;
  const numero=v=>v.map(E.numero);
  const sub=n=>String(n).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
  const corto=n=>Number(n.toPrecision(4)).toString();
  let etiquetas=[];
  function proyectar(v) {
    const a=v[0]*Math.cos(azimut)-v[1]*Math.sin(azimut);
    const b=v[0]*Math.sin(azimut)+v[1]*Math.cos(azimut);
    return [canvas.width/2+a*unidad(),canvas.height/2+(b*Math.sin(elevacion)-v[2]*Math.cos(elevacion))*unidad()];
  }
  function unidad(){return Math.min(canvas.width,canvas.height)*.28/limite;}
  function linea(a,b,color,ancho=1) {
    const p=proyectar(a),q=proyectar(b);ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.strokeStyle=color;ctx.lineWidth=ancho;ctx.stroke();
  }
  function rotulo(v,texto,color) {etiquetas.push({p:proyectar(v),texto,color});}
  function dibujarEtiquetas() {
    const cajas=[];ctx.font='14px system-ui';
    for(const {p,texto,color} of etiquetas) {
      const w=ctx.measureText(texto).width+12,h=24;
      let x=0,y=0;
      for(let intento=0;intento<36;intento++) {
        const angulo=intento*Math.PI/4,distancia=14+Math.floor(intento/8)*24;
        x=Math.max(4,Math.min(canvas.width-w-4,p[0]+Math.cos(angulo)*distancia));
        y=Math.max(48,Math.min(canvas.height-h-4,p[1]+Math.sin(angulo)*distancia-h));
        if(!cajas.some(c=>x<c.x+c.w+3&&x+w+3>c.x&&y<c.y+c.h+3&&y+h+3>c.y))break;
      }
      cajas.push({x,y,w,h});
      ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(x+w/2,y+h/2);ctx.strokeStyle=color+'80';ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.88)';ctx.fillRect(x,y,w,h);
      ctx.fillStyle=color;ctx.fillText(texto,x+6,y+17);
    }
  }
  function flecha(v,color,nombre) {
    const recorte=E.extremo(v,limite),fin=numero(recorte.punto);
    linea([0,0,0],fin,color,3);
    const p=proyectar([0,0,0]),q=proyectar(fin),angulo=Math.atan2(q[1]-p[1],q[0]-p[0]);
    if(Math.hypot(q[0]-p[0],q[1]-p[1])>2) {
      ctx.beginPath();ctx.moveTo(...q);ctx.lineTo(q[0]-10*Math.cos(angulo-.4),q[1]-10*Math.sin(angulo-.4));ctx.lineTo(q[0]-10*Math.cos(angulo+.4),q[1]-10*Math.sin(angulo+.4));ctx.closePath();ctx.fillStyle=color;ctx.fill();
    }
    if(nombre==='b'){ctx.beginPath();ctx.arc(...q,6,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();}
    rotulo(fin,nombre+(recorte.fuera?' ↗':''),color);
    return recorte.fuera;
  }
  function dibujar() {
    try { dibujarContenido(); } catch(e) { informarError(e); }
  }
  function informarError(e) {
    if(modal.open)modal.close();
    arrastre=null;
    $('error-grafica').textContent=e.message;$('error-grafica').hidden=false;
  }
  function ajustarEscala() {
    try { limite=E.escala(modelo,$('ver-combinacion').checked);dibujar(); } catch(e) { informarError(e); }
  }
  function dibujarContenido() {
    if(!modelo||!modal.open)return;
    canvas.width=Math.max(280,Math.round(canvas.getBoundingClientRect().width));canvas.height=420;
    ctx.clearRect(0,0,canvas.width,canvas.height);etiquetas=[];
    const pts=E.figura(modelo,limite).map(numero);
    if(modelo.dimension===2) {
      // Ordenar el contorno proyectado para rellenar un único plano.
      const pantalla=pts.map(proyectar),cx=pantalla.reduce((s,p)=>s+p[0],0)/pantalla.length,cy=pantalla.reduce((s,p)=>s+p[1],0)/pantalla.length;
      pantalla.sort((a,b)=>Math.atan2(a[1]-cy,a[0]-cx)-Math.atan2(b[1]-cy,b[0]-cx));
      ctx.beginPath();pantalla.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle='#389b8a25';ctx.fill();ctx.strokeStyle='#278777';ctx.lineWidth=2;ctx.stroke();
    }
    // El borde gris solo delimita la ventana; no representa el espacio generado.
    const caja=Array.from({length:8},(_,k)=>[0,1,2].map(j=>(k>>j)&1?limite:-limite));
    for(let i=0;i<8;i++)for(let j=0;j<3;j++)if(!(i&(1<<j)))linea(caja[i],caja[i|(1<<j)],'#9ca6ad70',1);
    if(modelo.dimension===1)linea(pts[0],pts[1],'#278777',7);
    for(let i=0;i<3;i++) {
      const a=[0,0,0],b=[0,0,0];a[i]=-limite;b[i]=limite;
      linea(a,b,'#78909e',1);rotulo(b,['x','y','z'][i]+' '+corto(limite),'#334b61');rotulo(a,corto(-limite),'#667b8c');
    }
    const origen=proyectar([0,0,0]);ctx.beginPath();ctx.arc(...origen,modelo.dimension===0?6:3,0,Math.PI*2);ctx.fillStyle=modelo.dimension===0?'#278777':'#78909e';ctx.fill();
    let fuera=false;
    if($('ver-combinacion').checked&&modelo.pertenece) {
      for(const paso of modelo.camino) {
        if(modelo.coeficientes[paso.indice].esCero())continue;
        const recorte=E.segmento(paso.inicio,paso.fin,limite);
        if(E.extremo(paso.fin,limite).fuera)fuera=true;
        if(recorte.length) {
          ctx.setLineDash([6,5]);linea(numero(recorte[0]),numero(recorte[1]),colores[paso.indice%colores.length],3);ctx.setLineDash([]);
          const fin=numero(recorte[1]),q=proyectar(fin);ctx.beginPath();ctx.arc(...q,3,0,Math.PI*2);ctx.fillStyle=colores[paso.indice%colores.length];ctx.fill();
          rotulo(fin,`α${sub(paso.indice+1)}𝛾${sub(paso.indice+1)}`,colores[paso.indice%colores.length]);
        }
      }
    }
    if($('ver-columnas').checked)modelo.columnas.forEach((v,j)=>{fuera=flecha(v,colores[j%colores.length],`𝛾${sub(j+1)}`)||fuera;});
    fuera=flecha(modelo.b,modelo.pertenece?'#145da0':'#c23838','b')||fuera;
    dibujarEtiquetas();
    $('recorte-columnas').hidden=!fuera;
    $('escala-columnas').textContent=`−${corto(limite)} a ${corto(limite)}`;
  }
  function vectorTexto(padre,v) {
    padre.append('(');v.forEach((x,i)=>{if(i)padre.append(', ');padre.append(global.FormatoMatematico.fraccion(x));});padre.append(')');
  }
  function abrir() {
    if(!modelo)return;
    $('ver-combinacion').checked=false;$('control-combinacion').hidden=!modelo.pertenece;
    limite=E.escala(modelo);azimut=-2.18;elevacion=-.38;$('ver-columnas').checked=true;
    const forma=['el origen','una recta','un plano','todo ℝ³'][modelo.dimension];
    $('descripcion-columnas').textContent=`Las columnas de A generan ${forma}. ${modelo.pertenece?'b pertenece a ese espacio: el sistema tiene '+(modelo.tipo==='unica'?'solución única.':'infinitas soluciones.'):'b queda fuera: el sistema no tiene solución.'}`;
    $('nota-columnas').textContent=`Aquí se representan vectores de ℝ${modelo.ambiente===1?'¹':modelo.ambiente===2?'²':'³'}, no los valores de las incógnitas.${modelo.ambiente<3?' Las coordenadas restantes se completan con cero.':''}`;
    const leyenda=$('leyenda-columnas');leyenda.replaceChildren();
    modelo.columnas.forEach((v,j)=>{const p=document.createElement('p');p.style.color=colores[j%colores.length];p.append(`𝛾${sub(j+1)} · columna ${j+1} de A = `);vectorTexto(p,v);leyenda.append(p);});
    const b=document.createElement('p');b.append('b · columna aumentada = ');vectorTexto(b,modelo.b);leyenda.append(b);
    const formula=$('formula-columnas');formula.replaceChildren();formula.hidden=modelo.dimension!==2;
    if(modelo.normal) {
      formula.append('Normal del plano: n = 𝛾'+(modelo.indices[0]+1)+' × 𝛾'+(modelo.indices[1]+1)+' = ');vectorTexto(formula,modelo.normal);
      const p=document.createElement('p');
      modelo.normal.forEach((v,i)=>{if(i)p.append(' + ');p.append('(',global.FormatoMatematico.fraccion(v),')'+['x','y','z'][i]);});p.append(' = 0');formula.append(p);
      const q=document.createElement('p');q.append('n · b = ',global.FormatoMatematico.fraccion(modelo.comprobacion),modelo.pertenece?' → b está en el plano.':' → b está fuera del plano.');formula.append(q);
    }
    const cuenta=$('cuenta-combinacion');cuenta.replaceChildren();
    if(modelo.pertenece) {
      const titulo=document.createElement('p');titulo.textContent=modelo.tipo==='infinitas'?'Una combinación posible (coeficientes libres en cero):':'Combinación que produce b:';cuenta.append(titulo);
      const expresion=document.createElement('p'),numerica=document.createElement('p');
      modelo.coeficientes.forEach((a,j)=>{
        if(j){expresion.append(' + ');numerica.append(' + ');}
        expresion.append('(',global.FormatoMatematico.fraccion(a),`)𝛾${sub(j+1)}`);
        numerica.append('(',global.FormatoMatematico.fraccion(a),') · ');vectorTexto(numerica,modelo.columnas[j]);
      });
      expresion.append(' = b');numerica.append(' = ');vectorTexto(numerica,modelo.b);cuenta.append(expresion,numerica);
      const nota=document.createElement('p');nota.textContent='α son los coeficientes (las incógnitas del sistema); 𝛾 son las columnas de A. Los tramos punteados suman αᵢ𝛾ᵢ, punta a cola, hasta b.';cuenta.append(nota);
    } else cuenta.textContent='No existe una combinación de las columnas que produzca b.';
    modal.showModal();dibujar();
  }
  $('explicar-infinitas').onclick=()=>{try{$('error-grafica').hidden=true;abrir();}catch(e){informarError(e);}};
  $('cerrar-columnas').onclick=()=>modal.close();
  $('ver-columnas').onchange=dibujar;
  $('ver-combinacion').onchange=ajustarEscala;
  $('acercar-columnas').onclick=()=>{limite=Math.max(1e-100,limite/2);dibujar();};
  $('alejar-columnas').onclick=()=>{limite=Math.min(1e100,limite*2);dibujar();};
  $('reiniciar-columnas').onclick=()=>{azimut=-2.18;elevacion=-.38;ajustarEscala();};
  canvas.onpointerdown=e=>{arrastre=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};
  canvas.onpointermove=e=>{if(!arrastre)return;azimut+=(e.clientX-arrastre[0])*.01;elevacion=Math.max(-1.4,Math.min(1.4,elevacion+(e.clientY-arrastre[1])*.01));arrastre=[e.clientX,e.clientY];dibujar();};
  canvas.onpointerup=canvas.onpointercancel=()=>{arrastre=null;};
  canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')azimut-=.1;if(e.key==='ArrowRight')azimut+=.1;if(e.key==='ArrowUp')elevacion=Math.max(-1.4,elevacion-.1);if(e.key==='ArrowDown')elevacion=Math.min(1.4,elevacion+.1);dibujar();};
  if(global.ResizeObserver)new ResizeObserver(dibujar).observe(canvas);
  global.GraficaColumnas={
    limpiar(){modelo=null;$('explicar-infinitas').hidden=true;$('limite-grafica').hidden=true;$('error-grafica').hidden=true;if(modal.open)modal.close();},
    preparar(resultado,original,n){
      this.limpiar();
      if(original.length>3){$('limite-grafica').hidden=false;return;}
      modelo=E.crear(original,n);$('explicar-infinitas').hidden=false;
    }
  };
})(window);
