(() => {
  const $ = id => document.getElementById(id), F = window.Fraccion;
  const modal = $('modal-infinitas'), canvas = $('grafica-infinitas'), ctx = canvas.getContext('2d');
  let modelo, parametros, ejes, aproximado, punto, azimut = -.6, elevacion = .45, zoom = 1, arrastre;
  const vector = v => [...v.map(window.EspacioSoluciones.numero), ...Array(3-v.length).fill(0)];
  const suma = (a,b,k=1) => a.map((v,i)=>v+b[i]*k);
  const producto = (a,b) => a.reduce((s,v,i)=>s+v*b[i],0);
  function texto(padre, contenido, clase) { const el = document.createElement('div'); el.textContent = contenido; if(clase) el.className=clase; padre.append(el); return el; }
  function dibujar() {
    if (!modelo || !punto) return;
    ctx.clearRect(0,0,900,480); ctx.fillStyle='#F8FAF8'; ctx.fillRect(0,0,900,480);
    try {
      const imagen = modelo.proyectar(ejes), origen = vector(imagen.origen), actual = vector(ejes.map(i=>punto[i]));
      const base = [];
      for (const v of imagen.base.map(vector)) {
        let w = v;
        for (const b of base) w = suma(w,b,-producto(w,b));
        const norma = Math.hypot(...w);
        if (!Number.isFinite(norma) || norma < 1e-12) throw new Error('La proyección está demasiado mal condicionada para dibujarla de forma fiable. Consulta las coordenadas exactas.');
        base.push(w.map(x=>x/norma));
      }
      const escala = Math.max(3, ...origen.map(Math.abs), ...actual.map(Math.abs)) * 1.35;
      const centro = origen.map(v=>v*.45), tamano = escala * 1.4;
      const es3d = ejes.length === 3;
      function proyectar(v) {
        const [x,y,z] = suma(v,centro,-1).map(x=>x/escala);
        if(!es3d) return [450+x*145*zoom,240-y*145*zoom];
        const a=x*Math.cos(azimut)-y*Math.sin(azimut), b=x*Math.sin(azimut)+y*Math.cos(azimut);
        return [450+a*145*zoom,240+(b*Math.sin(elevacion)-z*Math.cos(elevacion))*145*zoom];
      }
      function linea(a,b,color,grosor=1) { const p=proyectar(a),q=proyectar(b);ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.strokeStyle=color;ctx.lineWidth=grosor;ctx.stroke(); }
      const combinacion = (u,v=0,w=0) => base.reduce((s,b,i)=>suma(s,b,[u,v,w][i]),origen);
      if(base.length===1) linea(combinacion(-tamano),combinacion(tamano),'#4F7568',3);
      if(base.length>=2) {
        if(base.length===2) {
          ctx.beginPath(); [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([u,v],i)=>{ const p=proyectar(combinacion(u*tamano,v*tamano));i?ctx.lineTo(...p):ctx.moveTo(...p); }); ctx.closePath();ctx.fillStyle='#98BCAE38';ctx.fill();
        }
        const capas=base.length===3?[-1,0,1]:[0];
        for(const capa of capas) for(let k=-5;k<=5;k++) {
          linea(combinacion(-tamano,k*tamano/5,capa*tamano),combinacion(tamano,k*tamano/5,capa*tamano),'#6F998875');
          linea(combinacion(k*tamano/5,-tamano,capa*tamano),combinacion(k*tamano/5,tamano,capa*tamano),'#6F998875');
        }
        if(base.length===3) for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++)linea(combinacion(u*tamano,v*tamano,-tamano),combinacion(u*tamano,v*tamano,tamano),'#6F998875');
      }
      for(let i=0;i<ejes.length;i++) {
        const a=[0,0,0],b=[0,0,0];a[i]=-tamano;b[i]=tamano;
        linea(a,b,'#737F7A',1.3);const p=proyectar(b);ctx.fillStyle='#35534A';ctx.font='15px system-ui';ctx.fillText(`x${ejes[i]+1}`,p[0]+5,p[1]-6);
        for(const signo of [-1,1]){const v=[0,0,0];v[i]=signo*escala;const marca=proyectar(v);ctx.beginPath();ctx.arc(...marca,2,0,Math.PI*2);ctx.fill();ctx.font='11px system-ui';ctx.fillText(Number(signo*escala).toPrecision(3),marca[0]+5,marca[1]+12);}
      }
      const p=proyectar(actual);ctx.beginPath();ctx.arc(...p,7,0,Math.PI*2);ctx.fillStyle='#286B91';ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();
      const formas=['un punto','una recta','un plano','todo el espacio de tres coordenadas'];
      $('estado-grafica').textContent = `${modelo.n>3?'La proyección ocupa':'La familia ocupa'} ${formas[imagen.dimension]}. ${es3d?'Vista 3D giratoria.':ejes.length===2?'Vista 2D.':'Vista sobre una recta numérica.'}`;
      $('girar-grafica').disabled = !es3d;
    } catch(error) { $('estado-grafica').textContent=`No se puede dibujar esta escala: ${error.message}`; }
  }
  function actualizar() {
    const error = $('error-parametro'); error.hidden=true;
    try {
      const entradas = [...$('parametros-infinitas').querySelectorAll('input[type=text]')];
      parametros = entradas.map((el,i)=>{try { el.removeAttribute('aria-invalid');return F.desdeTexto(el.value); }catch(e){el.setAttribute('aria-invalid','true');throw new Error(`t${i+1}: ${e.message}`);}});
      const evaluacion=modelo.evaluar(parametros); punto=evaluacion.punto;
      $('punto-infinitas').replaceChildren();punto.forEach((v,i)=>texto($('punto-infinitas'),`x${i+1} = ${v.aTexto()}`));
      $('comprobacion-infinitas').replaceChildren();evaluacion.comprobaciones.forEach((c,i)=>texto($('comprobacion-infinitas'),`Ecuación ${i+1}: ${c.izquierda.aTexto()} = ${c.derecha.aTexto()} ${c.izquierda.restar(c.derecha).esCero()?'✓':'✗'}`));
      const constantes = entradas.some(el=>F.contieneConstantes(el.value));
      if(aproximado || constantes) texto($('comprobacion-infinitas'),'π y Euler están aproximados: esta comprobación corresponde al modelo racional utilizado.','nota-geometria');
      dibujar();
    } catch(e) { error.hidden=false;error.textContent=e.message; punto=null;ctx.clearRect(0,0,900,480);$('punto-infinitas').replaceChildren();$('comprobacion-infinitas').replaceChildren();$('estado-grafica').textContent='Corrige el parámetro para actualizar el punto y la gráfica.'; }
  }
  function abrir() {
    if(!modelo) return;
    modal.showModal(); azimut=-.6;elevacion=.45;zoom=1;
    const dimension=modelo.libres.length;
    const forma=dimension===1?'una recta':dimension===2?'un plano':`un espacio afín de dimensión ${dimension}`;
    $('explicacion-infinitas').textContent=`Tus ${modelo.n} incógnitas tienen ${dimension} ${dimension===1?'variable libre':'variables libres'}: la familia de soluciones forma ${forma}. Cada parámetro puede tomar cualquier valor real. Al cambiarlo obtienes otra solución de todas las ecuaciones. Dimensión = ${modelo.n} incógnitas − rango ${modelo.n-dimension} = ${dimension}.`;
    $('proyeccion-infinitas').textContent=modelo.n>3?'Proyección parcial: elige tres incógnitas distintas. Se muestra la imagen de toda la familia sobre esos ejes, no una sección que fija las demás variables. Distintas soluciones pueden coincidir en el mismo punto de esta vista.':'La gráfica representa la familia completa en tus coordenadas; solo se dibuja una zona finita.';
    $('ejes-infinitas').replaceChildren();ejes=Array.from({length:Math.min(3,modelo.n)},(_,i)=>i);
    if(modelo.n>3) ejes.forEach((eje,k)=>{
      const label=document.createElement('label');label.textContent=`Eje ${k+1} `;const select=document.createElement('select');
      for(let j=0;j<modelo.n;j++){const option=document.createElement('option');option.value=j;option.textContent=`x${j+1}`;select.append(option);} select.value=eje;
      select.onchange=()=>{const nuevo=Number(select.value),otro=ejes.indexOf(nuevo);if(otro!==-1){ejes[otro]=ejes[k];$('ejes-infinitas').querySelectorAll('select')[otro].value=ejes[k];}ejes[k]=nuevo;dibujar();}; label.append(select);$('ejes-infinitas').append(label);
    });
    $('parametros-infinitas').replaceChildren();
    modelo.libres.forEach((col,i)=>{
      const fila=document.createElement('div');fila.className='parametro-geometria';
      const label=document.createElement('label');label.htmlFor=`valor-t${i}`;label.textContent=`t${i+1} = x${col+1}`;
      const campo=document.createElement('input');campo.id=`valor-t${i}`;campo.type='text';campo.value='0';campo.maxLength=256;campo.autocomplete='off';
      const slider=document.createElement('input');slider.type='range';slider.min=-5;slider.max=5;slider.step='.1';slider.value=0;slider.setAttribute('aria-label',`Mover t${i+1} entre −5 y 5`);
      slider.oninput=()=>{campo.value=slider.value;actualizar();};campo.oninput=()=>{try{const v=window.EspacioSoluciones.numero(F.desdeTexto(campo.value));slider.value=Math.max(-5,Math.min(5,v));slider.title=Math.abs(v)>5?'El valor escrito está fuera del intervalo del deslizador.':'';}catch{}actualizar();};
      fila.append(label,slider,campo);$('parametros-infinitas').append(fila);
    }); actualizar();
  }
  $('explicar-infinitas').onclick=abrir;$('cerrar-infinitas').onclick=()=>modal.close();
  $('girar-grafica').onclick=()=>{azimut+=.3;dibujar();};
  $('acercar-grafica').onclick=()=>{zoom=Math.min(3,zoom*1.2);dibujar();};$('alejar-grafica').onclick=()=>{zoom=Math.max(.3,zoom/1.2);dibujar();};
  $('restablecer-grafica').onclick=()=>{azimut=-.6;elevacion=.45;zoom=1;dibujar();};
  canvas.onpointerdown=e=>{if(ejes?.length!==3)return;arrastre=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};
  canvas.onpointermove=e=>{if(!arrastre)return;azimut+=(e.clientX-arrastre[0])*.01;elevacion=Math.max(-1.4,Math.min(1.4,elevacion+(e.clientY-arrastre[1])*.01));arrastre=[e.clientX,e.clientY];dibujar();};
  canvas.onpointerup=canvas.onpointercancel=()=>{arrastre=null;};
  window.VisualizacionSoluciones={preparar(resultado,original,n,aprox){this.limpiar();if(resultado.tipo==='infinitas'){modelo=window.EspacioSoluciones.crear(resultado,original,n);aproximado=aprox;$('explicar-infinitas').hidden=false;}},limpiar(){modelo=null;punto=null;$('explicar-infinitas').hidden=true;if(modal.open)modal.close();}};
})();
