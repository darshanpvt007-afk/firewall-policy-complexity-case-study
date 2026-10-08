# Decisions & Pilot Log

Record team decisions and Packet Tracer pilot findings here, newest entry at the bottom.

| Date | Type | Item | Decision or observation | Evidence | Recorded by |
|---|---|---|---|---|---|
| 2026-10-08 | TEAM DECISION | Architecture (Phase 0) | Approved with 15 conditions: one integrated project; refined RQ; 19-device topology subject to PT validation; VLANs 10–50 and 192.168.x.0/24 kept; **policy granularity is the experimental variable** (refined below: the stages are compared as bundles); Stage 1 is a broad (not flat) policy; M1/M2 kept separate from stage results; pilot before the experiment; no fabrication | Team message in the Claude session, 2026-10-08 | Claude (on the team's instruction) |
| 2026-10-08 | TEAM DECISION (superseded below) | Refined RQ, original wording | "How does refining policy from perimeter-only, to department-level, to service-level least privilege change (a) the unnecessary flows the policy allows and (b) the policy's size, specificity and dependence on rule order, and how does this compare with the literature?" | same | Claude |
| 2026-10-08 | DESIGN CHANGE (accepted) | Stage 1 definition | Revised to a broad internal ACL applied at the **same 7 enforcement points** as Stages 2–3 (conditions 5 and 6). The RQ wording was updated accordingly (see the "RQ wording revised" entry below). | network-design/acl-design.md §1, §3 | Claude |
| 2026-10-08 | DESIGN CHANGE | VLAN 99 | Deferred: one subnet cannot sit on two router subinterfaces; not needed for the RQ | addressing-plan.md §1 | Claude |
| 2026-10-08 | DESIGN CHANGE | M1 base | M1 runs on a copy of **Stage 2** (consistent in every file), so the shadowing is a genuine one (an appended deny sitting under a broader permit) | acl-design.md §9 | Claude |
| 2026-10-08 | DESIGN CHANGE | Tests | T19–T22 added: alternate router addresses and R-EDGE management, which test the need for VTY access-class | acl-design.md §8 | Claude |
| 2026-10-08 | TEAM DECISION | RQ wording revised | Stage names are now **broad → department-level → service-level least privilege**. Short form: "How does refining policy from broad, to department-level, to service-level least privilege change (a) the unnecessary flows the policy allows and (b) the policy's size, specificity and dependence on rule order, and how does this compare with the literature?" Supersedes the "perimeter-only" wording above. **Approved; no further confirmation needed.** | Team instruction, 2026-10-08; ARCHITECTURE §2 | Claude |
| 2026-10-08 | TEAM DECISION | What is compared | The experiment compares three **policy stages**, each a bundle of refinements, **not granularity alone**. Conclusions are limited to the 26 test cases and the directions in acl-design §1.3. This refines condition 5 above. | acl-design §1 | Claude |
| 2026-10-08 | DESIGN CHANGE | Stage 0 positive control | Stage 0 runs all 26 tests with no ACLs, and every one must pass before the pilot | BUILD-GUIDE Step 3; test-matrix §3 | Claude |
| 2026-10-08 | DESIGN CHANGE | Sales exposure sweep | T23–T26 added so that Sales is tested against all 9 inventory services; exposure is reported for Sales only | acl-design §6.1 | Claude |
| 2026-10-08 | DESIGN CHANGE | Metric definitions | "Exposed service", "order-dependent pair" (opposite actions, overlapping matches, terminal deny excluded) and "ACL definitions vs distinct names" are defined. Stage 1 count corrected to 4 definitions / 3 names. | acl-design §6 | Claude |
| 2026-10-08 | TEAM DECISION | M3 | **Deferred.** It can be reinstated only by a later logged team decision, with its own written procedure. | acl-design §9 | Claude (on the team's instruction) |
| 2026-10-08 | DESIGN CHANGE | FTP data channel | **No data-port ACL entry** in advance. Under real IOS behaviour, Stage 3 would block the data connection in both active and passive mode (acl-design §5.1). Pilot P7 decides; any added entry, or the switch to HTTPS, is a team decision. | acl-design §5.1 | Claude |
| 2026-10-08 | TEAM DECISION | 17-test run subset for the draft | The full 26 test cases remain the designed set. The same 17 are run in Stage 0 and Stages 1–3: required T01, T03, T04, T05, T06, T14, T15, T17; forbidden T07, T08, T10, T11, T12, T13, T16, T19; control T18. T02, T09 and T20–T26 are marked not run. The Sales exposure metric is dropped for this draft. Zero-match entries are reported relative to the 17 test cases run. Conclusions are limited to the 17 test cases run. Pilot scope for the draft: P3, P7 and P8 only; P1, P2, P4, P5, P6 and P9 are not run unless needed. No observed result may be copied from a planned expectation. | Team message, 2026-10-08 | Claude (on the team's instruction) |
| | TEAM DECISION | Packet Tracer version used by all members | | | |
| | TEAM DECISION | Team name, members, registration numbers (title page) | | | |
| | TEAM DECISION | Submission deadline and seminar date | | | |
| | PILOT RESULT | P1 DNS | Not run (out of the draft's pilot scope; run only if needed) | | |
| | PILOT RESULT | P2 HTTPS | Not run (out of the draft's pilot scope; run only if needed) | | |
| | PILOT RESULT | P3 ACL counters / clearing | | | |
| | PILOT RESULT | P4 Simulation Mode drop evidence | Not run (out of the draft's pilot scope; run only if needed) | | |
| | PILOT RESULT | P5 Sequence numbers / remarks | Not run (out of the draft's pilot scope; run only if needed) | | |
| | PILOT RESULT | P6 `established` | Not run (out of the draft's pilot scope; run only if needed) | | |
| | PILOT RESULT | P7 FTP (outcome a/b/c and the ports observed) | | | |
| | TEAM DECISION | FTP follow-up (only if P7 outcome is b): minimal entry, or switch R4 to HTTPS | | | |
| | PILOT RESULT | P8 SSH, VTY 0 15, access-class, alternate addresses | | | |
| | PILOT RESULT | P9 Telnet / transport input ssh | Not run (out of the draft's pilot scope; run only if needed) | | |
