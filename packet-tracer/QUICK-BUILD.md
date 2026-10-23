# Quick Build Sheet: Stage 0 in Packet Tracer

Work top to bottom with Packet Tracer open. Tick each box. Expected time: about 2 hours.

## 1. Place devices (10 min)

| Drag from | Model | Name it | How many |
|---|---|---|---|
| Network Devices → Routers | **2911** | R-CORE, R-EDGE | 2 |
| Network Devices → Switches | **2960** | SW-ACCESS, SW-SERVER, SW-EXT | 3 |
| End Devices | **PC** | HR-PC1, HR-PC2, FIN-PC1, FIN-PC2, IT-PC1, IT-PC2, SAL-PC1, SAL-PC2, EXT-HOST | 9 |
| End Devices | **Server** | WEB-SRV, DNS-SRV, HR-SRV, FIN-SRV, EXT-WEB | 5 |

Rename each device: click it → Config tab → Display Name.

## 2. Cables (15 min)

Use **Copper Straight-Through** for everything (PT auto-adjusts the router-to-router link).

| From | Port | To | Port |
|---|---|---|---|
| R-CORE | GigabitEthernet0/0 | SW-ACCESS | GigabitEthernet0/1 |
| R-CORE | GigabitEthernet0/1 | SW-SERVER | GigabitEthernet0/1 |
| R-CORE | GigabitEthernet0/2 | R-EDGE | GigabitEthernet0/0 |
| R-EDGE | GigabitEthernet0/1 | SW-EXT | GigabitEthernet0/1 |
| HR-PC1, HR-PC2, FIN-PC1, FIN-PC2, IT-PC1, IT-PC2, SAL-PC1, SAL-PC2 | FastEthernet0 | SW-ACCESS | Fa0/1 … Fa0/8 in that order |
| WEB-SRV, DNS-SRV, HR-SRV, FIN-SRV | FastEthernet0 | SW-SERVER | Fa0/1 … Fa0/4 |
| EXT-WEB, EXT-HOST | FastEthernet0 | SW-EXT | Fa0/1, Fa0/2 |

## 3. Paste configurations (15 min)

Click the device → **CLI** tab → press Enter until you see `Switch>` or `Router>` (answer **no** to the setup dialog) → paste the block. Order: the three switches, then R-CORE, then R-EDGE.

If a line is rejected, note it and continue; tell me the exact line.

### SW-ACCESS

```
! [PROPOSED DESIGN] - NOT YET RUN IN PACKET TRACER. Paste in global config mode.
! Lab-only credentials. See network-design/ for rationale and ACL traceability.
enable
configure terminal
hostname SW-ACCESS
no ip domain-lookup
enable secret Lab#Enable26
vlan 10
 name HR
vlan 20
 name FINANCE
vlan 30
 name IT
vlan 40
 name SALES
exit
interface range FastEthernet0/1 - 2
 switchport mode access
 switchport access vlan 10
interface range FastEthernet0/3 - 4
 switchport mode access
 switchport access vlan 20
interface range FastEthernet0/5 - 6
 switchport mode access
 switchport access vlan 30
interface range FastEthernet0/7 - 8
 switchport mode access
 switchport access vlan 40
interface GigabitEthernet0/1
 description Trunk to R-CORE G0/0
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40
! Unused ports shut (constant baseline hardening, identical in all stages)
interface range FastEthernet0/9 - 24
 shutdown
interface GigabitEthernet0/2
 shutdown
end
write memory
```

### SW-SERVER

```
! [PROPOSED DESIGN] - NOT YET RUN IN PACKET TRACER. Paste in global config mode.
! Lab-only credentials. See network-design/ for rationale and ACL traceability.
enable
configure terminal
hostname SW-SERVER
no ip domain-lookup
enable secret Lab#Enable26
vlan 50
 name SERVERS
exit
interface range FastEthernet0/1 - 4
 switchport mode access
 switchport access vlan 50
interface GigabitEthernet0/1
 description Trunk to R-CORE G0/1
 switchport mode trunk
 switchport trunk allowed vlan 50
interface range FastEthernet0/5 - 24
 shutdown
interface GigabitEthernet0/2
 shutdown
end
write memory
```

### SW-EXT

```
! [PROPOSED DESIGN] - NOT YET RUN IN PACKET TRACER. Paste in global config mode.
! Lab-only credentials. See network-design/ for rationale and ACL traceability.
! SW-EXT only joins EXT-WEB, EXT-HOST and R-EDGE G0/1 in default VLAN 1.
enable
configure terminal
hostname SW-EXT
end
write memory
```

### R-CORE

```
! [PROPOSED DESIGN] - NOT YET RUN IN PACKET TRACER. Paste in global config mode.
! Lab-only credentials. See network-design/ for rationale and ACL traceability.
! Stage 0 - base configuration (no ACLs)
enable
configure terminal
hostname R-CORE
no ip domain-lookup
enable secret Lab#Enable26
username itadmin privilege 15 secret ItAdmin#26
ip domain-name corp.test
! Pilot P8: if PT rejects the one-line form, run "crypto key generate rsa" and answer 1024
crypto key generate rsa general-keys modulus 1024
ip ssh version 2
!
interface GigabitEthernet0/0
 description Trunk to SW-ACCESS G0/1
 no ip address
 no shutdown
interface GigabitEthernet0/0.10
 description VLAN10 HR
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface GigabitEthernet0/0.20
 description VLAN20 FINANCE
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
interface GigabitEthernet0/0.30
 description VLAN30 IT
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
interface GigabitEthernet0/0.40
 description VLAN40 SALES
 encapsulation dot1Q 40
 ip address 192.168.40.1 255.255.255.0
interface GigabitEthernet0/1
 description Trunk to SW-SERVER G0/1
 no ip address
 no shutdown
interface GigabitEthernet0/1.50
 description VLAN50 SERVERS
 encapsulation dot1Q 50
 ip address 192.168.50.1 255.255.255.0
interface GigabitEthernet0/2
 description Transit to R-EDGE G0/0
 ip address 10.0.0.1 255.255.255.252
 no shutdown
exit
ip route 0.0.0.0 0.0.0.0 10.0.0.2
!
! Pilot P8: if PT offers only lines 0-4, use "line vty 0 4" and record it
line vty 0 15
 login local
 transport input telnet ssh
end
write memory
```

### R-EDGE

```
! [PROPOSED DESIGN] - NOT YET RUN IN PACKET TRACER. Paste in global config mode.
! Lab-only credentials. See network-design/ for rationale and ACL traceability.
! Stage 0 - base configuration (no ACLs)
enable
configure terminal
hostname R-EDGE
no ip domain-lookup
enable secret Lab#Enable26
username itadmin privilege 15 secret ItAdmin#26
ip domain-name corp.test
crypto key generate rsa general-keys modulus 1024
ip ssh version 2
!
interface GigabitEthernet0/0
 description Transit to R-CORE G0/2
 ip address 10.0.0.2 255.255.255.252
 no shutdown
interface GigabitEthernet0/1
 description External zone (SW-EXT)
 ip address 203.0.113.1 255.255.255.0
 no shutdown
exit
! Summary route to all internal VLANs (no NAT - stated simplification)
ip route 192.168.0.0 255.255.0.0 10.0.0.1
!
line vty 0 15
 login local
 transport input telnet ssh
end
write memory
```

## 4. PC and server addresses (20 min)

Click the device → **Desktop** → **IP Configuration** → Static. External hosts leave DNS empty.

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

## 5. Server services (20 min)

Click the server → **Services** tab. Turn **off** every service not listed.

| Server | Turn ON | Also do |
|---|---|---|
| WEB-SRV | HTTP, HTTPS | HTTP → edit `index.html`: change heading to **CORP PORTAL — WEB-SRV** |
| DNS-SRV | DNS | Add A records: portal.corp.test → 192.168.50.10; dns.corp.test → 192.168.50.20; hr.corp.test → 192.168.50.30; fin.corp.test → 192.168.50.40; www.ext.test → 203.0.113.10 |
| HR-SRV | HTTPS only (HTTP off) | Heading **HR RECORDS — HR-SRV** |
| FIN-SRV | FTP only | FTP: add user `finuser`, password `Fin#2026`, tick read and list; delete user `cisco`. Make sure a file is listed for `get`. |
| EXT-WEB | HTTP, HTTPS | Heading **EXTERNAL SITE — EXT-WEB** |

Wait about a minute for switch ports to turn green, then **save as `stage0.pkt`**.

## 6. Stage 0 tests: all 17 must work (30 min)

Browser: Desktop → Web Browser. Commands: Desktop → Command Prompt. Write **A** if it worked, **D** if not.

| ☐ | Test | From | Do this | Works when |
|---|---|---|---|---|
| ☐ | T01 | HR-PC1 | Browser `http://192.168.50.10` | page loads |
| ☐ | T03 | HR-PC1 | `nslookup portal.corp.test` | shows 192.168.50.10 |
| ☐ | T04 | FIN-PC1 | `ftp 192.168.50.40`, log in as finuser, `dir`, `get <file>` | login, `dir` and `get` all work |
| ☐ | T05 | HR-PC1 | Browser `https://192.168.50.30` | page loads |
| ☐ | T06 | IT-PC1 | `ssh -l itadmin 192.168.30.1` | password prompt appears |
| ☐ | T07 | HR-PC1 | `ping 192.168.20.11` | replies received |
| ☐ | T08 | SAL-PC1 | `ftp 192.168.50.40` | asks for a user name (connection accepted) |
| ☐ | T10 | SAL-PC1 | Browser `https://192.168.50.30` | page loads |
| ☐ | T11 | SAL-PC1 | `ssh -l itadmin 192.168.40.1` | password prompt appears |
| ☐ | T12 | IT-PC1 | `telnet 192.168.30.1` | password prompt appears |
| ☐ | T13 | HR-PC1 | `ping 192.168.50.10` | replies received |
| ☐ | T14 | IT-PC1 | `ping 192.168.50.40` | replies received |
| ☐ | T15 | EXT-HOST | Browser `http://192.168.50.10` | page loads |
| ☐ | T16 | EXT-HOST | `ftp 192.168.50.40` | asks for a user name (connection accepted) |
| ☐ | T17 | HR-PC1 | Browser `http://203.0.113.10` | page loads |
| ☐ | T18 | HR-PC1 | `ping 192.168.10.12` | replies received |
| ☐ | T19 | SAL-PC1 | `ssh -l itadmin 192.168.50.1` | password prompt appears |

Ping targets without an IP in the table: T13 WEB-SRV = 192.168.50.10; T14 FIN-SRV = 192.168.50.40. SSH/Telnet: user `itadmin`, password `ItAdmin#26` (lab only, from the Stage 0 script).

If any test fails in Stage 0, fix the network before going on (check the cable, the IP settings and the service).

**Screenshots now:** F01 the whole topology; F02 `show vlan brief` on SW-ACCESS; F03 `show ip route` on R-CORE; F04 two or three tests working.

## 7. Stages 1–3 (about 1 hour each)

For N = 1, 2, 3:

1. ☐ Open the previous `.pkt`, then **Save As** `stageN.pkt`.
2. ☐ Paste `configs/stageN/R-CORE.txt` into R-CORE and `configs/stageN/R-EDGE.txt` into R-EDGE.
3. ☐ On both routers: `clear access-list counters`.
4. ☐ Run the same 17 tests; write A or D for each in `results-template.csv` (Actual outcome) with the message you saw.
5. ☐ On R-CORE and R-EDGE: `show access-lists`. Copy the output into `stageN-acl-after.txt`.
6. ☐ Screenshots: one allowed test, one blocked test, the `show access-lists` output.
7. ☐ Save.

Record what you **see**, even if it differs from the expected column. Then send me the CSV, the text files and the screenshots.
