// strip.js — one strip of cells per case, one cell per record, in reading order.
// Used by the case page, the home page (small multiples) and the Patterns page.
import { h } from './util.js';
import { LENSES, valueStyle, valueLabel } from './encode.js';

export const provisionHref = (c, p, extra = '') =>
  `case.html?case=${encodeURIComponent(c.id)}&p=${encodeURIComponent(p.id)}${extra}`;

/**
 * opts: lens ('l1'…'l4' or 'plain' for uncolored), domains, mode, byLength,
 *       picked (legend highlight key), selectedId, onSelect(p, event), labels (section labels),
 *       hrefExtra (query string appended to each cell link)
 */
export function renderStrip(caseObj, opts) {
  const { lens = 'l1', domains, mode = 'interp', byLength = false, picked, selectedId, onSelect, labels = true, hrefExtra = '' } = opts;
  const field = LENSES[lens]?.field;
  const strip = h('div.strip', {
    class: [byLength ? 'by-length' : '', picked !== undefined ? 'has-pick' : '', labels ? '' : 'no-labels'].join(' '),
    role: 'group',
    'aria-label': `${caseObj.title}: ${caseObj.provisions.length} records in reading order`,
  });

  let sec = null, secCells = null, secKey = Symbol('none'), secWeight = 0;
  const closeSec = () => { if (sec) sec.style.flexGrow = String(Math.max(secWeight, 1)); };

  for (const p of caseObj.provisions) {
    if (p.section !== secKey) {
      closeSec();
      secKey = p.section; secWeight = 0;
      secCells = h('div.sec-cells');
      sec = h('div.sec', { title: `Section ${p.section}` },
        labels ? h('span.sec-label', { 'aria-hidden': 'true' }, p.section) : null, secCells);
      strip.append(sec);
    }
    const value = field ? p[field] : null;
    const st = field ? valueStyle(lens, value, domains) : { cls: 'v-plain', style: '' };
    const weight = byLength ? Math.max((p.baseText || p.compText || '').length, 1) : 1;
    secWeight += weight;
    const key = value === null ? '__none__' : value;
    const hidden = mode !== 'facts' && p.dependencyAffected;
    const describe = [
      p.short, `section ${p.citation}`,
      field ? `${LENSES[lens].name}: ${valueLabel(lens, value)}` : null,
      p.isComponent ? 'component' : null,
      p.provenance === 'inherited' ? 'inherited text' : null,
      hidden ? 'hidden change' : null,
    ].filter(Boolean).join(', ');
    const cell = h('a.cell', {
      href: provisionHref(caseObj, p, hrefExtra),
      class: [st.cls, p.isComponent ? 'is-component' : '', p.provenance === 'inherited' ? 'is-inherited' : '',
        hidden ? 'is-hidden-change' : '', p.id === selectedId ? 'is-selected' : '',
        picked !== undefined && picked === key ? 'is-picked' : ''].join(' '),
      style: `${st.style}; flex-grow:${weight}`,
      'aria-label': describe,
      'aria-current': p.id === selectedId ? 'true' : null,
      tabindex: '-1',
      dataset: { id: p.id },
    }, hidden ? h('span.cell-mark', { 'aria-hidden': 'true' }) : null);
    cell._p = p;
    if (onSelect) cell.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      onSelect(p, e);
    });
    secCells.append(cell);
  }
  closeSec();

  // Roving tabindex: one tab stop, arrow keys move between cells.
  const cells = [...strip.querySelectorAll('.cell')];
  const start = cells.find((c) => c.dataset.id === selectedId) || cells[0];
  if (start) start.tabIndex = 0;
  strip.addEventListener('keydown', (e) => {
    const i = cells.indexOf(document.activeElement);
    if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: cells.length - 1 }[e.key];
    if (to === undefined) {
      if (e.key === ' ') { e.preventDefault(); document.activeElement.click(); }
      return;
    }
    e.preventDefault();
    const next = cells[Math.min(Math.max(to, 0), cells.length - 1)];
    cells[i].tabIndex = -1; next.tabIndex = 0; next.focus();
  });
  return strip;
}

/** One-line readout under a strip that follows hover and keyboard focus. */
export function attachReadout(strip, readout, lens, idle) {
  const field = LENSES[lens]?.field;
  const show = (cell) => {
    const p = cell?._p;
    if (!p) { readout.replaceChildren(h('span.readout-idle', {}, idle)); return; }
    readout.replaceChildren(
      h('code.readout-id', {}, p.id), h('span', {}, `§ ${p.citation}`),
      field ? h('span.readout-val', {}, valueLabel(lens, p[field])) : null,
      p.isComponent ? h('span.readout-tag', {}, 'component') : null,
      p.provenance === 'inherited' ? h('span.readout-tag', {}, 'inherited') : null);
  };
  show(null);
  strip.addEventListener('mouseover', (e) => show(e.target.closest('.cell')));
  strip.addEventListener('focusin', (e) => show(e.target.closest('.cell')));
  strip.addEventListener('mouseleave', () => show(null));
}
