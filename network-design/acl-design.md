# ACL Design — Stages 1–3 and Misconfiguration Experiments

**Status:** `[PROPOSED DESIGN]`.

- Every rule has been traced by hand against every test (§8).
- **Nothing in this file has been run in Packet Tracer.** Every count and outcome below is **planned**, not measured.
- Items marked **⚑P-n** depend on a pilot step (`packet-tracer/PILOT-PLAN.md`).

## 1. What the experiment compares

The experiment compares **three progressively refined policy stages**:

- **Stage 1:** broad
- **Stage 2:** department-level
- **Stage 3:** service-level least privilege

Each stage is a *bundle* of refinements, **not** a change in granularity alone. Conclusions are therefore stated about the stages as wholes. A difference between stages is never attributed to one factor, such as "granularity", unless only that factor changed.

### 1.1 Held constant across all stages

- Topology, cabling, VLANs, addressing, routing (`addressing-plan.md`)
- Server services and host hardening (only the intended services are running)
- Requirements R1–R8 / X1–X7 / U1 (`communication-matrix.md`)
- The 7 enforcement points (AP1–AP7, below), their direction (always inbound), and the use of named ACLs
- The test set, test methods, source PCs and test order

| AP | Device | Where | Direction | Filters traffic from |
|---|---|---|---|---|
| AP1 | R-EDGE | G0/1 | in | External zone |
| AP2 | R-CORE | G0/0.10 | in | HR |
| AP3 | R-CORE | G0/0.20 | in | Finance |
| AP4 | R-CORE | G0/0.30 | in | IT |
| AP5 | R-CORE | G0/0.40 | in | Sales |
| AP6 | R-CORE | line vty 0 15 | `access-class … in` | Anyone opening an SSH/Telnet session to R-CORE |
| AP7 | R-EDGE | line vty 0 15 | `access-class … in` | Anyone opening an SSH/Telnet session to R-EDGE |

### 1.2 What changes between stages (all of it is part of "the stage")

| Factor | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|
| Internal ACL structure | One shared ACL at AP2–AP5 | One ACL per department | One ACL per department |
| Destination granularity | any | Zone or subnet (server subnet / internal / any) | Specific host (or the server subnet for R6) |
| Protocol and port | IP only | IP only | Protocol + port / ICMP type |
| Edge ACL (AP1) | Broad: `established` from any port; ICMP replies | Same as Stage 1 | Narrowed: `established` only from source ports 80/443; no ICMP |
| VTY access-class source | All internal (192.168.0.0/16) | IT only | IT only |
| VTY transport | telnet + ssh | telnet + ssh | **ssh only** (a non-ACL change) |
| Order-dependent entries (§6.2) | None planned | Present | More |

### 1.3 Traffic directions that are filtered and tested

| Direction | Filtered? | Tested? |
|---|---|---|
| User VLAN → servers, other VLANs, routers, external (inbound at AP2–AP5) | Yes | Yes: T01–T14, T17, T19–T20, T22–T26 |
| External → internal (inbound at AP1) | Yes | Yes: T15, T16, T21 |
| Any → router management plane (AP6/AP7) | Yes | Yes: T06, T11, T12, T19, T20, T22, T25, T26 |
| Return traffic for permitted sessions (server → user, external → user replies) | Only at AP1 (`established`, ICMP replies) | Indirectly: a session that succeeds implies its return path worked |
| **Server VLAN → anything** (server-initiated) | **No** | **No** |
| **Same-VLAN host ↔ host** | **No** (Layer 2 only) | Yes, as a control: T18 |
| Router-originated traffic, inter-server traffic, external → user other than ICMP echo | No / not applicable | No |

**Scope of conclusions.** Results apply **only to the 26 test cases**, in this topology, under Packet Tracer's protocol models. Untested source/destination/service combinations are described as "expected by rule trace" and never reported as observed.

## 2. Placement validation

| Check | Reasoning | Verdict |
|---|---|---|
| Extended ACLs inbound on user subinterfaces | The traffic is filtered before routing. Each ACL's source is a single department, which keeps each ACL auditable. Placing extended ACLs near the source is common guidance, but it needs a verified citation before it goes in the report. | Valid |
| Inbound interface ACL also filters traffic *to* the router | An inbound IOS interface ACL is checked for every IP packet arriving on that interface, including packets addressed to the router. So the user-side ACLs can block SSH/Telnet to the gateway address. | Valid |
| VTY `access-class` is still needed | A user can reach a router through a different address: 192.168.50.1 (inside the permitted server subnet in Stage 2), or 10.0.0.1/10.0.0.2 (reachable via "permit … any"). The access-class covers every path. Tests T19, T20, T26 check this. | Valid |
| No ACL on G0/1.50 and no outbound ACLs | Router ACLs are stateless. Filtering traffic leaving the server VLAN would need return-traffic rules for every service. This is out of scope and recorded as a limitation (§1.3). | Valid; limitation |
| Edge ACL inbound on R-EDGE G0/1 | This is the only path from the external zone | Valid |
| `established` for inside-initiated web sessions | It matches TCP packets with ACK or RST set, which includes the SYN-ACK. ⚑P6 | Valid if P6 passes |
| A standard ACL for access-class | access-class checks only the source address | Valid |
| `line vty 0 15` | Prevents sessions on lines 5–15 from bypassing the access-class. ⚑P8 | Valid if P8 passes |
| An explicit `deny ip any any` at the end of each extended ACL | It behaves the same as the implicit deny, but it shows a match counter, which is the evidence for denials. ⚑P3 | Valid |
| No NAT | The source address is preserved, so R-EDGE's access-class sees 192.168.30.x | Valid; simplification |

## 3. Stage 1 — broad policy

**Intent:** realistic but deliberately broad.

- The edge filters inbound traffic.
- One shared internal ACL checks only that the source is internal (anti-spoofing), then permits any destination.
- Router logins are allowed from any internal address, by Telnet or SSH.
- Every enforcement point exists; the rules are simply coarse. This is **not** a flat network.

### ACL-EDGE-IN (AP1). Stages 1 and 2.

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit tcp any host 192.168.50.10 eq www` | R8 |
| 20 | `permit tcp any host 192.168.50.10 eq 443` | R8 |
| 30 | `permit tcp any 192.168.0.0 0.0.255.255 established` | R7 return traffic (broad: any source port) |
| 40 | `permit icmp any 192.168.0.0 0.0.255.255 echo-reply` | Replies to inside pings (broad) |
| 50 | `permit icmp any 192.168.0.0 0.0.255.255 unreachable` | Error messages (broad) |
| 60 | `permit icmp any 192.168.0.0 0.0.255.255 time-exceeded` | Inside traceroute (broad) |
| 70 | `deny ip any any` | X7 |

### ACL-USERS-IN — one shared ACL bound at AP2–AP5

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit ip 192.168.0.0 0.0.255.255 any` | R1–R7. Also permits X1–X6 (excess). |
| 20 | `deny ip any any` | Spoofed / non-internal sources |

### ACL-VTY (standard). Defined separately on R-CORE and R-EDGE.

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit 192.168.0.0 0.0.255.255` | R5. Also lets any internal user reach the login prompt (X4). |

VTY: `login local`, `transport input telnet ssh` (X5 excess).

**Planned size:**

- **4 ACL definitions:** ACL-EDGE-IN, ACL-USERS-IN, and ACL-VTY on each router. That is 3 distinct names, because ACL-VTY appears on both routers.
- **7 application points**
- **11 explicit entries** (7 + 2 + 1 + 1)

## 4. Stage 2 — department-level policy

**Intent:**

- Each department may reach the **whole server subnet** and the outside.
- No department may reach another department.
- Management access is restricted to IT.
- Rules use IP addresses and subnets only, with no protocols or ports.

ACL-EDGE-IN is unchanged.

### ACL-HR-IN (AP2)

ACL-FIN-IN (AP3) and ACL-SAL-IN (AP5) are identical, with source 192.168.20.0 and 192.168.40.0.

| Seq | Entry | Traces to | Residual excess |
|---|---|---|---|
| 10 | `permit ip 192.168.10.0 0.0.0.255 192.168.50.0 0.0.0.255` | R1, R2, R3 | X2/X3 (other departments' servers); X6 (ICMP, any port); router address 192.168.50.1 |
| 20 | `deny ip 192.168.10.0 0.0.0.255 192.168.0.0 0.0.255.255` | X1, X4 (gateway addresses) | Also blocks pinging the department's own gateway (an availability side-effect) |
| 30 | `permit ip 192.168.10.0 0.0.0.255 any` | R7 | Any protocol to the outside and to 10.0.0.x |
| 40 | `deny ip any any` | Anti-spoofing | — |

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

Transport is still `telnet ssh`, so X5 remains as residual excess.

**Planned size:**

- **7 ACL definitions:** EDGE, HR, FIN, IT, SAL, and ACL-VTY on each router. That is 6 distinct names.
- **7 application points**
- **26 explicit entries** (7 + 4 + 4 + 4 + 5 + 1 + 1)

## 5. Stage 3 — service-level least privilege

**Intent:**

- Every permit names a source subnet, a destination host (or the server subnet for R6), a protocol, and a port or ICMP type.
- The entry that denies all internal destinations sits **before** the Internet-web permits.

### ACL-EDGE-IN (refined)

| Seq | Entry | Traces to |
|---|---|---|
| 10 | `permit tcp any host 192.168.50.10 eq www` | R8 |
| 20 | `permit tcp any host 192.168.50.10 eq 443` | R8 |
| 30 | `permit tcp any eq www 192.168.0.0 0.0.255.255 established` | R7 return (source port 80) |
| 40 | `permit tcp any eq 443 192.168.0.0 0.0.255.255 established` | R7 return (source port 443) |
| 50 | `deny ip any any` | X7 (inbound ICMP replies are now denied too) |

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

This is ACL-HR-IN with source 192.168.20.0. Entry 40 becomes:

`permit tcp 192.168.20.0 0.0.0.255 host 192.168.50.40 eq ftp` (R4, FTP control)

**No FTP data-port entry is included.** One is added only if pilot P7 shows it is required (§5.1).

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
| 60 | `permit tcp 192.168.30.0 0.0.0.255 host 10.0.0.2 eq 22` | R5 (R-EDGE). Entry 70 does not cover 10.0.0.2, and entries 80/90 permit web only. |
| 70 | `deny ip 192.168.30.0 0.0.0.255 192.168.0.0 0.0.255.255` | X1, X2, X3, X5 |
| 80 | `permit tcp 192.168.30.0 0.0.0.255 any eq www` | R7 |
| 90 | `permit tcp 192.168.30.0 0.0.0.255 any eq 443` | R7 |
| 100 | `deny ip any any` | Everything else |

### ACL-VTY

- Unchanged: IT only.
- VTY transport becomes `transport input ssh` (X5).

**Planned size:**

- **7 ACL definitions**, 7 application points
- **40 explicit entries** (5 + 8 + 8 + 7 + 10 + 1 + 1)
- This would change only if pilot P7 leads the team to add an FTP data-channel entry.

### Residual excess expected in Stage 3

This is design expectation only.

- **U1 (same-VLAN traffic):** a router ACL cannot see it.
- **Web to any external address:** HR/FIN entries 60/70 and SAL entries 50/60 permit web traffic to *any* non-192.168 address, including 10.0.0.x.
- **`established` at the edge:** it accepts any TCP packet with ACK set from source port 80/443 to the inside. A stateful firewall would track sessions instead. This cannot be shown in PT, so it is discussed through the literature.
- **R6 scope:** R6 permits ICMP echo to the whole server subnet, including 192.168.50.1.

### 5.1 FTP (R4) path analysis against the current placement

**Setup.** The client is FIN-PC1 (192.168.20.11). The server is FIN-SRV (192.168.50.40). The only ACL on the path is AP3 (G0/0.20, inbound), which sees **only packets sent by Finance hosts**. Packets sent by FIN-SRV enter R-CORE on G0/1.50, which has no ACL, and leave on G0/0.20, where there is no outbound ACL. So server-to-client packets are never filtered internally.

Real FTP uses two TCP connections. The control connection carries login and commands. A separate data connection carries `dir` listings and file transfers. How the data connection is set up depends on the mode:

| Connection | Packets from the client (checked by AP3) | Packets from the server (not filtered) | Stage 3 AP3 decision for the client's packets |
|---|---|---|---|
| Control (both modes) | client:ephemeral → server:**21** | server:21 → client:ephemeral | Expected to be permitted by FIN-40 (`eq ftp`), **for Finance → FIN-SRV only** (the required test T04). Port 21 is not opened for anyone else: the forbidden FTP tests are expected to be blocked from Stage 3 (T08, T09) and at the edge in every stage (T16). |
| Data, **active mode** (PORT) | The server opens the connection, from server:**20** to client:N. The client's SYN-ACK and every later ACK go from client:N → server:**20**. | Server's SYN and data from server:20 → client:N | **Denied by FIN-50.** Port 20 is not 21, and 192.168.50.40 is inside 192.168.0.0/16. |
| Data, **passive mode** (PASV) | client:ephemeral → server:**P**, where P is a high port the server announces | server:P → client | **Denied by FIN-50.** P is not 21. |

Consequences:

- **Stages 1 and 2:** FTP should work fully in either mode, because Finance may send any IP traffic to the server subnet (USERS-10 / FIN-10).
- **Stage 3, as designed:** with real IOS behaviour, only the control connection would pass. Login would succeed, but `dir` and `get` would fail, so R4 would *not* be fully met. Whether this happens in **Packet Tracer** depends on whether PT models a separate data connection and in which mode. That is unknown until pilot P7.
- **Decision rule (no rule added in advance):**

| P7 outcome | Action |
|---|---|
| (a) `dir`/`get` work with only TCP 21 permitted, and the deny entry's counter does not rise | Keep Stage 3 as designed. Record in Part C that PT does not reproduce FTP's separate data connection, so the experiment understates the cost of handling FTP with stateless ACLs. |
| (b) `dir`/`get` fail and the deny counter rises | Read the ports used from Simulation Mode, then the **team decides** between two options, logged in `decisions-log.md`. Option 1: add the single minimal entry the observation requires (`eq ftp-data` for active mode, or a port range for passive mode). A passive-mode range is reported as excess permission forced by stateless filtering. Option 2: change R4 to HTTPS on FIN-SRV, and document the substitution. |
| (c) Login itself fails | This is not an ACL-design question. Troubleshoot Stage 0 first. |

- **The forbidden FTP tests (T08, T09, T16)** only need the control connection to be refused, so they are unaffected by the data-channel question. Planned expectations: T08 and T09 allowed (excess) in Stages 1–2 and blocked in Stage 3; T16 blocked at the edge in every stage. None of this has been verified in Packet Tracer.

## 6. Metric definitions and planned values

All values are **planned**, derived from the design. Measured values come only from the saved configurations and test runs.

### 6.1 Definitions

| Metric | Definition |
|---|---|
| **ACL definitions** | Number of ACLs configured, counting an ACL with the same name on two routers twice. Distinct names are reported alongside. |
| **Application points** | Number of interface/direction or VTY bindings (AP1–AP7) |
| **Explicit entries** | Permit/deny entries shown by `show access-lists`. Remarks and the implicit deny are excluded. |
| **Match conditions** | For each explicit entry, count the fields that are not wildcards, from: source, destination, protocol (other than `ip`), source port, destination port or ICMP type, `established`. Sum over all entries. |
| **Exposed service** | A (destination host, service) pair from the **service inventory** below that is actually running in our build **and** that a given source can use under the stage's policy, **as shown by a test**. For SSH/Telnet, "can use" means the login prompt appears. ICMP is reported separately and is not a service. Exposure is measured only for **Sales** (SAL-PC1), because only Sales is tested against every inventory item (T02, T08, T10, T11, T19, T20, T23–T26). It is not extrapolated to other departments. The inventory contains **internal services only**; Sales' Internet browsing (R7) is not part of the exposure sweep and is not tested from Sales. |
| **Unnecessary exposure** | Exposed services minus those Sales requires (WEB:80, WEB:443, DNS:53) |
| **Order-dependent entry pair** | Two entries in the same ACL, *i* before *j*, with **opposite actions**, whose match sets **overlap** (some packet matches both). Swapping them changes the decision for the overlapping packets. The terminal `deny ip any any` is excluded, because every permit trivially overlaps it. Pairs with the *same* action that overlap are counted separately as **redundancy candidates**. This is a structural property of the configuration. It is observed in traffic only through M1. |
| **Zero-match entries** | Explicit entries whose counter is still 0 after the full test run. These are *candidates* for redundancy or shadowing, relative to the 26 test cases only. |
| **Lines changed** | Number of added plus removed lines between consecutive saved `show running-config` files |

**Service inventory (9 items):**

- WEB-SRV: TCP 80
- WEB-SRV: TCP 443
- DNS-SRV: UDP 53
- HR-SRV: TCP 443
- FIN-SRV: TCP 21
- R-CORE: SSH
- R-CORE: Telnet
- R-EDGE: SSH
- R-EDGE: Telnet

A router service counts as exposed only if it is reachable on an address **actually tested** from SAL-PC1:

- R-CORE SSH: 192.168.40.1 (T11) and 192.168.50.1 (T19)
- R-CORE Telnet: 192.168.40.1 (T25)
- R-EDGE SSH: 10.0.0.2 (T20)
- R-EDGE Telnet: 10.0.0.2 (T26)

Other router addresses (for example 10.0.0.1, or Telnet to 192.168.50.1) are not tested in the stages, so the metric says nothing about them. The Telnet items are expected to stop being available in Stage 3 because `transport input ssh` removes them.

### 6.2 Planned values

| Measure (planned) | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|
| Application points | 7 | 7 | 7 |
| ACL definitions (distinct names) | 4 (3) | 7 (6) | 7 (6) |
| Explicit entries | 11 | 26 | 40 |
| Edge-ACL entries | 7 | 7 | 5 |
| Order-dependent pairs | 0 | 9 | 24 |
| Required-flow tests passing (of 12) | 12 | 12 | 12 (T04 depends on P7) |
| Forbidden-flow tests permitted (of 13) | 11 | 5 | 0 |
| Sales: exposed services (of 9) / unnecessary | 9 / 6 | 5 / 2 | 3 / 0 |

How the order-dependent pairs were counted:

- **Stage 2:** 9 in total.
  - HR, FIN and SAL each have 2 pairs: (10, 20) and (20, 30).
  - IT has 3 pairs: (10, 30), (20, 30) and (30, 40).
- **Stage 3:** 24 in total.
  - HR has 6: permits 10–40 each overlap deny 50; deny 50 overlaps permits 60 and 70.
  - FIN has 6, for the same reasons.
  - SAL has 5: permits 10–30 overlap deny 40; deny 40 overlaps permits 50 and 60.
  - IT has 7: permits 10–50 overlap deny 70; permit 60 (host 10.0.0.2) does **not** overlap deny 70; deny 70 overlaps permits 80 and 90.
- **Edge ACLs** have no deny entries other than the terminal one, so they contribute none.

The edge ACL gets *shorter* in Stage 3 while becoming stricter. So entry count alone does not measure restrictiveness. This is a planned observation, to be confirmed after the build.

## 7. Required vs forbidden test groups

| Group | Tests |
|---|---|
| **Required (12)** | T01–T06, T14, T15, T17, T22, T23, T24 |
| **Forbidden (13)** | T07–T13, T16, T19–T21, T25, T26 |
| **Control** | T18 (U1, same VLAN) |

## 8. Design validation: expected deciding entry for every test

Notation:

- `HR-20` = ACL-HR-IN sequence 20
- `VTY` = the access-class on the target router
- `L2` = switched only, so no router ACL applies

**These are planned outcomes, from tracing the rules by hand.** Stage 0 has no ACLs, so every test is expected to succeed there (see BUILD-GUIDE).

| Test | Flow | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|---|
| T01 | HR-PC1 → WEB HTTP | A (USERS-10) | A (HR-10) | A (HR-20) |
| T02 | SAL-PC1 → WEB HTTPS | A (USERS-10) | A (SAL-10) | A (SAL-30) |
| T03 | HR-PC1 → DNS nslookup | A (USERS-10) | A (HR-10) | A (HR-10) |
| T04 | FIN-PC1 → FIN-SRV FTP (login + dir + get) | A (USERS-10) | A (FIN-10) | A (FIN-40), **subject to P7** (§5.1) |
| T05 | HR-PC1 → HR-SRV HTTPS | A (USERS-10) | A (HR-10) | A (HR-40) |
| T06 | IT-PC1 → R-CORE 192.168.30.1 SSH | A (USERS-10 + VTY) | A (IT-20 + VTY) | A (IT-50 + VTY) |
| T07 | HR-PC1 → FIN-PC1 ping | A* (USERS-10) | D (HR-20) | D (HR-50) |
| T08 | SAL-PC1 → FIN-SRV FTP | A* (USERS-10) | A* (SAL-10) | D (SAL-40) |
| T09 | HR-PC1 → FIN-SRV FTP | A* (USERS-10) | A* (HR-10) | D (HR-50) |
| T10 | SAL-PC1 → HR-SRV HTTPS | A* (USERS-10) | A* (SAL-10) | D (SAL-40) |
| T11 | SAL-PC1 → R-CORE 192.168.40.1 SSH | A* (USERS-10 + VTY) | D (SAL-20) | D (SAL-40) |
| T12 | IT-PC1 → R-CORE 192.168.30.1 Telnet | A* (USERS-10 + VTY) | A* (IT-20 + VTY) | D (IT-70; transport ssh) |
| T13 | HR-PC1 → WEB ping | A* (USERS-10) | A* (HR-10) | D (HR-50) |
| T14 | IT-PC1 → FIN-SRV ping | A (USERS-10) | A (IT-10) | A (IT-40) |
| T15 | EXT-HOST → WEB HTTP | A (EDGE-10) | A (EDGE-10) | A (EDGE-10) |
| T16 | EXT-HOST → FIN-SRV FTP | D (EDGE-70; a SYN is not "established") | D (EDGE-70) | D (EDGE-50) |
| T17 | HR-PC1 → EXT-WEB HTTP | A (USERS-10; reply EDGE-30) | A (HR-30; reply EDGE-30) | A (HR-60; reply EDGE-30) |
| T18 | HR-PC1 → HR-PC2 ping | A† (L2) | A† (L2) | A† (L2) |
| T19 | SAL-PC1 → R-CORE 192.168.50.1 SSH | A* (USERS-10 + VTY) | D (SAL-10 permits; **VTY** refuses) | D (SAL-40) |
| T20 | SAL-PC1 → R-EDGE 10.0.0.2 SSH | A* (USERS-10 + R-EDGE VTY) | D (SAL-30 permits; **R-EDGE VTY** refuses) | D (SAL-70) |
| T21 | EXT-HOST → HR-PC1 ping | D (EDGE-70; echo is not permitted) | D (EDGE-70) | D (EDGE-50) |
| T22 | IT-PC1 → R-EDGE 10.0.0.2 SSH | A (USERS-10 + R-EDGE VTY) | A (IT-40 + R-EDGE VTY) | A (IT-60 + R-EDGE VTY) |
| T23 | SAL-PC1 → WEB HTTP | A (USERS-10) | A (SAL-10) | A (SAL-20) |
| T24 | SAL-PC1 → DNS nslookup | A (USERS-10) | A (SAL-10) | A (SAL-10) |
| T25 | SAL-PC1 → R-CORE 192.168.40.1 Telnet | A* (USERS-10 + VTY) | D (SAL-20) | D (SAL-40) |
| T26 | SAL-PC1 → R-EDGE 10.0.0.2 Telnet | A* (USERS-10 + R-EDGE VTY) | D (SAL-30 permits; **R-EDGE VTY** refuses) | D (SAL-70) |

Legend: A = allowed; A* = allowed although forbidden; A† = allowed, and a router ACL cannot filter it; D = denied.

## 9. Controlled misconfiguration experiments

These are kept **separate** from the stage results:

- Each experiment runs on a **copy** of a stage file.
- Results go only in the M section of the test matrix.
- They never feed into the Stage 1–3 metrics.

### M1 — Shadowed rule

**Base:** copy of **Stage 2** (`m1.pkt`). **Router:** R-CORE.

**Scenario:** an administrator tries to close X3 for Sales by adding a deny **without a sequence number**, so IOS appends it to the end of ACL-SAL-IN.

| Step | Commands | Planned observation |
|---|---|---|
| M1-a | `ip access-list extended ACL-SAL-IN` → `deny tcp 192.168.40.0 0.0.0.255 host 192.168.50.40 eq ftp` | The entry is appended after seq 40, so it gets seq 50 (⚑P5 confirms the numbering) |
| M1-b | `clear access-list counters`; run T08 | FTP still succeeds. The seq 10 counter rises; seq 50 shows no matches. This is a shadowed rule: an earlier entry with the opposite action matches every packet the new entry would match. |
| M1-c (fix) | `no 50`, then `5 deny tcp 192.168.40.0 0.0.0.255 host 192.168.50.40 eq ftp` ⚑P5 | T08 is denied; the seq 5 counter rises |

If P5 shows that sequence-number editing is not supported, M1-c is done instead by: unbinding the ACL, deleting it, re-creating it in the correct order, and re-binding it. Record the extra steps as a maintenance-cost observation.

### M2 — Over-restriction

**Base:** copy of **Stage 3** (`m2.pkt`). **Router:** R-CORE.

| Step | Commands | Planned observation |
|---|---|---|
| M2-a | `ip access-list extended ACL-HR-IN` → `no 10` (removes the DNS permit; confirm the number with ⚑P5) | — |
| M2-b | `clear access-list counters`, then from HR-PC1 run three checks: T03 (`nslookup portal.corp.test`); T01 by IP; T01 by name (`http://portal.corp.test`) | nslookup fails; T01 by IP works; T01 by name fails. The HR-50 counter rises. One missing entry breaks a required flow. |

### M3 — Deferred

A misordered-permit experiment is **deferred** and is not part of the planned work. It would move an Internet-443 permit above the deny-internal entry in ACL-SAL-IN, so that T10 becomes allowed. M1 already demonstrates order dependence, and §6 counts it structurally. M3 can be reinstated only by a logged `[TEAM DECISION]`, after Stages 1–3, M1 and M2 are complete. If reinstated, it needs its own written procedure before it is run.

## 10. Configuration files

Stages are built cumulatively:

| Start file | Apply | Save as |
|---|---|---|
| `stage0.pkt` | Stage 1 scripts | `stage1.pkt` |
| `stage1.pkt` | Stage 2 delta | `stage2.pkt` |
| `stage2.pkt` | Stage 3 delta | `stage3.pkt` |

The scripts are in `packet-tracer/configs/`. Each delta unbinds the ACL, deletes it, re-creates it and re-binds it, so building the stages does not depend on sequence-number editing.
