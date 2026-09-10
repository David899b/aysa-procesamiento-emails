# Guión de la presentación — labIA · Concentrix para Aysa · Iniciativa de Calidad de Datos de Contacto

> **Cómo usar:** este guión es tu red de seguridad para la demo y la defensa ante Aysa. Por cada lámina te doy (1) el objetivo de la lámina, (2) qué decir (discurso casi literal), (3) el análisis detrás del dato (origen y cálculo de cada número), (4) posibles preguntas con respuestas fundamentadas, y (5) bloqueadores / decisiones abiertas. Léelo completo antes de presentar; usá la sección de cada lámina durante la defensa.

> **Duración sugerida del demo:** 15–20 minutos para las 17 láminas + 10–15 de preguntas. No detenerte en la lámina de agenda; detenerte donde el público mira.

> **Narrativa:** el camino es **una propuesta principal** — el **MVP piloto (H1)** para detectar inconsistencias en los datos de contacto usados en campañas y generar datasets + evidencias para las áreas de negocio — más una **opción de evolución (Enterprise)** con OCR documental y verificación multiprueba, que se muestra como contexto y no se pide aprobar hoy. No se detallan costos de token (aún no hay muestra real para estimarlos) y no se mencionan sistemas de origen por nombre: se habla de la **casilla Exchange on-prem** (red bajo Ley 25.326), la **fuente de datos corporativa** (base de datos relacional) y las **áreas de negocio** (Dirección Comercial, Comunicaciones, Business Intelligence, Calidad de Datos).

> **Novedad respecto a la versión anterior:** la presentación vuelve a incluir la **opción Enterprise** (OCR documental + verificación multiprueba + dashboard con cola de revisión + **RPA opcional posterior**), agrega el **plan semana a semana** del MVP con las actividades importantes de cada semana, y suma una lámina de **operación en marcha** que explica qué queda automatizado después de implementar. En la lámina de perfiles se **quita la información de dedicación**. Se mantienen los cambios de fondo: sin sistemas de origen por nombre (se habla de la casilla Exchange y de la fuente corporativa), sin SAP/SQL Server/Marketing Cloud (el RPA solo se propone como opción posterior de Enterprise, no como parte del MVP), y sin estimaciones de costo/token (se definen tras analizar una muestra representativa de correos).

---

## Reglas generales de defensa (aplican a toda la demo)

**Lidera con el problema, no con la tecnología.**
1. Abre con "datos de contacto que llegan mal y se detectan tarde", no con "usamos un LLM". La tecnología (modelo, schema, pipeline) aparece recién en la lámina de arquitectura.
2. **Nunca des un solo número:** siempre rangos o 3 escenarios (pesimista / base / optimista) con su supuesto. Un número suelto invita a ser impugnado; un rango con su supuesto es defendible.
3. **Toda cifra ancla en un baseline medible:** ~60K emails históricos, tasa de "no es mi cuenta", horas manuales de revisión actuales. Los tres se calibran con la muestra real en la semana 1. Si preguntan "¿de dónde sale?", la respuesta correcta es el supuesto + cómo lo validamos, no una certeza inventada.
4. **Baja el riesgo del ask:** se pide aprobar solo **H1 (el piloto MVP)**. El peor escenario de Aysa es perder solo el presupuesto del piloto. Ese es el argumento que cierra.
5. **Conocé a tu audiencia:**
   - **CFO** → costo acotado del piloto, valor de evitar el re-procesamiento y reclamos por contacto mal dirigido.
   - **CIO / IT** → corre dentro de la VPN, conecta Exchange con mínimo privilegio, no toca los sistemas de origen.
   - **CEO** → datos de contacto confiables = menos fricción con el cliente y menos riesgo reputacional.
   - **Dirección Comercial / Comunicaciones** → datasets por campaña para decidir con evidencia y corregir el proceso de origen.
   - **Compliance / Legal** → Ley 25.326, PII, DPA: el guión del riesgo R2 lo cubre.
6. **Tené el registro de riesgos a mano** (lámina 13): cada objeción de compliance o de negocio se responde con una fila del registro, no con improvisación.

---

## Detalle transversal: el pipeline completo (leé esto antes que las láminas)

Todo lo que se muestra en la demo es una sola tubería (pipeline) de 4 pasos. Si entendés esto, cualquier lámina se defiende sola:

**Paso 0 · Preparación (previo a cualquier arranque)**
- Pedir **muestra real de la casilla** (permisos de solo lectura, vía IT).
- **Análisis exploratorio:** volumen por año, campañas identificables, formatos de adjuntos, porcentaje de ruido real.
- **Definir la taxonomía de clasificación con las áreas:** `CONFIRMA · NO_ES_MIA · DUDOSO · OPTOUT · IRRELEVANTE` (qué significa cada una y qué se hace con cada salida).
- **Construir el golden set** (~300 emails etiquetados junto a las áreas). Es el "examen" contra el que se miden las métricas de precisión.

**Paso 1 · Ingesta desde la casilla**
- Conector dentro de la **VPN de Aysa** leyendo la casilla Exchange (EWS/Graph) o importando desde un archivo **PST** como respaldo.
- **Incremental con dedupe** (ID + hash del mensaje) para no reprocesar lo ya visto.
- Volcado a **staging en el repositorio corporativo de datos** (append-only, con fecha de proceso y checksum de integridad).

**Paso 2 · Clasificación y extracción**
- El caso es principalmente **texto**: modelo liviano con **schema estricto** y **prompt por campo** (patrón Instructor/DocInfo) según la estructura de salida definida con las áreas.
- Primero un **filtro determinístico** (reglas de código, sin IA): saca bounces, out-of-office, spam y vacíos sin gastar cómputo del modelo.
- **Juez de validación** (~30% de los casos): un segundo pase verifica que la salida sea coherente; si no concuerda, pasa a revisión humana.

**Paso 3 · Verificación contra la fuente corporativa**
- Cruce **determinístico** (sin LLM) contra la **base de datos relacional corporativa**.
- Lógica de evidencia: `Coincide · No coincide · Requiere revisión` — la herramienta **nunca decide por sí sola**.
- Esto es lo que previene fraude y suplantación: la IA clasifica y extrae; la evidencia la aporta el cruce.

**Paso 4 · Datasets y evidencias**
- Estructura de salida **definida con BI y las áreas** desde el kickoff.
- **Datasets por campaña** + rastro de evidencia por email para el análisis posterior.

**Decisión de despliegue (lámina 12):**
- **Self-host dentro de la VPN:** modelos ligeros (Qwen2.5-7B/14B). Los datos nunca salen de la red; cumple Ley 25.326 sin transferencia de PII.
- **Cloud con DPA:** gpt-5-mini / gemini-3-flash. Más simple de operar, pero la PII sale de la red bajo contrato (DPA + retención aprobadas).
- Recomendación honesta: **probar ambos en el piloto con la muestra** y decidir con datos, no por preferencia. Las **estimaciones finales de costo se hacen luego del análisis de una muestra representativa** de correos.

---

## Lámina 1 — Portada

**Objetivo de la lámina:** posicionar quién habla, qué se propone y qué se promete, en menos de 60 segundos.

**Qué decir:**
> "Soy [nombre], del labIA de Concentrix. Trabajamos en la iniciativa de Calidad de Datos de Aysa: detectar inconsistencias en los datos de contacto que usan las campañas de comunicación, generar datasets y evidencias para las áreas de negocio, y alimentar la mejora de los procesos de origen. Hoy les traemos el camino concreto para hacerlo: un piloto acotado de 8 a 12 semanas."

**Análisis del dato (detrás de cada número):**
- `~60K Emails históricos` → volumen acumulado en la casilla (varios años, múltiples campañas). Es una **estimación a calibrar con la muestra**; el diseño no depende del número exacto, pero el plan de cómputo sí.
- `Texto` → el contenido principal del caso son correos de campaña: no se necesitan modelos complejos ni OCR en el MVP. Es la razón por la que el piloto es barato y rápido.
- `Evidencia · No decide: sustenta` → el posicionamiento clave: la herramienta **clasifica y extrae**, la evidencia la aporta el **cruce con la fuente corporativa**, y la decisión final es del **área responsable**. Es la respuesta preventiva a compliance.
- `8–12 sem · MVP · piloto` → el plazo del H1 (lámina 14). Se campaña con "shrink the ask": es lo único que pedimos aprobar hoy.

**Preguntas probables:**
- *"¿Ya tenemos algo funcionando?"* → No todavía: lo que traemos es la propuesta para validar con una muestra real y arrancar el piloto. Es una ventaja: no hay código heredado ni deuda técnica.
- *"¿Por qué arrancar con datos de contacto?"* → Porque es donde el problema es visible y medible hoy (emails que responden "no es mi cuenta"), y porque el patrón (casilla → clasificación → cruce → evidencia) es reutilizable para otras casillas después.

**Decisiones abiertas:** confirmar volumen real de la casilla y el rango de campañas activas (afecta cómputo y calendario).

---

## Lámina 2 — Agenda

**Objetivo:** marcar el recorrido y fijar expectativa de tiempo. No detenerse.

**Qué decir:**
> "Recorremos 9 puntos: contexto y problema de negocio, objetivo, rol de la solución, arquitectura, la propuesta MVP con sus etapas, cronograma y perfiles, modelos de IA, y por último riesgos, métricas y go/no-go. Cierra la ronda de preguntas. Son 14 láminas en total."

**Análisis:**
- La agenda narra un arco deliberado: **problema → objetivo → rol → arquitectura → solución → confianza (riesgo/métrica) → decisión**. Primero se vende el problema, después la solución, al final el "cómo" y el riesgo.
- Los puntos 07 y 08 juntos son la sección de **confianza**: cómo se mitiga el riesgo y cómo se mide el éxito.

**Procedimiento:** leer los 9 puntos en ~10 segundos, sin detalle. Si el público quiere saltar a un tema, decírselo en qué número está para que lo ubiquen.

---

## Lámina 3 — El problema

**Objetivo:** esta es la lámina más importante. Vende el costo de no hacer nada. Si no se siente el problema acá, el resto no se sostiene.

**Qué decir:**
> "Las campañas se apoyan en múltiples orígenes de datos y en procesos manuales que pueden introducir errores. Hoy esos errores se detectan tarde —cuando el usuario responde 'no es mi cuenta'— y no se sabe en qué paso se generó el dato incorrecto. El costo de no hacer nada no es cero: es re-procesamiento, reclamos de clientes que reciben comunicación de una cuenta que no es suya, y horas de gente revisando a mano."

**Análisis del dato (origen y cálculo):**
- **Múltiples orígenes de datos** → las campañas se alimentan desde distintas fuentes y formatos; la casilla mezcla respuestas de todas. Hoy no hay separación por campaña.
- **Procesos manuales** → carga y validación a mano, sin control de origen: es ahí donde el dato incorrecto entra al circuito.
- `"No es mía"` → la señal observable: el email no corresponde a la cuenta asociada en la campaña. Cada aparición es un **evento medible** (baseline del problema).
- **Origen sin identificar** → el dato incorrecto se conoce tarde y no se sabe dónde se generó: no se puede corregir la causa, solo apagar incendios.

**Análisis del callout "De qué trata esta propuesta":**
- La propuesta **no** promete "decisión automática": promete **detectar inconsistencias** y generar **insumos** para que las áreas responsables corrijan los **procesos de origen**. Esa es la concesión de humildad que desarma la objeción "no nos confiamos a un algoritmo".

**3 escenarios para el costo de no hacer nada (usar solo si preguntan por cuantificación):**
- **Pesimista:** los errores crecen con el volumen de campañas; cada campaña nueva re-propaga los datos mal cargados; el reproceso y los reclamos suben sin freno.
- **Base:** el error se sigue detectando solo por el boca a boca del cliente; el equipo rectifica a mano; la incidencia no baja.
- **Optimista:** el volumen real es chico y el error es marginal. Aun así, el piloto relevará los tres escenarios con la muestra y decidiremos con dato.

**Preguntas probables:**
- *"¿Cuánto nos cuesta hoy no hacer nada?"* → No es solo plata: es dato muerto en una casilla que nadie ordena, riesgo de contacto mal dirigido (molestia, reclamos, posible afectación reputacional) y horas de equipo en tareas repetitivas. El costo del piloto es chico y acotado; el costo de no hacer nada es estructural y se acumula con cada campaña.
- *"¿Cómo saben que el problema existe?"* → Porque el propio flujo lo produce: la casilla acumula respuestas de muchas campañas y el dato de contacto se confirma o se corrige a mano. La primera semana del piloto medimos el baseline real (volumen, tasa de 'no es mía', horas manuales).
- *"¿Esto lo hace gente hoy?"* → Sí: es parte del trabajo operativo de la casilla. La propuesta no elimina personas, elimina la tarea repetitiva; la persona pasa a revisar los casos dudosos con más contexto.

**Decisiones abiertas:** baseline de horas manuales y tasa actual de "no es mi cuenta" (que Aysa confirme si quiere el "antes vs después" para el informe).

---

## Lámina 4 — El objetivo

**Objetivo:** definir qué SÍ logra la solución y para quién, y fijar expectativas realistas.

**Qué decir:**
> "El objetivo es detectar inconsistencias y su origen. Para eso clasificamos cada email —CONFIRMA, NO_ES_MIA, DUDOSO, OPTOUT, IRRELEVANTE—, extraemos los campos clave —email, cuenta o contrato, nombre, dirección, teléfono, documento y tipo, relación con el titular y titular—, cruzamos contra la fuente de datos corporativa y entregamos datasets por campaña con evidencia, para que las áreas decidan."

**Análisis del dato (cada clase y qué se hace):**
- `CONFIRMA` → la persona está de acuerdo / el dato de contacto corresponde → pasa a la lista válida de la campaña.
- `NO_ES_MIA` → el contacto no corresponde a la cuenta → no es un error del cliente, es **información válida para evitar contacto indebido** y para rastrear dónde se generó el dato.
- `DUDOSO` → no se puede determinar sin revisión → **va a humano** (nunca se fuerza a la máquina a decidir).
- `OPTOUT` → pide baja → se registra y se respeta (implica cumplimiento de preferencias).
- `IRRELEVANTE` → ruido o no accionable → se descarta del dataset.
- La taxonomía se define y confirma **con las áreas**; si Aysa tiene clases propias, se ajusta el schema en el kickoff. Nunca la inventa labIA solo.

**Análisis de los destinatarios (áreas de negocio):**
- **Dirección Comercial** → ve qué campañas tienen datos de contacto inconsistentes y dónde.
- **Comunicaciones** → usa los datasets para no mal-comunicar a titulares equivocados.
- **Business Intelligence** → consume datasets limpios y evidencia reproducible.
- **Calidad de Datos** → recibe el insumo para corregir el **proceso de origen** (la causa, no solo el dato puntual).
- Cada área recibe lo que necesita para **decidir y corregir la fuente**, pero la decisión y la corrección quedan en ellas.

**Preguntas probables:**
- *"¿8 campos extraídos de cada mail? ¿Y si falta alguno?"* → El schema es estricto pero tolerante: los campos ausentes se marcan y el caso pasa a `DUDOSO`. Nunca se inventa un valor.
- *"¿Cómo saben que el email es de quién dice ser?"* → Nunca por el LLM: se cruzan los datos extraídos contra la fuente corporativa y, si no pasa el umbral, va a revisión humana. La confirmación es un proceso determinístico, auditado.

---

## Lámina 5 — Rol de la solución

**Objetivo:** dejar explícito qué hace y qué NO hace la herramienta. Mata la objeción "¿un algoritmo va a decidir por nosotros?".

**Qué decir:**
> "Quiero ser explícito en el rol. La herramienta clasifica correos, extrae información, genera datasets por campaña, aporta evidencias y facilita el análisis posterior. Lo que NO hace: no corrige ni modifica datos automáticamente, no es un sistema que toma decisiones, no confirma titularidad solo por el modelo —el cruce con la fuente corporativa aporta la evidencia— y no reemplaza Exchange ni los procesos actuales. La decisión y la acción correctiva quedan en las áreas responsables."

**Análisis de cada "qué NO hace":**
- **No corrige ni modifica** → desactiva la preocupación de "nos van a tocar el padrón".
- **No es un sistema que decide** → la responsabilidad queda en humanos: es una herramienta de **evidencia**, no de **autoridad**.
- **No confirma solo por el modelo** → el cruce determinístico contra la fuente corporativa es el que aporta la evidencia. Esto previene fraude/suplantación y errores bajo Ley 25.326.
- **No reemplaza Exchange ni los procesos actuales** → reaseguro de "no asusta": se apoya en lo que ya existe.

**Preguntas probables:**
- *"¿Quién valida lo que el sistema devuelve?"* → El analista funcional / referente de negocio define la taxonomía y valida el golden set; el juez y la revisión humana cubren los casos dudosos. Cada resultado tiene dueño de validación.
- *"¿Entonces para qué sirve si no decide nada?"* → Para que la decisión sea mejor y más rápida: ordena la casilla, detecta dónde se origina el error y le da a cada área la evidencia que hoy no tiene.

---

## Lámina 6 — Arquitectura

**Objetivo:** mostrar que hay un flujo claro de 4 pasos, entendible y defendible, y fijar la "regla de oro".

**Qué decir:**
> "La arquitectura es un flujo de 4 pasos. Uno: ingesta desde la casilla —un conector dentro de la VPN lee Exchange por EWS o Graph, o importamos desde un archivo PST, con dedupe e incremental, y staging en el repositorio corporativo de datos. Dos: clasificación y extracción —el caso es texto, usamos un modelo liviano con schema estricto y prompt por campo según la estructura definida con las áreas. Tres: verificación contra la fuente corporativa —cruce determinístico; la evidencia es Coincide, No coincide, o Requiere revisión. Cuatro: datasets y evidencias —la estructura de salida se define con BI y las áreas, dataset por campaña con el rastro de cada email."

**Análisis de cada paso (por qué está diseñado así):**
- **1 · Ingesta** → vive dentro de la VPN (Ley 25.326). La alternativa PST es el respaldo si IT no habilita conexión directa en el plazo del piloto (riesgo R3).
- **2 · Clasificación** → separa el filtro determinístico (ruido, barato) del modelo (texto fino). `Instructor/DocInfo` = salida validada por schema, no texto libre.
- **3 · Verificación** → un proceso determinístico sin IA: la evidencia es reproducible y auditable. Es el corazón de la regla anti-fraude.
- **4 · Salida** → "contrato de datos" con BI: si el formato se definió al inicio, el dataset se consume sin retrabajo (riesgo R6).

**Análisis del callout "regla de oro":**
- La herramienta **clasifica y extrae**; la evidencia la aporta el **cruce**; la decisión final es del **área responsable**. Esa división es lo que hace la propuesta defendible ante compliance, ante IT y ante el negocio a la vez.

**Preguntas probables:**
- *"¿Por qué cruzar contra la base y no confiar en el modelo?"* → Porque la confirmación de titularidad bajo Ley 25.326 no puede depender de una probabilidad: el cruce determinístico da una evidencia reproducible que audita quién, cuándo y contra qué fila se validó.
- *"¿Y si Exchange pasa a Microsoft 365?"* → El mismo patrón funciona con Graph API. El diseño es agnóstico del canal de conexión.

**Decisiones abiertas:** confirmar los campos de la fuente corporativa disponibles para el cruce y las tablas/permisos de lectura.

---

## Lámina 7 — Propuesta MVP · Etapas

**Objetivo:** vender que con poco se resuelve el problema hoy. Es EL pedido de la reunión.

**Qué decir:**
> "El MVP detecta inconsistencias ya: clasificación y extracción de texto de la casilla, cruce con la fuente corporativa y generación de datasets más evidencias por campaña. Dura de 8 a 12 semanas —base de 10, pesimista de 12 y optimista de 8— y tiene 8 actividades: análisis de requerimientos y muestra de correos, desarrollo de la extracción desde Exchange o importe PST, diseño del esquema de clasificación, implementación del modelo de IA, integración con la fuente de datos corporativa, validación con golden set, generación de reportes y datasets, y pruebas y ajustes finales."

**Análisis del dato (cada card del bloque derecho):**
- **Duración 8–12 semanas** → el detalle semana a semana con tareas y responsables va en las láminas 8–9. En la lámina 7 solo se expone el mensaje de "corto y acotado" y los escenarios (base 10 · pesimista 12 · optimista 8).
- **Contenido: Texto** → sin OCR de adjuntos. Esto es lo que hace el MVP barato y rápido. Los adjuntos quedan para la **opción Enterprise** (lámina 10): OCR documental, evaluación con datos reales.
- **Modelo: Liviano** → corre self-host (VPN) o cloud con DPA. No requiere infra pesada.
- **Decisiones: Áreas** → la herramienta sustenta; el área decide. Coherente con la lámina 5.

**Análisis de las 8 actividades (cómo leerlas):**
- Las actividades 1–2 son el **baseline** (sin esto no se dimensiona nada). La 3–4 son el **corazón de IA**. La 5 es la **evidencia**. La 6–8 son la **confianza** (medición y ajuste final). Ese orden es el del plan semana a semana (láminas 8–9).

**Preguntas probables:**
- *"¿Por qué empezar tan acotado?"* → Para validar la clasificación real contra la casilla con mínimo riesgo. Si no funciona, la pérdida es pequeña y acotada al piloto. Si funciona, el mismo motor se reutiliza para la opción Enterprise y para más casillas.
- *"¿Procesan adjuntos (facturas, comprobantes)?"* → No en el MVP: el caso actual es texto de campañas. La capacidad documental (OCR) está en la opción Enterprise (lámina 10), y se evalúa con datos, no por ahora.

**Decisión abierta:** ¿aprueban H1 (MVP)? Es EL ask de la reunión.

---

## Lámina 8 — Plan semana a semana · Semanas 1–6

**Objetivo:** mostrar que el arranque del piloto tiene pasos claros, medibles y con responsables. Transmite "esto se puede validar", no "vamos a ver".

**Qué decir:**
> "La propuesta MVP tiene su plan semana a semana, de 8 a 12 semanas según escenario. Las primeras 6 semanas construyen la base y entrenan el examen. Semana 1, discovery: pedimos y validamos la muestra real, hacemos el workshop de taxonomía con las áreas y definimos el plan de acceso a la casilla. Semana 2, lectura: leemos la casilla —volumen, campañas, porcentaje de ruido— y medimos el porcentaje real de correos útiles; ya adelantamos el contrato de salida con BI. Semana 3, extracción: conectamos Exchange, montamos el área de trabajo en el repositorio corporativo e implementamos el filtro de ruido. Semana 4, el examen: etiquetamos el golden set con el negocio, congelamos el set de test, armamos los prompts por campo con schema estricto y corremos el primer modelo. Semana 5, control de calidad: implementamos el juez, ajustamos umbrales y medimos contra las metas —90% de clasificación, 95% de extracción y menos de 30% de derivación a revisión. Semana 6, revisión de calidad: analizamos los errores por causa raíz y dejamos el plan de ajuste fino para el examen final. En cada semana alguien entrega y alguien valida, siempre personas distintas."

**Análisis del dato (cada semana y por qué importa):**
- **S1 · Discovery** → es el baseline: sin la muestra real no se dimensiona nada. El entregable es el esquema aprobado por el negocio + el plan de acceso.
- **S2 · Lectura y datos** → mide el % útil real y adelanta el formato de salida con BI: primero se mide y después se promete. El contrato de salida temprano es lo que evita el retrabajo (riesgo R6).
- **S3 · Extracción** → el piloto ya lee la casilla real sin tocar nada (solo lectura, dentro de la VPN) y con trazabilidad desde el primer byte. Es la primera foto del proceso que hoy se hace a mano.
- **S4 · Golden set** → aquí el negocio define qué significa cada clase: el "examen" es de Aysa, no de labIA. El split 70/15/15 congelado es la garantía anti-"cocinar" las métricas finales.
- **S5 · Juez y umbrales** → el segundo control para los casos grises y la primera medición contra las metas de la lámina 15.
- **S6 · Revisión de calidad** → los errores se clasifican por causa raíz (¿prompt, definición o dato?) y se deja plan de ajuste sin tocar el test.

**Preguntas probables:**
- *"¿Y si la muestra no está lista en la semana 1?"* → El piloto se replanifica: no arrancamos sobre supuestos. Es el kill criterion de acceso de la lámina 15.
- *"¿Quién valida que el golden set esté bien hecho?"* → Doble etiquetado por parte del negocio (dos personas etiquetan por separado) + medición del acuerdo entre etiquetadores (≥ 0.8) + resolución de discrepancias con un tercero.
- *"¿Por qué tanto tiempo en la base y la calidad?"* → Porque el test final se congela en la semana 4 y no se toca: todo el ajuste de calidad se resuelve antes, con método, y se mide después con honestidad.

**Decisiones abiertas:** fecha de disponibilidad de la muestra y de las sesiones de las áreas para el golden set.

---

## Lámina 9 — Plan semana a semana · Semanas 7–12

**Objetivo:** cerrar el plan con la parte que genera la evidencia, el examen final y la entrega.

**Qué decir:**
> "En las últimas seis semanas se produce la evidencia y la entrega. Semana 7: normalizamos los datos y habilitamos los permisos de lectura de la fuente corporativa. Semana 8: hacemos el cruce determinístico —Coincide, No coincide o Requiere revisión— y firmamos con BI el contrato de salida; es cuando mostramos un correo real resuelto de punta a punta. Semana 9: es el examen final: corremos el pipeline completo sobre el set de test que quedó congelado en la semana 4, ajustamos fino y tomamos la decisión de modelo con datos reales. Semana 10: procesamos el histórico útil completo, generamos los datasets por campaña con su evidencia, documentamos todo y armamos el tablero. Semana 11: validación final contra las metas y el informe de go/no-go con 3 escenarios. La semana 12 es de traspaso y cierre: show & tell con las áreas y firma del cierre. El escenario base es de 10 semanas; pesimista, 12; optimista, 8 si EWS se habilita rápido. Los desvíos se absorben en el escenario pesimista; nunca se comprime la validación."

**Análisis del dato (cada semana y por qué importa):**
- **S7 · Normalización y acceso** → reglas versionadas y permiso mínimo de lectura sobre datos reales de Aysa (depende de D3): la evidencia se construye sobre los datos del cliente, no sobre pruebas.
- **S8 · Cruce y contrato** → la confianza no depende de la IA: la evidencia la da un cruce determinístico contra los datos de Aysa, reproducible y auditable. El contrato de salida con BI evita el retrabajo (riesgo R6). Entregable: un correo resuelto de punta a punta.
- **S9 · Examen final** → el set de test congelado en la S4 no se usó para ajustar nada: las métricas finales son honestas. Acá también se decide self-host vs cloud con el cómputo real de la muestra.
- **S10 · Datasets y documentación** → datasets + evidencias + documentación versionada + tablero. Es la entrega lista para consumir, no un demo.
- **S11 · Validación e informe** → siempre 3 escenarios (pesimista / base / optimista) anclados en el baseline medido; el gate lo preside el Sponsor.
- **S12 · Traspaso y cierre** → cierre con show & tell y firma; los desvíos se absorben en el escenario pesimista. Nunca se comprime la validación.

**Preguntas probables:**
- *"¿Qué pasa si en la semana 9 no se llega a la meta?"* → Se reporta el gap con plan de cierre. Si no se cierra ni con revisión, se activa el kill criterion de precisión de la lámina 15.
- *"¿Por qué 12 en el escenario pesimista y no 10?"* → Porque el plan contempla el imprevisto dentro del rango 8–12: comprometer el rango sin sorpresas exige nunca comprimir la validación.

**Decisiones abiertas:** resultado del cruce sobre datos reales (depende de D3) y decisión self-host vs cloud.

---

## Lámina 10 — La opción Enterprise

**Objetivo:** mostrar la evolución sin pedirla. Enterprise se presenta como **opción**, no como parte del ask de hoy, y esta vez explica mejor **qué problema resuelve** (los casos con adjuntos que el texto no alcanza) y agrega el **RPA como opción posterior**.

**Qué decir:**
> "Enterprise es la misma base del MVP, ampliada, y resuelve lo que el texto solo no alcanza: los adjuntos y comprobantes. Con OCR, el documento pasa a ser la segunda señal de titularidad, y con verificación multiprueba —email más documento más fuente corporativa— bajamos la cantidad de casos que quedan 'requieren revisión'. En el plano operativo, Enterprise deja la evidencia integrada al día a día: dashboard en vivo y cola de revisión para las áreas. Alcance: de 12 a 16 semanas después del MVP, con más mantenimiento porque los formatos de los comprobantes cambian. Adicionalmente proponemos, como etapa posterior y opcional, el RPA: automatizar el último tramo —detectada la inconsistencia, generar la solicitud de corrección o actualizar la fuente de origen en los sistemas que Aysa ya opera— pero solo si el cliente ya tiene RPA; no es parte del MVP ni del pedido de hoy. Lo importante: Enterprise reutiliza la arquitectura de 4 pasos del MVP —el MVP es el primer escalón real— y tiene su propio go/no-go. Nada de Enterprise bloquea H1."

**Análisis de cada card:**
- **Qué resuelve** → OCR de adjuntos y comprobantes (segunda señal de titularidad), verificación multiprueba (menos casos "requieren revisión") y cobertura de los correos con adjunto que el MVP deja señalados. Es la evolución sobre el motor del MVP.
- **Qué implica** → 12–16 semanas después del MVP; mantenimiento mayor (los formatos de comprobantes cambian y exigen re-ajustar el OCR); costos a estimar con muestra real (sin estimaciones a priori); entrega integrada con dashboard en vivo y cola de revisión.
- **RPA opcional (posterior)** → automatiza el **último tramo**: con la inconsistencia ya detectada y evidenciada, generar la corrección o actualizar la fuente de origen en los sistemas que Aysa ya opera. Se propone **solo condicionado a que el cliente ya tenga RPA**, con su propia evaluación y go/no-go. Es una etapa anterior en la gestión del riesgo, no una promesa.
- **Relación con el MVP** → comparte la arquitectura; el MVP es el escalón que lo valida; go/no-go propio.

**Análisis del callout:**
- "Hoy solo se aprueba H1; Enterprise y el RPA se evalúan con su propio go/no-go." Es la píldora de **shrink the ask**: se muestra la visión, se pide el mínimo.

**Preguntas probables:**
- *"¿Por qué no ir directo a Enterprise?"* → Porque Enterprise sin validar la clasificación en la casilla real es invertir mucho en algo que todavía no sabemos que funciona. El MVP es el termómetro que justifica la plataforma.
- *"¿Y el OCR para facturas y comprobantes?"* → Está en Enterprise, la opción de evolución. No se liga al caso actual para no vender humo: cuando exista un caso real, se dimensiona con datos.
- *"¿El RPA lo hacen ustedes?"* → No es parte del MVP ni del ask. Solo lo proponemos como etapa posterior (en Enterprise) y condicionado a que Aysa ya tenga RPA en operación: ahí la automatización del último tramo tiene sentido y se evalúa con su propio go/no-go.

**Decisión abierta:** no se pide aprobar Enterprise hoy; solo H1.

---

## Lámina 11 — Perfiles

**Objetivo:** mostrar que el equipo es chico, especializado y con responsabilidades explícitas.

**Qué decir:**
> "El equipo del MVP tiene 4 perfiles. Un especialista en automatización e integración: conexión a la casilla, staging y salidas. Un especialista en datos e IA: schema de salida, prompts por campo, modelo, juez y golden set. Un analista funcional / referente de negocio: taxonomía, etiquetado de muestra y validación de resultados. Y el responsable de datos / BI: formato de salida, consumo en BI y control de calidad de los datasets. La regla de operación: cada tarea tiene un dueño de entrega y un dueño de validación."

**Análisis de los perfiles:**
- **Automatización / Integración** → construye el tramo técnico (conector, staging, salidas). Entrega.
- **Datos e IA** → construye el corazón (schema, prompts, modelo, juez, golden set). Entrega.
- **Analista funcional / negocio** → define la taxonomía, etiqueta la muestra y valida resultados con ojos de negocio. Valida.
- **Responsable de datos / BI** → define el formato de salida, valida el consumo en BI y controla la calidad del dataset. Valida.
- Dos perfiles de labIA entregan y dos perfiles de Aysa validan: el equipo mixto en el que nadie es juez de su propio trabajo.

**Análisis del callout:**
- "Cada tarea tiene un dueño de entrega y un dueño de validación" = separación de responsabilidades: el desarrollador no aprueba sus propios resultados. Es el argumento anti-riesgo frente a "¿y si se aprueban sus propios resultados?".

**Preguntas probables:**
- *"¿Quién de Aysa participa y cuánto tiempo?"* → El referente de negocio (analista funcional) para la taxonomía y el golden set, y el responsable de datos/BI para el contrato de salida. Ambos con sesiones puntuales definidas en el kickoff. No es gente dedicada full-time.
- *"¿Se necesita contratar a alguien?"* → No: el equipo es el que presentamos. Lo que sí se necesita son horas puntuales de dos áreas de Aysa.

---

## Lámina 12 — Modelos de IA

**Objetivo:** responder "¿con qué corre la IA?" y "¿cuánto cuesta?" de forma honesta: sin números inventados.

**Qué decir:**
> "El caso es texto, así que usamos modelos livianos. Opción A: self-host dentro de la VPN, modelos de la familia Qwen (2.5 de 7B o 14B): cómputo local, los datos nunca salen de la red y se cumple la Ley 25.326 sin transferir información personal. Opción B: cloud con DPA, modelos como gpt-5-mini o gemini-3-flash, con extracción por prompt por campo — pero requiere DPA y política de retención aprobadas. Un punto importante sobre costos: no presentamos estimaciones de token en esta instancia porque aún no tenemos datos reales de la casilla. Las estimaciones finales se hacen luego del análisis de una muestra representativa de correos."

**Análisis del dato (por qué no hay costos en la lámina):**
- La versión anterior del deck mostraba estimaciones de token (USD) basadas en supuestos de tokens por email. **Se retiraron a propósito**: no hay muestra real de la casilla aún, y cualquier número sería impugnable.
- La frase del callout es deliberada y honesta: "estimación final después de la muestra". Si preguntan por costo, esa es la respuesta + el orden de magnitud cualitativo (modelo liviano = cómputo chico).
- **Opción A (self-host)** → cumple 25.326 sin trámite de transferencia; pide cómputo local (infra/virtual). Es la recomendación base por privacidad.
- **Opción B (cloud DPA)** → más simple de operar e iterar rápido con el proveedor; condicionada a DPA + retención aprobadas por compliance.

**Preguntas probables:**
- *"¿Por qué no nos dan los costos ahora?"* → Porque una estimación sin datos reales sería adivinar, y no queremos venderles un número que no vamos a poder defender. Recién con una muestra representativa de correos dimensionamos volumen real, ruido y cómputo, y ahí sí damos rangos. En el piloto, además, probamos ambas opciones en esa misma muestra.
- *"¿Self-host o cloud, cuál recomiendan?"* → Recomendación base: self-host, porque la PII no sale de la red (Ley 25.326). Pero la decisión se toma con dato: probamos ambas con la muestra y medimos precisión y esfuerzo operativo.
- *"¿Necesitan un modelo gigante?"* → No: el caso es texto de campañas, estructura conocida. Modelos livianos con schema estricto alcanzan; para OCR documental (capacidad reutilizable futura) ya se evaluará otro modelo cuando haga falta.

**Decisiones abiertas:** ¿self-host o cloud? Decisión post-muestra, con compliance participando. Y si IT tiene cómputo disponible para self-host.

---

## Lámina 13 — Registro de riesgos

**Objetivo:** demostrar que ya pensamos en lo que puede salir mal y cómo se mitiga, con responsable.

**Qué decir:**
> "No es un párrafo vago: es un registro con probabilidad, impacto y mitigación para cada riesgo, y cada uno tiene responsable. R1, identificación incorrecta del titular —probabilidad media, impacto alto— se mitiga con el cruce contra la fuente corporativa, la evidencia y la revisión en las áreas. R2, datos personales bajo Ley 25.326: self-host dentro de la VPN, o cloud solo con DPA y retención aprobada. R3, acceso a la casilla: acuerdo con IT, con el importe PST como respaldo. R4, datos de origen incompletos o erróneos: es justamente el objetivo — detectarlos con evidencia para corregir el origen. R5, alucinación del modelo: schema estricto, prompt por campo, juez y golden set. R6, formato de salida no aprovechable por BI: contrato de salida definido con el área de datos desde el kickoff."

**Análisis de cada fila (quién responde):**
- **R1 · Identificación incorrecta (Med/Alto)** → cruce determinístico + evidencia + revisión humana en las áreas. Responsable: pipeline (automático) + review humano si ambigüedad. Es el riesgo de mayor impacto reputacional → va primero.
- **R2 · Ley 25.326 / PII (Med/Alto)** → self-host si hay PII; DPA y retención si cloud. Responsable: compliance/Aysa decide la vía; labIA la implementa.
- **R3 · Acceso a la casilla (Med/Med)** → acuerdo con IT de credenciales de mínimo privilegio; PST como respaldo. Responsable: IT de Aysa.
- **R4 · Datos de origen incompletos (Med/Med)** → no es un fallo de la herramienta: es el objetivo de detección. Se informa con evidencia. Responsable: áreas (corrección del origen).
- **R5 · Alucinación (Med/Med)** → schema estricto + prompt por campo + juez + golden set. Responsable: labIA (ingeniería de prompts y validación).
- **R6 · Formato de salida (Baj/Med)** → contrato de salida con BI definido en el kickoff. Responsable: labIA + responsable de datos/BI.

**Procedimiento de gestión durante el piloto:**
- Registro vivo: se revisa en cada gate (meses 1·2·3).
- Un **owner por fila** del lado Aysa (IT/compliance/áreas) + uno en labIA.
- Disparadores de escalada definidos por riesgo (tasa de derivación, precisión del golden set, demoras de acceso).

**Preguntas probables:**
- *"¿Y si el modelo se equivoca y confirma a alguien que no es?"* → Es el riesgo R1 y está atacado por diseño: la IA no decide identidad; el cruce contra la fuente corporativa sí, y si no hay match pasa a revisión humana. La evidencia de cada resultado queda guardada y auditable.
- *"¿Qué pasa si compliance no aprueba cloud?"* → Nada: nos quedamos con self-host (R2 mitigado), que es la opción recomendada de todos modos.
- *"¿Y quién responde por cada riesgo en Aysa?"* → Cada fila tiene un dueño. En el kickoff se asigna el nombre de cada lado; es un entregable del día 1.

---

## Lámina 14 — Roadmap (go/no-go)

**Objetivo:** mostrar el camino completo y pedir el mínimo posible (H1), con reglas de salida claras.

**Qué decir:**
> "Tres horizontes. H1 es el piloto MVP, de 0 a 3 meses, y es lo único que pedimos aprobar ahora: datasets más evidencias por campaña para las áreas, con golden set de validación. H2 es la opción Enterprise, de 3 a 6 meses: OCR documental, verificación multiprueba y dashboard con cola de revisión, todo sobre la misma base del MVP. Y H3 es la escala de casillas, según demanda: aplicar el mismo patrón a otras casillas y áreas. Enterprise y la escala tienen su propio go/no-go. Si H1 no supera los criterios, se cierra con pérdida acotada — el riesgo queda limitado desde el día uno."

**Análisis de cada horizonte (por qué está diseñado así):**
- **H1 · Piloto MVP (0–3 meses, "Aprueba ahora")** → es la única inversión pedida. 8–12 semanas de construcción (base 10 · pesimista 12 · optimista 8) + ventana de medición. Su métrica de éxito está en la lámina 15.
- **H2 · Opción Enterprise (3–6 meses, "Contexto")** → la evolución con OCR y multiprueba, sobre el motor del MVP. Se muestra como opción (lámina 10), no como parte del ask de hoy.
- **H3 · Escala de casillas (según demanda, "Contexto")** → reutiliza el motor: aplicar el patrón a otras casillas y áreas. Es el contrafáctico contra "de qué sirve un MVP": el MVP es la base de la escala.

**Análisis del callout "shrink the ask":**
- Se aprueba solo H1. Si no supera las métricas, se cierra con **pérdida acotada al piloto** y sin tocar sistemas. Es el mecanismo que baja el riesgo percibido del sponsor/CFO al mínimo.

**Preguntas probables:**
- *"¿Qué pasa si el piloto falla?"* → Kill criteria claros y una pérdida acotada al piloto: no hay exposición de sistemas ni de datos. El riesgo total queda limitado desde el día uno.
- *"¿Por qué no prometer la plataforma completa ya?"* → Por honestidad comercial: no sabemos la tasa real de inconsistencia ni la precisión real hasta ver la casilla real. El piloto existe para saber eso antes de escalar.
- *"¿Y el OCR documental para facturas y comprobantes?"* → Está en H2, la opción Enterprise (lámina 10). No se liga al caso actual para no vender humo: cuando lo justifique un caso real, se dimensiona con datos y se aprueba con su propio go/no-go.

---

## Lámina 15 — Métricas de éxito y kill criteria

**Objetivo:** darle al piloto una definición de éxito objetiva y cuándo cortar sin vergüenza.

**Qué decir:**
> "El piloto se aprueba o se corta con criterios objetivos. Para el go: precisión de clasificación de al menos 90% sobre el golden set, precisión de extracción de campos clave de al menos 95%, tasa de derivación a revisión menor a 30%, cobertura de al menos 95% de los emails útiles por campaña, y un bloqueante: que el 100% de los resultados tenga evidencia del cruce. Y tenemos kill criteria: si el time-to-value se retrasa más de 3 meses, si la adopción queda 50% por debajo de lo previsto, si la precisión no se cierra ni con revisión, si compliance o IT no habilitan la muestra, o si el costo operativo queda fuera de rango frente a la muestra real — cortamos y documentamos el aprendizaje."

**Análisis del dato (cómo se mide cada una):**
- **Precisión de clasificación ≥ 90% (golden set)** → % de emails donde la clase predicha coincide con la etiqueta del golden set (~300 emails etiquetados por las áreas).
- **Precisión de extracción ≥ 95%** → % de campos clave extraídos correctamente vs el golden set.
- **Tasa de derivación a revisión < 30%** → % de casos que van a humano. Arriba del 30% el ahorro manual no se nota; abajo, el piloto demuestra valor.
- **Cobertura por campaña ≥ 95%** → % de emails útiles asignados correctamente a campaña y dataset.
- **Evidencia por email = 100% (bloqueante)** → ningún resultado se entrega sin el rastro del cruce contra la fuente corporativa. Si un caso se libera sin evidencia → bloqueante.

**Análisis de los kill criteria (cuándo cortar):**
- **Time-to-value** → retraso > 3 meses en piloto → se corta (el valor tiene fecha).
- **Adopción** → > 50% bajo lo previsto → nadie lo usa, para qué seguir.
- **Precisión** → no se cierra ni con revisión de las áreas → la interfaz máquina-humano no funcionó.
- **Acceso a la casilla** → compliance/IT no habilita la muestra → no hay forma legal de arrancar (mejor saberlo antes).
- **Costo operativo** → fuera de rango frente a la muestra real → economía rota (más relevante si se elige cloud).

**Análisis leading vs lagging:**
- **Leading (de proceso, en cada fase):** precisión de clasificación/extracción, tiempo por caso, % de derivación. Se miden durante el piloto, no al final.
- **Lagging (de negocio, en gates de 1·2·3 meses):** inconsistencias detectadas por origen, datasets entregados en tiempo, horas de revisión liberadas.
- El tablero del piloto (BI o planilla) muestra ambas; los gates son a los meses 1, 2 y 3.

**Preguntas probables:**
- *"¿90% alcanza?"* → Es el piso de go; el resto lo cubre la revisión humana (derivación < 30%). El objetivo de negocio no es el perfeccionismo del modelo, es que la carga manual baje y el dato llegue a tiempo con evidencia.
- *"¿Quién controla las métricas?"* → labIA mide contra el golden set y Aysa tiene acceso al tablero; en el gate el sponsor decide con los números, no con la palabra de nadie.

---

## Lámina 16 — La operación en marcha: qué queda automatizado

**Objetivo:** contestar la pregunta que nadie formula pero todos se hacen: "después de implementar, ¿qué queda corriendo, quién lo opera y cómo funciona el día 1 de producción?". Es la lámina que convierte el proyecto en **servicio continuo**.

**Qué decir:**
> "Después del piloto, la solución deja de ser un proyecto y pasa a ser un servicio continuo: cada correo nuevo se procesa solo y las áreas reciben datos actualizados sin intervención manual. Hay cuatro piezas. Automático, en cada corrida: el conector levanta solo los correos nuevos, filtra el ruido, clasifica y extrae con el modelo, cruza contra la fuente corporativa y publica los datasets por campaña y el dashboard actualizados. Humano, solo en lo dudoso: el juez deriva a revisión lo que no supera los umbrales, una persona del área resuelve el caso y esa decisión queda registrada y auditable; los umbrales y las reglas se ajustan con gobernanza y versionado. Quién opera en Aysa: el área de datos y BI ejecuta y monitorea las corridas, y el referente funcional revisa los criterios de negocio y la cola de revisión; la documentación técnica queda versionada en el repositorio de Aysa. Y cómo se escala: el mismo patrón aplica a otras casillas y áreas, y la opción Enterprise agrega OCR y multiprueba sobre el mismo motor — cada paso nuevo conserva su go/no-go."

**Análisis de cada card:**
- **Automático · cada corrida** → el pipeline corre de forma incremental y programada dentro de la VPN: ingesta → filtro → modelo → cruce → publicación. Sin operación manual: es la "automatización que queda" después de implementar.
- **Humano · solo lo dudoso** → la cola de revisión concentra lo que el modelo no resuelve con confianza; cada decisión humana queda registrada y auditable. El modelo no decide: la regla de la lámina 5 se mantiene en producción.
- **Quién opera en Aysa** → la operación del día a día queda del lado de Aysa (BI/datos + referente funcional), con la documentación y el versionado entregados al cierre. labIA queda como soporte de la etapa de estabilización, delimitado en el acuerdo.
- **Cómo se escala** → el motor es el mismo para nuevas casillas/áreas; el costo marginal es bajo. Enterprise agrega capacidad documental sin cambiar la arquitectura.

**Preguntas probables:**
- *"¿Quién se queda operando esto?"* → El área de datos / BI de Aysa, con la documentación versionada y un período de acompañamiento acotado de labIA. La operación no depende de nosotros después de la estabilización.
- *"¿Y si cambia el volumen o los formatos?"* → Las corridas son incrementales y los umbrales/reglas se ajustan con gobernanza y versionado; cualquier cambio relevante se mide antes con el mismo patrón del piloto.
- *"¿Esto reemplaza personas?"* → No: reemplaza el proceso manual de revisión correo por correo. Lo dudoso lo sigue resolviendo una persona y la decisión final sigue siendo del área. Las horas liberadas se reportan como métrica de negocio.
- *"¿Esto arranca al final del piloto o hay que esperar a Enterprise?"* → Con H1 ya queda operando para la casilla de campañas. Enterprise y el RPA opcional suman capacidad documental y automatización del último tramo más adelante, cada uno con su go/no-go.

**Decisiones abiertas:** quién asume la operación en Aysa (BI/datos), y el período y el alcance del acompañamiento de labIA durante la estabilización.

---

## Lámina 17 — Cierre · Ronda de preguntas

**Objetivo:** cerrar con un pedido concreto, mínimo y accionable, y abrir la conversación.

**Qué decir:**
> "El camino es claro: H1, el MVP ahora, para validar la detección de inconsistencias con la casilla real, con go/no-go a los tres meses, y desde ahí la opción Enterprise —OCR, multiprueba y RPA opcional— y la escala de casillas, cada una con su propio go/no-go. La decisión de modelo la probamos con la muestra antes de decidir. Lo que necesitamos para arrancar es modesto: una muestra real de correos, acceso a la casilla o un importe PST, un golden set de unos 300 emails validado con las áreas, y el formato de salida BI definido. ¿Qué pregunta les queda?"

**Análisis de los 3 cards de cierre:**
- **1 · El camino propuesto** → H1/MVP ahora, go/no-go a los 3 meses, luego Enterprise (OCR + multiprueba + RPA opcional) y escala de casillas, cada una con su propio go/no-go. Es el mapa mental para que el sponsor explique "qué aprobé".
- **2 · Decisión de modelo** → self-host (recomendado, cumple 25.326 sin salida de PII) o cloud con DPA. Ambos se prueban con la muestra antes de decidir.
- **3 · Lo que necesitamos para arrancar** → cuatro entregables: muestra real + acceso a la casilla (o importe PST) + golden set ~300 emails validado con las áreas + formato de salida BI. Son de Aysa, no de dinero.

**Procedimiento de cierre:**
- Cerrar el "ask" en una frase y callar (no llenar el silencio).
- Anotar en vivo las decisiones abiertas (ver abajo) y quién las va a destrabar (responsable + fecha).
- Pasar a la ronda: "¿qué pregunta les queda?".
- Agradecer y entregar los materiales: PDF de la presentación, HTML compartible y el guión.

**Preguntas probables de cierre:**
- *"¿Cuánto tarda en arrancar?"* → Con muestra y acceso a la casilla, el kickoff es en la primera semana después de la aprobación.
- *"¿Qué pasa si en el relevamiento el problema es chico?"* → Perfecto: lo relevamos con la muestra, te lo mostramos con los 3 escenarios y decidimos. Si el problema es menor al esperado, el piloto se cierra antes y el costo fue mínimo. No nos conviene venderles algo que no hace falta.
- *"¿Pueden comenzar mientras se aprueba?"* → Podemos preparar el kickoff (workshop de taxonomía y diseño del golden set) con una muestra mínima, sin comprometer recursos grandes, en paralelo a la aprobación formal.

---

## Bloqueadores / decisiones abiertas para cerrar en la reunión (checklist)

1. **Acceso a una muestra real** de la casilla (¿quién provee? IT). → Responsable + fecha.
2. **Acceso de lectura a la casilla** (EWS/Graph con mínimo privilegio) o importe **PST** de respaldo. → IT.
3. **Aprobación de H1 (MVP)** y presupuesto del piloto. → Sponsor / CFO.
4. **Self-host vs cloud:** se decide tras probar ambos con la muestra (recomendación: self-host por 25.326). → Compliance + IT + labIA.
5. **Golden set:** sesiones de las áreas para etiquetar ~300 emails y validar la taxonomía. → Áreas de negocio.
6. **Formato de salida BI** y dataset por campaña: contrato definido con el área de datos. → Business Intelligence.
7. **Compliance/Legal:** confirmar requisito de DPA si se elige cloud. → Legal.

---

## Checklist previo a la demo (día de la presentación)

- [ ] Pantalla y proyector probados; la presentación abre bien (HTML y PDF).
- [ ] Navegación recordada: **← →** o espacios para avanzar · **F** para fullscreen.
- [ ] Guión impreso o en pantalla secundaria.
- [ ] Narrativa coherente: el pedido es el MVP/H1 (se aprueba solo eso); Enterprise aparece como opción de evolución, sin costos de token ni nombres de sistemas de origen.
- [ ] Nombre del sponsor y de los asistentes (para saludar con nombre).
- [ ] Checklist de bloqueadores en mano para anotar responsables y fechas.
- [ ] URL del HTML compartible a mano por si piden el material al instante.

---

## Anexo A — Procedimiento de kickoff (Paso 0) en detalle

El Paso 0 es todo lo que se hace antes de escribir una sola línea de pipeline. Es la semana 1 del MVP y es el 80% del éxito del piloto.

**1 · Pedir la muestra real de la casilla (quién: IT / admin de Exchange)**
- No pedir toda la casilla: pedir una **muestra representativa** de ~300–600 emails que mezcle años, campañas distintas y ruido real (out-of-office, bounces, spam).
- Pedir a IT un **export de solo lectura** en dos piezas: (a) un CSV con metadatos (fecha, remitente, asunto, si trae adjunto) y (b) los `.eml/.msg` + adjuntos en una carpeta compartida dentro de la VPN.
- Cómo lo genera IT: **eDiscovery / Búsqueda de buzón** de Exchange, o un script EWS con la cuenta de servicio (mínimo privilegio). Si no hay export posible, se toma la muestra por el flujo manual o por **importe PST**.
- Formalizar siempre: acuerdo de confidencialidad + acceso solo lectura + manejo de los datos dentro de la VPN. Los datos no salen de la red.

**2 · Análisis exploratorio (labIA, 1–2 días)**
- Cargar el CSV en Python/pandas, SQL o Power Query de Excel, y responder 6 preguntas con tablas y frecuencias:
  - **Volumen por año/mes** → valida el ~60K histórico y el flujo recurrente.
  - **Campañas identificables** → por asunto/remitente (regex de patrones de campaña).
  - **% de ruido real** (out-of-office, bounce, spam, vacíos) → ajusta el supuesto de emails útiles.
  - **% con adjuntos y su formato** (pdf/jpg/xls) → dimensiona la futura capacidad documental (OCR).
  - **Distribución por remitente** → cuántas cuentas fuente hay.
  - **Emails estructuralmente incompletos** (sin cuerpo o sin datos de cuenta) → alimenta la clase `DUDOSO`.
- Salida: un documento de una página "lectura de la casilla". Es el input para dimensionar cómputo, estimaciones de costo (si aplica) y el calendario.

**3 · Definir la taxonomía de clasificación (workshop con las áreas, media jornada)**
- Por cada clase llenar una fila de un cuadro: **definición operativa** (cuándo un email ES esa clase) · **3–5 ejemplos reales** de la muestra · **qué se hace con esa salida** (a qué dataset va) · **dueño de la revisión**.
- Regla práctica: si dos personas del negocio no coinciden en 8 de 10 ejemplos, la definición no está clara → reescribir hasta que coincidan.
- Resultado aprobado: el **schema de clasificación** (las 5 clases) y el **schema de extracción** (email · cuenta/contrato · nombre y apellido · dirección · teléfono · documento y tipo · relación con el titular · titular).

**4 · Construir el golden set (~300 emails)**
- **Selección balanceada:** mínimo 30–50 emails por clase frecuente (`CONFIRMA` / `NO_ES_MIA`) y 20–30 de las raras (`OPTOUT` / `DUDOSO`), más un grupo de ruido para probar el filtro determinístico.
- **Doble etiquetado:** 2 personas de las áreas etiquetan por separado la misma muestra (clase + campos de identidad + confianza del etiquetador). Las discrepancias se discuten y se resuelven con un tercero → etiqueta de oro.
- **Herramienta:** Excel/Google Sheets con validaciones (lista desplegable por clase, email_id única, campos obligatorios) alcanza. Si se quiere control fino → Label Studio o Prodigy.
- **Consistencia (rigor):** medir el acuerdo entre etiquetadores (cohen kappa, objetivo ≥ 0.8) antes de dar el set por bueno.
- **Guardado versionado:** el set se separa en train/validation/test (70/15/15); el test solo se mira al final, para las métricas de go/no-go.

**Esfuerzo estimado:** muestra + exploratorio ≈ 2–3 días · workshop ≈ ½ día · etiquetado ≈ ½ a 1 día por persona.

---

## Anexo B — Detalle técnico de implementación (Pasos 1–4)

### Paso 1 · Ingesta desde la casilla

**Conexión a la casilla (2 caminos):**
- **EWS (Exchange on-prem clásico):** API SOAP nativa. Librerías disponibles: `exchangelib` (Python), `ews-javascript-api` (.NET/Node), `pyews`. Autenticación por cuenta de servicio con Basic Auth sobre TLS 1.2 (o OAuth si hay AD enrollado).
- **Graph API (si Aysa tiene Microsoft 365 o híbrido):** app registration con permisos *scoped* a esa casilla (permisos de app, no de usuario); se lee con `users/{casilla}/messages` + paginación.
- Para on-prem, el estándar es **EWS con ApplicationImpersonation o Full Access de solo lectura** sobre la casilla.
- **Importe PST (respaldo):** si IT no habilita conexión directa a tiempo, se procesa el histórico desde un archivo PST exportado con `New-MailboxExportRequest`. Más lento, pero desbloquea el piloto (mitiga R3).

**Cuenta de servicio mínimo privilegio:**
- Cuenta sin login interactivo; **solo lectura** de la casilla, nunca Send/Delete/Write.
- El secreto se guarda en el gestor de secretos de IT; jamás en el código.
- Es el bloqueador #2 del checklist: sin esta cuenta (o el PST) no arranca el piloto.

**Proceso incremental con dedupe:**
- Job cada 10–15 min (o diario según volumen) que usa **SyncFolderItems** de EWS (watermark) o `LastModifiedTime` como cursor → trae solo lo nuevo/modificado.
- Dedupe por **ItemId de Exchange** (única por email) + **SHA-256 del mensaje completo**: lo ya visto no se reprocesa; si el hash cambia, se marca como revisado.

**Staging en el repositorio corporativo de datos (append-only):**
- Tabla `stg_email`: `email_id PK, item_id, hash, remitente, asunto, fecha_recibido, tamaño, tiene_adjuntos, raw_path, created_at, processed_at`.
- Tabla `stg_adjunto`: `email_id FK, nombre_archivo, formato, tamaño, path`.
- Nunca se borra ni se edita: cada relectura de un email es una fila nueva con su checksum/hash → trazabilidad total y dedupe a nivel fila.

### Paso 2 · Clasificación y extracción

**Filtro determinístico primero (sin IA):**
- Un paso de código (Python/C#/stored proc) que decide "ruido sí/no" con reglas:
  - Asunto contiene "Fuera de la oficina / Out of office / marcador automático" → out-of-office.
  - Headers de entrega fallida / "Delivery Status Notification" → bounce.
  - Heurística de spam o emails vacíos → descarte.
- Si `ruido=True` → se descarta del proceso del modelo (no gasta cómputo).

**Modelo con schema estricto (patrón Instructor/DocInfo):**
- **Prompt por campo** (no libre): por cada campo del schema, una definición y ejemplos. Rol → definición de las clases con ejemplos → schema JSON esperado → el email (asunto+cuerpo+metadatos).
- Schema de salida (validado por código): `{"clase": ..., "campana": ...|null, "contacto": {email, cuenta, nombre_apellido, direccion, telefono, documento_y_tipo, relacion_titular, titular}, "confianza": 0.0-1.0, "razon": "..."}`.
- **Validación de JSON:** si no parsea o no cumple el schema → directo a revisión humana. Nunca se guarda JSON mal formado.

**Juez de validación (~30% de los casos):**
- Es un **segundo pase** sobre los casos de zona gris (confianza media, campos incompletos, datos contradictorios internamente).
- Verifica coherencia y formato: cuenta/contrato con el formato esperado, teléfono y documento con la cantidad de dígitos de Aysa, ausencia de contradicciones (CONFIRMA sin contacto → incongruente).
- Si el juez no confirma → `DUDOSO` → cola de revisión humana.
- Cada fila guarda `modelo_version` y `prompt_version` para auditar con qué versión se clasificó cada email.

**Tabla de extracción:**
- `stg_extraccion`: `email_id FK, clase_pred, campana_pred, email, cuenta, nombre_apellido, direccion, telefono, documento_y_tipo, relacion_titular, titular, score, modelo_version, prompt_version, resultado_juez, created_at`.

### Paso 3 · Verificación contra la fuente corporativa

**Cruce determinístico (sin LLM):**
- Un stored proc / vista que hace JOIN de `stg_extraccion` contra las tablas de verdad (clientes/cuentas/campañas) de la **base de datos relacional corporativa**.
- **Normalización previa:** trim, mayúsculas, sin tildes, formatos de números/ceros (la cuenta y el documento rara vez vienen igual en el email que en la base).

**Lógica de evidencia (reglas versionadas, aprobadas con las áreas):**
- Cuenta/contrato + titular coinciden → `Coincide`.
- Cuenta/contacto no encontrados o contradictorios → `No coincide` + motivo.
- Match parcial o campos ausentes → `Requiere revisión` (con banderas de por qué).
- Sin match pero datos coherentes → normalmente `Requiere revisión` (no se inventa).

**Salida de decisión:**
- Tabla `seg_decision`: `email_id, estado, motivo, id_fila_que_valido (evidencia), reviewer, reviewed_at`.
- Cada estado tiene su evidencia (qué fila de la fuente de verdad lo sustentó) → auditable ante compliance y ante la pregunta "¿cómo saben que es ese titular?".

### Paso 4 · Datasets y evidencias

**Estructura de salida (contrato de datos con BI/áreas):**
- Tabla/vista `seg_campana`: `campaña, estado, cuenta_id, email_id, fecha, evidencia` → el "dataset por campaña" que consumen las áreas.
- Formato y frecuencias definidos con **Business Intelligence** y las áreas en el kickoff (riesgo R6): qué columnas, qué granularidad, qué periodicidad, dónde se publica.

**Datasets por campaña:**
- Confirmados, no-es-mía, opt-out, duplicados y dudosos por campaña, cada fila con su **rastro de evidencia** (qué cruce lo sustentó).

**Capacidades futuras (roadmap, no se implementan en el MVP):**
- **OCR documental (capacidad reutilizable):** modelos con visión leen facturas/comprobantes cuando exista un caso de negocio que lo justifique (no ligado a la casilla actual).
- **Escala a otras casillas:** el mismo motor se configura para otras casillas y áreas (H2).

**Orden lógico de implementación en el piloto:**
- Primero el kickoff (Anexo A) → después el cruce de umbrales y el golden set → cuando la clasificación da ≥90%, se sabe exactamente qué escalar. El pipeline de los 4 pasos nunca se implementa "de golpe": se valida etapa por etapa contra el golden set.