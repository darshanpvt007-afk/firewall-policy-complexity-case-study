# Literature Matrix

Rules:

- A row may be cited only when **Verified = Yes**. That means a team member opened the source and checked authors, title, venue, year and DOI/RFC number against the publisher or IETF/NIST page.
- Key Finding must be written from the source itself, never from an AI summary.
- Mark unverifiable rows `UNVERIFIED — DO NOT USE IN FINAL REPORT`.

Theme codes:

- T1: Perimeter filtering and ACLs
- T2: Policy anomalies (conflict, shadowing, redundancy)
- T3: Growth, misconfiguration and excessive permissions
- T4: Least privilege, microsegmentation and Zero Trust
- T5: Policy-management approaches

| ID | Citation (IEEE) | Year | Source type | Research problem | Method | Key finding | Theme | Limitations | Supports / challenges our study | Verified? (by, date) |
|---|---|---|---|---|---|---|---|---|---|---|
| L01 | [1] Wool, Computer 37(6), 2004 | 2004 | Peer-reviewed (IEEE magazine) | Quality of real firewall rule sets | Analysis of corporate rule sets | First quantitative study of firewall configuration quality | T3 | — (see note) | Supports: misconfiguration is common | Metadata only (2026-10-08); full text: No |
| L02 | [2] Wool, IEEE Internet Computing 14(4), 2010 | 2010 | Peer-reviewed | Whether configuration quality improved | Larger two-vendor dataset; complexity measure | Still poorly configured; complexity correlated with risk items | T3 | — (see note) | Supports E3: complexity ≠ rule count | Metadata only (2026-10-08); full text: No |
| L03 | [3] NIST SP 800-41 Rev. 1 | 2009 | Standard / government guidance | Firewall policy guidance | Guidance | Deny by default; risk-based list of needed traffic; keep the policy updated | T1 | — (see note) | Basis for the requirements-first design | Metadata only (2026-10-08); full text: No |
| L04 | [4] NIST SP 800-207 | 2020 | Standard / government guidance | Zero Trust architecture | Guidance | No implicit trust from network location; authenticate and authorise before a session | T4 | — (see note) | Shows what ACLs cannot express | Metadata only (2026-10-08); full text: No |
| L05 | [5] Saltzer & Schroeder, Proc. IEEE 63(9) | 1975 | Peer-reviewed | Protection principles | Tutorial / design principles | Least privilege; fail-safe defaults | T4 | — (see note) | Defines least privilege | Metadata only (2026-10-08); full text: No |
| L06 | [6] RFC 2979 | 2000 | IETF RFC (Informational) | Firewall behaviour requirements | Specification | Firewall behaviour often under-specified | T1 | — (see note) | Perimeter context | Metadata only (2026-10-08); full text: No |
| L07 | [7] RFC 2827 / BCP 38 | 2000 | IETF RFC (BCP) | Source-address spoofing | Best current practice | Ingress filtering of spoofed sources | T1 | — (see note) | Justifies the Stage 1 source check | Metadata only (2026-10-08); full text: No |
| L08 | [8] Ward & Beyer, ;login: 39(6) | 2014 | Practitioner article | Moving beyond the perimeter | Case description | Access by user and device credentials; no privileged network | T4 | — (see note) | Challenges the perimeter model | Metadata only (2026-10-08); full text: No |
| L09 | [9] Al-Shaer & Hamed, INFOCOM | 2004 | Peer-reviewed | Firewall policy anomalies | Formal model and tool | Anomaly definitions (shadowing etc.) — confirm in full text | T2 | — (see note) | Basis of M1 and order-dependent pairs | Metadata only (2026-10-08); full text: No |
| L10 | [10] Al-Shaer et al., IEEE JSAC 23(10) | 2005 | Peer-reviewed | Distributed firewall conflicts | Classification and algorithms | Firewall Policy Advisor | T2, T5 | — (see note) | Anomaly vocabulary | Metadata only (2026-10-08); full text: No |
| L11 | [11] Yuan et al., FIREMAN, IEEE S&P | 2006 | Peer-reviewed | Detecting misconfiguration | Static analysis with BDDs | Found real misconfigurations in enterprise networks | T2, T5 | — (see note) | Audit-time management approach | Metadata only (2026-10-08); full text: No |
| L12 | [12] Gouda & Liu, Computer Networks 51(4) | 2007 | Peer-reviewed | Designing conflict-free firewalls | Firewall decision diagrams | Consistent, complete and compact rule sets by construction | T2, T5 | — (see note) | Design-time approach | Metadata only (2026-10-08); full text: No |
| L13 | [13] Voronkov et al., ACM CSUR 50(6) | 2017 | Peer-reviewed (survey) | Usability of firewall configuration | Systematic literature review | Configuration error-prone; usability rarely evaluated | T3, T5 | — (see note) | Research gap on tooling | Metadata only (2026-10-08); full text: No |
| L14 | [14] Syed et al., IEEE Access 10 | 2022 | Peer-reviewed (survey) | Zero Trust architectures | Survey | Microsegmentation as a ZTA building block | T4 | — (see note) | Microsegmentation context | Metadata only (2026-10-08); full text: No |
| L15 | [15] NIST SP 800-215 | 2022 | Government guidance | Enterprise network security landscape | Guidance | Vanished perimeter; lateral movement; microsegmentation, ZTNA and SDP | T4 | — (see note) | Microsegmentation context | Metadata only (2026-10-08); full text: No |
| L16 | [16] CISA, Microsegmentation in ZT Part One | 2025 | Government guidance | Microsegmentation planning | Guidance | Smaller attack surface; limits lateral movement | T4 | — (see note) | Supporting context | Metadata only (2026-10-08); full text: No |
| L17 | [17] Bartal et al., Firmato, ACM TOCS 22(4) | 2004 | Peer-reviewed | Firewall management abstraction | Model, language and compiler; operational prototype | Generates vendor configurations from one model | T5 | — (see note) | Specification-time approach | Metadata only (2026-10-08); full text: No |
| L18 | [18] RFC 5737 | 2010 | IETF RFC (Informational) | Documentation address ranges | Specification | 203.0.113.0/24 reserved for documentation | Part B | — (see note) | Used for the external test addresses | Metadata only (2026-10-08); full text: No |

Note: these 18 sources are cited in `report/case-study-draft.md`. Their bibliographic metadata was checked online on 2026-10-08. A row becomes **Verified = Yes** only after a team member has read the full text, confirmed the claim in the Key finding column, and filled in the Limitations column.
