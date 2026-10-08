# Experiment Matrix

**Expected** values come from tracing the rules by hand (`network-design/acl-design.md` §8). They are **planned**, not results.

**The Actual column stays blank until the test has been run in Packet Tracer.** Each Actual entry needs:

- an evidence ID: a screenshot `Fxx`, or a file in `results/stageN/`
- for a denied test, either the deny entry plus its counter value (from `acl-after.txt`), or Simulation Mode evidence

**Legend:**

| Code | Meaning |
|---|---|
| A | allowed |
| D | denied |
| A* | allowed although forbidden (unnecessary access) |
| A† | allowed, and a router ACL cannot filter it (U1) |

## 1. Pass/fail criteria by method

Record the exact client message for denials: pilot steps P2, P3, P7 and P8 tell you what to expect.

| Method | Counts as **allowed** when | Counts as **denied** when |
|---|---|---|
| Browser (HTTP/HTTPS) | The page with the expected heading loads | Request timeout or failure, **and** the deny counter rises or Simulation Mode shows the drop |
| `nslookup` | The expected address is returned | Timeout, plus counter/Simulation Mode evidence |
| FTP (required test T04) | Login succeeds **and** `dir` lists files **and** `get` retrieves a file | Any step fails. Record which step. |
| FTP (forbidden tests T08, T09, T16) | The FTP login prompt appears (the control connection is accepted) | No control connection, plus counter/Simulation Mode evidence |
| SSH / Telnet | The router's login/password prompt appears | Timeout, or the connection is refused/closed. Record which; refused usually means the VTY access-class (P8). |
| ping | Echo replies are received | No replies, or "unreachable", plus counter/Simulation Mode evidence |

**Groups:**

| Group | Tests |
|---|---|
| Required (12) | T01–T06, T14, T15, T17, T22, T23, T24 |
| Forbidden (13) | T07–T13, T16, T19–T21, T25, T26 |
| Control | T18 |

**Sales sweep for exposure:** T02, T08, T10, T11, T19, T20, T23, T24, T25, T26 (see `acl-design.md` §6.1). It covers internal services only, on the router addresses listed in those tests; Internet browsing is not part of it.

**Scope:** conclusions are limited to these 26 test cases (`acl-design.md` §1.3).

## 2. Test definitions

| Test | Source | Destination | Service | Method | Req. | Exp. S0 | Exp. S1 | Exp. S2 | Exp. S3 |
|---|---|---|---|---|---|---|---|---|---|
| T01 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP | Browser `http://192.168.50.10` | R2 | A | A | A | A |
| T02 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS | Browser `https://192.168.50.10` | R2 | A | A | A | A |
| T03 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS | `nslookup portal.corp.test` | R1 | A | A | A | A |
| T04 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP | `ftp 192.168.50.40`, login, `dir`, `get` | R4 | A | A | A | A (subject to P7) |
| T05 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS | Browser `https://192.168.50.30` | R3 | A | A | A | A |
| T06 | IT-PC1 | R-CORE 192.168.30.1 | SSH | `ssh -l itadmin 192.168.30.1` | R5 | A | A | A | A |
| T07 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP | `ping` | X1 | A | A* | D | D |
| T08 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | `ftp 192.168.50.40`, login | X3 | A | A* | A* | D |
| T09 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | `ftp 192.168.50.40`, login | X3 | A | A* | A* | D |
| T10 | SAL-PC1 | HR-SRV 192.168.50.30 | HTTPS | Browser | X2 | A | A* | A* | D |
| T11 | SAL-PC1 | R-CORE 192.168.40.1 | SSH | `ssh -l itadmin 192.168.40.1` | X4 | A | A* | D | D |
| T12 | IT-PC1 | R-CORE 192.168.30.1 | Telnet | `telnet 192.168.30.1` | X5 | A | A* | A* | D |
| T13 | HR-PC1 | WEB-SRV 192.168.50.10 | ICMP | `ping` | X6 | A | A* | A* | D |
| T14 | IT-PC1 | FIN-SRV 192.168.50.40 | ICMP | `ping` | R6 | A | A | A | A |
| T15 | EXT-HOST | WEB-SRV 192.168.50.10 | HTTP | Browser | R8 | A | A | A | A |
| T16 | EXT-HOST | FIN-SRV 192.168.50.40 | FTP | `ftp 192.168.50.40` | X7 | A | D | D | D |
| T17 | HR-PC1 | EXT-WEB 203.0.113.10 | HTTP | Browser `http://203.0.113.10` | R7 | A | A | A | A |
| T18 | HR-PC1 | HR-PC2 192.168.10.12 | ICMP | `ping` (same VLAN) | U1 | A | A† | A† | A† |
| T19 | SAL-PC1 | R-CORE 192.168.50.1 | SSH | `ssh -l itadmin 192.168.50.1` | X4 | A | A* | D | D |
| T20 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | `ssh -l itadmin 10.0.0.2` | X4 | A | A* | D | D |
| T21 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | `ping` | X7 | A | D | D | D |
| T22 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | `ssh -l itadmin 10.0.0.2` | R5 | A | A | A | A |
| T23 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTP | Browser `http://192.168.50.10` | R2 | A | A | A | A |
| T24 | SAL-PC1 | DNS-SRV 192.168.50.20 | DNS | `nslookup portal.corp.test` | R1 | A | A | A | A |
| T25 | SAL-PC1 | R-CORE 192.168.40.1 | Telnet | `telnet 192.168.40.1` | X4, X5 | A | A* | D | D |
| T26 | SAL-PC1 | R-EDGE 10.0.0.2 | Telnet | `telnet 10.0.0.2` | X4, X5 | A | A* | D | D |

## 3. Stage 0 baseline runs (no ACLs; positive control)

**Every test must be allowed here, including T16 and T21.** That proves each forbidden flow is routable and its service is running. A later denial can then be attributed to an ACL, not to a routing or service fault.

If any Stage 0 test fails, fix the network **before** running the pilot or any stage.

| Exp ID | Source | Destination | Service | Expected | Actual | Evidence | Notes |
|---|---|---|---|---|---|---|---|
| S0-T01 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP | A | | | |
| S0-T02 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS | A | | | |
| S0-T03 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS | A | | | |
| S0-T04 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP | A | | | |
| S0-T05 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS | A | | | |
| S0-T06 | IT-PC1 | R-CORE 192.168.30.1 | SSH | A | | | |
| S0-T07 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP | A | | | |
| S0-T08 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | A | | | |
| S0-T09 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | A | | | |
| S0-T10 | SAL-PC1 | HR-SRV 192.168.50.30 | HTTPS | A | | | |
| S0-T11 | SAL-PC1 | R-CORE 192.168.40.1 | SSH | A | | | |
| S0-T12 | IT-PC1 | R-CORE 192.168.30.1 | Telnet | A | | | |
| S0-T13 | HR-PC1 | WEB-SRV 192.168.50.10 | ICMP | A | | | |
| S0-T14 | IT-PC1 | FIN-SRV 192.168.50.40 | ICMP | A | | | |
| S0-T15 | EXT-HOST | WEB-SRV 192.168.50.10 | HTTP | A | | | |
| S0-T16 | EXT-HOST | FIN-SRV 192.168.50.40 | FTP | A | | | |
| S0-T17 | HR-PC1 | EXT-WEB 203.0.113.10 | HTTP | A | | | |
| S0-T18 | HR-PC1 | HR-PC2 192.168.10.12 | ICMP | A | | | |
| S0-T19 | SAL-PC1 | R-CORE 192.168.50.1 | SSH | A | | | |
| S0-T20 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | A | | | |
| S0-T21 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | A | | | |
| S0-T22 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | A | | | |
| S0-T23 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTP | A | | | |
| S0-T24 | SAL-PC1 | DNS-SRV 192.168.50.20 | DNS | A | | | |
| S0-T25 | SAL-PC1 | R-CORE 192.168.40.1 | Telnet | A | | | |
| S0-T26 | SAL-PC1 | R-EDGE 10.0.0.2 | Telnet | A | | | |

## 4. Stage 1 runs

| Exp ID | Stage | Source | Destination | Service | Req. | Expected (planned) | Actual | Evidence | Interpretation |
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
| S1-T11 | 1 | SAL-PC1 | R-CORE 192.168.40.1 | SSH | X4 | A* | | | |
| S1-T12 | 1 | IT-PC1 | R-CORE 192.168.30.1 | Telnet | X5 | A* | | | |
| S1-T13 | 1 | HR-PC1 | WEB-SRV 192.168.50.10 | ICMP | X6 | A* | | | |
| S1-T14 | 1 | IT-PC1 | FIN-SRV 192.168.50.40 | ICMP | R6 | A | | | |
| S1-T15 | 1 | EXT-HOST | WEB-SRV 192.168.50.10 | HTTP | R8 | A | | | |
| S1-T16 | 1 | EXT-HOST | FIN-SRV 192.168.50.40 | FTP | X7 | D | | | |
| S1-T17 | 1 | HR-PC1 | EXT-WEB 203.0.113.10 | HTTP | R7 | A | | | |
| S1-T18 | 1 | HR-PC1 | HR-PC2 192.168.10.12 | ICMP | U1 | A† | | | |
| S1-T19 | 1 | SAL-PC1 | R-CORE 192.168.50.1 | SSH | X4 | A* | | | |
| S1-T20 | 1 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | X4 | A* | | | |
| S1-T21 | 1 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | X7 | D | | | |
| S1-T22 | 1 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | R5 | A | | | |
| S1-T23 | 1 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | | | |
| S1-T24 | 1 | SAL-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | | | |
| S1-T25 | 1 | SAL-PC1 | R-CORE 192.168.40.1 | Telnet | X4, X5 | A* | | | |
| S1-T26 | 1 | SAL-PC1 | R-EDGE 10.0.0.2 | Telnet | X4, X5 | A* | | | |

## 5. Stage 2 runs

| Exp ID | Stage | Source | Destination | Service | Req. | Expected (planned) | Actual | Evidence | Interpretation |
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
| S2-T11 | 2 | SAL-PC1 | R-CORE 192.168.40.1 | SSH | X4 | D | | | |
| S2-T12 | 2 | IT-PC1 | R-CORE 192.168.30.1 | Telnet | X5 | A* | | | |
| S2-T13 | 2 | HR-PC1 | WEB-SRV 192.168.50.10 | ICMP | X6 | A* | | | |
| S2-T14 | 2 | IT-PC1 | FIN-SRV 192.168.50.40 | ICMP | R6 | A | | | |
| S2-T15 | 2 | EXT-HOST | WEB-SRV 192.168.50.10 | HTTP | R8 | A | | | |
| S2-T16 | 2 | EXT-HOST | FIN-SRV 192.168.50.40 | FTP | X7 | D | | | |
| S2-T17 | 2 | HR-PC1 | EXT-WEB 203.0.113.10 | HTTP | R7 | A | | | |
| S2-T18 | 2 | HR-PC1 | HR-PC2 192.168.10.12 | ICMP | U1 | A† | | | |
| S2-T19 | 2 | SAL-PC1 | R-CORE 192.168.50.1 | SSH | X4 | D | | | |
| S2-T20 | 2 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | X4 | D | | | |
| S2-T21 | 2 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | X7 | D | | | |
| S2-T22 | 2 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | R5 | A | | | |
| S2-T23 | 2 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | | | |
| S2-T24 | 2 | SAL-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | | | |
| S2-T25 | 2 | SAL-PC1 | R-CORE 192.168.40.1 | Telnet | X4, X5 | D | | | |
| S2-T26 | 2 | SAL-PC1 | R-EDGE 10.0.0.2 | Telnet | X4, X5 | D | | | |

## 6. Stage 3 runs

| Exp ID | Stage | Source | Destination | Service | Req. | Expected (planned) | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|---|---|
| S3-T01 | 3 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | | | |
| S3-T02 | 3 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS | R2 | A | | | |
| S3-T03 | 3 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | | | |
| S3-T04 | 3 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP | R4 | A (subject to P7) | | | |
| S3-T05 | 3 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS | R3 | A | | | |
| S3-T06 | 3 | IT-PC1 | R-CORE 192.168.30.1 | SSH | R5 | A | | | |
| S3-T07 | 3 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP | X1 | D | | | |
| S3-T08 | 3 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | D | | | |
| S3-T09 | 3 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | D | | | |
| S3-T10 | 3 | SAL-PC1 | HR-SRV 192.168.50.30 | HTTPS | X2 | D | | | |
| S3-T11 | 3 | SAL-PC1 | R-CORE 192.168.40.1 | SSH | X4 | D | | | |
| S3-T12 | 3 | IT-PC1 | R-CORE 192.168.30.1 | Telnet | X5 | D | | | |
| S3-T13 | 3 | HR-PC1 | WEB-SRV 192.168.50.10 | ICMP | X6 | D | | | |
| S3-T14 | 3 | IT-PC1 | FIN-SRV 192.168.50.40 | ICMP | R6 | A | | | |
| S3-T15 | 3 | EXT-HOST | WEB-SRV 192.168.50.10 | HTTP | R8 | A | | | |
| S3-T16 | 3 | EXT-HOST | FIN-SRV 192.168.50.40 | FTP | X7 | D | | | |
| S3-T17 | 3 | HR-PC1 | EXT-WEB 203.0.113.10 | HTTP | R7 | A | | | |
| S3-T18 | 3 | HR-PC1 | HR-PC2 192.168.10.12 | ICMP | U1 | A† | | | |
| S3-T19 | 3 | SAL-PC1 | R-CORE 192.168.50.1 | SSH | X4 | D | | | |
| S3-T20 | 3 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | X4 | D | | | |
| S3-T21 | 3 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | X7 | D | | | |
| S3-T22 | 3 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | R5 | A | | | |
| S3-T23 | 3 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | | | |
| S3-T24 | 3 | SAL-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | | | |
| S3-T25 | 3 | SAL-PC1 | R-CORE 192.168.40.1 | Telnet | X4, X5 | D | | | |
| S3-T26 | 3 | SAL-PC1 | R-EDGE 10.0.0.2 | Telnet | X4, X5 | D | | | |

## 7. Stage comparison

Fill this in only from the tables above and from the saved configurations. Metric definitions are in `acl-design.md` §6.1; planned values are in §6.2.

| Metric | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|
| Application points | TBD | TBD | TBD |
| ACL definitions (distinct names) | TBD | TBD | TBD |
| Explicit ACL entries | TBD | TBD | TBD |
| Match conditions (sum) | TBD | TBD | TBD |
| Order-dependent entry pairs (from config) | TBD | TBD | TBD |
| Required-flow tests passed (of 12) | TBD | TBD | TBD |
| Forbidden-flow tests permitted (of 13) | TBD | TBD | TBD |
| Sales exposed services (of 9) / unnecessary | TBD | TBD | TBD |
| Zero-match entries after the full run | TBD | TBD | TBD |
| Configuration lines changed from the previous stage | — | TBD | TBD |

## 8. Controlled misconfiguration experiments

These are reported **separately** and never mixed into §7.

| Exp ID | Base | Change | Test | Expected (planned) | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|
| M1-b | copy of Stage 2 | Deny for SAL→FIN-SRV FTP appended at the end of ACL-SAL-IN | T08 | A (the appended deny shows 0 matches; it is shadowed) | | | |
| M1-c | M1 after the fix | Deny inserted as seq 5 | T08 | D (the seq 5 counter rises) | | | |
| M2-b1 | copy of Stage 3 | DNS permit removed from ACL-HR-IN | T03 nslookup | D (a required flow is broken) | | | |
| M2-b2 | same | same | T01 by IP | A | | | |
| M2-b3 | same | same | T01 by name `http://portal.corp.test` | D | | | |

M3 (misordered permit) is **deferred** (`acl-design.md` §9).

