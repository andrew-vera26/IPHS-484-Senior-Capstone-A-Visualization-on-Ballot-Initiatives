// data.js — the ONLY file that knows file paths or raw field names.
//
// Everything else in the site consumes the normalized shapes built here
// (see docs/design/DESIGN.md, "The data.js boundary", and
// docs/design/data-contract.md for the raw fields).
//
// When the schema moves to four linked tables (initiative, bill, provision,
// outcome), rewrite loadCorpus() to join them into the same Case / Provision
// shapes and nothing else should need to change.
//
// Read-only. Nothing here writes anywhere.

const SEED_URL = new URL('../data/corpus-seed.json', import.meta.url);
const REPO_ROOT = new URL('../../', import.meta.url);
const CODEBOOK_URL = new URL('spec/codebook.md', REPO_ROOT);

export const CUTOFF = 'December 31, 2025';

export const ROUTES = {
  A: { key: 'A', label: 'Route A', by: 'Enacted by voters',
       plain: 'Voters passed the initiative. The legislature then altered it.' },
  B: { key: 'B', label: 'Route B', by: 'Enacted by the legislature',
       plain: 'The legislature adopted the initiative itself, which kept it off the ballot, and then altered it. Voters never voted on it.' },
};

export const STATUS = {
  coded_model_unaudited: { coded: true, label: 'Model-coded, unaudited' },
  candidate_unverified: { coded: false, label: 'Not coded yet' },
};

const routeOf = (enactedBy) => (enactedBy === 'legislature' ? 'B' : enactedBy === 'voters' ? 'A' : null);

// "290.502(1)" -> "290.502"; "12-27-8" -> "12-27"; "(uncodified …)" stays whole.
function sectionOf(citation) {
  if (!citation) return '';
  const c = citation.trim();
  if (c.startsWith('(')) return c;
  const head = c.split('(')[0].trim();
  const m = head.match(/^(\d+-\d+)-/);
  return m ? m[1] : head;
}

const spanFilled = (s) => Array.isArray(s) && s.some((v) => v !== null && v !== undefined);

function normalizeProvision(r, index, caseId) {
  const hasFlag = Object.prototype.hasOwnProperty.call(r, 'counts_in_denominator');
  const flag = hasFlag ? r.counts_in_denominator : null;
  const sweep = r.exemption_sweep || {};
  // v0.2 puts these at the top level; the older SD file nests them in exemption_sweep.
  const depAffected = r.dependency_affected !== undefined ? r.dependency_affected : sweep.dependency_affected;
  const depSources = r.dependency_source_ids !== undefined ? r.dependency_source_ids : sweep.dependency_source_ids;
  const inDen = flag === null ? null : flag === true && (r.provenance === 'created' || r.provenance === 'amended');
  const meta = r.layer_9_coding_metadata || {};
  const evidence = {
    drivingSpan: r.layer_3_driving_span,
    baseSpan: r.base_witness?.span,
    compSpan: r.comparison_witness?.span,
  };
  evidence.any = spanFilled(evidence.drivingSpan) || spanFilled(evidence.baseSpan) || spanFilled(evidence.compSpan);
  return {
    id: r.spine_id,
    short: r.spine_id.split('-').pop(),
    caseId,
    index,
    citation: r.base_witness?.citation ?? '',
    section: sectionOf(r.base_witness?.citation),
    baseText: r.base_witness?.text ?? null,
    compText: r.comparison_witness?.text ?? null,
    compCitation: r.comparison_witness?.citation ?? null,
    witnessId: r.comparison_witness?.witness_id ?? null,
    l1: r.layer_1_structural_operation ?? null,
    l2: r.layer_2_provision_type ?? null,
    l3: r.layer_3_directional_effect ?? null,
    l4: r.layer_4_mechanism ?? null,
    l4Applies: r.layer_4_applies ?? null,
    rationale: r.layer_3_rationale ?? null,
    provenance: r.provenance ?? null,
    provenanceBasis: r.provenance_basis ?? null,
    hasDenominatorFlag: hasFlag,
    isComponent: flag === null ? null : flag === false,
    parentId: r.parent_spine_id ?? null,
    inDenominator: inDen,
    dependsOn: r.depends_on || [],
    dependedOnBy: r.depended_on_by || [],
    dependencyAffected: depAffected === true,
    dependencySources: depSources || [],
    evidence,
    gapFlag: r.layer_5_description?.description_effect_gap ?? null,
    alteredBeforeEffect: r.layer_6_temporal_procedural?.altered_before_provision_took_effect ?? null,
    meta: {
      codedBy: meta.coded_by ?? null,
      confidence: meta.confidence ?? null,
      flagged: meta.flagged_for_review ?? null,
      adjudicated: meta.adjudicated ?? null,
      agreement: meta.human_model_agreement ?? null,
    },
  };
}

function tally(list, fn) {
  const m = new Map();
  for (const x of list) {
    const k = fn(x);
    m.set(k, (m.get(k) || 0) + 1);
  }
  return m;
}

function computeCounts(provisions) {
  const hasFlag = provisions.length > 0 && provisions.every((p) => p.hasDenominatorFlag);
  const den = hasFlag ? provisions.filter((p) => p.inDenominator) : null;
  return {
    records: provisions.length,
    hasDenominatorFlag: hasFlag,
    provisions: hasFlag ? provisions.filter((p) => p.isComponent === false).length : null,
    components: hasFlag ? provisions.filter((p) => p.isComponent === true).length : null,
    denominator: hasFlag ? den.length : null,
    inherited: provisions.filter((p) => p.provenance === 'inherited').length,
    provenance: tally(provisions, (p) => p.provenance),
    l1All: tally(provisions, (p) => p.l1),
    l1Denominator: hasFlag ? tally(den, (p) => p.l1) : null,
    dependencyLinks: provisions.reduce((n, p) => n + p.dependsOn.length, 0),
    hiddenChange: provisions.filter((p) => p.dependencyAffected).length,
    evidenceSpans: provisions.filter((p) => p.evidence.any).length,
    gapFlags: provisions.filter((p) => p.gapFlag === true).length,
    alteredBeforeEffect: provisions.filter((p) => p.alteredBeforeEffect === true).length,
    codedBy: tally(provisions, (p) => p.meta.codedBy),
    confidence: tally(provisions, (p) => p.meta.confidence),
    flagged: provisions.filter((p) => p.meta.flagged === true).length,
    adjudicated: provisions.filter((p) => p.meta.adjudicated === true).length,
    agreement: tally(provisions, (p) => p.meta.agreement),
  };
}

function buildCase(seedRow, raw) {
  const provisions = raw.map((r, i) => normalizeProvision(r, i, seedRow.measure_id));
  const first = raw[0] || {};
  const l5 = first.layer_5_description || {};
  const l6 = first.layer_6_temporal_procedural || {};
  const l7 = first.layer_7_measure_context || {};
  const l8 = first.layer_8_subsequent_fate || {};
  const witnessId = first.comparison_witness?.witness_id ?? null;
  return {
    ...seedCase(seedRow),
    coded: true,
    provisions,
    byId: new Map(provisions.map((p) => [p.id, p])),
    counts: computeCounts(provisions),
    bill: {
      id: witnessId,
      // "MO-2025-HB567" -> "HB567". Display name only; the seed carries the full instrument text.
      short: witnessId ? witnessId.split('-').slice(2).join('-') : null,
      statedRationale: l5.stated_rationale ?? null,
      rationaleSource: l5.rationale_source ?? null,
      daysToIntroduction: l6.days_enactment_to_introduction ?? null,
      daysToEffective: l6.days_enactment_to_alteration_effective ?? null,
      sequence: l6.alteration_sequence_number ?? null,
      passageUpper: l6.passage_margin_upper ?? null,
      passageLower: l6.passage_margin_lower ?? null,
      executiveAction: l6.executive_action ?? null,
      emergencyClause: l6.emergency_clause ?? null,
      standaloneOrOmnibus: l6.standalone_or_omnibus ?? null,
      adoptAndAmend: l6.adopt_and_amend ?? null,
      committee: l6.committee_of_origin ?? null,
    },
    context: {
      topic: l7.topic ?? null,
      voteMargin: l7.vote_margin ?? null,
      ballotPath: l7.initiative_route ?? null, // direct / indirect: the path TO the ballot, not Route A/B
      ruleRegime: l7.state_rule_regime ?? null,
    },
    fate: {
      litigated: l8.litigated ?? null,
      alteredAgainLater: l8.altered_again_later_session ?? null,
      reInitiated: l8.re_initiated_by_campaign ?? null,
    },
  };
}

function seedCase(row) {
  const status = STATUS[row.status] || { coded: false, label: 'Not coded yet' };
  return {
    id: row.measure_id || null,
    title: row.title,
    state: row.state,
    year: row.year,
    enactedBy: row.enacted_by,
    route: routeOf(row.enacted_by),
    statusKey: row.status,
    statusLabel: status.label,
    coded: false,
    instrument: row.altering_instrument || null,
    link: row.link || null,
    sourceNote: row.source_note || null,
    codedFile: row.coded_file || null,
  };
}

let corpusPromise = null;

/** Load the seed and every coded case. Cached for the page's lifetime. */
export function loadCorpus() {
  if (!corpusPromise) corpusPromise = load();
  return corpusPromise;
}

async function load() {
  const seedJson = await (await fetch(SEED_URL)).json();
  const rows = seedJson.rows;
  const entries = await Promise.all(rows.map(async (row) => {
    const status = STATUS[row.status];
    if (!status?.coded || !row.coded_file) return seedCase(row);
    try {
      const res = await fetch(new URL(row.coded_file, REPO_ROOT));
      if (!res.ok) throw new Error(`${res.status} ${row.coded_file}`);
      return buildCase(row, await res.json());
    } catch (err) {
      console.error('Could not load coded file', err);
      return { ...seedCase(row), loadError: String(err) };
    }
  }));
  const cases = entries.filter((e) => e.coded);
  const corpus = {
    entries,            // every seed row, coded or not, in seed order
    cases,              // coded cases only
    caseById: new Map(cases.map((c) => [c.id, c])),
    byRoute: (route) => entries.filter((e) => e.route === route),
    codedByRoute: (route) => cases.filter((c) => c.route === route),
  };
  // For checking against site-prototype/check_data.py from the console.
  window.__WS_COUNTS__ = Object.fromEntries(cases.map((c) => [c.id, plainCounts(c.counts)]));
  return corpus;
}

function plainCounts(counts) {
  const out = {};
  for (const [k, v] of Object.entries(counts)) out[k] = v instanceof Map ? Object.fromEntries(v) : v;
  return out;
}

/** The codebook text, used only to mark whether an observed value appears in it. */
export async function loadCodebookText() {
  try {
    const res = await fetch(CODEBOOK_URL);
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

/** Flat rows for CSV / JSON export of provisions. */
export function exportRows(provisions, { includeInterpretation = true } = {}) {
  return provisions.map((p) => {
    const row = {
      spine_id: p.id,
      citation: p.citation,
      layer_1_structural_operation: p.l1,
      layer_2_provision_type: p.l2,
    };
    if (includeInterpretation) {
      row.layer_3_directional_effect = p.l3;
      row.layer_4_mechanism = p.l4;
      row.dependency_affected = p.dependencyAffected;
    }
    Object.assign(row, {
      provenance: p.provenance,
      counts_in_denominator: p.hasDenominatorFlag ? !p.isComponent : null,
      in_denominator: p.inDenominator,
      parent_spine_id: p.parentId,
      depends_on: p.dependsOn.join(' '),
      depended_on_by: p.dependedOnBy.join(' '),
      coded_by: p.meta.codedBy,
      base_witness_text: p.baseText,
      comparison_witness_text: p.compText,
    });
    return row;
  });
}
