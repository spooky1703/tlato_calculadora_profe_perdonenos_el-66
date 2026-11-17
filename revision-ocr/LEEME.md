# OCR temporal para revisión compartida

No se entrena un modelo: se utiliza Tesseract.js 6.0.1 en el navegador. Se inspeccionaron cuatro imágenes de la hoja de ejercicios (impresas y manuscritas) para orientar el flujo. No se garantiza transcripción perfecta, especialmente en fotos pequeñas, cuadrícula de cuaderno o fracciones apiladas.

Cargar imagen aparece al lado de Cargar archivo tanto localmente como en la página publicada. Incluye esta carpeta en Git. Se activa con window.ocr_temporal = true en js/configuracion.js.

1. Carga PNG/JPG/WebP. Recorta solo una matriz, preferiblemente la original, no todos los pasos de la hoja.
2. Indica filas y columnas, contando b. No se infieren de una lectura dudosa.
3. Lee la imagen. Para fotos difíciles, activa lectura por casillas y ajusta el rectángulo hasta que cada número quede dentro de su celda de la cuadrícula.
4. Corrige la transcripción junto a la imagen. Usa punto y coma entre coeficientes y 1/2 para las fracciones. Los interrogantes representan casillas no reconocidas, no ceros.
5. Confirma la comparación visual y carga. Solo entonces se reemplaza la matriz de la calculadora.

Las dimensiones, caracteres ambiguos, celdas vacías y división por cero bloquean la carga. Una cifra válida pero mal reconocida (por ejemplo 1 en lugar de 4) no puede detectarse solo con estas validaciones: la revisión humana sigue siendo necesaria. El porcentaje del motor no certifica exactitud.

La imagen no se envía al servidor OCR; se descarga el motor y su idioma desde CDN en el primer uso. Necesita conexión para esa descarga. Se puede cancelar. Los fallos no modifican la matriz actual.

Para desactivarlo antes de la entrega: cambiar window.ocr_temporal a false en js/configuracion.js y publicar el cambio. Para retirarlo por completo, eliminar también la carga condicional al final de js/app.js y esta carpeta. El cambio de mensaje de solución única es independiente.

Pruebas: node revision-ocr/pruebas.js.
