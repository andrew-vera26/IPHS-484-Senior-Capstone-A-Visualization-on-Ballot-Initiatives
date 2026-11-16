// panel.js — the side-by-side reading panel for one provision.
// Stored text is written as text nodes only. Highlighting and paragraph display
// wrap existing characters in spans and never change one.
import { h, notCoded } from './util.js';
import { wordDiff } from './diff.js';
import { copyText } from './export.js';
import { valueStyle, valueAnchor, valueLabel } from './encode.js';
import { provisionHref } from './strip.js';

const BLANK_LINE = /\n[^\S\n]*\n/;      // a paragraph break as stored
const LONE_BREAK = /(^|[^\n])\n(?!\n)/;  // a single line break inside a paragraph

/**
 * One witness text. Every stored character goes into the DOM unchanged, in order.
 * For reading, each run of text between blank lines is wrapped in its own block
 * and CSS draws the single line breaks inside it as spaces. With `raw` the stored
 * line breaks are drawn as they are. Either way textContent equals the stored text;
 * if that check ever fails, the text is written plainly with its breaks as stored.
 */
function textColumn(tokens, text, raw) {
  const body = h('div.wit-text', { class: raw ? 'is-raw' : '' });
  const pieces = tokens || text.split(/(\s+)/).filter((t) => t !== '').map((t) => ({ text: t, changed: false }));
  let para = null;
  for (const t of pieces) {
    if (!t.changed && /^\s+$/.test(t.text) && BLANK_LINE.test(t.text)) {
      body.append(document.createTextNode(t.text));   // stays in the DOM, between two blocks
      para = null;
      continue;
    }
    if (!para) body.append(para = h('span.wit-para'));
    para.append(t.changed ? h('span.diff', {}, t.text) : document.createTextNode(t.text));
  }
  if (body.textContent !== text) {
    console.error('Stored text did not survive paragraph display; showing it as stored.');
    body.className = 'wit-text is-raw';
    body.textContent = text;
  }
  return body;
}

function valueChip(lensKey, value, domains) {
  const st = valueStyle(lensKey, value, domains);
  return h('a.value', { href: `method.html#${valueAnchor(lensKey, value)}`, title: 'Definition on the Method page' },
    h(`span.swatch.${st.cls}`, { style: st.style, 'aria-hidden': 'true' }), valueLabel(lensKey, value));
}

const row = (label, ...content) => h('div.kv', {}, h('dt', {}, label), h('dd', {}, ...content));

export function renderPanel(caseObj, p, { mode, domains, diffOn, rawBreaks, onSelect, onClose, onToggleDiff, onToggleBreaks, permalink }) {
  const interp = mode !== 'facts';
  const provs = caseObj.provisions;
  const prev = provs[p.index - 1], next = provs[p.index + 1];
  const billName = caseObj.bill.short || 'the amending bill';

  const both = p.baseText !== null && p.compText !== null;
  const diff = both && diffOn ? wordDiff(p.baseText, p.compText) : null;
  const diffTooLong = both && diffOn && !diff;

  const chip = (id) => {
    const q = caseObj.byId.get(id);
    return h('a.dep-chip', {
      href: q ? provisionHref(caseObj, q) : null,
      title: q ? `§ ${q.citation}` : 'Not in this file',
      onclick: q ? (e) => { e.preventDefault(); onSelect(q); } : null,
    }, h('code', {}, id.split('-').pop()), q ? h('span', {}, ` § ${q.citation}`) : null,
      // Structural fact, safe in facts-only mode: what happened to the dependency itself.
      q ? h('span.dep-l1', {}, ` · ${q.l1}`) : null);
  };

  const citeBtn = h('button.btn', { type: 'button' }, 'Cite');
  citeBtn.addEventListener('click', () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    copyText(`What Survives (prototype; model-coded, unaudited). ${p.id}, ${caseObj.title}, § ${p.citation}. ${permalink(p)}. Accessed ${today}.`, citeBtn);
  });
  const linkBtn = h('button.btn', { type: 'button' }, 'Copy link');
  linkBtn.addEventListener('click', () => copyText(permalink(p), linkBtn));

  const heading = h('h3.panel-title', { tabindex: '-1' }, h('code', {}, p.id), h('span.panel-cite', {}, `§ ${p.citation}`));

  const baseCol = h('section.wit', { 'aria-label': 'Voter-enacted text' },
    h('header.wit-head', {},
      h('span.wit-name', {}, caseObj.route === 'B' ? 'Text as adopted' : 'Voter-enacted text'),
      h('span.wit-id', {}, 'base witness')),
    p.baseText !== null
      ? textColumn(diff?.a, p.baseText, rawBreaks)
      : h('p.wit-none', {}, 'No text stored for this witness. The base witness text is null in the data for this record.'));

  const compCol = h('section.wit', { 'aria-label': `Text after ${billName}` },
    h('header.wit-head', {},
      h('span.wit-name', {}, `After ${billName}`),
      h('span.wit-id', {}, 'comparison witness ', h('code', {}, p.witnessId || ''))),
    p.compText !== null
      ? textColumn(diff?.b, p.compText, rawBreaks)
      : h('p.wit-none', {}, 'No text stored for this witness. Structural operation recorded: ', h('b', {}, p.l1), '.'));

  const diffNote = both
    ? h('label.diff-toggle', {},
        h('input', { type: 'checkbox', checked: diffOn, onchange: (e) => onToggleDiff(e.target.checked) }),
        ' Highlight differing words ',
        h('span.diff-note', {}, diffTooLong
          ? '(texts too long to compare in the browser)'
          : '(a mechanical word comparison made in your browser; it is not coded evidence, and no text is altered)'))
    : null;
  // Offered only when a stored text has line breaks inside a paragraph, which is the only thing the display changes.
  const hasLoneBreaks = [p.baseText, p.compText].some((t) => t !== null && LONE_BREAK.test(t));
  const breaksNote = hasLoneBreaks
    ? h('label.diff-toggle', {},
        h('input', { type: 'checkbox', checked: rawBreaks, onchange: (e) => onToggleBreaks(e.target.checked) }),
        ' Show line breaks as stored ',
        h('span.diff-note', {}, '(for reading, a line break inside a paragraph is drawn as a space; no word or character is changed, added or removed)'))
    : null;
  const textOpts = diffNote || breaksNote ? h('div.text-opts', {}, diffNote, breaksNote) : null;

  const facts = h('dl.kvs', {},
    row('What happened', valueChip('l1', p.l1, domains), h('span.layer-tag', {}, 'Layer 1')),
    row('Type', valueChip('l2', p.l2, domains), h('span.layer-tag', {}, 'Layer 2')),
    row('Provenance', h('span', {}, p.provenance ?? '—'),
      p.provenance === 'inherited' ? h('span.note-inline', {}, ' reprinted from earlier law; outside the denominator') : null),
    row('Unit', p.isComponent === null ? notCoded(null, { inline: true })
      : p.isComponent ? h('span', {}, 'Component of ', chip(p.parentId)) : 'Provision',
      p.isComponent === null ? h('span.note-inline', {}, ' this file has no counts_in_denominator field') : null),
    row('In denominator', p.inDenominator === null ? notCoded(null, { inline: true }) : p.inDenominator ? 'Yes' : 'No'),
    p.provenanceBasis ? row('Provenance basis', h('span.model-text', {}, p.provenanceBasis), h('span.model-tag', {}, 'model-written')) : null);

  const interpretation = interp
    ? h('dl.kvs', {},
        row('Direction', valueChip('l3', p.l3, domains), h('span.layer-tag', {}, 'Layer 3')),
        row('Mechanism', valueChip('l4', p.l4, domains), h('span.layer-tag', {}, 'Layer 4')),
        row('Rationale', p.rationale
          ? [h('span.model-text', {}, p.rationale), h('span.model-tag', {}, 'model-written')]
          : h('span.muted', {}, 'None recorded.')),
        row('Review', `Confidence: ${p.meta.confidence ?? '—'}. Flagged for review: ${p.meta.flagged ? 'yes' : 'no'}. Coded by: ${p.meta.codedBy ?? '—'}.`))
    : h('p.hidden-note', {}, 'Facts only: direction, mechanism and the model-written rationale are hidden. Switch to “With interpretation” in the header to see them.');

  const evidence = p.evidence.any
    ? h('p', {}, 'Span offsets are recorded for this provision.')
    : notCoded('Character offsets for the quoted evidence span are empty in this file. The full stored text of both witnesses is shown above instead.');

  const hasDeps = p.dependsOn.length || p.dependedOnBy.length;
  const deps = h('div.deps', {},
    hasDeps ? h('dl.kvs', {},
      p.dependsOn.length ? row('Depends on', ...p.dependsOn.map(chip)) : null,
      p.dependedOnBy.length ? row('Depended on by', ...p.dependedOnBy.map(chip)) : null)
      : h('p.muted', {}, 'No dependency links are recorded for this provision.'),
    interp && p.dependencyAffected
      ? h('p.hidden-change', {}, h('span.diamond', { 'aria-hidden': 'true' }),
          h('b', {}, 'Hidden change. '), 'This provision is flagged ', h('code', {}, 'dependency_affected'),
          ': its own text may look close to intact, but something it relies on was changed. Source: ',
          ...p.dependencySources.map(chip), '.')
      : null);

  return h('section.panel', { 'aria-label': `Provision ${p.id}` },
    h('header.panel-head', {},
      heading,
      h('div.panel-tools', {}, citeBtn, linkBtn,
        h('button.btn.btn-close', { type: 'button', onclick: onClose, 'aria-label': 'Close panel' }, 'Close ×'))),
    h('nav.panel-nav', { 'aria-label': 'Neighbouring provisions' },
      prev ? h('a', { href: provisionHref(caseObj, prev), onclick: (e) => { e.preventDefault(); onSelect(prev); } }, `‹ ${prev.short}`) : h('span'),
      h('span.panel-pos', {}, `Record ${p.index + 1} of ${provs.length}`),
      next ? h('a', { href: provisionHref(caseObj, next), onclick: (e) => { e.preventDefault(); onSelect(next); } }, `${next.short} ›`) : h('span')),
    h('div.wits', {}, baseCol, compCol),
    textOpts,
    h('div.apparatus', {},
      h('section', {}, h('h4', {}, 'Facts'), facts),
      h('section', {}, h('h4', {}, 'Interpretation'), interpretation),
      h('section', {}, h('h4', {}, 'Quoted evidence'), evidence),
      h('section', {}, h('h4', {}, 'Dependencies'), deps)));
}
