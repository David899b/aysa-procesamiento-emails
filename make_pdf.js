const fs = require('fs');
const src = 'presentacion-labia-aysa.html';
let html = fs.readFileSync(src, 'utf8');

// Capturar el bloque <style>...</style>
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const css = styleMatch ? styleMatch[1] : '';

// Capturar el array SLIDES (funciones)
const slStart = html.indexOf('const SLIDES = [');
const slEnd = html.indexOf('\n];\n', slStart);
if (slStart === -1 || slEnd === -1) { console.error('No se pudo localizar SLIDES'); process.exit(1); }
const slidesBlock = html.slice(slStart, slEnd + 3); // incluye '\n];'

// Capturar el helper strategyCard y deck engine no necesario; solo necesitamos SLIDES + strategyCard + el objeto workflow inline
// strategyCard se define más abajo en el script; extraeremos la función strategyCard
const cardStart = html.indexOf('function strategyCard(');
// No es estrictamente necesaria si SLIDES usa cierres de template que llaman strategyCard... en este HTML SLIDES llama strategyCard(), así que la necesitamos.
// Extraemos desde 'function strategyCard(' hasta el '}\n\n/* ---------- deck engine'
const cardEndMarker = '\n/* ---------- deck engine ---------- */';
const cardEnd = html.indexOf(cardEndMarker);
const helperBlock = html.slice(cardStart, cardEnd);

// Construir script de impresión
const printScript = `
${slidesBlock}
${helperBlock}
const all = SLIDES.map(f => '<div class="slide">' + f() + '</div>');
document.getElementById('print-slides').innerHTML = all.join('<div class="pagebreak"></div>');
`;

const outHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Presentacion labIA · Aysa (PDF)</title>
<style>
${css}
body { --print:1; background:#06090f; margin:0; padding:0; }
html, body { height:auto; overflow:visible; }
.slide { position:relative; inset:auto; transform:none; opacity:1; pointer-events:none;
  width:100vw; height:100vh; padding:5.5vh 6vw; }
.slide.active { opacity:1; }
.pagebreak { break-after:page; }
.topbar, .btn, .counter, .keys { display:none !important; }
.bgfx { position:fixed; }
@page { size:1920px 1080px; margin:0; }
@media print {
  .slide { width:1920px; height:1080px; padding:66px 110px; page-break-after:always; page-break-inside:avoid; }
  .pagebreak { display:none; height:0; overflow:hidden; }
}
@media screen {
  .slide { width:1280px; height:720px; padding:66px 77px; }
}
</style>
</head>
<body>
<div class="bgfx"><div class="glow1"></div><div class="glow2"></div></div>
<div id="print-slides"></div>
<script>${printScript}<\/script>
</body>
</html>
`;

fs.writeFileSync('presentacion-labia-aysa-print.html', outHtml);
console.log('OK print HTML generado');
