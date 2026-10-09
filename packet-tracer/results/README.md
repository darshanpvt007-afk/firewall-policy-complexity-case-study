# Evidence Checklist (what to save, where)

**Status: nothing has been run yet.** Every item below is **pending** until a team member saves it from our own Packet Tracer files.

Rules:

- Record only what Packet Tracer shows.
- Never copy a value from an "Expected" column.
- If a test fails, keep the failed attempt, log the fix in `planning/decisions-log.md`, re-run all 17 selected test cases, and record the retest separately.

The 17 selected test cases are: T01, T03, T04, T05, T06, T07, T08, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19. T02, T09 and T20–T26 are **not run**.

## Results table — `results-template.csv`

Copy it to `results.csv` and fill in the copy. One row per stage and test. Rows for tests outside the 17-test subset, and for the proposed tests T27–T29, stay **not run** unless a team decision adds them.

| Column | How to fill it |
|---|---|
| Expected outcome | Already filled from `tests/test-matrix.md` (planned; do not edit) |
| Actual outcome | What Packet Tracer showed: `A` (flow reached its target) or `D` (did not), with the exact client message in Notes |
| Status | `pass`, `fail`, `not run` or `inconclusive`, judged against the **security policy**, not against the stage prediction (rules below) |
| Matches stage prediction | `yes` or `no`: Actual compared with Expected for that stage |
| Evidence filename | Path under `results/` or a figure ID. No evidence means Status `inconclusive` |
| Configuration version | Git commit of the scripts used (`git log -1 --format=%h`) plus the `.pkt` file name |

**Status rules:**

| Test category | Actual A | Actual D |
|---|---|---|
| Required (R) | pass | fail; in Notes say "service/setup fault" if it also fails in Stage 0 or the service is off, otherwise "policy denial" with the counter or Simulation Mode evidence |
| Forbidden (X) | **fail** (a policy failure, even though the connection worked) | pass, only with a deny counter rise or Simulation Mode drop |
| Control (U1) | pass (shows the router ACL cannot filter it) | inconclusive; check the switch |
| Any category in **Stage 0** | pass (positive control: the flow is routable and the service runs) | fail: fix the network before any stage |

So a forbidden flow in Stage 1 that is allowed as predicted (`A*`) is recorded as Status `fail` and Matches stage prediction `yes`. Leakage and required success (`network-design/metrics-spec.md` §2–3) are counted from the Status column of executed rows only.

## Stage 0 (no ACLs) — `results/stage0/`

| File | Content | By | Status |
|---|---|---|---|
| `../topology/stage0.pkt` | Saved Stage 0 network | P1 | pending |
| `../configs/stage0/<device>.running.txt` | `show running-config` of every router and switch | P1 | pending |
| `infra.txt` | `show vlan brief`, `show interfaces trunk` (both switches); `show ip interface brief`, `show ip route` (both routers) | P2 | pending |
| `no-acl.txt` | `show access-lists` on both routers (must be empty) | P2 | pending |
| `server-defaults.txt` | Services each server had enabled by default, before any change | P1 | pending |
| `S0-Txx.txt` or screenshots | One record per selected test case: exact action, observed result, attempt number | P2 | pending |
| Test matrix §3 | Actual and Evidence for the 17 `S0-` rows | P2 | pending |
| Figures | F01 (topology), F02 (VLANs/trunks), F03 (interfaces/routes), F04 (baseline) in `figures/` | P2 | pending |

## Pilot (copy of Stage 0) — `results/pilot/`

| File | Content | By | Status |
|---|---|---|---|
| `P3.txt` | `show access-lists PILOT-CNT` before and after traffic and after `clear access-list counters`; client message for the denied browse | P1 | pending |
| `P7.txt` + Simulation Mode screenshot | Every FTP connection seen: ports, direction, which side opened it; `show access-lists PILOT-FTP`; outcome a / b / c | P1 | pending |
| `P8.txt` | Whether the RSA key command and `line vty 0 15` were accepted; SSH results from IT-PC1 and SAL-PC1 to 192.168.40.1, 192.168.50.1, 10.0.0.1, 10.0.0.2 with `PILOT-VTY`; exact refusal message | P1 | pending |
| Decisions log | One row per pilot step; any fallback as a `[TEAM DECISION]` **before** Stage 3 is changed | P5 | pending |

## Stages 1–3 — `results/stage1/`, `results/stage2/`, `results/stage3/`

| File | Content | By | Status |
|---|---|---|---|
| `../topology/stageN.pkt` | Saved stage file, built in order from the previous stage | P1 | pending |
| `../configs/stageN/R-CORE.running.txt`, `R-EDGE.running.txt` | `show running-config` after applying the stage scripts | P1 | pending |
| `acl-before.txt` | `show access-lists` before the run | P1 | pending |
| `bindings.txt` | `show ip interface` for AP1–AP5 and the VTY section of both routers (which ACL is bound, in which direction) | P1 | pending |
| `analysis.txt` | Output of `python3 tools/acl_analysis.py --running`, compared with `network-design/metrics-spec.md` | P1 | pending |
| `results.csv` rows | Actual, Status, Matches stage prediction, Evidence and Configuration version for the stage | tester | pending |
| `clear.txt` | Confirmation that `clear access-list counters` was run on both routers | tester | pending |
| `SN-Txx.txt` or screenshots | One record per selected test case | tester | pending |
| `acl-after.txt` | `show access-lists` after all 17 test cases (denial evidence; zero-match source) | tester | pending |
| Simulation Mode screenshot | At least one denied flow (Stage 3: F15) | tester | pending |
| Test matrix §4–§6 | Actual and Evidence for the 17 rows of the stage | tester | pending |
| Figures | Stage 1: F05–F07. Stage 2: F08–F10. Stage 3: F11–F16. | tester | pending |

## Optional — M1, M2 (`results/m1/`, `results/m2/`)

Pending a team decision. Both need pilot P5 (sequence editing) or the fallback in the script. If they are not run, mark test-matrix §8 and draft Table 8 "not run". File names to save are written in each script (`configs/misconfig/M1-shadowed-rule.txt`, `M2-over-restriction.txt`): before capture, after the change, after the fix or restore, with `show access-lists` each time.

## What the report needs from these files

- **Table 7:** the observed S0–S3 columns, from the test matrix.
- **Table 9:** measured entry counts and order-dependent pairs (`tools/acl_analysis.py --running`); required success and leakage (Status column of executed rows in `results.csv`); zero-hit entries (from `acl-after.txt`); configuration lines changed (`tools/acl_analysis.py --diff`).
- **B8 and Part C:** observed outcomes only.
