# Build Guide — Stage 0 → Pilot → Stages 1–3 → M1/M2

**Status:** `[PROPOSED DESIGN]` procedure. Nothing here has been run yet.

Follow the steps in order. Do not start a step until the previous step's checks pass.

> **Draft scope (team decision, 2026-10-08):** this draft runs the **17 selected test cases** (of the 26 designed) listed in `tests/test-matrix.md` §1, the same 17 in Stage 0 and Stages 1–3. Pilot steps P3, P7 and P8 only. Everything else is marked "not run".

## Step 1 — Place and cable the devices

- Use the device models and names in `network-design/addressing-plan.md` §2.
- Cable them exactly as in §6 of the same file.
- Add Packet Tracer text labels for the zones: USER, SERVER, CORE/MGMT, EXTERNAL.

## Step 2 — Base configuration (Stage 0)

1. Paste the scripts from `configs/stage0/` in this order: switches, then R-CORE, then R-EDGE.
2. Set IP, mask, gateway and DNS on every PC and server (addressing-plan §5).
3. On each server, enable only its listed services, and turn every other service **off**.
4. Create the DNS records. Edit each server's `index.html` page as specified.
5. Create the FTP user `finuser` on FIN-SRV, and put at least one file there for `get`.

## Step 3 — Stage 0 verification (Gate G1, part 1)

Save each command's output to `results/stage0/`.

### 3a. Infrastructure

| Check | Command / action | Pass when |
|---|---|---|
| VLANs | `show vlan brief` on SW-ACCESS and SW-SERVER | Ports are assigned as planned |
| Trunks | `show interfaces trunk` on both switches | G0/1 is trunking, with the planned allowed VLANs |
| Router interfaces | `show ip interface brief` on R-CORE and R-EDGE | Every used interface and subinterface is up/up |
| Routes | `show ip route` on both routers | R-CORE has a default route via 10.0.0.2; R-EDGE has 192.168.0.0/16 via 10.0.0.1 |
| No ACLs | `show access-lists` on both routers | Empty |

### 3b. Positive control: the 17 selected test cases (of 26 designed)

- Run the 17 selected test cases in `tests/test-matrix.md` §3 (T01, T03, T04, T05, T06, T07, T08, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19), using the same methods and pass criteria as the stage runs. The other nine designed test cases (T02, T09, T20–T26) are **not run** for this draft; leave their rows marked "not run".
- **Every selected test must be allowed**, including the forbidden flows and the external ones (T16). That proves each flow is routable and each service is running.
- Pay particular attention to these:
  - **T04:** FTP login, `dir` and `get` must all work with no ACL. This is the reference behaviour for pilot P7.
  - **T06, T11, T12, T19:** a login prompt must appear on R-CORE, on every address used.
  - **T15 and T17:** external-to-internal routing works in both directions, since there is no NAT.
- **Recording:** write only what you observe in the Actual column, with an evidence ID. If a test fails, keep that row as the first attempt (for example "attempt 1: failed — Request Timeout"), fix the cause, log the fix in `planning/decisions-log.md`, then re-run **all 17** and record the retest separately (for example "attempt 2: allowed — page loaded").
- If any Stage 0 test fails, **fix the network first.** A later denial must never be confused with a routing or service fault.
- Save as `topology/stage0.pkt`. Capture figures F01–F04.

## Step 4 — Pilot (Gate G1, part 2)

- Start only after all 17 Stage 0 test cases pass.
- Run `PILOT-PLAN.md` steps **P3, P7 and P8** (draft scope; P1, P2, P4, P5, P6 and P9 are not run), on `topology/pilot.pkt`, which is a copy of `stage0.pkt`.
- Log every pilot result, and any fallback as a `[TEAM DECISION]`, in `planning/decisions-log.md` **before** changing any Stage 3 script.
- If a fallback is adopted, update the scripts and the design documents before going on.

## Step 5 — Each policy stage (repeatable procedure)

Repeat exactly the same steps for Stage 1, then Stage 2, then Stage 3. Do not change the procedure between stages; if something must change, log it in `planning/decisions-log.md` and apply it to every stage.

1. **Record the version.** Write down the git commit of the scripts (`git log -1 --format=%h`) and the Packet Tracer version. Both go into the "Configuration version" column of `results/results.csv`.
2. **Start from the previous stage.** Open the previous stage's `.pkt` file (for Stage 1, `stage0.pkt`) and save it straight away as `topology/stageN.pkt`.
3. **Apply.** Paste `configs/stageN/R-CORE.txt` and `configs/stageN/R-EDGE.txt`. Note any line Packet Tracer rejects, word for word.
4. **Verify the policy is in place** before testing:

| Command | Save as | Check |
|---|---|---|
| `show running-config` (both routers) | `configs/stageN/R-CORE.running.txt`, `R-EDGE.running.txt` | — |
| `show access-lists` | `results/stageN/acl-before.txt` | Every ACL in the script is present, in the script's order |
| `show ip interface <ap>` for AP1–AP5 | `results/stageN/bindings.txt` | The right ACL is bound **inbound** at each point |
| `show running-config \| section line vty` | in `bindings.txt` | AP6/AP7 access-class and `transport input` match the script |

5. **Reconcile with the analysis.** Run `python3 tools/acl_analysis.py --running`. Its counts must equal the configuration-derived values in `network-design/metrics-spec.md`. If they differ, find out why (a rejected line, a wrong paste) before testing, and log it.
6. **Clear counters** on both routers: `clear access-list counters`.
7. **Run the same tests in the same order** as Stage 0, using the methods in `tests/test-matrix.md` §1. Fill in one row per test in `results/results.csv` immediately (Actual, Status, Matches stage prediction, Evidence). Rows outside the run subset stay "not run".
8. **Save the counters:** `show access-lists` → `results/stageN/acl-after.txt`. This is the denial evidence and the source for zero-hit entries.
9. Capture Simulation Mode evidence for at least one allowed flow and one denied flow.
10. **Restore anything changed during testing.** If a test needed a temporary change (for example a browser setting or a service toggled), undo it and say so in Notes. The stage file must hold only the stage script.
11. **Save** `topology/stageN.pkt` and commit the saved text files.
12. **Lines changed:** `python3 tools/acl_analysis.py --diff configs/stage(N-1)/R-CORE.running.txt configs/stageN/R-CORE.running.txt`, and the same for R-EDGE.

**If a test does not match its prediction,** do not edit the stage script to make it match. Record it as observed, check the setup, and log any fix as a decision; then re-run **all** the selected tests for that stage and record the re-run separately.

## Step 6 — Misconfiguration experiments (reported separately)

| Experiment | Copy | To | Then run |
|---|---|---|---|
| M1 | `stage2.pkt` | `m1.pkt` | `configs/misconfig/M1-shadowed-rule.txt` |
| M2 | `stage3.pkt` | `m2.pkt` | `configs/misconfig/M2-over-restriction.txt` |

- Both experiments need sequence-number editing (pilot P5, **not run** in the draft scope). Run P5 first, or use the delete-and-recreate fallback written at the end of each script. Until then, M1 and M2 stay "not run".
- Each script includes a "before" capture (M1-0, M2-a), the change, the tests, and for M2 a restore and recovery test (M2-c, M2-d).
- Record the results **only** in `tests/test-matrix.md` §8 and the M rows of `results/results.csv`.
- M3 is deferred.

## Step 7 — Metrics

- Fill in `tests/test-matrix.md` §7 using the definitions in `network-design/metrics-spec.md`, from saved files only.
- **Configuration measures** (entries, specificity, order-dependent, shadowed and redundant entries): `python3 tools/acl_analysis.py --running`.
- **Leakage and required success:** from the Status column of executed rows in `results/results.csv`.
- **Lines changed:** diff consecutive `*.running.txt` files.
- **Order-dependent pairs and match conditions:** count them from the saved running configurations, not from the planned design.
