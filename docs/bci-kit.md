# Bci Kit: valores oficiales

Valores tomados directamente de la guía de diseño de Bci (https://www.bci.cl/corporativo/documentacion), leyendo los estilos de la página el 3 de noviembre de 2026. Reemplazan a los valores de referencia que había antes en `CLAUDE.md`.

## Tipografía

- **Overpass** para todo: títulos y textos. Está en Google Fonts.
- Pesos que usa Bci: 200, 400, 600 y 700. Los títulos van en **400** (no en negrita), en `--gray-dark`.
- Interlineado de los títulos: 1,3.

| Estilo | Tamaño | Uso sugerido en la app (390 px) |
|---|---|---|
| Display 1 | 64 px | No usar en el teléfono (demasiado grande) |
| Display 2 | 52 px | Número protagonista muy corto (por ejemplo, "13 meses") |
| Display 3 | 42 px | Número protagonista en pesos |
| Display 4 | 34 px | Números secundarios grandes |
| Encabezado 1 | 30 px | Título de pantalla |
| Encabezado 2 | 26 px | — |
| Encabezado 3 | 22 px | Título de sección o de tarjeta |
| Encabezado 4 | 20 px | — |
| Encabezado 5 | 18 px | Subtítulos |
| Encabezado 6 | 16 px | Etiquetas destacadas |

Texto de párrafo: 16 px en `--gray-dark` o `--gray-semidark`.

## Colores

Bci usa exactamente estos nombres de variable. **Rojo y amarillo no tienen tono `dark` en el Bci Kit**; los dos marcados con * los derivamos nosotros oscureciendo el color para que el texto cumpla AA.

| Familia | dark | normal | 80 | 60 | 40 | 20 |
|---|---|---|---|---|---|---|
| Azul | #1D5699 | #2772CC | #528ED6 | #7DAAE0 | #A9C7EB | #D4E3F5 |
| Verde | #28652B | #28892B | #53A155 | #7EB880 | #A9D0AA | #D4E7D5 |
| Amarillo | #736600* | #FFE300 | #FFE933 | #FFEE66 | #FFF499 | #FFF9CC |
| Rojo | #B20913* | #ED0C19 | #F13D47 | #F46D75 | #F89EA3 | #FBCED1 |

| Gris | Valor |
|---|---|
| `--gray-dark` | #37474F |
| `--gray-semidark` | #546E7A |
| `--gray-neutral` | #BBC5CA |
| `--gray-semilight` | #E2E8EA |
| `--gray-light` | #F6F7F8 |
| `--white` | #FFFFFF |

### Para qué usa Bci cada color

- **Verde:** acciones primarias y secundarias, indicador positivo, estados logrados, cifras y saldos a favor. En la app: botones, semáforo "holgado" y montos a favor.
- **Rojo:** urgencia, error o alerta, notificaciones, eliminar. En la app: semáforo "no aprueba" y errores.
- **Azul:** Bci lo usa en el botón "Banco en Línea" (login) y en enlaces. En la app: enlaces y elementos informativos.
- **Amarillo:** alertas suaves. En la app: semáforo "en el límite", **siempre como fondo, nunca como texto**.
- **Gris:** textos (títulos y párrafos), fondos, grillas, contenedores e íconos complementarios.

### Contraste medido (AA pide 4,5:1 para texto normal y 3:1 para texto grande)

| Combinación | Contraste | ¿Cumple AA en texto normal? |
|---|---|---|
| `--gray-dark` sobre blanco | 9,65 | Sí |
| `--gray-semidark` sobre blanco | 5,40 | Sí |
| `--gray-semidark` sobre `--gray-light` | 5,04 | Sí |
| `--green-dark` sobre blanco | 7,03 | Sí |
| **Blanco sobre `--green-normal`** | **4,46** | **No, por poco** (solo texto grande) |
| `--blue-normal` sobre blanco | 4,81 | Sí |
| `--red-normal` sobre blanco | 4,50 | Justo en el límite |
| `--red-dark`* sobre `--red-20` | 5,05 | Sí |
| `--gray-dark` sobre `--yellow-normal` | 7,46 | Sí |
| `--yellow-normal` sobre blanco | 1,29 | No: nunca usar amarillo como texto |

**Regla para la app:**
- El texto verde chico va en `--green-dark`.
- El botón primario usa fondo `--green-normal` con su etiqueta en negrita de 19 px o más, que cuenta como texto grande; el botón small usa fondo `--green-dark`.
- Los mensajes de error van con texto `--gray-dark` sobre `--red-20` y un ícono en `--red-normal`.

## Botones

Todos los botones de Bci son **píldoras**: borde redondeado de 48 px, borde de 1,6 px, texto en MAYÚSCULAS de 14 px.

| Tipo | Fondo | Texto | Borde | Cuándo |
|---|---|---|---|---|
| Primario | `--green-normal` | blanco | `--green-normal` | La acción principal de la pantalla (solo una) |
| Secundario dark | transparente | `--green-normal`* | `--green-normal` | Acción alternativa sobre fondo claro |
| Secundario light | transparente | blanco | blanco | Acción alternativa sobre fondo oscuro |
| Terciario | blanco | `--gray-semidark` | `--gray-semidark` | Acciones menores ("Volver a simular") |
| Terciario light | transparente | blanco | blanco | Acciones menores sobre fondo oscuro |
| Login (referencia) | `--blue-normal` | blanco | — | Solo como referencia; la app no tiene login |
| Deshabilitado | `--gray-semilight` | `--gray-neutral` | `--gray-semilight` | Acción no disponible (acompañar con una explicación en texto) |

\* En la app, el texto verde de los botones secundarios va en `--green-dark` para cumplir AA.

| Tamaño | Alto | Relleno |
|---|---|---|
| Small | 36 px | 6 px × 24 px |
| Normal | 50 px | 13 px × 30 px |
| Large | 56 px | 16 px × 35 px |

En el teléfono, el small (36 px) queda bajo el mínimo de 44 px de zona táctil: se usa solo con un margen invisible que complete los 44 px, o se evita.

**Estado de carga:** el botón mantiene su tamaño y color, y su texto cambia a un indicador de carga ("Cargando…").

## Formularios

- Campo de texto: 50 px de alto, texto de 18 px, fondo blanco, borde redondeado de 6 px, borde `--gray-semidark`.
- La etiqueta va siempre visible arriba del campo (no solo como texto de ejemplo dentro del campo).

## Listas

- **Con check:** cuando el orden no importa. Bci usa un ícono de check en verde.
- **Numeradas:** solo para secuencias o prioridades.

## Íconos

- Bci usa una fuente propia de íconos ("BCI Icons"), de línea fina (outline). **No se puede usar en la app**, porque es propiedad de Bci y no es pública.
- En su lugar: íconos SVG dibujados dentro del código, de línea (2 px, puntas redondeadas), en `--gray-semidark` o en el color de su estado. Sin librerías externas.

## Elementos gráficos

- **Las cuatro figuras de marca:** cuadrado rojo, círculo verde, triángulo amarillo y rectángulo azul, en fila y pequeñas, sobre los títulos de sección. Se pueden usar como detalle en Inicio o en la introducción.
- Fondos blancos o `--gray-light`, tarjetas blancas con borde `--gray-semilight`, mucho aire.
- **Logo:** no copiar el logo desde el sitio de Bci. Si Bci Labs entrega el logo para el taller, se puede usar.
