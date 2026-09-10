# Plan semana a semana — MVP · Calidad de Datos de Contacto (Aysa · labIA)

> **Qué es este documento:** es el desglose operativo del MVP de **8 a 12 semanas**. Detalla, semana por semana, **qué** se hace, **quién** lo hace, **quién** lo valida, **qué** se entrega y **cómo se sabe** que quedó bien hecho. Sirve como documento de trabajo de la demo, para que la empresa vea que no hay grises: cada rol, actividad y proceso está definido antes de arrancar.
> **Cómo leerlo:** cada semana tiene (1) su objetivo, (2) el entregable principal, (3) las tareas desglosadas en pasos concretos, y (4) el bloque "qué le demuestra esto a la empresa". Las celdas con 🔒 dependen de un entregable de Aysa.
> **Escenarios de duración:** base = 10 semanas · pesimista (con colchón) = 12 · optimista = 8 si EWS se habilita rápido y el golden set queda validado en la semana 2. Nunca se comprime la validación.
> **Regla transversal:** **nadie valida lo que produce.** Quien entrega y quien valida son personas distintas. Es la garantía de que las métricas son confiables para la decisión de go/no-go.

---

## 1 · Los roles, sin ambigüedad

### De labIA (construyen el piloto)

| Rol | Sigla | Quién es | Qué produce (entrega) | Qué NO hace | Dedicación |
|---|---|---|---|---|---|
| **Especialista en Automatización / Integración** | ESI | Ingeniero con experiencia en Exchange (EWS/Graph), ETL y repositorios de datos | El conector de la casilla, el staging de datos, el filtro de ruido, las reglas de normalización y las salidas (CSV/API/BI) | No define la taxonomía ni valida resultados de negocio | Completa durante el MVP |
| **Especialista en Datos e IA** | EDI | Ingeniero de datos + IA con experiencia en extracción estructurada (schema estricto, prompts por campo) | El esquema de clasificación, los prompts del modelo, el juez de validación y el golden set técnico | No decide qué significa cada clase para el negocio | Completa durante el MVP |

### De Aysa (validan y habilitan)

| Rol | Sigla | Quién es | Qué aporta (valida / habilita) | Qué esperamos de ellos | Dedicación |
|---|---|---|---|---|---|
| **Analista funcional · Referente de negocio** | AF | La persona del negocio que conoce las campañas y cómo se usa hoy la casilla | Define la taxonomía (qué significa cada clase), valida el golden set y aprueba los resultados con ojos de negocio | Disponibilidad en sesiones puntuales de etiquetado y revisión | Sesiones pautadas (no full-time) |
| **Responsable de datos / BI** | RDB | La persona que conoce la base de datos relacional corporativa y los reportes | Aprueba el formato de salida de los datasets, valida el cruce contra la fuente y controla la calidad | Acceso de lectura a la fuente corporativa + definición del formato de salida | Sesiones pautadas (no full-time) |
| **IT / Comunicaciones corporativas** | IT | Equipo que administra Exchange y la red bajo Ley 25.326 | Habilita la muestra y el acceso de lectura de la casilla (o export PST) con mínimo privilegio | Entregar la muestra y las credenciales en la semana 1 | Hitos puntuales 🔒 |
| **Compliance / Legal** | CMP | Responsable de la Ley 25.326 y la política de retención | Aprueba el manejo de datos personales y, si se elige cloud, el DPA | Validar el esquema de datos en el kickoff y el DPA si aplica | Hitos puntuales 🔒 |
| **Sponsor** | SP | La autoridad que decide el go/no-go | Aprueba H1 y preside el gate final con las métricas | Presupuesto del piloto + decisión de go/no-go con números | Inicio y gate final |

**Regla de oro en la práctica:** el ESI/EDI **entregan**, el AF/RDB/IT **validan**. Por ejemplo, el EDI mide la precisión del modelo; el AF confirma contra el golden set que esa medición es correcta. Nadie es juez de su propio trabajo.

---

## 2 · El proceso del piloto de punta a punta (en criollo)

Para que no quede ninguna duda de qué estamos construyendo, así fluye un solo correo a través del piloto:

**Paso A · Ingresa el correo.** Un conector dentro de la VPN lee la casilla (o importa un archivo PST si IT lo prefiere). No borra ni modifica nada: solo copia los correos nuevos a un área de trabajo (staging) con fecha y un sello único.

**Paso B · Se separa el ruido del contenido útil.** Un filtro automático (sin IA) descarta respuestas automáticas, devoluciones de mail y spam. Lo que queda es el contenido real de campaña.

**Paso C · La IA clasifica y extrae.** Un modelo liviano lee cada correo útil y responde con un formato estricto: cuál es la clase (CONFIRMA / NO_ES_MIA / DUDOSO / OPTOUT / IRRELEVANTE) y los campos de contacto (email, cuenta, nombre, dirección, teléfono, documento, relación con el titular, titular). El modelo **no inventa**: si un campo falta, queda marcado como ausente y el caso puede ir a revisión.

**Paso D · Se verifica contra la fuente corporativa.** Un cruce determinístico (reglas de código, sin IA) compara los datos extraídos contra la base de datos relacional corporativa. El resultado es una **evidencia**: `Coincide · No coincide · Requiere revisión`.

**Paso E · Se arma el dataset por campaña.** Con la evidencia de cada correo se genera el dataset que reciben las áreas, con el rastro de por qué cada caso quedó donde quedó.

**Resultado:** la herramienta **no decide** nada por sí sola: clasifica, extrae, cruza y evidencia. La decisión final siempre es del área responsable.

---

## 3 · Cronograma de alto nivel (12 semanas con colchón · base 10 · optimista 8)

| Fase | Semana | Entregable principal | Validación |
|---|---|---|---|
| Discovery y baseline | 1 | Esquema aprobado + plan de acceso a la casilla | AF + Sponsor |
| Lectura y medición | 2 | Documento "lectura de la casilla" + % útil real | AF + RDB |
| Extracción de correos | 3 | Conector Exchange (o importe PST), staging y filtro de ruido | IT + RDB |
| Golden set y primer modelo | 4 | Golden set aprobado (train/validation/test congelado) + primeras métricas | AF + EDI |
| Juez y umbrales | 5 | Métricas sobre validación contra las metas (90 / 95 / <30) | AF + EDI |
| Revisión de calidad | 6 | Reporte de errores + plan de ajuste fino | AF + EDI |
| Normalización y acceso | 7 | Reglas de normalización aprobadas + permisos de lectura 🔒 | RDB + IT |
| Cruce y contrato de salida | 8 | Correo real resuelto de punta a punta + contrato BI | RDB + AF |
| Examen final | 9 | Métricas finales de go/no-go sobre el test congelado | AF + Sponsor |
| Datasets y tablero | 10 | Datasets por campaña + evidencias + documentación versionada | RDB + AF |
| Validación e informe | 11 | Informe de go/no-go con 3 escenarios | Sponsor (gate) |
| Colchón / traspaso | 12 | Cierre de desvíos, show & tell y firma | Sponsor |

---

## 4 · Semana por semana, paso a paso

---

### Semana 1 — Discovery y baseline

**Objetivo de la semana:** confirmar el problema con **datos reales** y dejar aprobado el "examen" esquema con el que se medirá todo el piloto. Si esta semana no se completa, no se puede dimensionar nada de lo que sigue.

**Entregable principal:** el **esquema de clasificación y extracción** aprobado por el negocio + el **plan de acceso** a la casilla.

#### Tarea 1.1 — Obtener la muestra real de la casilla 🔒 (IT + CMP)

**Qué se hace, paso a paso:**
1. labIA envía a IT el pedido formal: una muestra de ~300 a 600 correos que mezcle **años distintos, campañas distintas y ruido real** (autorespuestas, devoluciones, spam).
2. IT exporta en dos piezas, con **solo lectura**: (a) un CSV con metadatos (fecha, remitente, asunto, si trae adjunto) y (b) los correos `.eml/.msg` en una carpeta compartida **dentro de la VPN**.
3. CMP formaliza el acuerdo de confidencialidad y el tratamiento de datos bajo Ley 25.326 (los datos no salen de la red).
4. AF revisa que la muestra sea representativa (no solo un mes, no solo una campaña).

**¿Quién entrega?** IT (export) y CMP (habilitación). **¿Quién valida?** AF (representatividad).
**Criterio de aceptación:** la muestra incluye ≥ 3 campañas distintas y ruido real; los datos quedaron dentro de la VPN.

#### Tarea 1.2 — Definir la taxonomía con el negocio (AF + Sponsor, media jornada)

**Qué se hace, paso a paso:**
1. Workshop presencial/virtual con AF y referentes de campañas.
2. Por cada clase se completa una fila con: **definición operativa** (cuándo un correo ES esa clase), **3–5 ejemplos reales** sacados de la muestra, **qué se hace con esa salida** y **quién revisa** los casos de esa clase.
3. Regla de control: si dos personas del negocio no coinciden en 8 de 10 ejemplos, la definición no está clara → se reescribe hasta que coincidan.
4. Se aprueba el **esquema de clasificación** (las 5 clases) y el **esquema de extracción** (los 8 campos de contacto).

**¿Quién entrega?** AF (definición de negocio). **¿Quién valida?** Sponsor (aprueba el esquema).
**Criterio de aceptación:** esquema firmado con ejemplos reales por clase y dueño de revisión por clase.

#### Tarea 1.3 — Planificar el acceso (ESI + IT)

**Qué se hace, paso a paso:**
1. ESI propone el camino: cuenta de servicio EWS/Graph con **mínimo privilegio** (solo lectura, solo esa casilla), o plan B de importe PST.
2. IT confirma factibilidad y fechas.
3. ESI documenta el plan de acceso aprobado.

**¿Quién entrega?** ESI. **¿Quién valida?** IT + CMP (permisos y Ley 25.326).
**Criterio de aceptación:** camino de acceso elegido y con fecha; CMP validó que es solo lectura.

**> Qué le demuestra esto a la empresa:** que arrancamos midiendo, no adivinando. La muestra real y la taxonomía firmada garantizan que todo lo que sigue se construye sobre el negocio de Aysa, no sobre supuestos de labIA.

---

### Semana 2 — Lectura de la casilla y medición del baseline

**Objetivo de la semana:** leer la casilla completa con datos y medir el **porcentaje real de correos útiles**, el número que dimensiona todo el piloto.

**Entregable principal:** el documento *"lectura de la casilla"* (1 página) + el % útil real.

#### Tarea 2.1 — Leer la casilla con datos (EDI + AF)

**Qué se hace, paso a paso:**
1. EDI carga el CSV de metadatos y responde 6 preguntas con tablas de frecuencias:
   - ¿Cuántos correos hay por año/mes? (valida el ~60K histórico y el flujo recurrente)
   - ¿Qué campañas se identifican? (por asunto/remitente)
   - ¿Qué % es ruido real? (autorespuestas, devoluciones, spam, vacíos)
   - ¿Cuántos traen adjuntos y de qué formato?
   - ¿Cuántas cuentas remitentes distintas hay?
   - ¿Cuántos correos vienen incompletos (sin cuerpo o sin datos de cuenta)?
2. AF interpreta los resultados con ojos de negocio y confirma/ajusta los supuestos.
3. EDI redacta el documento de 1 página **"lectura de la casilla"**.

**¿Quién entrega?** EDI. **¿Quién valida?** AF (que las conclusiones reflejen el negocio).
**Criterio de aceptación:** el documento lista los números reales de la muestra y marca qué supuestos se calibran o se descartan.

#### Tarea 2.2 — Medir el % útil real (EDI + AF)

**Qué se hace, paso a paso:**
1. EDI aplica una primera versión del filtro de ruido (con reglas de código provisorias) sobre la muestra.
2. Reporta el **% real de correos útiles** (el que alimenta el dimensionamiento).
3. AF confirma que el número calza con la intuición del negocio.

**¿Quién entrega?** EDI. **¿Quién valida?** AF.
**Criterio de aceptación:** el % útil real queda documentado y aprobado por el negocio antes de seguir.

#### Tarea 2.3 — Contrato de salida preliminar con BI (RDB + AF)

**Qué se hace, paso a paso:**
1. Reunión corta con RDB: bosquejar qué columnas, qué granularidad y dónde se publicará el dataset por campaña.
2. No se firma todavía: el contrato definitivo se cierra cuando exista un correo real resuelto (semana 8).
3. RDB adelanta los estándares de formato que labIA debe cumplir.

**¿Quién entrega?** ESI (implementación). **¿Quién valida?** RDB (formato).
**Criterio de aceptación:** bosquejo de contrato acordado y estándares de BI conocidos desde el inicio (evita retrabajo del riesgo R6).

**> Qué le demuestra esto a la empresa:** que primero se mide y después se promete. El % útil real reemplaza a los supuestos, y BI define el formato de lo que recibirá antes de que exista el primer dataset.

---

### Semana 3 — Extracción de correos (parte técnica)

**Objetivo de la semana:** conectar la casilla y dejar funcionando el primer tramo del proceso (ingesta + filtro de ruido calibrado).

**Entregable principal:** el conector leyendo correos reales con deduplicación + el filtro de ruido calibrado.

#### Tarea 3.1 — Conectar la casilla (ESI)

**Qué se hace, paso a paso:**
1. ESI implementa el conector EWS/Graph (o el importe de PST si IT eligió el plan B).
2. Configura el **proceso incremental**: cada corrida trae solo lo nuevo/modificado, no reprocesa toda la casilla.
3. Configura el **deduplicado**: cada correo se identifica con su ID de Exchange + un hash del contenido; lo ya procesado no se vuelve a procesar.
4. Se corre una prueba con la muestra de la semana 1.

**¿Quién entrega?** ESI. **¿Quién valida?** IT (que los accesos sean correctos y mínimos).
**Criterio de aceptación:** un lote de correos reales leído, sin duplicados y sin tocar la casilla (solo lectura).

#### Tarea 3.2 — Montar el staging en el repositorio corporativo (ESI + RDB)

**Qué se hace, paso a paso:**
1. ESI crea las tablas de área de trabajo (`stg_email`, `stg_adjunto`) en el repositorio corporativo de datos.
2. Cada fila guarda fecha de proceso y un sello de integridad (checksum/hash): **nunca se borra ni se edita** → trazabilidad total.
3. RDB valida que la estructura sea compatible con los estándares de su área.

**¿Quién entrega?** ESI. **¿Quién valida?** RDB.
**Criterio de aceptación:** estructura aprobada por datos/BI; cada correo tiene fecha y sello de integridad.

#### Tarea 3.3 — Filtro determinístico de ruido (ESI + AF)

**Qué se hace, paso a paso:**
1. ESI implementa reglas de código (sin IA) que detectan autorespuestas ("Fuera de la oficina"), devoluciones ("Delivery Status"), spam y correos vacíos.
2. AF revisa en la muestra cuántos casos detectó y si son correctos.
3. Se ajustan las reglas hasta que el % de ruido detectado se corresponda con la realidad de la muestra.

**¿Quién entrega?** ESI. **¿Quién valida?** AF.
**Criterio de aceptación:** al menos el 90% de los casos de ruido conocido de la muestra son descartados correctamente.

**> Qué le demuestra esto a la empresa:** que el piloto lee la casilla real sin tocar nada (solo lectura, dentro de la VPN) y con trazabilidad desde el primer byte. El filtro de ruido se calibra contra la realidad de Aysa, no contra supuestos.

---

### Semana 4 — Golden set y primer modelo (corazón del piloto)

**Objetivo de la semana:** construir el "examen" con el negocio (golden set) y lograr la primera clasificación/extracción automática.

**Entregable principal:** golden set versionado (train/validation/test) con el **test congelado** + primer modelo con métricas sobre el set de entrenamiento.

#### Tarea 4.1 — Etiquetar el golden set con el negocio 🔒 (AF + EDI)

**Qué se hace, paso a paso:**
1. AF y un segundo etiquetador del negocio etiquetan por separado ~300 correos: clase + campos de contacto + qué tan seguros están.
2. EDI prepara y administra la planilla (o herramienta de etiquetado) con validaciones: lista de clases, ID único, campos obligatorios.
3. Las discrepancias entre etiquetadores se discuten y se resuelven con un tercero (AF + Sponsor).
4. EDI mide el **acuerdo entre etiquetadores** (objetivo: ≥ 0.8). Si está por debajo, las definiciones no están claras y se vuelve a la tarea 1.2.

**¿Quién entrega?** AF (etiquetas de negocio). **¿Quién valida?** EDI (consistencia estadística) + AF (resolución de discrepancias).
**Criterio de aceptación:** acuerdo entre etiquetadores ≥ 0.8 y discrepancias resueltas.

#### Tarea 4.2 — Separar el golden set en train / validation / test (EDI)

**Qué se hace, paso a paso:**
1. EDI divide las ~300 etiquetas: **70%** para entrenar el modelo, **15%** para validar durante el desarrollo, **15%** para el examen final (test).
2. El set de **test queda congelado**: nadie lo mira ni lo ajusta hasta la semana 9. Es la garantía de que el examen final es honesto.

**¿Quién entrega?** EDI. **¿Quién valida?** AF (conocimiento del contenido) + EDI custodia el test.
**Criterio de aceptación:** test congelado y fuera del alcance de todo ajuste.

#### Tarea 4.3 — Construir los prompts por campo con schema estricto (EDI)

**Qué se hace, paso a paso:**
1. Para cada campo del esquema (clase y los 8 campos de contacto), EDI redacta una definición clara con ejemplos.
2. Se define el **formato de salida obligatorio** (JSON): si el modelo no responde con ese formato, el resultado no se acepta y el caso pasa a revisión.
3. Se arma el patrón **prompt por campo** (Instructor/DocInfo): el modelo responde campo por campo, sin libertad de "inventar" texto.

**¿Quién entrega?** EDI. **¿Quién valida?** AF (que la descripción de cada campo refleje el negocio).
**Criterio de aceptación:** el modelo responde siempre con el formato estricto; las respuestas fuera de formato van a revisión, nunca se guardan.

#### Tarea 4.4 — Correr el primer modelo (EDI)

**Qué se hace, paso a paso:**
1. EDI ejecuta la clasificación/extracción sobre el set de entrenamiento con el modelo elegido (self-host dentro de la VPN o cloud con DPA aprobado).
2. Reporta las **primeras métricas** de precisión sobre ese set (todavía no sobre el test).
3. EDI + AF revisan los casos mal clasificados para entender el porqué (¿el prompt? ¿la definición de clase?).

**¿Quién entrega?** EDI. **¿Quién valida?** AF + EDI (revisión conjunta de los errores).
**Criterio de aceptación:** primeras métricas de clasificación y extracción sobre train, con errores revisados y documentados.

**> Qué le demuestra esto a la empresa:** que el criterio de qué es cada correo lo define **el negocio** (el golden set es de Aysa), no labIA. Y que el "examen" del final ya está separado y bajo llave: cuando se reporten las métricas finales, no hubo manera de "curarlas".

---

### Semana 5 — El juez y los umbrales

**Objetivo de la semana:** subir la confianza del modelo y bajar la cantidad de casos que necesitan revisión humana.

**Entregable principal:** cuadro de métricas del modelo sobre el set de validación, alineado a las metas de la lámina 13.

#### Tarea 5.1 — Implementar el juez de validación (EDI)

**Qué se hace, paso a paso:**
1. EDI define los casos "de zona gris": confianza media, campos incompletos o datos contradictorios dentro del mismo correo.
2. Se implementa un **segundo pase** sobre esos casos (~30% de los correos) que verifica coherencia: ¿el formato de la cuenta es el esperado? ¿el documento tiene la cantidad de dígitos de Aysa? ¿es lógico clasificar CONFIRMA sin datos de contacto?
3. Si el juez no confirma → el caso pasa a revisión humana (clase `DUDOSO`).

**¿Quién entrega?** EDI. **¿Quién valida?** AF (que las reglas del juez tengan sentido de negocio).
**Criterio de aceptación:** los casos coherentes se aceptan y los incongruentes van a revisión, sin excepciones.

#### Tarea 5.2 — Ajustar umbrales (EDI + AF)

**Qué se hace, paso a paso:**
1. EDI ajusta los umbrales de confianza (qué tan seguro debe estar el modelo para clasificar solo).
2. AF aprueba los umbrales con criterio de negocio: "queremos que se equivoque poco y que lo dudoso lo resuelva una persona".
3. Se versionan los umbrales (queda registro de qué versión se usó en cada corrida).

**¿Quién entrega?** EDI. **¿Quién valida?** AF.
**Criterio de aceptación:** umbrales versionados y aprobados; queda registro auditable.

#### Tarea 5.3 — Medir contra las metas (EDI + AF)

**Qué se hace, paso a paso:**
1. EDI corre el pipeline sobre el set de **validación** y reporta: precisión de clasificación, precisión de extracción y % de derivación a revisión.
2. Se compara contra las metas: **clasificación ≥ 90% · extracción ≥ 95% · derivación < 30%**.
3. Si hay gap, se documenta con plan de cierre: qué ajustar (prompts, umbrales, definiciones) para la semana 6.

**¿Quién entrega?** EDI. **¿Quién valida?** AF (contra el golden set, no contra la palabra de labIA).
**Criterio de aceptación:** cuadro de métricas sobre validation alineado a las metas, o gap documentado con plan.

**> Qué le demuestra esto a la empresa:** que hay un segundo control (el juez) para los casos dudosos y que el piloto ya mide su propia calidad contra metas objetivas que se fijaron de antemano.

---

### Semana 6 — Revisión de calidad y cierre de gaps

**Objetivo de la semana:** entender los errores, decidir qué se ajusta y dejar todo listo para el examen final honesto.

**Entregable principal:** reporte de errores clasificado + plan de ajuste fino aprobado.

#### Tarea 6.1 — Análisis de errores (EDI + AF)

**Qué se hace, paso a paso:**
1. EDI clasifica los errores de la semana 5 en tres familias: **¿es del prompt?** (mala definición del campo), **¿es de la definición?** (la clase no estaba bien descripta) o **¿es del dato?** (el correo no tenía la información).
2. AF confirma la lectura de negocio de cada familia de errores.
3. Se cuantifica cuánto aporta cada familia a la brecha de las metas.

**¿Quién entrega?** EDI. **¿Quién valida?** AF.
**Criterio de aceptación:** cada error del validation queda etiquetado con su causa raíz y su impacto.

#### Tarea 6.2 — Segundo pase de extracción (EDI)

**Qué se hace, paso a paso:**
1. EDI reescribe prompts o definiciones para las familias de errores con mayor impacto.
2. Se re-corre sobre el **validation** (el test sigue congelado; el ajuste nunca toca el test).
3. Se mide cuánto mejora cada familia antes y después del ajuste.

**¿Quién entrega?** EDI. **¿Quién valida?** AF.
**Criterio de aceptación:** mejora documentada por familia y sin contacto con el test.

#### Tarea 6.3 — Plan de ajuste fino para el examen final (EDI + AF)

**Qué se hace, paso a paso:**
1. Se define qué se hará en la semana 9: qué prompts/umbrales se afinaron, con qué orden de magnitud de mejora esperada.
2. Se versiona el estado actual (baseline) para que el cambio de la semana 9 sea auditable.
3. Se deja registrado qué **no** se va a tocar (el test) bajo ninguna excusa.

**¿Quién entrega?** EDI. **¿Quién valida?** AF + EDI.
**Criterio de aceptación:** plan aprobado con antes/después, y test intocable por escrito.

**> Qué le demuestra esto a la empresa:** que la mejora de calidad se hace con método (causa raíz, no a los tiros) y con doble control. El test congelado garantiza que todo este ajuste también será medido con honestidad.

---

### Semana 7 — Normalización y acceso al cruce

**Objetivo de la semana:** preparar los datos para el cruce contra la fuente corporativa y habilitar el acceso de lectura 🔒.

**Entregable principal:** reglas de normalización aprobadas + permisos de lectura de la fuente corporativa.

#### Tarea 7.1 — Reglas de normalización (ESI + RDB)

**Qué se hace, paso a paso:**
1. ESI implementa reglas de normalización: mayúsculas, sin tildes, formatos de cuenta y documento (ceros, guiones, espacios).
2. RDB valida las reglas contra la fuente corporativa (sin acceso de escritura; solo lectura).
3. Se versionan las reglas (queda registro de qué versión se usó en cada corrida).

**¿Quién entrega?** ESI. **¿Quién valida?** RDB.
**Criterio de aceptación:** los datos de la muestra se normalizan sin pérdida y las reglas están documentadas y versionadas.

#### Tarea 7.2 — Habilitar permisos de lectura de la fuente corporativa 🔒 (RDB + IT)

**Qué se hace, paso a paso:**
1. RDB solicita el permiso de lectura (consulta) sobre la base de datos relacional corporativa, de mínimo privilegio.
2. IT habilita el acceso a la red de datos y documenta el circuito de consulta.
3. ESI confirma que puede consultar los datos reales (sin escribir nada).

**¿Quién entrega?** RDB/IT (habilitación). **¿Quién valida?** ESI (que la consulta funciona) + CMP (Ley 25.326).
**Criterio de aceptación:** consulta de lectura real funcionando y documentada; sin permisos de escritura.

**> Qué le demuestra esto a la empresa:** que la evidencia se construye sobre los datos reales de Aysa (no sobre pruebas) y bajo permiso mínimo, con Compliance mirando todo el tiempo.

---

### Semana 8 — Cruce determinístico y contrato de salida

**Objetivo de la semana:** conectar la verificación contra la base de datos relacional corporativa y cerrar el contrato de salida con BI.

**Entregable principal:** un correo real resuelto **de punta a punta** (ingestado → clasificado → cruzado → con evidencia).

#### Tarea 8.1 — Implementar el cruce determinístico (ESI + RDB)

**Qué se hace, paso a paso:**
1. ESI implementa el cruce con **reglas de código** (sin IA): comparar cuenta/contrato + titular contra la base corporativa.
2. Cada correo queda con una de tres evidencias: `Coincide · No coincide · Requiere revisión`, con el motivo.
3. RDB valida que las reglas reflejan cómo se identifica una cuenta en Aysa.

**¿Quién entrega?** ESI. **¿Quién valida?** RDB (reglas) + AF (criterio de negocio).
**Criterio de aceptación:** cada correo tiene evidencia con motivo; los casos ambiguos van a revisión (nunca se deciden solos).

#### Tarea 8.2 — Contrato de salida definitivo con BI (RDB + AF)

**Qué se hace, paso a paso:**
1. Reunión con RDB: cerrar qué columnas, qué granularidad, qué periodicidad y dónde se publica el dataset por campaña.
2. Se firma el **contrato de salida**: es lo que garantiza que los datasets se consumen sin retrabajo (y evita el riesgo R6).
3. ESI implementa la primera salida de prueba.

**¿Quién entrega?** ESI (implementación). **¿Quién valida?** RDB (formato) + AF (contenido de negocio).
**Criterio de aceptación:** formato de dataset aprobado por BI y una salida de prueba funcionando.

#### Tarea 8.3 — Correr el flujo completo sobre un caso real (ESI + EDI + AF)

**Qué se hace, paso a paso:**
1. Se toma un correo real de punta a punta: conector → filtro → clasificación → extracción → normalización → cruce → dataset.
2. AF revisa cada punto del recorrido y confirma que el resultado tiene sentido de negocio.
3. Queda registrado el primer caso "resuelto" como hito demostrable.

**¿Quién entrega?** ESI + EDI. **¿Quién valida?** AF + RDB.
**Criterio de aceptación:** un correo real recorrió todo el pipeline con evidencia y fue validado por el negocio.

**> Qué le demuestra esto a la empresa:** que la confianza no depende de la IA: la evidencia la da un cruce determinístico contra los datos de Aysa, reproducible y auditable. Y que el formato final lo define el área de datos, no labIA.

---

### Semana 9 — El examen final (test)

**Objetivo de la semana:** medir el piloto contra el **set que nadie miró** (test congelado en la semana 4). Es el momento de la verdad.

**Entregable principal:** métricas finales de go/no-go con números cerrados.

#### Tarea 9.1 — Correr el pipeline completo sobre el test (EDI)

**Qué se hace, paso a paso:**
1. EDI ejecuta el pipeline completo (ingesta → filtro → clasificación → cruce → datasets) sobre el set de test.
2. EDI reporta las métricas finales: clasificación, extracción, derivación y cobertura.
3. El set de test nunca se usó para ajustar nada → el resultado es honesto.

**¿Quién entrega?** EDI. **¿Quién valida?** AF + EDI (contraloría cruzada: AF confirma contra las etiquetas de oro).

#### Tarea 9.2 — Ajuste fino con resultados del test (EDI + AF)

**Qué se hace, paso a paso:**
1. Con los errores del test identificados, EDI propone ajustes finos (prompts, umbrales).
2. AF decide si los ajustes cambian el criterio de negocio o solo técnico.
3. Se registra la diferencia entre la primera corrida y la versión final.

**¿Quién entrega?** EDI. **¿Quién valida?** AF + EDI.
**Criterio de aceptación:** la métrica final se reporta con su versión (sin "cocinar" el número).

#### Tarea 9.3 — Revisar la cola humana (AF)

**Qué se hace, paso a paso:**
1. AF revisa los casos derivados a revisión humana: ¿son razonables? ¿una persona los resuelve rápido? ¿la cola funciona?
2. Se documenta cuánto tiempo toma resolver un caso dudoso (para el cálculo de horas liberadas).

#### Tarea 9.4 — Decidir self-host vs cloud con dato (EDI + CMP + IT)

**Qué se hace, paso a paso:**
1. EDI reporta el cómputo real consumido en la muestra y las **estimaciones finales** de costo para el histórico y el recurrente.
2. IT confirma la disponibilidad de cómputo para self-host; CMP aprueba (o no) el DPA para cloud.
3. Se toma la decisión con el dato real, no por preferencia.

**¿Quién entrega?** EDI (números). **¿Quién valida?** IT + CMP (decisión) + AF (de negocio).

**> Qué le demuestra esto a la empresa:** que las métricas se sacaron con un examen congelado desde la semana 4 — no hay forma de que labIA "arregle" los números. Y que las decisiones de despliegue se toman con datos reales de su muestra.

---

### Semana 10 — Datasets, evidencias, documentación y tablero

**Objetivo de la semana:** consolidar todo en entregables y dejar listo el material para el gate.

**Entregable principal:** datasets por campaña con evidencia + documentación versionada + tablero de métricas.

#### Tarea 10.1 — Procesar el histórico útil completo (ESI + EDI)

**Qué se hace, paso a paso:**
1. Se procesa el histórico completo útil (no solo la muestra) con el pipeline final.
2. Se generan los **datasets por campaña** con el formato aprobado por BI (tarea 8.2) y el rastro de evidencia por correo.
3. RDB valida el contenido final.

**¿Quién entrega?** ESI + EDI. **¿Quién valida?** RDB.
**Criterio de aceptación:** dataset por campaña con evidencia por fila, en el formato firmado.

#### Tarea 10.2 — Documentación técnica (ESI + EDI)

**Qué se hace, paso a paso:**
1. ESI documenta el conector, el staging, el filtro y el cruce; EDI documenta el esquema, los prompts, el juez y los umbrales (con versiones).
2. IT y RDB revisan y aprueban la documentación.
3. Se publica la documentación versionada (v1.0) en el repositorio de Aysa.

**¿Quién entrega?** ESI + EDI. **¿Quién valida?** IT + RDB.

#### Tarea 10.3 — Tablero de métricas (leading vs lagging) (EDI + RDB)

**Qué se hace, paso a paso:**
1. Se arma el tablero con las métricas de proceso (precisiones, % derivación, tiempo por caso) y las de negocio (inconsistencias por origen, datasets entregados, horas liberadas).
2. RDB valida la calidad del tablero; AF valida el contenido de negocio.

**¿Quién entrega?** EDI. **¿Quién valida?** RDB + AF.

**> Qué le demuestra esto a la empresa:** que reciben algo consumible y auditable: dataset + evidencia + documentación + tablero. No un demo de escritorio, sino la entrega lista para las áreas.

---

### Semana 11 — Validación final e informe de go/no-go

**Objetivo de la semana:** cerrar los números y dejar el informe para el gate, con tres escenarios de lectura.

**Entregable principal:** informe de go/no-go con 3 escenarios.

#### Tarea 11.1 — Validación final contra las metas (EDI + AF + RDB)

**Qué se hace, paso a paso:**
1. Revisión conjunta de las 5 métricas de la lámina 13 contra el resultado real del test.
2. AF confirma con ojos de negocio; RDB confirma la calidad del dataset y la evidencia 100%.
3. Se documenta cualquier brecha con su plan de cierre.

**¿Quién entrega?** EDI (métricas). **¿Quién valida?** AF + RDB.

#### Tarea 11.2 — Informe con 3 escenarios (EDI + AF + Sponsor)

**Qué se hace, paso a paso:**
1. EDI arma el informe con 3 escenarios: **pesimista** (si se mantienen los umbrales actuales en producción, qué pasa), **base** (recomendado) y **optimista** (si el tuneo fino rinde más).
2. El registro de riesgos se actualiza con el resultado real de la muestra y la decisión de despliegue.
3. AF presenta el informe al Sponsor; el gate decide el go o el no-go con los números de la lámina 13.

**> Qué le demuestra esto a la empresa:** que la decisión nunca se apoya en un único número: siempre hay pesimista / base / optimista, anclados en el baseline medido de Aysa. Y que el gate lo preside el Sponsor, no labIA.

---

### Semana 12 (colchón) — Cierre de desvíos / traspaso

**Objetivo de la semana:** absorber cualquier desvío del escenario pesimista. Si no hay desvíos, se libera antes de tiempo.

**Entregable principal:** piloto cerrado con métricas firmadas y traspaso al negocio.

| # | Qué se hace | Entrega | Validación |
|---|---|---|---|
| 12.1 | Cerrar desvíos del golden set o del cruce si los hubo | Métricas finales firmadas | AF + EDI |
| 12.2 | Sesión de traspaso / show & tell con las áreas | Datasets, evidencias y notas de la sesión | Sponsor |
| 12.3 | Actualizar registro de riesgos y decisiones abiertas | Registro vivo versión final | CMP + AF |

**> Qué le demuestra esto a la empresa:** que el plan contempla el imprevisto con honestidad, y que el cierre no es "cartón pintado": se muestra, se traspasa y se firma.

---

## 5 · Lo que Aysa debe entregar para que nada se trabe (bloqueadores 🔒)

| # | Entregable de Aysa | Quién | Para qué tarea | Fecha límite | Si se demora |
|---|---|---|---|---|---|
| D1 | Muestra representativa + acceso solo lectura (o export PST) | IT + CMP | Tareas 1.1, 1.3 | Semana 1 | Se replanifica el piloto: no se arranca sobre supuestos |
| D2 | Sesiones de negocio para taxonomía (1.2) y golden set (4.1) | AF / negocio | Semanas 1 y 4 | Semana 1 y 4 | Se corre el cronograma; el "examen" se atrasa |
| D3 | Permisos de lectura de la fuente corporativa | RDB / IT | Tarea 7.2 | Semana 7 | El cruce se valida con datos de prueba, no reales |
| D4 | DPA y retención aprobadas si se elige cloud (o visto bueno self-host) | CMP | Tarea 9.4 | Antes del gate | Se elige self-host (recomendado de todos modos) |

---

## 6 · Métricas objetivo del go/no-go (definidas de antemano, lámina 13)

| Métrica | Meta | Cómo se mide | Quién mide / quién valida |
|---|---|---|---|
| Precisión de clasificación | ≥ 90% | Golden set de test (etiqueta predicha vs oro) | EDI mide / AF valida |
| Precisión de extracción de campos clave | ≥ 95% | Campos correctos vs golden set | EDI mide / AF valida |
| Tasa de derivación a revisión | < 30% | % de casos que van a cola humana | EDI mide / AF valida |
| Cobertura por campaña | ≥ 95% de emails útiles | Asignación correcta a campaña/dataset | EDI mide / RDB valida |
| Evidencia por email | 100% · bloqueante | Rastro de cruce en cada fila del dataset | RDB valida / bloqueante |

---

## 7 · Regla de go/no-go (resumen para el gate)

**GO** → se cumplen las 5 métricas de la tabla anterior (la evidencia 100% es bloqueante: sin ella no hay go, pase lo que pase con el resto).

**NO-GO** → se activa cualquier kill criterion de la lámina 13 (retraso > 3 meses, adopción > 50% bajo lo previsto, precisión que no cierra ni con revisión, acceso de muestra nunca habilitado, costo operativo fuera de rango). Se cierra con **pérdida acotada al piloto**, se documenta el aprendizaje y no se toca ningún sistema.

La decisión final la toma el **Sponsor de Aysa** con el comité (IT + Compliance + áreas), sobre los números del informe, no sobre la palabra de labIA.

---

## 8 · La operación en marcha (lo que queda automatizado después de implementar)

**Para qué sirve esta sección:** las semanas 1–12 construyen el piloto; acá se explica qué queda **corriendo en producción** cuando se cierra. Es la respuesta a "¿y después de implementar todo, qué?"

### Qué queda automatizado

| Tramo | Cómo funciona en producción | Intervención manual |
|---|---|---|
| **Ingesta incremental** | El conector (dentro de la VPN) levanta solo los correos nuevos de la casilla en cada corrida programada; dedupe + sello de integridad; staging append-only en el repositorio corporativo | Ninguna |
| **Filtro y clasificación + extracción** | Reglas determinísticas de ruido + modelo liviano con schema estricto sobre cada correo útil | Ninguna (el modelo no guarda respuestas fuera de formato: van a revisión) |
| **Juez y derivación** | Segundo pase sobre los casos grises; si no se confirma, el caso va a la cola de revisión humana | La persona del área resuelve solo lo dudoso |
| **Cruce contra la fuente corporativa** | Reglas de código (sin IA) contra la base relacional; evidencia `Coincide · No coincide · Requiere revisión` en cada corrida | Ninguna |
| **Salidas y dashboard** | Datasets por campaña en el formato BI firmado + tablero de métricas, actualizados en cada corrida | Ninguna |

### Quién opera el día a día en Aysa

- **Área de datos / BI** → ejecuta y monitorea las corridas, revisa alertas y valida la calidad de los datasets. Es el dueño operativo.
- **Referente funcional (negocio)** → revisa la cola de revisión, aprueba criterios de clasificación y valida los resultados con ojos de negocio.
- **labIA** → período de acompañamiento acotado durante la estabilización (definido en el acuerdo), con cambios de umbrales/reglas bajo gobernanza y versionado.
- **Compliance** → revisión periódica del tratamiento de datos (Ley 25.326): retención, acceso y DPA si se eligió cloud.

### Reglas que se mantienen en producción

- **La herramienta sustenta, el área decide**: lo dudoso lo resuelve una persona y su decisión queda registrada.
- **Trazabilidad completa**: cada fila de dataset conserva su rastro de evidencia y su versión de reglas/umbrales.
- **Cambios con gobernanza**: cualquier ajuste de umbrales, prompts o normalización se versiona y se mide antes, con el mismo patrón del piloto.

### Escalado (lo que habilita)

- El **mismo motor** se aplica a otras casillas y áreas (Dirección Comercial, Comunicaciones) con costo marginal bajo.
- **Enterprise** agrega OCR documental y verificación multiprueba sobre la misma arquitectura.
- **RPA opcional (posterior)**: automatizar el último tramo —detectada la inconsistencia, generar la corrección o actualizar la fuente de origen— solo si Aysa ya opera RPA y con su propio go/no-go.