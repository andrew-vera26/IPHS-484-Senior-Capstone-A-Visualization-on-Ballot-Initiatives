// method.js — the layers, the value lists (computed from the data), the rules.
import { h, clear, fill, fmt, notCoded, routeBadge } from './util.js';
import { loadCorpus, loadCodebookText, CUTOFF, ROUTES } from './data.js';
import { mountChrome, getMode, onMode } from './chrome.js';
import { LENSES, singleLenses, buildDomains, valueStyle, valueLabel, valueAnchor } from './encode.js';

mountChrome('method');
const main = document.getElementById('main');
const corpus = await loadCorpus();
const codebook = await loadCodebookText();
const domains = buildDomains(corpus.cases);

// A value's prose definition, if the codebook has a "### <value>" heading followed by a blockquote.
function codebookDefinition(value) {
  if (!codebook || value === null) return null;
  const lines = codebook.split('\n');
  const at = lines.findIndex((l) => l.trim() === `### ${value}`);
  if (at < 0) return null;
  const quote = [];
  for (let i = at + 1; i < lines.length; i++) {
    if (lines[i].startsWith('>')) quote.push(lines[i].replace(/^>\s?/, ''));
    else if (quote.length) break;
    else if (lines[i].startsWith('#')) break;
  }
  return quote.length ? quote.join(' ') : null;
}
const inCodebook = (v) => (codebook && v !== null ? codebook.includes('`' + v + '`') : null);

function valueList(lensKey) {
  const lens = LENSES[lensKey];
  const values = [...domains[lensKey], ...(corpus.cases.some((c) => c.provisions.some((p) => p[lens.field] === null)) ? [null] : [])];
  return h('div.values', {}, ...values.map((v) => {
    const st = valueStyle(lensKey, v, domains);
    const key = v === null ? '__none__' : v;
    const uses = corpus.cases.map((c) => [c, c.provisions.filter((p) => p[lens.field] === v).length]).filter(([, n]) => n);
    const def = codebookDefinition(v);
    const known = inCodebook(v);
    return h('div.value-row', { id: valueAnchor(lensKey, v) },
      h(`span.swatch.${st.cls}`, { style: st.style }),
      h('div.value-name', {}, valueLabel(lensKey, v),
        v === null ? h('span.src-note', {}, 'the field is empty for these records')
          : known === false ? h('span.src-note', {}, 'in the data, but not in spec/codebook.md')
          : known ? h('span.src-note', {}, 'listed in spec/codebook.md') : null),
      h('div.value-uses', {}, ...uses.flatMap(([c, n], i) => [i ? h('br') : null,
        routeBadge(c.route), ' ',
        h('a', { href: `case.html?case=${c.id}&lens=${lensKey}&value=${encodeURIComponent(key)}` }, `${fmt(n)} in ${c.title} →`)])),
      def ? h('blockquote.value-def', {}, def, h('cite', {}, 'Definition quoted from spec/codebook.md')) : null);
  }));
}

function provenanceList() {
  const seen = new Map();
  for (const c of corpus.cases) for (const [k, n] of c.counts.provenance) seen.set(k, [...(seen.get(k) || []), [c, n]]);
  const gloss = { created: 'written by the measure', amended: 'existing law that the measure changed',
    inherited: 'reprinted from earlier law without change; shown as context, never counted', uncertain: 'not determined; shown as context, never counted' };
  return h('div.values', {}, ...[...seen].map(([k, uses]) => h('div.value-row', { id: `provenance-${k}` },
    h('span'), h('div.value-name', {}, k, h('span.src-note', {}, gloss[k] ?? '')),
    h('div.value-uses', {}, ...uses.flatMap(([c, n], i) => [i ? h('br') : null, routeBadge(c.route), ` ${fmt(n)} in `, h('a', { href: `case.html?case=${c.id}` }, c.title)])))));
}

const host = h('div.prose', { style: { maxWidth: '860px' } });
main.append(h('h1.page-title', {}, 'Method'), host);

function draw() {
  const mode = getMode();
  const layerRows = [
    [1, 'Structural operation', 'near-objective', 'What happened to the text. The voter-enacted text is compared with the amending bill, never with the earlier statute.'],
    [2, 'Provision type', 'near-objective', 'What kind of rule the provision is: a definition, a rate, a penalty, and so on.'],
    [3, 'Directional effect', 'interpretive', 'Whether the change narrows or expands what the provision does, or neither. Carries a written rationale.'],
    [4, 'Mechanism', 'interpretive', 'How a narrowing or delay was achieved. Applies only where Layer 3 records one.'],
    [5, 'Description', 'bill-level', 'How the bill was described, and whether that matches what it did.'],
    [6, 'Timing and procedure', 'bill-level', 'Committee, margins, days from enactment, emergency clause.'],
    [7, 'Measure context', 'measure-level', 'Topic, vote margin, earlier and later similar measures.'],
    [8, 'Subsequent fate', 'measure-level', 'Litigation, re-initiation, later alteration.'],
    [9, 'Coding metadata', 'record-level', 'Who coded the record, with what confidence, and whether a person has checked it.'],
  ];
  fill(host, 
    h('p.lede', {}, 'How a law is cut into provisions, what is recorded about each one, and which records are counted.'),
    h('p', {}, h('span.provisional', {}, 'Provisional'), 'The method is at version 0.2 and has been applied by a model to two cases. Nothing below has been validated against hand-coded records, because none exist yet.'),

    h('h2', { id: 'unit' }, 'The unit: a provision'),
    h('p', {}, 'A provision is one separately survivable unit of law. An enumerated item is its own provision if the legislature could delete it, leave its siblings intact, and the statute would still make sense. This is the ', h('b', {}, 'separate-survivability test'), '. It is applied by reading the text, not by looking at numbering or indentation.'),
    h('p', {}, 'An item that fails the test is a ', h('b', {}, 'component'), ': it completes its parent provision. A component keeps its own record and its own cell, drawn shorter, and it is not counted.'),
    h('p', {}, 'Every provision has a permanent identifier assigned on the enacted text, such as ', h('code', {}, 'MO-2024-PropA-p003'), ': state, year, measure, and position in reading order.'),

    h('h2', { id: 'layers' }, 'The layers'),
    h('p', {}, 'Each record is coded in layers, so that what the text did is kept apart from what the change means. Layers 1 and 2 are close to fact. Layers 3 and 4 are judgments. The switch in the header, ', h('b', {}, 'Facts only'), ', hides Layers 3 and 4 everywhere, so a reader who disputes those judgments can still use the edition.'),
    h('div.layers', {}, ...layerRows.map(([n, name, kind, text]) => h('div.layer', {},
      h('span.layer-n', {}, String(n)), h('div.layer-name', {}, name, h('span.layer-kind', {}, kind)), h('p', {}, text)))),
    h('p', {}, 'There is no severity score. A strip shows what happened to each provision. It does not rank provisions by importance, which is why cells are equal in width by default.'),
    h('h3', { id: 'both' }, 'The “Both” lens'),
    h('p', {}, 'The “Both” lens shows two layers at once on separate channels. The ', h('b', {}, 'pattern'), ' of a cell is Layer 1, what happened to the text: hollow for unchanged, half filled for partially deleted, striped for rewritten, solid for deleted entirely. These are the same patterns the “What happened” lens uses. The ', h('b', {}, 'hue'), ' is Layer 3, the direction of the change.'),
    h('p', {}, h('span.model-tag', {}, 'interpretation'), ' The direction hue is a judgment, not a structural fact. In ', h('b', {}, 'Facts only'), ' it is removed and every cell is drawn in one ink, so only Layer 1 remains.'),
    h('p', {}, 'There is no light-to-dark scale for Layer 1. A darker or fuller cell would read as “worse”, and this project has no severity score. A cell that records no direction is drawn in plain ink, the same ink Facts only uses.'),

    h('h2', { id: 'values' }, 'The value lists'),
    h('p', {}, 'Each layer takes its values from a closed list. The lists below are computed from the coded files: every value that occurs, how many records carry it in each case, and a link that opens that case with those records picked out. The working codebook is ', h('code', {}, 'spec/codebook.md'), '; it was drawn from one case and is not yet complete.'),
    ...singleLenses(mode).flatMap((l) => [
      h('h3', { id: l.key }, `Layer ${l.layer}: ${l.name.toLowerCase()}`, l.interpretive ? h('span.model-tag', {}, 'interpretive') : null),
      l.key === 'l2' ? h('p', {}, 'The two coded cases use different lists for this layer. Values marked “not in spec/codebook.md” appear only in the South Dakota file. Comparing provision types across the two cases is not yet sound.') : null,
      l.key === 'l3' ? h('p', {}, 'Only one value occurs in the data so far. The schema also allows expands, neutral and indeterminate; no record carries them.') : null,
      valueList(l.key)]),
    mode === 'facts' ? h('p.hidden-note', {}, 'Facts only: the value lists for Layers 3 and 4 are hidden.') : null,
    h('h3', { id: 'provenance' }, 'Provenance'),
    h('p', {}, 'A certified measure often reprints older statute around the new text. Provenance records where each provision came from.'),
    provenanceList(),

    h('h2', { id: 'denominator' }, 'The denominator rule'),
    h('div.callout', {}, h('p', {}, 'A record counts only if ', h('code', {}, 'counts_in_denominator == true'), ' and its provenance is ', h('code', {}, 'created'), ' or ', h('code', {}, 'amended'), '.')),
    h('p', {}, 'Components are left out so that a long list of definitions does not swamp the count. Inherited text is left out because its survival says nothing about the measure. Both stay visible on the strip as context.'),
    h('div.table-scroll', {}, h('table.table', {},
      h('thead', {}, h('tr', {}, ...['Case', 'Route', 'Records', 'Provisions', 'Components', 'Inherited', 'In the denominator'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, ...corpus.cases.map((c) => {
        const n = (v) => h('td.num', {}, v === null ? notCoded(null, { inline: true }) : fmt(v));
        return h('tr', {}, h('th', { scope: 'row' }, h('a', { href: `case.html?case=${c.id}` }, c.title)), h('td', {}, routeBadge(c.route)),
          n(c.counts.records), n(c.counts.provisions), n(c.counts.components), n(c.counts.inherited), n(c.counts.denominator));
      })))),
    corpus.cases.some((c) => !c.counts.hasDenominatorFlag)
      ? h('p', {}, 'Where a row says “Not coded yet”, the file was coded before the field ', h('code', {}, 'counts_in_denominator'), ' existed. The rule cannot be applied to it, and this site does not guess.') : null,
    h('p.fig-status', {}, 'Model-coded, unaudited. Computed from the files, one row per case, never summed.'),

    h('h2', { id: 'routes' }, 'The two routes'),
    ...['A', 'B'].map((r) => h('p', {}, routeBadge(r, { long: true }), ' ', ROUTES[r].plain)),
    h('p', {}, 'Every case carries one of the two. The phrase “what voters voted for” applies only to Route A. For that reason the two routes are never pooled in one count, and every list on this site can be filtered by route. No Route B case is coded yet.'),

    h('h2', { id: 'cutoff' }, 'The cutoff'),
    h('p', {}, `The corpus covers alterations made through ${CUTOFF}. An initiative altered after that date is outside it.`),

    h('h2', { id: 'pipeline' }, 'The pipeline'),
    notCoded('No pipeline has run. Both files were coded by a model in conversation. Needed: the pipeline built eval-first (plan step 8), with each stage written to disk and described here.'),

    h('h2', { id: 'selection' }, 'Selection criteria'),
    notCoded('The corpus is not yet fixed. Needed: the window and adopt-and-amend decisions (plan step 3, S1 and S2) and the audited candidate list (plan step 5).'),

    h('h2', { id: 'excluded' }, 'Excluded cases'),
    notCoded('No case has been formally excluded. Needed: the step 5 audit, listing each candidate left out and the reason.'),

    h('h2', { id: 'reliability' }, 'Reliability, layer by layer'),
    notCoded('No hand-coded records exist to compare against. Needed: blind hand-coding (plan step 6), then agreement reported separately for each layer, never as one figure.'),

    h('h2', { id: 'limits' }, 'What the method does not capture'),
    h('ul', {},
      h('li', {}, 'Constitutional amendments, which a legislature cannot alter on its own.'),
      h('li', {}, 'Non-enforcement and underfunding. Only formal legal change is recorded.'),
      h('li', {}, 'Later bills. Each case is coded against one amending bill; a law changed twice shows only the first change.'),
      h('li', {}, 'Evidence spans. The schema has fields for the exact characters that drive a judgment, and they are empty in both files.')));
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
onMode(draw);
draw();
