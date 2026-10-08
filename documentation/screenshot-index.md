# Screenshot / Evidence Index

Guidelines §3 requires, for every important step:

1. a topology or configuration screenshot,
2. an output or result screenshot, and
3. a short caption.

Rules:

- Only screenshots captured by the team from our own `.pkt` files may be listed here.
- Name each file `figures/<folder>/Fxx-short-name.png`.

| Fig | Planned content | Type (config / result) | Stage | Source .pkt | Captured by | Date | Caption (≤2 lines) | Linked tests |
|---|---|---|---|---|---|---|---|---|
| F01 | Final enterprise topology (logical) | config | 0 | | | | | |
| F02 | `show vlan brief` + `show interfaces trunk` | result | 0 | | | | | |
| F03 | R-CORE subinterfaces + `show ip interface brief` + `show ip route` | config/result | 0 | | | | | |
| F04 | Stage 0 positive control: all 26 tests allowed (service methods) | result | 0 | | | | | |
| F05 | Stage 1 broad policy: edge ACL, shared internal ACL and remote-login restriction (`show run` section) | config | 1 | | | | | |
| F06 | Stage 1 excessive access (e.g. T08/T10 succeed) | result | 1 | | | | | |
| F07 | Stage 1 external denied (T16) | result | 1 | | | | | |
| F08 | Stage 2 department ACLs + access-class | config | 2 | | | | | |
| F09 | Stage 2 inter-department denied (T07) | result | 2 | | | | | |
| F10 | Stage 2 residual access (T08) | result | 2 | | | | | |
| F11 | Stage 3 least-privilege ACLs | config | 3 | | | | | |
| F12 | Stage 3 required services permitted (T01–T06) | result | 3 | | | | | |
| F13 | Stage 3 unnecessary access denied (T08–T13) | result | 3 | | | | | |
| F14 | Stage 3 `show access-lists` with match counters | result | 3 | | | | | |
| F15 | Simulation Mode: packet dropped at R-CORE | result | 3 | | | | | |
| F16 | Same-VLAN traffic unaffected (T18) | result | 3 | | | | | |
| F17 | M1 shadowing: appended deny with zero matches, then fix | config/result | M1 (copy of Stage 2) | | | | | |
| F18 | M2 over-restriction: DNS failure | result | M2 | | | | | |
| F19 | Stage comparison chart | chart | all | — | | | | |
