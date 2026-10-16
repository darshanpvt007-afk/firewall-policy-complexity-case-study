# Viva Preparation Notes

**How to use.** Each member leads one section but must be able to answer the "everyone" questions. Answers below are **prompts, not scripts**: say them in your own words, and point to the file or table that supports you. Where an answer depends on results, say what was observed, or say plainly that it is pending.

Golden rules:

- Never state a planned value as a result. Say "we expected…, we observed…".
- If you don't know, say which document or test would answer it.
- Every number should have a source: the analysis script, `show access-lists`, or `results.csv`.

---

## Everyone

| Likely question | Points to cover |
|---|---|
| What is your research question? | Broad → department-level → service-level least privilege; effect on (a) unnecessary flows allowed, (b) size, specificity, rule-order dependence; compare with literature (B1). |
| What is the independent variable? | The policy **stage** as a bundle (internal ACL, edge ACL, management rules all change together, Table 5), so we don't attribute effects to granularity alone. |
| What did you hold constant? | Topology, addressing, routing, services, R/X requirements, the 7 enforcement points, the same 17 tests and methods (B1). |
| Why Stage 0? | Positive control: every test must succeed with no ACLs, so a later denial is due to the policy, not routing or a stopped service. |
| What can't your experiment show? | Administrator error rates; identity-aware access (not Zero Trust); real attack traffic; real IOS behaviour beyond what PT models; anything about the 9 tests not run (Part C). |

## P1 — Network build lead (B4–B6)

| Question | Points |
|---|---|
| Why router-on-a-stick and not a multilayer switch? | Full extended ACL and VTY access-class support in PT on the 2911; all internal policy on one device makes rules easy to count. Cost: single point of failure. |
| Why 192.168.x.0/24 per VLAN? | All internal subnets inside 192.168.0.0/16, so one entry can match "any internal destination"; the address plan directly affects rule count. |
| Why 203.0.113.0/24 outside? | RFC 5737 documentation range [18]; no real public addresses. |
| Why two PCs per VLAN? | To test same-VLAN traffic (T18, U1), which never reaches the router. |
| Where are the ACLs applied, and which direction? | AP1 R-EDGE G0/1 in; AP2–AP5 R-CORE G0/0.10–.40 in; AP6–AP7 VTY access-class on both routers. Inbound on user subinterfaces, so server replies aren't filtered. |
| What happened in Stage 0 / the pilot? | **Your observations** from `results/stage0/` and the decisions log (P3, P7, P8). |

## P2 — Test and evidence lead (B7, B9)

| Question | Points |
|---|---|
| How do you know a flow was denied, not just broken? | Client failure **plus** a rising deny counter or a Simulation Mode drop; and the same test passed in Stage 0. |
| What does leakage mean exactly? | Forbidden tests observed to succeed ÷ forbidden tests executed. Not-run tests excluded. Only describes the tests run (`metrics-spec.md` §2). |
| Why 17 of 26 tests? | Time; team decision logged 2026-10-08. Consequences: Sales exposure not measured; R5, X6, X7 only partly covered (coverage-matrix §2). |
| Why is a forbidden flow that succeeds in Stage 1 marked "fail"? | Status is judged against the security policy; "matches stage prediction" is a separate column. |
| FTP: why does T04 need `get`? | The data connection is separate from port 21; a login alone doesn't show the service works through the ACL (P7). |
| What did you actually observe? | **Your results** from `results.csv`, with evidence files. |

## P3 — Literature lead (Part A)

| Question | Points |
|---|---|
| Main themes? | Perimeter filtering; anomalies (shadowing etc.); growth and misconfiguration; least privilege / microsegmentation / ZT; management approaches. |
| Where do sources agree / disagree? | Agree: misconfiguration common, order causes conflicts, location-based trust weak. Disagree: whether finer policy lowers net risk once complexity counted; how far tooling helps. |
| Define shadowing vs redundancy. | Shadowed: earlier entry with opposite action covers all its packets, so it never takes effect. Redundant: earlier entry with same action covers it; removing it changes nothing [9], [10]. |
| Main gaps? | Dated empirical data [1], [2]; excessive permission rarely measured against requirements; security and cost rarely measured together; tool usability under-evaluated [13]. |
| Is your Stage 3 Zero Trust? | No. ACLs decide on addresses and ports, not identity or device state [4]. It is a network-layer approximation of least privilege. |

## P4 — Citation and standards verifier (references, Appendix B)

| Question | Points |
|---|---|
| How did you verify references? | Metadata checked online; full text read by the citing member (Appendix B last column). Say who read what. |
| Peer-reviewed vs grey literature? | Count from Appendix B; government guidance used only as context and labelled. |
| Is Stage 1 BCP 38 ingress filtering? | No. It only checks the source is inside 192.168.0.0/16. RFC 2827 [7] validates source addresses per arriving network; we don't claim to implement it. |
| What does NIST SP 800-41 require? | Explicit inbound and outbound policy; allow only needed protocols; deny everything else; keep the policy updated [3]. |

## P5 — Integration editor and QC (B1–B3, B8, Part C)

| Question | Points |
|---|---|
| How did you count ACL entries? | Permit/deny lines in bound ACLs, including VTY ACLs and explicit final deny; not remarks or implicit deny. Two totals: per definition and per enforcement point (`metrics-spec.md` §1). |
| What is an order-dependent pair? | Two entries in one ACL, opposite actions, at least one packet matches both; swapping changes the outcome. Terminal deny excluded. |
| Why does the edge ACL shrink in Stage 3 although it's stricter? | Four broad return-traffic entries replaced by two narrow ones (established from port 80/443 only). Shows entry count ≠ restrictiveness. |
| How were the planned counts produced? | `tools/acl_analysis.py` on the scripts; measured counts recomputed from saved running configs with `--running`. |
| Is a zero-hit entry redundant? | Not necessarily: our tests don't exercise every flow an entry exists for. |
| M1 and M2: what do they show? | M1: an appended deny after a broad permit never matches (shadowed). M2: removing the DNS permit breaks name-based access while IP access works, a hidden dependency. Both need P5 or the fallback. **State whether they were run.** |
