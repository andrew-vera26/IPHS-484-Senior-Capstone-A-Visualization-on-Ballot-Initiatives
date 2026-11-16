// strip.js — one strip of cells per case, one cell per record, in reading order.
// Used by the case page, the home page (small multiples) and the Patterns page.
import { h } from './util.js';
import { LENSES, valueStyle, valueLabel, bothStyle, matchesPick } from './encode.js';

export const provisionHref = (c, p, extra = '') =>
  `case.html?case=${encodeURIComponent(c.id)}&p=${encodeURIComponent(p.id)}${extra}`;

/**
 * opts: lens ('l1'…'l4', 'both' for Layer 1 pattern with Layer 3 hue, or 'plain' for uncolored), domains, mode, byLength,
 *       picked (legend highlight key), selectedId, onSelect(p, event), labels (section labels),
 *       hrefExtra (query string appended to each cell link),
 *       thin (the short one-row version pinned above the panel; cells carry a tooltip)
 */
export function renderStrip(caseObj, opts) {
  const { lens = 'l1', domains, mode = 'interp', byLength = false, picked, selectedId, onSelect, labels = true, hrefExtra = '', thin = false } = opts;
  const field = LENSES[lens]?.field;
  const strip = h('div.strip', {
    class: [byLength ? 'by-length' : '', picked !== undefined ? 'has-pick' : '', labels ? '' : 'no-labels', thin ? 'is-thin' : ''].join(' '),
    role: 'group',
    'aria-label': `${caseObj.title}: ${caseObj.provisions.length} records in reading order`,
  });

  let sec = null, secCells = null, secKey = Symbol('none'), secWeight = 0;
  const closeSec = () => { if (sec) sec.style.setProperty('--g', String(Math.max(secWeight, 1))); };

  for (const p of caseObj.provisions) {
    if (p.section !== secKey) {
      closeSec();
      secKey = p.section; secWeight = 0;
      secCells = h('div.sec-cells');
      sec = h('div.sec', { title: `Section ${p.section}` },
        labels ? h('span.sec-head', { 'aria-hidden': 'true' }, h('span.sec-tick'), h('span.sec-label', {}, p.section)) : null, secCells);
      strip.append(sec);
    }
    const value = field ? p[field] : null;
    const st = lens === 'both' ? bothStyle(p, mode) : field ? valueStyle(lens, value, domains) : { cls: 'v-plain', style: '' };
    const weight = byLength ? Math.max((p.baseText || p.compText || '').length, 1) : 1;
    secWeight += weight;
    const hidden = mode !== 'facts' && p.dependencyAffected;
    const describe = [
      p.short, `section ${p.citation}`,
      field ? `${LENSES[lens].name}: ${valueLabel(lens, value)}` : null,
      lens === 'both' ? `${LENSES.l1.name}: ${valueLabel('l1', p.l1)}` : null,
      lens === 'both' && mode !== 'facts' ? `${LENSES.l3.name} (interpretation): ${valueLabel('l3', p.l3)}` : null,
      p.isComponent ? 'component' : null,
      p.provenance === 'inherited' ? 'inherited text' : null,
      hidden ? 'hidden change' : null,
    ].filter(Boolean).join(', ');
    const cell = h('a.cell', {
      href: provisionHref(caseObj, p, hrefExtra),
      class: [st.cls, p.isComponent ? 'is-component' : '', p.provenance === 'inherited' ? 'is-inherited' : '',
        hidden ? 'is-hidden-change' : '', p.id === selectedId ? 'is-selected' : '',
        picked !== undefined && matchesPick(lens, p, picked) ? 'is-picked' : ''].join(' '),
      style: `${st.style}; --g:${weight}`,
      'aria-label': describe,
      title: thin ? `${p.short}, § ${p.citation}` : null,
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

  // Labels are laid out once the strip has a width, and again whenever it changes.
  if (labels && typeof ResizeObserver !== 'undefined') new ResizeObserver(() => layoutLabels(strip)).observe(strip);

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

const LABEL_ROWS = 5, LABEL_GAP = 6, SEARCH_LIMIT = 200000;

// Two labels cannot share a row if their text would overlap.
const overlap = (k, j) => k.a < j.b + LABEL_GAP && j.a < k.b + LABEL_GAP;
// The higher label's tick would run behind the lower label's text. Allowed, but counted and kept to a minimum.
const crosses = (hi, lo) => hi.x > lo.a && hi.x < lo.b;

/**
 * Rows for one visual line of labels (-1 = left out). A bounded search, right to
 * left, for the assignment that leaves out the fewest labels, then has the fewest
 * ticks passing behind another label, then uses the fewest rows, then keeps labels low.
 */
function assignRows(line) {
  const n = line.length, cur = new Array(n).fill(-1);
  let best = null, bestCost = [Infinity, 0, 0, 0], steps = 0;
  const less = (c, d) => { for (let i = 0; i < 4; i++) if (c[i] !== d[i]) return c[i] < d[i]; return false; };
  const go = (i, omitted, crossed, top, sum) => {
    if (steps++ > SEARCH_LIMIT || !less([omitted, crossed, top, sum], bestCost)) return;
    if (i < 0) { best = [...cur]; bestCost = [omitted, crossed, top, sum]; return; }
    const k = line[i];
    for (let r = 0; r < LABEL_ROWS; r++) {
      let ok = true, x = 0;
      for (let j = i + 1; j < n && ok; j++) {
        const rj = cur[j];
        if (rj < 0) continue;
        if (rj === r) ok = !overlap(k, line[j]);
        else if (rj > r ? crosses(line[j], k) : crosses(k, line[j])) x++;
      }
      if (ok) { cur[i] = r; go(i - 1, omitted, crossed + x, Math.max(top, r + 1), sum + r); }
    }
    cur[i] = -1; go(i - 1, omitted + 1, crossed, top, sum);
  };
  go(n - 1, 0, 0, 1, 0);
  return best || cur;
}

/**
 * Place the section labels so that none is clipped and none overlaps another.
 * A label that does not fit beside its neighbours moves up a row (up to LABEL_ROWS);
 * a label that would run past the right edge is shifted left to end at the edge.
 * A tick joins each label to the start of its section. A label that still cannot
 * be placed is left out whole, never cut; its section stays named in the readout.
 */
export function layoutLabels(strip) {
  const heads = [...strip.querySelectorAll('.sec-head')];
  if (!heads.length || !strip.clientWidth) return;
  const box = strip.getBoundingClientRect();
  const items = heads.map((head) => {
    const label = head.querySelector('.sec-label');
    label.style.transform = '';
    const r = head.getBoundingClientRect();
    const w = Math.ceil(label.getBoundingClientRect().width);
    const x = r.left - box.left;
    const a = Math.max(0, Math.min(x, box.width - w));   // shifted left only at the right edge
    return { head, label, line: Math.round(r.top), x, a, b: a + w, row: -1 };
  });
  // Wrapped strips (narrow screens) are laid out one visual line at a time.
  const lines = new Map();
  for (const it of items) (lines.get(it.line) || lines.set(it.line, []).get(it.line)).push(it);
  let rows = 1;
  for (const line of lines.values()) {
    const best = assignRows(line);
    line.forEach((it, i) => { it.row = best[i]; rows = Math.max(rows, best[i] + 1); });
  }
  strip.style.setProperty('--label-rows', String(rows));
  for (const it of items) {
    it.head.classList.toggle('is-omitted', it.row < 0);
    it.head.style.setProperty('--row', String(Math.max(it.row, 0)));
    it.label.style.transform = it.a !== it.x ? `translateX(${Math.round(it.a - it.x)}px)` : '';
  }
}

/** One-line readout under a strip that follows hover and keyboard focus. */
export function attachReadout(strip, readout, lens, idle, mode = 'interp') {
  const field = LENSES[lens]?.field;
  const show = (cell) => {
    const p = cell?._p;
    if (!p) { readout.replaceChildren(h('span.readout-idle', {}, idle)); return; }
    readout.replaceChildren(
      h('code.readout-id', {}, p.id), h('span', {}, `§ ${p.citation}`),
      field ? h('span.readout-val', {}, valueLabel(lens, p[field])) : null,
      lens === 'both' ? h('span.readout-val', {}, valueLabel('l1', p.l1)) : null,
      lens === 'both' && mode !== 'facts' ? h('span.readout-val', {}, `direction: ${valueLabel('l3', p.l3)}`) : null,
      p.isComponent ? h('span.readout-tag', {}, 'component') : null,
      p.provenance === 'inherited' ? h('span.readout-tag', {}, 'inherited') : null);
  };
  show(null);
  strip.addEventListener('mouseover', (e) => show(e.target.closest('.cell')));
  strip.addEventListener('focusin', (e) => show(e.target.closest('.cell')));
  strip.addEventListener('mouseleave', () => show(null));
}
