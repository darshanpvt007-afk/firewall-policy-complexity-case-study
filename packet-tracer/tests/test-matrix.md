# Experiment Matrix

**Expected** values come from tracing the rules by hand (`network-design/acl-design.md` §7). They are `[PROPOSED DESIGN]`.

**Actual stays blank until the test has been run in Packet Tracer.**

Every Actual entry needs:

- an evidence ID: a screenshot (`Fxx`) or a saved output file (`results/stageN/...`), and
- for a denied test, the deny entry and its counter from `acl-after.txt`, or Simulation Mode evidence.

**Legend:**

- A = allowed
- D = denied
- A* = allowed although forbidden (unnecessary/excess access)
- A† = allowed and cannot be filtered by a router ACL (U1)

For SSH and Telnet tests, "allowed" means the client reaches the router's login prompt. "Denied" means a timeout or a refused connection; record which one (pilot P-ACLASS).

Run all 22 tests at every stage, in the same order, after `clear access-list counters`.

## 1. Test definitions

| Test | Source | Destination | Service / method | Req. | Exp. S1 | Exp. S2 | Exp. S3 |
|---|---|---|---|---|---|---|---|
| T01 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP / browser `http://192.168.50.10` | R2 | A | A | A |
| T02 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS / browser `https://192.168.50.10` | R2 | A | A | A |
| T03 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS / `nslookup portal.corp.test` | R1 | A | A | A |
| T04 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP / `ftp 192.168.50.40`, login, `dir` | R4 | A | A | A |
| T05 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS / browser `https://192.168.50.30` | R3 | A | A | A |
| T06 | IT-PC1 | R-CORE 192.168.30.1 | SSH / `ssh -l itadmin 192.168.30.1` | R5 | A | A | A |
| T07 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP / `ping` | X1 | A* | D | D |
| T08 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | A* | A* | D |
| T09 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | A* | A* | D |
| T10 | SAL-PC1 | HR-SRV 192.168.50.30 | HTTPS / browser | X2 | A* | A* | D |
| T11 | SAL-PC1 | R-CORE 192.168.40.1 | SSH (reaching login prompt = A) | X4 | A* | D | D |
| T12 | IT-PC1 | R-CORE 192.168.30.1 | Telnet / `telnet` | X5 | A* | A* | D |
| T13 | HR-PC1 | WEB-SRV 192.168.50.10 | ICMP / `ping` | X6 | A* | A* | D |
| T14 | IT-PC1 | FIN-SRV 192.168.50.40 | ICMP / `ping` | R6 | A | A | A |
| T15 | EXT-HOST | WEB-SRV 192.168.50.10 | HTTP / browser | R8 | A | A | A |
| T16 | EXT-HOST | FIN-SRV 192.168.50.40 | FTP | X7 | D | D | D |
| T17 | HR-PC1 | EXT-WEB 203.0.113.10 | HTTP / browser | R7 | A | A | A |
| T18 | HR-PC1 | HR-PC2 192.168.10.12 | ICMP / `ping` (same VLAN) | U1 | A† | A† | A† |
| T19 | SAL-PC1 | R-CORE 192.168.50.1 | SSH (alternate router address) | X4 | A* | D | D |
| T20 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | X4 | A* | D | D |
| T21 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP / `ping` | X7 | D | D | D |
| T22 | IT-PC1 | R-EDGE 10.0.0.2 | SSH / `ssh -l itadmin 10.0.0.2` | R5 | A | A | A |

## 2. Stage 1 runs

| Exp ID | Stage | Source | Destination | Protocol | Req. | Expected | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|---|---|
| S1-T01 | 1 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | | | |
| S1-T02 | 1 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS | R2 | A | | | |
| S1-T03 | 1 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | | | |
| S1-T04 | 1 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP | R4 | A | | | |
| S1-T05 | 1 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS | R3 | A | | | |
| S1-T06 | 1 | IT-PC1 | R-CORE 192.168.30.1 | SSH | R5 | A | | | |
| S1-T07 | 1 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP | X1 | A* | | | |
| S1-T08 | 1 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | A* | | | |
| S1-T09 | 1 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | A* | | | |
| S1-T10 | 1 | SAL-PC1 | HR-SRV 192.168.50.30 | HTTPS | X2 | A* | | | |
| S1-T11 | 1 | SAL-PC1 | R-CORE 192.168.40.1 | SSH (reaching login prompt = A) | X4 | A* | | | |
| S1-T12 | 1 | IT-PC1 | R-CORE 192.168.30.1 | Telnet | X5 | A* | | | |
| S1-T13 | 1 | HR-PC1 | WEB-SRV 192.168.50.10 | ICMP | X6 | A* | | | |
| S1-T14 | 1 | IT-PC1 | FIN-SRV 192.168.50.40 | ICMP | R6 | A | | | |
| S1-T15 | 1 | EXT-HOST | WEB-SRV 192.168.50.10 | HTTP | R8 | A | | | |
| S1-T16 | 1 | EXT-HOST | FIN-SRV 192.168.50.40 | FTP | X7 | D | | | |
| S1-T17 | 1 | HR-PC1 | EXT-WEB 203.0.113.10 | HTTP | R7 | A | | | |
| S1-T18 | 1 | HR-PC1 | HR-PC2 192.168.10.12 | ICMP | U1 | A† | | | |
| S1-T19 | 1 | SAL-PC1 | R-CORE 192.168.50.1 | SSH (alternate router address) | X4 | A* | | | |
| S1-T20 | 1 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | X4 | A* | | | |
| S1-T21 | 1 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | X7 | D | | | |
| S1-T22 | 1 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | R5 | A | | | |

## 3. Stage 2 runs

| Exp ID | Stage | Source | Destination | Protocol | Req. | Expected | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|---|---|
| S2-T01 | 2 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | | | |
| S2-T02 | 2 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS | R2 | A | | | |
| S2-T03 | 2 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | | | |
| S2-T04 | 2 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP | R4 | A | | | |
| S2-T05 | 2 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS | R3 | A | | | |
| S2-T06 | 2 | IT-PC1 | R-CORE 192.168.30.1 | SSH | R5 | A | | | |
| S2-T07 | 2 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP | X1 | D | | | |
| S2-T08 | 2 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | A* | | | |
| S2-T09 | 2 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | A* | | | |
| S2-T10 | 2 | SAL-PC1 | HR-SRV 192.168.50.30 | HTTPS | X2 | A* | | | |
| S2-T11 | 2 | SAL-PC1 | R-CORE 192.168.40.1 | SSH (reaching login prompt = A) | X4 | D | | | |
| S2-T12 | 2 | IT-PC1 | R-CORE 192.168.30.1 | Telnet | X5 | A* | | | |
| S2-T13 | 2 | HR-PC1 | WEB-SRV 192.168.50.10 | ICMP | X6 | A* | | | |
| S2-T14 | 2 | IT-PC1 | FIN-SRV 192.168.50.40 | ICMP | R6 | A | | | |
| S2-T15 | 2 | EXT-HOST | WEB-SRV 192.168.50.10 | HTTP | R8 | A | | | |
| S2-T16 | 2 | EXT-HOST | FIN-SRV 192.168.50.40 | FTP | X7 | D | | | |
| S2-T17 | 2 | HR-PC1 | EXT-WEB 203.0.113.10 | HTTP | R7 | A | | | |
| S2-T18 | 2 | HR-PC1 | HR-PC2 192.168.10.12 | ICMP | U1 | A† | | | |
| S2-T19 | 2 | SAL-PC1 | R-CORE 192.168.50.1 | SSH (alternate router address) | X4 | D | | | |
| S2-T20 | 2 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | X4 | D | | | |
| S2-T21 | 2 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | X7 | D | | | |
| S2-T22 | 2 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | R5 | A | | | |

## 4. Stage 3 runs

| Exp ID | Stage | Source | Destination | Protocol | Req. | Expected | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|---|---|
| S3-T01 | 3 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | | | |
| S3-T02 | 3 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS | R2 | A | | | |
| S3-T03 | 3 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | | | |
| S3-T04 | 3 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP | R4 | A | | | |
| S3-T05 | 3 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS | R3 | A | | | |
| S3-T06 | 3 | IT-PC1 | R-CORE 192.168.30.1 | SSH | R5 | A | | | |
| S3-T07 | 3 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP | X1 | D | | | |
| S3-T08 | 3 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | D | | | |
| S3-T09 | 3 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | D | | | |
| S3-T10 | 3 | SAL-PC1 | HR-SRV 192.168.50.30 | HTTPS | X2 | D | | | |
| S3-T11 | 3 | SAL-PC1 | R-CORE 192.168.40.1 | SSH (reaching login prompt = A) | X4 | D | | | |
| S3-T12 | 3 | IT-PC1 | R-CORE 192.168.30.1 | Telnet | X5 | D | | | |
| S3-T13 | 3 | HR-PC1 | WEB-SRV 192.168.50.10 | ICMP | X6 | D | | | |
| S3-T14 | 3 | IT-PC1 | FIN-SRV 192.168.50.40 | ICMP | R6 | A | | | |
| S3-T15 | 3 | EXT-HOST | WEB-SRV 192.168.50.10 | HTTP | R8 | A | | | |
| S3-T16 | 3 | EXT-HOST | FIN-SRV 192.168.50.40 | FTP | X7 | D | | | |
| S3-T17 | 3 | HR-PC1 | EXT-WEB 203.0.113.10 | HTTP | R7 | A | | | |
| S3-T18 | 3 | HR-PC1 | HR-PC2 192.168.10.12 | ICMP | U1 | A† | | | |
| S3-T19 | 3 | SAL-PC1 | R-CORE 192.168.50.1 | SSH (alternate router address) | X4 | D | | | |
| S3-T20 | 3 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | X4 | D | | | |
| S3-T21 | 3 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | X7 | D | | | |
| S3-T22 | 3 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | R5 | A | | | |

## 5. Controlled misconfiguration experiments

These are **reported separately and never mixed into the Stage 1–3 metrics.**

| Exp ID | Base | Change | Test | Expected | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|
| M1-b | copy of Stage 2 | Deny for SAL→FIN-SRV FTP appended at the end of ACL-SAL-IN | T08 | A (the appended deny has 0 matches; shadowed) | | | |
| M1-c | M1 after the fix | Deny inserted as seq 5 | T08 | D (seq 5 counter rises) | | | |
| M2-b1 | copy of Stage 3 | DNS permit removed from ACL-HR-IN | T03 nslookup | D (required flow broken) | | | |
| M2-b2 | same | same | T01 by IP | A | | | |
| M2-b3 | same | same | T01 by name `http://portal.corp.test` | D | | | |
| M3 (optional, needs a team decision) | copy of Stage 3 | SAL Internet-443 permit moved above the deny-internal entry | T10 | A* | | | |

## 6. Stage comparison

Fill this in only from the tables above and from the saved configurations. The planned values are listed in `acl-design.md` §6 for comparison.

| Metric | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|
| Application points | TBD | TBD | TBD |
| ACL names | TBD | TBD | TBD |
| Explicit ACL entries (measured) | TBD | TBD | TBD |
| Match conditions (sum of specified fields) | TBD | TBD | TBD |
| Required-flow tests passed (of 10) | TBD | TBD | TBD |
| Forbidden-flow tests permitted (of 11) | TBD | TBD | TBD |
| Exposed (server, port) pairs per non-IT department | TBD | TBD | TBD |
| Order-dependent entry pairs | TBD | TBD | TBD |
| Entries with zero matches after the full run | TBD | TBD | TBD |
| Configuration lines changed from the previous stage | — | TBD | TBD |

