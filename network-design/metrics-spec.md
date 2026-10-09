# Metric Specification

**Status:** `[PROPOSED DESIGN]`, fixed before any results are entered.

Two kinds of value appear in this project. Keep them apart:

| Kind | Source | Label in the report |
|---|---|---|
| **Configuration-derived** | Computed from configuration text with `tools/acl_analysis.py` (planned scripts now; saved running configurations later) | "derived from configuration" |
| **Observed** | Seen in our own Packet Tracer runs, with evidence | "observed" |

Nothing below is an observed result.

## 1. Explicit ACL-entry count (policy size)

**Counted:**

- every `permit` and `deny` line in every ACL that is bound to an enforcement point;
- extended and standard ACLs, including the VTY access-class ACLs;
- the explicit terminal `deny ip any any` lines.

**Not counted:**

- `remark` lines;
- the implicit deny at the end of each ACL;
- ACLs that are defined but not bound;
- entries added only for the misconfiguration experiments, which are reported separately.

**Two totals are reported:**

| Total | Counts | When it differs |
|---|---|---|
| **Per definition** (primary) | Each ACL once per router | The ACL-VTY name exists on both routers, so it counts twice |
| **Per enforcement point** | An ACL bound at several points counts once at each point | Only Stage 1, where ACL-USERS-IN is bound at AP2–AP5 |

**Configuration-derived values** (planned scripts, `tools/acl_analysis.py`):

| Stage | Per definition | Per enforcement point | Edge ACL (AP1) |
|---|---|---|---|
| 1 | 11 | 17 | 7 |
| 2 | 26 | 26 | 7 |
| 3 | 40 | 40 | 5 |

Stage 3 becomes 41 only if pilot P7 leads to a logged decision to add an FTP data-channel entry. **Measured values** must be re-derived from the saved running configurations (`--running`), not copied from this table.

**Why the edge ACL shrinks (configuration-derived).** In Stage 3 the four broad return-traffic entries (`established` from any port, plus three ICMP reply types) are replaced by two narrower ones (`established` from source port 80 or 443 only). The ACL gets shorter while admitting less. This is why entry count alone is not a measure of restrictiveness.

## 2. Forbidden-flow leakage (unnecessary access)

**Leakage =** forbidden test cases **observed** to succeed ÷ forbidden test cases **actually executed**.

- A test that was not run is excluded from both numerator and denominator. It is never counted as blocked.
- A forbidden test counts as "succeeded" only with evidence that the flow reached its target: for example a page loaded, a login prompt appeared, or ping replies came back.
- Report the numerator and denominator separately for every stage, for example "4 of 8". A percentage may be added only if the denominator is the same across stages.
- Wording: "measured leakage over the tested forbidden cases". It is **not** a percentage of all possible unauthorised flows.

**Planned expectation (not a result):** 7 of 8 → 4 of 8 → 0 of 8 for the 8 selected forbidden test cases.

## 3. Required-flow success

**Required success =** required test cases **observed** to succeed ÷ required test cases **actually executed**.

- Tests not run stay "not run".
- Where the evidence allows it, record whether a failure was a **service or setup fault** (also seen in Stage 0, or no service running) or a **policy denial** (deny counter rising, or Simulation Mode drop at an ACL).

## 4. Policy specificity (rubric fixed in advance)

Each explicit entry scores one point for each field it constrains (0–4):

| Field | Scores 1 when |
|---|---|
| Source | Not `any` |
| Destination | Not `any` |
| Protocol | Not `ip` |
| Service | A destination or source port, or an ICMP type, is specified |

`established` does not score; its weakness is discussed separately.

**What is reported:** the distribution of scores over **permit** entries only, because permits define what is reachable. No single averaged "specificity score" is used for conclusions; the distribution is shown with concrete example entries.

**Configuration-derived distributions** (number of permit entries scoring 0/1/2/3/4):

| Stage | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| 1 | 0 | 3 | 1 | 5 | 0 |
| 2 | 0 | 6 | 6 | 5 | 0 |
| 3 | 0 | 2 | 0 | 12 | 17 |

## 5. Rule-order relations

All of these are judged within one ACL, between an earlier entry *i* and a later entry *j*.

| Term | Definition | How it is established |
|---|---|---|
| **Order-dependent pair** | *i* and *j* have **opposite actions** and their match sets **overlap**: at least one packet matches both. Swapping them changes the decision for the overlapping packets. The terminal `deny ip any any` is excluded, because every permit overlaps it trivially. | From configuration (`--detail` lists every pair, with sequence numbers) |
| **Shadowed entry** | An earlier entry with the **opposite** action matches **every** packet that *j* matches, so *j* can never take effect. | From configuration |
| **Redundant entry** | An earlier entry with the **same** action matches every packet *j* matches, so removing *j* changes nothing. | From configuration |
| **Overlapping but effective** | Part of an order-dependent pair, but not shadowed: *j* still decides some packets. | From configuration |
| **Zero-hit entry** | Its counter is 0 after a test run. | Observed (`show access-lists`) |

**Important:** a zero-hit entry is **not** automatically redundant or shadowed. The 17 test cases do not exercise every flow that an entry exists for.

**Configuration-derived counts:**

| Stage | Order-dependent pairs | Shadowed | Redundant |
|---|---|---|---|
| 1 | 0 | 0 | 0 |
| 2 | 9 | 0 | 0 |
| 3 | 24 | 0 | 0 |
| M1 after the append (M1-a) | 13 | 1 (the appended deny, shadowed by seq 10) | 0 |
| M1 after the fix (M1-c) | 11 | 0 | 0 |

**Examples (Stage 3, ACL-HR-IN):**

- 40 `permit tcp HR host 192.168.50.30 eq 443` ↔ 50 `deny ip HR 192.168.0.0/16`. They overlap on HR → HR-SRV:443. If swapped, HR loses its required access (R3).
- 50 `deny ip HR 192.168.0.0/16` ↔ 70 `permit tcp HR any eq 443`. They overlap on HR → internal hosts on port 443. If swapped, HR gains HTTPS to every internal host, including HR-SRV, which is correct for HR, but the same swap in ACL-SAL-IN would expose HR-SRV to Sales (X2).

## 6. Administrative-error risk

The tests measure reachability, policy size, specificity and rule-order relations. They do **not** measure how often administrators make mistakes. Literature claims that complexity is associated with errors [2] are used as motivation and for comparison. They are never presented as something this experiment proves.

## 7. Configuration lines changed

- **Files compared:** saved `show running-config` outputs of consecutive stages, per router (`configs/stageN/<router>.running.txt`).
- **Normalisation:** drop `!` lines, blank lines, the "Building configuration" and "Current configuration" headers, `end`, `version` and timestamp lines.
- **Counting:** a line-level diff (`tools/acl_analysis.py --diff A B`). Additions and deletions are counted separately; a modified line counts as one deletion plus one addition. Lines repeated in several places are each counted.
- **Not used:** manual estimates.

## 8. Evidence rule for every observed value

Each observed value must point to a file in `packet-tracer/results/` or a figure in `figures/`. A value without evidence is recorded as "not verified".
