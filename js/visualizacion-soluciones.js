(() => {
  const $ = id => document.getElementById(id), F = window.Fraccion, E = window.EspacioSoluciones;
  const modal = $('modal-infinitas'), canvas = $('grafica-infinitas'), ctx = canvas.getContext('2d');
  const colores = ['#2463a0','#bd6434','#8053a5','#218879','#bb4773','#7b771e'];
  const nombres = ['x','y','z'];
  const vistaInicial={limite:5,azimut:-2.18,elevacion:-.38};
  let modelo, ejes=[], punto, aproximado, geometria, visibles=[], limite=vistaInicial.limite;
  let azimut=vistaInicial.azimut, elevacion=vistaInicial.elevacion, arrastre=null;
  const suma=(a,b,k=1)=>a.map((v,i)=>v+k*b[i]);
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const cruz=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const vector=v=>[...v.map(E.numero),...Array(3-v.length).fill(0)];
  const sub=n=>String(n).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
  const variable=i=>modelo.n<=3?nombres[i]:`x${sub(i+1)}`;
  function texto(padre,contenido,clase){const el=document.createElement('div');el.textContent=contenido;if(clase)el.className=clase;padre.append(el);return el;}
  function ordenar(puntos){
    if(puntos.length<3)return puntos;
    const centro=puntos.reduce((s,p)=>suma(s,p,1/puntos.length),[0,0,0]);
    const u=suma(puntos[0],centro,-1), a=suma(puntos[1],centro,-1);
    let normal=cruz(u,a);
    if(!Math.hypot(...normal))for(const p of puntos.slice(2)){normal=cruz(u,suma(p,centro,-1));if(Math.hypot(...normal))break;}
    const v=cruz(normal,u),nu=Math.hypot(...u),nv=Math.hypot(...v);
    if(!nu||!nv)return puntos;
    return [...puntos].sort((a,b)=>Math.atan2(dot(suma(a,centro,-1),v)/nv,dot(suma(a,centro,-1),u)/nu)-Math.atan2(dot(suma(b,centro,-1),v)/nv,dot(suma(b,centro,-1),u)/nu));
  }
  function prepararGeometria(){
    geometria={imagen:modelo.proyectar(ejes),ecuaciones:[]};
    geometria.familia=E.cortarFamilia(geometria.imagen,limite);
    if(modelo.n<=3)geometria.ecuaciones=modelo.original.map(f=>E.cortarEcuacion(f.slice(0,modelo.n),f[modelo.n],limite));
  }
  function dibujar(){
    if(!modelo)return;
    ctx.clearRect(0,0,900,480);ctx.fillStyle='#f4f8fb';ctx.fillRect(0,0,900,480);
    try{
      if(!geometria)prepararGeometria();
      const es3d=ejes.length===3, unidad=(es3d?128:180)/limite;
      const caja=canvas.getBoundingClientRect(), ajuste=getComputedStyle(canvas).objectFit==='cover'?Math.max:Math.min;
      const escalaPantalla=Math.max(.1,ajuste(caja.width/900,caja.height/480));
      const letra=Math.max(18,Math.min(32,14/escalaPantalla)), letraMarca=Math.max(10,Math.min(20,10/escalaPantalla));
      function proyectar(v){
        if(!es3d)return [450+v[0]*unidad,240-v[1]*unidad,v[2]];
        const a=v[0]*Math.cos(azimut)-v[1]*Math.sin(azimut), b=v[0]*Math.sin(azimut)+v[1]*Math.cos(azimut);
        return [450+a*unidad,240+(b*Math.sin(elevacion)-v[2]*Math.cos(elevacion))*unidad,b*Math.cos(elevacion)+v[2]*Math.sin(elevacion)];
      }
      function segmento(a,b,color,grosor=1){const p=proyectar(a),q=proyectar(b);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.strokeStyle=color;ctx.lineWidth=grosor;ctx.stroke();}
      function etiqueta(p,t,color='#001d39'){const q=proyectar(p);ctx.font=`${letra}px system-ui`;ctx.fillStyle=color;ctx.fillText(t,q[0]+7,q[1]-7);}
      function marca(p,color,radio=5){const q=proyectar(p);ctx.beginPath();ctx.arc(q[0],q[1],radio,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();}
      const caras=[], destacado=Number($('destacar-plano').value);
      function figura(fig,color,solucion=false,indice=-1){
        const pts=ordenar(fig.puntos.map(vector));
        if(pts.length>=3)caras.push({pts,color,solucion,indice,prof:pts.reduce((s,p)=>s+proyectar(p)[2]/pts.length,0)});
        else {
          const tenue=!solucion&&destacado>=0&&indice!==destacado;
          if(pts.length===2)segmento(pts[0],pts[1],color+(tenue?'35':'ff'),solucion||destacado===indice?4:2);
          else if(pts.length===1)marca(pts[0],color+(tenue?'35':'ff'),solucion?7:4);
        }
      }
      // Los ejes y todas las ecuaciones comparten exactamente el mismo intervalo.
      const esquinas=Array.from({length:2**ejes.length},(_,i)=>[0,1,2].map(j=>j<ejes.length?((i>>j)&1?limite:-limite):0));
      const paso=limite/5;
      // Una base tenue orienta la vista sin encerrar los planos en otra caja.
      if(ejes.length>=2)for(let k=-2;k<=2;k++){
        const altura=es3d?-limite:0;
        segmento([-limite,k*limite/2,altura],[limite,k*limite/2,altura],'#e1e9ef');
        segmento([k*limite/2,-limite,altura],[k*limite/2,limite,altura],'#e1e9ef');
      }
      geometria.ecuaciones.forEach((fig,i)=>{if(visibles[i])figura(fig,colores[i%colores.length],false,i);});
      figura(geometria.familia,'#18734c',true);
      if(geometria.familia.tipo==='todo'){
        if(es3d){for(const i of [0,1,2]){const pts=esquinas.filter(p=>p[i]===limite);caras.push({pts:ordenar(pts),color:'#18734c',solucion:true,prof:pts.reduce((s,p)=>s+proyectar(p)[2]/pts.length,0)});}}
        else if(ejes.length===2)caras.push({pts:ordenar(esquinas),color:'#18734c',solucion:true,prof:0});
        else segmento([-limite,0,0],[limite,0,0],'#18734c',5);
      }
      // Transparencia y orden de profundidad: los planos se ven como superficies.
      caras.sort((a,b)=>a.prof-b.prof).forEach(({pts,color,solucion,indice})=>{
        const atenuado=!solucion&&destacado>=0&&indice!==destacado;
        ctx.beginPath();pts.forEach((p,i)=>{const q=proyectar(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.closePath();
        ctx.fillStyle=color+(solucion?'38':atenuado?'05':destacado>=0?'40':'18');ctx.fill();ctx.strokeStyle=color+(atenuado?'35':'ff');ctx.lineWidth=solucion?2.5:destacado===indice?2.5:1.3;ctx.stroke();
      });
      // La intersección se resalta encima de las superficies, sin ocultarla con transparencias.
      if(geometria.familia.puntos.length<=2)figura(geometria.familia,'#18734c',true);
      for(let i=0;i<ejes.length;i++){
        const a=[0,0,0],b=[0,0,0];a[i]=-limite;b[i]=limite;segmento(a,b,'#496174',1.8);etiqueta(b,nombres[i]);
        for(const k of [-5,5]){const p=[0,0,0];p[i]=k*paso;const q=proyectar(p);ctx.fillStyle='#496174';ctx.fillRect(q[0]-2,q[1]-2,4,4);ctx.font=`${letraMarca}px system-ui`;ctx.fillText(Number(p[i].toPrecision(4)).toString(),q[0]+4,q[1]+13);}
      }
      etiqueta([0,0,0],'0','#496174');
      if($('mostrar-normales').checked && modelo.n<=3)geometria.ecuaciones.forEach((fig,i)=>{
        if(!visibles[i]||!fig.puntos.length)return;
        const coef=modelo.original[i].slice(0,modelo.n);
        // Se normalizan antes de convertir a coma flotante, evitando desbordar coeficientes grandes.
        const mayor=coef.reduce((m,v)=>v.n*v.n*m.d*m.d>m.n*m.n*v.d*v.d?v:m,F.CERO);
        if(mayor.esCero())return;
        const v=vector(coef.map(c=>c.dividir(mayor.n<0n?mayor.negar():mayor))),norma=Math.hypot(...v);
        const vertices=ordenar(fig.puntos.map(vector));
        const centro=vertices.reduce((s,p)=>suma(s,p,1/vertices.length),[0,0,0]);
        // El anclaje sigue sobre el plano y separa las etiquetas de la intersección.
        const inicio=suma(centro.map(v=>v*.45),vertices[i%vertices.length],.55);
        const fin=suma(inicio,v,limite*.2/norma),p=proyectar(inicio),q=proyectar(fin);
        segmento(inicio,fin,colores[i%colores.length],2);const a=Math.atan2(q[1]-p[1],q[0]-p[0]);
        ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]-7*Math.cos(a-.45),q[1]-7*Math.sin(a-.45));ctx.lineTo(q[0]-7*Math.cos(a+.45),q[1]-7*Math.sin(a+.45));ctx.closePath();ctx.fillStyle=colores[i%colores.length];ctx.fill();etiqueta(fin,`γ${sub(i+1)}`,colores[i%colores.length]);
      });
      let fuera=false;
      if(punto){const seleccion=ejes.map(i=>punto[i]);
        fuera=!E.cortarFamilia({origen:seleccion,base:[],dimension:0},limite).puntos.length;
        if(!fuera){const p=vector(seleccion);
        const q=proyectar(p);ctx.beginPath();ctx.arc(q[0],q[1],16,0,2*Math.PI);ctx.fillStyle='#18734c25';ctx.fill();marca(p,'#18734c',8);
        const lx=Math.min(750,q[0]+58),ly=Math.max(66,q[1]-58);
        ctx.beginPath();ctx.moveTo(q[0]+9,q[1]-9);ctx.lineTo(lx,ly+16);ctx.strokeStyle='#18734c';ctx.lineWidth=1.5;ctx.stroke();
        ctx.fillStyle='white';ctx.fillRect(lx-7,ly-8,modelo.tipo==='unica'?119:97,32);ctx.font='bold 18px system-ui';ctx.fillStyle='#155a3c';ctx.fillText(modelo.tipo==='unica'?'Solución':'Tu punto',lx,ly+14);
      }}
      const dimension=geometria.imagen.dimension;
      const fueraEcuaciones=geometria.ecuaciones.filter((f,i)=>visibles[i]&&!f.puntos.length&&!['todo','vacio'].includes(f.tipo)).length;
      const avisos=[];
      if(fuera)avisos.push('El punto queda fuera de la vista. Pulsa − para verlo.');
      if(fueraEcuaciones)avisos.push(`${fueraEcuaciones} ecuación(es) fuera de la vista.`);
      if(!fuera&&dimension>=0&&!geometria.familia.puntos.length&&geometria.familia.tipo!=='todo')avisos.push('La solución está fuera de la vista; aleja para verla.');
      const ocultas=visibles.filter(v=>!v).length;
      if(modelo.n<=3&&ocultas)avisos.push(`${ocultas} ecuación(es) ocultas. La solución sigue considerando todas.`);
      $('estado-grafica').textContent=avisos.join(' ');
      $('estado-grafica').hidden=!avisos.length;
    }catch(error){ctx.clearRect(0,0,900,480);$('estado-grafica').hidden=false;$('estado-grafica').textContent=`No es posible representar esta escala con fiabilidad: ${error.message}`;}

  }
  function actualizar(){
    const error=$('error-parametro');error.hidden=true;
    try{
      if(modelo.tipo==='incompatible'){
        punto=null;$('punto-infinitas').textContent='No hay punto que satisfaga todas las ecuaciones.';
        $('comprobacion-infinitas').textContent='La reducción contiene una contradicción de la forma 0 = c, con c distinto de cero.';dibujar();return;
      }
      const entradas=[...$('parametros-infinitas').querySelectorAll('input[type=text]')];
      const parametros=entradas.map((el,i)=>{el.removeAttribute('aria-invalid');try{return F.desdeTexto(el.value);}catch(e){el.setAttribute('aria-invalid','true');throw new Error(`${variable(modelo.libres[i])}: ${e.message}`);}});
      const evaluacion=modelo.evaluar(parametros);punto=evaluacion.punto;
      $('resumen-punto').replaceChildren();
      ejes.forEach(i=>texto($('resumen-punto'),`${variable(i)} = ${punto[i].aTexto()}`));
      $('punto-infinitas').replaceChildren();texto($('punto-infinitas'),'Coordenadas del punto');
      punto.forEach((v,i)=>texto($('punto-infinitas'),`${variable(i)} = ${v.aTexto()}`));
      $('comprobacion-infinitas').replaceChildren();evaluacion.comprobaciones.forEach((c,i)=>texto($('comprobacion-infinitas'),`Ecuación ${i+1}: ${c.izquierda.aTexto()} = ${c.derecha.aTexto()} ${c.izquierda.restar(c.derecha).esCero()?'✓':'✗'}`));
      if(aproximado||entradas.some(el=>F.contieneConstantes(el.value)))texto($('comprobacion-infinitas'),'π y Euler se representan con la aproximación de 4 decimales usada por la calculadora.','nota-geometria');
      dibujar();
    }catch(e){error.hidden=false;error.textContent=e.message;punto=null;$('resumen-punto').replaceChildren();$('punto-infinitas').replaceChildren();$('comprobacion-infinitas').replaceChildren();dibujar();}
  }
  function leyenda(){
    const cont=$('leyenda-geometria');cont.replaceChildren();
    texto(cont,modelo.tipo==='incompatible'?'Cada color identifica una ecuación.':'Verde: soluciones. El punto marcado es una de ellas.');
    if(modelo.n>3){texto(cont,'Aquí ves solo las coordenadas elegidas. El cálculo usa todas las variables.');return;}
    texto(cont,'γ indica la dirección de cada flecha, no su longitud en pantalla.');
    modelo.original.forEach((fila,i)=>{
      const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=true;
      check.onchange=()=>{visibles[i]=check.checked;dibujar();};
      const normal=fila.slice(0,modelo.n),cero=normal.every(v=>v.esCero());
      let ecuacion='';
      normal.forEach((v,j)=>{
        if(v.esCero())return;
        const negativo=v.n<0n, magnitud=negativo?v.negar():v;
        ecuacion+=(ecuacion?(negativo?' − ':' + '):(negativo?'−':''))+(magnitud.esUno()?'':magnitud.aTexto())+nombres[j];
      });
      ecuacion=(ecuacion||'0')+` = ${fila[modelo.n].aTexto()}`;
      label.style.setProperty('--color-ecuacion',colores[i%colores.length]);
      const info=document.createElement('div');
      texto(info,ecuacion,'ecuacion-legible');
      texto(info,cero?(fila[modelo.n].esCero()?'Se cumple siempre.':'No se puede cumplir.'):`γ${sub(i+1)} = (${normal.map(v=>v.aTexto()).join(', ')})`,'vector-legible');
      check.setAttribute('aria-label',`Mostrar ecuación ${i+1}: ${ecuacion}`);
      label.append(check,info);cont.append(label);
    });
  }
  function abrir(){
    if(!modelo)return;modal.showModal();limite=vistaInicial.limite;azimut=vistaInicial.azimut;elevacion=vistaInicial.elevacion;
    $('mostrar-normales').checked=false;
    ejes=Array.from({length:Math.min(3,modelo.n)},(_,i)=>i);geometria=null;visibles=modelo.original.map(()=>true);
    $('destacar-plano').replaceChildren();
    const todos=document.createElement('option');todos.value=-1;todos.textContent='Todos';$('destacar-plano').append(todos);
    if(modelo.n<=3)modelo.original.forEach((fila,i)=>{if(fila.slice(0,modelo.n).every(v=>v.esCero()))return;const op=document.createElement('option');op.value=i;op.textContent=`${modelo.n===3?'Plano':'Ecuación'} ${i+1}`;$('destacar-plano').append(op);});
    $('control-destacar').hidden=modelo.n>3;
    $('titulo-infinitas').textContent={unica:'Una solución',infinitas:'Infinitas soluciones',incompatible:'Sin soluciones'}[modelo.tipo];
    $('resumen-punto').hidden=modelo.tipo==='incompatible';
    $('enfocar-solucion').hidden=modelo.tipo!=='unica';
    $('explicacion-infinitas').textContent={unica:'Un solo punto cumple todas las ecuaciones.',infinitas:modelo.n>3?'El verde muestra las soluciones vistas desde tres coordenadas.':modelo.libres.length===modelo.n?'Cualquier punto de este espacio cumple el sistema.':modelo.libres.length===1?'La recta verde reúne todas las soluciones.':'Cada punto del plano verde es una solución.',incompatible:'No hay ningún punto que cumpla todas las ecuaciones.'}[modelo.tipo];
    $('proyeccion-infinitas').hidden=modelo.n<=3;
    $('proyeccion-infinitas').textContent=modelo.n>3?'Proyección en tres ejes: no representa el sistema completo.':'';
    $('ejes-infinitas').replaceChildren();
    if(modelo.n>3)ejes.forEach((eje,k)=>{
      const label=document.createElement('label');label.textContent=`Eje ${nombres[k]} = `;const select=document.createElement('select');
      for(let j=0;j<modelo.n;j++){const option=document.createElement('option');option.value=j;option.textContent=`x${sub(j+1)}`;select.append(option);}select.value=eje;
      select.onchange=()=>{const nuevo=Number(select.value),otro=ejes.indexOf(nuevo);if(otro!==-1){ejes[otro]=ejes[k];$('ejes-infinitas').querySelectorAll('select')[otro].value=ejes[k];}ejes[k]=nuevo;geometria=null;actualizar();};label.append(select);$('ejes-infinitas').append(label);
    });
    $('parametros-infinitas').replaceChildren();$('controles-parametros').hidden=modelo.tipo!=='infinitas';
    modelo.libres.forEach((col,i)=>{
      const fila=document.createElement('div');fila.className='parametro-geometria';const label=document.createElement('label');label.htmlFor=`valor-t${i}`;label.textContent=`Elige el valor de ${variable(col)}`;
      const campo=document.createElement('input');campo.id=`valor-t${i}`;campo.type='text';campo.value='0';campo.maxLength=256;campo.autocomplete='off';campo.setAttribute('aria-label',`Valor de ${variable(col)}`);
      const slider=document.createElement('input');slider.type='range';slider.value=0;slider.setAttribute('aria-label',`Mover ${variable(col)}`);slider.dataset.indice=i;
      const extremos=document.createElement('div');extremos.className='extremos-parametro';extremos.append(document.createElement('span'),document.createElement('span'));
      slider.oninput=()=>{campo.value=slider.value;slider.setAttribute('aria-valuetext',`${variable(col)} = ${campo.value}`);actualizar();};
      campo.oninput=()=>{try{slider.value=Math.max(-limite,Math.min(limite,E.numero(F.desdeTexto(campo.value))));}catch{}actualizar();};
      fila.append(label,campo,slider,extremos);$('parametros-infinitas').append(fila);
    });
    actualizarZoom();$('mostrar-normales').disabled=modelo.n>3; $('mostrar-normales').parentElement.hidden=modelo.n>3;leyenda();actualizar();
  }
  $('explicar-infinitas').onclick=abrir;$('cerrar-infinitas').onclick=()=>modal.close();
  function actualizarZoom(){
    $('intervalo-grafica').textContent=`−${limite} a ${limite}`;
    $('parametros-infinitas').querySelectorAll('input[type=range]').forEach(slider=>{
      slider.min=-limite;slider.max=limite;slider.step='any';
      const campo=$('parametros-infinitas').querySelectorAll('input[type=text]')[Number(slider.dataset.indice)];
      try{slider.value=Math.max(-limite,Math.min(limite,E.numero(F.desdeTexto(campo.value))));}catch{}
      const extremos=slider.parentElement.querySelector('.extremos-parametro');extremos.firstChild.textContent=`−${limite}`;extremos.lastChild.textContent=limite;
      slider.setAttribute('aria-valuetext',`${variable(modelo.libres[Number(slider.dataset.indice)])} = ${campo.value}`);
    });
    $('acercar-grafica').disabled=limite<=1e-8;
    $('alejar-grafica').disabled=limite>=1e8;
  }
  function cambiarZoom(factor){
    limite=Number(Math.max(1e-8,Math.min(1e8,limite*factor)).toPrecision(8));
    geometria=null;actualizarZoom();dibujar();
  }
  $('acercar-grafica').onclick=()=>cambiarZoom(.5);
  $('alejar-grafica').onclick=()=>cambiarZoom(2);
  $('mostrar-normales').onchange=dibujar;
  $('destacar-plano').onchange=()=>{
    const i=Number($('destacar-plano').value);
    if(i>=0){visibles[i]=true;const check=$('leyenda-geometria').querySelectorAll('input[type=checkbox]')[i];if(check)check.checked=true;}
    dibujar();
  };
  $('reiniciar-vista').onclick=()=>{limite=vistaInicial.limite;azimut=vistaInicial.azimut;elevacion=vistaInicial.elevacion;geometria=null;actualizarZoom();dibujar();};
  $('enfocar-solucion').onclick=()=>{
    if(!punto)return;
    try{const valores=ejes.map(i=>Math.abs(E.numero(punto[i])));limite=Number(Math.max(1,Math.min(1e8,Math.max(...valores)*1.6)).toPrecision(6));azimut=vistaInicial.azimut;elevacion=vistaInicial.elevacion;geometria=null;actualizarZoom();dibujar();}catch(e){$('estado-grafica').hidden=false;$('estado-grafica').textContent=e.message;}
  };
  canvas.onkeydown=e=>{
    if(ejes.length!==3||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();
    if(e.key==='ArrowLeft')azimut-=.15;if(e.key==='ArrowRight')azimut+=.15;
    if(e.key==='ArrowUp')elevacion=Math.min(1.4,elevacion+.15);
    if(e.key==='ArrowDown')elevacion=Math.max(-1.4,elevacion-.15);
    dibujar();
  };
  canvas.onpointerdown=e=>{if(ejes.length!==3)return;arrastre=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};
  canvas.onpointermove=e=>{if(!arrastre)return;const factor=6/Math.max(1,canvas.getBoundingClientRect().width);azimut+=(e.clientX-arrastre[0])*factor;elevacion=Math.max(-1.4,Math.min(1.4,elevacion+(e.clientY-arrastre[1])*factor));arrastre=[e.clientX,e.clientY];dibujar();};
  canvas.onpointerup=canvas.onpointercancel=()=>{arrastre=null;};modal.addEventListener('close',()=>{arrastre=null;});
  if(window.ResizeObserver)new ResizeObserver(()=>{if(modal.open)dibujar();}).observe(canvas);
  window.VisualizacionSoluciones={preparar(resultado,original,n,aprox){this.limpiar();modelo=E.crear(resultado,original,n);aproximado=aprox;$('explicar-infinitas').hidden=false;},limpiar(){modelo=null;punto=null;geometria=null;$('explicar-infinitas').hidden=true;if(modal.open)modal.close();}};
})();
