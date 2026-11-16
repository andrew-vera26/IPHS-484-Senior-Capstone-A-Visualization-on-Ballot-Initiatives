// home.js — the entry page: one line on what this is, every coded case as one strip, then the two routes.
import { h, clear, fill, params, setParams, fmt, routeBadge, figure, segmented } from './util.js';
import { loadCorpus, ROUTES } from './data.js';
import { mountChrome, getMode, onMode } from './chrome.js';
import { LENSES, lensesFor, validLens, buildDomains, buildLegend } from './encode.js';
import { renderStrip, attachReadout } from './strip.js';

mountChrome('home');
const main = document.getElementById('main');
const corpus = await loadCorpus();
const domains = buildDomains(corpus.cases);
const q = params();
const state = {
  mode: getMode(),
  lens: validLens(q.get('lens') || 'l1', getMode()),
  route: ['A', 'B'].includes(q.get('route')) ? q.get('route') : 'all',
  sort: ['year', 'route', 'topic'].includes(q.get('sort')) ? q.get('sort') : 'year',
};

// The route explainer, shortened: one sentence per route and its own counts. It sits under the strips.
function routesBlock(corpus) {
  return h('section.routes.routes-compact', { id: 'routes', 'aria-label': 'The two routes' }, ...['A', 'B'].map((r) => {
    const listed = corpus.byRoute(r), coded = corpus.codedByRoute(r);
    return h('div.route-card', {},
      routeBadge(r, { long: true }),
      h('p', {}, ROUTES[r].plain, r === 'A'
        ? ' The claim “what voters voted for” applies.'
        : ' The claim “what voters voted for” does not apply.'),
      h('div.route-counts', {},
        h('span', {}, h('b', {}, fmt(listed.length)), 'cases listed'),
        coded.length
          ? h('span', {}, h('b', {}, fmt(coded.length)), 'coded by a model, unaudited')
          : h('span', {}, h('span.not-coded', {}, 'Not coded yet'), ' no Route B case has been coded')));
  }));
}

main.append(
  h('h1.page-title.page-title-home', {}, 'What survives when a legislature alters an initiative?'),
  h('p.lede.lede-home', {}, 'Each law is one strip, one cell per provision: the text as enacted against the text the legislature left. ',
    h('span.provisional', {}, 'Provisional'),
    'Coded by a model, not audited by a person. Counts, not findings. ',
    h('a', { href: 'about.html#trust' }, 'How far to trust this'), '.'));

const figHost = h('div');
main.append(figHost,
  routesBlock(corpus),
  h('p.never-pooled', {}, 'The two routes are counted separately everywhere on this site and are never pooled in one figure. ',
    h('a', { href: 'about.html#routes' }, 'Why the route matters'), '.'));

function sortCases(list) {
  const by = {
    year: (a, b) => a.year - b.year || a.title.localeCompare(b.title),
    route: (a, b) => a.route.localeCompare(b.route) || a.year - b.year,
    topic: (a, b) => String(a.context?.topic ?? '~').localeCompare(String(b.context?.topic ?? '~')) || a.year - b.year,
  }[state.sort];
  return [...list].sort(by);
}

function draw() {
  const routes = state.route === 'all' ? ['A', 'B'] : [state.route];
  const body = h('div.multi');
  const readout = h('div.readout');
  for (const r of routes) {
    const coded = sortCases(corpus.codedByRoute(r));
    const candidates = sortCases(corpus.byRoute(r).filter((e) => !e.coded));
    body.append(h('div.route-group-head', {}, routeBadge(r, { long: true }),
      h('span', {}, `${fmt(coded.length)} coded, ${fmt(candidates.length)} not coded yet`)));
    for (const c of coded) {
      const strip = renderStrip(c, { lens: state.lens, domains, mode: state.mode, labels: false,
        hrefExtra: (state.lens !== 'l1' ? `&lens=${state.lens}` : '') });
      attachReadout(strip, readout, state.lens, 'Point at a cell to identify a provision. Select it to read both texts.');
      body.append(h('div.multi-row', {},
        h('div.multi-label', {},
          h('a', { href: `case.html?case=${c.id}` }, c.title),
          h('div.multi-meta', {}, `${c.state}, ${c.year}`, h('span', {}, '·'), `topic: ${c.context.topic ?? '—'}`, h('span', {}, '·'),
            `${fmt(c.counts.records)} records`)),
        strip));
    }
    if (!coded.length) {
      body.append(h('div.multi-row.is-candidate', {}, h('div.multi-label', {}, `No coded Route ${r} case`),
        h('div.ghost-strip', {}, h('span.not-coded', {}, 'Not coded yet'),
          h('span', {}, 'Needs the adopted text, the amending bill, and provision-level coding for at least one case.'))));
    }
    for (const e of candidates) {
      body.append(h('div.multi-row.is-candidate', {},
        h('div.multi-label', {}, e.title, h('div.multi-meta', {}, `${e.state}, ${e.year}`)),
        h('div.ghost-strip', {}, h('span.not-coded', {}, 'Not coded yet'), h('span', {}, 'Candidate, unverified.'))));
    }
  }
  body.append(readout);

  const controls = [
    segmented({ label: 'Color by', value: state.lens,
      options: lensesFor(state.mode).map((l) => ({ value: l.key, label: l.label, title: `Layer ${l.layer}: ${l.name}` })),
      onChange: (v) => { state.lens = v; setParams({ lens: v === 'l1' ? null : v }); draw(); } }),
    segmented({ label: 'Route', value: state.route,
      options: [{ value: 'all', label: 'Both, separately' }, { value: 'A', label: 'Route A' }, { value: 'B', label: 'Route B' }],
      onChange: (v) => { state.route = v; setParams({ route: v === 'all' ? null : v }); draw(); } }),
    segmented({ label: 'Sort', value: state.sort,
      options: [{ value: 'year', label: 'Year' }, { value: 'route', label: 'Route' }, { value: 'topic', label: 'Topic' }],
      onChange: (v) => { state.sort = v; setParams({ sort: v === 'year' ? null : v }); draw(); } }),
    h('div.legend-host', {}, buildLegend(corpus.cases.flatMap((c) => c.provisions), state.lens, domains, { methodLinks: true, showCounts: false })),
  ];

  fill(figHost, figure({
    id: 'cases',
    title: 'Every coded law as one strip, one cell per provision',
    subtitle: LENSES[state.lens].subtitle + ' Strips read left to right in the order of the law. Short cells are components.',
    controls, body,
    source: 'the coded files listed on each case page, and site-prototype/data/corpus-seed.json for the list of cases.',
    note: 'Counts are on each case page; none is summed here. Strips are equal-width per record, so a longer law has narrower cells. Width carries no meaning. Cases sort within their route; routes are never mixed.',
  }));
}

onMode((m) => { state.mode = m; state.lens = validLens(state.lens, m); draw(); });
draw();
