// util.js — tiny DOM and URL-state helpers. No data knowledge here.

/** h('div.cls#id', {attrs}, ...children). Strings become text nodes (never HTML). */
export function h(spec, attrs, ...children) {
  const [tagAndId, ...classes] = spec.split('.');
  const [tag, id] = tagAndId.split('#');
  const el = document.createElement(tag || 'div');
  if (id) el.id = id;
  if (classes.length) el.className = classes.join(' ');
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
    children.unshift(attrs);
    attrs = null;
  }
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className += (el.className ? ' ' : '') + v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export const clear = (el) => { el.replaceChildren(); return el; };

export const params = () => new URLSearchParams(location.search);

/** Update query params in place (no navigation). Null or default values are removed. */
export function setParams(obj) {
  const p = params();
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === '' || v === false) p.delete(k);
    else p.set(k, v);
  }
  const qs = p.toString();
  history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
}

export function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const fmt = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('en-US'));

/** The standard honest empty state. Always says "Not coded yet". */
export function notCoded(needs, { inline = false } = {}) {
  if (inline) return h('span.not-coded', {}, 'Not coded yet');
  return h('div.empty', {},
    h('p.empty-title', {}, 'Not coded yet'),
    needs ? h('p.empty-needs', {}, needs) : null);
}

export function routeBadge(route, { long = false } = {}) {
  if (!route) return h('span.badge', {}, 'Route unknown');
  const by = route === 'A' ? 'enacted by voters' : 'enacted by the legislature';
  return h(`span.badge.route-${route}`, { title: `Route ${route}: ${by}` },
    h('span.badge-key', {}, `Route ${route}`), long ? h('span.badge-by', {}, by) : null);
}

export function statusBadge(entry) {
  return entry.coded
    ? h('span.status.status-coded', {}, 'Model-coded, unaudited')
    : h('span.not-coded', {}, 'Not coded yet');
}

/** A figure frame: rule, title, subtitle, body, footer with the data status. */
export function figure({ id, title, subtitle, controls, body, source, note, downloads }) {
  return h('figure.fig', { id },
    h('header.fig-head', {},
      h('h2.fig-title', {}, title),
      subtitle ? h('p.fig-sub', {}, subtitle) : null),
    controls ? h('div.fig-controls', {}, controls) : null,
    h('div.fig-body', {}, body),
    h('figcaption.fig-foot', {},
      h('p', {}, h('b', {}, 'Data: '), source || 'model-coded records in this repository.', ' ',
        h('span.fig-status', {}, 'Model-coded, unaudited.')),
      note ? h('p', {}, h('b', {}, 'Note: '), note) : null,
      downloads ? h('div.fig-dl', {}, downloads) : null));
}

export function segmented({ label, options, value, onChange, name }) {
  const group = h('div.seg', { role: 'group', 'aria-label': label });
  for (const o of options) {
    group.append(h('button.seg-btn', {
      type: 'button', 'aria-pressed': String(o.value === value), dataset: { value: o.value },
      title: o.title, name,
      onclick: () => {
        for (const b of group.children) b.setAttribute('aria-pressed', String(b.dataset.value === o.value));
        onChange(o.value);
      },
    }, o.label));
  }
  return h('div.control', {}, h('span.control-label', {}, label), group);
}
