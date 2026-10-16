# Own-Words Rewrite Guide (Part A and Part C)

**Purpose.** The sections below rest most on reading the sources and on the team's own judgement. Each one should be rewritten by the member who has **read the full text** of its sources, in that member's own words. Do this after the full-text check in Appendix B, not before.

**How to use this list.**

1. Pick a row, open the sources it names, and read the parts that matter for the claim.
2. Close the draft. Write the paragraph from your own notes.
3. Compare with the draft only to make sure no claim was lost and no new claim was added without a source.
4. Tick the row and add your name. Record what you changed in the last column.

Paragraph references are to `report/case-study-draft-rev.md`.

## Part A

| # | Section / paragraph | Main claim(s) | Sources to read | Suggested owner | Rewritten by / notes |
|---|---|---|---|---|---|
| A1 | Abstract | Scope of the review; points of agreement and disagreement; three gaps; why we built the case study | Write this **last**, from your own §2–§4 | P3 + P5 | ☐ |
| A2 | §1 para 1 | Wool's studies: first quantitative study; complexity linked to risk items | [1], [2] | P3 | ☐ |
| A3 | §1 para 2 | Default deny; risk-based traffic list; no implicit trust from location; least privilege | [3], [4], [5] | P4 | ☐ |
| A4 | §1 para 3 | The trade-off this review examines (broad vs least privilege) | Own judgement; [2] | P3 | ☐ |
| A5 | §1 Method | How sources were found | `research/search-log.md` (must be filled in first) | P4 | ☐ |
| A6 | §2.1 | Firewall roles; NIST operational model; ingress filtering; Stage 1 is **not** BCP 38 | [3], [6], [7] | P4 | ☐ |
| A7 | §2.1 para 2 | Perimeter questioned; BeyondCorp | [8] | P3 | ☐ |
| A8 | §2.2 definitions | Four anomaly classes | [9], [10] (confirm the definitions; placeholder in draft) | P3 | ☐ |
| A9 | §2.2 para 3–4 | FIREMAN; firewall decision diagrams; audit vs design time | [11], [12] | P3 | ☐ |
| A10 | §2.3 | Misconfiguration common; complexity measure; usability survey; excessive permission not measured | [1], [2], [13] | P3 | ☐ |
| A11 | §2.4 | Saltzer–Schroeder principles; ZTA; microsegmentation guidance; ACLs are not Zero Trust | [4], [5], [14], [15], [16] | P4 | ☐ |
| A12 | §2.5 | Firmato; FIREMAN; FPA; FDDs; tooling not shown to reduce human error | [10]–[13], [17] | P3 | ☐ |
| A13 | §2.6 | Four gaps | Follows from your §2.1–§2.5 | P3 | ☐ |
| A14 | §3 Table 1 | One row per approach | All of §2 | P3 + P4 | ☐ |
| A15 | §3 questions (5 short paragraphs) | Our answers to five comparison questions | §2 sources; **our judgement** — contains a [TEAM CHECK] | whole team agrees, P3 writes | ☐ |
| A16 | §3 "Our interpretation" | Conditional position on least privilege | Our judgement — contains a [TEAM CHECK] | whole team agrees, P3 writes | ☐ |
| A17 | §4 Conclusion | Summary; future work | Your own §2–§3 | P5 | ☐ |

## Part C (rewrite only after results exist)

| # | Section | What to write | Based on | Suggested owner | Rewritten by / notes |
|---|---|---|---|---|---|
| C1 | C.1 and Table 11 | Replace "would agree" with agrees / differs / partly agrees, giving a reason for each | Observed results only; [2]–[5], [9]–[11], [15], [16] | P2 + P3 | ☐ |
| C2 | C.2 | What the simulation cannot capture | Our build experience; any surprises in the pilot | P1 | ☐ |
| C3 | C.3 | Simplifications and coverage limits | Final run scope; decisions log | P5 | ☐ |

## Part B text that must come from your own work

These are not rewrites. They are new text that only the team can write:

- B5: Stage 0 and pilot outcomes (P3, P7, P8), from `planning/decisions-log.md`.
- B9: measured values, and the discussion of E1–E4 from observed data.
- B10: figure captions describing what each screenshot actually shows.
