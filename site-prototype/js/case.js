// case.js — the edition of one law.
import { h, clear, fill, params, setParams, fmt, notCoded, routeBadge, figure, segmented } from './util.js';
import { loadCorpus, loadCodebookText, exportRows } from './data.js';
import { mountChrome, getMode, onMode } from './chrome.js';
import { lensesFor, validLens, buildDomains, buildLegend, valueLabel, valueStyle, matchesPick, lensSubtitle, lensTitle } from './encode.js';
import { renderStrip, attachReadout } from './strip.js';
import { renderPanel } from './panel.js';
import { downloadButtons, copyText } from './export.js';

mountChrome('home');
const main = document.getElementById('main');

const corpus = await loadCorpus();
const codebookText = await loadCodebookText();
const q = params();
const caseObj = corpus.caseById.get(q.get('case')) || null;

if (!caseObj) {
  const entry = corpus.entries.find((e) => e.title === q.get('title'));
  fill(main,
    h('h1.page-title', {}, entry ? entry.title : 'Case'),
    entry ? h('p', {}, routeBadge(entry.route, { long: true })) : null,
    notCoded(entry
      ? 'This case is a candidate. It needs its texts collected from primary sources and its provisions coded before it can be shown.'
      : 'No coded case matches this address. Choose a case from the list below.'),
    h('ul', {}, ...corpus.cases.map((c) => h('li', {}, h('a', { href: `case.html?case=${c.id}` }, c.title)))));
} else {
  run(caseObj);
}

function run(c) {
  document.title = `${c.title} · What Survives (prototype)`;
  const domains = buildDomains(corpus.cases);
  const state = {
    mode: getMode(),
    lens: validLens(q.get('lens') || 'l1', getMode()),
    picked: q.get('value') ?? undefined,
    selected: c.byId.has(q.get('p')) ? q.get('p') : null,
    deps: q.get('deps') === '1',
    byLength: q.get('w') === 'len',
    diff: true,
    rawBreaks: q.get('br') === '1',
  };

  const permalink = (p) => {
    const u = new URL('case.html', location.href);
    u.searchParams.set('case', c.id);
    u.searchParams.set('p', p.id);
    if (state.lens !== 'l1') u.searchParams.set('lens', state.lens);
    if (state.mode === 'facts') u.searchParams.set('mode', 'facts');
    return u.href;
  };

  // ---------- header ----------
  const b = c.bill, cx = c.context;
  const fact = (k, v) => (v === null || v === undefined || v === '' ? null : h('div.kv', {}, h('dt', {}, k), h('dd', {}, String(v))));
  main.append(
    h('p.crumb', {}, h('a', { href: 'index.html' }, 'Cases'), ' / ', c.state, ' / ', String(c.year)),
    h('h1.page-title', {}, c.title),
    h('div.case-meta', {},
      routeBadge(c.route, { long: true }),
      h('span.status.status-coded', {}, c.statusLabel),
      h('span.case-instr', {}, 'Altered by ', h('b', {}, c.instrument || '—')),
      c.link ? h('a.ext', { href: c.link, rel: 'noopener', target: '_blank' }, 'Ballotpedia ↗')
             : h('span.muted', {}, 'No external link yet')),
    h('details.case-facts', {},
      h('summary', {}, 'Bill and measure facts recorded in the file'),
      h('dl.kvs.kvs-wide', {},
        fact('Topic', cx.topic), fact('Vote on the measure', cx.voteMargin),
        fact('Path to the ballot', cx.ballotPath), fact('Rule regime', cx.ruleRegime),
        fact('Upper chamber', b.passageUpper), fact('Lower chamber', b.passageLower),
        fact('Executive action', b.executiveAction),
        fact('Emergency clause', b.emergencyClause === null ? null : b.emergencyClause ? 'yes' : 'no'),
        fact('Committee of origin', b.committee),
        fact('Days, enactment to introduction', b.daysToIntroduction),
        fact('Days, enactment to alteration in effect', b.daysToEffective)),
      h('p.fig-status', {}, 'Model-collected, unaudited. Shown exactly as stored.')));

  // ---------- strip figure ----------
  const lensHost = h('div');
  const legendHost = h('div.legend-host');
  const subHost = h('p.fig-sub');
  const stripHost = h('div.strip-host');
  const arcs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  arcs.setAttribute('class', 'arcs');
  arcs.setAttribute('aria-hidden', 'true');
  const readout = h('div.readout', { 'aria-live': 'off' });
  const marksLegend = h('ul.marks');
  const depNote = h('p.dep-note');
  const optDeps = h('input', { type: 'checkbox', checked: state.deps });
  const optLen = h('input', { type: 'checkbox', checked: state.byLength });
  const summaryHost = h('div');
  const panelHost = h('div.panel-host', { id: 'panel' });
  const tableHost = h('div');

  // ---------- pinned strip: a thin copy of the strip, fixed under the banner while a panel is open ----------
  const pinStripHost = h('div.pin-strip');
  const pinLabel = h('div.pin-label');
  const pinStep = (dir, label, glyph) => h('button.pin-step', { type: 'button', 'aria-label': label, title: label,
    onclick: () => { const p = c.byId.get(state.selected); const to = p && c.provisions[p.index + dir]; if (to) select(to); } }, glyph);
  const pinPrev = pinStep(-1, 'Previous record', '‹'), pinNext = pinStep(1, 'Next record', '›');
  const pin = h('div.pin', { hidden: true, role: 'navigation', 'aria-label': 'Your place in the law' },
    h('div.pin-inner', {}, pinLabel, pinPrev, pinStripHost, pinNext));
  document.body.append(pin);

  const fig = h('figure.fig.fig-strip', {},
    h('header.fig-head', {},
      h('h2.fig-title', {}, `Every provision of ${c.title}, in reading order`),
      subHost),
    h('div.fig-controls', {}, lensHost, legendHost),
    h('div.fig-body', {},
      h('div.strip-wrap', {}, arcs, stripHost),
      readout,
      h('div.strip-under', {},
        marksLegend,
        h('div.opts', {},
          h('label', {}, optDeps, ' Show dependencies'),
          h('label', { title: 'Equal width is the default because width could be read as importance. This project has no severity score.' },
            optLen, ' Width by text length ', h('span.muted', {}, '(length is not importance)')))),
      depNote),
    h('figcaption.fig-foot', {},
      h('p', {}, h('b', {}, 'Data: '), h('code', {}, c.codedFile), '. ', h('span.fig-status', {}, 'Model-coded, unaudited.'),
        ' One cell per record. Select a cell to read both texts.'),
      h('div.fig-dl', {},
        downloadButtons(`${c.id}-provisions`, () => exportRows(visible(), { includeInterpretation: state.mode !== 'facts' })),
        (() => { const btn = h('button.btn', { type: 'button' }, 'Copy link to this view'); btn.onclick = () => copyText(location.href, btn); return btn; })())));

  main.append(fig, panelHost, summaryHost,
    h('details.table-details', {}, h('summary', {}, `All ${c.provisions.length} records as a table`), tableHost));

  optDeps.addEventListener('change', () => { state.deps = optDeps.checked; setParams({ deps: state.deps ? '1' : null }); drawStrip(); });
  optLen.addEventListener('change', () => { state.byLength = optLen.checked; setParams({ w: state.byLength ? 'len' : null }); drawStrip(); });

  function visible() {
    if (state.picked === undefined) return c.provisions;
    return c.provisions.filter((p) => matchesPick(state.lens, p, state.picked));
  }

  function select(p, { focusPanel = true } = {}) {
    state.selected = p ? p.id : null;
    setParams({ p: state.selected });
    drawStrip();
    drawPanel(focusPanel);
  }

  function drawLens() {
    fill(lensHost, segmented({
      label: 'Color by',
      value: state.lens,
      options: lensesFor(state.mode).map((l) => ({ value: l.key, label: l.label, title: lensTitle(l) })),
      onChange: (v) => { state.lens = v; state.picked = undefined; setParams({ lens: v === 'l1' ? null : v, value: null }); drawAll(); },
    }));
    subHost.textContent = lensSubtitle(state.lens, state.mode) +
      (state.mode === 'facts' ? ' Facts only: the interpretive layers (3 and 4) are hidden.' : '');
    fill(legendHost, buildLegend(c.provisions, state.lens, domains, {
      picked: state.picked, codebookText, mode: state.mode,
      onPick: (v) => { state.picked = v; setParams({ value: v ?? null }); drawAll(); },
    }));
  }

  function drawStrip() {
    const strip = renderStrip(c, {
      lens: state.lens, domains, mode: state.mode, byLength: state.byLength,
      picked: state.picked, selectedId: state.selected, onSelect: (p) => select(p),
    });
    const hadFocus = stripHost.contains(document.activeElement) ? document.activeElement.dataset.id : null;
    fill(stripHost, strip);
    if (hadFocus) strip.querySelector(`[data-id="${hadFocus}"]`)?.focus();
    attachReadout(strip, readout, state.lens, 'Point at a cell, or use the arrow keys, to identify a provision. Select it to read both texts.', state.mode);
    fig.classList.toggle('deps-on', state.deps);
    drawMarks();
    drawPin();
    requestAnimationFrame(drawArcs);
  }

  // The pin shows only while a panel is open and the full strip has scrolled out of view under the banner.
  function placePin() {
    const bannerH = document.querySelector('.banner')?.offsetHeight || 0;
    const show = Boolean(state.selected) && stripHost.getBoundingClientRect().bottom < bannerH + 4;
    if (pin.hidden === show) pin.hidden = !show;
  }
  function drawPin() {
    const p = state.selected && c.byId.get(state.selected);
    if (!p) { pin.hidden = true; clear(pinStripHost); return; }
    fill(pinLabel, h('code', {}, p.short), h('span.pin-cite', {}, `§ ${p.citation}`),
      h('span.pin-pos', {}, `${p.index + 1} of ${c.provisions.length}`));
    pinPrev.disabled = p.index === 0;
    pinNext.disabled = p.index === c.provisions.length - 1;
    fill(pinStripHost, renderStrip(c, {
      lens: state.lens, domains, mode: state.mode, picked: state.picked, selectedId: state.selected,
      onSelect: (x) => select(x), labels: false, thin: true,
    }));
    placePin();
  }
  let pinFrame = 0;
  const schedulePin = () => { if (!pinFrame) pinFrame = requestAnimationFrame(() => { pinFrame = 0; placePin(); }); };
  window.addEventListener('scroll', schedulePin, { passive: true });
  window.addEventListener('resize', schedulePin);

  function drawMarks() {
    const cts = c.counts;
    fill(marksLegend, 
      cts.hasDenominatorFlag
        ? h('li', {}, h('span.mk.mk-comp'), `Component: completes its parent, outside the denominator (${fmt(cts.components)})`)
        : h('li', {}, h('span.mk.mk-unknown'), 'Component flag: ', notCoded(null, { inline: true })),
      h('li', {}, h('span.mk.mk-inh'), `Inherited: reprinted from earlier law (${fmt(cts.inherited)})`),
      state.mode !== 'facts'
        ? h('li', {}, h('span.mk.mk-hidden'), `Hidden change: looks intact, but something it depends on was changed (${fmt(cts.hiddenChange)})`)
        : null);
    clear(depNote);
    if (state.deps) {
      depNote.textContent = cts.dependencyLinks
        ? `${fmt(cts.dependencyLinks)} dependency links are recorded. Arcs run from a provision to what it depends on. Select a provision to isolate its links (solid: depends on; dashed: depended on by).`
        : 'No dependency links are recorded for this case.';
    }
  }

  function drawArcs() {
    while (arcs.firstChild) arcs.firstChild.remove();
    if (!state.deps) return;
    const wrap = arcs.parentElement.getBoundingClientRect();
    arcs.setAttribute('width', wrap.width); arcs.setAttribute('height', wrap.height);
    arcs.setAttribute('viewBox', `0 0 ${wrap.width} ${wrap.height}`);
    const pos = new Map();
    for (const el of stripHost.querySelectorAll('.cell')) {
      const r = el.getBoundingClientRect();
      pos.set(el.dataset.id, { x: r.left + r.width / 2 - wrap.left, y: r.top - wrap.top - 3 });
    }
    const sel = state.selected;
    const add = (fromId, toId, cls) => {
      const a = pos.get(fromId), z = pos.get(toId);
      if (!a || !z) return;
      const lift = Math.min(18 + Math.abs(a.x - z.x) * 0.22, a.y - 4, 110);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${a.x},${a.y} C${a.x},${a.y - lift} ${z.x},${z.y - lift} ${z.x},${z.y}`);
      path.setAttribute('class', `arc ${cls}`);
      arcs.append(path);
    };
    for (const p of c.provisions) for (const d of p.dependsOn) {
      if (sel && (p.id === sel || d === sel)) continue;
      add(p.id, d, sel ? 'arc-faint' : 'arc-all');
    }
    if (sel) {
      const p = c.byId.get(sel);
      for (const d of p.dependsOn) add(p.id, d, 'arc-on');
      for (const d of p.dependedOnBy) add(d, p.id, 'arc-by');
    }
  }
  window.addEventListener('resize', () => requestAnimationFrame(drawArcs));

  function drawSummary() {
    const cts = c.counts;
    const stat = (n, label, sub) => h('div.stat', {},
      h('div.stat-n', {}, n === null ? notCoded(null, { inline: true }) : fmt(n)),
      h('div.stat-label', {}, label), sub ? h('div.stat-sub', {}, sub) : null);
    const l1 = cts.l1Denominator;
    const breakdown = l1
      ? h('ul.breakdown', {}, ...domains.l1.filter((v) => cts.l1All.has(v)).map((v) => {
          const st = valueStyle('l1', v, domains);
          const inDen = l1.get(v) || 0, all = cts.l1All.get(v) || 0;
          return h('li', {}, h(`span.swatch.${st.cls}`, { style: st.style }),
            h('b', {}, `${fmt(inDen)} of ${fmt(cts.denominator)}`), ` ${valueLabel('l1', v)}`,
            all - inDen ? h('span.muted', {}, ` (plus ${fmt(all - inDen)} outside the denominator)`) : null);
        }))
      : notCoded('This file has no counts_in_denominator field, so the denominator rule cannot be applied. Layer 1 over all records is shown in the legend above, and is not a survival count.');
    fill(summaryHost, h('section.summary', { 'aria-label': 'Computed counts' },
      h('h2.section-label', {}, 'Counts for this case, computed from the file'),
      h('div.stats', {},
        stat(cts.records, 'records', 'cells on the strip'),
        stat(cts.provisions, 'provisions', 'separately survivable units'),
        stat(cts.components, 'components', 'complete a parent provision'),
        stat(cts.inherited, 'inherited', 'reprinted from earlier law'),
        h('div.stat.stat-key', {},
          h('div.stat-n', {}, cts.denominator === null ? notCoded(null, { inline: true }) : fmt(cts.denominator)),
          h('div.stat-label', {}, 'in the denominator'))),
      h('p.rule-line', {}, h('b', {}, 'Denominator rule: '), 'a record counts only if ',
        h('code', {}, 'counts_in_denominator == true'), ' and its provenance is ', h('code', {}, 'created'), ' or ', h('code', {}, 'amended'), '.'),
      h('h3.section-label', {}, 'What happened to the records in the denominator (Layer 1)'),
      breakdown,
      h('p.fig-status', {}, 'Model-coded, unaudited. Counts, not findings. No percentage is given because no person has audited the coding.')));
  }

  function drawPanel(focus) {
    clear(panelHost);
    const p = state.selected && c.byId.get(state.selected);
    if (!p) {
      panelHost.append(h('p.panel-idle', {}, 'Select a cell on the strip to open the voter-enacted text and the amending text side by side.'));
      return;
    }
    const panel = renderPanel(c, p, {
      mode: state.mode, domains, diffOn: state.diff, rawBreaks: state.rawBreaks, permalink,
      onSelect: (x) => select(x),
      onClose: () => { const id = state.selected; select(null, { focusPanel: false }); stripHost.querySelector(`[data-id="${id}"]`)?.focus(); },
      onToggleDiff: (v) => { state.diff = v; drawPanel(false); },
      onToggleBreaks: (v) => { state.rawBreaks = v; setParams({ br: v ? '1' : null }); drawPanel(false); },
    });
    panelHost.append(panel);
    if (focus) {
      panel.querySelector('.panel-title').focus({ preventScroll: true });
      const r = panel.getBoundingClientRect();
      if (r.top < 96 || r.top > innerHeight * 0.6) panelHost.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function drawTable() {
    const interp = state.mode !== 'facts';
    const head = ['ID', 'Section', 'What happened', 'Type', ...(interp ? ['Direction', 'Mechanism'] : []), 'Provenance', 'Unit'];
    fill(tableHost, h('div.table-scroll', {}, h('table.table', {},
      h('thead', {}, h('tr', {}, ...head.map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, ...c.provisions.map((p) => h('tr', {},
        h('th', { scope: 'row' }, h('a', { href: permalink(p), onclick: (e) => { e.preventDefault(); select(p); } }, h('code', {}, p.short))),
        h('td', {}, p.citation), h('td', {}, p.l1), h('td', {}, p.l2),
        ...(interp ? [h('td', {}, valueLabel('l3', p.l3)), h('td', {}, valueLabel('l4', p.l4))] : []),
        h('td', {}, p.provenance),
        h('td', {}, p.isComponent === null ? notCoded(null, { inline: true }) : p.isComponent ? 'component' : 'provision')))))));
  }

  function drawAll() { drawLens(); drawStrip(); drawSummary(); drawPanel(false); drawTable(); }

  onMode((mode) => {
    state.mode = mode;
    const lens = validLens(state.lens, mode);
    if (lens !== state.lens) { state.lens = lens; state.picked = undefined; setParams({ lens: null, value: null }); }
    // A pick on the direction hue means nothing once the hue is hidden.
    if (mode === 'facts' && String(state.picked).startsWith('l3:')) { state.picked = undefined; setParams({ value: null }); }
    drawAll();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.selected) {
      const id = state.selected; select(null, { focusPanel: false });
      stripHost.querySelector(`[data-id="${id}"]`)?.focus();
    }
  });

  drawAll();
  if (state.selected) requestAnimationFrame(() => panelHost.scrollIntoView({ block: 'center' }));
}
