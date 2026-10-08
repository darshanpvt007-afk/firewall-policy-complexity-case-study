# Packet Tracer Pilot Checklist

**Purpose:** confirm every Packet Tracer behaviour the design relies on **before** the real experiment. A capability counts as available only once its step reads PASS, with evidence. Nothing below has been run yet.

## Ground rules

- **Prerequisite:** Stage 0 is complete, and the 17 selected test cases all passed with no ACLs (`BUILD-GUIDE.md` Step 3).
- **Draft scope (team decision, 2026-10-08):** run **P3, P7 and P8** only. P1, P2, P4, P5, P6 and P9 are **not run** for this draft; their checks are kept below for later use.
- Work on a **copy**: `topology/pilot.pkt`. Never turn it into a stage file.
- Use only the temporary ACLs named `PILOT-*` below. **Remove each one** (unbind it, then `no ip access-list …`) before the next step, unless the step says otherwise.
- After each step, fill in the Result line. Save evidence to `results/pilot/`. Copy the outcome into `planning/decisions-log.md`. A failure's fallback becomes a `[TEAM DECISION]`.
- PT version used: `__________`. All members must use the same version.

## Steps (do them in this order)

### P1 — DNS (R1)

1. On HR-PC1, run `nslookup portal.corp.test`. Then do the same for `www.ext.test`.
2. **PASS when:** both names return the addresses in addressing-plan §5.
3. **Fallback:** use name-based browsing as the DNS evidence, and note it.
4. Result: ____

### P2 — HTTPS in the PC browser (R2, R3)

1. On HR-PC1, browse to `https://192.168.50.30`. HR-SRV has only HTTPS enabled.
2. **PASS when:** the "HR RECORDS" page loads.
3. **Fallback:** use HTTP for R2/R3, and document the change.
4. Result: ____

### P3 — ACL match counters and clearing them (needed for all denial evidence)

1. On R-CORE, create the test ACL and bind it:
   - `ip access-list extended PILOT-CNT`
   - `permit icmp 192.168.10.0 0.0.0.255 host 192.168.50.10 echo`
   - `deny ip any any`
   - Bind it to G0/0.10 inbound.
2. Ping WEB-SRV from HR-PC1. Then browse to WEB-SRV from HR-PC1; this request should be denied.
3. Run `show access-lists PILOT-CNT`.
4. Run `clear access-list counters`, then `show access-lists PILOT-CNT` again.
5. **PASS when:** each entry shows `(n match(es))`, the counts rise as traffic is sent, and they reset to 0 after clearing.
6. Also record the client message for the denied browser request; it is used for reading denials in the test matrix.
7. **Fallback:** if there are no counters, Simulation Mode (P4) becomes the only denial evidence, and the zero-match metric is dropped. If counters exist but cannot be cleared, record values before and after each test.
8. Result: ____

### P4 — Simulation Mode shows where a packet is dropped

1. Keep PILOT-CNT bound.
2. In Simulation Mode, filter to ICMP/HTTP and repeat the denied browser request.
3. Open the PDU at R-CORE.
4. **PASS when:** the PDU details show the packet dropped at R-CORE, citing the access list.
5. **Fallback:** use counters only.
6. Remove PILOT-CNT.
7. Result: ____

### P5 — Sequence-number editing and `remark` (needed for M1-c and M2)

1. Create a test ACL with remarks and entries:
   - `ip access-list extended PILOT-SEQ`
   - `remark test`
   - `permit ip any host 192.168.50.10`
   - `permit ip any host 192.168.50.20`
2. Run `show access-lists PILOT-SEQ`.
3. Edit it:
   - `ip access-list extended PILOT-SEQ`
   - `no 20`
   - `5 deny ip any host 192.168.50.30`
4. Run `show access-lists PILOT-SEQ`.
5. **PASS when:**
   - the entries are numbered 10 and 20 (note whether remarks shift the numbering),
   - `no 20` removes the entry,
   - the new entry appears first, as seq 5.
6. **Fallback:** without sequence editing, change ACLs by deleting and re-creating them. M1-c and M2 change accordingly, and the extra effort is recorded. If remarks are rejected, drop them from the scripts.
7. Delete PILOT-SEQ.
8. Result: ____

### P6 — `established` keyword (R7 return traffic; X7)

1. On R-EDGE, create the test ACL:
   - `ip access-list extended PILOT-EST`
   - `permit tcp any 192.168.0.0 0.0.255.255 established`
   - `deny ip any any`
   - Bind it to G0/1 inbound.
2. Browse from HR-PC1 to `http://203.0.113.10`.
3. Browse from EXT-HOST to `http://192.168.50.10`.
4. Run `show access-lists PILOT-EST`.
5. **PASS when:** the inside-initiated browse succeeds (the `established` counter rises), and the outside-initiated browse fails (the deny counter rises).
6. **Fallback:** permit the return traffic by source port only (`permit tcp any eq www 192.168.0.0 0.0.255.255`). Record that this is broader than `established`.
7. Remove PILOT-EST.
8. Result: ____

### P7 — FTP through a control-port-only ACL (R4)

Background: `network-design/acl-design.md` §5.1. **Do not add any data-port entry unless this step requires it.**

1. On R-CORE, create the test ACL:
   - `ip access-list extended PILOT-FTP`
   - `permit tcp 192.168.20.0 0.0.0.255 host 192.168.50.40 eq ftp`
   - `deny ip any any`
   - Bind it to G0/0.20 inbound.
2. Run `clear access-list counters`.
3. In Simulation Mode, filtered to TCP/FTP, run from FIN-PC1:
   - `ftp 192.168.50.40`
   - log in as `finuser`
   - `dir`
   - `get <file>`
4. For each FTP packet, record its source and destination ports, and which side opened the connection.
5. Run `show access-lists PILOT-FTP`.
6. Interpret the outcome:

| Outcome | What it means | Action |
|---|---|---|
| (a) All of login, `dir` and `get` work, and the deny counter does not rise | PT carries FTP over the control port only | Keep Stage 3 as designed. Record the PT simplification for Part C. |
| (b) Login works, `dir`/`get` fail, and the deny counter rises | The data connection is blocked | Note its direction and ports from the trace. The team chooses between: adding the single minimal entry the trace requires, or switching R4 to HTTPS. Log it as a `[TEAM DECISION]`. |
| (c) Login fails | Not an ACL issue | Re-check Stage 0 |

7. Remove PILOT-FTP.
8. Result: ____ (a / b / c, with the ports observed)

### P8 — SSH, VTY coverage, access-class and alternate addresses (R5, X4)

1. **SSH works.** From IT-PC1, run `ssh -l itadmin 192.168.30.1` and `ssh -l itadmin 10.0.0.2`.
   - **PASS when:** a password prompt appears and login works.
   - If the one-line `crypto key generate rsa general-keys modulus 1024` was rejected during Stage 0, record that the interactive form was used.
2. **VTY range.** On both routers, enter `line vty 0 15`.
   - **PASS when:** the command is accepted.
   - Fallback: use `line vty 0 4` and note it.
3. **Restrict access to IT.** On both routers:
   - `ip access-list standard PILOT-VTY`
   - `permit 192.168.30.0 0.0.0.255`
   - under `line vty 0 15`: `access-class PILOT-VTY in`
4. **Test every router address from SAL-PC1.** Run `ssh -l itadmin` to each of:
   - 192.168.40.1 (own gateway)
   - 192.168.50.1 (alternate address)
   - 10.0.0.1 (alternate address)
   - 10.0.0.2 (R-EDGE)
5. Repeat the same four commands from IT-PC1.
6. **PASS when:** all four connections are refused for Sales and accepted for IT.
   - Record the exact client message for a refusal.
   - This confirms access-class protects every router address, which tests T19, T20 and T26 depend on.
7. Leave PILOT-VTY in place for P9.
8. Result: ____

### P9 — Telnet and `transport input ssh` (X5)

1. With `transport input telnet ssh`: from IT-PC1, run `telnet 192.168.30.1`. **Expect** a login prompt.
2. Set `transport input ssh` on R-CORE's VTY lines. Repeat the telnet; **expect** it to be refused. Repeat the SSH; **expect** it to still work.
3. **PASS when:** both expectations hold.
4. Clean up afterwards:
   - remove the access-class and PILOT-VTY from both routers,
   - restore `transport input telnet ssh`.
5. Result: ____

## Exit criterion (Gate G1)

- For this draft: P3, P7 and P8 are each PASS, or FAIL with the fallback recorded as a `[TEAM DECISION]` in `decisions-log.md`. (Full design: P1–P9.)
- Any script change a fallback requires has been made **before** Stage 1 is built.
