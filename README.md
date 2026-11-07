# Tlato Calculadora

Abre `index.html` en un navegador moderno o sirve esta carpeta localmente.

## Entradas

Enteros, decimales con punto o coma, fracciones, paréntesis, +, -, *, /, potencias enteras entre -100 y 100 y notación científica (por ejemplo `1e-3`). Ejemplos: `-3/4`, `(2+3)/4`, `2(3+1)`, `2pi`, `π/2`, `e`.

Los números racionales conservan exactitud mediante BigInt. `pi`, `π`, `e` y su alias `euler` se sustituyen por aproximaciones de 40 decimales: los resultados y la clasificación son del modelo racional aproximado, sin certificación simbólica de las constantes irracionales. La interfaz avisa cuando se usan. No admite variables ni funciones. Máximo 256 caracteres por celda y 2000 dígitos por resultado de expresión.

## Uso

Pulsa una celda para editar; Tab, Mayús+Tab y Enter permiten avanzar. Escape cancela la edición. La última columna contiene los términos independientes. Las dimensiones van de 1 × 2 a 15 × 15 (14 incógnitas). Modificar la matriz oculta los resultados anteriores. Eliminar una fila o columna con datos solicita confirmación.

La ayuda «¿Cómo usar?» incluye una demostración vectorial animada de 40 segundos: cursor en movimiento, conversión de 1/2 a fracción vertical, constantes pi y Euler, adición y eliminación de filas y columnas, edición de celdas, clic en Resolver y aparición progresiva de la solución. Se puede pausar y navegar entre etapas; respeta la preferencia de reducir movimiento. «Ver pasos» conserva el video local original.

## Validación

Ejecuta `node tests/pruebas.js`. Incluye 200 sistemas reproducibles, verificación de RREF, clasificación, rangos, sustitución de soluciones y comprobación de la constante y cada vector de la familia parametrizada. Incluye dimensión máxima, entradas inválidas y precedencia de expresiones.

Comprobación manual realizada en navegador: entrada y navegación por teclado, solución del ejemplo, ayuda, reproducción del video y ancho móvil de 375 px sin desbordamiento de página. No se garantiza precisión simbólica para π/e ni soporte de expresiones fuera de la gramática descrita.
