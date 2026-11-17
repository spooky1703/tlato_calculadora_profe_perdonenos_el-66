# Cómo resuelve Tlato un sistema y cómo funciona la práctica

Guía de estudio basada en el código revisado el 16 de noviembre de 2026.

Este informe explica el cálculo y la verificación de respuestas. No incluye diseño, HTML, CSS, animaciones ni carga de archivos.

## 1. La idea que debemos entender primero

El programa no adivina soluciones ni busca una matriz parecida en una lista. Recibe una matriz aumentada, hace operaciones elementales y llega a su forma escalonada reducida. La última columna contiene los términos independientes, también llamada columna b.

El recorrido principal es:

**Texto escrito → fracciones → operaciones de Gauss-Jordan → matriz final → clasificación.**

En práctica agrega otra parte:

**Matriz inicial → lista de operaciones → respuesta del alumno → comparación exacta → siguiente paso y calificación.**

No conviene decir que cada archivo “no puede fallar en ningún caso”. Lo defendible es explicar por qué el método matemático es correcto, qué entradas acepta el programa y qué comprobaciones hemos realizado sobre su implementación.

## 2. `configuracion.js`: los límites del programa

Contiene `fila_max = 120` y `col_max = 120`. Los publica para que los demás archivos usen los mismos límites.

`col_max` incluye la columna b. Por eso la configuración actual admite hasta 120 ecuaciones y 119 incógnitas.

Este archivo no calcula soluciones. Su trabajo es evitar que una parte del programa permita un tamaño que otra rechaza. Cambiar los límites no demuestra que cualquier matriz de ese tamaño se procese rápido: el tiempo y la memoria también dependen de los números y del número de operaciones.

**Para explicarlo:** “Aquí centralizamos el tamaño admitido. Es un límite de uso, no una propiedad del método de Gauss-Jordan”.

## 3. `fracciones.js`: cómo se representan los números

### Qué hace

Guarda cada número como numerador `n` y denominador `d`. Por ejemplo, un medio se guarda como 1 y 2, no como un decimal aproximado.

Usa `BigInt`, que permite trabajar con enteros grandes sin el redondeo habitual de los números decimales de JavaScript. No significa memoria infinita.

### Las partes importantes

- `mcd(a, b)` encuentra el máximo común divisor mediante divisiones con residuo. Sirve para simplificar: 6/8 se convierte en 3/4.
- El constructor de `Fraccion` rechaza un denominador cero, coloca el signo en el numerador y simplifica el resultado.
- `sumar`, `restar`, `multiplicar` y `dividir` aplican las reglas de las fracciones. Devuelven una fracción nueva.
- `esCero()` comprueba si el numerador es exactamente cero. No utiliza una tolerancia como “menor que 0.00001”.
- `desdeTexto()` llama al intérprete de expresiones.

Por ejemplo, sumar a/b y c/d se implementa como `(a*d + c*b)/(b*d)`. Después se simplifica. Dividir entre una fracción de numerador cero genera un error.

### Cómo entiende lo que escribimos

`interpretar()` divide el texto en piezas: números, operadores y paréntesis. Las funciones `primario`, `potencia`, `unario`, `producto` y `suma` respetan la prioridad de las operaciones.

Por eso `1+2*3` da 7 y `(1+2)*3` da 9. Un decimal como `0.25` se convierte en 25/100 y después en 1/4. No ejecuta el texto como código.

Rechaza entradas vacías, símbolos no admitidos, paréntesis incompletos, divisiones entre cero y expresiones que exceden sus límites. Rechazar una entrada no admitida es un comportamiento esperado, no una respuesta matemática incorrecta.

### Qué podemos garantizar y qué no

Las operaciones racionales conservan exactitud mientras haya recursos para ejecutarlas. Esto permite reconocer exactamente ceros y respuestas equivalentes como `1/2`, `2/4` y `0.5`.

**π y e son una excepción:** se sustituyen por decimales de 40 cifras después del punto. El cálculo posterior es exacto respecto de esos decimales, pero no respecto de los irracionales originales. Quitar un aviso de la página no cambia esta limitación. El modo práctica los rechaza.

## 4. `gauss-jordan.js`: el archivo que reduce la matriz

La función principal es `reducir(matrizEntrada, numeroIncognitas)`.

### Paso 1: revisar y copiar

Comprueba las dimensiones y que cada casilla sea una `Fraccion`. Cada fila debe tener tantas columnas como incógnitas, más b. Después crea una copia para trabajar sin alterar la matriz original.

### Paso 2: buscar un pivote

`filaPivote` indica la fila donde debe quedar el siguiente pivote. El ciclo `for` recorre las columnas de coeficientes de izquierda a derecha.

`candidata` empieza en esa fila. Un `while` baja hasta encontrar un valor distinto de cero.

- Si lo encuentra más abajo, intercambia las filas usando `temporal`.
- Si toda la parte disponible de la columna es cero, usa `continue`: salta esa columna, pero no salta la fila pivote.

Así evita dividir entre cero y contempla columnas sin pivote.

### Paso 3: hacer 1 el pivote

Divide toda la fila, incluida b, entre el pivote encontrado. Por ejemplo, `[2, 4 | 6]` pasa a `[1, 2 | 3]`.

### Paso 4: hacer ceros en el resto de esa columna

Para cada otra fila, guarda su coeficiente en `factor` y hace:

`fila actual − factor × fila pivote → fila actual`

Si el coeficiente era 3 y el pivote ya vale 1, la nueva casilla es `3 − 3×1 = 0`. Si el factor ya es cero, no hace una operación innecesaria.

La calculadora hace ceros **arriba y abajo inmediatamente**. Al terminar, registra la columna en `columnasPivote` y avanza a la siguiente fila.

### Paso 5: detectar contradicciones

Busca una fila con todos los coeficientes en cero y b distinta de cero. Por ejemplo, `[0, 0 | 5]` significa `0 = 5`, así que el sistema no tiene soluciones.

Si encuentra esa fila, también reduce el pivote de b y lo coloca antes de las filas nulas. Esto completa la forma reducida de la matriz aumentada; no elimina la contradicción ni convierte el sistema en uno compatible.

### Paso 6: clasificar

- Si existe contradicción: `incompatible`.
- Si no hay contradicción y hay un pivote por incógnita: `unica`.
- Si no hay contradicción y faltan pivotes respecto de las incógnitas: `infinitas`.

Una fila nula por sí sola no demuestra que haya infinitas soluciones. Puede ser una ecuación repetida dentro de un sistema que sí determina todas las incógnitas.

Aunque los rangos ya no se muestran en el mensaje principal, el programa los sigue calculando internamente.

### Por qué el algoritmo es correcto

Todas sus modificaciones son operaciones elementales reversibles:

1. Intercambiar filas solo cambia el orden de las ecuaciones.
2. Dividir una fila por un número no nulo produce una ecuación equivalente.
3. Restar un múltiplo de otra fila puede deshacerse sumando ese mismo múltiplo.

Por lo tanto, en cada paso se conserva el conjunto de soluciones.

Además, los pivotes nuevos avanzan hacia la derecha. La nueva fila pivote tiene ceros en las columnas pivote anteriores, por lo que usarla para eliminar no deshace esos pivotes. Al finalizar, los pivotes valen 1, son el único valor no nulo de su columna y las filas nulas quedan abajo: eso es la forma escalonada reducida.

El proceso termina porque los índices avanzan sobre un número finito de filas y columnas. Esta es una justificación matemática del algoritmo, no una certificación formal de cada instrucción del programa.

## 5. `practica-modelo.js`: preparar y corregir la práctica

Este archivo contiene la lógica del ejercicio. No necesita dibujar una matriz para saber qué respuesta espera.

### `generar(original, n)`

Primero llama a `GaussJordan.reducir()` para obtener la clasificación y el resultado de referencia. Después genera su propia secuencia, siguiendo el orden pedido para la práctica:

1. Buscar pivote e intercambiar filas cuando haga falta.
2. Hacer 1 el pivote.
3. Hacer ceros debajo, una fila a la vez.
4. Repetir hasta acabar los pivotes.
5. Hacer ceros encima, recorriendo las columnas pivote de izquierda a derecha.

Aquí el recorrido incluye b desde el principio, por si el sistema es incompatible. No registra multiplicaciones por 1 ni eliminaciones cuyo factor ya es cero.

**No calcula un número de pasos y luego inventa matrices:** ejecuta las operaciones y guarda cada cambio. El número de pasos es la longitud de esa lista.

### `registrar(...)`

Guarda una copia de la matriz anterior, ejecuta una operación y guarda la matriz siguiente, la operación, su objetivo y la etapa.

Cada paso representa **una sola operación elemental**. Las copias de las filas bastan porque las operaciones aritméticas generan nuevas fracciones, en lugar de modificar las anteriores.

### `describir(op)`

Convierte una operación guardada en texto, por ejemplo: `F2 − (2) F1 → F2`. No hace el cálculo; describe el que ya se hizo.

### `sesion(plan)`

Lleva el paso actual, los errores, las pistas y si la respuesta del paso ya fue aceptada.

`verificar(textos)` comprueba las dimensiones, interpreta cada casilla y resta su valor al esperado. Si la diferencia es cero, la casilla es correcta. Por eso acepta fracciones equivalentes.

- Si alguna casilla es inválida o está vacía, pide corregirla sin descontar.
- Si todas son válidas pero algunas son incorrectas, registra **un intento incorrecto**, no uno por casilla.
- Si todas coinciden, acepta el paso y devuelve la operación.
- Si el paso ya estaba aceptado, bloquea otra verificación.

`avanzar()` solo permite continuar después de una respuesta correcta. `pedirPista()` registra como máximo una pista por paso, y no cobra si ese paso ya se resolvió.

La nota es:

`10 × pasos / (pasos + intentos incorrectos + pistas)`

Si no hay pasos porque la matriz ya estaba reducida, la nota es `null`: no se divide entre cero ni se inventa una calificación.

### Qué deben aclarar al profesor

La práctica verifica **la ruta establecida**, no cualquier secuencia matemáticamente válida. Otra operación puede conservar el sistema y aun así no coincidir con la matriz esperada. No significa que esa otra operación sea incorrecta; significa que no es el paso de este ejercicio guiado.

La calculadora y la práctica usan órdenes distintos. Si ambas implementaciones son correctas y parten de la misma matriz, deben llegar a la misma forma reducida, porque esta es única. Las pruebas comparan ambos resultados; el código de producción no hace esa comparación final dentro de `generar()`.

## 6. `practica-ui.js`: coordinar lo que responde el alumno

Sin entrar en cómo se ve la página, sus responsabilidades son:

- `iniciar()` solicita el plan y crea una sesión nueva.
- `mostrarPaso()` toma de ese plan la matriz anterior y prepara la respuesta.
- `verificar()` recoge los textos y los entrega a la sesión. No decide por su cuenta si una operación está bien.
- `terminar()` obtiene la nota y la clasificación que ya calcularon los modelos.
- `salir()` descarta la sesión después de la confirmación correspondiente.

Las acciones de pista y siguiente paso también pasan por el modelo. Esto es importante: no basta con que un botón parezca desactivado; el modelo tiene sus propias comprobaciones para impedir avanzar sin resolver o cobrar dos veces la misma pista.

No es otro solucionador de sistemas. Es el coordinador entre las respuestas del alumno y las reglas de la práctica. Puede tener errores de coordinación, por eso también se revisa la integración; la corrección matemática de Gauss-Jordan no demuestra por sí sola que toda la interacción funcione.

## 7. `app.js`: conectar la entrada con el cálculo

`leerMatriz()` convierte cada texto en una fracción. Si falla, añade la fila y columna del problema.

Al resolver, el archivo decide entre llamar directamente a `GaussJordan.reducir()` o iniciar la práctica. En práctica rechaza π y Euler. Para mostrar el resultado final después de la práctica, vuelve a usar el solucionador principal.

Su función es coordinar; las reglas de eliminación están en `gauss-jordan.js`. Separar esas responsabilidades facilita estudiar y comprobar cada parte.

## 8. Las gráficas no deciden la solución

`espacio-soluciones.js` recibe una matriz ya reducida y, solo para sistemas infinitos, construye los puntos que cumplen las ecuaciones. Internamente usa variables libres y vectores, aunque esa parametrización ya no se muestra como resultado principal.

`evaluar()` sustituye un punto en las ecuaciones originales. `proyectar()` permite estudiar hasta tres coordenadas. Si hay más incógnitas, es una proyección: distintos puntos del sistema completo pueden verse en el mismo lugar.

`visualizacion-soluciones.js` coordina esos valores y el dibujo. No usamos el dibujo como prueba de exactitud: para representarlo se convierten las fracciones a números aproximados. La justificación de la solución viene de las operaciones sobre la matriz.

## 9. Ejemplo para explicarlo sin memorizar código

Consideremos `x + y = 3` y `2x + 3y = 7`.

La matriz inicial es:

```text
1  1 | 3
2  3 | 7
```

El primer pivote ya vale 1. Hacemos `F2 − (2) F1 → F2`:

```text
1  1 | 3
0  1 | 1
```

El segundo pivote también vale 1. Hacemos `F1 − F2 → F1`:

```text
1  0 | 2
0  1 | 1
```

Llegamos a la matriz final. Hay un pivote por incógnita y no hay contradicciones. En práctica se guardan esas dos operaciones y se espera una matriz por operación.

## 10. “¿Cómo saben que no fallará en la matriz 400?”

Una respuesta honesta sería:

> Las 300 matrices no demuestran todos los casos. Sirven para buscar errores en nuestra implementación. La razón matemática de que el método funciona es que cada operación conserva las soluciones, cada pivote mantiene lo ya reducido y el recorrido termina en una matriz reducida equivalente. Además, probamos los casos especiales y comprobamos que la práctica llegue al mismo resultado. No afirmamos que el programa completo sea infalible.

Al revisar esta versión se ejecutaron las pruebas automáticas: 2,366 comprobaciones en la validación ampliada de cálculo, 2,789 operaciones de práctica verificadas y las comprobaciones de integración. Son comprobaciones, no necesariamente esa cantidad de matrices distintas. El dataset manual de unas 300 matrices es evidencia aportada por el equipo; no se volvió a ejecutar como parte de este informe.

Entre los casos probados hay intercambios de filas, columnas sin pivote, filas nulas, contradicciones, fracciones, matrices rectangulares, matrices ya reducidas, respuestas equivalentes, pistas y bloqueo de pasos. Las pruebas de práctica reconstruyen cada operación guardada y comparan el resultado final con el solucionador.

Comparar dos implementaciones propias ayuda, pero ambas comparten la aritmética de fracciones. No sustituye una comparación independiente ni una demostración formal del programa.

### Límites que no debemos ocultar

- π y e son aproximados; la exactitud racional no demuestra exactitud simbólica con irracionales.
- El intérprete admite ciertas operaciones, no cualquier expresión matemática.
- El programa tiene límites configurados; no es ilimitado.
- Una matriz grande y densa puede tardar mucho. La práctica guarda matrices completas antes y después de cada operación, por lo que puede consumir mucha memoria incluso dentro del tamaño admitido.
- Un navegador puede quedarse sin recursos. Que el algoritmo termine matemáticamente no garantiza que termine rápido en cualquier computadora.
- Las pruebas automatizadas no equivalen a una verificación formal de todo el código.

Si el profesor pide una garantía más fuerte, el siguiente paso sería documentar formalmente las propiedades que se conservan en cada ciclo y ampliar las pruebas con un solucionador independiente. Otra opción sería registrar las operaciones del solucionador y verificarlas por separado. Eso sería trabajo adicional, no una función que debamos afirmar que ya existe.

## 11. Resumen para repartir la exposición

| Archivo | Frase para recordarlo |
|---|---|
| `configuracion.js` | Define el tamaño admitido. |
| `fracciones.js` | Interpreta las entradas y hace aritmética racional exacta. |
| `gauss-jordan.js` | Reduce la matriz y clasifica el sistema. |
| `practica-modelo.js` | Genera una ruta, verifica cada respuesta y calcula la nota. |
| `practica-ui.js` | Coordina la sesión del alumno con ese modelo. |
| `app.js` | Entrega la matriz al modo correspondiente. |
| `espacio-soluciones.js` | Calcula puntos y proyecciones para la gráfica opcional. |
| `visualizacion-soluciones.js` | Usa esos datos para explorar la gráfica; no certifica la solución. |

Lo fundamental para defender el proyecto es poder responder tres preguntas: **qué cambia en cada operación, por qué no cambia las soluciones y cómo sabemos cuándo terminamos.**
