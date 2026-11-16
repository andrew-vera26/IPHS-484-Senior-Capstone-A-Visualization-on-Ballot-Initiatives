// encode.js — lenses (which layer colors the strip), value styling, legends.
import { h, slug } from './util.js';

export const LENSES = {
  l1: { key: 'l1', layer: 1, field: 'l1', label: 'What happened', name: 'Structural operation', interpretive: false,
        subtitle: 'Color shows Layer 1, the structural operation: what the amending bill did to the text of each provision.' },
  l2: { key: 'l2', layer: 2, field: 'l2', label: 'Type', name: 'Provision type', interpretive: false,
        subtitle: 'Color shows Layer 2, the provision type: what kind of rule each provision is.' },
  l3: { key: 'l3', layer: 3, field: 'l3', label: 'Direction', name: 'Directional effect', interpretive: true,
        subtitle: 'Color shows Layer 3, the directional effect. This layer is a judgment, not a structural fact.' },
  l4: { key: 'l4', layer: 4, field: 'l4', label: 'Mechanism', name: 'Mechanism', interpretive: true,
        subtitle: 'Color shows Layer 4, the mechanism by which a narrowing or delay was achieved. This layer is a judgment.' },
  // Two channels at once (spec v1, 7.2 and 13.1; ADR 0008). Pattern and fill carry Layer 1, hue carries Layer 3.
  // There is no light-to-dark ramp: the project has no severity score. Not interpretive as a whole: in Facts
  // only it drops the hue and draws the Layer 1 patterns in one neutral ink.
  both: { key: 'both', layer: '1 and 3', field: null, fields: ['l1', 'l3'], label: 'Both', name: 'What happened and direction', interpretive: false,
        subtitle: 'Pattern shows Layer 1, what happened to the text: hollow, half filled, striped or solid. Hue shows Layer 3, the direction of the change, which is a judgment.',
        factsSubtitle: 'Pattern shows Layer 1, what happened to the text: hollow, half filled, striped or solid. Facts only: the direction hue is hidden, so every cell is drawn in one ink.' },
};

export const lensesFor = (mode) => Object.values(LENSES).filter((l) => mode !== 'facts' || !l.interpretive);
/** Lenses that color by a single field (the value lists on the Method page). */
export const singleLenses = (mode) => lensesFor(mode).filter((l) => l.field);
export const lensSubtitle = (key, mode) => (mode === 'facts' && LENSES[key].factsSubtitle) || LENSES[key].subtitle;
export const lensTitle = (l) => `Layer ${l.layer}: ${l.name}`;

/** The legend keys a provision answers to under a lens. Plain lenses: the value; Both: 'l1:<v>' and 'l3:<v>'. */
const keyOf = (v) => (v === null || v === undefined ? '__none__' : v);
export function pickKeys(lensKey, p) {
  const lens = LENSES[lensKey];
  if (!lens) return [];
  if (lens.fields) return lens.fields.map((f) => `${f}:${keyOf(p[f])}`);
  return [keyOf(p[lens.field])];
}
export const matchesPick = (lensKey, p, picked) => picked === undefined || pickKeys(lensKey, p).includes(picked);
export const validLens = (key, mode) => (lensesFor(mode).some((l) => l.key === key) ? key : 'l1');

// Values with a designed color and a second, non-color encoding.
const FIXED = {
  l1: ['unchanged', 'partially deleted', 'rewritten', 'deleted entirely'],
  l3: ['narrows', 'expands', 'neutral', 'indeterminate'],
};
const QUAL = 18; // --q0 … --q17 in site.css (Paul Tol "muted", color-blind safe)

/** Sorted distinct values per lens across every loaded case, so colors are stable between cases. */
export function buildDomains(cases) {
  const domains = {};
  for (const lens of Object.values(LENSES)) {
    if (!lens.field) continue;
    const seen = new Set();
    for (const c of cases) for (const p of c.provisions) if (p[lens.field] !== null) seen.add(p[lens.field]);
    const fixed = (FIXED[lens.key] || []).filter((v) => seen.has(v));
    const rest = [...seen].filter((v) => !fixed.includes(v)).sort();
    domains[lens.key] = [...fixed, ...rest];
  }
  return domains;
}

/** Class and inline style for a value under a lens. */
export function valueStyle(lensKey, value, domains) {
  if (value === null || value === undefined) return { cls: 'v-none', style: '' };
  if (FIXED[lensKey]?.includes(value)) return { cls: `v-${lensKey}-${slug(value)}`, style: '' };
  const i = Math.max(0, domains[lensKey].indexOf(value));
  return { cls: 'v-qual', style: `--c: var(--q${i % QUAL})` };
}

export const valueLabel = (lensKey, value) => {
  if (value !== null && value !== undefined) return value;
  return lensKey === 'l4' ? 'no mechanism recorded' : 'no value recorded';
};

/**
 * Both lens: the Layer 1 pattern, drawn in the Layer 3 hue.
 * Facts only, or no direction recorded: the pattern in neutral ink.
 */
const hueOf = (l3, mode) => (mode === 'facts' || l3 === null || l3 === undefined ? 'var(--ink)'
  : FIXED.l3.includes(l3) ? `var(--l3-${slug(l3)})` : 'var(--ink)');
const patternOf = (l1) => (l1 === null || l1 === undefined ? 'v-none'
  : FIXED.l1.includes(l1) ? `v-both v-both-${slug(l1)}` : 'v-both v-both-other');
export function bothStyle(p, mode) {
  return { cls: patternOf(p.l1), style: `--c: ${hueOf(p.l3, mode)}` };
}

export const valueAnchor = (lensKey, value) => `${lensKey}-${slug(value ?? 'none')}`;

/**
 * Legend for one case under one lens. Counts are computed from the provisions given.
 * onPick(value|undefined) toggles a highlight; `picked` is the current one ('__none__' for null).
 */
export function buildLegend(provisions, lensKey, domains, opts = {}) {
  if (lensKey === 'both') return buildBothLegend(provisions, domains, opts);
  return legendList(provisions, lensKey, domains, { ...opts, swatchOf: (v) => valueStyle(lensKey, v, domains) });
}

/** Both lens: one list per channel, each with its own counts and "?" links. */
function buildBothLegend(provisions, domains, { mode = 'interp', ...opts } = {}) {
  const pattern = legendList(provisions, 'l1', domains, { ...opts, keyPrefix: 'l1:',
    swatchOf: (v) => bothStyle({ l1: v, l3: null }, 'facts') });
  const hue = mode === 'facts' ? null : legendList(provisions, 'l3', domains, { ...opts, keyPrefix: 'l3:',
    swatchOf: (v) => bothStyle({ l1: 'deleted entirely', l3: v }, mode) });
  return h('div.legend-both', {},
    h('div.legend-channel', {},
      h('span.legend-cap', {}, 'Pattern: what happened (Layer 1)'), pattern),
    hue ? h('div.legend-channel', {},
      h('span.legend-cap', {}, 'Hue: direction (Layer 3)', h('span.model-tag', {}, 'interpretation')), hue)
      : h('p.legend-note', {}, 'Facts only: the direction hue is hidden. Every cell is drawn in one ink.'),
    h('p.legend-note', {}, 'No light-to-dark scale: patterns are categories, not a ranking.'));
}

function legendList(provisions, lensKey, domains, { picked, onPick, methodLinks = true, codebookText, showCounts = true, swatchOf, keyPrefix = '' } = {}) {
  const counts = new Map();
  for (const p of provisions) {
    const v = p[LENSES[lensKey].field];
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  const ordered = [...domains[lensKey].filter((v) => counts.has(v)), ...(counts.has(null) ? [null] : [])];
  const list = h('ul.legend', { 'aria-label': `Legend: ${LENSES[lensKey].name}` });
  for (const v of ordered) {
    const st = swatchOf(v);
    const key = keyPrefix + (v === null ? '__none__' : v);
    const notInCodebook = codebookText && v !== null && !codebookText.includes('`' + v + '`');
    list.append(h('li', {},
      h(onPick ? 'button.legend-item' : 'span.legend-item.legend-static', onPick ? {
        type: 'button', 'aria-pressed': String(picked === key),
        title: 'Show only this value on the strip',
        onclick: () => onPick(picked === key ? undefined : key),
      } : {},
        h(`span.swatch.${st.cls}`, { style: st.style, 'aria-hidden': 'true' }),
        h('span.legend-name', {}, valueLabel(lensKey, v)),
        showCounts ? h('span.legend-n', {}, String(counts.get(v))) : null),
      notInCodebook ? h('span.legend-flag', { title: 'This value appears in the data but not in spec/codebook.md' }, 'not in codebook') : null,
      methodLinks ? h('a.legend-q', { href: `method.html#${valueAnchor(lensKey, v)}`, title: 'Where this value is defined', 'aria-label': `Method: ${valueLabel(lensKey, v)}` }, '?') : null));
  }
  return list;
}
