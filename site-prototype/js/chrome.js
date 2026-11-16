// chrome.js — the banner, masthead and footer shared by every page,
// plus the two global switches: reading mode and theme.
import { h, params, setParams } from './util.js';
import { CUTOFF } from './data.js';

const NAV = [
  ['index.html', 'Cases', 'home'],
  ['corpus.html', 'Corpus', 'corpus'],
  ['patterns.html', 'Patterns', 'patterns'],
  ['method.html', 'Method', 'method'],
  ['about.html', 'About', 'about'],
];

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/** 'facts' hides Layers 3 and 4 and every judgment; 'interp' shows them. */
export function getMode() {
  const p = params().get('mode');
  if (p === 'facts' || p === 'interp') return p;
  return store.get('ws-mode') === 'facts' ? 'facts' : 'interp';
}

export function setMode(mode) {
  store.set('ws-mode', mode);
  setParams({ mode: mode === 'facts' ? 'facts' : null });
  document.documentElement.dataset.mode = mode;
  window.dispatchEvent(new CustomEvent('ws:mode', { detail: mode }));
}

export const onMode = (fn) => window.addEventListener('ws:mode', (e) => fn(e.detail));

// Light is the default theme. Dark is the reader's choice, kept in localStorage.
function applyTheme(theme) {
  if (theme === 'dark') document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;
}

export function mountChrome(active) {
  const mode = getMode();
  document.documentElement.dataset.mode = mode;
  let theme = store.get('ws-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(theme);

  const banner = h('div.banner', { role: 'note', 'aria-label': 'Data status' },
    h('span.banner-text', {}, h('b', {}, 'Prototype.'), ' Model-coded, unaudited.'),
    h('a', { href: 'about.html#trust' }, 'What this means'));

  const modeSwitch = h('div.seg.mode-seg', { role: 'group', 'aria-label': 'Reading mode' },
    ...[['facts', 'Facts only', 'Show only structural facts (Layers 1 and 2). Hides direction, mechanism and every judgment.'],
        ['interp', 'With interpretation', 'Also show the interpretive layers (3 and 4) and the model-written rationale.']]
      .map(([v, label, title]) => h('button.seg-btn', {
        type: 'button', title, 'aria-pressed': String(v === mode), dataset: { value: v },
        onclick: (e) => {
          for (const b of e.currentTarget.parentElement.children) b.setAttribute('aria-pressed', String(b === e.currentTarget));
          setMode(v);
        },
      }, label)));

  const themeLabel = () => (theme === 'dark' ? 'Light theme' : 'Dark theme');
  const themeBtn = h('button.theme-btn', {
    type: 'button', title: 'Switch between the light and dark themes', 'aria-pressed': String(theme === 'dark'),
    onclick: () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      store.set('ws-theme', theme);
      applyTheme(theme);
      themeBtn.textContent = themeLabel();
      themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
    },
  }, themeLabel());

  const mast = h('header.mast', {},
    h('div.mast-inner', {},
      h('a.wordmark', { href: 'index.html' },
        h('span.wordmark-name', {}, 'What Survives'),
        h('span.wordmark-sub', {}, 'A provision-by-provision edition of altered initiated statutes')),
      h('nav.nav', { 'aria-label': 'Main' },
        ...NAV.map(([href, label, key]) =>
          h('a', { href, 'aria-current': key === active ? 'page' : null }, label))),
      h('div.mast-tools', {}, modeSwitch, themeBtn)));

  const top = document.getElementById('chrome-top');
  top.replaceChildren(h('a.skip', { href: '#main' }, 'Skip to content'), banner, mast);

  const foot = h('footer.foot', {},
    h('div.foot-inner', {},
      h('p', {}, h('b', {}, 'Prototype. Model-coded, unaudited.'),
        ' Every count on this site is computed in your browser from model-coded files that no person has yet audited. They are not findings.'),
      h('p', {}, h('b', {}, 'Denominator rule. '), 'A record counts only if ',
        h('code', {}, 'counts_in_denominator == true'), ' and its provenance is ',
        h('code', {}, 'created'), ' or ', h('code', {}, 'amended'), '. ',
        h('b', {}, 'Cutoff. '), `Alterations through ${CUTOFF}. `,
        h('b', {}, 'Routes. '), 'Route A and Route B are never pooled.'),
      h('p.foot-small', {}, 'Local prototype, not published. What Survives, IPHS 484, Kenyon College.')));
  document.getElementById('chrome-bottom').replaceChildren(foot);
}
