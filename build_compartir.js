const fs = require('fs');
const src = 'presentacion-labia-aysa.html';
let html = fs.readFileSync(src, 'utf8');

const css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || '';

const slStart = html.indexOf('const SLIDES = [');
const slEnd = html.indexOf('\n];\n', slStart);
if (slStart === -1 || slEnd === -1) { console.error('No se pudo localizar SLIDES'); process.exit(1); }
const slidesBlock = html.slice(slStart, slEnd + 3);

const cardStart = html.indexOf('function strategyCard(');
const cardEndMarker = '\n/* ---------- deck engine ---------- */';
const cardEnd = html.indexOf(cardEndMarker);
const helperBlock = html.slice(cardStart, cardEnd);

const script = `${slidesBlock}\n${helperBlock}\n;globalThis.__SLIDES_HTML=SLIDES.map(f=>f());`;
const vm = require('vm');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(script, ctx);
const slides = ctx.__SLIDES_HTML;

const slidesHtml = slides.map((s, i) => `
<div class="slide">
  <div class="snum">${i + 1} / ${slides.length}</div>
  ${s}
</div>`).join('\n');

const staticCss = `
  html, body { height:auto; overflow:visible; }
  body { background:#06090f; padding:0; }
  body > .deck { height:auto; overflow:visible; }
  .slide { position:relative; width:1280px; min-height:720px; padding:66px 77px; margin:0 auto 40px;
    opacity:1; transform:none; pointer-events:auto;
    border:1px solid var(--line); border-radius:20px; background:radial-gradient(circle at 70% -10%, rgba(125,139,255,.10), transparent 55%); }
  .snum { position:absolute; top:18px; right:26px; font-size:.72rem; letter-spacing:1px; color:var(--dim); }
  h1, h2 { overflow-wrap:break-word; }
  .foot { position:relative; bottom:auto; margin-top:20px; }
  @media (max-width:1400px) {
    .slide { width:100%; min-height:0; border-radius:0; margin:0 0 30px; }
  }
`;

const out = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Presentación labIA · Concentrix · Aysa — Calidad de Datos de Contacto en Campañas</title>
<style>
${css}
${staticCss}
</style>
</head>
<body>
<div class="bgfx"><div class="glow1"></div><div class="glow2"></div></div>
${slidesHtml}
</body>
</html>
`;

fs.writeFileSync('presentacion-labia-aysa-compartir.html', out);
console.log('OK compartir HTML generado:', slides.length, 'slides,', (out.length / 1024).toFixed(1), 'KB');