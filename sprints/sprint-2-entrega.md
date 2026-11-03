# Sprint 2 · Entrega: marketplace de proyectos y publicación

Estado: listo para que el Evaluator lo revise. Las features S2-F0 a S2-F6 quedan `en progreso` en `PLAN.md`.

## Primero: lo que dejó pendiente el Evaluator (`evaluations/sprint-1.md`)

| Hallazgo | Qué se hizo |
|---|---|
| **La acción principal quedaba escondida bajo la barra** (a 390 × 844, "Ver proyectos" partía en y = 764) | Se quitó la línea "Bci · Primer Peldaño". Las preguntas de los selectores quedan solo para lectores de pantalla y la tarjeta del número es más corta. "Ver proyectos" va justo bajo el número y "¿De dónde sale el resto?" queda debajo del botón. Medido: el botón termina en y = 545 a 390 × 664 y en y = 567 a 360 × 640, siempre sobre la barra y sin bajar. |
| Comentario "Sprint 4" en `js/datos.js` | Corregido. |
| Clase `.oculto-visual` sin uso | Ahora la usan las preguntas de los selectores. |
| Campo `descripcion` sin uso | Borrado. |
| `stroke="#fff"` fijo en el ícono de check | Ahora usa `var(--white)`. |
| Cifras que no cuadraban por el redondeo | El total al mes ahora es la suma exacta del dividendo y la cuota. En el reparto, el 80 % de Bci absorbe el redondeo, así que 80 + 15 + 5 suma exactamente el precio. Todo sigue dentro del ±$1 de la tabla, y hay 4 pruebas nuevas que lo revisan. |
| 404 de `favicon.ico` | Hay un ícono en línea (un peldaño blanco sobre azul Bci). |

## Qué se hizo, feature por feature

**S2-F0 Barra de 4 secciones**
- La barra ahora tiene Inicio, Proyectos, Mis proyectos y Perfil.
- La sección activa se distingue de 5 formas: color azul, ícono relleno, texto en negrita, una raya arriba y `aria-current`.
- A 360 px cada botón mide 90 × 64 px. Medido en el navegador, ningún nombre se corta.
- Inicio es el simulador del Sprint 1, con los mismos montos, el desglose y "Calculado sin plusvalía".
- Perfil dice "Disponible pronto".
- Las direcciones viejas (`#simula`) o desconocidas llevan a Inicio.

**S2-F1 Datos de ejemplo** (`js/datos.js`)
- Hay 6 proyectos con nombre de edificio:
  - 3 de compra en conjunto: Ñuñoa, Santiago y Las Condes.
  - 3 de financiamiento del pie: Independencia, La Florida y Macul.
- Hay 12 departamentos con comuna, piso, m², dormitorios, baños, precio de lista y arriendo estimado.
- Cada proyecto tiene tipo, cupos totales, cupos tomados, UF financiadas y fecha de cierre.
- En compra en conjunto, los departamentos que aparecen son los cupos que quedan libres; por ejemplo, Alto Ñuñoa tiene 6 de 10 tomados y 4 departamentos disponibles.
- 3 departamentos rinden menos de 4,5 % (los 2 de Las Condes y el de Macul). Por eso el filtro de la IA se nota en las dos pestañas.

**S2-F2 Fórmulas del marketplace** (`js/calculos.js`)
- Funciones nuevas: arriendo neto, rentabilidad, filtro de la IA, ahorro por unirse, avance, monto por financiar, formato de porcentaje y formato de fecha.
- `resumenProyecto()` entrega todos los números de un proyecto, así que las pantallas solo los muestran.
- Las pruebas revisan los criterios del plan:

  | Caso | Resultado |
  |---|---|
  | Arriendo de $600.000 | Neto de $495.000 |
  | UF 2.250 con arriendo de $420.000 | 4,5 %, pasa el filtro |
  | UF 2.250 con arriendo de $400.000 | 4,3 %, no pasa |
  | Lote de UF 2.500 | Ahorro de $10.266.250 |
  | 6 cupos de 10 | 60 % |

  También revisan que los datos cumplan S2-F1. En total pasan 23 de 23 pruebas.

**S2-F3 Pantalla Proyectos**
- Tiene pestañas "Compra en conjunto" y "Financiamiento del pie". La pestaña que se abre primero depende de lo que eligió el usuario en Inicio: "En lote" abre compra en conjunto e "Individual" abre financiamiento.
- Tarjeta de compra en conjunto: muestra "Ahorras al unirte" con el monto grande, los cupos tomados ("6 de 10") con barra y la fecha de cierre.
- Tarjeta de financiamiento: muestra el precio grande, cuánto del 15 % se reunió con inversionistas (barra y porcentaje) y la fecha de cierre.
- En modo arrendar aparece la etiqueta "Filtrado por IA" y solo se ven los proyectos que rinden 4,5 % o más.
- Si no queda ninguno, aparece un estado vacío con el botón "Cambiar a modo vivir".

**S2-F4 Detalle y unirse**
- Muestra el precio grande. En compra en conjunto también aparece el precio de lista tachado y el ahorro.
- Debajo vienen el total al mes, el sello "Calculado sin plusvalía", la rentabilidad (en modo arrendar) y el reparto 80 / 15 / 5 con checks, gastos y cuánto pone al escriturar.
- Muestra los cupos o el avance del financiamiento, la fecha de cierre y qué pasa si no se completa.
- **Comprar aquí** guarda la compra en el teléfono (`localStorage`), suma el cupo (6 de 10 pasa a 7 de 10) y lleva a Mis proyectos.
- Si el usuario ya tiene una compra, el botón se reemplaza por "Ya tienes una compra en curso". En el mismo proyecto dice "Ya te uniste a este proyecto".
- **Invertir aquí** muestra "Disponible pronto".

**S2-F5 Mis proyectos**
- Sin compra: muestra "Aún no tienes proyectos" con el botón "Ver proyectos".
- Con una compra, aparecen las pestañas "Mi compra" y "Mis inversiones":
  - Mi compra muestra el proyecto, el departamento, lo que pone al escriturar y los pasos 1 Postula · 2 Tu 5 % · 3 Firma, con el paso 1 marcado como "Paso actual".
  - Mis inversiones está vacía por ahora, con el botón "Ver proyectos".
- La compra se mantiene al recargar la página.

**S2-F6 GitHub Pages**: ver la sección siguiente.

## Cómo publicarla en GitHub Pages (para verla desde cualquier teléfono)

El código ya está subido a GitHub, en la rama `main` de https://github.com/barbarasandreas-hue/vault-18. Falta activar Pages, una sola vez:

1. Abre https://github.com/barbarasandreas-hue/vault-18 en el navegador del computador.
2. Si el repositorio es **privado**, primero hazlo público: **Settings** → al final, **Danger Zone** → **Change visibility** → **Public**. Con una cuenta gratuita, Pages solo funciona en repositorios públicos.
3. Entra a **Settings** → **Pages** (en el menú de la izquierda).
4. En **Source** elige **Deploy from a branch**. En **Branch** elige **main** y la carpeta **/ (root)**. Presiona **Save**.
5. Espera 1 o 2 minutos y recarga esa página. Arriba aparecerá "Your site is live at…".
6. Abre **https://barbarasandreas-hue.github.io/vault-18/** en cualquier teléfono, con cualquier conexión. Desde el menú del navegador, "Agregar a pantalla de inicio" la deja como ícono.

Cada vez que se sube un cambio nuevo a `main`, la página se actualiza sola en uno o dos minutos.

## Cómo verla por wifi (sin publicar)

1. En la terminal, dentro de la carpeta del proyecto: `python -m http.server 8000 --bind 0.0.0.0`.
2. Averigua la IP del computador con `ipconfig`: es la línea "Dirección IPv4". Hoy es `172.20.10.2`.
3. Con el teléfono en la misma red, abre `http://172.20.10.2:8000`.
4. Si no carga, permite Python en el Firewall de Windows para redes privadas.

## Qué tocar para probar

1. **Inicio**: "Ver proyectos" se ve sin bajar. Cambia arrendar/vivir y lote/individual y revisa que los números sigan siendo los de la tabla.
2. **Proyectos**:
   - En "Para arrendar" no aparecen Vista Apoquindo ni Parque Macul. Ve a Inicio, elige "Para vivir" y vuelve: ahora aparecen.
   - Cambia de pestaña.
3. **Detalle**:
   - Toca Edificio Alto Ñuñoa, baja hasta el final y toca "Invertir aquí" (sale "Disponible pronto").
   - Toca "Comprar aquí": te lleva a Mis proyectos.
   - Vuelve a Proyectos: Alto Ñuñoa ahora dice 7 de 10, y cualquier otro proyecto dice "Ya tienes una compra en curso".
4. **Mis proyectos**: revisa los pasos, la pestaña "Mis inversiones" y "Salir de esta compra", que vuelve al estado vacío.
5. **Recarga la página** después de comprar: la compra sigue ahí.

## Decisiones

- **"Salir de esta compra"** (en Mi compra) no estaba en el plan. Lo agregué para poder repetir la demo sin quedar trabada en "Ya tienes una compra en curso". Además coincide con `SPEC.md`: el usuario puede "salir sin costo". En el Sprint 3, "Empezar de nuevo" (Perfil) hará algo parecido.
- **Un proyecto pasa el filtro de la IA solo si todos sus departamentos rinden 4,5 % o más.** En cada lote los departamentos tienen el mismo precio y arriendos parecidos.
- **El modo (arrendar o vivir) todavía no se guarda al recargar.** Eso es S3-F3. La compra sí se guarda, porque S2-F4 lo pide.
- **Revisión en pantalla:** usé Chrome sin ventana con un script que emula un teléfono de 390 y 360 px de ancho. Recorrí todas las pantallas, sin errores en la consola y sin scroll horizontal.

## Pendiente o para saber

- **GitHub Pages lo tienes que activar tú** (pasos 1 a 5 de arriba). Yo subí el código, pero no puedo entrar a la configuración de tu cuenta. Hasta que lo actives, la dirección `github.io` da error 404. Por eso no pude comprobar el criterio "funciona en Pages sin 404".
- **El comando de pruebas:** `node --test tests/` sigue fallando en Node 24; `node --test` funciona. Corresponde corregirlo en `CLAUDE.md` y `PLAN.md` (Planner).
- **La acción principal del detalle está al final**, después del reparto y del avance, así que en el detalle hay que bajar para llegar a "Comprar aquí". Está ordenado como lo pide el plan ("Al final, dos caminos"), pero conviene revisarlo en el teléfono.
