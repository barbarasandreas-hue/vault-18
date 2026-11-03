# Primer Peldaño

App de Bci para que jóvenes profesionales compren su primer departamento sin tener que juntar el pie completo. Es un prototipo para el Taller de Interacción IV (UDD), desafío Bci Labs. El dinero, los inversionistas y la parte legal son simulados; los cálculos son reales. La app debe ser facil de comprender para el usuario. La idea es que sea un marketplace de departamentos en done el usario vea proyectos donde se puede unir, tanto de compras en junto como de financiamiento para el pie.

## El modelo

- **Bci** presta el 80% del precio con un crédito hipotecario mancomunado (el usuario y su pareja postulan juntos), a 30 años y 4,5%.
- **Inversionistas** del marketplace prestan el 15% del precio a 10 años, a UF + 8%, con segunda hipoteca.
- **El usuario** pone el 5% del precio más ≈ 2% de gastos de escritura, con ahorro propio o un ahorro grupal corto donde nadie queda debiendo.
- **Compra en lote** (10% de descuento sobre el precio total) o **individual** (precio de lista).
- **Para arrendar** (el arriendo entra a una cuenta custodia de Bci, que paga primero el dividendo, luego a los inversionistas, y el usuario completa la diferencia) o **para vivir** (el usuario paga todo, en vez de su arriendo actual).
- La IA arma los lotes, filtra departamentos donde el arriendo rinde 4,5% o más al año y avisa cuándo conviene abonar. Nunca promete plusvalía.

## Supuestos de cálculo

- UF de referencia: $41.065.
- Seguros del crédito: ≈ UF 0,7 al mes.
- Arriendo neto = arriendo bruto − 10% de administración − 1 mes vacío al año.
- Límite de carga: dividendo + cuota a inversionistas ≤ 25% del ingreso es holgado; hasta 30% está en el límite; sobre 30% no aprueba.
- Departamento de referencia: UF 2.500 para arrendar, UF 3.000 para vivir.


## Reglas de diseño y contenido

- Interfaz en español de Chile. Usar "dinero", nunca "plata".
- Escribir siempre "departamento" completo, nunca "depto." ni "dpto.".
- No usar nombres de personas en la interfaz; hablar de "usuario" o "cliente" O "inversionista".
- No usar el auto como forma de juntar el pie.
- Seguir el **Bci Kit**, la guía de diseño de Bci: https://www.bci.cl/corporativo/documentacion
  - Colores: cuatro familias (azul, verde, amarillo y rojo) más grises. Cada familia tiene tonos `dark`, `normal`, `80`, `60`, `40` y `20`, y los grises van de `dark` a `light`. Usar variables con esos nombres: `--blue-dark`, `--blue-normal`, `--blue-80` … `--blue-20`, `--green-*`, `--yellow-*`, `--red-*`, `--gray-dark`, `--gray-semidark`, `--gray-neutral`, `--gray-semilight`, `--gray-light`, `--white`.
  - La guía no publica los valores hexadecimales. Si puedes abrir la página, toma los valores de su CSS. Si no, usa estos de referencia: azul #0033cc, verde #19a246, amarillo #ffc629, rojo #d7261e, y deriva los tonos 80 a 20 aclarando cada color.
  - Botones: primario, secundario dark, secundario light, terciario y terciario light, en tamaños small, normal y large, con estado de carga.
  - Títulos: estilos Display 1 a 4 y Encabezado 1 a 6.
  - Listas: viñetas con ícono de check cuando el orden no importa; listas numeradas solo para secuencias o prioridades.
  - Accesibilidad: contraste AA como mínimo, pensando en usuarios con baja visión.
- Fondos claros. Tipografías: Barlow Condensed para títulos y Figtree para el texto, salvo que el Bci Kit indique otras.
- Mobile first (390 px de ancho). Un número y una acción por pantalla. Se entiende en 10 segundos. Siempre mostrar el escenario sin plusvalía.
- Los montos se muestran en pesos chilenos, con punto de miles (es-CL).

## Stack técnico

- Sitio estático: HTML, CSS y JavaScript sin frameworks ni paso de compilación, para que se pueda abrir con doble clic y publicar gratis en GitHub Pages.
- El punto de partida es `primer-peldano.html`, un solo archivo. Al ordenarlo, usar esta estructura:

```
index.html          pantallas y navegación
css/estilos.css     tokens de color y tipografía del Bci Kit, componentes
js/calculos.js      todas las fórmulas (dividendo, cuota, arriendo neto, carga)
js/datos.js         departamentos y lotes de ejemplo
js/app.js           estado y render de las pantallas
```

- Todas las fórmulas viven en `js/calculos.js`; las pantallas solo las llaman.
- Fuentes desde Google Fonts. No agregar librerías salvo que sea necesario, y avisar antes.

## Cómo correrlo

- En el computador: `python -m http.server 8000 --bind 0.0.0.0` en la carpeta del proyecto (en Windows es `python`, no `python3`) y abrir http://localhost:8000. Probar siempre con el navegador en ancho de celular.
- En el teléfono, misma red wifi: con el servidor anterior corriendo, buscar la IP del computador con `ipconfig` ("Dirección IPv4", por ejemplo `192.168.1.20`) y abrir `http://192.168.1.20:8000` en el teléfono. Si no carga, permitir Python en el firewall de Windows para redes privadas.
- En el teléfono, desde cualquier lugar: publicarla en GitHub Pages desde la rama `main` y abrir la dirección `https://<usuario>.github.io/<repositorio>/`. Desde el menú del navegador, "Agregar a pantalla de inicio" la deja como un ícono de app.
- Pruebas de las fórmulas: `node --test tests/` (Node ya viene instalado; no hace falta `npm install`).
- Roles de Claude Code en `.claude/agents/`: `planner` (escribe SPEC.md y PLAN.md), `generator` (programa un sprint) y `evaluator` (revisa el sprint y lo aprueba o rechaza).

## Forma de trabajo

- Hacer cambios pequeños y explicar el plan antes de un cambio grande.
- Después de cada cambio, decir qué archivo cambió y cómo verlo.
- Usar git: un commit por cambio, con el mensaje en español.
- Quien trabaja en el proyecto es diseñadora, no programadora: explicar los pasos de terminal en palabras simples.
