// data-page.js — the Data page: every file the site reads, and every view that offers a download.
// Lists files; does not copy, merge or recount them.
import { h, fmt, routeBadge, notCoded } from './util.js';
import { loadCorpus } from './data.js';
import { mountChrome } from './chrome.js';

mountChrome('data');
const main = document.getElementById('main');
const corpus = await loadCorpus();

// Pages are served from site-prototype/ under the repo root, so repo paths are one level up.
const repoHref = (path) => `../${path}`;

const fileRow = (label, path, what) => h('tr', {},
  h('th', { scope: 'row' }, label),
  h('td', {}, h('a', { href: repoHref(path), download: '' }, h('code', {}, path))),
  h('td', {}, what));

const viewRow = (view, href, what, note) => h('tr', {},
  h('th', { scope: 'row' }, h('a', { href }, view)),
  h('td', {}, 'CSV, JSON'),
  h('td', {}, what),
  h('td', {}, note));

const head = (...cols) => h('thead', {}, h('tr', {}, ...cols.map((t) => h('th', { scope: 'col' }, t))));

main.append(
  h('h1.page-title', {}, 'Data'),
  h('div.prose', { style: { maxWidth: '860px' } },
    h('p.lede', {}, 'Every file this site reads, and every view you can download.'),
    h('p', {}, h('span.provisional', {}, 'Model-coded, unaudited'),
      'Everything below was coded by a model and has not been checked by a person. The files are the ones the site reads, unchanged. They are not findings.'),

    h('h2', { id: 'files' }, 'Files'),
    h('div.table-scroll', {}, h('table.table', {},
      head('File', 'Path', 'What it holds'),
      h('tbody', {},
        ...corpus.cases.map((c) => fileRow(
          h('span', {}, routeBadge(c.route), ' ', c.title),
          c.codedFile,
          `${fmt(c.counts.records)} records, one per provision or component. Model-coded, unaudited.`)),
        fileRow('Corpus list', 'site-prototype/data/corpus-seed.json',
          'Every case listed, coded or not, with its route and status. Candidates are unverified.'),
        fileRow('Codebook', 'spec/codebook.md', 'The working value lists. Drawn from one case; not complete.')))),
    h('p.fig-status', {}, 'Model-coded, unaudited. Files are served as stored; nothing is merged or recounted here.'),

    h('h2', { id: 'views' }, 'Downloads from each view'),
    h('p', {}, 'Each of these views has a “Download this view” control. It saves what the view shows at that moment, so filters and the reading mode apply. Every JSON download carries the line “Prototype. Model-coded, unaudited. Not findings.”'),
    h('div.table-scroll', {}, h('table.table', {},
      head('View', 'Formats', 'What is saved', 'Note'),
      h('tbody', {},
        ...corpus.cases.map((c) => viewRow(`Case: ${c.title}`, `case.html?case=${c.id}`,
          'One row per record shown on the strip, with its layer values.',
          'Facts only drops the Layer 3 and 4 columns.')),
        viewRow('Corpus', 'corpus.html', 'One row per listed case, after the route and status filters.', ''),
        viewRow('Patterns: mechanism matrix', 'patterns.html#matrix', 'One row per case and Layer 4 value, with its record count.',
          'Not offered in Facts only, because Layer 4 is interpretive.')))),
    h('p.fig-status', {}, 'Model-coded, unaudited.'),

    h('h2', { id: 'gold' }, 'Hand-coded records'),
    notCoded('No hand-coded (gold) records exist yet. Needed: blind hand-coding (plan step 6). They will be listed here beside the model-coded files, never merged with them.')));
