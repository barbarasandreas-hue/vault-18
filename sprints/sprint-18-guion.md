# Guion · Sprint 18: un solo camino de punta a punta

Para pegar en Claude Code, en la carpeta `vault-18`. Usa el rol `generator` y después el `evaluator`.

---

**1. Generar (rol generator)**

```
Lee CLAUDE.md y la sección "Sprint 18 · Un solo camino de punta a punta" de PLAN.md.
Programa el Sprint 18 en el orden de los bloques: primero el Bloque 1 (S18-F1 a S18-F4), después el 2 (S18-F5 y S18-F6) y al final el 3 (S18-F7 a S18-F9).

Reglas:
- Todas las fórmulas nuevas van en js/calculos.js, con pruebas en tests/sprint18.test.js. Las pantallas solo las llaman.
- No toques el modo arrendar.
- Textos mínimos al estilo Bci: nada de párrafos nuevos; lo que explica va en "?".
- Precisión según lo decidido: rangos sin departamento, redondeado con departamento, exacto solo en la simulación, la preaprobación y Firmar.
- Un commit por feature, con el mensaje en español (por ejemplo: "S18-F1 Descuento real del grupo").

Al terminar cada bloque:
- corre node --test tests/*.test.js;
- recorre la app a 390 px y dime qué cambió y en qué pantalla verlo.

Al final, escribe sprints/sprint-18-entrega.md con lo hecho, las diferencias con el plan y la verificación. Deja las features en "en progreso" en la tabla de Estado.
```

**2. Revisar (rol evaluator)**

```
Revisa el Sprint 18 contra PLAN.md con el recorrido A completo (de las preguntas a Mi departamento) y el recorrido "Solo yo" ($1.100.000 de sueldo, $0 ahorrado, $250.000 al mes, UF 1.500 a 2.000), a 390, 360 y 320 px.

Revisa:
- con 6 de 10 cupos, ninguna pantalla da el 5 % por ganado;
- "Juntas antes de firmar" es el mismo número en Detalle, Tu pie, Inicio y Firmar;
- Tu obra y "Tus llaves" muestran la misma fecha, y no se firma antes de la entrega;
- después de juntar el pie, ningún aviso habla del cierre del grupo como algo futuro;
- ningún monto exacto antes de Postular, salvo en "Ver simulación";
- "Todavía no" usa Tu camino y Llega antes, sin carrusel ni las palabras carga, dividendo, al escriturar o peor caso fuera de "?";
- en el recorrido A, "Subsidio del Estado" y "Sin IVA" se pueden activar;
- sin desborde horizontal ni errores de JavaScript.

Aprueba o rechaza cada feature en la tabla de Estado, con la razón en una línea.
```

**3. Publicar**

```
git push
```

Después, abre la app publicada en el teléfono y repite el recorrido A.
