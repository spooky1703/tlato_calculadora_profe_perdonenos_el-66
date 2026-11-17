# Tlato: guion de la segunda revisión

Presentación del 18 de noviembre de 2026. Preparado con la hoja y el código local revisados el 17 de noviembre. Duración sugerida: 9 a 11 minutos, más preguntas. Cuatro expositores.

## Antes de ensayar: tres asuntos reales

Este documento separa lo que pueden decir en voz alta de las notas de preparación. No hace falta explicar código. Sí hace falta que lo que afirmen coincida con lo que pueden mostrar.

**1. La cantidad de ejercicios no demuestra infalibilidad.** La defensa sólida combina evidencia documentada y una explicación del método. Decir que después de 300 pruebas la 400 no puede fallar deja una afirmación fácil de refutar.

**2. El importador todavía tiene un pendiente.** La mejora de separadores ya está en el código, pero las casillas vacías o ausentes se convierten en cero. Si una fila tiene más valores que la primera, esos valores adicionales no se recorren. No está completamente resuelto el riesgo de alterar la matriz. No prometan que rechaza todos los archivos mal formados. No se modificó el programa al preparar este guion.

**3. “Ver pasos” sigue abriendo la broma con video y audio.** No lo presenten como explicación matemática. Los pasos reales están en Practicar. Antes de la exposición conviene retirar o cambiar ese botón; si no se hace, tengan presente su comportamiento y no atribuyan una función que no tiene. No intenten ocultarlo si el profesor pregunta.

## Reparto y recorrido

| Persona | Responsabilidad | Tiempo |
|---|---|---|
| 1 | Introducción, observaciones recibidas y objetivo de la revisión | 1 minuto |
| 2 | Registro de ejercicios, mejoras de organización y defensa de la validación | 3 minutos |
| 3 | Límite ampliado, matriz final y mensajes | 2 minutos |
| 4 | Importación, prueba breve y cierre | 2 a 3 minutos |

Una persona maneja la computadora durante toda la exposición. Cada expositor indica qué mostrar antes de empezar a hablar. No cambien de ventana mientras alguien explica una cifra.

## Persona 1: introducción

**Mostrar:** la app abierta, sin diálogos ni videos. Todavía no resolver.

**Decir:**

“Buenos días, profesor. En la primera revisión mostramos el funcionamiento general de Tlato y el registro de ejercicios que usamos para contrastar los resultados.

A partir de sus observaciones trabajamos en cuatro puntos: hacer más clara la evidencia del registro, ampliar el tamaño de las matrices, ajustar los mensajes y mejorar la lectura de archivos.

Hoy vamos a mostrar qué cambió, cómo se puede revisar y qué límites siguen existiendo. Primero veremos la evidencia de los ejercicios; después haremos una demostración breve de los cambios en la aplicación.

Nuestro criterio es que un resultado se pueda comprobar, no solamente que aparezca en pantalla. Por eso distinguimos entre la justificación matemática del procedimiento y las pruebas que hacemos sobre el programa.”

**Transición:** “Mi compañero va a mostrar cómo organizamos esa evidencia y qué podemos concluir de ella.”

**Si interrumpen con “¿ya funciona todo?”:** “El cálculo pasó nuestras pruebas actuales. También identificamos pendientes en la validación de archivos; los explicaremos sin confundirlos con el método de resolución.”

## Persona 2: registro de ejercicios y confianza en el resultado

**Mostrar:** Respuestas de formulario 1. Recorrer una sola fila: ID, dimensiones, matriz, procedimiento, resultado, revisión y responsable. Después mostrar brevemente Respuestas de formulario 2.

**Decir:**

“Reorganizamos la hoja para que cada ejercicio tenga una identidad y una evidencia que podamos seguir. El ID permite localizarlo; las dimensiones indican el tamaño; y los enlaces conservan el ejercicio, su procedimiento y su resultado.

Ahora también tenemos una vista previa de la matriz y otra del resultado. Esto facilita comparar sin depender de abrir cada enlace. Los encabezados y las casillas de revisión hacen más claro dónde está la información y qué se ha registrado sobre cada ejercicio.

Además, separamos quién hizo el procedimiento y quién lo verificó. Eso permite rastrear una revisión, aunque llenar un nombre no significa automáticamente que sea una segunda persona independiente.

En el corte del 17 de noviembre encontramos 346 registros con ID entre las dos hojas de respuestas, que corresponden a 339 códigos distintos. En 250 registros está marcada la coincidencia de resultados. No presentamos las 346 filas como 346 ejercicios distintos completamente aprobados: hay códigos repetidos y estados pendientes de aclarar.

La utilidad del registro es que una afirmación se puede revisar. Si encontramos una diferencia, podemos volver al mismo ejercicio, contrastar la captura, el desarrollo manual y la matriz final, y registrar qué ocurrió.

Sobre la pregunta de si la matriz 400 puede fallar: haber acertado en cientos de ejercicios no es una demostración universal. La razón matemática para confiar en el método es que las operaciones elementales conservan las soluciones. El programa intercambia filas cuando hace falta, busca un pivote distinto de cero, lo convierte en uno y elimina los demás valores de esa columna. Si no hay pivote, pasa a la siguiente columna.

El registro nos da evidencia de la implementación; el método nos da la justificación matemática. También probamos situaciones distintas, porque repetir muchos ejercicios del mismo tipo no cubriría los casos especiales.”

**Qué señalar con el cursor:** una vista previa, el enlace del procedimiento, la casilla de coincidencia y el nombre del verificador. No leer todas las columnas.

**Transición:** “Con esa diferencia entre evidencia y garantía, ahora mostramos los cambios de la aplicación.”

### Datos de apoyo para esta persona

| Corte del 17 de noviembre | Formulario 1 | Formulario 2 | Total |
|---|---|---|---|
| Filas con ID | 265 | 81 | 346 |
| Casilla de coincidencia marcada | 183 | 67 | 250 |
| Casilla de error humano marcada | 38 | 3 | 41 |
| Nombre de verificador escrito | 250 | 72 | 322 |
| Contenido en SOLUCION PROGRAMA | 11 | 0 | 11 |

Hay 339 IDs distintos en el conjunto, normalizando espacios exteriores y mayúsculas. Un ID distinto no demuestra que la matriz sea distinta: no se compararon todas las imágenes. Las 250 coincidencias son filas marcadas, no 250 matrices únicas auditadas por esta revisión.

Las casillas sin marcar no permiten distinguir por sí solas entre “pendiente” y “revisado sin coincidencia”. Las 41 marcas de error humano no demuestran 41 fallos del programa ni prueban que todas esas incidencias estén resueltas. Tampoco se debe llamar “porcentaje de precisión” a 250/346.

Los campos DISEÑO, BULLET PROOF y MATEMATICO existen, pero sus nombres no constituyen criterios de aprobación. Si los mencionan, definan previamente qué significa aprobar cada uno. No digan “la columna bullet proof certifica que no falla”.

Para la demostración, elijan una fila con evidencia visible y comparación terminada. Revisen sus imágenes antes de exponer. No se ha certificado aquí cada cálculo manuscrito.

## Persona 3: tamaño, resultado y mensajes

**Mostrar:** una matriz de más de 15 filas preparada de antemano, y después dos ejemplos pequeños.

**Decir:**

“El límite anterior era de 15 filas y 15 columnas contando la aumentada. Ahora el tamaño admitido llega a 120 filas y 120 columnas totales. Eso significa hasta 119 incógnitas y una columna para los términos independientes.

No lo llamamos ilimitado. Lo importante es que ampliamos el rango de trabajo y dejamos el límite centralizado para poder ajustarlo sin cambiar varias partes del programa. El tiempo de cálculo puede variar según el tamaño y los números.

También ajustamos la salida a lo solicitado: el resultado principal llega a la matriz escalonada reducida. Ya no mostramos el desarrollo de la parametrización como parte del resultado principal.

Los mensajes son directos: ‘sistema con infinitas soluciones’ o ‘sistema sin soluciones’. El mensaje se determina por la matriz final, no por una elección del usuario.

En este primer ejemplo, la segunda ecuación repite información de la primera. Queda una variable libre y no hay contradicción: hay infinitas soluciones. En el segundo, los coeficientes son proporcionales, pero los términos independientes no coinciden. Aparece una contradicción: el sistema no tiene soluciones.”

**Ejemplo infinito para ingresar:**

```text
1;1;2
2;2;4
```

**Resultado esperado:**

```text
1  1 | 2
0  0 | 0
```

**Ejemplo sin soluciones:**

```text
1;1;2
2;2;5
```

**Resultado esperado en la reducción completa de la app:**

```text
1  1 | 0
0  0 | 1
```

La última fila representa 0 = 1. No confundir esta salida con la matriz intermedia `[1,1|2]; [0,0|1]`, que todavía no elimina el valor encima del pivote de b.

**Si preguntan por la gráfica:** “Es un apoyo opcional para visualizar las soluciones infinitas. No es la prueba de que el cálculo esté bien. Para más de tres incógnitas muestra una proyección.”

**Transición:** “Ahora veremos cómo entra una matriz desde un archivo y qué comprobamos antes de resolverla.”

## Persona 4: importación y cierre

**Mostrar:** el TXT original y la app lado a lado. Usar el ejemplo siguiente, con todas las casillas explícitas.

```text
1;1;3
2;3;7
```

**Decir:**

“La mejora de la importación busca que los datos del archivo conserven su significado al entrar a la aplicación. En los archivos de texto, cada línea representa una fila y usamos punto y coma para separar columnas. La última columna es b.

Ajustamos cómo se separan los valores y se limpia el texto. Ahora vamos a comprobar algo concreto: que estos seis números llegan a las mismas posiciones de la matriz. Primero revisamos la entrada cargada y después resolvemos.

El resultado esperado de este ejemplo es x igual a 2 y y igual a 1. La matriz final debe tener la identidad a la izquierda y esos valores a la derecha. Podemos comprobarlos en las ecuaciones: 2 más 1 da 3, y dos por 2 más tres por 1 da 7.

Hay una limitación que todavía debemos corregir: el importador actual puede completar casillas vacías con cero y no rechaza de forma estricta todas las filas de distinto largo. Por eso no afirmamos que cualquier archivo incompleto se importe correctamente. En esta demostración el archivo es rectangular, cada coeficiente está escrito y verificamos lo que se cargó.

Para cerrar: atendimos la organización de la evidencia, ampliamos las dimensiones, simplificamos los mensajes y avanzamos en la importación. Podemos mostrar los cambios y sus pruebas, y también identificar lo pendiente. La confianza en Tlato se sostiene en el procedimiento matemático y en evidencia revisable, no en prometer que un programa nunca puede fallar.”

**Resultado esperado:**

```text
1  0 | 2
0  1 | 1
```

**Si se corrige el importador antes de exponer:** no basta con borrar el párrafo del pendiente. Primero prueben un archivo con casilla vacía, otro con fila corta y otro con fila larga. Solo después sustituyan ese párrafo por lo que efectivamente haga la nueva versión y actualicen este guion.

## Preguntas difíciles y respuestas breves

### “Entonces, ¿sí puede fallar la matriz 400?”

“Puede revelar un defecto que nuestras pruebas anteriores no detectaron. No deducimos infalibilidad del número de ejercicios. Justificamos el algoritmo por las operaciones que conservan las soluciones y revisamos su implementación con casos diversos.”

### “¿Para qué hicieron tantos ejercicios si no garantizan todo?”

“Para detectar errores concretos, documentar comparaciones y comprobar que una corrección no rompa casos anteriores. Son evidencia acumulada, no una demostración de todos los casos posibles.”

### “¿Por qué no basta con probar una matriz?”

“Porque puede no activar situaciones como intercambio de filas, columnas sin pivote, contradicciones o fracciones. Queremos cubrir comportamientos diferentes, no solo aumentar el contador.”

### “¿Qué garantiza que una operación no cambie las soluciones?”

“Que se puede deshacer: intercambiar otra vez, multiplicar por el número no nulo usado para dividir o sumar el múltiplo que habíamos restado. Conservamos ecuaciones equivalentes.”

### “¿Y si el pivote es cero?”

“Busca abajo una fila con un valor distinto de cero y la intercambia. Si no existe, salta esa columna. No divide entre cero.”

### “¿Una fila de ceros significa infinitas soluciones?”

“No necesariamente. Debe faltar un pivote para alguna incógnita y no haber contradicción. Una ecuación repetida puede producir una fila nula aunque otras filas determinen todas las incógnitas.”

### “¿Qué significa una fila 0 = 5?”

“Es una contradicción. Ningún conjunto de valores puede cumplirla, así que el sistema no tiene soluciones.”

### “¿El Excel alimenta las respuestas de la calculadora?”

“No. Es nuestro registro de pruebas. La app calcula con la matriz que recibe; no busca una respuesta guardada en esa hoja.”

### “¿Cuántos ejercicios comprobaron realmente?”

“En el corte revisado hay 346 registros y 339 IDs distintos. En 250 filas está marcada la coincidencia. Para hablar de ejercicios únicos totalmente verificados tenemos que depurar duplicados y completar el estado de revisión; no confundimos esas cifras.”

### “¿El procedimiento a mano también puede estar mal?”

“Sí. Por eso guardamos el desarrollo y quién lo revisó. Una diferencia exige revisar ambos lados; no asumimos automáticamente que el programa o la persona tengan razón.”

### “¿Tiene cero errores?”

“No hemos demostrado ausencia total de errores. Las pruebas que ejecutamos pasan, pero eso describe esos casos y esa versión. Los pendientes de importación son un ejemplo de por qué debemos delimitar la afirmación.”

### “¿Por qué aparece 120 si dijeron ilimitado?”

“El límite actual es 120 filas y 120 columnas contando b. Es configurable, no ilimitado. Esa es la descripción correcta.”

### “¿Resuelve cualquier matriz de 120 por 120 al instante?”

“No prometemos un tiempo universal. Depende de los coeficientes y del equipo. En práctica también se guardan muchos pasos y se consume más memoria.”

### “¿π y e son exactos?”

“No en esta implementación: se aproximan a 40 decimales. Con fracciones racionales sí conservamos aritmética exacta. Para la demostración de exactitud usamos entradas racionales.”

### “¿Qué pasa con comas decimales o espacios en TXT?”

“El importador de texto trata la coma como separador de columnas. Para esta versión usamos punto decimal y punto y coma entre valores. Separar solo con espacios ya no es el formato admitido por ese lector.”

### “¿Y si borro un número del archivo?”

“Hoy existe el riesgo de que se complete con cero. Es un pendiente real de validación, no algo que debamos presentar como resuelto.”

### “¿Por qué me marca mal otro procedimiento válido en práctica?”

“Porque es una práctica guiada con una operación esperada por paso. No es un corrector general de todas las rutas posibles. Podemos explicar esa diferencia sin decir que su operación matemática está mal.”

### “¿La gráfica demuestra que está correcto?”

“No. Ayuda a visualizar. La validación matemática está en la matriz y en las operaciones; el dibujo usa aproximaciones.”

### “Muéstrenme los pasos.”

“Los pasos de aprendizaje están en el modo Practicar. Allí se hace una operación elemental por paso y se compara la matriz.” Si señala el botón Ver pasos, reconocer: “Ese botón quedó asociado a una broma y no debería llamarse así en la entrega académica”.

## Cómo manejar una interrupción o un error en vivo

1. Detener la explicación y escuchar la pregunta completa.
2. Responder primero en una frase; ampliar solo si lo pide.
3. Si el resultado sorprende, comparar la matriz cargada con el archivo antes de discutir el algoritmo.
4. Guardar el caso concreto: archivo, entrada, salida y resultado esperado. No atribuirlo al profesor ni afirmar “en mi computadora sí funciona”.
5. Si no saben algo: “No lo hemos comprobado todavía. Lo registramos como caso pendiente y no queremos darle una garantía que no tenemos”.

La persona 2 responde sobre evidencia; la 3 sobre matemáticas y límites; la 4 sobre archivos. La persona 1 retoma el orden después de la pregunta. No respondan los cuatro a la vez.

## Ensayo y preparación para mañana

- Verificar que la versión abierta sea la revisada; este guion se basó en el código local, no en una inspección del sitio publicado.
- Elegir y comprobar visualmente un ejercicio real del registro para la persona 2. Tener a mano la evidencia manual y su comparación.
- Recalcular las cifras si alguien modifica el registro antes de exponer. El corte de este documento es del 17 de noviembre.
- Tener los tres ejemplos pequeños listos. Mostrar el archivo y la matriz cargada, no saltar directo al resultado.
- Preparar una matriz de 16 filas y 17 columnas totales para demostrar que supera el límite anterior. Una identidad de 16 por 16 con b igual a 1 tiene resultado conocido y no exige llenar una matriz grande en vivo.
- Ensayar una vez sin interrupciones y otra con las preguntas de este documento. Si excede 11 minutos, recortar repetición, no las aclaraciones importantes.
- Guardar capturas y una copia local de los ejemplos por si falla la conexión. Las capturas son respaldo, no sustituyen decir que la prueba en vivo no se pudo hacer.
- Resolver antes de exponer, si es posible, la validación de archivos incompletos y el botón de broma. Son pendientes identificados, no cambios realizados por este documento.

## Evidencia revisada y alcance

Hoja consultada: Registro de Procedimientos - Clase. https://docs.google.com/spreadsheets/d/1nH7Z1oGULOYIVeeAMVYPvjA2g1LWLHUNJkLSwZAYQGk/edit

Se leyeron encabezados, fórmulas, colores y validaciones de las primeras filas, los registros de ambas hojas de respuestas y el resto de la columna ID de Formulario 1 para comprobar que no hubiera más IDs fuera del bloque contado. Las vistas previas son fórmulas IMAGE; no se certificó aquí que todas las imágenes carguen ni se auditó el contenido de todas las fotos. Los colores identifican las hojas, no certifican resultados.

La hoja tiene encabezados diferenciados (azul en Formulario 1 y verde en Formulario 2), encabezado inmovilizado, vistas previas de matriz y resultado, casillas de revisión y responsables. La mejora principal para la exposición es la trazabilidad: poder seguir un ejercicio de principio a fin.

Se revisó la importación en `js/app.js`, los límites en `js/configuracion.js` y la lógica de resolución. Se ejecutaron las pruebas actuales: validación ampliada con 2,366 comprobaciones, práctica con 2,789 operaciones verificadas e integración. No confundir esos números con matrices únicas del registro ni con una auditoría completa de la importación.
