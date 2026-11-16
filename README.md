# profe ya perdone el -66

## Organización y comprobaciones de integración

- `js/tema.js`: modo día/noche y preferencia local.
- `js/fracciones.js`: interpretación de expresiones y aritmética racional.
- `js/gauss-jordan.js`: reducción y clasificación.
- `js/app.js`: edición y presentación de matrices y soluciones.
- `js/ayuda.js`: recorrido animado.


Las matrices de entrada y resultado comparten columnas dentro de una sola rejilla, con corchetes exteriores y un separador continuo antes de la columna aumentada. El desplazamiento horizontal queda dentro de su contenedor.

Comprobaciones: `node tests/integracion.js`, `node tests/pruebas.js` y `node tests/practica.js`. El resultado termina en la matriz escalonada reducida.

Los límites se ajustan en `js/configuracion.js`: `fila_max` y `col_max` (incluye la columna aumentada). La gráfica opcional de sistemas infinitos usa `espacio-soluciones.js` y `visualizacion-soluciones.js`.
