// about.js — the claim, the two routes, and how far to trust any of this.
import { h, fmt, routeBadge } from './util.js';
import { loadCorpus, ROUTES } from './data.js';
import { mountChrome } from './chrome.js';

mountChrome('about');
const main = document.getElementById('main');
const corpus = await loadCorpus();
const mapText = (m) => [...m].map(([k, n]) => `${k ?? 'none'} (${fmt(n)})`).join(', ');

main.append(
  h('h1.page-title', {}, 'About'),
  h('div.prose', {},
    h('p.lede', {}, 'Trackers record that a legislature altered a citizen initiative. They do not say how much of the law was left.'),

    h('h2', { id: 'claim' }, 'The claim'),
    h('p', {}, h('span.provisional', {}, 'Provisional'),
      'Existing methods measure whether a law’s text changed. This project measures whether the law still does what voters voted for, provision by provision, with every claim traceable to source text.'),
    h('p', {}, 'That is the aim, not a result. What exists today is a method, two laws coded by a model, and this prototype for reading them. The project describes cases. With a handful of cases chosen for variety, it does not test a hypothesis and does not estimate how often anything happens.'),
    h('p', {}, 'The site works like a critical edition. A strip shows every provision of a law in order. Selecting a provision opens the enacted text beside the text the legislature left.'),

    h('h2', { id: 'routes' }, 'Two routes, never pooled'),
    h('p', {}, 'An initiative can become law in two ways, and the difference decides what can be claimed about it.'),
    ...['A', 'B'].map((r) => h('div.callout', {}, h('p', {}, routeBadge(r, { long: true })), h('p', {}, ROUTES[r].plain,
      r === 'A' ? ' Here it makes sense to ask what survives of what voters voted for.'
        : ' Michigan in 2018 is the example. Here voters did not vote, so the question “what survives of what voters voted for” does not apply. What can be asked is what survives of the text the legislature adopted.'))),
    h('p', {}, 'Because the claim differs, the two routes are never combined in a count. Every case carries a route badge, every list can be filtered by route, and counts are always given per route.'),
    h('div.table-scroll', {}, h('table.table', {},
      h('thead', {}, h('tr', {}, ...['Route', 'Cases listed', 'Model-coded', 'Not coded yet'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, ...['A', 'B'].map((r) => {
        const listed = corpus.byRoute(r), coded = listed.filter((e) => e.coded).length;
        return h('tr', {}, h('th', { scope: 'row' }, routeBadge(r, { long: true })),
          h('td.num', {}, fmt(listed.length)), h('td.num', {}, fmt(coded)), h('td.num', {}, fmt(listed.length - coded)));
      })))),
    h('p', {}, 'No Route B case has been coded. Every Route B view on this site says “Not coded yet”.'),

    h('h2', { id: 'trust' }, 'How far to trust this'),
    h('p', {}, h('b', {}, 'Not far yet, and the site is built to say so.'), ' The banner at the top of every page reads “Prototype. Model-coded, unaudited.” It cannot be closed.'),
    h('h3', {}, 'How the coding was done'),
    h('p', {}, 'A language model read each law and its amending bill, cut the law into provisions, and filled in the layers. No person has yet coded these cases by hand, and no person has audited the model’s records. The files record this about themselves:'),
    h('div.table-scroll', {}, h('table.table', {},
      h('thead', {}, h('tr', {}, ...['Case', 'Coded by', 'Compared with hand coding', 'Adjudicated by a person', 'Flagged for review', 'Confidence the model gave'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, ...corpus.cases.map((c) => h('tr', {},
        h('th', { scope: 'row' }, h('a', { href: `case.html?case=${c.id}` }, c.title)),
        h('td', {}, mapText(c.counts.codedBy)), h('td', {}, mapText(c.counts.agreement)),
        h('td', {}, `${fmt(c.counts.adjudicated)} of ${fmt(c.counts.records)}`),
        h('td', {}, `${fmt(c.counts.flagged)} of ${fmt(c.counts.records)}`),
        h('td', {}, mapText(c.counts.confidence))))))),
    h('p.fig-status', {}, 'Computed from the coding metadata in each file.'),
    h('p', {}, 'Hand-verified coding is the standard the project sets for itself. Hand-coded records will be kept apart from model output, written only by a person, and used to measure how often the model is right, layer by layer. None exists yet.'),
    h('h3', {}, 'What the limits are'),
    h('ul', {},
      h('li', {}, 'The counts are a model’s reading of two laws. They can be wrong at any provision.'),
      h('li', {}, 'Layers 3 and 4 are judgments. The “Facts only” switch hides them, leaving the structural record.'),
      h('li', {}, 'The exact passages that drive each judgment are not yet recorded, so a reader must compare the two full texts.'),
      h('li', {}, 'The South Dakota file was coded under an earlier version of the schema. It has no component flag, so its denominator cannot be computed and is shown as “Not coded yet”.'),
      h('li', {}, 'Each case is compared with one amending bill only.'),
      h('li', {}, 'The eight candidate cases are unverified. Four come from Ballotpedia’s list and have not been checked against primary sources.')),
    h('h3', {}, 'Why every figure is labeled'),
    h('p', {}, 'A number on a clean page looks settled. These are not. So every figure carries its status in its footer, every count is computed from the files in your browser and can be downloaded, percentages are withheld until a person has audited the coding, and anything missing says “Not coded yet” and names what is needed. The legal text itself is never reworded: both versions are shown exactly as stored.'),

    h('h2', { id: 'project' }, 'The project'),
    h('p', {}, 'What Survives is a senior capstone by Andrew Vera, IPHS 484, Kenyon College. This prototype runs only on a local machine and is not published.')));
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
