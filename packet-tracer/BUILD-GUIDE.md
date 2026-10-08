# Build Guide — Stage 0 → Stage 3

**Status:** `[PROPOSED DESIGN]` procedure. Follow it in order. Do not start a step until the previous step's checks pass.

## Step 1 — Place and cable the devices

- Use the models and names in `network-design/addressing-plan.md` §2.
- Cable exactly as in §6 of the same file.
- Use PT's text labels to mark the zones: USER, SERVER, MGMT/CORE, EXTERNAL.

## Step 2 — Base configuration (Stage 0)

1. Paste the scripts from `configs/stage0/`. Do the switches first, then R-CORE, then R-EDGE.
2. Set the IP, mask, gateway and DNS on every PC and server (addressing-plan §5).
3. On each server, configure its services and turn **every other service off** (addressing-plan §5, and pilot P-SRVDEF).
4. Configure the DNS records and the edited `index.html` pages.

## Step 3 — Stage 0 verification (Gate G1 part 1)

Save the output of each command to `results/stage0/`.

| Check | Command / action | Pass when |
|---|---|---|
| VLANs | SW-ACCESS and SW-SERVER: `show vlan brief` | Ports are assigned as in the plan |
| Trunks | `show interfaces trunk` on both switches | G0/1 is trunking, with the allowed VLANs as in the plan |
| Router interfaces | R-CORE and R-EDGE: `show ip interface brief` | All used interfaces and subinterfaces are up/up |
| Routes | `show ip route` on both routers | Default route on R-CORE; 192.168.0.0/16 on R-EDGE |
| Inter-VLAN | Ping from one PC per VLAN to every other VLAN's PC, to each server, and to EXT-WEB | All succeed (there are no ACLs yet) |
| Services | Run T01–T06, T15, T17 by their service methods | All succeed |
| SSH | IT-PC1 `ssh -l itadmin 192.168.30.1` and `… 10.0.0.2` | Login succeeds |

Save the result as `topology/stage0.pkt`. Take screenshots F01–F04.

## Step 4 — Pilot

Run `PILOT-PLAN.md` on a **copy** of the Stage 0 file. Update the scripts if any fallback is adopted. **Gate G1 passes only when this is complete.**

## Step 5 — Each policy stage (repeat for Stages 1, 2 and 3)

1. Open the previous stage's `.pkt` and paste `configs/stageN/R-CORE.txt` and `configs/stageN/R-EDGE.txt`.
2. Save the configuration evidence:
   - `show running-config` → `configs/stageN/R-CORE.running.txt` and `R-EDGE.running.txt`
   - `show access-lists` → `results/stageN/acl-before.txt`
   - `show ip interface GigabitEthernet0/0.10` (and the other access points) → confirms which ACL is bound in which direction
3. Run `clear access-list counters` on both routers.
4. Run **all** tests T01–T22, in order, using the methods in `tests/test-matrix.md`. Record each Actual result immediately, with its evidence ID.
5. Save `show access-lists` → `results/stageN/acl-after.txt`. These counters are the denial evidence and the zero-match analysis.
6. Capture Simulation Mode evidence for at least one allowed flow and one denied flow.
7. Save the file as `topology/stageN.pkt`.

## Step 6 — Misconfiguration experiments

- Copy `stage2.pkt` → `m1.pkt` and run `configs/misconfig/M1-shadowed-rule.txt`.
- Copy `stage3.pkt` → `m2.pkt` and run `configs/misconfig/M2-over-restriction.txt`.
- Record the results **only** in the M section of the test matrix.

## Step 7 — Metrics

- Fill the stage comparison table in `tests/test-matrix.md` using only the saved files.
- Count explicit ACL entries from `acl-after.txt`.
- Compute lines changed by diffing consecutive `*.running.txt` files.
