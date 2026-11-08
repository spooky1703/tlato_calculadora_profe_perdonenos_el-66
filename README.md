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
