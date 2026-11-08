# profe ya perdone el -66

## Organización y comprobaciones de integración

- `js/tema.js`: modo día/noche y preferencia local.
- `js/fracciones.js`: interpretación de expresiones y aritmética racional.
- `js/gauss-jordan.js`: reducción, clasificación y parametrización.
- `js/espacio-soluciones.js`: modelo geométrico exacto y proyecciones.
- `js/visualizacion-soluciones.js`: ventana, controles y dibujo de la familia.
- `js/app.js`: edición y presentación de matrices y soluciones.
- `js/ayuda.js`: recorrido animado.

La página debe cargar el modelo geométrico y su visualizador antes de `app.js`, y conservar el botón y la ventana de infinitas soluciones. Ejecuta `node tests/integracion.js` para detectar módulos omitidos o identificadores ausentes. Ejecuta también `node tests/pruebas.js` y `node tests/espacio-soluciones.js`.

Las matrices de entrada y resultado comparten columnas dentro de una sola rejilla, con corchetes exteriores y un separador continuo antes de la columna aumentada. El desplazamiento horizontal queda dentro de su contenedor.

## Bienvenida en la primera visita

El recorrido se abre automáticamente y se reproduce una vez. Al cerrarlo o elegir «Usar calculadora», se guarda `tlato-recorrido-visto` en el almacenamiento del navegador para no interrumpir visitas posteriores. Se puede reabrir desde «Ver recorrido». Si el almacenamiento no está disponible, la ayuda funciona pero la preferencia no persiste. Respeta la preferencia de movimiento reducido: en ese caso se abre pausado y permite avanzar manualmente o iniciar la animación.

## Guía al cargar archivos

La primera pulsación en «Cargar archivo» muestra ejemplos animados para TXT y Excel. Se puede reabrir con «Ver formato». «Ver formato» permanece oculto hasta pulsar «Cargar archivo»; ese estado se recuerda mediante `tlato-cargar-pulsado`. El TXT de ejemplo anima su transferencia a una matriz con corchetes dentro de una miniatura de Tlato y usa punto y coma, filas completas y ceros explícitos; Excel muestra la primera hoja desde A1, sin encabezados ni fórmulas. La guía documenta las limitaciones actuales del importador y pide revisar la matriz antes de resolver; no cambia su interpretación de datos. «Elegir archivo» abre el selector desde la guía. El arrastre directo conserva su comportamiento anterior.

## Práctica guiada — Unidad 1

El selector «Calculadora / Practicar» permite iniciar una práctica desde la matriz del editor. La práctica usa valores racionales exactos; no admite π ni Euler para evitar evaluar aproximaciones como si fueran expresiones simbólicas.

`js/practica-modelo.js` genera una ruta determinista: buscar el primer pivote disponible, intercambiar si corresponde, normalizar a 1 y eliminar debajo; repetir y después eliminar encima por columnas de izquierda a derecha. Cada matriz corresponde a una operación elemental que cambia valores. Se saltan columnas sin pivote y operaciones triviales. En sistemas incompatibles se incluye el pivote de b para completar la RREF, con la contradicción antes de filas nulas.

`js/practica-ui.js` muestra la matriz anterior y una respuesta en blanco. Valida toda la matriz mediante fracciones, marca errores sin revelar la operación y permite avanzar solo después de acertar. Las filas que no cambian también deben completarse. Al acertar, se muestra la operación y se guarda el paso en un historial plegable. Los resultados finales permanecen ocultos hasta completar la ruta.

Cada verificación con valores válidos pero incorrectos suma un intento incorrecto, independientemente del número de casillas erróneas. Los campos vacíos, inválidos o constantes no admitidas no cuentan como intento. Nota = `10 × número de pasos / (número de pasos + intentos incorrectos + pistas confirmadas)`, mostrada con dos decimales, junto al número de pasos acertados a la primera. Una matriz ya reducida no genera pasos ni calificación. El progreso es de la sesión actual y salir de una práctica activa pide confirmación.

Pruebas: `node tests/practica.js`. Comprueba cada operación individual, la coincidencia con la RREF, 200 sistemas reproducibles, tamaños rectangulares y máximos, intercambios, incompatibilidad, fracciones y las reglas de intentos y calificación.

Las pistas permanecen ocultas hasta confirmar el aviso. El aviso muestra la nota antes y después del descuento. Cada pista se cobra una sola vez por paso y equivale a un intento incorrecto; cancelar no descuenta. No se cobran pistas en pasos ya resueltos ni después de finalizar.
