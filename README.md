# Tlato Calculadora

Aplicación web estática para resolver sistemas lineales mediante Gauss-Jordan completo (forma escalonada reducida por filas), con aritmética racional exacta basada en `BigInt`.

## Ejecutar

Abre `index.html` en un navegador moderno. No requiere instalación, servidor ni dependencias externas.

## Archivos

- `index.html`: estructura y controles.
- `css/estilos.css`: presentación adaptable.
- `js/fracciones.js`: lectura y operaciones exactas con fracciones.
- `js/gauss-jordan.js`: reducción RREF, rangos y parametrización.
- `js/app.js`: edición de matriz y presentación de resultados.
- `tests/pruebas.js`: pruebas automatizadas del núcleo matemático.

## Límites

Hasta 15 ecuaciones y 15 columnas en la matriz aumentada: como la última columna es el término independiente, el máximo es 14 incógnitas. Se permite desde 1 ecuación y 1 incógnita.

## Video «Ver pasos»

Coloca el archivo `video.mp4` en esta carpeta, al mismo nivel que `index.html`. El botón abre el modal y solicita la reproducción tras la interacción del usuario. El video no venía incluido con los archivos recibidos, por lo que debe agregarse para que pueda reproducirse.

## Pruebas

Con Node.js instalado, ejecuta desde esta carpeta:

```bash
node tests/pruebas.js
```

Las pruebas cubren fracciones exactas, pivote cero e intercambio de filas, solución única, infinitas soluciones, incompatibilidad, columnas sin pivote, filas nulas, dimensiones rectangulares y el límite máximo. Son pruebas del núcleo matemático; no sustituyen pruebas manuales en todos los navegadores y tamaños de pantalla.
# tlato_calculadora_profe_perdonenos_el-66
