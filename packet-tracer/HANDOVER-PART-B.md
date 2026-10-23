# Part B Handover: Packet Tracer Simulation

**For:** the person running the simulation. You do not need to read the report.
**Time needed:** about 5 hours (Stage 0 ≈ 2 h, then ≈ 1 h for each of Stages 1, 2, 3).
**You need:** Cisco Packet Tracer (any recent version; write the version down), and the files in this pack.

## What this is

A small company network (4 departments, 4 servers, a simulated Internet). We apply three firewall policies (router ACLs) one after another and check, with the **same 17 tests** each time, which connections still work and which are blocked.

- **Stage 0:** no ACLs. Every test should work.
- **Stage 1:** broad policy.
- **Stage 2:** department-level policy.
- **Stage 3:** strict, least-privilege policy.

All configurations are already written. Your job is to **build, paste, test and record what you see**.

## The one rule that matters

**Record exactly what Packet Tracer shows.** Do not copy the "Expected" column into "Actual". If a result surprises you, write it down as it is and add a note. A surprising result is useful; a copied one is worthless.

## Files in this pack

| File | Use |
|---|---|
| `QUICK-BUILD.pdf` | Step-by-step build of Stage 0, with every config ready to paste, and the 17-test checklist |
| `configs/stage0/` … `configs/stage3/` | The configuration scripts to paste (open in Notepad, copy all, paste into the CLI) |
| `results-template.csv` | Where you record results (open in Excel or Google Sheets) |
| `test-matrix.pdf` | Full test definitions, if you need more detail |
| `addressing-plan.pdf` | All IP addresses and ports, if you need more detail |

## Step by step

### Step 1 – Build Stage 0 (≈ 2 h)
Follow `QUICK-BUILD.pdf` sections 1–5 exactly. Save as **`stage0.pkt`**.

### Step 2 – Test Stage 0 (≈ 30 min)
Run the 17 tests in `QUICK-BUILD.pdf` section 6. **All 17 must work.** If one fails, fix the network (cable, IP settings, server service) and re-test; do not continue until all work.

Record in `results-template.csv`, rows with Stage = **S0**:
- **Actual outcome:** `A` if it worked, `D` if it did not.
- **Status:** `pass` if it worked (in Stage 0 every test should pass).
- **Notes:** the exact message if anything odd happened.
- **Evidence filename:** the screenshot name, if you took one.

### Step 3 – Stages 1, 2 and 3 (≈ 1 h each)
Do this **three times**, for N = 1, then 2, then 3:

1. Open the previous file and **Save As** `stageN.pkt`.
2. Click **R-CORE** → CLI → paste all of `configs/stageN/R-CORE.txt`.
3. Click **R-EDGE** → CLI → paste all of `configs/stageN/R-EDGE.txt`.
4. On **both** routers type: `enable` (password `Lab#Enable26`), then `clear access-list counters`.
5. Run the **same 17 tests**, same order, same PCs (checklist in `QUICK-BUILD.pdf` section 6).
6. Fill the `SN` rows of `results-template.csv`:
   - **Actual outcome:** `A` (worked) or `D` (blocked: timeout, refused, "Request timed out", page not loading).
   - **Matches stage prediction:** `yes` if Actual equals the Expected column, otherwise `no`.
   - **Status:**
     - test category starts with *required*: `pass` if A, `fail` if D
     - test category starts with *forbidden*: `pass` if D, `fail` if A
     - *control (U1)* (T18): `pass` if A
   - **Notes:** the exact message for anything blocked (e.g. "Request timed out", "Connection refused").
7. On **R-CORE** and on **R-EDGE**, type `show access-lists`. Copy the whole output into a text file named `stageN-R-CORE-acl.txt` / `stageN-R-EDGE-acl.txt`. (These counters prove which rule blocked what.)
8. On both routers type `show running-config` and save the output as `stageN-R-CORE-running.txt` / `stageN-R-EDGE-running.txt`.
9. Take the screenshots listed below for that stage.
10. Save the `.pkt`.

Leave rows marked **not run** as they are.

### If a config line is rejected
Write down the exact line and the error, continue pasting the rest, and report it. Do not change the scripts yourself.

### If something does not work in Stages 1–3
That may be the expected result (the policy is blocking it). Check the Expected column. Only if Stage 0 itself is broken do you need to fix the network.

## Screenshots to take

Use the Windows Snipping Tool (Win+Shift+S) or Mac (Cmd+Shift+4). Save as PNG with exactly these names.

| File name | What to capture | When |
|---|---|---|
| `F01-topology.png` | The whole network on screen | Stage 0 |
| `F02-vlans.png` | SW-ACCESS CLI: `show vlan brief` | Stage 0 |
| `F03-routes.png` | R-CORE CLI: `show ip interface brief` and `show ip route` | Stage 0 |
| `F04-stage0-tests.png` | 2–3 tests working (e.g. a web page loaded, a ping reply) | Stage 0 |
| `F05-stage1-config.png` | R-CORE: `show access-lists` | Stage 1 |
| `F06-stage1-excess.png` | SAL-PC1 browser loading `https://192.168.50.30` (T10 works although forbidden) | Stage 1 |
| `F07-stage1-ext-denied.png` | EXT-HOST `ftp 192.168.50.40` failing (T16) | Stage 1 |
| `F08-stage2-config.png` | R-CORE: `show access-lists` | Stage 2 |
| `F09-stage2-dept-denied.png` | HR-PC1 `ping 192.168.20.11` failing (T07) | Stage 2 |
| `F10-stage2-residual.png` | SAL-PC1 `ftp 192.168.50.40` still connecting (T08) | Stage 2 |
| `F11-stage3-config.png` | R-CORE: `show access-lists` (first part) | Stage 3 |
| `F12-stage3-required-ok.png` | A required test working, e.g. HR-PC1 browser `https://192.168.50.30` (T05) | Stage 3 |
| `F13-stage3-denied.png` | A forbidden test blocked, e.g. SAL-PC1 browser `https://192.168.50.30` (T10) | Stage 3 |
| `F14-stage3-counters.png` | R-CORE `show access-lists` **after** the tests, showing match counts | Stage 3 |
| `F15-simulation-drop.png` | *Optional:* Simulation Mode showing a packet dropped at R-CORE | Stage 3 |
| `F16-same-vlan.png` | HR-PC1 `ping 192.168.10.12` working (T18) | Stage 3 |

If a test does not behave as the screenshot description says, capture what actually happens and note it.

## What to hand back

Put everything in one folder and zip it:

- `stage0.pkt`, `stage1.pkt`, `stage2.pkt`, `stage3.pkt`
- the filled `results-template.csv`
- the 6 `stageN-…-acl.txt` and 6 `stageN-…-running.txt` files
- the screenshots `F01`–`F16`
- a short note: Packet Tracer version, any rejected config lines, anything surprising

## Quick reference

| Item | Value |
|---|---|
| Router enable password | `Lab#Enable26` |
| SSH / Telnet login | user `itadmin`, password `ItAdmin#26` |
| FTP login (FIN-SRV) | user `finuser`, password `Fin#2026` |
| Web servers | WEB-SRV 192.168.50.10, HR-SRV 192.168.50.30 (HTTPS only), EXT-WEB 203.0.113.10 |
| DNS server | 192.168.50.20 |
| FTP server | FIN-SRV 192.168.50.40 |

All passwords are lab-only values used inside the simulation.
