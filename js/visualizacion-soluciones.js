(() => {
  const $ = id => document.getElementById(id), F = window.Fraccion, E = window.EspacioSoluciones;
  const modal = $('modal-infinitas'), canvas = $('grafica-infinitas'), ctx = canvas.getContext('2d');
  const colores = ['#2463a0','#bd6434','#8053a5','#218879','#bb4773','#7b771e'];
  const nombres = ['x','y','z'];
  let modelo, ejes=[], punto, aproximado, geometria, visibles=[], limite=10;
  let azimut=-.65, elevacion=.5, zoom=1, arrastre=null;
  const suma=(a,b,k=1)=>a.map((v,i)=>v+k*b[i]);
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const cruz=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const vector=v=>[...v.map(E.numero),...Array(3-v.length).fill(0)];
  const sub=n=>String(n).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
  const variable=i=>modelo.n<=3?nombres[i]:`x${sub(i+1)}`;
  function texto(padre,contenido,clase){const el=document.createElement('div');el.textContent=contenido;if(clase)el.className=clase;padre.append(el);return el;}
  function dentro(p){return p.every(v=>Math.abs(v)<=limite*(1+1e-12));}
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
      const es3d=ejes.length===3, unidad=(es3d?128:180)*zoom/limite;
      function proyectar(v){
        if(!es3d)return [450+v[0]*unidad,240-v[1]*unidad,v[2]];
        const a=v[0]*Math.cos(azimut)-v[1]*Math.sin(azimut), b=v[0]*Math.sin(azimut)+v[1]*Math.cos(azimut);
        return [450+a*unidad,240+(b*Math.sin(elevacion)-v[2]*Math.cos(elevacion))*unidad,b*Math.cos(elevacion)+v[2]*Math.sin(elevacion)];
      }
      function segmento(a,b,color,grosor=1){const p=proyectar(a),q=proyectar(b);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.strokeStyle=color;ctx.lineWidth=grosor;ctx.stroke();}
      function etiqueta(p,t,color='#001d39'){const q=proyectar(p);ctx.font='18px system-ui';ctx.fillStyle=color;ctx.fillText(t,q[0]+7,q[1]-7);}
      function marca(p,color,radio=5){const q=proyectar(p);ctx.beginPath();ctx.arc(q[0],q[1],radio,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();}
      const caras=[];
      function figura(fig,color,solucion=false){
        const pts=ordenar(fig.puntos.map(vector));
        if(pts.length>=3)caras.push({pts,color,solucion,prof:pts.reduce((s,p)=>s+proyectar(p)[2]/pts.length,0)});
        else if(pts.length===2)segmento(pts[0],pts[1],color,solucion?4:2);
        else if(pts.length===1)marca(pts[0],color,solucion?7:4);
      }
      // La caja, los ejes y todas las ecuaciones comparten exactamente el mismo intervalo.
      const esquinas=Array.from({length:2**ejes.length},(_,i)=>[0,1,2].map(j=>j<ejes.length?((i>>j)&1?limite:-limite):0));
      for(let i=0;i<esquinas.length;i++)for(let j=0;j<ejes.length;j++){const k=i^(1<<j);if(k>i)segmento(esquinas[i],esquinas[k],'#cad9e3');}
      const paso=limite/5;
      if(ejes.length>=2)for(let k=-5;k<=5;k++){
        segmento([-limite,k*paso,0],[limite,k*paso,0],'#dce5ec');
        segmento([k*paso,-limite,0],[k*paso,limite,0],'#dce5ec');
      }
      geometria.ecuaciones.forEach((fig,i)=>{if(visibles[i])figura(fig,colores[i%colores.length]);});
      figura(geometria.familia,'#18734c',true);
      if(geometria.familia.tipo==='todo'){
        if(es3d){for(const i of [0,1,2]){const pts=esquinas.filter(p=>p[i]===limite);caras.push({pts:ordenar(pts),color:'#18734c',solucion:true,prof:pts.reduce((s,p)=>s+proyectar(p)[2]/pts.length,0)});}}
        else if(ejes.length===2)caras.push({pts:ordenar(esquinas),color:'#18734c',solucion:true,prof:0});
        else segmento([-limite,0,0],[limite,0,0],'#18734c',5);
      }
      // Transparencia y orden de profundidad: los planos se ven como superficies.
      caras.sort((a,b)=>a.prof-b.prof).forEach(({pts,color,solucion})=>{
        ctx.beginPath();pts.forEach((p,i)=>{const q=proyectar(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.closePath();
        ctx.fillStyle=color+(solucion?'38':'28');ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=solucion?2.5:1.3;ctx.stroke();
      });
      // La intersección se resalta encima de las superficies, sin ocultarla con transparencias.
      if(geometria.familia.puntos.length<=2)figura(geometria.familia,'#18734c',true);
      for(let i=0;i<ejes.length;i++){
        const a=[0,0,0],b=[0,0,0];a[i]=-limite;b[i]=limite;segmento(a,b,'#496174',1.8);etiqueta(b,nombres[i]);
        for(const k of [-5,-3,-1,1,3,5]){const p=[0,0,0];p[i]=k*paso;const q=proyectar(p);ctx.fillStyle='#496174';ctx.fillRect(q[0]-2,q[1]-2,4,4);ctx.font='10px system-ui';ctx.fillText(Number(p[i].toPrecision(4)).toString(),q[0]+4,q[1]+13);}
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
        const fin=suma(inicio,v,1/norma),p=proyectar(inicio),q=proyectar(fin);
        segmento(inicio,fin,colores[i%colores.length],2);const a=Math.atan2(q[1]-p[1],q[0]-p[0]);
        ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]-7*Math.cos(a-.45),q[1]-7*Math.sin(a-.45));ctx.lineTo(q[0]-7*Math.cos(a+.45),q[1]-7*Math.sin(a+.45));ctx.closePath();ctx.fillStyle=colores[i%colores.length];ctx.fill();etiqueta(fin,`α${sub(i+1)}`,colores[i%colores.length]);
      });
      let fuera=false;
      if(punto){const p=vector(ejes.map(i=>punto[i]));fuera=!dentro(p);if(!fuera){marca(p,'#001d39',7);etiqueta(p,'σ');}}
      const formas=['un punto','una recta','un plano','todo el espacio'];
      const dimension=geometria.imagen.dimension;
      const fueraEcuaciones=geometria.ecuaciones.filter((f,i)=>visibles[i]&&!f.puntos.length&&!['todo','vacio'].includes(f.tipo)).length;
      $('estado-grafica').textContent=(dimension<0?'No existe intersección común: el conjunto solución está vacío.':`${modelo.n>3?'La proyección del conjunto solución es':'La intersección común es'} ${formas[dimension]}.`)+` Ventana fija: −${limite} a ${limite} en todos los ejes.`+(fuera?' σ queda fuera de esta ventana; amplía el intervalo para verlo.':'')+(fueraEcuaciones?` ${fueraEcuaciones} ecuación(es) quedan fuera de la ventana.`:'')+(dimension>=0&&!geometria.familia.puntos.length&&geometria.familia.tipo!=='todo'?' La solución está fuera de la ventana; eso no significa que no exista.':'');
      $('girar-grafica').disabled=!es3d;
    }catch(error){ctx.clearRect(0,0,900,480);$('estado-grafica').textContent=`No es posible representar esta escala con fiabilidad: ${error.message}`;}
  }
  function actualizar(){
    const error=$('error-parametro');error.hidden=true;
    try{
      if(modelo.tipo==='incompatible'){
        punto=null;$('punto-infinitas').textContent='No hay punto que satisfaga todas las ecuaciones.';
        $('comprobacion-infinitas').textContent='La reducción contiene una contradicción de la forma 0 = c, con c distinto de cero.';dibujar();return;
      }
      const entradas=[...$('parametros-infinitas').querySelectorAll('input[type=text]')];
      const parametros=entradas.map((el,i)=>{el.removeAttribute('aria-invalid');try{return F.desdeTexto(el.value);}catch(e){el.setAttribute('aria-invalid','true');throw new Error(`t${i+1}: ${e.message}`);}});
      const evaluacion=modelo.evaluar(parametros);punto=evaluacion.punto;
      $('punto-infinitas').replaceChildren();texto($('punto-infinitas'),'σ: punto solución seleccionado');
      punto.forEach((v,i)=>texto($('punto-infinitas'),`${variable(i)} = ${v.aTexto()}`));
      $('comprobacion-infinitas').replaceChildren();evaluacion.comprobaciones.forEach((c,i)=>texto($('comprobacion-infinitas'),`Ecuación ${i+1}: ${c.izquierda.aTexto()} = ${c.derecha.aTexto()} ${c.izquierda.restar(c.derecha).esCero()?'✓':'✗'}`));
      if(aproximado||entradas.some(el=>F.contieneConstantes(el.value)))texto($('comprobacion-infinitas'),'π y Euler se representan con la aproximación de 4 decimales usada por la calculadora.','nota-geometria');
      dibujar();
    }catch(e){error.hidden=false;error.textContent=e.message;punto=null;$('punto-infinitas').replaceChildren();$('comprobacion-infinitas').replaceChildren();dibujar();}
  }
  function leyenda(){
    const cont=$('leyenda-geometria');cont.replaceChildren();
    texto(cont,modelo.tipo==='incompatible'?'No hay conjunto solución ni punto σ. Los colores identifican las ecuaciones.':'Verde: conjunto solución · σ: punto seleccionado.');
    if(modelo.n>3){texto(cont,'Vista proyectada: no se dibujan hiperplanos como si fueran planos de tres variables.');return;}
    texto(cont,'Πᵢ identifica la ecuación i. αᵢ es su vector normal (perpendicular); las flechas muestran αᵢ / ‖αᵢ‖, de longitud 1.');
    modelo.original.forEach((fila,i)=>{
      const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=true;
      check.onchange=()=>{visibles[i]=check.checked;dibujar();};
      const normal=fila.slice(0,modelo.n),cero=normal.every(v=>v.esCero());
      const ecuacion=normal.map((v,j)=>`(${v.aTexto()})${nombres[j]}`).join(' + ')+` = ${fila[modelo.n].aTexto()}`;
      label.style.setProperty('--color-ecuacion',colores[i%colores.length]);
      label.append(check,document.createTextNode(`Π${sub(i+1)}: ${ecuacion}. α${sub(i+1)} = (${normal.map(v=>v.aTexto()).join(', ')}).${cero?(fila[modelo.n].esCero()?' 0 = 0: no restringe el espacio; no tiene normal no nulo.':' Contradicción: esta ecuación no tiene puntos.') : ''}`));cont.append(label);
    });
  }
  function abrir(){
    if(!modelo)return;modal.showModal();azimut=-.65;elevacion=.5;zoom=1;
    ejes=Array.from({length:Math.min(3,modelo.n)},(_,i)=>i);geometria=null;visibles=modelo.original.map(()=>true);
    $('titulo-infinitas').textContent='Geometría del sistema';
    $('explicacion-infinitas').textContent={unica:'Solución única: todas las ecuaciones tienen exactamente un punto en común.',infinitas:'Infinitas soluciones: la intersección común es una recta, un plano o un espacio de mayor dimensión.',incompatible:'Sin soluciones: las ecuaciones no tienen ningún punto en común. Pueden cruzarse por separado sin compartir una solución entre todas.'}[modelo.tipo];
    $('proyeccion-infinitas').textContent=modelo.n>3?'Más de tres variables: esta vista es una proyección del conjunto solución sobre los ejes elegidos, no una representación completa del sistema. Si no hay soluciones, su proyección también está vacía.':`${modelo.n===3?'Cada ecuación no degenerada se representa mediante un plano.':modelo.n===2?'Cada ecuación no degenerada se representa mediante una recta.':'Cada ecuación no degenerada determina un punto en la recta numérica.'} Se dibuja una ventana finita; las superficies se extienden fuera de ella.`;
    $('ejes-infinitas').replaceChildren();
    if(modelo.n>3)ejes.forEach((eje,k)=>{
      const label=document.createElement('label');label.textContent=`Eje ${nombres[k]} = `;const select=document.createElement('select');
      for(let j=0;j<modelo.n;j++){const option=document.createElement('option');option.value=j;option.textContent=`x${sub(j+1)}`;select.append(option);}select.value=eje;
      select.onchange=()=>{const nuevo=Number(select.value),otro=ejes.indexOf(nuevo);if(otro!==-1){ejes[otro]=ejes[k];$('ejes-infinitas').querySelectorAll('select')[otro].value=ejes[k];}ejes[k]=nuevo;geometria=null;dibujar();};label.append(select);$('ejes-infinitas').append(label);
    });
    $('parametros-infinitas').replaceChildren();$('controles-parametros').hidden=modelo.tipo!=='infinitas';
    modelo.libres.forEach((col,i)=>{
      const fila=document.createElement('div');fila.className='parametro-geometria';const label=document.createElement('label');label.htmlFor=`valor-t${i}`;label.textContent=`t${i+1} = ${variable(col)}`;
      const campo=document.createElement('input');campo.id=`valor-t${i}`;campo.type='text';campo.value='0';campo.maxLength=256;campo.autocomplete='off';
      const slider=document.createElement('input');slider.type='range';slider.min=-5;slider.max=5;slider.step='.1';slider.value=0;slider.setAttribute('aria-label',`Mover t${i+1} entre −5 y 5`);
      slider.oninput=()=>{campo.value=slider.value;actualizar();};campo.oninput=()=>{try{slider.value=Math.max(-5,Math.min(5,E.numero(F.desdeTexto(campo.value))));}catch{}actualizar();};fila.append(label,slider,campo);$('parametros-infinitas').append(fila);
    });
    $('limite-grafica').value=limite;$('mostrar-normales').disabled=modelo.n>3;leyenda();actualizar();
  }
  $('explicar-infinitas').onclick=abrir;$('cerrar-infinitas').onclick=()=>modal.close();
  $('girar-grafica').onclick=()=>{azimut+=.3;dibujar();};
  $('acercar-grafica').onclick=()=>{zoom=Math.min(3,zoom*1.2);dibujar();};$('alejar-grafica').onclick=()=>{zoom=Math.max(.3,zoom/1.2);dibujar();};
  $('restablecer-grafica').onclick=()=>{azimut=-.65;elevacion=.5;zoom=1;dibujar();};
  $('mostrar-normales').onchange=dibujar;
  $('limite-grafica').onchange=()=>{const v=Number($('limite-grafica').value);if(!Number.isFinite(v)||v<1e-8||v>1e8){$('limite-grafica').value=limite;return;}limite=v;geometria=null;dibujar();};
  canvas.onpointerdown=e=>{if(ejes.length!==3)return;arrastre=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};
  canvas.onpointermove=e=>{if(!arrastre)return;azimut+=(e.clientX-arrastre[0])*.01;elevacion=Math.max(-1.4,Math.min(1.4,elevacion+(e.clientY-arrastre[1])*.01));arrastre=[e.clientX,e.clientY];dibujar();};
  canvas.onpointerup=canvas.onpointercancel=()=>{arrastre=null;};modal.addEventListener('close',()=>{arrastre=null;});
  window.VisualizacionSoluciones={preparar(resultado,original,n,aprox){this.limpiar();modelo=E.crear(resultado,original,n);aproximado=aprox;$('explicar-infinitas').hidden=false;},limpiar(){modelo=null;punto=null;geometria=null;$('explicar-infinitas').hidden=true;if(modal.open)modal.close();}};
})();
