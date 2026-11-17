(function (global) {
  global.TlatoRevisionOCR = { iniciar({ cargar }) {
    const boton = document.createElement('button');
    boton.type = 'button'; boton.className = 'boton secundario'; boton.textContent = 'Cargar imagen';
    boton.title = 'OCR temporal · revisión de ejercicios';
    document.getElementById('btn-subir').after(boton);
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp'; input.hidden = true;
    const modal = document.createElement('dialog'); modal.id = 'revision-ocr';
    modal.innerHTML = `
      <div class="modal-cabecera"><div><small>REVISIÓN DE EJERCICIOS · TEMPORAL</small><h2>Cargar una matriz desde una imagen</h2></div><button type="button" class="boton" data-ocr="cerrar" aria-label="Cerrar OCR">×</button></div>
      <p>Recorta solo una matriz. Comprueba signos, fracciones y la columna <b>b</b> antes de cargarla. La lectura manuscrita puede equivocarse.</p>
      <div class="ocr-herramientas"><button type="button" class="boton" data-ocr="elegir">Otra imagen</button><button type="button" class="boton" data-ocr="girar">Girar 90°</button><button type="button" class="boton" data-ocr="restablecer">Imagen completa</button></div>
      <div class="ocr-columnas"><section><h3>1. Selecciona la matriz</h3><p>Arrastra un rectángulo sobre los números, sin títulos ni operaciones alrededor.</p><canvas data-ocr="imagen" aria-label="Imagen original: arrastra para recortar"></canvas><p data-ocr="recorte"></p>
      <div class="ocr-herramientas"><label>Filas <input data-ocr="filas" type="number" min="1" step="1" value="3"></label><label>Columnas contando b <input data-ocr="columnas" type="number" min="2" step="1" value="4"></label></div>
      <label class="ocr-confirmar"><input type="checkbox" data-ocr="casillas"> Leer casilla por casilla (ajusta el recorte a una cuadrícula uniforme)</label><button type="button" class="boton principal" data-ocr="leer">Leer imagen</button><button type="button" class="boton" data-ocr="cancelar" hidden>Cancelar lectura</button></section>
      <section><h3>2. Revisa la transcripción</h3><p>Una fila por línea. Separa valores con espacios o punto y coma. Escribe las fracciones como 1/2. No se sustituyen letras por números.</p>
      <textarea data-ocr="texto" rows="10" spellcheck="false" aria-label="Transcripción editable de la matriz" placeholder="1; 2; -3; 4&#10;0; 1; 2; 5&#10;0; 0; 1; 6"></textarea>
      <p data-ocr="estado" role="status" aria-live="polite"></p><p data-ocr="validacion" role="alert"></p>
      <div data-ocr="vista" class="ocr-vista"></div>
      <label class="ocr-confirmar"><input type="checkbox" data-ocr="confirmar"> Comparé cada casilla con la imagen, incluidos signos y b.</label>
      <button type="button" class="boton principal" data-ocr="aplicar" disabled>Cargar matriz revisada</button></section></div>
      <p class="ocr-privacidad">Las imágenes se leen en este navegador. La primera lectura descarga el motor OCR; no se envía la foto a un servicio de reconocimiento.</p>`;
    document.body.append(input, modal);
    const $ = nombre => modal.querySelector(`[data-ocr="${nombre}"]`);
    const canvas = $('imagen'), ctx = canvas.getContext('2d');
    let fuente = null, recorte = null, inicio = null, worker = null, activo = false, version = 0, secuenciaArchivo = 0, candidata = null;
    let cargadorMotor;
    function mensaje(t) { $('estado').textContent = t; }
    function invalidar() { $('confirmar').checked = false; $('aplicar').disabled = true; candidata = null; }
    function validar() {
      invalidar(); $('vista').replaceChildren();
      try {
        candidata = global.OCRMatriz.analizar($('texto').value, Number($('filas').value), Number($('columnas').value));
        $('validacion').textContent = 'Dimensiones y valores válidos. Esto no garantiza que el OCR haya leído bien: compáralos con la foto.';
        const tabla = document.createElement('table');
        candidata.forEach((fila, i) => {
          const tr = document.createElement('tr');
          fila.forEach((v, j) => { const td = document.createElement('td'); td.textContent = v; td.title = `Fila ${i+1}, columna ${j+1}`; if(j===fila.length-1)td.className='ocr-b'; tr.append(td); }); tabla.append(tr);
        }); $('vista').append(tabla);
      } catch(e) { $('validacion').textContent = e.message; }
    }
    function ocupado(valor) {
      activo=valor;
      for(const n of ['leer','girar','restablecer','elegir','filas','columnas','texto','casillas']) $(n).disabled=valor;
      $('cancelar').hidden=!valor; $('confirmar').disabled=valor; $('aplicar').disabled=true;
    }
    async function cancelar() {
      version++; const anterior=worker; worker=null; ocupado(false); invalidar();
      if(anterior) { try { await anterior.terminate(); } catch {} }
    }
    function dibujar() {
      if(!fuente)return;
      canvas.width=fuente.width; canvas.height=fuente.height; ctx.drawImage(fuente,0,0);
      if($('casillas').checked) { const r=recorte||{x:0,y:0,w:canvas.width,h:canvas.height}; const nf=Number($('filas').value), nc=Number($('columnas').value); if(nf>0&&nf<=global.fila_max&&nc>1&&nc<=global.col_max){ctx.strokeStyle='#d3540070';ctx.lineWidth=Math.max(1,canvas.width/700);for(let i=1;i<nf;i++){ctx.beginPath();ctx.moveTo(r.x,r.y+r.h*i/nf);ctx.lineTo(r.x+r.w,r.y+r.h*i/nf);ctx.stroke();}for(let j=1;j<nc;j++){ctx.beginPath();ctx.moveTo(r.x+r.w*j/nc,r.y);ctx.lineTo(r.x+r.w*j/nc,r.y+r.h);ctx.stroke();}} }
      if(recorte) {ctx.strokeStyle='#d35400';ctx.lineWidth=Math.max(2,canvas.width/400);ctx.strokeRect(recorte.x,recorte.y,recorte.w,recorte.h);}
      $('recorte').textContent=recorte?'Se leerá el rectángulo marcado.':'Se leerá la imagen completa.';
    }
    function punto(e) { const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(canvas.width,(e.clientX-r.left)*canvas.width/r.width)),y:Math.max(0,Math.min(canvas.height,(e.clientY-r.top)*canvas.height/r.height))}; }
    canvas.onpointerdown=e=>{if(!fuente||activo)return;inicio=punto(e);canvas.setPointerCapture(e.pointerId);};
    canvas.onpointermove=e=>{if(!inicio)return;const p=punto(e);recorte={x:Math.min(p.x,inicio.x),y:Math.min(p.y,inicio.y),w:Math.abs(p.x-inicio.x),h:Math.abs(p.y-inicio.y)};dibujar();};
    canvas.onpointerup=()=>{if(!inicio)return;inicio=null;if(recorte&&(recorte.w<10||recorte.h<10))recorte=null;invalidar();$('texto').value='';$('vista').replaceChildren();$('validacion').textContent='';mensaje('Recorte actualizado. Vuelve a leer la imagen.');dibujar();};
    canvas.onpointercancel=()=>{inicio=null;};
    $('girar').onclick=()=>{if(!fuente)return;const rotada=document.createElement('canvas');rotada.width=fuente.height;rotada.height=fuente.width;const c=rotada.getContext('2d');c.translate(rotada.width,0);c.rotate(Math.PI/2);c.drawImage(fuente,0,0);fuente=rotada;reiniciarRecorte();};
    function reiniciarRecorte(){recorte=null;invalidar();$('texto').value='';$('vista').replaceChildren();$('validacion').textContent='';mensaje('Imagen lista para leer.');dibujar();}
    $('restablecer').onclick=reiniciarRecorte;
    function motor() {
      if(global.Tesseract)return Promise.resolve();
      if(!cargadorMotor)cargadorMotor=new Promise((resolve,reject)=>{
        const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';
        const timer=setTimeout(()=>{script.remove();cargadorMotor=null;reject(new Error('No se pudo descargar el OCR. Revisa tu conexión y vuelve a intentar.'));},30000);
        script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);script.remove();cargadorMotor=null;reject(new Error('No se pudo descargar el OCR. Revisa tu conexión.'));};document.head.append(script);
      });return cargadorMotor;
    }
    $('leer').onclick=async()=>{
      if(!fuente||activo)return;
      invalidar();$('texto').value='';$('vista').replaceChildren();$('validacion').textContent='';ocupado(true);const turno=++version;
      mensaje('Preparando el OCR…');
      const limite=setTimeout(()=>{if(turno===version){cancelar();mensaje('La lectura tardó demasiado. Recorta una región más pequeña e inténtalo otra vez.');}},90000);
      try {
        await motor(); if(turno!==version)return;
        const nuevo=await Tesseract.createWorker('eng',1,{logger:m=>{if(turno===version)mensaje(m.status==='recognizing text'?`Leyendo… ${Math.round(m.progress*100)} %`:'Cargando el motor OCR…');}});
        if(turno!==version){await nuevo.terminate();return;}worker=nuevo;
        await worker.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1',user_defined_dpi:'300'});
        const r=recorte||{x:0,y:0,w:fuente.width,h:fuente.height};
        function prepararImagen(zona) {
          const lectura=document.createElement('canvas');const escala=Math.min(4,2400/Math.max(zona.w,zona.h));
          lectura.width=Math.round(zona.w*escala)+40;lectura.height=Math.round(zona.h*escala)+40;
          const c=lectura.getContext('2d');c.fillStyle='white';c.fillRect(0,0,lectura.width,lectura.height);c.drawImage(fuente,zona.x,zona.y,zona.w,zona.h,20,20,lectura.width-40,lectura.height-40);return lectura;
        }
        let texto,confianza;
        if($('casillas').checked){
          const nf=Number($('filas').value),nc=Number($('columnas').value);
          if(!Number.isInteger(nf)||!Number.isInteger(nc)||nf<1||nc<2||nf>global.fila_max||nc>global.col_max)throw new Error('Corrige las dimensiones de la cuadrícula.');
          await worker.setParameters({tessedit_pageseg_mode:'7'});
          const filas=[];let suma=0;
          for(let i=0;i<nf;i++){
            const fila=[];
            for(let j=0;j<nc;j++){
              if(turno!==version)return;
              const {data}=await worker.recognize(prepararImagen({x:r.x+j*r.w/nc,y:r.y+i*r.h/nf,w:r.w/nc,h:r.h/nf}));
              if(turno!==version)return;
              fila.push(data.text.trim().replace(/^[−–—-]\s+(?=\d)/,'-')||'?');suma+=data.confidence;
              mensaje(`Leyendo casilla ${i*nc+j+1} de ${nf*nc}…`);
            }filas.push(fila.join('; '));
          }texto=filas.join('\n');confianza=suma/(nf*nc);
        }else{
          const {data}=await worker.recognize(prepararImagen(r));if(turno!==version)return;texto=data.text.trim();confianza=data.confidence;
        }
        $('texto').value=texto;validar();
        mensaje(`Lectura terminada. Confianza estimada del motor: ${Math.round(confianza)} %. No es una garantía. Revisa también los signos que pudieron omitirse.`);
      } catch(e) { if(turno===version)mensaje(`No se pudo completar la lectura: ${e.message}. Puedes transcribir la imagen en el cuadro.`); }
      finally {clearTimeout(limite);if(turno===version){const anterior=worker;worker=null;ocupado(false);if(anterior)await anterior.terminate().catch(()=>{});}}
    };
    $('cancelar').onclick=()=>{cancelar();mensaje('Lectura cancelada. Tu matriz original no cambió.');};
    $('texto').oninput=validar; for(const n of ['filas','columnas','casillas']) $(n).oninput=()=>{validar();dibujar();};
    $('filas').max=global.fila_max;$('columnas').max=global.col_max;
    $('confirmar').onchange=()=>{$('aplicar').disabled=activo||!fuente||!candidata||!$('confirmar').checked;};
    $('aplicar').onclick=()=>{
      if(activo||!fuente||!$('confirmar').checked)return;
      try {const datos=global.OCRMatriz.analizar($('texto').value,Number($('filas').value),Number($('columnas').value));if(cargar(datos)!==false)modal.close();}
      catch(e){invalidar();$('validacion').textContent=e.message;}
    };
    $('cerrar').onclick=()=>modal.close();modal.addEventListener('close',()=>{secuenciaArchivo++;cancelar();boton.focus();});
    boton.onclick=()=>input.click();$('elegir').onclick=()=>input.click();
    input.onchange=async()=>{
      const archivo=input.files[0];input.value='';if(!archivo)return;
      await cancelar();const carga=++secuenciaArchivo;
      if(!modal.open)modal.showModal();fuente=null;recorte=null;ctx.clearRect(0,0,canvas.width,canvas.height);$('texto').value='';$('vista').replaceChildren();$('validacion').textContent='';mensaje('Abriendo imagen…');
      let bitmap;
      try{
        if(!['image/png','image/jpeg','image/webp'].includes(archivo.type))throw new Error('Usa PNG, JPG o WebP. Convierte HEIC o DNG antes de cargar.');
        if(archivo.size>20*1024*1024)throw new Error('La imagen supera 20 MB. Recórtala o guárdala como JPG.');
        bitmap=await createImageBitmap(archivo);if(carga!==secuenciaArchivo)return;
        if(bitmap.width*bitmap.height>50000000)throw new Error('La imagen es demasiado grande. Recorta solo la matriz.');
        fuente=document.createElement('canvas');const escala=Math.min(1,3000/Math.max(bitmap.width,bitmap.height));fuente.width=Math.round(bitmap.width*escala);fuente.height=Math.round(bitmap.height*escala);
        const c=fuente.getContext('2d');c.fillStyle='white';c.fillRect(0,0,fuente.width,fuente.height);c.drawImage(bitmap,0,0,fuente.width,fuente.height);dibujar();mensaje('Selecciona la matriz e indica sus dimensiones. La última columna es b.');
      }catch(e){if(carga===secuenciaArchivo)mensaje(e.message||'No se pudo abrir esta imagen.');}finally{if(bitmap)bitmap.close();}
    };
  }};
})(window);
