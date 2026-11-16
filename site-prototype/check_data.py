#!/usr/bin/env python3
"""Print the counts the site should show. Run from the repo root:

    python3 site-prototype/check_data.py

Reads the coded files in place (read-only). The site computes the same
numbers in js/data.js; compare this output with the summary band on each
case page and with window.__WS_COUNTS__ in the browser console.
"""
import json, collections, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
seed = json.loads((ROOT / "site-prototype/data/corpus-seed.json").read_text())["rows"]
ROUTE = {"voters": "A", "legislature": "B"}
ok = True

def expect(label, got, want):
    global ok
    flag = "ok " if got == want else "MISMATCH"
    if got != want:
        ok = False
    print(f"  [{flag}] {label}: {got} (expected {want})")

print("== Corpus seed ==")
for route in ("A", "B"):
    rows = [r for r in seed if ROUTE[r["enacted_by"]] == route]
    coded = [r for r in rows if r["status"] == "coded_model_unaudited"]
    print(f"Route {route}: {len(rows)} listed, {len(coded)} coded, {len(rows)-len(coded)} not coded yet")

for row in seed:
    if not row["coded_file"]:
        continue
    recs = json.loads((ROOT / row["coded_file"]).read_text())
    c = collections.Counter
    print(f"\n== {row['title']} ({row['measure_id']}), Route {ROUTE[row['enacted_by']]} ==")
    print("records:", len(recs))
    print("coded_by:", dict(c(r["layer_9_coding_metadata"]["coded_by"] for r in recs)))
    has_flag = all("counts_in_denominator" in r for r in recs)
    print("has counts_in_denominator field:", has_flag)
    if has_flag:
        prov = [r for r in recs if r["counts_in_denominator"] is True]
        comp = [r for r in recs if r["counts_in_denominator"] is False]
        den = [r for r in prov if r["provenance"] in ("created", "amended")]
        print("provisions (counts_in_denominator true):", len(prov))
        print("components (counts_in_denominator false):", len(comp))
        print("denominator (flag true AND provenance created/amended):", len(den))
        print("layer 1 within denominator:", dict(c(r["layer_1_structural_operation"] for r in den)))
    else:
        den = None
        print("provisions / components / denominator: Not coded yet (field absent)")
    print("provenance:", dict(c(r["provenance"] for r in recs)))
    print("inherited:", sum(r["provenance"] == "inherited" for r in recs))
    for k in ("layer_1_structural_operation", "layer_2_provision_type",
              "layer_3_directional_effect", "layer_4_mechanism"):
        print(f"{k}:", dict(c(str(r[k]) for r in recs)))
    da = lambda r: r.get("dependency_affected", r.get("exemption_sweep", {}).get("dependency_affected"))
    print("dependency_affected true:", [r["spine_id"] for r in recs if da(r) is True])
    print("records with depends_on:", sum(bool(r["depends_on"]) for r in recs),
          "| links:", sum(len(r["depends_on"]) for r in recs))
    print("evidence spans filled:", sum(any(v is not None for v in r["layer_3_driving_span"]) for r in recs))
    print("description_effect_gap true:", sum(r["layer_5_description"]["description_effect_gap"] for r in recs))
    t = recs[0]["layer_6_temporal_procedural"]
    print("days to introduction / to alteration effective:",
          t["days_enactment_to_introduction"], "/", t["days_enactment_to_alteration_effective"])
    print("altered_before_provision_took_effect true:",
          sum(r["layer_6_temporal_procedural"]["altered_before_provision_took_effect"] for r in recs))

    if row["measure_id"] == "MO-2024-PropA":
        print(" checks from the brief:")
        expect("records", len(recs), 102)
        expect("counts_in_denominator true", len(prov), 70)
        expect("components", len(comp), 32)
        p3 = next(r for r in recs if r["spine_id"] == "MO-2024-PropA-p003")
        expect("p003 layer 1", p3["layer_1_structural_operation"], "partially deleted")
        expect("p003 layer 3", p3["layer_3_directional_effect"], "narrows")
        expect("p003 layer 4", p3["layer_4_mechanism"], "escalation removal")
        expect("p003 dependency_affected", p3["dependency_affected"], True)

print("\nALL CHECKS PASSED" if ok else "\nCHECKS FAILED")
sys.exit(0 if ok else 1)
