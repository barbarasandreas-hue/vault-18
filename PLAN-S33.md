# PLAN · Sprint 33 · Ajustes de Bárbara a la nueva navegación (19-nov-2026)

> Ejecuta `PLAN-S33.md` en orden. Base: lo que quedó en S32 (commit `f838a43`). No subas nada a GitHub.

## Decisiones
| # | Tema | Decisión | Por qué |
|---|---|---|---|
| E1 | Nombres | La app te habla siempre de «tú». Barra: **Tu compra · Tu pie · Departamentos · Perfil** (los que se entienden sin posesivo, sin él). El título de cada pantalla es igual a su pestaña. Los botones siguen en tu voz («Abrir mi cuenta», «Elegir mi departamento»). | Las guías de Microsoft, GNOME y GitHub piden evitar los pronombres o usar «tu»; Material pide no mezclar «mi» y «tu» en una misma frase. «Mi» se reserva para lo que la persona dice o hace (botones). |
| E2 | «Tu recorrido» y «Tu camino» | «Tu recorrido» pasa a **«Tus pasos»**. «Camino» queda solo para la forma de comprar. | «Recorrido» y «camino» son sinónimos: dos nombres para cosas distintas que suenan igual. |
| E3 | Aprender los caminos | Va **dentro de Comparar caminos**: arriba, «Conoce los caminos», con una tarjeta ilustrada por camino. Cada camino tiene su página ilustrada (`#compra/caminos/<id>`). Se llega desde el primer paso, desde la «i» y desde Departamentos («Cómo funciona este camino»). Sin tutorial obligatorio. | Según NN/g, los tutoriales al inicio no mejoran el éxito y hacen las tareas más difíciles (SEQ 4,92 vs. 5,49); conviene ayudar en el momento y en el lugar donde se decide. |
| E4 | Tus pasos | Línea recta, como el metro: paradas en fila, tu avatar en la actual y un **edificio de departamentos** al final. «Ahora» va dentro de la misma tarjeta, conectado a la parada actual. «Ver con fechas ›» va dentro de la tarjeta. | Pedido de Bárbara. |
| E5 | Ventanas que suben desde abajo | Pasan a **pantalla completa** (con «‹ Volver» y su título), salvo las confirmaciones cortas («¿Elegir…?», Deshacer). | Pedido de Bárbara. |
| E6 | Tu pie | Siempre la pantalla con el **edificio en obra** (nunca el chanchito). En grupo, suma «Tu grupo» (quién pagó) y el estado de la obra. «Si juntas al mes» va montado sobre el azul y junto a la cuota del mes, en una sola tarjeta. | Pedido de Bárbara. |
| E7 | Tu grupo y tu obra en Tu compra | Una tarjeta compacta, «Tu edificio», con la obra y cuántos del grupo pagaron; al tocarla, abre Tu pie. | Es avance de la misma compra. |
| E8 | Perfil de ejemplo | En la primera pregunta: «Usar el perfil de ejemplo» (la persona del estudio: 28 años, $1,9 M líquidos, vive con su pareja y una hija de 2 años, arrienda y hoy ahorra poco). Crea su avatar y salta las preguntas. | Pedido de Bárbara. |
| E9 | Preaprobación | Sin «Paso 3 de 6» arriba de los pasos 1-2-3 (se confundían). Dice cuánto demora (días hábiles, simulado) y deja «Avanzar el tiempo». | Pedido de Bárbara. |

## Bloques
- **C0** Bug: en grupo, «Aprobación final» quedaba hecha antes del pie (asegurado con paso ≥ 3 en grupo).
- **C1** Nombres (E1, E2) en barra, títulos, `RAICES_PESTANA`, textos y pruebas.
- **C2** Tu compra: el azul lleva a Tu pie; «Tus pasos» en línea recta con el edificio, «Ahora» conectado y «Ver con fechas ›» adentro (E4); «Tu edificio» (E7); misiones ordenadas en una tarjeta con «Vence primero» arriba.
- **C3** Todas tus misiones: más visual y con menos texto (íconos, una línea por misión, fechas en línea de tiempo).
- **C4** Tu pie (E6): el azul más bajo, «Si juntas al mes» y la cuota en una tarjeta montada sobre el azul, «Tu pie está protegido» visual; en grupo, la obra y tu grupo; la misión «Paga tu cuota» lleva a Tu pie.
- **C5** Ventanas a pantallas (E5).
- **C6** Conoce los caminos (E3): tarjetas ilustradas y página ilustrada por camino.
- **C7** Detalle de un edificio en grupo: «Tu grupo» compacto; «Comprarlo sin grupo» abajo, como opción secundaria; «Es tuyo aprox.» como en el resto de la app.
- **C8** Perfil de ejemplo (E8).
- **C9** Preaprobación (E9) y botones «Ver departamentos que te alcanzan» / «Editar mis datos» con jerarquía clara (uno principal y uno secundario).
- **C10** Verificación (pruebas, recorridos de los 4 caminos a 390 px, capturas, contraste, toques), publicación y documentos.
