(() => {
  const $ = id => document.getElementById(id), F = window.Fraccion, M = window.PracticaModelo;
  let sesion, alFinal, entradas = [];
  function valorVisual(v) {
    const el=document.createElement('span');
    if(v.d===1n)el.textContent=String(v.n);
    else {el.className='fraccion';for(const [clase,valor] of [['numerador',v.n],['barra',''],['denominador',v.d]]){const parte=document.createElement('span');parte.className=clase;parte.textContent=String(valor);el.append(parte);}}
    return el;
  }
  function matrizEn(destino, matriz, editable=false) {
    const n=matriz[0].length-1, tabla=document.createElement('div');tabla.className=editable?'matriz matriz-respuesta':'tabla-resultado';
    tabla.style.gridTemplateColumns=`repeat(${n}, max-content) 2px max-content`;
    const campos=[];
    matriz.forEach((fila,i)=>{
      campos[i]=[];
      fila.forEach((v,j)=>{
        const celda=document.createElement(editable?'input':'span');
        celda.className=editable?'celda entrada-practica':'valor-matriz';
        celda.style.gridRow=i+1;celda.style.gridColumn=j<n?j+1:j+2;
        if(editable){
          celda.type='text';celda.maxLength=256;celda.autocomplete='off';celda.spellcheck=false;
          celda.setAttribute('aria-label',`Respuesta fila ${i+1}, ${j===n?'término independiente':`columna ${j+1}`}`);
          celda.addEventListener('input',()=>{celda.classList.remove('respuesta-incorrecta');celda.removeAttribute('aria-invalid');});
          celda.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const todas=campos.flat();todas[(todas.indexOf(celda)+1)%todas.length].focus();}});
          campos[i][j]=celda;
        }else celda.append(valorVisual(v));
        tabla.append(celda);
      });
    });
    const separador=document.createElement('span');separador.className='separador-aumentada';separador.style.gridColumn=n+1;separador.style.gridRow=`1 / span ${matriz.length}`;separador.setAttribute('aria-hidden','true');tabla.append(separador);
    destino.replaceChildren(tabla);return campos;
  }
  function progreso() {
    const total=sesion.plan.pasos.length;
    $('progreso-practica').max=total||1;$('progreso-practica').value=sesion.terminada?total:sesion.indice+(sesion.correcto?1:0);
    $('errores-practica').textContent=`${sesion.errores} ${sesion.errores===1?'intento incorrecto':'intentos incorrectos'} · ${sesion.pistas} ${sesion.pistas===1?'pista':'pistas'}`;
    $('paso-practica').textContent=sesion.terminada?`${total} pasos completados`:`Paso ${sesion.indice+1} de ${total}`;
  }
  function mostrarPaso() {
    $('pista-practica').hidden=true;$('pedir-pista-practica').hidden=false;
    progreso();$('mensaje-practica').hidden=true;$('operacion-practica').hidden=true;$('siguiente-practica').hidden=true;$('verificar-practica').hidden=false;
    if(sesion.terminada){terminar();return;}
    const paso=sesion.plan.pasos[sesion.indice];
    $('etapa-practica').textContent=paso.etapa;$('objetivo-practica').textContent=paso.objetivo;$('notas-practica').textContent=paso.notas.join(' ');
    matrizEn($('anterior-practica'),paso.anterior);
    entradas=matrizEn($('respuesta-practica'),paso.siguiente,true);
    $('siguiente-practica').textContent=sesion.indice===sesion.plan.pasos.length-1?'Terminar práctica':'Siguiente paso';
  }
  function verificar() {
    if(!sesion||sesion.correcto||sesion.terminada)return;
    entradas.flat().forEach(el=>{el.classList.remove('respuesta-incorrecta');el.removeAttribute('aria-invalid');});
    const r=sesion.verificar(entradas.map(f=>f.map(el=>el.value)));
    const mensaje=$('mensaje-practica');mensaje.hidden=false;mensaje.className='mensaje';
    if(r.estado==='invalida'){
      r.invalidas.forEach(({fila,columna})=>{const el=entradas[fila][columna];el.classList.add('respuesta-incorrecta');el.setAttribute('aria-invalid','true');});
      const primero=r.invalidas[0];mensaje.textContent=`Completa todas las casillas con valores válidos. Fila ${primero.fila+1}, columna ${primero.columna+1}: ${primero.mensaje} No cuenta como intento.`;mensaje.classList.add('error');entradas[primero.fila][primero.columna].focus();return;
    }
    if(r.estado==='incorrecta'){
      r.incorrectas.forEach(([i,j])=>{entradas[i][j].classList.add('respuesta-incorrecta');entradas[i][j].setAttribute('aria-invalid','true');});
      mensaje.textContent=`${r.incorrectas.length} ${r.incorrectas.length===1?'casilla por corregir':'casillas por corregir'}. Revisa las marcadas. Se registró un intento incorrecto; la operación sigue oculta.`;mensaje.classList.add('error');progreso();return;
    }
    if(r.estado==='correcta'){
      $('pedir-pista-practica').hidden=true;
      matrizEn($('respuesta-practica'), sesion.plan.pasos[sesion.indice].siguiente);
      mensaje.textContent='¡Matriz correcta! Esta fue la operación elemental.';mensaje.classList.add('exito-practica');
      $('operacion-practica').textContent=r.operacion;$('operacion-practica').hidden=false;
      $('verificar-practica').hidden=true;$('siguiente-practica').hidden=false;
      const item=document.createElement('details'),titulo=document.createElement('summary');titulo.textContent=`Paso ${sesion.indice+1} · ${r.operacion} · ${sesion.intentos[sesion.indice].errores ? `${sesion.intentos[sesion.indice].errores} intentos incorrectos` : 'a la primera'}${sesion.intentos[sesion.indice].pista ? ' · con pista' : ''}`;item.append(titulo);
      const scroll=document.createElement('div');scroll.className='desplazamiento-matriz';matrizEn(scroll,sesion.plan.pasos[sesion.indice].siguiente);item.append(scroll);
      $('lista-historial-practica').append(item);$('historial-practica').hidden=false;progreso();$('siguiente-practica').focus();
    }
  }
  function terminar() {
    $('ejercicio-practica').hidden=true;$('final-practica').hidden=false;
    const total=sesion.plan.pasos.length;
    $('nota-practica').textContent=total?`${sesion.nota.toFixed(2)} / 10`:'Ya estaba reducida';
    $('detalle-nota-practica').textContent=total?`Completaste ${total} pasos; ${sesion.intentos.filter(p=>p.errores===0&&!p.pista).length} a la primera sin pistas. ${sesion.errores} ${sesion.errores===1?'intento incorrecto':'intentos incorrectos'} y ${sesion.pistas} ${sesion.pistas===1?'pista':'pistas'}. Nota: 10 × ${total} / (${total} + ${sesion.errores} + ${sesion.pistas}).`:'Esta matriz no necesita operaciones. No se asigna calificación porque no hubo pasos que evaluar.';
    const resultado=sesion.plan.resultado;
    $('clasificacion-practica').textContent=resultado.tipo==='unica'?'Tu sistema tiene una solución única.':resultado.tipo==='infinitas'?'Tu sistema tiene infinitas soluciones.':'Tu sistema no tiene solución: la matriz contiene una contradicción.';
  }
  function salir() {
    if(sesion&&!sesion.terminada&&!confirm('¿Salir de la práctica? Se perderá el progreso y la calificación de esta sesión.'))return false;
    $('confirmar-pista-practica').close();
    sesion=null;$('panel-practica').hidden=true;$('editor-sistema').hidden=false;return true;
  }
  $('pedir-pista-practica').onclick=()=>{
    if(!sesion||sesion.terminada||sesion.correcto)return;
    const total=sesion.plan.pasos.length, nueva=10*total/(total+sesion.errores+sesion.pistas+1);
    $('aviso-descuento-pista').textContent=`Ver esta pista reducirá tu nota de ${sesion.nota.toFixed(2)} a ${nueva.toFixed(2)} / 10. Equivale a un intento incorrecto y se cobra una sola vez por paso. Cancelar no descuenta.`;
    $('confirmar-pista-practica').showModal();
  };
  $('cancelar-pista-practica').onclick=()=>$('confirmar-pista-practica').close();
  $('aceptar-pista-practica').onclick=()=>{
    if(sesion?.pedirPista()){$('pista-practica').hidden=false;$('pedir-pista-practica').hidden=true;progreso();}
    $('confirmar-pista-practica').close();
    $('verificar-practica').focus();
  };
  $('verificar-practica').onclick=verificar;
  $('siguiente-practica').onclick=()=>{if(sesion?.avanzar()){mostrarPaso();if(!sesion.terminada)entradas[0][0].focus();}};
  $('salir-practica').onclick=()=>{if(salir())$('resolver').focus();};
  $('solucion-practica').onclick=()=>{if(sesion?.terminada){alFinal();$('seccion-resultado').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}};
  window.PracticaUI={salir,iniciar(original,n,final){
    const plan=M.generar(original,n);sesion=M.sesion(plan);alFinal=final;
    $('editor-sistema').hidden=true;$('seccion-resultado').hidden=true;$('panel-practica').hidden=false;
    $('ejercicio-practica').hidden=false;$('final-practica').hidden=true;$('historial-practica').hidden=true;$('lista-historial-practica').replaceChildren();
    mostrarPaso();$('panel-practica').scrollIntoView({block:'start'});if(entradas.length&&!sesion.terminada)entradas[0][0].focus();
  }};
})();
