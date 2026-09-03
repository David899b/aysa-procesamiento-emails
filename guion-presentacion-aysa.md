# Guión de la presentación — labIA · Concentrix para Aysa (12 slides)

> **Cómo usar:** este guión es tu red de seguridad para la demo y la defensa ante Aysa. Por cada lámina te doy (1) qué decir, (2) el análisis detrás del dato, y (3) las posibles preguntas con sus respuestas fundamentadas. Léelo antes de presentar, no durante.

> **Moneda:** todos los valores económicos están en **pesos argentinos (ARS)**, tomando referencia **1 USD ≈ ARS 1.500** (a ajustar con la paridad del día de la reunión).
> **Notación de montos:** **K = miles** (ej. 21K = ARS 21.000) y **M = millones** (ej. ARS 12–30 M = ARS 12 a 30 millones).

> **Foco de la propuesta (ENTERPRISE):** Aysa es un cliente grande → el **destino es la Estrategia 5 (plataforma enterprise)** con OCR + embeddings + CRM + dashboard en vivo. Las estrategias 1–4 son **escalones** hacia ese destino, no fines. La narrativa posiciona el piloto (E1) como **puerta de entrada**, nunca como el objetivo final.

---

## Cómo defender una presentación (regla general)
1. **Lidera con el problema, no con la tecnología.** Abre con el costo de no hacer nada, no con "usamos un LLM".
2. **Nunca des un solo número.** Siempre 3 escenarios (pesimista / base / optimista). Un solo número = señal de naivez ante un CFO.
3. **Toda cifra ancla en un baseline medible.** Si no podés medirlo, no lo prometas.
4. **Baja el riesgo del "ask":** aprobar solo el piloto. La peor pérdida queda acotada al presupuesto del piloto.
5. **Conocé a tu audiencia:** CFO → cash flow/payback; CIO → factibilidad/integración; CEO → valor de negocio; Marketing → data por campaña.
6. **Tené un registro de riesgos** con mitigación y responsable, no un párrafo vago.

---

## Slide 1 — Portada
**Qué decir:**
> "Soy [nombre], del labIA de Concentrix. Hoy les traigo cómo procesamos las ~23.000 respuestas de su casilla de email de clasificación, validamos de quién es cada cuenta y transformamos esto en data accionable para Marketing."

**Análisis a mencionar si preguntan:**
- Proyecto 100% independiente del resto de la cartera labIA.
- Los números (23k, 4d→<1d, payback 6–12m) son planos objetivo sobre los que vamos a calibrar con sus datos reales.
- El pipeline conceptual está en la portada como mapa de viaje.

---

## Slide 2 — El problema y su costo
**Qué decir:**
> "Hoy cada email se procesa a mano: identificar campaña, cuenta y voluntad toma 4 a 8 minutos. En un lote de 23k con ~70% útil, son más de 1.100 horas-hombre al año. Eso es lento, caro y, sobre todo, riesgoso: si confirmamos mal la titularidad de una cuenta, es fraude de servicio o reclamos."

**Análisis / sustento de los números:**
- `23.000` emails totales.
- `~30%` de ruido descartable (spam, out-of-office, bounce, unsubscribe) → `~70%` útil ≈ 16.000.
- `4–8 min` por email es el baseline manual (calibrar con Aysa).
- `+1.100 h` = 16.000 × 4–8 min ≈ 1.066–2.133 horas.
- **Ley 25.326 (Argentina):** datos personales de usuarios. Si no se maneja bien, es exposición regulatoria.

**Preguntas probables:**
- *"¿Cómo sabés que el 30% es ruido?"* → Es un filtro determinístico previo (headers, auto-reply, bounce). Se calibra con los datos reales de la casilla.
- *"¿Cuánto nos cuesta hoy no hacer nada?"* → Referencia **ARS 45–90 M/año** (USD 30–60k) en trabajo manual + riesgo de multas/reclamos.

---

## Slide 3 — Por qué IA (build vs buy)
**Qué decir:**
> "Evaluamos tres caminos: más gente (no escala), solo reglas/RPA (se rompe con intención libre) y un SaaS genérico (no valida identidad con SU base de clientes). Solamente la IA construida sobre un modelo fundación ancla la validación en la fuente de verdad de Aysa."

**Análisis:**
- Es un **caso de build** (no buy): la validación de identidad con BBDD propia no la da un SaaS genérico. Regla estándar: "use case diferenciado → build".
- La clave diferenciadora: **el LLM extrae; la fuente de verdad confirma.** Nadie más ofrece eso de fábrica.

---

## Slide 4 — Pipeline de 4 etapas
**Qué decir:**
> "La etapa 1 es determinística y sin IA — resuelve el 70% del volumen gratis. La etapa 2 usa un LLM solo para clasificar y extraer. La etapa 3 es el corazón: cruzamos lo extraído con su base de clientes para CONFIRMAR o RECHAZAR. Solo así es auditable."

**Sustento:**
- **Por qué el 70% sin IA:** spam, dedupe por hilo (Message-ID/In-Reply-To), out-of-office → se resuelven con reglas. Esto **corta el costo de tokens ~80%**.
- **Detector de alucinaciones (juez):** el LLM puede inventar un n.º de servicio; el juez + schema lo detecta y lo deriva a humano.
- **Regla de oro:** nunca confirmar identidad solo por lo que dice el modelo → previene suplantación/fraude (riesgo R1).

**Pregunta probable:**
- *"¿Qué pasa si el LLM se equivoca en la confirmación?"* → No confirmamos con el LLM; confirmamos cruzando con su BBDD. Si el cruce es dudoso → revisión humana. El error queda acotado y auditable.

---

## Slide 5 — 5 estrategias: overview + comparativa
**Qué decir:**
> "Cinco caminos posibles, de un MVP mínimo a una plataforma enterprise. Aysa es un cliente grande → el destino es la Estrategia 5: plataforma de punta a punta con OCR + embeddings + CRM + dashboard en vivo. Las demás son escalones."

**Análisis / foco ENTERPRISE:**
- **E1 (MVP):** **ARS 12–30K/lote** (USD 8–20). Puerta de entrada que valida la tasa real de confirmación/rechazo con mínimo riesgo.
- **E2 (Triage LLM):** **ARS 120–225K/lote** (USD 80–150). Núcleo: captura intención libre.
- **E3 (OCR):** **ARS 165–315K/lote** (USD 110–210). Adjuntos = señal de identidad más fuerte.
- **E4 (Data/BI):** **ARS 128–240K/lote** (USD 85–160). Marketing consume el dato por campaña.
- **E5 (Enterprise):** **ARS 270–480K/lote** (USD 180–320). **Es el destino.** Plataforma completa.

**Pregunta probable:**
- *"¿Por qué tanta diferencia de costo?"* → El costo refleja cuánto volumen llega al LLM (E1 ~15% → barato; E5 todo + OCR + embeddings → caro) y si usa cloud vs self-host.

---

## Slide 6 — Estrategia 1: MVP (puerta de entrada)
**Qué decir:**
> "Estrategia 1: filtro determinístico + solo identidad. Sin IA en el grueso — reglas resuelven campaña, tipo, spam y dedupe. El LLM solo extrae campos de identidad y se cruza con la base. Costo: **ARS 12–30K/lote**, 4–6 semanas de set-up, 2 personas. Es la puerta de entrada que valida el proceso antes de escalar."

**Análisis:**
- **Por qué arrancar acá:** riesgo mínimo, costo casi nulo, valida la tasa real de confirmación/rechazo.
- **Limitación:** no captura intención libre, clasificación rígida, sin feedback en tiempo real.
- **Lo que mide el piloto:** precisión de clasificación ≥90%, extracción ≥95%, derivación a humano <30%.

---

## Slide 7 — Estrategia 5: Enterprise (el destino)
**Qué decir:**
> "Estrategia 5: orquestación completa. Todo integrado — ingestión schedulada, OCR, triage, verificación de identidad en tiempo real, CRM, respuestas automáticas y dashboard en vivo por campaña. Es la solución de plataforma que merece un cliente de la escala de Aysa."

**Análisis:**
- **Costo:** **ARS 270–480K/lote** (USD 180–320). El más caro, pero el único que resuelve punta a punta.
- **TCO 3 años:** **ARS 67–135 M** (USD 45–90k) incluyendo las 4 capas de costo + contingencia 25%.
- **Equipo:** 5–6 personas dedicadas. Alto mantenimiento.
- **El camino:** E1 → E2/E3 → E4 → E5. No se salta directo.

---

## Slide 8 — Análisis financiero (para el CFO)
**Qué decir:**
> "Pido aprobar solo el piloto (Horizonte 1) de **ARS 12–30 M** (USD 8–20k). El payback base es de 6 a 12 meses. La contingencia del 25% cubre la preparación de datos y el cambio de proceso — los dos costos que casi siempre se subestiman."

**Análisis:**
- **3 escenarios** en cada estrategia = rigor financiero.
- **TCO 3 años (E5):** **ARS 67–135 M** (USD 45–90k) con las 4 capas de costo + contingencia 25%.
- **"Shrink the ask":** al aprobar solo H1, el downside se acota. Esto es lo que más convence a un comité.

**Preguntas probables:**
- *"¿Cuál es el payback?"* → 6–12 meses base.
- *"¿Y si el modelo cambia de precio?"* → Capa de abstracción + self-host como contingencia.
- *"¿Por qué el costo real siempre sube?"* → Data prep + cambio de proceso son 40–60% del costo.

---

## Slide 9 — Registro de riesgos
**Qué decir:**
> "El riesgo que más nos importa es R1: confirmar mal una identidad. Lo mitigamos con la regla de oro: cruzar siempre con la fuente de verdad y derivar a humano bajo duda. R2 es el cumplimiento de la Ley 25.326, que condiciona self-host vs cloud."

**Análisis:**
- Riesgo con **owner y mitigación** = madurez organizacional. No es un párrafo vago.
- Los 3 más críticos: **R1** (fraude, impacto alto), **R2** (regulatorio, impacto alto), **R4** (opt-out = derecho ejercible, impacto alto).
- Los 5 restantes (R3 al R8) son de impacto medio con mitigaciones definidas.

---

## Slide 10 — Roadmap: 3 horizontes
**Qué decir:**
> "Tres horizontes con go/no-go claros. Se aprueba solo H1 — si el piloto no supera el go/no-go, se cierra con una pérdida acotada al presupuesto del piloto."

**Análisis:**
- **H1 (0–6 meses):** Puerta de entrada (E1) + golden set + medir tasa real. **ARS 12–30 M.** Aprueba ahora.
- **H2 (6–18 meses):** Expandir a E2/E3 (human-in-loop, OCR) + gobernanza/ops. **ARS 30–75 M.**
- **H3 (18–36 meses):** E4/E5 (data campañas + dashboard + CRM full). **ARS 67–135 M.** El destino.
- **Principio "shrink the ask":** riesgo total limitado al piloto. Si no funciona, se corta.

---

## Slide 11 — Gobernanza & Métricas
**Qué decir:**
> "Gobernanza clara: un business sponsor dueño del resultado, finanzas como co-autor, y compliance dueño de la Ley 25.326. El piloto tiene gatillos de go/no-go objetivos: precisión ≥90%, payback <6 meses. Y kill criteria explícitas: si la adopción cae >50% o el costo se triplica, se corta."

**Análisis:**
- **Roles:** Business Sponsor (Gerencia Ops/Marketing), Technical Sponsor (CIO/CTO), Finance co-author, Compliance owner (Legal/CISO/DPO).
- **A cada stakeholder su métrica:** CFO → cash flow/payback; CIO → factibilidad; CEO → valor; Marketing → data por campaña.
- **Kill criteria:** time-to-value retrasado >6 meses, adopción >50% bajo, costo >3× modelo del piloto.

---

## Slide 12 — Q&A
**Qué decir:**
> "Gracias por su tiempo. El próximo paso concreto es resolver self-host vs cloud y confirmar la fuente de verdad de Aysa. Con esos dos datos, arrancamos el piloto de 4–6 semanas."

**Análisis / cierre:**
- **Acción concreta:** resolver los 2 bloqueadores (hosting + fuente de verdad) → arrancar piloto.
- **Foco enterprise:** la narrativa posiciona el piloto como primer peldaño, nunca como el objetivo final.
- Si preguntan por timeline: "En 4–6 semanas tenemos datos reales de precisión. En 3 meses, go/no-go para escalar."

---

## Bloqueadores a resolver en la reunión
| Bloqueador | Por qué es crítico | Pregunta a Aysa |
|---|---|---|
| **Self-host vs cloud** | Define costo, privacidad (25.326) y velocidad | "¿Los datos de usuarios pueden salir de su infraestructura?" |
| **Fuente de verdad** | Sin ella, nada confirma identidad seguro | "¿Nos dan acceso a la BBDD de clientes/servicios para el cruce?" |
| **Formato de data para Marketing** | Define el esquema de salida | "¿Cómo quieren consumir el dato por campaña? (BI/CSV/CRM)" |

---

*Generado por el flujo de presentaciones labIA. 12 slides · Versión compacta para manager.*
