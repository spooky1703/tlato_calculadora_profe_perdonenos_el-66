(() => {
  const $=id=>document.getElementById(id), modal=$('guia-practica'), ns='http://www.w3.org/2000/svg';
  const pasos=[['Prepara tu matriz','Introduce tu sistema y pulsa Comenzar práctica.'],['Una operación a la vez','Normalizar el pivote y hacer cero debajo son dos pasos distintos.'],['Verifica y corrige','Se marcan los errores. La operación aparece cuando todo está bien.'],['¿Necesitas una pista?','Puedes pedirla, pero confirmar una pista reduce tu nota.'],['Mira tu progreso','Al terminar verás tu nota y los pasos que completaste.']];
  const valores=['2','0','4','0','3','9'], respuestas=['1','0','2','0','3','8'];
  const celdas=[];
  function crear(tipo,attrs,padre,contenido){const el=document.createElementNS(ns,tipo);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(contenido!==undefined)el.textContent=contenido;padre.append(el);return el;}
  for(const [id,x] of [['demo-practica-origen',32],['demo-practica-respuesta',285]]){
    const g=$(id);
    crear('path',{d:`M${x-5} 79H${x-11}V188H${x-5}M${x+176} 79H${x+182}V188H${x+176}`,fill:'none',stroke:'var(--texto-principal)','stroke-width':1.5},g);
    crear('path',{d:`M${x+116} 85V181`,stroke:'var(--texto-secundario)','stroke-width':1.5},g);
    valores.forEach((v,i)=>{
      const cx=x+(i%3)*56+(i%3===2?8:0),cy=85+Math.floor(i/3)*56;
      const rect=crear('rect',{x:cx,y:cy,width:50,height:40,rx:5,fill:'var(--fondo-panel)',stroke:'var(--borde)'},g);
      const texto=crear('text',{x:cx+25,y:cy+26,'text-anchor':'middle','font-size':17},g,id==='demo-practica-origen'?v:'');
      if(id==='demo-practica-respuesta')celdas.push({rect,texto,x:cx+30,y:cy+28});
    });
  }
  let tiempo=0,previo=null,frame,reproduciendo=false,ultimo=-1,vista=false;
  try{vista=localStorage.getItem('tlato-guia-practica-vista')==='1';}catch{}
  const duracion=22500;
  const suave=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
  function mover(t, puntos) {
    for(let i=1;i<puntos.length;i++) {
      if(t<=puntos[i][0]) {
        const a=puntos[i-1],b=puntos[i],avance=suave((t-a[0])/(b[0]-a[0]));
        return [a[1]+(b[1]-a[1])*avance,a[2]+(b[2]-a[2])*avance];
      }
    }
    return puntos[puntos.length-1].slice(1);
  }
  function dibujar(){
    const paso=Math.min(4,Math.floor(tiempo/4500)),local=tiempo-paso*4500;
    if(paso!==ultimo){ultimo=paso;$('paso-guia-practica').textContent=pasos[paso][0];$('texto-guia-practica').textContent=pasos[paso][1];$('contador-guia-practica').textContent=`${paso+1} / 5`;[...$('puntos-guia-practica').children].forEach((p,i)=>p.classList.toggle('activo',i===paso));}
    $('demo-practica-matrices').style.opacity=paso<3?1:paso===3?1-suave(local/350):0;
    $('demo-practica-pista').style.opacity=paso===3?suave(local/450):0;
    $('demo-practica-nota').style.opacity=paso===4?suave(local/450):0;
    $('demo-practica-respuesta').style.opacity=paso===0?0:paso===1?suave(local/300):1;
    let x=380,y=220,clic=0;
    celdas.forEach((c,i)=>{
      c.rect.setAttribute('stroke','var(--borde)');c.rect.setAttribute('stroke-width',1);
      c.texto.textContent=paso>1||paso===1&&local>500+i*430?respuestas[i]:'';
    });
    $('demo-practica-boton-texto').textContent=paso===0?'Comenzar práctica':'Verificar matriz';
    $('demo-practica-feedback').textContent='';
    if(paso===0){x=230+150*suave(local/1500);y=165+55*suave(local/1500);clic=Math.max(0,1-Math.abs(local-2300)/300);}
    if(paso===1){
      const recorrido=[[0,380,220],...celdas.map((c,i)=>[330+i*430,c.x,c.y]),[3200,celdas[5].x,celdas[5].y],[3850,380,220],[4500,380,220]];
      [x,y]=mover(local,recorrido);
      const i=Math.min(5,Math.max(0,Math.floor((local-200)/430)));
      if(local<3200)celdas[i].rect.setAttribute('stroke','var(--acento)');
    }
    if(paso===2){
      const ultima=celdas[5];
      [x,y]=mover(local,[[0,380,220],[1100,380,220],[1700,ultima.x,ultima.y],[2500,ultima.x,ultima.y],[3100,380,220],[4500,380,220]]);
      clic=Math.max(0,1-Math.abs(local-500)/250,1-Math.abs(local-3300)/250);
      if(local>700&&local<2500){ultima.rect.setAttribute('stroke','#c23f3f');ultima.rect.setAttribute('stroke-width',2);$('demo-practica-feedback').textContent='Una casilla por corregir';$('demo-practica-feedback').setAttribute('fill','var(--texto-principal)');}
      if(local>2400)ultima.texto.textContent='9';
      if(local>3500){$('demo-practica-feedback').textContent='✓ Correcto · (1/2) F1 → F1';$('demo-practica-boton-texto').textContent='Siguiente paso';}
    }
    if(paso===3){[x,y]=mover(local,[[0,380,220],[1700,215,205],[4500,215,205]]);clic=Math.max(0,1-Math.abs(local-2200)/300);}
    $('cursor-guia-practica').style.opacity=paso===4?1-suave(local/250):1;$('cursor-guia-practica').setAttribute('transform',`translate(${x} ${y})`);$('clic-guia-practica').style.opacity=clic;
    $('progreso-guia-practica').style.width=`${tiempo/duracion*100}%`;
  }
  function reproducir(valor){reproduciendo=valor;previo=null;cancelAnimationFrame(frame);$('pausar-guia-practica').textContent=valor?'Pausar':tiempo>=duracion?'Repetir':'Reproducir';if(valor)frame=requestAnimationFrame(animar);}
  function animar(ahora){if(!reproduciendo)return;if(previo!==null)tiempo=Math.min(duracion,tiempo+Math.min(100,ahora-previo));previo=ahora;dibujar();if(tiempo>=duracion)reproducir(false);else frame=requestAnimationFrame(animar);}
  function abrir(){tiempo=0;ultimo=-1;modal.showModal();dibujar();reproducir(!matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function ir(delta){tiempo=((ultimo+delta+5)%5)*4500+3500;previo=null;dibujar();}
  $('anterior-guia-practica').onclick=()=>ir(-1);$('siguiente-guia-practica').onclick=()=>ir(1);
  $('pausar-guia-practica').onclick=()=>{if(tiempo>=duracion)tiempo=0;reproducir(!reproduciendo);};
  $('cerrar-guia-practica').onclick=()=>modal.close();
  $('empezar-guia-practica').onclick=()=>{modal.close();document.querySelector('#matriz .celda')?.focus();};
  $('reabrir-guia-practica').onclick=abrir;
  modal.addEventListener('close',()=>{reproducir(false);vista=true;try{localStorage.setItem('tlato-guia-practica-vista','1');}catch{}});
  document.addEventListener('visibilitychange',()=>{previo=null;});
  window.GuiaPractica={primeraVez(){if(!vista)abrir();}};
})();
