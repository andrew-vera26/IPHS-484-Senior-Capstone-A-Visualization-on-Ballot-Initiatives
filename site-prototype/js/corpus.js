// corpus.js — the list of cases from the seed file.
import { h, clear, fill, params, setParams, fmt, routeBadge, statusBadge, segmented } from './util.js';
import { loadCorpus } from './data.js';
import { mountChrome } from './chrome.js';
import { downloadButtons } from './export.js';

mountChrome('corpus');
const main = document.getElementById('main');
const corpus = await loadCorpus();
const q = params();
const state = {
  route: ['A', 'B'].includes(q.get('route')) ? q.get('route') : 'all',
  status: ['coded', 'not'].includes(q.get('status')) ? q.get('status') : 'all',
};

const countsHost = h('div.routes');
const tableHost = h('div');
const rows = () => corpus.entries.filter((e) =>
  (state.route === 'all' || e.route === state.route) &&
  (state.status === 'all' || (state.status === 'coded') === e.coded));

main.append(
  h('h1.page-title', {}, 'Corpus'),
  h('p.lede', {}, 'The cases this prototype knows about. Two are coded by a model. The rest are candidates that have not been verified against primary sources.'),
  countsHost,
  h('p.never-pooled', {}, 'Counts are given per route. The routes are never added together.'),
  h('div.filters', {},
    segmented({ label: 'Route', value: state.route,
      options: [{ value: 'all', label: 'Both' }, { value: 'A', label: 'Route A · voters' }, { value: 'B', label: 'Route B · legislature' }],
      onChange: (v) => { state.route = v; setParams({ route: v === 'all' ? null : v }); draw(); } }),
    segmented({ label: 'Status', value: state.status,
      options: [{ value: 'all', label: 'All' }, { value: 'coded', label: 'Model-coded' }, { value: 'not', label: 'Not coded yet' }],
      onChange: (v) => { state.status = v; setParams({ status: v === 'all' ? null : v }); draw(); } }),
    downloadButtons('what-survives-corpus', () => rows().map((e) => ({
      title: e.title, state: e.state, year: e.year, enacted_by: e.enactedBy, route: e.route,
      status: e.statusKey, status_shown: e.statusLabel, altering_instrument: e.instrument, link: e.link, source_note: e.sourceNote })))),
  tableHost,
  h('p.fig-foot', {}, h('b', {}, 'Data: '), h('code', {}, 'site-prototype/data/corpus-seed.json'),
    '. Rows marked “Ballotpedia list” come from Ballotpedia’s list of indirect initiated statutes approved by legislatures and are still to be verified against primary sources. Links go to Ballotpedia; no Ballotpedia text is copied here.'));

function draw() {
  fill(countsHost, ...['A', 'B'].map((r) => {
    const listed = corpus.byRoute(r), coded = listed.filter((e) => e.coded);
    return h('div.route-card', {}, routeBadge(r, { long: true }),
      h('div.route-counts', { style: { marginTop: '12px' } },
        h('span', {}, h('b', {}, fmt(listed.length)), 'listed'),
        h('span', {}, h('b', {}, fmt(coded.length)), 'model-coded'),
        h('span', {}, h('b', {}, fmt(listed.length - coded.length)), 'not coded yet')));
  }));
  const list = rows();
  fill(tableHost, h('div.table-scroll', {}, h('table.table', {},
    h('caption.skip', {}, 'Cases in the corpus seed'),
    h('thead', {}, h('tr', {}, ...['Case', 'State', 'Year', 'Route', 'Status', 'Altering instrument', 'Link'].map((t) => h('th', { scope: 'col' }, t)))),
    h('tbody', {}, ...list.map((e) => h('tr', { class: e.coded ? 'is-coded' : 'is-candidate' },
      h('th', { scope: 'row' }, e.coded
        ? h('a.t-title', { href: `case.html?case=${e.id}` }, e.title)
        : h('span.t-title', {}, e.title)),
      h('td', {}, e.state),
      h('td.num', {}, String(e.year)),
      h('td', {}, routeBadge(e.route, { long: true })),
      h('td', {}, statusBadge(e), e.coded ? null : h('span.src-note', {}, 'candidate, unverified')),
      h('td', {}, e.instrument || h('span.muted', {}, '—'),
        e.sourceNote ? h('span.src-note', {}, 'Ballotpedia list, to be verified against primary sources') : null),
      h('td', {}, e.link ? h('a', { href: e.link, target: '_blank', rel: 'noopener' }, 'Ballotpedia ↗') : h('span.muted', {}, 'none yet'))))),
  )), list.length ? null : h('p.muted', {}, 'No case matches these filters.'),
  h('p.muted', { style: { font: '400 13px var(--sans)' } }, `Showing ${fmt(list.length)} of ${fmt(corpus.entries.length)} rows.`));
}
draw();
