// patterns.js — cross-case views. Routes are separate blocks everywhere; nothing is pooled.
import { h, clear, fill, params, setParams, fmt, notCoded, routeBadge, figure, segmented } from './util.js';
import { loadCorpus } from './data.js';
import { mountChrome, getMode, onMode } from './chrome.js';
import { buildDomains, valueStyle, valueLabel, valueAnchor } from './encode.js';
import { renderStrip, provisionHref } from './strip.js';
import { downloadButtons } from './export.js';

mountChrome('patterns');
const main = document.getElementById('main');
const corpus = await loadCorpus();
const domains = buildDomains(corpus.cases);
const q = params();
const state = { mode: getMode(), route: ['A', 'B'].includes(q.get('route')) ? q.get('route') : 'all' };
const host = h('div');

main.append(
  h('h1.page-title', {}, 'Patterns across cases'),
  h('p.lede', {}, 'Five views that look across cases. With two coded cases they show how the views will work more than they show any pattern.'),
  h('ul.toc', {},
    ...[['matrix', 'Mechanism matrix', 'which mechanisms appear in which case'],
        ['description', 'Description versus effect', 'how a bill described itself beside what was coded'],
        ['speed', 'Speed', 'days from enactment to alteration'],
        ['erosion', 'Erosion timeline', 'the law after each successive bill'],
        ['controls', 'Visible controls', 'unaltered and technical-correction cases']]
      .map(([id, t, d]) => h('li', {}, h('a', { href: `#${id}` }, t), `: ${d}.`))),
  h('div.filters', {}, segmented({ label: 'Route', value: state.route,
    options: [{ value: 'all', label: 'Both, separately' }, { value: 'A', label: 'Route A' }, { value: 'B', label: 'Route B' }],
    onChange: (v) => { state.route = v; setParams({ route: v === 'all' ? null : v }); draw(); } })),
  host);

const routes = () => (state.route === 'all' ? ['A', 'B'] : [state.route]);
const routeHead = (r, extra) => h('div.route-group-head', {}, routeBadge(r, { long: true }), extra ? h('span', {}, extra) : null);
const routeBEmpty = (what) => notCoded(`No Route B case is coded. ${what} needs the adopted text, the amending bill and provision-level coding for a case the legislature enacted itself.`);

// ---------- 1. mechanism matrix ----------
function matrix() {
  if (state.mode === 'facts') {
    return h('p.hidden-note', {}, 'Facts only: the mechanism (Layer 4) is an interpretive layer and is hidden. Switch to “With interpretation” in the header to see this view.');
  }
  const body = h('div');
  for (const r of routes()) {
    const cases = corpus.codedByRoute(r);
    body.append(routeHead(r, `${fmt(cases.length)} coded`));
    if (!cases.length) { body.append(routeBEmpty('A mechanism matrix')); continue; }
    const values = [...domains.l4.filter((v) => cases.some((c) => c.provisions.some((p) => p.l4 === v))),
      ...(cases.some((c) => c.provisions.some((p) => p.l4 === null)) ? [null] : [])];
    const drill = h('div', { 'aria-live': 'polite' });
    const table = h('table.table.matrix', {},
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Mechanism (Layer 4)'),
        ...cases.map((c) => h('th', { scope: 'col' }, h('a', { href: `case.html?case=${c.id}&lens=l4` }, c.title), h('span.src-note', {}, `${fmt(c.counts.records)} records`))))),
      h('tbody', {}, ...values.map((v) => {
        const st = valueStyle('l4', v, domains);
        return h('tr', {},
          h('th', { scope: 'row' }, h('a.value', { href: `method.html#${valueAnchor('l4', v)}` },
            h(`span.swatch.${st.cls}`, { style: st.style }), valueLabel('l4', v))),
          ...cases.map((c) => {
            const list = c.provisions.filter((p) => p.l4 === v);
            if (!list.length) return h('td', {}, h('span.matrix-zero', {}, '0'));
            const btn = h('button.matrix-btn', { type: 'button', 'aria-expanded': 'false',
              title: `List the ${list.length} records` }, fmt(list.length));
            btn.addEventListener('click', () => {
              const open = btn.getAttribute('aria-expanded') === 'true';
              table.querySelectorAll('.matrix-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
              clear(drill);
              if (open) return;
              btn.setAttribute('aria-expanded', 'true');
              drill.append(h('div.drill', {},
                h('h4', {}, `${c.title}: ${fmt(list.length)} records coded “${valueLabel('l4', v)}”`),
                h('ul.drill-list', {}, ...list.map((p) => h('li', {},
                  h('a', { href: provisionHref(c, p, '&lens=l4'), title: `§ ${p.citation}: ${p.l1}` }, p.short))))));
            });
            return h('td', {}, btn);
          }));
      })));
    body.append(h('div.table-scroll', { style: { borderTop: 0 } }, table), drill);
  }
  return body;
}

// ---------- 2. description versus effect ----------
function description() {
  const body = h('div');
  for (const r of routes()) {
    const cases = corpus.codedByRoute(r);
    body.append(routeHead(r));
    if (!cases.length) { body.append(routeBEmpty('This comparison')); continue; }
    for (const c of cases) {
      const cts = c.counts;
      body.append(h('div.dve', {},
        h('div.dve-case', {}, h('a', { href: `case.html?case=${c.id}` }, c.title), h('span.muted', { style: { font: '400 14px var(--sans)' } }, c.instrument)),
        h('div', {}, h('h4', {}, 'How the bill was described'),
          c.bill.statedRationale
            ? [h('blockquote', {}, c.bill.statedRationale),
               h('p.src', {}, 'Stored as ', h('code', {}, 'stated_rationale'), '; source recorded as: ', c.bill.rationaleSource ?? '—', '. This is the coder’s short label for the description, not a quotation from the bill.')]
            : notCoded('No description is recorded for this bill.')),
        h('div', {}, h('h4', {}, 'What the coding records (Layer 1, all records)'),
          h('ul.breakdown', {}, ...domains.l1.filter((v) => cts.l1All.has(v)).map((v) => {
            const st = valueStyle('l1', v, domains);
            return h('li', {}, h(`span.swatch.${st.cls}`, { style: st.style }), h('b', {}, fmt(cts.l1All.get(v))), ` ${v}`);
          })),
          state.mode === 'facts'
            ? h('p.hidden-note', {}, 'Facts only: the description-versus-effect gap flag is a judgment and is hidden.')
            : h('p.src', {}, h('b', {}, `${fmt(cts.gapFlags)} of ${fmt(cts.records)}`), ' records carry the flag ',
                h('code', {}, 'description_effect_gap'), ' (the coder judged that the description did not match the effect).'))));
    }
  }
  return body;
}

// ---------- 3. speed ----------
function speed() {
  const body = h('div');
  const all = corpus.cases.filter((c) => c.bill.daysToEffective !== null);
  const max = Math.max(...all.map((c) => c.bill.daysToEffective), 1);
  const scale = Math.ceil(max / 100) * 100 || 100;
  const pct = (d) => `${(d / scale) * 100}%`;
  for (const r of routes()) {
    const cases = corpus.codedByRoute(r);
    body.append(routeHead(r));
    if (!cases.length) { body.append(routeBEmpty('A speed track')); continue; }
    for (const c of cases) {
      const b = c.bill;
      if (b.daysToEffective === null) { body.append(h('p', {}, c.title), notCoded('No timing is recorded for this bill.')); continue; }
      body.append(h('div.track-row', {},
        h('div.track-label', {}, h('a', { href: `case.html?case=${c.id}` }, c.title),
          h('span.src-note', {}, `${fmt(c.counts.alteredBeforeEffect)} of ${fmt(c.counts.records)} records flagged altered before taking effect`)),
        h('div.track', { role: 'img', 'aria-label': `${c.title}: bill introduced ${b.daysToIntroduction} days after enactment; alteration in effect after ${b.daysToEffective} days` },
          h('div.track-line', { style: { width: pct(b.daysToEffective) } }),
          h('div.track-pt.track-open', { style: { left: pct(b.daysToIntroduction) } }, h('span', {}, `${fmt(b.daysToIntroduction)} d`)),
          h('div.track-pt.track-solid', { style: { left: pct(b.daysToEffective) } }, h('span', {}, `${fmt(b.daysToEffective)} d`)))));
    }
    body.append(h('div.track-row.track-axis', {}, h('div.track-axis-label', {}, 'Days after enactment'),
      h('div.track-scale', {}, ...[0, 0.25, 0.5, 0.75, 1].map((f) => h('span', { style: { left: `${f * 100}%` } }, `${fmt(Math.round(scale * f))}`)))),
      h('ul.marks', { style: { margin: '14px 0 6px' } },
        h('li', {}, h('span.track-key.track-open'), 'amending bill introduced (label above)'),
        h('li', {}, h('span.track-key.track-solid'), 'alteration in effect (label below)')));
  }
  return body;
}

// ---------- 4. erosion timeline ----------
function erosion() {
  const body = h('div');
  for (const r of routes()) {
    const cases = corpus.codedByRoute(r);
    body.append(routeHead(r));
    if (!cases.length) { body.append(routeBEmpty('An erosion timeline')); continue; }
    for (const c of cases) {
      body.append(h('div.erosion', {},
        h('a', { href: `case.html?case=${c.id}`, style: { font: '600 18px var(--serif)' } }, c.title),
        h('div.erosion-row', {}, h('div.erosion-label', {}, 'As enacted', h('span.src-note', {}, 'every record, uncolored')),
          renderStrip(c, { lens: 'plain', domains, mode: state.mode, labels: false })),
        h('div.erosion-row', {}, h('div.erosion-label', {}, `After ${c.bill.short ?? 'bill 1'}`, h('span.src-note', {}, `bill ${c.bill.sequence ?? 1}; Layer 1`)),
          renderStrip(c, { lens: 'l1', domains, mode: state.mode, labels: false })),
        h('div.erosion-row', {}, h('div.erosion-label', {}, 'After a second bill'),
          h('div.ghost-strip', {}, h('span.not-coded', {}, 'Not coded yet'),
            h('span', {}, c.fate.alteredAgainLater === false
              ? 'No later amending bill is coded (altered_again_later_session is false in this file). Outcomes are not yet indexed by bill.'
              : 'Needs outcomes indexed by bill.')))));
    }
  }
  return body;
}

function draw() {
  fill(host, 
    figure({ id: 'matrix', title: 'Which mechanisms appear in which case',
      subtitle: 'Rows are Layer 4 values present in the data. Each number is a count of records in one case; select it to list those records. There are no totals across cases or routes.',
      body: matrix(), note: 'Layer 4 applies only where Layer 3 records a narrowing or delay. “No mechanism recorded” means the field is empty for that record.',
      downloads: state.mode === 'facts' ? null : downloadButtons('mechanism-matrix', () => corpus.cases.filter((c) => routes().includes(c.route)).flatMap((c) =>
        [...new Set(c.provisions.map((p) => p.l4))].map((v) => ({ route: c.route, case: c.id, layer_4_mechanism: v, records: c.provisions.filter((p) => p.l4 === v).length })))) }),
    figure({ id: 'description', title: 'How each bill was described, beside what was coded',
      subtitle: 'Left: the description recorded for the bill (Layer 5). Right: the structural operations coded for its provisions (Layer 1).',
      body: description(), note: 'The description field holds a short label written by the coder. The bill’s own title and summary are in each case’s description-materials source file and are not yet linked to records.' }),
    figure({ id: 'speed', title: 'Days from enactment to alteration',
      subtitle: 'One track per case, measured in days from the day the measure was enacted. Bill-level values from Layer 6.',
      body: speed(), note: 'The day counts are stored once per bill. “Altered before taking effect” is recorded per record.' }),
    figure({ id: 'erosion', title: 'The law after each successive bill',
      subtitle: 'One row per state of the law. Only one amending bill is coded per case, so there are two real rows and an empty third.',
      body: erosion(), note: 'The “as enacted” row carries no coding. It shows the provisions in order so the rows below can be compared with it.' }),
    figure({ id: 'controls', title: 'Controls: unaltered cases and technical corrections',
      subtitle: 'Counter-cases show whether the method can tell a hollowing from a fix. They would appear here as strips, beside the altered cases.',
      body: h('div', {}, ...routes().map((r) => h('div', {}, routeHead(r),
        notCoded('No unaltered case and no technical-correction case is in the data. The case-selection design requires them; each needs its texts collected and its provisions coded.')))),
      source: 'none yet.' }));
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
}
onMode((m) => { state.mode = m; draw(); });
draw();
