// export.js — CSV / JSON download and clipboard helpers.
import { h } from './util.js';

function toCsv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\r\n');
}

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const HEADER_NOTE = 'Prototype. Model-coded, unaudited. Not findings.';

/** Two buttons that download whatever getRows() returns at the moment of the click. */
export function downloadButtons(basename, getRows, label = 'Download this view') {
  return h('div.dl', {},
    h('span.control-label', {}, label),
    h('button.btn', { type: 'button', onclick: () => download(`${basename}.csv`, toCsv(getRows()), 'text/csv') }, 'CSV'),
    h('button.btn', { type: 'button', onclick: () => download(`${basename}.json`,
      JSON.stringify({ status: HEADER_NOTE, exported: new Date().toISOString(), rows: getRows() }, null, 2), 'application/json') }, 'JSON'));
}

export async function copyText(text, button) {
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch {
    const ta = h('textarea', { style: { position: 'fixed', opacity: 0 } }, text);
    document.body.append(ta); ta.select();
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
  }
  if (button) {
    const old = button.textContent;
    button.textContent = ok ? 'Copied' : 'Copy failed';
    setTimeout(() => { button.textContent = old; }, 1400);
  }
  return ok;
}
