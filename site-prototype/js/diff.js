// diff.js — mechanical word-level comparison of two stored texts.
// It never changes a character: it only reports which whitespace-separated
// words are not part of the longest common subsequence.

const MAX_CELLS = 12_000_000;

function tokenize(text) {
  // Alternating [word, whitespace, word, …]; joining the tokens gives the text back exactly.
  return text.split(/(\s+)/).filter((t) => t !== '');
}

/** Returns { a: [{text, changed}], b: [...] } or null when the texts are too long to compare. */
export function wordDiff(textA, textB) {
  const ta = tokenize(textA), tb = tokenize(textB);
  const wa = [], wb = [];
  ta.forEach((t, i) => { if (!/^\s+$/.test(t)) wa.push(i); });
  tb.forEach((t, i) => { if (!/^\s+$/.test(t)) wb.push(i); });
  const n = wa.length, m = wb.length;
  if ((n + 1) * (m + 1) > MAX_CELLS) return null;
  const W = m + 1;
  const dp = new Uint16Array((n + 1) * W);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * W + j] = ta[wa[i]] === tb[wb[j]]
        ? dp[(i + 1) * W + j + 1] + 1
        : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
    }
  }
  const keepA = new Set(), keepB = new Set();
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (ta[wa[i]] === tb[wb[j]]) { keepA.add(wa[i]); keepB.add(wb[j]); i++; j++; }
    else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) i++;
    else j++;
  }
  const mark = (tokens, keep) => {
    const out = tokens.map((text, k) => ({ text, changed: !/^\s+$/.test(text) && !keep.has(k) }));
    // Join runs: whitespace between two differing words is highlighted with them.
    for (let k = 1; k < out.length - 1; k++) {
      if (/^[ \t]+$/.test(out[k].text) && out[k - 1].changed && out[k + 1].changed) out[k].changed = true;
    }
    return out;
  };
  return { a: mark(ta, keepA), b: mark(tb, keepB) };
}
