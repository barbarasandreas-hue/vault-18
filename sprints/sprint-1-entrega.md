# Sprint 1 · Entrega: base y Simula

Estado: listo para que el Evaluator lo revise. Las features quedan `en progreso` en `PLAN.md`.

## Qué se hizo, feature por feature

**S1-F1 Estructura de archivos**
- `index.html`: las pantallas y la barra inferior.
- `css/estilos.css`: colores, tipografías, títulos y botones del Bci Kit.
- `js/calculos.js`: todas las fórmulas. Termina con `module.exports` para que las pruebas lo puedan usar.
- `js/datos.js`: el departamento de referencia (UF 2.500 para arrendar y UF 3.000 para vivir).
- `js/app.js`: cambia de pantalla y muestra los números de Simula.
- `tests/calculos.test.js`: las pruebas de las fórmulas.
- Todas las rutas son relativas y la meta viewport incluye `viewport-fit=cover`.

**S1-F2 Tokens del Bci Kit**
- Las 24 variables de color (`--blue-dark` … `--red-20`) y las 6 de grises y blanco.
- Barlow Condensed para títulos y Figtree para el texto, desde Google Fonts.
- Clases `.display-1` a `.display-4` y `.h1` a `.h6`.
- 5 tipos de botón (`.btn-primario`, `.btn-secundario-dark`, `.btn-secundario-light`, `.btn-terciario`, `.btn-terciario-light`), cada uno en 3 tamaños (`.btn-sm`, normal y `.btn-lg`), con estado de carga (`.is-cargando`).
- El fondo es gris muy claro (`--gray-light`) y las tarjetas son blancas.

**S1-F3 Navegación**
- Una barra inferior con 5 botones: Simula, Proyectos, Postula, Tu 5 % y Mi departamento. Cada botón tiene ícono y texto.
- La pantalla activa se distingue de 4 formas: color azul, texto en negrita, una raya arriba del botón y `aria-current` para los lectores de pantalla.
- Cada botón mide 64 px de alto y unos 78 px de ancho, sobre el mínimo de 44 × 44 px.
- La barra deja espacio para la zona inferior del iPhone (`env(safe-area-inset-bottom)`).
- Las pantallas que aún no existen dicen "Disponible pronto".
- La dirección cambia con cada pantalla (`#simula`, `#proyectos`…), así que el botón "atrás" del teléfono funciona.

**S1-F4 Fórmulas base**
- En `js/calculos.js`: precio (con el 10 % de descuento en lote), pie, gastos, monto al escriturar, cuota fija, dividendo con seguros, cuota a inversionistas, total al mes, reparto 80/15/5, conversión de UF a pesos y formato de pesos (`$6.467.738`).
- La función `escenario()` entrega todos los números de una vez, ya en pesos, para que la pantalla solo los muestre.
- Las pruebas revisan los 4 escenarios de la tabla de referencia. Todos coinciden al peso.

**S1-F5 Pantalla Simula**
- Dos selectores: "Para arrendar / Para vivir" y "En lote (−10 %) / Individual".
- Número protagonista: "Pones al escriturar **$6.467.738**". Debajo: "Y luego **$571.425** al mes".
- Los números cambian apenas tocas una opción.
- "¿De dónde sale el resto?" abre el reparto en pesos: 80 % lo presta Bci, 15 % lo reúnes con inversionistas, 5 % lo pones tú, más los gastos de escritura.
- El sello "Calculado sin plusvalía" aparece junto al número.
- Acción principal: "Ver proyectos", que lleva a Proyectos.

**S1-F6 Visible en el teléfono por wifi**: ver la sección siguiente.

## Cómo verlo en el teléfono

1. Abre la terminal en la carpeta del proyecto (`vault-18`) y escribe:
   `python -m http.server 8000 --bind 0.0.0.0`
   Esto deja la carpeta disponible como una página web. No cierres esa ventana mientras pruebas.
2. Abre otra terminal y escribe `ipconfig`. Busca la línea **"Dirección IPv4"** (por ejemplo `192.168.1.20`). Esa es la dirección de tu computador en la red.
3. Con el teléfono conectado **a la misma red wifi**, abre el navegador y escribe `http://192.168.1.20:8000`, cambiando el número por el tuyo.
4. Si no carga, Windows probablemente está bloqueando a Python. Ve a "Firewall de Windows" → "Permitir una aplicación" y marca Python en **redes privadas**.

En el computador también puedes abrir http://localhost:8000. Para verla como celular, presiona F12 y luego el ícono del teléfono, y elige 390 px de ancho.

## Qué tocar para probar

- **Simula**: cambia entre arrendar y vivir, y entre lote e individual. Los números deben coincidir con esta tabla:

  | Opciones | Al escriturar | Al mes |
  |---|---|---|
  | Arrendar + lote | $6.467.738 | $571.425 |
  | Arrendar + individual | $7.186.375 | $631.723 |
  | Vivir + lote | $7.761.285 | $679.961 |
  | Vivir + individual | $8.623.650 | $752.319 |
- Toca "¿De dónde sale el resto?" para abrir y cerrar el reparto.
- Toca "Ver proyectos": debe llevarte a Proyectos ("Disponible pronto").
- Toca cada botón de la barra inferior.

## Decisiones

- **Colores:** la página del Bci Kit respondió "acceso denegado" (403), así que usé los colores de referencia de `CLAUDE.md`. Los tonos 80, 60, 40 y 20 son el color mezclado con blanco en esa proporción, y el tono `dark` es una versión más oscura. El verde y el amarillo normales no alcanzan el contraste AA como texto sobre blanco, así que para texto se usan sus tonos `dark`.
- **Mientras trabajaba, el plan cambió:** Elige se reemplazó por Proyectos y la acción pasó a ser "Ver proyectos". La entrega sigue la versión nueva de `PLAN.md`.
- El escenario por defecto es arrendar en lote, porque es el ejemplo del plan.
- Todavía no se guarda ninguna elección entre visitas. Eso corresponde al Sprint 3 (S3-F3).

## Lo que quedó pendiente o hay que saber

- **El comando de pruebas:** con la versión de Node instalada (24), `node --test tests/` da error porque Node no acepta una carpeta así. El comando `node --test`, sin nada más, encuentra y corre las pruebas (9 de 9 pasan). Conviene corregir el comando en `CLAUDE.md` y `PLAN.md`; no los cambié porque no me corresponde como Generator.
- **No revisé la pantalla a simple vista:** la extensión de Chrome no estaba conectada. Comprobé las fórmulas, que no hay errores de sintaxis, que todos los archivos cargan y que no aparecen palabras prohibidas. Falta mirarla a 390 px y a 360 px en un teléfono o en el navegador.
