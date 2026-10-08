# ACL Design — Stages 1–3 and Misconfiguration Experiments

**Status:** `[PROPOSED DESIGN]`. The design has been validated by hand-tracing every test through the rules (§7). **Nothing in this file has been run in Packet Tracer yet.** Items marked **⚑P-xx** depend on a pilot check (`packet-tracer/PILOT-PLAN.md`).

## 1. Experimental control: what stays constant

**Condition 5 — the independent variable is policy granularity.** The following stay **identical in all three stages**:

- Topology, cabling, VLANs, addressing and routing (`addressing-plan.md`)
- Server services and host hardening (only the intended services are on)
- Requirements R1–R8 / X1–X7 / U1 (`communication-matrix.md`)
- **The enforcement (application) points:**

| AP | Device | Where | Direction | Controls traffic from |
|---|---|---|---|---|
| AP1 | R-EDGE | G0/1 | in | External zone |
| AP2 | R-CORE | G0/0.10 | in | HR |
| AP3 | R-CORE | G0/0.20 | in | Finance |
| AP4 | R-CORE | G0/0.30 | in | IT |
| AP5 | R-CORE | G0/0.40 | in | Sales |
| AP6 | R-CORE | line vty 0 15 | `access-class … in` | Anyone opening an SSH/Telnet session to R-CORE |
| AP7 | R-EDGE | line vty 0 15 | `access-class … in` | Anyone opening an SSH/Telnet session to R-EDGE |

Only the **contents** of the ACLs at these 7 points change between stages. The VTY `transport input` setting changes once, in Stage 3 (Telnet is removed); this is part of the policy and is counted as a change.

## 2. Placement validation (condition 14)

| Check | Reasoning | Verdict |
|---|---|---|
| Extended ACLs inbound on user subinterfaces | The traffic is filtered on entry, before routing. Each department's policy is then one ACL whose source is always that department's subnet. This is easy to audit. It also matches the usual guidance to place extended ACLs close to the source (the guidance needs a verified citation before it goes in the report). | Valid |
| Inbound interface ACL also filters traffic **to the router itself** | On IOS, an inbound interface ACL is checked for every IP packet received on that interface, including packets addressed to the router. So user-side ACLs can block SSH/Telnet to the gateway address. | Valid; used for X4/X5 |
| Why VTY `access-class` is still needed | A user can reach the router through **another** of its addresses: 192.168.50.1 (inside the permitted server subnet in Stage 2), or 10.0.0.1/10.0.0.2 (reachable through "permit … any"). The interface ACL alone leaves those paths open, so access-class protects the management plane whatever address is used. Tests T19/T20 check this. | Valid; a genuine "multiple enforcement points" complexity finding |
| No ACL on the server subinterface (G0/1.50) or on outbound directions | Router ACLs are **stateless**. Filtering traffic leaving the server VLAN would need return-traffic rules for every service (DNS replies, HTTP replies, FTP data). That is out of scope; it is a stated limitation and listed as an optional extension. Replies to permitted user requests therefore pass. | Valid; limitation recorded |
| Edge ACL inbound on R-EDGE G0/1 | This is the only path from the external zone. It filters before anything reaches the router or the inside. | Valid |
| Return traffic for inside-initiated web sessions at the edge | Stateless filtering, so `established` is used. It matches TCP packets with ACK or RST set, which includes the SYN-ACK. ⚑P-EST | Valid if P-EST passes |
| Standard ACL used for access-class | access-class checks only the source address, which is exactly what is needed | Valid |
| `line vty 0 15` | Covering all VTY lines stops a 6th session from bypassing access-class on lines 5–15. ⚑P-VTY (if PT only offers 0–4, use that and note it) | Valid |
| Implicit deny | Every extended ACL ends with an **explicit** `deny ip any any`. Behaviour is the same as the implicit deny, but the explicit line shows a **match counter** in `show access-lists`, which is the evidence for denied tests. ⚑P-CNT | Valid |
| No NAT | All addresses are preserved end to end, so access-class on R-EDGE sees the real IT source (192.168.30.x) | Valid; simplification |

## 3. Stage 1 — broad internal access control

**Intent:** a realistic but deliberately broad policy. The enterprise has a perimeter filter and a token internal ACL. The internal ACL only checks that traffic **comes from an internal subnet** (an anti-spoofing style check), then allows it to go anywhere. Router management is password-protected and limited to internal sources. The network is not flat: every enforcement point exists. The rules are simply coarse.

### ACL-EDGE-IN (R-EDGE G0/1 in) — the same in Stages 1 and 2

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit tcp any host 192.168.50.10 eq www` | R8 |
| 20 | `permit tcp any host 192.168.50.10 eq 443` | R8 |
| 30 | `permit tcp any 192.168.0.0 0.0.255.255 established` | R7 return traffic (broad: any source port) |
| 40 | `permit icmp any 192.168.0.0 0.0.255.255 echo-reply` | Replies to inside pings (broad) |
| 50 | `permit icmp any 192.168.0.0 0.0.255.255 unreachable` | Error messages (broad) |
| 60 | `permit icmp any 192.168.0.0 0.0.255.255 time-exceeded` | Inside traceroute (broad) |
| 70 | `deny ip any any` | X7 |

### ACL-USERS-IN — one shared ACL applied at AP2–AP5

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit ip 192.168.0.0 0.0.255.255 any` | R1–R7, but also permits X1–X6 (excess) |
| 20 | `deny ip any any` | Spoofed or non-internal sources |

### ACL-VTY (standard; R-CORE and R-EDGE) plus VTY settings

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit 192.168.0.0 0.0.255.255` | R5, but any internal user can reach the login prompt (X4) |

VTY settings: `login local`, `transport input telnet ssh`. Telnet still being allowed is the X5 excess.

**Planned size:** 3 ACL names (ACL-VTY is defined on each of the two routers), 7 application points, **11 explicit entries** (7 + 2 + 1 + 1).

## 4. Stage 2 — department-level (zone) access control

**Intent:** each department reaches the **whole server zone** and the Internet, but not other departments. Management is restricted to IT. Every rule is written in IP/subnet terms only, with no protocols or ports.

ACL-EDGE-IN is unchanged from Stage 1.

### ACL-HR-IN (AP2). ACL-FIN-IN (AP3) and ACL-SAL-IN (AP5) are identical with 192.168.20.0 and 192.168.40.0 as the source.

| Seq | Entry | Traces to | Residual excess |
|---|---|---|---|
| 10 | `permit ip 192.168.10.0 0.0.0.255 192.168.50.0 0.0.0.255` | R1, R2, R3 | X2/X3 (other departments' servers), X6 (ICMP, any port), and the router address 192.168.50.1 |
| 20 | `deny ip 192.168.10.0 0.0.0.255 192.168.0.0 0.0.255.255` | X1, X4 (gateway addresses) | Also blocks pinging its own gateway (an availability side-effect) |
| 30 | `permit ip 192.168.10.0 0.0.0.255 any` | R7 | Any protocol to the outside, and to 10.0.0.x |
| 40 | `deny ip any any` | Anti-spoofing | — |

Order dependence: entries 10/20 and 20/30 are **order-dependent pairs**.
- Swapping 10 and 20 blocks the server zone.
- Swapping 20 and 30 opens other departments.

### ACL-IT-IN (AP4)

| Seq | Entry | Traces to | Residual excess |
|---|---|---|---|
| 10 | `permit ip 192.168.30.0 0.0.0.255 192.168.50.0 0.0.0.255` | R1, R2, R6 | X2/X3 for IT |
| 20 | `permit ip 192.168.30.0 0.0.0.255 host 192.168.30.1` | R5 (R-CORE) | X5 Telnet |
| 30 | `deny ip 192.168.30.0 0.0.0.255 192.168.0.0 0.0.255.255` | X1 | — |
| 40 | `permit ip 192.168.30.0 0.0.0.255 any` | R7, R5 (R-EDGE 10.0.0.2) | Any protocol outward |
| 50 | `deny ip any any` | Anti-spoofing | — |

### ACL-VTY (both routers)

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit 192.168.30.0 0.0.0.255` | R5, X4 |

`transport input telnet ssh` is unchanged, so X5 remains as residual excess.

**Planned size:** 7 ACL names, 7 application points, **26 explicit entries** (7 + 4 + 4 + 4 + 5 + 1 + 1).

## 5. Stage 3 — service-level least privilege

**Intent:** every permit names a source subnet, a specific destination host or the server subnet, a protocol, and a port or ICMP type. The rule that denies all internal destinations is placed **before** the Internet-web permits. That ordering is essential.

### ACL-EDGE-IN (refined)

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit tcp any host 192.168.50.10 eq www` | R8 |
| 20 | `permit tcp any host 192.168.50.10 eq 443` | R8 |
| 30 | `permit tcp any eq www 192.168.0.0 0.0.255.255 established` | R7 return (source port 80 only) |
| 40 | `permit tcp any eq 443 192.168.0.0 0.0.255.255 established` | R7 return (source port 443 only) |
| 50 | `deny ip any any` | X7 (the inbound ICMP replies are now also denied) |

### ACL-HR-IN (AP2)

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit udp 192.168.10.0 0.0.0.255 host 192.168.50.20 eq domain` | R1 |
| 20 | `permit tcp 192.168.10.0 0.0.0.255 host 192.168.50.10 eq www` | R2 |
| 30 | `permit tcp 192.168.10.0 0.0.0.255 host 192.168.50.10 eq 443` | R2 |
| 40 | `permit tcp 192.168.10.0 0.0.0.255 host 192.168.50.30 eq 443` | R3 |
| 50 | `deny ip 192.168.10.0 0.0.0.255 192.168.0.0 0.0.255.255` | X1, X3, X4, X5, X6 |
| 60 | `permit tcp 192.168.10.0 0.0.0.255 any eq www` | R7 |
| 70 | `permit tcp 192.168.10.0 0.0.0.255 any eq 443` | R7 |
| 80 | `deny ip any any` | Everything else |

### ACL-FIN-IN (AP3)

This is ACL-HR-IN with source 192.168.20.0. Entry 40 becomes `permit tcp 192.168.20.0 0.0.0.255 host 192.168.50.40 eq ftp` (R4).

**⚑P-FTP:** if the pilot shows that Packet Tracer's FTP opens a separate data connection that this ACL blocks, insert one entry directly after 40:
- active mode: `permit tcp 192.168.20.0 0.0.0.255 host 192.168.50.40 eq ftp-data`, because the client's packets on the data connection go *to* server port 20;
- passive mode: `… gt 1023`, and record that as an excess permission forced by stateless filtering.

Either way, one requirement then needs two ACL entries. This is a concrete complexity observation for Part B/C.

### ACL-SAL-IN (AP5)

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit udp 192.168.40.0 0.0.0.255 host 192.168.50.20 eq domain` | R1 |
| 20 | `permit tcp 192.168.40.0 0.0.0.255 host 192.168.50.10 eq www` | R2 |
| 30 | `permit tcp 192.168.40.0 0.0.0.255 host 192.168.50.10 eq 443` | R2 |
| 40 | `deny ip 192.168.40.0 0.0.0.255 192.168.0.0 0.0.255.255` | X1–X6 |
| 50 | `permit tcp 192.168.40.0 0.0.0.255 any eq www` | R7 |
| 60 | `permit tcp 192.168.40.0 0.0.0.255 any eq 443` | R7 |
| 70 | `deny ip any any` | Everything else |

### ACL-IT-IN (AP4)

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit udp 192.168.30.0 0.0.0.255 host 192.168.50.20 eq domain` | R1 |
| 20 | `permit tcp 192.168.30.0 0.0.0.255 host 192.168.50.10 eq www` | R2 |
| 30 | `permit tcp 192.168.30.0 0.0.0.255 host 192.168.50.10 eq 443` | R2 |
| 40 | `permit icmp 192.168.30.0 0.0.0.255 192.168.50.0 0.0.0.255 echo` | R6 |
| 50 | `permit tcp 192.168.30.0 0.0.0.255 host 192.168.30.1 eq 22` | R5 (R-CORE) |
| 60 | `permit tcp 192.168.30.0 0.0.0.255 host 10.0.0.2 eq 22` | R5 (R-EDGE). Needed because entry 70 does not cover 10.0.0.2 and entries 80/90 permit web only. |
| 70 | `deny ip 192.168.30.0 0.0.0.255 192.168.0.0 0.0.255.255` | X1, X2, X3, X5 |
| 80 | `permit tcp 192.168.30.0 0.0.0.255 any eq www` | R7 |
| 90 | `permit tcp 192.168.30.0 0.0.0.255 any eq 443` | R7 |
| 100 | `deny ip any any` | Everything else |

### ACL-VTY

Unchanged from Stage 2: it permits IT only. VTY transport changes to **`transport input ssh`** (X5). Telnet is now blocked twice: by the interface ACL and by the VTY transport setting.

**Planned size:** 7 ACL names, 7 application points, **40 explicit entries** (5 + 8 + 8 + 7 + 10 + 1 + 1), or 41 if P-FTP requires the extra data-channel entry.

### Residual excess expected in Stage 3

These are design expectations, to be confirmed by tests:

- U1, same-VLAN traffic: a router ACL cannot see it.
- Entries 60/70 (HR, FIN) and 50/60 (SAL) allow web traffic to **any** non-192.168 address, including 10.0.0.x. Nothing listens there, but it is still a broader rule than required.
- `established` at the edge accepts any TCP packet that has ACK set, comes from port 80/443, and is addressed inside. A stateful firewall would track sessions instead. This cannot be demonstrated in PT, so it is discussed through the literature.
- R6 permits ICMP echo to the whole server subnet, including 192.168.50.1.

## 6. Planned size comparison

These values are planned from the design. **The measured values come from `show access-lists` after the build.**

| Measure | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|
| Application points | 7 | 7 | 7 |
| ACL names (counting each router's ACL-VTY separately) | 4 | 7 | 7 |
| Explicit entries (planned) | 11 | 26 | 40 (41) |
| Edge-ACL entries (planned) | 7 | 7 | 5 |

The last row is a design observation already visible: the most restrictive edge policy has **fewer** entries than the broad one. Entry count alone does not measure restrictiveness. This feeds expectation E3 and is to be confirmed after the build.

## 7. Design validation: expected deciding rule for every test

Notation: `HR-20` means ACL-HR-IN sequence 20; `VTY` means access-class ACL-VTY; `L2` means switched only, so no router ACL applies. **These are expected outcomes from tracing the rules by hand, not results.**

| Test | Flow | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|---|
| T01 | HR-PC1 → WEB HTTP | A (USERS-10) | A (HR-10) | A (HR-20) |
| T02 | SAL-PC1 → WEB HTTPS | A (USERS-10) | A (SAL-10) | A (SAL-30) |
| T03 | HR-PC1 → DNS nslookup | A (USERS-10) | A (HR-10) | A (HR-10) |
| T04 | FIN-PC1 → FIN-SRV FTP | A (USERS-10) | A (FIN-10) | A (FIN-40 ⚑P-FTP) |
| T05 | HR-PC1 → HR-SRV HTTPS | A (USERS-10) | A (HR-10) | A (HR-40) |
| T06 | IT-PC1 → R-CORE 192.168.30.1 SSH | A (USERS-10 + VTY) | A (IT-20 + VTY) | A (IT-50 + VTY) |
| T07 | HR-PC1 → FIN-PC1 ping | A (USERS-10) | **D** (HR-20) | **D** (HR-50) |
| T08 | SAL-PC1 → FIN-SRV FTP | A (USERS-10) | A (SAL-10) | **D** (SAL-40) |
| T09 | HR-PC1 → FIN-SRV FTP | A (USERS-10) | A (HR-10) | **D** (HR-50) |
| T10 | SAL-PC1 → HR-SRV HTTPS | A (USERS-10) | A (SAL-10) | **D** (SAL-40) |
| T11 | SAL-PC1 → R-CORE 192.168.40.1 SSH | A (USERS-10 + VTY) | **D** (SAL-20) | **D** (SAL-40) |
| T12 | IT-PC1 → R-CORE 192.168.30.1 Telnet | A (USERS-10 + VTY) | A (IT-20 + VTY) | **D** (IT-70; transport ssh) |
| T13 | HR-PC1 → WEB ping | A (USERS-10) | A (HR-10) | **D** (HR-50) |
| T14 | IT-PC1 → FIN-SRV ping | A (USERS-10) | A (IT-10) | A (IT-40) |
| T15 | EXT-HOST → WEB HTTP | A (EDGE-10) | A (EDGE-10) | A (EDGE-10) |
| T16 | EXT-HOST → FIN-SRV FTP | **D** (EDGE-70; SYN is not "established") | **D** (EDGE-70) | **D** (EDGE-50) |
| T17 | HR-PC1 → EXT-WEB HTTP | A (USERS-10; reply EDGE-30) | A (HR-30; reply EDGE-30) | A (HR-60; reply EDGE-30) |
| T18 | HR-PC1 → HR-PC2 ping | A (L2) | A (L2) | A (L2) |
| T19 | SAL-PC1 → R-CORE 192.168.50.1 SSH | A (USERS-10 + VTY) | **D** (SAL-10 permits, then **VTY** refuses) | **D** (SAL-40) |
| T20 | SAL-PC1 → R-EDGE 10.0.0.2 SSH | A (USERS-10 + R-EDGE VTY) | **D** (SAL-30 permits, then **R-EDGE VTY** refuses) | **D** (SAL-70) |
| T21 | EXT-HOST → HR-PC1 ping | **D** (EDGE-70; echo is not permitted) | **D** (EDGE-70) | **D** (EDGE-50) |
| T22 | IT-PC1 → R-EDGE 10.0.0.2 SSH | A (USERS-10 + R-EDGE VTY) | A (IT-40 + R-EDGE VTY) | A (IT-60 + R-EDGE VTY) |

Expected count of **forbidden flows permitted** among the X tests (T07–T13, T16, T19–T21; 11 tests):

| Stage | Forbidden flows permitted (of 11) |
|---|---|
| Stage 1 | 9 |
| Stage 2 | 5 (T08, T09, T10, T12, T13) |
| Stage 3 | 0 |

U1 (T18) is permitted in every stage.

All 10 required-flow tests (T01–T06, T14, T15, T17, T22) are expected to be allowed in every stage.

## 8. Controlled misconfiguration experiments

These are kept separate from the stage results (condition 10). Each runs on a **copy** of a stage file, and its results are reported in their own table, never mixed into the Stage 1–3 metrics.

### M1 — Shadowed rule. Base: copy of Stage 2 (`m1.pkt`). Router: R-CORE.

Scenario: an administrator tries to close X3 for Sales by adding a deny to the existing Stage 2 ACL **without a sequence number**. IOS appends it to the end of the ACL.

| Step | Commands | Expected observation |
|---|---|---|
| M1-a | `ip access-list extended ACL-SAL-IN` → `deny tcp 192.168.40.0 0.0.0.255 host 192.168.50.40 eq ftp` | The new entry is appended as seq 50, **after** seq 10 (`permit ip … 192.168.50.0 …`) and after seq 40 (`deny ip any any`) |
| M1-b | `clear access-list counters`; run T08 | FTP **still succeeds**. Seq 10 counter increases; seq 50 shows **no matches**. This is a shadowed rule: an earlier entry with the opposite action matches every packet the new entry would match. |
| M1-c (fix) | `no 50`, then `5 deny tcp 192.168.40.0 0.0.0.255 host 192.168.50.40 eq ftp` ⚑P-SEQ | T08 is now **denied**; the seq 5 counter increases |

If P-SEQ fails (no sequence-number editing), the fix is to remove the ACL from the interface, delete it, and re-enter it in the correct order. Record that extra effort as a maintenance-cost observation.

### M2 — Over-restriction. Base: copy of Stage 3 (`m2.pkt`). Router: R-CORE.

| Step | Commands | Expected observation |
|---|---|---|
| M2-a | `ip access-list extended ACL-HR-IN` → `no 10` (removes the DNS permit) ⚑P-SEQ | — |
| M2-b | `clear access-list counters`; run T03 (`nslookup portal.corp.test`) and T01 twice: once by IP and once by name (`http://portal.corp.test`) | nslookup **fails**; T01 by IP still works; T01 by name fails. The HR-50 counter increases. A required flow is broken by omitting a single entry. |

### M3 — optional, needs a `[TEAM DECISION]`: misordered Internet permit. Base: copy of Stage 3.

Move the SAL `permit tcp … any eq 443` entry above the `deny … 192.168.0.0 0.0.255.255` entry. Expected: T10 (Sales → HR-SRV HTTPS) becomes **allowed**. This shows order dependence directly. Run it only if time allows.

## 9. Configuration files

Stages are built cumulatively:

- `stage0` + `stage1` → `stage1.pkt`
- the Stage 2 delta applied to `stage1.pkt` → `stage2.pkt`
- the Stage 3 delta applied to `stage2.pkt` → `stage3.pkt`

The scripts are in `packet-tracer/configs/`. Each delta removes the binding, deletes the old ACL, re-creates it and re-binds it, so the procedure does not depend on sequence-number editing.
