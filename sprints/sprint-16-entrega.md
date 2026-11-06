# Sprint 16 · Entrega: Tu personaje y tu equipo

Estado: listo para que el Evaluator lo revise. S16-F1 a S16-F7 quedan `en progreso`. Los avatares se guardan en el navegador; aportes, invitaciones y documentos siguen siendo simulados.

## Qué se hizo

**S16-F1 Creador de avatar**
- Estilo plano sin cara. Opciones: 5 tonos de piel, 6 peinados, 6 colores de pelo (con azul y canas), ropa en 6 colores del Bci Kit, accesorios (lentes, audífonos, mochila, gorro y planta) y mascota (perro o gato).
- No hay opción de género. Lo que no se elige queda gris neutro; un avatar nuevo parte vacío (`normalizarAvatar({})`).
- Se abre en una hoja desde la primera pregunta ("Crea tu avatar") y desde Perfil ("Tu avatar"). La vista previa cambia con cada toque.
- Cada muestra de color tiene nombre accesible ("Tono 3", "Pelo castaño") y los botones usan `aria-pressed`.
- Se dibuja con `avatarSVG` en `js/app.js`; los datos se limpian con `normalizarAvatar` en `js/calculos.js`.

**S16-F2 Preguntas iniciales: tu escena se arma**
- Arriba de cada pregunta se ve la escena: tu avatar y quienes viven contigo.
- En "¿Cuánto ganan?" se agrega "¿Con quién vas a vivir?" (Solo yo · Con mi pareja · Con mi familia) y el interruptor "Con mascota".
- "Con mi pareja" abre el creador de tu pareja **sin avatar sugerido**. "Con mi familia" abre "Agregar a alguien".
- Siguen siendo 4 preguntas.

**S16-F3 El avatar en la app**
- Inicio: tu ventana ahora es grande (2 columnas × 3 pisos) y adentro estás tú con quienes viven contigo.
- La escalera usa tus colores y tu peinado.
- Al firmar, la puerta se abre con tu equipo delante y el texto "¡Es tuyo!".
- Perfil: la fila "Tu avatar" con tu avatar y cuántas personas tiene tu equipo.

**S16-F4 Tu equipo**
- Dentro de Juntos, en Tu pie: tus avatares, "Agregar a alguien" (relación y avatar) y lo que hizo cada persona ("Ve este avance", "Aportó").
- Relaciones: pareja, mamá, papá, hermana, hermano, abuela, abuelo, tía, tío, amiga, amigo y mascota. **Se pueden repetir** (`agregarMiembro`).
- "Invitar a mi pareja": si tu pareja no está en tu equipo, primero se diseña su avatar.
- Cada aporte de la lista de regalos muestra el avatar de quien aportó.
- En la vista de la familia (`#regalo`), "Tu avatar" deja retocar el avatar propio antes de aportar. Quien aporta queda en tu equipo.
- Puerta final: "Tu equipo te acompañó: N personas y M mascotas" (`contarEquipo`).

**S16-F5 Caminos: la carrera a la puerta**
- Arriba del carrusel: un carril por camino mostrado, con tu avatar avanzando hacia la puerta y "N a M meses". En compra en grupo se ven dos avatares más.
- La posición sale de `posicionCarrera` en `js/calculos.js`.
- Debajo, la letra chica en una línea. Ejemplo: "Compra en grupo llega 3 meses antes: el pie va en cuotas a una cuenta Bci bloqueada".
- "Si juntas al mes" mueve los avatares en vivo; al soltar se guarda y las tarjetas se recalculan.
- Cada carril es un botón con el nombre del camino y los meses (así lo lee el lector de pantalla). Tocarlo lleva a la tarjeta de ese camino.

**S16-F6 Documentos: pasaporte con timbres**
- Los 4 documentos son páginas de un pasaporte con "N de 4 timbrados".
- Al subir uno cae el timbre "LISTO" con un giro corto y una vibración breve si el teléfono la permite. Los que faltan dicen "FALTA" con borde punteado.
- Una sola acción: "Subir …" con el siguiente que falta. Con los 4 listos: "Ver mi preaprobación".

**S16-F7 Elegir departamento: fachadas ilustradas**
- Cada proyecto tiene `fachada: {color, pisos}` en `js/datos.js` y su edificio dibujado arriba de la tarjeta.

**Texto de la lista de regalos:** el "?" ahora dice "Como una lista de regalos de matrimonio, pero para tu pie".

## Diferencias con el plan

- **Fachadas:** la app no tiene "guardar proyecto". La ventana encendida (con "Tu ventana") marca el proyecto de tu compra.
- **Hoja "Mis datos":** el avatar no se agregó ahí. Se edita desde Perfil y desde las preguntas, para no abrir una hoja dentro de otra.
- **Papel de cada persona:** no se guarda en el estado. Se calcula de la invitación y de los aportes, para que no quede desactualizado.

## Cómo verlo

1. Abrir la app (`python -m http.server 8000` y http://localhost:8000) en ancho de celular y tocar "Empezar de nuevo" en Perfil.
2. Pregunta 1: "Crea tu avatar". Pregunta 2: "Con mi pareja" y "Con mascota".
3. Terminar las preguntas y ver tu ventana en Inicio. Luego "Elegir mi camino": la carrera y "Si juntas al mes".
4. Elegir un departamento, postular con "No soy cliente: subir documentos" y ver los timbres.
5. En Tu pie, abrir Juntos y agregar dos veces a "Tu mamá". Crear la lista, "Ver como familia", "Tu avatar" y "Aportar".
6. Firmar y ver la puerta con tu equipo.

## Verificación

- `node --test tests/*.test.js`: 149 pruebas, 0 fallas (4 nuevas en `tests/sprint16.test.js`).
- Recorrido A con Playwright a 390, 360 y 320 px, con parejas de pelo largo, corto y rizado. Revisa:
  - que la pareja no traiga opciones sugeridas ni haya opción de género;
  - la ventana con avatares, que la carrera avance con el control, las fachadas y los 4 timbres;
  - las dos mamás, el avatar del aporte, la puerta ("4 personas y 1 mascota") y Perfil;
  - que no haya desborde horizontal ni textos con género ("Bienvenida", "novio", "esposa", "marido").
