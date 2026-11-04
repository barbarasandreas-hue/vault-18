# Sprint 9 · Entrega: Tus caminos y Todavía no

Estado: listo para que el Evaluator lo revise. Las features S9-F1 a S9-F6 quedan `en progreso` en `PLAN.md`.

## El recorrido nuevo

Inicio (¿cuánto puedo comprar?) → **Tu mes real** → **Tus caminos** → Proyectos del camino elegido, o una **ficha**, o **Todavía no**.

- En Inicio, la acción principal pasa a ser "Ver mi mes real". "Ver proyectos que me alcanzan" queda como enlace debajo.
- Los caminos se calculan con el departamento de referencia de `CLAUDE.md`: UF 2.500 de lista (UF 2.375 en grupo, con 5 % de descuento).

## Qué se hizo, feature por feature

**S9-F1 Tu mes real** (`#mes-real`)
- `mesReal(perfil, dividendo)` en `js/calculos.js`: ingreso − arriendo que sigue pagando − otras cuotas − dividendo.
  - En modo vivir no se resta el arriendo, porque se muda.
  - En modo arrendar no se suma el arriendo que recibiría (peor caso, y así se dice en pantalla).
- El número protagonista es "Te quedan al mes para vivir", con el % del ingreso.
- La cuenta se muestra en filas con signo (+, −, =). El dividendo dice además cuánto sería sin subsidio.
- Si queda menos del 40 % o la carga pasa de 25 / 30 %, aparece un aviso con ícono y la palabra "Ojo". Si alcanza, un aviso verde con check.
- Campos: arriendo que pagas hoy (solo en modo arrendar) y otras cuotas. En una tarjeta aparte, "Para calcular tus caminos": lo que tienes ahorrado (campo nuevo, `ahorroActual`) y lo que puedes ahorrar al mes (el mismo `ahorroMensual` de Tu pie, así queda prellenado).

**S9-F2 Tus caminos** (`#caminos`)
- Las cuatro reglas de `SPEC.md`, sección 0, están en `recomendarCamino(perfil)`, con una prueba por regla en `tests/caminos.test.js`.
- `hayGrupo` es verdadero si alguna compra en grupo le alcanza con su capacidad (en modo arrendar, solo las que pasan el filtro de 3,9 %).
- La pantalla muestra **un** camino arriba:
  - etiqueta "Te recomendamos", el nombre, y la razón en una frase que empieza con "Porque…";
  - número protagonista: lo que pone al escriturar;
  - dividendo, meses para juntar lo que falta, peor caso y un chip "Existe hoy" o "Propuesta".
- "Ver otros caminos (N)" despliega el resto, cada uno con los mismos datos y el botón "Elegir este camino". Las fichas tienen el botón "Ver cómo funciona".
- Elegir un camino lo anota en el registro y lleva a Proyectos, en la pestaña que corresponde y con el filtro "Me alcanza".
- Al pie se lee: "Las recomendaciones salen de reglas fijas, no de la IA. La IA solo estima el arriendo de cada departamento". La app no dice "la IA recomienda" en ningún lugar (el recorrido lo revisa).
- Peor caso de cada camino:

  | Camino | Peor caso |
  |---|---|
  | En grupo | Si el grupo no se completa, compra a precio de lista (con el dividendo) o sale sin costo |
  | Con pie compartido | Si el arriendo baja 10 %, cuántos meses toma la recompra (48 → 54 en grupo; 51 → 57 individual), sin recurso al sueldo |
  | Sin grupo | El dividendo sin subsidio a la tasa |

**S9-F3 Todavía no**
- Si el camino recomendado no cumple la carga o Tu mes real (regla 1), en vez de la tarjeta del camino aparece "Todavía no te conviene":
  - ícono de reloj y la palabra "Todavía no", en azul y sin rojo;
  - una frase sin juicio;
  - hasta 3 cambios calculados en `cambiosTodaviaNo`.
- Los 3 cambios:

  | Cambio | Qué calcula |
  |---|---|
  | Terminar las otras cuotas (solo si tiene) | La carga y lo que queda |
  | Un estudio de UF 1.200 | Pie, dividendo y meses ahorrando |
  | La renta familiar con la que el camino ya conviene | El mayor entre dividendo / 25 %, (dividendo + cuotas) / 30 % y lo que deja 40 % para vivir |

- "Recordarme en N meses" (simulado): N es lo que tarda en juntar su parte de un estudio, entre 3 y 24 meses; 6 si no escribió cuánto ahorra. Queda en el registro.
- "Ver estudios" lleva a Proyectos con el filtro Estudio.

**S9-F4 Fichas** (`#ficha/arriendo-opcion` y `#ficha/respaldo-familiar`)
- Cada ficha tiene: cómo funciona (lista numerada de 3 pasos), números con el departamento de UF 2.500, peor caso, dónde existe y "Me interesa".
- "Me interesa" es un botón con `aria-pressed`. Al tocarlo de nuevo se quita. Se guarda en el registro.
- Números de cada ficha:

  | Ficha | Números |
  |---|---|
  | Arriendo con opción de compra | Proporción de Hogarízate: arriendo $354.919 + $343.186 al pie = $698.105 al mes. El 10 % en 30 meses y, después, un dividendo de $464.549. Si hay sueldos, dice qué % del ingreso es |
  | Respaldo familiar | Tú pones 5 % ($5.133.125), el familiar deja 10 % ($10.266.250), Bci presta 95 %: dividendo de $488.761. El depósito se libera cuando la deuda baja al 80 % del precio: 93 meses (7,8 años) |

**S9-F5 Comprar más barato** (Proyectos)
- Chips: Estudio, 1 dormitorio, Usado (−17,6 %) e IVA cero (−6,5 %).
  - Los de tamaño filtran por dormitorios. Los de precio cambian el precio de la tarjeta.
  - Dentro de cada grupo, los chips se excluyen entre sí.
- Con un filtro activo, cada tarjeta dice "Tu pie: $Y, $Z menos que en uno de UF 2.500" (`pieMasBarato`).
- El usado se calcula sin subsidio a la tasa (4,5 %), y una nota lo explica. IVA cero muestra sus fechas (del 1-dic-2026 al 1-dic-2027) y que la rebaja la decide la inmobiliaria.
- Estado vacío nuevo: "No hay estudios en esta pestaña", con la acción "Quitar el filtro de tamaño".
- Dato nuevo: **Edificio Portal Estación** (compra en grupo, estudios de UF 1.200 en Estación Central). Así, en modo vivir también hay un estudio.

**S9-F6 Registro de la sesión de prueba** (`#registro`, desde Perfil)
- Campos: plazo antes y después (en años), camino elegido (se llena solo al elegir, y se puede cambiar), explicación (0–3) y confianza (1–5) como botones de 44 px, y los "Me interesa".
- El registro se exporta como texto (`textoRegistro`) en un cuadro de solo lectura, con el botón "Copiar el registro". Si el teléfono no deja copiar, el texto queda seleccionado.
- Se guarda aparte. "Nueva sesión: borrar el registro" lo limpia. "Empezar de nuevo" no lo borra, para no perder la sesión por error.

## Verificación

- `node --test tests/*.test.js`: 115 pruebas, 0 fallas. Hay 18 pruebas nuevas en `tests/caminos.test.js`.
- `node --check js/*.js`: sin errores.
- Recorrido con Playwright a 390 y 360 px:
  - casos: arrendar con grupo (A + B), elegir, filtros de Comprar más barato, vivir con 1.200.000 y cuotas de 200.000 (Todavía no), Recordarme, las dos fichas con Me interesa, Ver estudios, registro y caminos sin sueldos;
  - resultado: sin errores de JavaScript, sin scroll horizontal y sin "plata", "depto" ni "la IA recomienda".
- El recorrido del Sprint 8 sigue funcionando.
- Corrección de paso: `.chip[hidden]` ahora se oculta. Antes, el chip "Filtrado por IA" se veía en modo vivir.

## Decisiones y límites (para el Planner)

1. **Departamento de referencia fijo (UF 2.500).** Tu mes real y los caminos usan siempre ese precio, para que coincidan con `SPEC.md`. Una alternativa sería usar el proyecto en grupo que le alcanza.
2. **Respaldo familiar a 95 / 5.** Se tomó la versión de Barclays con 5 % del comprador. Con 90 % de crédito no baja el pie. El depósito se libera en 7,8 años, no en 5: lo dice la ficha.
3. **Elegir "A · Compra en grupo" para invertir** (el comprador pone 20 %) lleva a la pestaña Compra en grupo, que en modo arrendar todavía muestra el reparto 80 / 15 / 5. El Sprint 10 (pie en cuotas) debería mostrar el reparto 80 / 20 cuando ese sea el camino elegido.
4. **Créditos individuales** (con FOGAES o al 80 %): la app no tiene una lista de departamentos sueltos, así que el camino lleva a Proyectos.
5. **El Usado** se aplica como precio de referencia sobre proyectos nuevos, y la nota lo aclara.
