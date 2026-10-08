# Packet Tracer Pilot Plan (condition 11)

**Purpose:** verify every Packet Tracer capability the design relies on **before** the final experiment. Nothing in the design counts as feasible until its pilot row says **PASS**, with evidence.

**How to run:**
- Use `stage0.pkt` after the Stage 0 verification passes.
- Add a temporary test ACL for each check, then remove it.
- Save the pilot file as `packet-tracer/topology/pilot.pkt`. **Never** reuse it as a stage file.
- Record the result in the table below **and** in `planning/decisions-log.md`.

PT version used: `__________` (everyone must use the same version).

| ID | What to check | Procedure | PASS criterion | Fallback if FAIL | Result (PASS/FAIL, observed behaviour) | Evidence file | By / date |
|---|---|---|---|---|---|---|---|
| P-CNT | Match counters | Apply a test ACL with `permit icmp …` and `deny ip any any`; ping; run `show access-lists` | Each entry shows `(n match(es))`, and the number goes up | Use Simulation Mode as the denial evidence; drop the counter-based metrics | | | |
| P-CLR | Clearing counters | `clear access-list counters` | Counters reset to 0 | Record counter values before and after each test, and subtract | | | |
| P-EST | `established` keyword | Temporary R-EDGE G0/1 in: `permit tcp any 192.168.0.0 0.0.255.255 established`, `deny ip any any`. HR-PC1 browses EXT-WEB; EXT-HOST browses HR-PC1/WEB | Inside-initiated HTTP works; an outside-initiated SYN is denied | Permit return traffic by source port (`eq www`) and record this as a limitation | | | |
| P-FTP | FTP through an ACL | FIN-SRV FTP on. Temporary R-CORE G0/0.20 in: `permit tcp … host 192.168.50.40 eq ftp`, `deny ip any any`. FIN-PC1: `ftp 192.168.50.40`, log in, `dir`, `get` a file. Watch in Simulation Mode which ports are used. | Login and `dir`/`get` succeed with only TCP 21 permitted, **or** the exact extra port needed is identified | Add an `ftp-data` / `gt 1023` entry (acl-design §5). If FTP cannot pass an ACL at all: change R4 to HTTPS on FIN-SRV and document the change | | | |
| P-HTTPS | HTTPS in the PC browser | HR-PC1 browser `https://192.168.50.30` (HR-SRV, HTTPS only) | Page loads | Use HTTP for R3 and document the change | | | |
| P-DENY-UI | How a denied web/FTP/SSH attempt looks on the client | Deny HR → HR-SRV 443, then try it | Note the exact client message (for example "Request Timeout" or "Connection refused") so denied tests are read consistently | — (only recorded) | | | |
| P-SSH | SSH on the 2911 | Run the stage0 script, including the `crypto key generate rsa general-keys modulus 1024` line; then IT-PC1 `ssh -l itadmin 192.168.30.1` | Password prompt appears and login succeeds | Use the interactive `crypto key generate rsa` and answer 1024 | | | |
| P-VTY | `line vty 0 15` exists | Enter `line vty 0 15` | Accepted | Use `line vty 0 4` and note it | | | |
| P-ACLASS | access-class behaviour | Apply `access-class` permitting IT only; SSH from SAL-PC1 | Connection refused or closed, distinguishable from a timeout | — (only recorded) | | | |
| P-TEL | Telnet client and `transport input ssh` | `telnet 192.168.30.1` from IT-PC1, before and after `transport input ssh` | Works before, refused after | — | | | |
| P-SEQ | Sequence-number editing of named ACLs | `ip access-list extended T` → `no 20`, then `5 permit …` | Entry removed and inserted at the stated position | Delete and recreate the whole ACL (M1/M2 procedure changes; record the extra effort) | | | |
| P-REMARK | `remark` in named ACLs | Add remarks, then check `show run` and `show access-lists` | Remarks accepted; note whether they affect sequence numbering | Drop the remarks and keep traceability only in the repo | | | |
| P-DNS | DNS server and `nslookup` | DNS-SRV with A records; HR-PC1 `nslookup portal.corp.test` | Correct address returned | Use name-based browsing as the DNS evidence | | | |
| P-SIM | Simulation Mode shows where a packet is dropped and why | Filter for ICMP/TCP, send a denied flow, open the PDU at R-CORE | PDU details show the drop at R-CORE and name the ACL | Use counters only | | | |
| P-UNR | What the client sees when ping is denied | Ping across a deny entry | Record whether the output is "Destination host unreachable" or "Request timed out" | — (only recorded) | | | |
| P-SRVDEF | Default server services | Open each new Server-PT's Services tab | Record which services are on by default; confirm they can be switched off | — (only recorded) | | | |

**Exit criterion (Gate G1):** every row is PASS, or FAIL with the fallback adopted and logged as a `[TEAM DECISION]`.
