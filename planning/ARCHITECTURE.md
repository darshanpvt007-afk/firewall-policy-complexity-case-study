# Case Study Architecture — Phase 0 (for team approval)

**Topic 17:** Firewall Policy Complexity: From Simple ACLs to Least Privilege Network Access
**Course:** BACSE203 Computer Networks, Fall 2026, VIT Vellore
**Status:** APPROVED by the team on 2026-10-08, with conditions (`planning/decisions-log.md`). Nothing here is a result.

> **Superseded detail.** The detailed network design in `network-design/` takes precedence where it differs from this document. In particular:
> - **Stage 1** is a *broad internal ACL* applied at the same points as Stages 2–3, not "perimeter-only".
> - **VLAN 99** is deferred.
> - **M1** runs on a copy of Stage 2.
> - There are **22 tests** (T19–T22 added).

### Labels used in every project document

| Label | Meaning |
|---|---|
| `[ASSIGNMENT REQUIREMENT]` | Stated in `admin/Guidelines.pdf`. Not negotiable. |
| `[TOPIC BRIEF]` | Comes from the Topic 17 description the team supplied. The topic list is **not** in Guidelines.pdf. |
| `[PROPOSED DESIGN]` | A recommendation. The team can change it. |
| `[TEAM DECISION]` | Approved by the team and recorded in `planning/decisions-log.md`. |
| `[VERIFIED SOURCE]` | A reference someone has opened and checked against the publisher or DOI. |
| `[UNVERIFIED]` | Not checked yet. Do not cite it in the report. |
| `[EXPERIMENTAL RESULT]` | Observed in our own Packet Tracer run, with a screenshot or saved output. |
| `[INFERENCE]` | Our own interpretation of results or literature. |

---

## 1. Assignment Requirements Matrix

Source: `admin/Guidelines.pdf` (4 pages, read in full).

| # | Requirement | Source in Guidelines | How we meet it | Owner role (§9) |
|---|---|---|---|---|
| G1 | One combined report per team with Parts A, B and C, each clearly labelled; all three compulsory | §1 | One integrated report: `report/` | Integration editor |
| G2 | Part A written to the standard of a paper for a reputable conference or journal | §1 | Clean IEEE-style template | All |
| G3 | Part A sections in this order: Abstract → Keywords → Introduction → Literature Review/Related Work → Comparative Discussion/Analysis → Conclusion and Future Scope → References | §2 Format | Fixed skeleton in `report/part-a.md` | Integration editor |
| G4 | Any standard format (IEEE, LNCS, ACM, clean 1- or 2-column); consistency matters more than the template | §2 Format | **[PROPOSED DESIGN]** IEEE two-column for Part A | Integration editor |
| G5 | Part A length 4–6 pages, excluding references | §2 Format | Page budget in §4.2 | Integration editor |
| G6 | At least 15 references | §2 Literature | Target 18–22 so a few can be dropped if verification fails | Literature lead |
| G7 | At least 8 peer-reviewed papers or original standards (RFC, IEEE, ACM, Springer) | §2 Literature | Target 10 or more | Literature lead + verifier |
| G8 | Blogs, Wikipedia and AI summaries must not be primary references | §2 Literature | Vendor or industry material is supplementary only and labelled as such | Verifier |
| G9 | Every important claim, statistic or comparison is cited | §2 Literature | Claim-to-citation check during QC | Verifier |
| G10 | One citation style used consistently | §2 Literature | **[PROPOSED DESIGN]** IEEE numbered | Verifier |
| G11 | Literature review organised by theme, not source by source; studies compared rather than summarised one after another | §2 Content | Thematic outline (§4.2) | All |
| G12 | Show where the literature agrees, disagrees and has gaps | §2 Content | Each theme ends with an agree / disagree / gap block | All |
| G13 | Our own critical analysis is visible, with a clear interpretation after the literature | §2 Content | Comparative Discussion section, with `[INFERENCE]` paragraphs | All |
| G14 | Similarity below 15% (excluding references and standard terms); written in our own words; heavy copy-paste or unedited AI text is penalised | §2 Originality | Every section is rewritten by a human author; similarity check before submission | Integration editor |
| G15 | Part B: an actual simulation in the tool specified for the topic. A descriptive account alone is not acceptable. | §1, §3 | Cisco Packet Tracer `[TOPIC BRIEF]` | Network build lead |
| G16 | All screenshots come from our own simulation | §3 | Screenshot index records who captured each one, when, and from which `.pkt` | Test & evidence lead |
| G17 | Every important step has (1) a topology or configuration screenshot, (2) an output or result screenshot, (3) a short caption | §3 | Pair rule in `documentation/screenshot-index.md` | Test & evidence lead |
| G18 | Before/after comparisons shown as a small table or simple chart | §3 | Stage 1 / 2 / 3 comparison table and chart | Test & evidence lead |
| G19 | Known tool limitations stated honestly; any simplified approach explained | §3 | Limitations log (§6.6) kept from day 1 | All |
| G20 | Part C is **about half a page to one page** | §4 | Kept short and direct (see note N2) | Integration editor |
| G21 | Part C, question 1: how do Part B results compare with Part A? Do they agree, differ, or partly agree? With reasons. | §4 Q1 | Section C.1 | All |
| G22 | Part C, question 2: which real-world factors, scale, conditions or protocol behaviours the simulation could not capture, and why | §4 Q2 | Section C.2 | All |
| G23 | Part C, question 3: if a substitute or simplified simulation was used, what was simplified and what it leaves out. The guidelines' own example is ACLs vs Zero Trust. | §4 Q3 | Section C.3 (FTP standing in for a database; ACLs vs identity-aware access) | All |
| G24 | Rubric: Lit depth 2, Synthesis 2, Writing/Originality 2, Simulation 2, Screenshots 1, Part C 1, plus an individual viva | §5 | Effort follows the marks: Part A is worth 6 of 10 | All |
| G25 | Individual viva: "each member's independent understanding and command over **their assigned section**" | §5 | See note N1 | All |
| G26 | Title page with team name, topic, member names and registration numbers | §6 | `report/title-page.md` | Integration editor |
| G27 | Individual Contribution Statement attached | §6 | `documentation/contribution.md` | Integration editor |
| G28 | Similarity index checked and below 15% before submission | §6 | QC gate G5 (§9) | Integration editor |

### Notes where your brief and the Guidelines differ

- **N1. Viva wording.** The rubric says each member needs "command over their assigned section", so the examiner may expect every member to have one section. **[PROPOSED DESIGN]** Keep the content integrated as you asked, and also name one **viva lead** per report section (§9.3). Every member must still be able to explain the whole project. **Please confirm with the faculty** whether sections are formally assigned for the viva.
- **N2. Part C length.** Your proposed Part C has five subsections. The Guidelines cap it at about half a page to one page. **[PROPOSED DESIGN]** Use three short sub-headings that mirror the three Guidelines questions, with a compact agree/differ table.
- **N3. Report tail.** Your proposed tail (Final Conclusion, Future Scope, References, Figures, Tables after Part C) is not required. Part A already contains Conclusion/Future Scope and References. **[PROPOSED DESIGN]** Keep **one** numbered reference list, shared by A, B and C. Embed figures and tables inline where they are discussed, with lists of figures and tables at the front. Leave out a separate Final Conclusion unless the team wants a closing paragraph of 5 lines or fewer, to avoid repeating Part A §4.
- **N4. Part A purpose.** Part A must read as a stand-alone review paper (G2). **[PROPOSED DESIGN]** Part A covers literature only. Our experimental results appear only in Parts B and C. The Part A Introduction and Future Scope can point forward to the case study in one or two sentences.
- **N5. Topic list.** Guidelines.pdf does not contain the topic list. The Topic 17 text and "Packet Tracer" as the tool come from your brief, so they are labelled `[TOPIC BRIEF]`. Keep a copy of the official topic allocation in `admin/`.
- **N6. Part B structure.** The Guidelines do not prescribe Part B sub-sections. The structure in §4.3 below is `[PROPOSED DESIGN]`.

---

## 2. Refined Research Question

**Original:** "How does progressively applying least-privilege network access reduce unnecessary communication while affecting firewall/ACL policy complexity and management?"

**Refined RQ [PROPOSED DESIGN]:**

> In a multi-department enterprise network, how does progressively refining access-control policy — from perimeter-only filtering, to department-level segmentation, to service-level least privilege — change **(a)** the set of unnecessary communication flows that the policy permits and **(b)** the size, specificity and order-dependence of the policy, and how do these observed trade-offs compare with the firewall-policy management challenges reported in the literature?

Why this wording:
- It names the three stages, so the experimental design follows directly from the question.
- It splits the vague phrase "complexity and management" into things we can observe in Packet Tracer: size, specificity and order-dependence.
- The comparison with literature is part of the question, so Part C has a clear job.
- It does not assume the answer.

**Sub-questions**

| ID | Sub-question | Answered by |
|---|---|---|
| SQ1 | What does the literature report about the causes and effects of firewall/ACL policy complexity: rule conflicts, shadowing, redundancy, policy growth, misconfiguration and excessive permissions? | Part A |
| SQ2 | How does the literature position least privilege, microsegmentation and policy-management approaches relative to perimeter filtering, and where does it disagree? | Part A |
| SQ3 | In our Packet Tracer network, how many unnecessary flows does each policy stage permit, and how large and order-dependent is each policy? | Part B |
| SQ4 | Which literature-reported problems can we reproduce in a controlled way (for example shadowing), and which ones cannot be observed at this scale? | Part B + C |
| SQ5 | Which aspects of least privilege cannot be expressed by L3/L4 ACLs at all (for example, intra-VLAN traffic and user identity)? | Part B + C |

**Working expectations (to test, not assumed) [PROPOSED DESIGN]**

- E1: The number of unnecessary permitted flows decreases from Stage 1 to Stage 3.
- E2: The number of ACL entries and the number of match conditions increase from Stage 1 to Stage 3.
- E3: Rule count alone does not fully capture complexity. Order-dependence, placement and direction also matter.
- E4: Some excess access remains at Stage 3 because L3/L4 ACLs cannot express it (for example, same-VLAN peer traffic).

We report each expectation as supported, partly supported or not supported, using only observed data.

---

## 3. Research Objectives

| # | Objective | Part | Evidence it is met |
|---|---|---|---|
| O1 | Review traditional perimeter filtering and ACL-based access control | A | Theme T1 |
| O2 | Analyse how the literature characterises policy complexity: conflicts, redundancy, shadowing, growth, misconfiguration, excessive permissions | A | Themes T2–T3 |
| O3 | Examine least privilege, microsegmentation and policy-management approaches, including where sources disagree | A | Themes T4–T5 |
| O4 | Derive business communication requirements (required and forbidden flows) before writing any ACL | B | Communication matrix |
| O5 | Design and build a reproducible multi-department enterprise network in Packet Tracer | B | Topology, configurations, connectivity baseline |
| O6 | Implement three progressively refined ACL policy stages | B | Saved configuration for each stage |
| O7 | Test required and forbidden flows at every stage using service-appropriate methods | B | Test matrix with evidence |
| O8 | Measure policy size, specificity and unnecessary access for each stage using defined metrics | B | Comparison table and chart |
| O9 | Demonstrate at least one literature-reported anomaly (shadowing or ordering error) in a controlled test | B | Misconfiguration experiment M1 |
| O10 | Compare the observations with the literature and state the limitations of Packet Tracer and of ACLs | C | Part C |

---

## 4. Complete Case Study Architecture

### 4.1 Investigation chain (one storyline)

```
Research problem: broad policies are easy but over-permissive; granular ones may be harder to manage
   → RQ + SQ1–SQ5 + O1–O10
   → PART A  T1 Perimeter filtering & ACLs
             T2 Policy complexity & anomalies (conflict, shadowing, redundancy)
             T3 Policy growth, misconfiguration, excessive permissions
             T4 Least privilege, microsegmentation, Zero Trust
             T5 Policy-management approaches (analysis, automation, intent)
             → Comparative Discussion: security gain vs manageability + research gaps
   → PART B  Requirements → Network design → Stage 0 connectivity baseline
             → Stage 1 perimeter-only → Stage 2 department-based → Stage 3 least privilege
             → Misconfiguration experiment → Metrics & comparison
   → PART C  Agreement / difference with T1–T5 → what PT/ACLs cannot capture → simplifications
```

### 4.2 Part A — Review Paper (4–6 pages) [PROPOSED DESIGN]

Your 10 suggested themes will not fit into the roughly 3 pages available for the literature review. They are merged into 5 themes below. Nothing is dropped; for example, "research gaps" moves into each theme and into the Discussion section.

| Section | Content | Page budget |
|---|---|---|
| Abstract (150–200 words), Keywords (5–6) | Problem, scope, review method, main synthesis, link to the case study | 0.3 |
| 1. Introduction | Why policy complexity matters; scope; review method (databases, search strings, inclusion criteria); contributions; paper structure | 0.6 |
| 2.1 T1 Perimeter filtering and ACLs | Packet filtering, stateless vs stateful, the trust boundary assumption | 0.4 |
| 2.2 T2 Policy anomalies | Rule ordering, shadowing, redundancy, correlation, formal classification of anomalies and detection tools | 0.6 |
| 2.3 T3 Growth, misconfiguration, excessive permissions | Empirical misconfiguration studies, how rule bases grow, "any" rules, attack surface | 0.6 |
| 2.4 T4 Least privilege, microsegmentation, Zero Trust | Saltzer–Schroeder principle, segmentation models, Zero Trust architecture | 0.6 |
| 2.5 T5 Policy-management approaches | Policy analysis and verification, automation, intent and abstraction, object groups | 0.5 |
| 3. Comparative Discussion / Analysis | Comparison table of approaches; agree / disagree / gaps; **our inference** on security vs manageability; whether rule count equals complexity | 1.2 |
| 4. Conclusion and Future Scope | | 0.4 |
| **Total** | | **≈5.2** |

Each theme in §2 ends with a short block: **Agreement / Disagreement / Limitation / Gap / Link to our study**.

### 4.3 Part B — Simulation Case Study [PROPOSED DESIGN]

1. Experimental objective and hypotheses (E1–E4)
2. Communication requirements (required and forbidden flows matrix)
3. Network architecture (logical and physical topology, devices, VLANs, addressing, zones)
4. Network configuration (VLANs, trunks, inter-VLAN routing, static routing, services, SSH) plus Stage 0 connectivity baseline
5. Stage 1: perimeter-only policy (configuration, tests, results)
6. Stage 2: department-based policy (configuration, tests, results)
7. Stage 3: least-privilege policy (configuration, tests, results)
8. Misconfiguration experiment (shadowing and ordering)
9. Comparative analysis (metrics table and chart, with discussion)

### 4.4 Part C — Alignment and Limitations Note (½–1 page) [PROPOSED DESIGN]

- C.1 Comparison with the literature: a 3-column table (observation / literature theme and reference / agrees, differs or partly agrees) and about 4 sentences of reasoning.
- C.2 What the simulation could not capture, and why.
- C.3 Simplifications and what they leave out: FTP standing in for a database; ACLs vs identity-aware Zero Trust; stateless ACLs vs stateful firewalls.

### 4.5 Final report order [PROPOSED DESIGN]

Title page (team name, topic, members and registration numbers) → List of figures and tables → Part A (including the single reference list) → Part B → Part C → Individual Contribution Statement → optional appendix with full device configurations.

---

## 5. Proposed Packet Tracer Architecture

### 5.1 Evaluation of the starting architecture you proposed

| Aspect | Assessment | Change |
|---|---|---|
| Five VLANs (4 departments + servers) | Appropriate. Enough distinct zones to make policy grow, small enough to build. | Keep |
| "Core Network" block | Too vague to configure; it does not say where routing and ACLs happen | One router doing router-on-a-stick inter-VLAN routing (R-CORE), where the internal ACLs are applied |
| Edge router plus "Internet" | Useful: it is the only way to show *perimeter* filtering, which is the topic's starting point | Keep R-EDGE and add a small simulated external network with 2 hosts |
| Web / DB / DNS servers | Packet Tracer servers have **no database service**. A "Finance → DB" flow cannot be shown honestly. | Replace DB with **FIN-SRV running FTP** as a "finance records service" (simplification stated in Part C). Add **HR-SRV (HTTPS)** so HR has a service of its own. |
| No management plane | "IT → network devices" needs a real target | SSH on both routers (VTY) is the admin service. Telnet is enabled at Stage 1 so that it can be removed later. |
| PCs per department | One PC per VLAN cannot show same-VLAN traffic | **2 PCs per department.** Same-VLAN traffic bypasses the router, which directly shows a limitation that microsegmentation addresses. |

### 5.2 Topology [PROPOSED DESIGN]

```
                 EXTERNAL ZONE  203.0.113.0/24 (RFC 5737 documentation range [UNVERIFIED])
                 EXT-WEB (.10)    EXT-HOST (.50)
                          \        /
                           SW-EXT (2960)
                               |
                         G0/1 .1
                         R-EDGE (2911)          ← perimeter ACL (all stages)
                         G0/0 10.0.0.2/30
                               |
                         G0/2 10.0.0.1/30
                         R-CORE (2911)          ← inter-VLAN routing + internal ACLs (Stages 2–3)
                     G0/0 (trunk)     G0/1 (trunk)
                        |                  |
               SW-ACCESS (2960)      SW-SERVER (2960)
         VLAN10 HR   VLAN20 FIN        VLAN50 Servers
         VLAN30 IT   VLAN40 SALES      WEB-SRV  DNS-SRV  HR-SRV  FIN-SRV
         2 PCs each (8 PCs)            VLAN99 switch management (optional)
```

**Device inventory:** 2 routers (2911), 3 switches (2960-24TT), 8 PCs, 4 internal servers, 2 external hosts. **19 devices in total.**

Why router-on-a-stick and not a multilayer switch: IOS routers in Packet Tracer fully support extended ACLs and VTY `access-class`; the design matches the BACSE203 syllabus; and it puts every internal policy decision on one device, which makes counting and auditing straightforward. The single router being a bottleneck and single point of failure is a stated simplification.

### 5.3 Addressing [PROPOSED DESIGN]

| Zone / VLAN | Network | Gateway (R-CORE subinterface) | Hosts |
|---|---|---|---|
| VLAN 10 HR | 192.168.10.0/24 | G0/0.10 = .1 | HR-PC1 .11, HR-PC2 .12 |
| VLAN 20 Finance | 192.168.20.0/24 | G0/0.20 = .1 | FIN-PC1 .11, FIN-PC2 .12 |
| VLAN 30 IT | 192.168.30.0/24 | G0/0.30 = .1 | IT-PC1 .11, IT-PC2 .12 |
| VLAN 40 Sales | 192.168.40.0/24 | G0/0.40 = .1 | SAL-PC1 .11, SAL-PC2 .12 |
| VLAN 50 Servers | 192.168.50.0/24 | G0/1.50 = .1 | WEB-SRV .10, DNS-SRV .20, HR-SRV .30, FIN-SRV .40 |
| VLAN 99 Mgmt (optional) | 192.168.99.0/24 | G0/1.99 = .1 | SW-ACCESS .2, SW-SERVER .3 |
| Transit | 10.0.0.0/30 | — | R-CORE G0/2 .1, R-EDGE G0/0 .2 |
| External | 203.0.113.0/24 | R-EDGE G0/1 = .1 | EXT-WEB .10, EXT-HOST .50 |

The proposed /24 values are kept. All addresses are static, for reproducibility. Routing is static: R-CORE has a default route to R-EDGE, and R-EDGE has a route for 192.168.0.0/16 to R-CORE. NAT is deliberately left out, so external tests stay readable; this is a stated simplification. Because all internal subnets fall under 192.168.0.0/16, one ACL entry can cover "all internal". This is an example of addressing design affecting rule count, a point to raise in the analysis. DNS names use a reserved test domain (for example `corp.test`).

### 5.4 Security zones and communication requirements [PROPOSED DESIGN, needs TEAM DECISION]

Zones: USER (HR, FIN, IT, SALES), SERVER, MGMT (router VTY and switch management), EXTERNAL.

**Required flows**

| ID | Source | Destination | Service | Reason |
|---|---|---|---|---|
| R1 | All departments | DNS-SRV | DNS (UDP 53) | Name resolution |
| R2 | All departments | WEB-SRV | HTTP/HTTPS (TCP 80/443) | Company intranet portal |
| R3 | HR | HR-SRV | HTTPS (TCP 443) | HR records application |
| R4 | Finance | FIN-SRV | FTP (TCP 21) | Finance records (stands in for a database) |
| R5 | IT | R-CORE, R-EDGE | SSH (TCP 22) | Device administration |
| R6 | IT | All servers | ICMP echo | Troubleshooting |
| R7 | All departments | EXT-WEB | HTTP/HTTPS | Internet browsing |
| R8 | EXTERNAL | WEB-SRV | HTTP/HTTPS | Public website |

**Forbidden flows**

| ID | Source | Destination | Service | Reason |
|---|---|---|---|---|
| X1 | Any department | Any other department subnet | Any | No business need. This is the lateral-movement path. |
| X2 | Non-HR | HR-SRV | Any | Confidential HR data |
| X3 | Non-Finance | FIN-SRV | Any | Confidential finance data |
| X4 | Non-IT | Router/switch management | SSH/Telnet | Administrative privilege |
| X5 | Anyone, including IT | Routers | Telnet | Insecure protocol |
| X6 | Non-IT | Servers | ICMP and unused ports | Reduce reconnaissance surface |
| X7 | EXTERNAL | Anything except R8 | Any | Perimeter |

There is also an **uncontrollable flow, U1**: traffic between PCs in the same VLAN (for example HR-PC1 ↔ HR-PC2). It never reaches the router, so a router ACL cannot filter it. We record this as evidence for the microsegmentation discussion.

---

## 6. Proposed Experiment Stages

| Stage | Name | Where ACLs are applied | Policy logic [PROPOSED DESIGN] | Expected remaining excess |
|---|---|---|---|---|
| 0 | Connectivity baseline | None | Verify VLANs, trunks, routing and services. **This is not a policy stage.** | Everything is reachable |
| 1 | Broad internal policy (revised) | Same 7 points as Stages 2–3 | Edge as before. One shared internal ACL allows any internal source to reach any destination. VTY allows any internal source, Telnet and SSH. | X1–X6 permitted |
| 2 | Department-based (zone-level, IP-only) | Stage 1 rules, plus R-CORE G0/0.10/.20/.30/.40 inbound; VTY `access-class` IT-only | Each department can reach the whole server subnet (any protocol) and the Internet; inter-department traffic denied; management restricted to IT | X2, X3, X5, X6 still permitted, because a whole subnet is trusted |
| 3 | Least privilege (host + protocol + port) | Same interfaces as Stage 2 | Specific host and port per required flow (R1–R8); no ICMP to servers except from IT; SSH-only VTY; deny internal destinations *before* permitting Internet web (an ordering-dependent pair) | Only U1, plus anything L3/L4 cannot express |
| M1 | Controlled misconfiguration (copy of Stage 3) | Same | Insert a broad `permit` above a specific `deny`, then show the deny entry is shadowed (0 matches in `show access-lists`) and a forbidden flow opens up. Restore afterwards. | Shows the literature's shadowing problem |
| M2 | Controlled over-restriction (copy of Stage 3) | Same | Remove the DNS permit, then show a required flow (R1) breaks because of the implicit deny | Shows the availability cost of least privilege |

Rules for building the stages:
- Every Stage 2 and Stage 3 ACL entry must trace back to a requirement ID (R*, X*). Store this mapping as a comment column in `packet-tracer/configs/`.
- Use named extended ACLs (for example `ACL-HR-IN`) placed close to the source, following standard Cisco extended-ACL placement practice. Find a citable source for this before stating it in the report.
- Do not create deliberately dangerous or nonsensical baselines. Stage 1 represents a common "hard shell, flat inside" design.
- Keep one `.pkt` file per stage so that each stage can be shown independently.

### 6.6 Packet Tracer feasibility items to confirm in a pilot (before relying on them)

| Item | Why it matters | Fallback if unsupported |
|---|---|---|
| `established` keyword on extended ACLs | Stage 1 return traffic | Permit return traffic by source port, and record this as a limitation |
| `show access-lists` match counters | Metrics, and the M1 shadowing evidence | Simulation Mode packet inspection |
| PC `ftp` client through an ACL allowing TCP 21 | Test R4 | Use HTTPS on FIN-SRV instead and document the change |
| SSH on 2911 and the `ssh -l` client on PCs | Tests R5 and X4 | — (widely supported) |
| SSH on 2960 (VLAN 99) | Optional management zone | Drop VLAN 99 |
| HTTPS in the PC web browser | Tests R2 and R3 | Use HTTP and document the change |
| Whether a PC browser fails visibly when an ACL denies it | Evidence for denied tests | Simulation Mode showing the packet dropped at R-CORE |

Each pilot result is recorded as `[EXPERIMENTAL RESULT]` in `planning/decisions-log.md`.

### 6.7 Metrics (only values we can observe or derive) [PROPOSED DESIGN]

| Metric | Definition | How measured | S1 | S2 | S3 |
|---|---|---|---|---|---|
| ACL count / application points | Number of ACLs and interface-direction bindings (including VTY) | `show run`, `show ip interface` | TBD | TBD | TBD |
| ACE count | Total explicit entries (implicit deny excluded, reported separately) | `show access-lists` | TBD | TBD | TBD |
| Match conditions | Sum over all entries of the fields specified (src, dst, protocol, port) | Derived from the configuration | TBD | TBD | TBD |
| Required flows permitted (R1–R8) | Of 8 | Test matrix | TBD | TBD | TBD |
| Forbidden flows permitted (X1–X7) | "Unnecessary permitted" | Test matrix plus policy analysis | TBD | TBD | TBD |
| Exposed services per non-IT user zone | Count of distinct (server, port) pairs reachable | Policy analysis with sample tests | TBD | TBD | TBD |
| Order-dependent entry pairs | Pairs whose behaviour changes if swapped | Manual analysis | TBD | TBD | TBD |
| Entries with zero matches after the full test run | Candidates for redundancy or shadowing | `show access-lists` | TBD | TBD | TBD |
| Lines changed from the previous stage | Maintenance effort proxy | Diff of saved configurations | — | TBD | TBD |

"Configuration complexity" is never reported as a single subjective score. It is reported only through the measurable columns above. Published firewall complexity measures (for example Wool's rule-complexity metric `[UNVERIFIED]`) can be applied *only after* the source has been verified.

---

## 7. Proposed Testing Methodology

**Principles**
- **Choose a test method that matches the service.**
  - Ping only proves ICMP reachability. It is used only for ICMP flows (R6, X6) and for the Stage 0 baseline.
  - HTTP/HTTPS: the PC Web Browser.
  - DNS: `nslookup`.
  - FTP: the `ftp` client.
  - SSH: `ssh -l <user> <ip>`.
  - Telnet: `telnet <ip>`.
- **Every denial needs two pieces of evidence:**
  - the client-side failure, and
  - a counter increase on the deny entry in `show access-lists`, or Simulation Mode showing where the packet was dropped.
- **Clear counters before each stage run** (`clear access-list counters`) so the match counts belong to that stage only.
- Run every test at every stage, in the same order, from the same PC.

**Test matrix [PROPOSED DESIGN]** (A = allowed, D = denied; expectations only, not results)

| Test | Source → Destination | Service / method | Req. ID | Exp. S1 | Exp. S2 | Exp. S3 |
|---|---|---|---|---|---|---|
| T01 | HR-PC1 → WEB-SRV | HTTP (browser) | R2 | A | A | A |
| T02 | SAL-PC1 → WEB-SRV | HTTPS (browser) | R2 | A | A | A |
| T03 | HR-PC1 → DNS-SRV | nslookup | R1 | A | A | A |
| T04 | FIN-PC1 → FIN-SRV | FTP | R4 | A | A | A |
| T05 | HR-PC1 → HR-SRV | HTTPS | R3 | A | A | A |
| T06 | IT-PC1 → R-CORE | SSH | R5 | A | A | A |
| T07 | HR-PC1 → FIN-PC1 | ping | X1 | A | D | D |
| T08 | SAL-PC1 → FIN-SRV | FTP | X3 | A | A | D |
| T09 | HR-PC1 → FIN-SRV | FTP | X3 | A | A | D |
| T10 | SAL-PC1 → HR-SRV | HTTPS | X2 | A | A | D |
| T11 | SAL-PC1 → R-CORE | SSH | X4 | A | D | D |
| T12 | IT-PC1 → R-CORE | Telnet | X5 | A | A | D |
| T13 | HR-PC1 → WEB-SRV | ping | X6 | A | A | D |
| T14 | IT-PC1 → FIN-SRV | ping | R6 | A | A | A |
| T15 | EXT-HOST → WEB-SRV | HTTP | R8 | A | A | A |
| T16 | EXT-HOST → FIN-SRV | FTP | X7 | D | D | D |
| T17 | HR-PC1 → EXT-WEB | HTTP | R7 | A | A | A |
| T18 | HR-PC1 → HR-PC2 | ping (same VLAN) | U1 | A | A | A |
| M1-T08 | SAL-PC1 → FIN-SRV under M1 | FTP | X3 | — | — | A (shadowing) |
| M2-T03 | HR-PC1 → DNS-SRV under M2 | nslookup | R1 | — | — | D (over-restriction) |

Verification commands for each stage: `show vlan brief`, `show interfaces trunk`, `show ip interface brief`, `show ip route`, `show access-lists`, `show ip interface <if>` (which shows the ACL bound to it), `show running-config`, plus Simulation Mode captures for at least one allowed and one denied flow per stage.

The full experiment matrix (Experiment ID / Stage / Source / Destination / Protocol / Expected / **Actual (blank)** / Evidence / Interpretation) is in `packet-tracer/tests/test-matrix.md`.

---

## 8. Project File Structure

```
firewall-policy-complexity-case-study/
├── README.md                      overview, status, conventions
├── admin/Guidelines.pdf           authoritative requirements (+ topic allocation, once obtained)
├── planning/
│   ├── ARCHITECTURE.md            this document
│   └── decisions-log.md           [TEAM DECISION] + pilot results, dated
├── research/
│   ├── literature-matrix.md       ID / citation / … / Verified?
│   ├── verified-references.md     final IEEE list (verified only)
│   ├── search-log.md              databases, queries, dates (feeds the Part A method paragraph)
│   └── standards/                 RFC / NIST notes (links only)
├── network-design/
│   ├── addressing-plan.md
│   └── communication-matrix.md    R* / X* / U* requirements
├── packet-tracer/
│   ├── topology/                  stage0.pkt, stage1.pkt, stage2.pkt, stage3.pkt, m1.pkt, m2.pkt
│   ├── configs/stageN/            `show run` text per device + ACL-to-requirement mapping
│   ├── tests/test-matrix.md
│   └── results/stageN/            raw `show access-lists` outputs, notes
├── figures/{topology,configuration,testing}/   PNG named Fxx-short-name.png
├── report/
│   ├── title-page.md  part-a.md  part-b.md  part-c.md
│   └── references.md               single shared numbered list
└── documentation/
    ├── screenshot-index.md
    ├── qc-checklist.md
    └── contribution.md
```

Paper PDFs are **not** committed, for copyright reasons. Store the DOI or URL in the matrix instead. All team members must use the **same Packet Tracer version**, because `.pkt` files are not always backward-compatible.

---

## 9. Five-Person Collaboration Workflow

### 9.1 Principle

There is one project. Everyone contributes to every Part. Roles describe **responsibility for a process**, not ownership of content. Whoever builds something is never the person who verifies it.

### 9.2 Functional roles (rotate the reviewer pairs weekly)

| Role | Leads | Also does | Verified by |
|---|---|---|---|
| **P1 Network build lead** | Packet Tracer build, stage configurations, config exports | Drafts Part B §3–4 | P2 re-runs tests independently |
| **P2 Test & evidence lead** | Test runs, screenshots, screenshot index, metrics table | Drafts Part B §5–9 | P1 checks that screenshots match the configs |
| **P3 Literature lead** | Search strategy, literature matrix, theme synthesis | Drafts Part A §2 | P4 verifies every citation |
| **P4 Citation & standards verifier** | Verifies references, IEEE formatting, claim-to-citation check, RFC/NIST sources | Drafts Part A §1 and Part C.2–C.3 | P3 |
| **P5 Integration editor & QC** | Report assembly, consistency, similarity check, title page, contribution statement | Drafts Part A §3 and Part C.1 | Whole team |

**Shared by everyone:**
- Each member builds the Stage 0 network once on their own machine. This is the best viva preparation.
- Each member reads at least 4 core sources.
- Each member writes critical-analysis notes for the Discussion section.

### 9.3 Viva readiness (addresses note N1)

- **Viva leads [PROPOSED DESIGN]:**
  - P3: Part A literature
  - P4: references and Part C limitations
  - P1: network design
  - P2: testing and results
  - P5: comparative analysis and overall argument
- **Mock vivas:** each member answers 5 random questions about a section they did *not* lead. Common questions are kept in `documentation/viva-questions.md`.

### 9.4 Gates (no stage starts until the previous gate passes)

| Gate | Pass condition |
|---|---|
| G0 Architecture | This document approved; decisions logged |
| G1 Network | Stage 0: all VLANs, routing and services verified; pilot items (§6.6) resolved |
| G2 Policy stages | Stages 1–3 and M1/M2 run; actual results filled in; evidence indexed |
| G3 References | 15 or more verified, 8 or more peer-reviewed or standards, every row marked Verified = Yes |
| G4 Drafts | A, B and C drafted in members' own words; every claim cited; every result traceable to evidence |
| G5 QC | Academic, technical, evidence, integration and originality checks; similarity below 15% |

### 9.5 Working rules

- Work in Git on one branch per task, merged after review by one other member.
- Use the labels from the table at the top in every draft. Remove the labels only in the final export.
- Hold two short syncs per week. Each sync updates `decisions-log.md`.

---

## 10. First-Action Checklist

**Decisions to make (this week)**
- [ ] Approve or modify the refined RQ (§2), the 5-theme merge (§4.2), the topology (§5), and the requirements R1–R8 / X1–X7 (§5.4)
- [ ] Assign P1–P5 and the viva leads; ask the faculty whether viva sections are formally assigned (N1)
- [ ] Record the submission deadline and seminar date. They are not in Guidelines.pdf, so the timeline is still TBD.
- [ ] Record the team name, members and registration numbers for the title page
- [ ] Put the official Topic 17 allocation text in `admin/` (N5)

**Technical (P1 leads, P2 verifies)**
- [ ] Everyone installs the same Packet Tracer version; record it in `decisions-log.md`
- [ ] Build Stage 0 (topology, VLANs, trunks, subinterfaces, static routes, server services, SSH on the routers)
- [ ] Run the §6.6 pilot checks and log each one as supported or unsupported
- [ ] Save `stage0.pkt` plus a `show run` export of each device

**Literature (P3 leads, P4 verifies)**
- [ ] Start `research/search-log.md`. Search IEEE Xplore, ACM DL, Google Scholar and the IETF/NIST sites with: "firewall policy anomaly", "firewall configuration errors", "ACL shadowing redundancy", "microsegmentation", "zero trust architecture", "least privilege network access"
- [ ] Check these candidate leads. **All are [UNVERIFIED]; do not cite until checked:**
  - Al-Shaer & Hamed on firewall policy anomalies (≈2004)
  - Wool's quantitative studies of firewall configuration errors (≈2004, ≈2010)
  - Yuan et al., "FIREMAN" (≈2006)
  - Saltzer & Schroeder on protection principles (≈1975)
  - NIST SP 800-41 Rev. 1 (firewall policy)
  - NIST SP 800-207 (Zero Trust Architecture)
  - RFC 5737 (documentation address ranges)
  - Cheswick/Bellovin on firewalls
- [ ] Fill the first 10 rows of `research/literature-matrix.md`, with each row verified against the DOI or publisher page

**Documentation (P2, P5)**
- [ ] Take Figure 1 (topology) only once Stage 0 passes, and log it in `documentation/screenshot-index.md`
- [ ] Create the `report/` skeleton with the fixed Part A headings (G3)

After G0 approval, the next step is the **detailed network design**: full addressing plan, the configuration plan per device, and the exact ACL entries for each stage, each traced to an R/X requirement.
