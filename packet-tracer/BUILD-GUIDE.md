# Build Guide — Stage 0 → Pilot → Stages 1–3 → M1/M2

**Status:** `[PROPOSED DESIGN]` procedure. Nothing here has been run yet.

Follow the steps in order. Do not start a step until the previous step's checks pass.

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

### 3b. Positive control: all 26 tests

- Run every test in `tests/test-matrix.md` §3 (S0-T01 … S0-T26), using the same methods and pass criteria as the stage runs.
- **Every test must be allowed**, including the forbidden flows and the external ones (T16, T21). That proves each flow is routable and each service is running.
- Pay particular attention to these:
  - **T04:** FTP login, `dir` and `get` must all work with no ACL. This is the reference behaviour for pilot P7.
  - **T06, T11, T12, T19, T20, T22, T25, T26:** a login prompt must appear on both routers, on every address used.
  - **T17 and T21:** external-to-internal routing works in both directions, since there is no NAT.
- If any Stage 0 test fails, **fix the network first.** A later denial must never be confused with a routing or service fault.
- Save as `topology/stage0.pkt`. Capture figures F01–F04.

## Step 4 — Pilot (Gate G1, part 2)

- Run `PILOT-PLAN.md` steps P1–P9 **in order**, on `topology/pilot.pkt`, which is a copy of `stage0.pkt`.
- If a fallback is adopted, update the scripts and the design documents before going on.

## Step 5 — Each policy stage

Repeat for Stage 1, then Stage 2, then Stage 3.

1. Open the previous stage's `.pkt` file. For Stage 1, that is `stage0.pkt`.
2. Paste `configs/stageN/R-CORE.txt` and `configs/stageN/R-EDGE.txt`.
3. Save the configuration evidence:

| Command | Save as |
|---|---|
| `show running-config` (both routers) | `configs/stageN/R-CORE.running.txt` and `configs/stageN/R-EDGE.running.txt` |
| `show access-lists` | `results/stageN/acl-before.txt` |
| `show ip interface <ap>` for each application point | `results/stageN/` (confirms which ACL is bound, and in which direction) |

4. Run `clear access-list counters` on both routers.
5. Run **all 26 tests** in order, using the methods in `tests/test-matrix.md`. Record each Actual result and its evidence ID immediately.
6. Save `show access-lists` → `results/stageN/acl-after.txt`. This is the denial evidence and the source for zero-match entries.
7. Capture Simulation Mode evidence for at least one allowed flow and one denied flow.
8. Save as `topology/stageN.pkt`.

## Step 6 — Misconfiguration experiments (reported separately)

| Experiment | Copy | To | Then run |
|---|---|---|---|
| M1 | `stage2.pkt` | `m1.pkt` | `configs/misconfig/M1-shadowed-rule.txt` |
| M2 | `stage3.pkt` | `m2.pkt` | `configs/misconfig/M2-over-restriction.txt` |

- Record the results **only** in `tests/test-matrix.md` §8.
- M3 is deferred.

## Step 7 — Metrics

- Fill in `tests/test-matrix.md` §7 using the definitions in `network-design/acl-design.md` §6.1, from saved files only.
- **Lines changed:** diff consecutive `*.running.txt` files.
- **Order-dependent pairs and match conditions:** count them from the saved running configurations, not from the planned design.
