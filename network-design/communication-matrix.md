# Communication Requirements

**Status:** `[PROPOSED DESIGN]`, approved at architecture level.

This document is the **only** basis for writing ACL entries. Every Stage 2 and Stage 3 entry must cite one ID from this file.

## 1. Required flows (R)

| ID | Source | Destination | Service (port) | Business reason |
|---|---|---|---|---|
| R1 | All departments | DNS-SRV 192.168.50.20 | DNS (UDP 53) | Name resolution for all internal and external names |
| R2 | All departments | WEB-SRV 192.168.50.10 | HTTP (TCP 80), HTTPS (TCP 443) | Company intranet portal |
| R3 | HR | HR-SRV 192.168.50.30 | HTTPS (TCP 443) | HR records application |
| R4 | Finance | FIN-SRV 192.168.50.40 | FTP control (TCP 21), plus data channel as needed | Finance records (stands in for a database service) |
| R5 | IT | R-CORE 192.168.30.1, R-EDGE 10.0.0.2 | SSH (TCP 22) | Network device administration |
| R6 | IT | All servers (192.168.50.0/24) | ICMP echo | Troubleshooting reachability |
| R7 | All departments | External web (any outside address) | HTTP/HTTPS | Internet browsing |
| R8 | External | WEB-SRV 192.168.50.10 | HTTP/HTTPS | Public company website |

## 2. Forbidden flows (X)

| ID | Source | Destination | Service | Reason |
|---|---|---|---|---|
| X1 | Any department | Any other department subnet | Any | No business need; the main lateral-movement path |
| X2 | Finance, IT, Sales | HR-SRV | Any | Confidential HR data |
| X3 | HR, IT, Sales | FIN-SRV | Any | Confidential finance data |
| X4 | HR, Finance, Sales | Any router address | SSH/Telnet | Administrative privilege is limited to IT |
| X5 | Anyone, including IT | Any router | Telnet | Cleartext management protocol |
| X6 | HR, Finance, Sales | Servers | ICMP, and any port not in R1–R4 | Reduce reconnaissance and service exposure |
| X7 | External | Anything except R8 (and replies to inside-initiated sessions) | Any | Perimeter |

## 3. Uncontrollable flow (U)

| ID | Flow | Why a router ACL cannot filter it |
|---|---|---|
| U1 | PC ↔ PC inside the same VLAN (for example HR-PC1 ↔ HR-PC2) | The frames are switched at Layer 2 by SW-ACCESS and never reach R-CORE. Filtering them needs host firewalls, private VLANs or VLAN ACLs, or microsegmentation. This is direct evidence for literature theme T4. |

## 4. Zone-to-zone summary

Cell format: what is required, and **who may use it**.

| From \ To | HR | FIN | IT | SALES | WEB | DNS | HR-SRV | FIN-SRV | Routers | External |
|---|---|---|---|---|---|---|---|---|---|---|
| HR | U1 | ✗ | ✗ | ✗ | 80/443 | 53 | 443 | ✗ | ✗ | 80/443 |
| FIN | ✗ | U1 | ✗ | ✗ | 80/443 | 53 | ✗ | 21 | ✗ | 80/443 |
| IT | ✗ | ✗ | U1 | ✗ | 80/443, ICMP | 53, ICMP | ICMP | ICMP | SSH | 80/443 |
| SALES | ✗ | ✗ | ✗ | U1 | 80/443 | 53 | ✗ | ✗ | ✗ | 80/443 |
| External | ✗ | ✗ | ✗ | ✗ | 80/443 | ✗ | ✗ | ✗ | ✗ | — |

## 5. Test coverage map

Test definitions are in `packet-tracer/tests/test-matrix.md`.

| Requirement | Tests |
|---|---|
| R1 | T03, T24 (+ M2) |
| R2 | T01, T02, T23 |
| R3 | T05 |
| R4 | T04 |
| R5 | T06, T22 |
| R6 | T14 |
| R7 | T17 |
| R8 | T15 |
| X1 | T07 |
| X2 | T10 |
| X3 | T08, T09 (+ M1) |
| X4 | T11, T19, T20, T25, T26 |
| X5 | T12, T25, T26 |
| X6 | T13 |
| X7 | T16, T21 |
| U1 | T18 |

Every R and X requirement has at least one test.

## 6. Feasibility check against the final topology and Packet Tracer services (condition 9)

| Req. | Can the topology carry it? | PT service or client needed | Status |
|---|---|---|---|
| R1 | Yes: user VLAN → R-CORE → VLAN 50 | Server DNS service; PC `nslookup` | Pending pilot P1 |
| R2 | Yes | Server HTTP/HTTPS; PC web browser | Pending P2 |
| R3 | Yes | Server HTTPS; PC browser | Pending P2 |
| R4 | Yes for the control connection: TCP 21 is expected to be permitted for Finance → FIN-SRV (the required test T04) in every stage, while the forbidden FTP tests are expected to be blocked from Stage 3 (T08, T09) and at the edge (T16). In Stage 3, the FTP **data** connection would be blocked under real IOS behaviour (`acl-design.md` §5.1). | Server FTP; PC `ftp` client | **Pending pilot P7.** No data-port entry is added unless P7 shows one is needed. Fallback: HTTPS. |
| R5 | Yes. R-CORE is reached via 192.168.30.1; R-EDGE via 10.0.0.2 (routed through R-CORE G0/2) | 2911 SSH server; PC `ssh -l` | Pending P8 |
| R6 | Yes | ICMP (always available) | Pending P3 (only for counter evidence) |
| R7 | Yes: R-CORE default route → R-EDGE → 203.0.113.0/24; return through R-EDGE's 192.168.0.0/16 route | EXT-WEB HTTP/HTTPS | Pending P6 |
| R8 | Yes: R-EDGE → R-CORE → VLAN 50 | WEB-SRV HTTP | Pending P6 (for the deny side) |
| X1–X7 | Each forbidden flow is routable when no ACL applies (to be verified in Stage 0), so denying it is a real policy effect | Same clients as above | Pending the Stage 0 positive control (all 26 tests must pass with no ACLs) |
| U1 | Same VLAN, so it is switched only | ICMP | Expected by design; to be shown by T18 |

No requirement depends on a service that PT is known to lack. The database service was already replaced by FTP at the architecture stage.
