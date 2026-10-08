# Network Design — Addressing, Devices and Cabling

**Status:** `[PROPOSED DESIGN]`. Based on the approved architecture (`planning/ARCHITECTURE.md` §5). **Not yet built or tested.**

## 1. Design refinements since architecture approval

| # | Change | Reason |
|---|---|---|
| D1 | **VLAN 99 (switch management) is deferred.** It is no longer part of the core build. | One /24 cannot sit on two router subinterfaces (G0/0 and G0/1). Supporting it would need a second management subnet, adding configuration without adding to the research question. The routers stay as the management targets (R5/X4/X5). Listed as an optional extension in §8. |
| D2 | **SW-EXT stays unconfigured** (all ports in VLAN 1). | It only joins the two external hosts to R-EDGE. Nothing on it is tested. |
| D3 | **Each server runs only its intended service(s).** | Packet Tracer servers enable several services by default (for example HTTP/HTTPS/FTP). If those stayed on, service exposure would depend on server defaults rather than on our network policy. This counts as host hardening and is kept identical in every stage, so only the ACLs change between stages. |

## 2. Device inventory (19 devices)

| Device | PT model | Role | Zone |
|---|---|---|---|
| R-CORE | ISR 2911 | Router-on-a-stick inter-VLAN routing; internal ACLs (Stages 2–3); SSH target | Core / MGMT |
| R-EDGE | ISR 2911 | Perimeter router; edge ACL (all stages); SSH target | Edge / MGMT |
| SW-ACCESS | 2960-24TT | Access switch for the 4 department VLANs | USER |
| SW-SERVER | 2960-24TT | Access switch for the server VLAN | SERVER |
| SW-EXT | 2960-24TT | Joins the simulated external hosts | EXTERNAL |
| HR-PC1, HR-PC2 | PC-PT | HR users | USER/HR |
| FIN-PC1, FIN-PC2 | PC-PT | Finance users | USER/FIN |
| IT-PC1, IT-PC2 | PC-PT | IT administrators | USER/IT |
| SAL-PC1, SAL-PC2 | PC-PT | Sales users | USER/SALES |
| WEB-SRV | Server-PT | Intranet / public portal (HTTP, HTTPS) | SERVER |
| DNS-SRV | Server-PT | Internal DNS | SERVER |
| HR-SRV | Server-PT | HR records application (HTTPS) | SERVER |
| FIN-SRV | Server-PT | Finance records service (FTP), standing in for a database | SERVER |
| EXT-WEB | Server-PT | External website | EXTERNAL |
| EXT-HOST | PC-PT | External client (an Internet user) | EXTERNAL |

## 3. VLANs and subnets

| VLAN | Name | Subnet | Mask | Gateway | Gateway interface | Usable range used |
|---|---|---|---|---|---|---|
| 10 | HR | 192.168.10.0 | /24 (255.255.255.0) | 192.168.10.1 | R-CORE G0/0.10 | .11–.12 |
| 20 | FINANCE | 192.168.20.0 | /24 | 192.168.20.1 | R-CORE G0/0.20 | .11–.12 |
| 30 | IT | 192.168.30.0 | /24 | 192.168.30.1 | R-CORE G0/0.30 | .11–.12 |
| 40 | SALES | 192.168.40.0 | /24 | 192.168.40.1 | R-CORE G0/0.40 | .11–.12 |
| 50 | SERVERS | 192.168.50.0 | /24 | 192.168.50.1 | R-CORE G0/1.50 | .10, .20, .30, .40 |
| — | Transit | 10.0.0.0 | /30 (255.255.255.252) | — | R-CORE G0/2 ↔ R-EDGE G0/0 | .1, .2 |
| — | External | 203.0.113.0 | /24 | 203.0.113.1 | R-EDGE G0/1 | .10, .50 |

Why this address plan:

- **Summarisation.** All internal subnets fall inside **192.168.0.0/16** (wildcard `0.0.255.255`), so one ACL entry can match "any internal destination", and R-EDGE needs only one route back. Address planning that makes policy summarisable is itself a policy-management technique to discuss in Part A, theme T5.
- **Readable addresses.** The third octet equals the VLAN ID, which makes ACLs and screenshots easier to read and to defend in the viva.
- **Transit link.** A /30 is the smallest subnet with two usable hosts.
- **External range.** 203.0.113.0/24 is an IANA documentation range (RFC 5737 — `[UNVERIFIED]`; P4 must verify before citing). It stands in for "the Internet" without using real public addresses.

## 4. Interface addressing

| Device | Interface | Mode / encapsulation | IP address | Connected to |
|---|---|---|---|---|
| R-CORE | G0/0 | Trunk parent (no IP) | — | SW-ACCESS G0/1 |
| R-CORE | G0/0.10 | dot1Q 10 | 192.168.10.1/24 | VLAN 10 |
| R-CORE | G0/0.20 | dot1Q 20 | 192.168.20.1/24 | VLAN 20 |
| R-CORE | G0/0.30 | dot1Q 30 | 192.168.30.1/24 | VLAN 30 |
| R-CORE | G0/0.40 | dot1Q 40 | 192.168.40.1/24 | VLAN 40 |
| R-CORE | G0/1 | Trunk parent (no IP) | — | SW-SERVER G0/1 |
| R-CORE | G0/1.50 | dot1Q 50 | 192.168.50.1/24 | VLAN 50 |
| R-CORE | G0/2 | Routed | 10.0.0.1/30 | R-EDGE G0/0 |
| R-EDGE | G0/0 | Routed | 10.0.0.2/30 | R-CORE G0/2 |
| R-EDGE | G0/1 | Routed | 203.0.113.1/24 | SW-EXT G0/1 |

## 5. Host and server settings (configured in the GUI: Desktop → IP Configuration)

All internal hosts use **DNS = 192.168.50.20**. External hosts need no DNS.

| Host | IP | Mask | Gateway | DNS | SW port | VLAN |
|---|---|---|---|---|---|---|
| HR-PC1 | 192.168.10.11 | 255.255.255.0 | 192.168.10.1 | 192.168.50.20 | SW-ACCESS Fa0/1 | 10 |
| HR-PC2 | 192.168.10.12 | 255.255.255.0 | 192.168.10.1 | 192.168.50.20 | SW-ACCESS Fa0/2 | 10 |
| FIN-PC1 | 192.168.20.11 | 255.255.255.0 | 192.168.20.1 | 192.168.50.20 | SW-ACCESS Fa0/3 | 20 |
| FIN-PC2 | 192.168.20.12 | 255.255.255.0 | 192.168.20.1 | 192.168.50.20 | SW-ACCESS Fa0/4 | 20 |
| IT-PC1 | 192.168.30.11 | 255.255.255.0 | 192.168.30.1 | 192.168.50.20 | SW-ACCESS Fa0/5 | 30 |
| IT-PC2 | 192.168.30.12 | 255.255.255.0 | 192.168.30.1 | 192.168.50.20 | SW-ACCESS Fa0/6 | 30 |
| SAL-PC1 | 192.168.40.11 | 255.255.255.0 | 192.168.40.1 | 192.168.50.20 | SW-ACCESS Fa0/7 | 40 |
| SAL-PC2 | 192.168.40.12 | 255.255.255.0 | 192.168.40.1 | 192.168.50.20 | SW-ACCESS Fa0/8 | 40 |
| WEB-SRV | 192.168.50.10 | 255.255.255.0 | 192.168.50.1 | 192.168.50.20 | SW-SERVER Fa0/1 | 50 |
| DNS-SRV | 192.168.50.20 | 255.255.255.0 | 192.168.50.1 | 192.168.50.20 | SW-SERVER Fa0/2 | 50 |
| HR-SRV | 192.168.50.30 | 255.255.255.0 | 192.168.50.1 | 192.168.50.20 | SW-SERVER Fa0/3 | 50 |
| FIN-SRV | 192.168.50.40 | 255.255.255.0 | 192.168.50.1 | 192.168.50.20 | SW-SERVER Fa0/4 | 50 |
| EXT-WEB | 203.0.113.10 | 255.255.255.0 | 203.0.113.1 | — | SW-EXT Fa0/1 | 1 |
| EXT-HOST | 203.0.113.50 | 255.255.255.0 | 203.0.113.1 | — | SW-EXT Fa0/2 | 1 |

### Server services (Services tab). Turn **every other service OFF.**

| Server | Services ON | Settings |
|---|---|---|
| WEB-SRV | HTTP, HTTPS | Edit `index.html` so the heading reads **"CORP PORTAL — WEB-SRV"**. This makes screenshots identify the server. |
| DNS-SRV | DNS | A records (below) |
| HR-SRV | HTTPS only (HTTP off) | `index.html` heading **"HR RECORDS — HR-SRV"** |
| FIN-SRV | FTP only | FTP user `finuser` / password `Fin#2026` (lab only) with read and list permission. Remove or disable the default `cisco` FTP user. |
| EXT-WEB | HTTP, HTTPS | `index.html` heading **"EXTERNAL SITE — EXT-WEB"** |

### DNS A records on DNS-SRV (reserved test domains; RFC 6761 — `[UNVERIFIED]`)

| Name | Address |
|---|---|
| portal.corp.test | 192.168.50.10 |
| dns.corp.test | 192.168.50.20 |
| hr.corp.test | 192.168.50.30 |
| fin.corp.test | 192.168.50.40 |
| www.ext.test | 203.0.113.10 |

## 6. Cabling (physical topology)

| From | Port | To | Port | Cable (PT) |
|---|---|---|---|---|
| R-CORE | G0/0 | SW-ACCESS | G0/1 | Copper straight-through |
| R-CORE | G0/1 | SW-SERVER | G0/1 | Copper straight-through |
| R-CORE | G0/2 | R-EDGE | G0/0 | Copper cross-over (PT also auto-negotiates with straight-through) |
| R-EDGE | G0/1 | SW-EXT | G0/1 | Copper straight-through |
| PCs / servers | FastEthernet0 | Switches | Fa0/x as in §5 | Copper straight-through |

## 7. Routing

The design uses static routing only.

| Device | Route | Next hop | Purpose |
|---|---|---|---|
| R-CORE | 0.0.0.0/0 | 10.0.0.2 | Everything that is not internal goes to the edge |
| R-EDGE | 192.168.0.0/16 | 10.0.0.1 | Summary route back to all internal VLANs |

R-EDGE reaches 203.0.113.0/24 as a connected network.

**NAT is deliberately not used.** External hosts reach internal private addresses directly, so external tests stay readable. This is a stated simplification for Part C. In a real network the perimeter would also perform NAT/PAT, and the public portal would sit in a DMZ.

## 8. Optional extensions (only if time allows, and only after the core experiment)

- **VLAN 99** switch management on SW-ACCESS only, with SSH on the 2960. First check that PT supports SSH on that model.
- **Filtering traffic leaving the server VLAN** (an ACL inbound on G0/1.50). Stateless ACLs make return traffic hard to handle, especially for FTP data connections. Even without building it, this belongs in the complexity discussion.
- **Syslog server** with `log` on the deny entries, if PT forwards ACL log messages. Check this in a pilot first.
