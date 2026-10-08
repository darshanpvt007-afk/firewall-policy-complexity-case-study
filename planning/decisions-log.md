# Decisions & Pilot Log

Record team decisions and Packet Tracer pilot findings here, newest entry at the bottom.

| Date | Type | Item | Decision or observation | Evidence | Recorded by |
|---|---|---|---|---|---|
| 2026-10-08 | TEAM DECISION | Architecture (Phase 0) | Approved with 15 conditions: one integrated project; refined RQ; 19-device topology subject to PT validation; VLANs 10–50 and 192.168.x.0/24 kept; **policy granularity is the experimental variable**; Stage 1 is a broad (not flat) policy; M1/M2 kept separate from stage results; pilot before the experiment; no fabrication | Team message in the Claude session, 2026-10-08 | Claude (on the team's instruction) |
| 2026-10-08 | TEAM DECISION | Refined RQ | "How does refining policy from perimeter-only, to department-level, to service-level least privilege change (a) the unnecessary flows the policy allows and (b) the policy's size, specificity and dependence on rule order, and how does this compare with the literature?" | same | Claude |
| 2026-10-08 | DESIGN CHANGE (for team review) | Stage 1 definition | Revised to a broad internal ACL applied at the **same 7 enforcement points** as Stages 2–3 (condition 6 and condition 5). The RQ wording "perimeter-only" now describes Stage 1 only loosely. The team may want to change it to "broad", e.g. "from broad, to department-level, to service-level least privilege". | network-design/acl-design.md §1, §3 | Claude |
| 2026-10-08 | DESIGN CHANGE (for team review) | VLAN 99 | Deferred: one subnet cannot sit on two router subinterfaces; not needed for the RQ | addressing-plan.md §1 | Claude |
| 2026-10-08 | DESIGN CHANGE (for team review) | M1 base | M1 runs on a copy of Stage 2, so the shadowing is a genuine one (an appended deny sitting under a broader permit) | acl-design.md §8 | Claude |
| 2026-10-08 | DESIGN CHANGE (for team review) | Tests | T19–T22 added: alternate router addresses and R-EDGE management, which test the need for VTY access-class | acl-design.md §7 | Claude |
| | TEAM DECISION | Packet Tracer version used by all members | | | |
| | TEAM DECISION | M3 (optional misordering experiment): run it or not | | | |
| | PILOT RESULT | P-CNT … P-SRVDEF (see packet-tracer/PILOT-PLAN.md) | | | |
