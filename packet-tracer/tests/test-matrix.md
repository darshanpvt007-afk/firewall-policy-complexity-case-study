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

**Scope:** conclusions are limited to the test cases actually run (`acl-design.md` §1.3).

**Run subset for this draft (`[TEAM DECISION]`, see `planning/decisions-log.md`).** The full 26 test cases remain the designed test set. For this draft, the same 17 test cases are run in Stage 0 and in Stages 1–3:

| Group | Test cases run |
|---|---|
| Required (8) | T01, T03, T04, T05, T06, T14, T15, T17 |
| Forbidden (8) | T07, T08, T10, T11, T12, T13, T16, T19 |
| Control (1) | T18 |

The other nine test cases (T02, T09, T20–T26) are marked **not run** in every stage. Consequences:

- The **Sales exposure metric is not measured** in this draft. It needs the full Sales sweep, which is not run.
- **Zero-match entries** are reported only relative to the 17 test cases run.
- No conclusion is drawn about the nine test cases that were not run.

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

### 2A. Proposed additional tests (designed, **not run**; team decision needed)

These close coverage gaps found when building `network-design/coverage-matrix.md`. Expected values are traced from the configuration scripts by hand; they are **planned**, not results. None is in the 17-test subset. Each stays **not run** unless the team logs a decision in `planning/decisions-log.md`.

| Test | Source | Destination | Service | Method | Req. | Exp. S0 | Exp. S1 | Exp. S2 | Exp. S3 | Gap it closes |
|---|---|---|---|---|---|---|---|---|---|---|
| T27 | EXT-HOST | HR-SRV 192.168.50.30 | HTTPS | Browser `https://192.168.50.30` | X7 | A | D | D | D | X7 is otherwise tested against one destination only (T16) |
| T28 | HR-PC1 | WEB-SRV 192.168.50.10 | TCP 23 (unused port) | `telnet 192.168.50.10` | X6 | A‡ | A*‡ | A*‡ | D | X6 is otherwise tested with ICMP only (T13) |
| T29 | HR-PC1 | WEB-SRV via DNS-SRV | DNS, then HTTP | Browser `http://portal.corp.test` | R1, R2 | A | A | A | A | No required test exercises a full name-based application access |

‡ WEB-SRV runs no service on TCP 23, so the client fails in **every** stage. T28 is judged at the router, not at the client: "A" means the packet passes R-CORE (counter of the matching permit rises, or Simulation Mode shows it forwarded), "D" means it is dropped by an ACL entry (deny counter rises). Feasibility depends on pilot P3 (counters) or P4 (Simulation Mode); if neither gives evidence, T28 is recorded as inconclusive.

**Re-including tests already designed.** The team may also move these back into the run subset:

| Test | Why |
|---|---|
| T22 (IT → R-EDGE SSH, required) | R5 is otherwise tested only towards R-CORE (T06). T22, not T06, tests R-EDGE. |
| T20 (Sales → R-EDGE SSH, forbidden) | Unauthorised SSH to R-EDGE (X4); pairs with T22 |
| T21 (EXT-HOST → HR-PC1 ICMP, forbidden) | A second X7 destination and protocol |

Adding tests changes the leakage and required-success denominators. They must then be applied in **all** stages, including Stage 0, so that the denominators stay equal across stages (`network-design/metrics-spec.md` §2).

## 3. Stage 0 baseline runs (no ACLs; positive control)

**Every test must be allowed here, including T16 and T21.** That proves each forbidden flow is routable and its service is running. A later denial can then be attributed to an ACL, not to a routing or service fault.

If any Stage 0 test fails, fix the network **before** running the pilot or any stage.

| Exp ID | Source | Destination | Service | Expected | Actual | Evidence | Notes |
|---|---|---|---|---|---|---|---|
| S0-T01 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP | A | | | |
| S0-T02 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS | A | not run | | |
| S0-T03 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS | A | | | |
| S0-T04 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP | A | | | |
| S0-T05 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS | A | | | |
| S0-T06 | IT-PC1 | R-CORE 192.168.30.1 | SSH | A | | | |
| S0-T07 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP | A | | | |
| S0-T08 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | A | | | |
| S0-T09 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | A | not run | | |
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
| S0-T20 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | A | not run | | |
| S0-T21 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | A | not run | | |
| S0-T22 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | A | not run | | |
| S0-T23 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTP | A | not run | | |
| S0-T24 | SAL-PC1 | DNS-SRV 192.168.50.20 | DNS | A | not run | | |
| S0-T25 | SAL-PC1 | R-CORE 192.168.40.1 | Telnet | A | not run | | |
| S0-T26 | SAL-PC1 | R-EDGE 10.0.0.2 | Telnet | A | not run | | |

## 4. Stage 1 runs

| Exp ID | Stage | Source | Destination | Service | Req. | Expected (planned) | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|---|---|
| S1-T01 | 1 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | | | |
| S1-T02 | 1 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS | R2 | A | not run | | |
| S1-T03 | 1 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | | | |
| S1-T04 | 1 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP | R4 | A | | | |
| S1-T05 | 1 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS | R3 | A | | | |
| S1-T06 | 1 | IT-PC1 | R-CORE 192.168.30.1 | SSH | R5 | A | | | |
| S1-T07 | 1 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP | X1 | A* | | | |
| S1-T08 | 1 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | A* | | | |
| S1-T09 | 1 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | A* | not run | | |
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
| S1-T20 | 1 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | X4 | A* | not run | | |
| S1-T21 | 1 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | X7 | D | not run | | |
| S1-T22 | 1 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | R5 | A | not run | | |
| S1-T23 | 1 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | not run | | |
| S1-T24 | 1 | SAL-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | not run | | |
| S1-T25 | 1 | SAL-PC1 | R-CORE 192.168.40.1 | Telnet | X4, X5 | A* | not run | | |
| S1-T26 | 1 | SAL-PC1 | R-EDGE 10.0.0.2 | Telnet | X4, X5 | A* | not run | | |

## 5. Stage 2 runs

| Exp ID | Stage | Source | Destination | Service | Req. | Expected (planned) | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|---|---|
| S2-T01 | 2 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | | | |
| S2-T02 | 2 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS | R2 | A | not run | | |
| S2-T03 | 2 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | | | |
| S2-T04 | 2 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP | R4 | A | | | |
| S2-T05 | 2 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS | R3 | A | | | |
| S2-T06 | 2 | IT-PC1 | R-CORE 192.168.30.1 | SSH | R5 | A | | | |
| S2-T07 | 2 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP | X1 | D | | | |
| S2-T08 | 2 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | A* | | | |
| S2-T09 | 2 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | A* | not run | | |
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
| S2-T20 | 2 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | X4 | D | not run | | |
| S2-T21 | 2 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | X7 | D | not run | | |
| S2-T22 | 2 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | R5 | A | not run | | |
| S2-T23 | 2 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | not run | | |
| S2-T24 | 2 | SAL-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | not run | | |
| S2-T25 | 2 | SAL-PC1 | R-CORE 192.168.40.1 | Telnet | X4, X5 | D | not run | | |
| S2-T26 | 2 | SAL-PC1 | R-EDGE 10.0.0.2 | Telnet | X4, X5 | D | not run | | |

## 6. Stage 3 runs

| Exp ID | Stage | Source | Destination | Service | Req. | Expected (planned) | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|---|---|
| S3-T01 | 3 | HR-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | | | |
| S3-T02 | 3 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTPS | R2 | A | not run | | |
| S3-T03 | 3 | HR-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | | | |
| S3-T04 | 3 | FIN-PC1 | FIN-SRV 192.168.50.40 | FTP | R4 | A (subject to P7) | | | |
| S3-T05 | 3 | HR-PC1 | HR-SRV 192.168.50.30 | HTTPS | R3 | A | | | |
| S3-T06 | 3 | IT-PC1 | R-CORE 192.168.30.1 | SSH | R5 | A | | | |
| S3-T07 | 3 | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP | X1 | D | | | |
| S3-T08 | 3 | SAL-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | D | | | |
| S3-T09 | 3 | HR-PC1 | FIN-SRV 192.168.50.40 | FTP | X3 | D | not run | | |
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
| S3-T20 | 3 | SAL-PC1 | R-EDGE 10.0.0.2 | SSH | X4 | D | not run | | |
| S3-T21 | 3 | EXT-HOST | HR-PC1 192.168.10.11 | ICMP | X7 | D | not run | | |
| S3-T22 | 3 | IT-PC1 | R-EDGE 10.0.0.2 | SSH | R5 | A | not run | | |
| S3-T23 | 3 | SAL-PC1 | WEB-SRV 192.168.50.10 | HTTP | R2 | A | not run | | |
| S3-T24 | 3 | SAL-PC1 | DNS-SRV 192.168.50.20 | DNS | R1 | A | not run | | |
| S3-T25 | 3 | SAL-PC1 | R-CORE 192.168.40.1 | Telnet | X4, X5 | D | not run | | |
| S3-T26 | 3 | SAL-PC1 | R-EDGE 10.0.0.2 | Telnet | X4, X5 | D | not run | | |

## 7. Stage comparison

Fill this in only from the tables above and from the **saved running configurations**. Metric definitions are in `network-design/metrics-spec.md`; configuration-derived planned values are listed there and must not be copied into this table.

| Metric | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|
| Enforcement points with an ACL bound | TBD | TBD | TBD |
| Explicit ACL entries, per definition (`metrics-spec.md` §1) | TBD | TBD | TBD |
| Explicit ACL entries, per enforcement point | TBD | TBD | TBD |
| Permit-entry specificity distribution 0/1/2/3/4 (§4) | TBD | TBD | TBD |
| Order-dependent entry pairs (§5, from config) | TBD | TBD | TBD |
| Shadowed / redundant entries (§5, from config) | TBD | TBD | TBD |
| Required test cases succeeded ÷ executed (§3) | TBD | TBD | TBD |
| Forbidden test cases succeeded ÷ executed = leakage (§2) | TBD | TBD | TBD |
| Zero-hit entries, relative to the tests run (§5; not the same as redundant) | TBD | TBD | TBD |
| Configuration lines added / deleted from the previous stage (§7) | — | TBD | TBD |
| Sales exposed services | not measured | not measured | not measured |

## 8. Controlled misconfiguration experiments

These are reported **separately** and never mixed into §7.

**Dependency:** M1-c, M2-b and M2-c need sequence-number editing (pilot P5), which is not run in the current draft scope. Both experiments stay **not run** until P5 is run or the fallback in the script is used. Steps and evidence files are in `configs/misconfig/`.

| Exp ID | Base | Change | Test | Expected (planned) | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|
| M1-0 | copy of Stage 2 | none ("before" capture) | T08 | A* (seq 10 counter rises) | not run | | |
| M1-b | M1-a: deny for SAL→FIN-SRV FTP appended at the end of ACL-SAL-IN | — | T08 | A* (appended deny shows 0 matches; shadowed per configuration) | not run | | |
| M1-c1 | M1 after the fix | appended deny removed, deny inserted as seq 5 | T08 | D (seq 5 counter rises) | not run | | |
| M1-c2 | same | same | SAL-PC1 browser `http://192.168.50.10` | A (required flow unaffected) | not run | | |
| M2-a | copy of Stage 3 | none (baseline) | T03, T01, T29 | A, A, A | not run | | |
| M2-b1 | same | DNS permit (seq 10) removed from ACL-HR-IN | T03 nslookup | D (required flow broken) | not run | | |
| M2-b2 | same | same | T01 by IP | A | not run | | |
| M2-b3 | same | same | T29 by name `http://portal.corp.test` | D (or inconclusive if the client cached the name) | not run | | |
| M2-d | same | DNS permit restored as seq 10 | T03, T01, T29 | A, A, A (recovery) | not run | | |

M3 (misordered permit) is **deferred** (`acl-design.md` §9).

