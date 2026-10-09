# Coverage Matrix

**Status:** `[PROPOSED DESIGN]`. No test has been run. "Actual" says **pending** for the 17 tests in the draft run subset and **not run** for every other test. Evidence is "—" until a file exists in `packet-tracer/results/`.

Sources: requirements from `communication-matrix.md`; test definitions and planned outcomes from `packet-tracer/tests/test-matrix.md` §2 and §2A. Expected values are traced from the configuration scripts (Stage 0 / 1 / 2 / 3). They are **planned**, not results.

Legend: A allowed · D denied · A* allowed although forbidden · A† allowed, not filterable by a router ACL · ‡ judged at the router, not the client (test-matrix §2A).

## 1. Matrix

| Security requirement | Flow | Test ID | Run scope | Source | Destination | Protocol / port | Expected S0/S1/S2/S3 | Actual | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| R1 | Required: DNS | T03 | in 17-test subset | HR-PC1 | DNS-SRV 192.168.50.20 | UDP 53 | A/A/A/A | pending | — |
| R1 | Required: DNS | T24 | not run | SAL-PC1 | DNS-SRV 192.168.50.20 | UDP 53 | A/A/A/A | not run | — |
| R1 | Required: DNS | T29 | proposed, not run | HR-PC1 | WEB-SRV via DNS-SRV | UDP 53, then TCP 80 | A/A/A/A | not run | — |
| R2 | Required: intranet portal | T01 | in 17-test subset | HR-PC1 | WEB-SRV 192.168.50.10 | TCP 80 | A/A/A/A | pending | — |
| R2 | Required: intranet portal | T02 | not run | SAL-PC1 | WEB-SRV 192.168.50.10 | TCP 443 | A/A/A/A | not run | — |
| R2 | Required: intranet portal | T23 | not run | SAL-PC1 | WEB-SRV 192.168.50.10 | TCP 80 | A/A/A/A | not run | — |
| R2 | Required: intranet portal | T29 | proposed, not run | HR-PC1 | WEB-SRV via DNS-SRV | UDP 53, then TCP 80 | A/A/A/A | not run | — |
| R3 | Required: HR application | T05 | in 17-test subset | HR-PC1 | HR-SRV 192.168.50.30 | TCP 443 | A/A/A/A | pending | — |
| R4 | Required: Finance file service (FTP as proxy) | T04 | in 17-test subset | FIN-PC1 | FIN-SRV 192.168.50.40 | TCP 21 + data channel | A/A/A/A(P7) | pending | — |
| R5 | Required: IT router administration | T06 | in 17-test subset | IT-PC1 | R-CORE 192.168.30.1 | TCP 22 | A/A/A/A | pending | — |
| R5 | Required: IT router administration | T22 | not run | IT-PC1 | R-EDGE 10.0.0.2 | TCP 22 | A/A/A/A | not run | — |
| R6 | Required: IT ping to servers | T14 | in 17-test subset | IT-PC1 | FIN-SRV 192.168.50.40 | ICMP echo | A/A/A/A | pending | — |
| R7 | Required: Internet web | T17 | in 17-test subset | HR-PC1 | EXT-WEB 203.0.113.10 | TCP 80 | A/A/A/A | pending | — |
| R8 | Required: public website | T15 | in 17-test subset | EXT-HOST | WEB-SRV 192.168.50.10 | TCP 80 | A/A/A/A | pending | — |
| X1 | Forbidden: inter-department | T07 | in 17-test subset | HR-PC1 | FIN-PC1 192.168.20.11 | ICMP echo | A/A*/D/D | pending | — |
| X2 | Forbidden: non-HR → HR-SRV | T10 | in 17-test subset | SAL-PC1 | HR-SRV 192.168.50.30 | TCP 443 | A/A*/A*/D | pending | — |
| X3 | Forbidden: non-Finance → FIN-SRV | T08 | in 17-test subset | SAL-PC1 | FIN-SRV 192.168.50.40 | TCP 21 (control only) | A/A*/A*/D | pending | — |
| X3 | Forbidden: non-Finance → FIN-SRV | T09 | not run | HR-PC1 | FIN-SRV 192.168.50.40 | TCP 21 (control only) | A/A*/A*/D | not run | — |
| X4 | Forbidden: non-IT → routers | T11 | in 17-test subset | SAL-PC1 | R-CORE 192.168.40.1 | TCP 22 | A/A*/D/D | pending | — |
| X4 | Forbidden: non-IT → routers | T19 | in 17-test subset | SAL-PC1 | R-CORE 192.168.50.1 | TCP 22 | A/A*/D/D | pending | — |
| X4 | Forbidden: non-IT → routers | T20 | not run | SAL-PC1 | R-EDGE 10.0.0.2 | TCP 22 | A/A*/D/D | not run | — |
| X4 | Forbidden: non-IT → routers | T25 | not run | SAL-PC1 | R-CORE 192.168.40.1 | TCP 23 | A/A*/D/D | not run | — |
| X4 | Forbidden: non-IT → routers | T26 | not run | SAL-PC1 | R-EDGE 10.0.0.2 | TCP 23 | A/A*/D/D | not run | — |
| X5 | Forbidden: Telnet to routers | T12 | in 17-test subset | IT-PC1 | R-CORE 192.168.30.1 | TCP 23 | A/A*/A*/D | pending | — |
| X5 | Forbidden: Telnet to routers | T25 | not run | SAL-PC1 | R-CORE 192.168.40.1 | TCP 23 | A/A*/D/D | not run | — |
| X5 | Forbidden: Telnet to routers | T26 | not run | SAL-PC1 | R-EDGE 10.0.0.2 | TCP 23 | A/A*/D/D | not run | — |
| X6 | Forbidden: users → server ICMP / unused ports | T13 | in 17-test subset | HR-PC1 | WEB-SRV 192.168.50.10 | ICMP echo | A/A*/A*/D | pending | — |
| X6 | Forbidden: users → server ICMP / unused ports | T28 | proposed, not run | HR-PC1 | WEB-SRV 192.168.50.10 | TCP 23 (no service) | A‡/A*‡/A*‡/D | not run | — |
| X7 | Forbidden: external → anything but R8 | T16 | in 17-test subset | EXT-HOST | FIN-SRV 192.168.50.40 | TCP 21 (control only) | A/D/D/D | pending | — |
| X7 | Forbidden: external → anything but R8 | T21 | not run | EXT-HOST | HR-PC1 192.168.10.11 | ICMP echo | A/D/D/D | not run | — |
| X7 | Forbidden: external → anything but R8 | T27 | proposed, not run | EXT-HOST | HR-SRV 192.168.50.30 | TCP 443 | A/D/D/D | not run | — |
| U1 | Not filterable: intra-VLAN | T18 | in 17-test subset | HR-PC1 | HR-PC2 192.168.10.12 | ICMP echo | A/A†/A†/A† | pending | — |
## 2. Coverage assessment for the 17-test subset

| Requirement | Covered by a run test? | Limitation of the claim | Proposed fix (team decision) |
|---|---|---|---|
| R1 | Yes (T03) | HR only; `nslookup` only, no application depends on the answer | T29 |
| R2 | Yes (T01) | HR only, HTTP only | T29; T02/T23 if time allows |
| R3, R6, R7, R8 | Yes (T05, T14, T17, T15) | One source and one destination each | — |
| R4 | Yes (T04) | Depends on pilot P7; FTP stands in for a database service | — |
| R5 | **Partly** (T06) | Tested towards R-CORE only; **R-EDGE management (T22) is not tested** | Re-include T22 |
| X1 | Yes (T07) | ICMP only, one department pair | — |
| X2, X3 | Yes (T10, T08) | Sales as the only source | — |
| X4 | Yes (T11, T19) | R-CORE only; R-EDGE (T20) not tested | Re-include T20 |
| X5 | Yes (T12) | R-CORE only | — |
| X6 | **Partly** (T13) | **ICMP only.** No unused TCP port is tested, so the claim "unused services are blocked" is not supported | T28 |
| X7 | **Partly** (T16) | **One destination (FIN-SRV) and one protocol** | T27; re-include T21 |
| U1 | Yes (T18) | Shown for one VLAN | — |

Until the team decides, the report states these limitations instead of claiming full coverage of R5, X4, X6 and X7.

## 3. Representative tests asked for in the revision brief

| Requested test | Covered by | Status |
|---|---|---|
| External access to more than one destination | T16 (FIN-SRV), T27 (HR-SRV), T21 (HR-PC1) | T16 pending; T21, T27 not run |
| An unused TCP port | T28 | proposed, not run |
| SSH to both routers, authorised and unauthorised | R-CORE: T06 (authorised), T11, T19 (unauthorised). R-EDGE: T22 (authorised), T20 (unauthorised) | R-CORE pending; R-EDGE not run |
| DNS-dependent application access | T29; also M2 | not run |
| Full application access | T04 (FTP login, `dir`, `get`), T05 (HR page loads) | pending |
| Intra-VLAN traffic | T18 | pending |
