const fs = require('fs');

const args = process.argv.slice(2);
const inFile = args[0] || 'guion-presentacion-aysa.md';
const outFile = args[1] || 'guion-presentacion-aysa.html';
const docTitle = args[2] || 'Guión Presentación — Aysa';

const src = fs.readFileSync(inFile, 'utf8');

// 1. Procesar línea por línea a tokens HTML
function mdInline(text) {
  let t = text;
  // bold **text**
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic *text*
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  // inline code `text`
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}

function renderBlockquote(lines) {
  const paras = [];
  let cur = [];
  for (const l of lines) {
    if (l.trim() === '') { if (cur.length) { paras.push(cur.join('<br>')); cur = []; } }
    else cur.push(mdInline(l.trim()));
  }
  if (cur.length) paras.push(cur.join('<br>'));
  return '<blockquote>' + paras.map(p => '<p>' + p + '</p>').join('') + '</blockquote>';
}

function renderList(items, ordered) {
  const tag = ordered ? 'ol' : 'ul';
  return '<' + tag + '>' + items.map(i => '<li>' + mdInline(i) + '</li>').join('') + '</' + tag + '>';
}

function renderTable(rows) {
  const header = rows[0].map(c => '<th>' + mdInline(c) + '</th>').join('');
  const body = rows.slice(1).map(r => '<tr>' + r.map(c => '<td>' + mdInline(c) + '</td>').join('') + '</tr>').join('');
  return '<div class="tblwrap"><table><thead><tr>' + header + '</tr></thead><tbody>' + body + '</tbody></table></div>';
}

const lines = src.split('\n');
const html = [];
let i = 0;
let inBlockquote = false, bqLines = [];
let listType = null, listItems = [];
let isTable = false, tableRows = [];

function flushList() {
  if (listType) { html.push(renderList(listItems, listType === 'ol')); listType = null; listItems = []; }
}
function flushBlockquote() {
  if (inBlockquote) { html.push(renderBlockquote(bqLines)); inBlockquote = false; bqLines = []; }
}
function flushTable() {
  if (isTable) { html.push(renderTable(tableRows)); isTable = false; tableRows = []; }
}

while (i < lines.length) {
  const line = lines[i];
  const trimmed = line.trim();

  // --- HR
  if (/^---+$/.test(trimmed)) {
    flushBlockquote(); flushList(); flushTable();
    html.push('<hr>');
    i++; continue;
  }

  // H1
  if (/^#\s/.test(line)) {
    flushBlockquote(); flushList(); flushTable();
    html.push('<h1>' + mdInline(line.replace(/^#\s+/, '')) + '</h1>');
    i++; continue;
  }
  // H2
  if (/^##\s/.test(line)) {
    flushBlockquote(); flushList(); flushTable();
    html.push('<h2>' + mdInline(line.replace(/^##\s+/, '')) + '</h2>');
    i++; continue;
  }

  // Tabla
  if (trimmed.startsWith('|')) {
    flushBlockquote(); flushList();
    if (!isTable) { isTable = true; tableRows = []; }
    const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
    const isSep = cells.every(c => /^:?-{2,}:?$/.test(c));
    if (isSep) { i++; continue; }
    tableRows.push(cells);
    i++; continue;
  }
  if (isTable) { flushTable(); }

  // Blockquote
  if (line.startsWith('>')) {
    flushList(); flushTable();
    if (!inBlockquote) { inBlockquote = true; bqLines = []; }
    bqLines.push(line.replace(/^>\s?/, ''));
    i++; continue;
  }
  if (inBlockquote) flushBlockquote();

  // Lista ordenada
  const om = trimmed.match(/^\d+\.\s+(.*)$/);
  if (om) {
    flushBlockquote(); flushTable();
    if (listType !== 'ol') { flushList(); listType = 'ol'; listItems = []; }
    listItems.push(om[1]);
    i++; continue;
  }
  // Lista viñeta
  const um = trimmed.match(/^[-*]\s+(.*)$/);
  if (um) {
    flushBlockquote(); flushTable();
    if (listType !== 'ul') { flushList(); listType = 'ul'; listItems = []; }
    listItems.push(um[1]);
    i++; continue;
  }
  if (listType) flushList();

  // Párrafo normal
  if (trimmed !== '') {
    flushBlockquote(); flushList(); flushTable();
    html.push('<p>' + mdInline(trimmed) + '</p>');
  }
  i++;
}
flushBlockquote(); flushList(); flushTable();

let bodyLayout = html.join('\n');

// Layout: H1 como portada, luego columnas
const firstTitle = html[0] || '';

const doc = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${docTitle}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --ink:#1c2733; --accent:#0e7c86; --muted:#5b6b7b; --line:#e2e8ee; --soft:#f5f8fa; }
  body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
    color:var(--ink); line-height:1.6; font-size:13.5px; padding:34px 46px; max-width:900px; margin:0 auto; }
  h1 { font-size:25px; color:var(--accent); margin:0 0 4px; letter-spacing:-.5px; }
  h1.sub { font-size:15px; color:var(--muted); font-weight:500; margin-bottom:22px; }
  h2 { font-size:16.5px; color:#0b4f56; margin:26px 0 8px; padding-bottom:6px;
    border-bottom:2px solid var(--line); page-break-after:avoid; }
  p { margin:0 0 9px; }
  strong { color:#0b4f56; }
  hr { border:none; border-top:1px solid var(--line); margin:22px 0; }
  blockquote { background:var(--soft); border-left:3px solid var(--accent); padding:10px 16px;
    margin:10px 0 14px; border-radius:2px; page-break-inside:avoid; }
  blockquote p { margin:0 0 7px; }
  blockquote p:last-child { margin-bottom:0; }
  code { background:#eef2f5; padding:1px 5px; border-radius:3px; font-size:.92em; color:#0b4f56;
    font-family:'SF Mono',Menlo,Consolas,monospace; }
  ul, ol { margin:2px 0 12px 22px; }
  li { margin-bottom:4px; }
  .tblwrap { overflow-x:auto; margin:12px 0 16px; page-break-inside:avoid; }
  table { border-collapse:collapse; width:100%; font-size:12.5px; }
  th { background:#0e7c86; color:#fff; text-align:left; padding:8px 10px; font-weight:600; }
  td { border:1px solid var(--line); padding:8px 10px; vertical-align:top; }
  tr:nth-child(even) td { background:var(--soft); }
  em { color:var(--muted); }
</style>
</head>
<body>
${bodyLayout}
</body>
</html>`;

fs.writeFileSync(outFile, doc);
console.log('OK HTML generado:', outFile, (doc.length/1024).toFixed(1)+'KB');
