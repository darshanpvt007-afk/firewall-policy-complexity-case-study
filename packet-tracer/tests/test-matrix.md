# Experiment Matrix

Expected results come from `planning/ARCHITECTURE.md` §7 and are a **[PROPOSED DESIGN]**.

**Actual Result stays blank until the test has been run in Packet Tracer.** Every Actual entry needs:

- an evidence ID (a screenshot or a saved output file), and
- for denied tests, the matching ACL entry and its counter.

Method key:

- B = PC web browser
- NS = nslookup
- FTP = ftp client
- SSH = `ssh -l`
- TEL = telnet
- PING = ping
- SIM = Simulation Mode

| Exp ID | Stage | Source | Destination | Protocol / method | Req. ID | Expected | Actual | Evidence | Interpretation |
|---|---|---|---|---|---|---|---|---|---|
| S1-T01 | 1 | HR-PC1 | WEB-SRV | HTTP / B | R2 | Allow | | | |
| S1-T02 | 1 | SAL-PC1 | WEB-SRV | HTTPS / B | R2 | Allow | | | |
| S1-T03 | 1 | HR-PC1 | DNS-SRV | DNS / NS | R1 | Allow | | | |
| S1-T04 | 1 | FIN-PC1 | FIN-SRV | FTP | R4 | Allow | | | |
| S1-T05 | 1 | HR-PC1 | HR-SRV | HTTPS / B | R3 | Allow | | | |
| S1-T06 | 1 | IT-PC1 | R-CORE | SSH | R5 | Allow | | | |
| S1-T07 | 1 | HR-PC1 | FIN-PC1 | ICMP / PING | X1 | Allow (unnecessary) | | | |
| S1-T08 | 1 | SAL-PC1 | FIN-SRV | FTP | X3 | Allow (unnecessary) | | | |
| S1-T09 | 1 | HR-PC1 | FIN-SRV | FTP | X3 | Allow (unnecessary) | | | |
| S1-T10 | 1 | SAL-PC1 | HR-SRV | HTTPS / B | X2 | Allow (unnecessary) | | | |
| S1-T11 | 1 | SAL-PC1 | R-CORE | SSH | X4 | Allow (unnecessary) | | | |
| S1-T12 | 1 | IT-PC1 | R-CORE | Telnet / TEL | X5 | Allow (unnecessary) | | | |
| S1-T13 | 1 | HR-PC1 | WEB-SRV | ICMP / PING | X6 | Allow (unnecessary) | | | |
| S1-T14 | 1 | IT-PC1 | FIN-SRV | ICMP / PING | R6 | Allow | | | |
| S1-T15 | 1 | EXT-HOST | WEB-SRV | HTTP / B | R8 | Allow | | | |
| S1-T16 | 1 | EXT-HOST | FIN-SRV | FTP | X7 | Deny | | | |
| S1-T17 | 1 | HR-PC1 | EXT-WEB | HTTP / B | R7 | Allow | | | |
| S1-T18 | 1 | HR-PC1 | HR-PC2 | ICMP / PING | U1 | Allow (not filterable) | | | |
| S2-T01 | 2 | HR-PC1 | WEB-SRV | HTTP / B | R2 | Allow | | | |
| S2-T02 | 2 | SAL-PC1 | WEB-SRV | HTTPS / B | R2 | Allow | | | |
| S2-T03 | 2 | HR-PC1 | DNS-SRV | DNS / NS | R1 | Allow | | | |
| S2-T04 | 2 | FIN-PC1 | FIN-SRV | FTP | R4 | Allow | | | |
| S2-T05 | 2 | HR-PC1 | HR-SRV | HTTPS / B | R3 | Allow | | | |
| S2-T06 | 2 | IT-PC1 | R-CORE | SSH | R5 | Allow | | | |
| S2-T07 | 2 | HR-PC1 | FIN-PC1 | ICMP / PING | X1 | Deny | | | |
| S2-T08 | 2 | SAL-PC1 | FIN-SRV | FTP | X3 | Allow (residual) | | | |
| S2-T09 | 2 | HR-PC1 | FIN-SRV | FTP | X3 | Allow (residual) | | | |
| S2-T10 | 2 | SAL-PC1 | HR-SRV | HTTPS / B | X2 | Allow (residual) | | | |
| S2-T11 | 2 | SAL-PC1 | R-CORE | SSH | X4 | Deny | | | |
| S2-T12 | 2 | IT-PC1 | R-CORE | Telnet / TEL | X5 | Allow (residual) | | | |
| S2-T13 | 2 | HR-PC1 | WEB-SRV | ICMP / PING | X6 | Allow (residual) | | | |
| S2-T14 | 2 | IT-PC1 | FIN-SRV | ICMP / PING | R6 | Allow | | | |
| S2-T15 | 2 | EXT-HOST | WEB-SRV | HTTP / B | R8 | Allow | | | |
| S2-T16 | 2 | EXT-HOST | FIN-SRV | FTP | X7 | Deny | | | |
| S2-T17 | 2 | HR-PC1 | EXT-WEB | HTTP / B | R7 | Allow | | | |
| S2-T18 | 2 | HR-PC1 | HR-PC2 | ICMP / PING | U1 | Allow (not filterable) | | | |
| S3-T01 | 3 | HR-PC1 | WEB-SRV | HTTP / B | R2 | Allow | | | |
| S3-T02 | 3 | SAL-PC1 | WEB-SRV | HTTPS / B | R2 | Allow | | | |
| S3-T03 | 3 | HR-PC1 | DNS-SRV | DNS / NS | R1 | Allow | | | |
| S3-T04 | 3 | FIN-PC1 | FIN-SRV | FTP | R4 | Allow | | | |
| S3-T05 | 3 | HR-PC1 | HR-SRV | HTTPS / B | R3 | Allow | | | |
| S3-T06 | 3 | IT-PC1 | R-CORE | SSH | R5 | Allow | | | |
| S3-T07 | 3 | HR-PC1 | FIN-PC1 | ICMP / PING | X1 | Deny | | | |
| S3-T08 | 3 | SAL-PC1 | FIN-SRV | FTP | X3 | Deny | | | |
| S3-T09 | 3 | HR-PC1 | FIN-SRV | FTP | X3 | Deny | | | |
| S3-T10 | 3 | SAL-PC1 | HR-SRV | HTTPS / B | X2 | Deny | | | |
| S3-T11 | 3 | SAL-PC1 | R-CORE | SSH | X4 | Deny | | | |
| S3-T12 | 3 | IT-PC1 | R-CORE | Telnet / TEL | X5 | Deny | | | |
| S3-T13 | 3 | HR-PC1 | WEB-SRV | ICMP / PING | X6 | Deny | | | |
| S3-T14 | 3 | IT-PC1 | FIN-SRV | ICMP / PING | R6 | Allow | | | |
| S3-T15 | 3 | EXT-HOST | WEB-SRV | HTTP / B | R8 | Allow | | | |
| S3-T16 | 3 | EXT-HOST | FIN-SRV | FTP | X7 | Deny | | | |
| S3-T17 | 3 | HR-PC1 | EXT-WEB | HTTP / B | R7 | Allow | | | |
| S3-T18 | 3 | HR-PC1 | HR-PC2 | ICMP / PING | U1 | Allow (not filterable) | | | |
| M1-T08 | M1 | SAL-PC1 | FIN-SRV | FTP | X3 | Allow (shadowed deny) | | | |
| M2-T03 | M2 | HR-PC1 | DNS-SRV | DNS / NS | R1 | Deny (over-restriction) | | | |

## Stage comparison

Fill this in only from the tables above and from the saved configurations.

| Metric | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|
| ACLs / application points | TBD | TBD | TBD |
| ACE count (explicit) | TBD | TBD | TBD |
| Match conditions (sum) | TBD | TBD | TBD |
| Required flows permitted (of 8) | TBD | TBD | TBD |
| Forbidden flows permitted (unnecessary) | TBD | TBD | TBD |
| Exposed (server, port) pairs per non-IT user zone | TBD | TBD | TBD |
| Order-dependent ACE pairs | TBD | TBD | TBD |
| Zero-match ACEs after full run | TBD | TBD | TBD |
| Config lines changed vs previous stage | — | TBD | TBD |
