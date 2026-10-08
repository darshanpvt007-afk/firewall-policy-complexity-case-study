---
title: "Firewall Policy Complexity: From Simple ACLs to Least Privilege Network Access"
subtitle: "BACSE203 Computer Networks — Fall 2026 Case Study (Topic 17)"
---

<!--
DRAFT STATUS (not rendered; remove before submission)
- Draft version 0.2. Source for report/case-study-draft.docx (built with report/build-docx.py).
- Packet Tracer has NOT been run. Every outcome in Part B is PLANNED; every observed-result cell is blank.
- References: 18. Metadata checked online on 2026-10-08. Full-text claim checks by the team are still pending (Appendix B).
- Placeholders are written as [PLACEHOLDER: ...]. Search for "PLACEHOLDER" before submission.
-->

| Item | Details |
|------------------|--------------------------------------------------------------------|
| **Course** | BACSE203 Computer Networks, Fall 2026, School of Computer Science and Engineering, VIT Vellore |
| **Topic** | 17. Firewall Policy Complexity: From Simple ACLs to Least Privilege Network Access |
| **Team name** | [PLACEHOLDER: team name] |
| **Member 1** | [PLACEHOLDER: name — registration number] |
| **Member 2** | [PLACEHOLDER: name — registration number] |
| **Member 3** | [PLACEHOLDER: name — registration number] |
| **Member 4** | [PLACEHOLDER: name — registration number] |
| **Member 5** | [PLACEHOLDER: name — registration number] |
| **Faculty** | [PLACEHOLDER: faculty name] |
| **Submission date** | [PLACEHOLDER: date] |

**Status of this version.** Part A is a complete draft. Part B gives the full experimental design. **The Cisco Packet Tracer simulation has not yet been run.** Every expected outcome is labelled *planned*, and every observed-result field is blank. Part C is provisional until Part B results exist.

**List of tables.**

1. Comparison of access-control approaches
2. Device inventory
3. VLAN and addressing plan
4. Required and forbidden flows
5. What changes between policy stages
6. Planned ACL size per stage
7. Test cases: planned outcomes and observed results
8. Misconfiguration experiments
9. Metrics: planned and measured values
10. Screenshot plan
11. Provisional alignment with the literature

**List of figures.** All figures will be original screenshots from the team's own Packet Tracer simulation. **None has been captured yet.** The planned figures are listed in Table 10.

\newpage

# PART A — Review Paper

## Firewall Policy Complexity: A Thematic Review of Perimeter Filtering, Least Privilege and Policy Management

### Abstract

Firewalls and router access control lists (ACLs) remain the most common network access-control mechanism. The protection they give depends on the quality of the policy they enforce. This paper reviews research, standards and government guidance on firewall and ACL policy management under five themes:

- perimeter filtering
- policy anomalies
- policy growth and misconfiguration
- least privilege, microsegmentation and Zero Trust
- policy-management approaches

The literature agrees on three points. Real rule sets are often misconfigured. Rule order creates conflicts that are hard to see. Trust based on network location alone is insufficient.

It divides on two questions: whether finer-grained policy lowers risk or adds the complexity that empirical studies link to errors, and whether automated tooling resolves that tension.

We identify three gaps: the empirical evidence rests on a few older datasets, tool usability is seldom evaluated, and peer-reviewed evaluations of microsegmentation are scarce. We argue that security gain and management cost should be measured together. A companion Packet Tracer case study is designed to do this on a small scale.

**Keywords:** firewall policy, access control list, least privilege, policy anomalies, microsegmentation, Zero Trust.

### 1. Introduction

A packet filter is only as good as its rules. Wool's analysis of real corporate rule sets [1] was the first quantitative study of firewall configuration quality. A larger follow-up [2] concluded that firewalls were still poorly configured, and that rule-set complexity correlated positively with the number of risk items found.

Standards guidance asks for a policy that blocks all traffic not expressly permitted, with the permitted traffic derived from a risk analysis of what the organisation needs [3]. Zero Trust guidance goes further and grants no implicit trust on the basis of network location [4]. This restates the older principle of least privilege [5].

These positions create a practical tension. A broad policy is short and easy to write, but it allows more communication than is needed. A least-privilege policy has more rules, more conditions and more dependence on rule order, which are the properties [2] associates with errors.

This review asks how the literature characterises that trade-off.

**Method.** Sources were identified through IEEE Xplore, the ACM Digital Library, Google Scholar, the IETF RFC series and the NIST and CISA catalogues. Search terms included *firewall policy anomaly*, *firewall configuration errors*, *ACL shadowing*, *least privilege*, *microsegmentation* and *zero trust architecture*. [PLACEHOLDER: search dates and hit counts from `research/search-log.md`.] Peer-reviewed papers and original standards were preferred. Government guidance and one practitioner article are used as supporting context and identified as such.

**Structure.** Section 2 presents the themes. Section 3 compares them and gives our interpretation. Section 4 concludes.

### 2. Literature Review

#### 2.1 Perimeter Filtering and the Trusted-Inside Assumption

The classical firewall sits at the boundary between an organisation and the Internet. RFC 2979 [6] describes firewalls as packet filters, protocol relays or both. It notes that their behaviour was often under-specified, causing problems in practice.

NIST SP 800-41 Rev. 1 [3] gives the operational model:

- an explicit policy for inbound and outbound traffic
- only the needed IP protocols allowed
- everything not expressly permitted blocked
- the policy kept up to date

RFC 2827 [7] adds ingress filtering: drop traffic whose source address does not belong to the network it arrives from. This check is the basis of the "broad" baseline policy in Part B.

- *Agreement:* a default-deny boundary is the minimum expected posture.
- *Disagreement:* later work questions whether the boundary is the right place to decide trust. Ward and Beyer [8] describe an enterprise that abandoned the privileged internal network and granted access by user and device credentials.
- *Gap:* the perimeter sources say little about traffic *between* internal segments, which is where this case study begins.

#### 2.2 Policy Anomalies: Ordering, Shadowing and Redundancy

ACLs are evaluated first-match-wins, so a rule's meaning depends on every rule above it. Al-Shaer and Hamed [9] formalised the resulting anomalies. Al-Shaer *et al.* [10] extended them to distributed firewalls and automated their discovery in the *Firewall Policy Advisor*. This report uses four anomaly classes from that work:

- **Shadowing:** an earlier rule with a different action matches every packet of a later rule, so the later rule never takes effect.
- **Correlation:** rules with different actions partially overlap.
- **Generalisation:** a later rule covers a superset of an earlier rule's packets with the opposite action.
- **Redundancy:** a rule can be removed without changing the policy's effect.

[PLACEHOLDER: confirm these definitions against the full text of [9], [10]; secondary sources agree with them.]

FIREMAN [11] instead uses static analysis. It models every packet and path with binary decision diagrams to flag violations and inconsistencies, and its authors report real misconfigurations found in enterprise networks. Gouda and Liu [12] prevent anomalies rather than detect them. Policies are written as firewall decision diagrams, which are conflict-free and complete by construction, then compiled into a compact rule list.

- *Agreement:* order dependence is the root cause of anomalies.
- *Disagreement:* [9]–[11] audit existing rules, whereas [12] intervenes at design time.
- *Limitation:* all four rely mainly on formal analysis or tool case studies, not on how often administrators introduce anomalies.
- *Link to Part B:* we count order-dependent rule pairs in each stage, and reproduce a shadowed rule deliberately (M1).

#### 2.3 Policy Growth, Misconfiguration and Excessive Permissions

Wool's studies [1], [2] give the strongest empirical evidence. The second used a larger, two-vendor dataset. It introduced a composite *firewall complexity* measure, and found no significant sign that newer software versions had fewer errors [2]. The implication is that complexity, not raw rule count, is what is associated with risk.

Voronkov *et al.* [13] reviewed the usability literature. They describe configuration as complicated and error-prone, and worse as networks grow. They found that proposed solutions are rarely validated with usability studies.

- *Agreement:* misconfiguration is common, and complexity contributes to it.
- *Gap:* the datasets in [1], [2] are old, and neither measures *excessive permission*, meaning access allowed but not required by the business.
- *Link to Part B:* unnecessary access is defined against a requirements matrix written before any rule.

#### 2.4 Least Privilege, Microsegmentation and Zero Trust

Saltzer and Schroeder [5] state two principles that recur in this literature:

- *least privilege:* every program and user should operate with the least set of privileges necessary
- *fail-safe defaults:* access decisions should be based on permission, not exclusion

NIST SP 800-207 [4] applies these ideas to networks. It grants no implicit trust from location or asset ownership, authenticates and authorises subjects and devices before each session, and protects resources rather than network segments.

Syed *et al.* [14] identify microsegmentation as one Zero Trust building block, alongside authentication, access control, encryption and automation. NIST SP 800-215 [15] notes that the enterprise perimeter has effectively vanished and that broad connectivity enables lateral movement. It presents microsegmentation, Zero Trust network access and software-defined perimeters as responses. CISA [16] presents microsegmentation as a way to reduce the attack surface and limit lateral movement, while acknowledging implementation challenges.

- *Agreement:* location-based trust is insufficient, and segmentation limits lateral movement.
- *Tension:* microsegmentation multiplies policy boundaries and rules, the property [2] links to errors. The guidance does not quantify that cost.
- *Limitation:* most microsegmentation sources are guidance, not peer-reviewed measurement.
- *Link to Part B:* router ACLs cannot provide identity-aware, continuously verified access [4]. Our Stage 3 is therefore a network-layer approximation of least privilege, not Zero Trust.

#### 2.5 Policy-Management Approaches

Three families of approach try to make fine-grained policy manageable:

- **Specification:** Firmato [17] keeps policy and topology in one entity-relationship model and compiles it into vendor configurations. Its prototype ran an operational firewall for several months.
- **Audit:** FIREMAN [11] and the Firewall Policy Advisor [10] check existing policies for anomalies.
- **Design:** firewall decision diagrams [12] yield consistent, complete and compact rule sets.

How the three families compare:

- *Agreement:* administrators should not hand-edit long ordered rule lists.
- *Disagreement:* the approaches intervene at different points (specification, design or audit).
- *Gap:* such proposals rarely include usability evaluation [13]. The claim that tooling removes the cost of least privilege is therefore largely untested with real administrators.

#### 2.6 Research Gaps Across Themes

1. The empirical misconfiguration data are dated and come from few sources [1], [2].
2. Excessive permission is rarely measured against stated requirements.
3. Security gain and management cost are seldom measured together for the same policy as it is refined.
4. The usability of management tools is under-evaluated [13].

### 3. Comparative Discussion and Analysis

**Table 1. Comparison of access-control approaches in the reviewed literature**

| Approach | Where trust is decided | Granularity | Main strength | Main weakness or open issue | Sources |
|----------------|--------------|------------|--------------|----------------|---------|
| Perimeter filtering | Network boundary | Zone or subnet | Simple; clear default deny | Little control of internal (lateral) traffic | [3], [6], [7] |
| Department or zone segmentation | Internal zone boundaries | Subnet | Blocks cross-department paths | Whole zones still trusted | [15] |
| Service-level least privilege (ACL) | Every enforcement point | Host + protocol + port | Minimal required reachability | More rules; more order dependence | [2], [5], [9] |
| Microsegmentation / Zero Trust | Per resource or session; identity-aware | Workload or session | Limits lateral movement; no location-based trust | Management cost; little peer-reviewed measurement | [4], [14]–[16] |
| Policy-management tooling | Specification, design or audit | Any | Detects or prevents anomalies | Usability rarely evaluated | [10]–[13], [17] |

**Is a broader policy easier to administer?** In the narrow sense, yes: it has fewer rules and fewer order dependencies. However, [3] asks that only needed traffic be allowed, which a broad internal policy does not achieve. Simplicity therefore trades against standards compliance.

**Does granularity reduce unnecessary access?** Logically yes, as [4], [5] and [16] argue. However, none of the empirical studies we found measures that reduction against a written list of required flows.

**Does rule count equal complexity?** The evidence says no. Wool's complexity measure goes beyond rule count [2]. The anomaly literature [9]–[12] shows that short policies can differ greatly in risk depending on rule order and overlap. Our inference is that **order dependence and the number of enforcement points** predict management difficulty better than rule count. Part B tests this on a small scale.

**Does tooling remove the trade-off?** The tools in [10]–[12], [17] reduce anomalies by construction or by detection. However, without usability studies [13] their effect on human error is asserted rather than shown. We treat tooling as a mitigation, not as proof that least privilege is free.

**Does microsegmentation change the management model?** Yes. It moves enforcement next to each workload and, in Zero Trust form, ties decisions to identity [4], [14]. This removes the trusted-inside assumption but multiplies policy objects, a cost the sources we found do not quantify.

**Our interpretation.** The literature supports a *conditional* position:

- Least privilege reduces exposure, but its management cost is real. That cost grows with order dependence and enforcement points, and tooling only partly offsets it.
- Plain ACLs remain adequate for small, stable networks with well-understood flows.
- Plain ACLs are insufficient where identity, device state or continuous verification must drive decisions [4], [8].

### 4. Conclusion and Future Scope

The literature agrees on three points: misconfiguration is common, rule order creates hidden conflicts, and network location is a weak basis for trust. It disagrees, often implicitly, on two questions: whether finer-grained policy lowers net risk once its complexity is counted, and how far automation changes that balance. The main gaps are dated empirical evidence, little measurement of unnecessary access against stated requirements, and little evaluation of tool usability.

Future work should measure security gain and management cost together, on the same policy, as it is refined. Part B does this in a controlled Packet Tracer network. It compares broad, department-level and service-level policies using the same test cases and enforcement points. Studies with real administrators and real rule sets would be needed before generalising.

### References (shared by Parts A, B and C)

The references use IEEE style. Metadata for every entry was checked online on 2026-10-08 (Appendix B). DOIs or URLs are given only where an authoritative listing showed them. Full-text claim checks by the team are still pending.

[1] A. Wool, "A quantitative study of firewall configuration errors," *Computer*, vol. 37, no. 6, pp. 62–67, Jun. 2004. [Online]. Available: https://ieeexplore.ieee.org/document/1306389

[2] A. Wool, "Trends in firewall configuration errors: Measuring the holes in Swiss cheese," *IEEE Internet Computing*, vol. 14, no. 4, pp. 58–65, 2010. (Extended version: arXiv:0911.1240.)

[3] K. Scarfone and P. Hoffman, "Guidelines on firewalls and firewall policy," NIST, Gaithersburg, MD, USA, Special Publication 800-41 Rev. 1, Sep. 2009, doi: 10.6028/NIST.SP.800-41r1.

[4] S. Rose, O. Borchert, S. Mitchell, and S. Connelly, "Zero trust architecture," NIST, Gaithersburg, MD, USA, Special Publication 800-207, Aug. 2020, doi: 10.6028/NIST.SP.800-207.

[5] J. H. Saltzer and M. D. Schroeder, "The protection of information in computer systems," *Proc. IEEE*, vol. 63, no. 9, pp. 1278–1308, Sep. 1975.

[6] N. Freed, "Behavior of and requirements for Internet firewalls," IETF, RFC 2979, Oct. 2000.

[7] P. Ferguson and D. Senie, "Network ingress filtering: Defeating denial of service attacks which employ IP source address spoofing," IETF, BCP 38, RFC 2827, May 2000, doi: 10.17487/RFC2827.

[8] R. Ward and B. Beyer, "BeyondCorp: A new approach to enterprise security," *;login:*, vol. 39, no. 6, Dec. 2014. *(Practitioner article; supporting context.)*

[9] E. Al-Shaer and H. Hamed, "Discovery of policy anomalies in distributed firewalls," in *Proc. IEEE INFOCOM 2004*, pp. 2605–2616. [PLACEHOLDER: confirm DOI 10.1109/INFCOM.2004.1354680 on IEEE Xplore.]

[10] E. Al-Shaer, H. Hamed, R. Boutaba, and M. Hasan, "Conflict classification and analysis of distributed firewall policies," *IEEE J. Sel. Areas Commun.*, vol. 23, no. 10, pp. 2069–2083, Oct. 2005, doi: 10.1109/JSAC.2005.854119.

[11] L. Yuan, J. Mai, Z. Su, H. Chen, C.-N. Chuah, and P. Mohapatra, "FIREMAN: A toolkit for FIREwall modeling and ANalysis," in *Proc. IEEE Symp. Security and Privacy*, 2006, pp. 199–213, doi: 10.1109/SP.2006.16.

[12] M. G. Gouda and A. X. Liu, "Structured firewall design," *Computer Networks*, vol. 51, no. 4, pp. 1106–1120, 2007.

[13] A. Voronkov, L. H. Iwaya, L. A. Martucci, and S. Lindskog, "Systematic literature review on usability of firewall configuration," *ACM Comput. Surv.*, vol. 50, no. 6, Art. no. 87, 2017, doi: 10.1145/3130876.

[14] N. Syed, S. W. Shah, A. Shaghaghi, A. Anwar, Z. Baig, and R. Doss, "Zero trust architecture (ZTA): A comprehensive survey," *IEEE Access*, vol. 10, pp. 57143–57179, 2022. [Online]. Available: https://ieeexplore.ieee.org/document/9773102 [PLACEHOLDER: confirm author initials and DOI on IEEE Xplore.]

[15] R. Chandramouli, "Guide to a secure enterprise network landscape," NIST, Gaithersburg, MD, USA, Special Publication 800-215, Nov. 2022, doi: 10.6028/NIST.SP.800-215.

[16] Cybersecurity and Infrastructure Security Agency, "Microsegmentation in zero trust, part one: Introduction and planning," CISA, Jul. 2025. *(Government guidance; supporting context.)*

[17] Y. Bartal, A. Mayer, K. Nissim, and A. Wool, "Firmato: A novel firewall management toolkit," *ACM Trans. Comput. Syst.*, vol. 22, no. 4, pp. 381–420, Nov. 2004, doi: 10.1145/1035582.1035583.

[18] J. Arkko, M. Cotton, and L. Vegoda, "IPv4 address blocks reserved for documentation," IETF, RFC 5737, Jan. 2010.

**Source mix.**

| Category | Count | References |
|---|---|---|
| Peer-reviewed papers | 10 | [1], [2], [5], [9]–[14], [17] |
| IETF RFCs | 3 | [6], [7], [18] |
| NIST publications | 3 | [3], [4], [15] |
| Supporting context | 2 | [8], [16] |
| **Total** | **18** | Required: at least 15, including at least 8 peer-reviewed papers or original standards. |

\newpage

# PART B — Simulation-Based Case Study

> **Status: design complete; simulation not yet run.** Every allowed or denied outcome below is a **planned expectation**, derived by tracing the rules by hand. Observed-result cells are blank and must be filled only from the team's own runs. [PLACEHOLDER: Packet Tracer version used by all members.]

## B1. Experimental Objective and Research Question

**Research question.** How does refining policy from broad, to department-level, to service-level least privilege change (a) the unnecessary flows the policy allows and (b) the policy's size, specificity and dependence on rule order, and how does this compare with the literature reviewed in Part A?

**What is compared.** The experiment compares three **policy stages**. Each stage is a bundle of refinements (Table 5), not a change in granularity alone, so differences are attributed to the stage as a whole.

**Held constant across stages:**

- topology, addressing, routing and server services
- the required and forbidden flows
- the seven enforcement points
- the 26 test cases and their methods

Conclusions are limited to the 26 test cases and to the traffic directions listed in B6.

**Working expectations (to be tested, not assumed):**

- **E1.** The number of forbidden test cases that are permitted falls from Stage 1 to Stage 3.
- **E2.** ACL entries and match conditions rise from Stage 1 to Stage 3.
- **E3.** Rule count alone does not capture complexity.
- **E4.** Some excess access remains because L3/L4 ACLs cannot express it.

## B2. Network Architecture

The network has 19 devices: four departments, a server zone and a simulated external network.

- **R-CORE** performs router-on-a-stick inter-VLAN routing and holds the internal ACLs.
- **R-EDGE** holds the edge ACL.
- External addresses use the RFC 5737 documentation range 203.0.113.0/24 [18].

Routing is static and there is no NAT; this simplification is discussed in Part C.

**Table 2. Device inventory**

| Device | Packet Tracer model | Role |
|------------------------|------------|--------------------------------|
| R-CORE | ISR 2911 | Inter-VLAN routing; internal ACLs; SSH management target |
| R-EDGE | ISR 2911 | Edge router; edge ACL; SSH management target |
| SW-ACCESS, SW-SERVER, SW-EXT | 2960-24TT | Department, server and external access switches |
| HR-PC1/2, FIN-PC1/2, IT-PC1/2, SAL-PC1/2 | PC-PT | Two users per department |
| WEB-SRV, DNS-SRV, HR-SRV, FIN-SRV | Server-PT | Portal (HTTP/HTTPS), DNS, HR app (HTTPS), finance records (FTP, standing in for a database) |
| EXT-WEB, EXT-HOST | Server-PT, PC-PT | External web site and external client |

**Table 3. VLAN and addressing plan**

| VLAN / zone | Subnet | Gateway | Hosts |
|----------|------------|--------------------|--------------------|
| 10 HR | 192.168.10.0/24 | 192.168.10.1 (R-CORE G0/0.10) | .11, .12 |
| 20 Finance | 192.168.20.0/24 | 192.168.20.1 (G0/0.20) | .11, .12 |
| 30 IT | 192.168.30.0/24 | 192.168.30.1 (G0/0.30) | .11, .12 |
| 40 Sales | 192.168.40.0/24 | 192.168.40.1 (G0/0.40) | .11, .12 |
| 50 Servers | 192.168.50.0/24 | 192.168.50.1 (G0/1.50) | WEB .10, DNS .20, HR-SRV .30, FIN-SRV .40 |
| Transit | 10.0.0.0/30 | — | R-CORE .1, R-EDGE .2 |
| External | 203.0.113.0/24 | 203.0.113.1 (R-EDGE G0/1) | EXT-WEB .10, EXT-HOST .50 |

All internal subnets fall inside 192.168.0.0/16, so one ACL entry can match "any internal destination". This shows how address planning affects rule count.

[PLACEHOLDER: Figure F01, topology screenshot.]

## B3. Communication Requirements

The requirements were written before any ACL. Every Stage 2 and Stage 3 rule traces back to one of them.

**Table 4. Required (R) and forbidden (X) flows**

| ID | Source → Destination | Service | Type |
|----|--------------------------|------------------|--------------------|
| R1 | All departments → DNS-SRV | DNS (UDP 53) | Required |
| R2 | All departments → WEB-SRV | HTTP/HTTPS | Required |
| R3 | HR → HR-SRV | HTTPS | Required |
| R4 | Finance → FIN-SRV | FTP (control: TCP 21) | Required |
| R5 | IT → R-CORE, R-EDGE | SSH | Required |
| R6 | IT → servers | ICMP echo | Required |
| R7 | All departments → external web | HTTP/HTTPS | Required |
| R8 | External → WEB-SRV | HTTP/HTTPS | Required |
| X1 | Department → other department | Any | Forbidden |
| X2 | Non-HR → HR-SRV | Any | Forbidden |
| X3 | Non-Finance → FIN-SRV | Any | Forbidden |
| X4 | Non-IT → router management | SSH/Telnet | Forbidden |
| X5 | Anyone → routers | Telnet | Forbidden |
| X6 | Non-IT → servers | ICMP and unused ports | Forbidden |
| X7 | External → anything except R8 | Any | Forbidden |
| U1 | PC ↔ PC in the same VLAN | Any | Not filterable by a router ACL (Layer 2 only) |

## B4. Network Configuration and Stage 0 Baseline

**Configuration.** Stage 0 configures, with **no ACLs**:

- VLANs and 802.1Q trunks
- R-CORE subinterfaces
- static routes (a default route on R-CORE; 192.168.0.0/16 on R-EDGE)
- the intended server services only
- DNS records
- SSH on both routers

The configuration scripts are in the project repository (Appendix A).

**Baseline.** Stage 0 is a positive control. All 26 test cases must succeed with no ACLs, including the forbidden flows. A later denial can then only come from an ACL, not from a fault.

**Pilot.** Before Stage 1, a nine-step pilot (P1–P9) checks the Packet Tracer behaviours the design relies on:

1. DNS
2. HTTPS
3. ACL counters
4. Simulation Mode drop evidence
5. Sequence-number editing
6. The `established` keyword
7. FTP through a port-21-only ACL
8. SSH with VTY `access-class` on alternate router addresses
9. Telnet removal

[PLACEHOLDER: Stage 0 results (Table 7, column Obs. S0) and pilot outcomes P1–P9, from `planning/decisions-log.md`.]

[PLACEHOLDER: Figures F02–F04, VLAN, trunk and route outputs and the Stage 0 baseline.]

## B5. Policy Stages

The seven enforcement points are identical in every stage:

| Point | Location |
|----------|--------------------------------------------------|
| AP1 | R-EDGE G0/1 inbound |
| AP2–AP5 | R-CORE G0/0.10, .20, .30 and .40 inbound |
| AP6, AP7 | VTY `access-class` on R-CORE and R-EDGE |

**Table 5. What changes between policy stages**

| Factor | Stage 1 — Broad | Stage 2 — Department-level | Stage 3 — Service-level least privilege |
|----------|------------------|------------------|------------------|
| Internal ACL | One shared ACL: any internal source → any destination (source-validity check only, cf. [7]) | One ACL per department: own department → whole server subnet and outside; other departments denied | One ACL per department naming host + protocol + port; deny internal *before* the Internet-web permits |
| Edge ACL | Public web to WEB-SRV; `established` return traffic; ICMP replies | Same as Stage 1 | Return traffic limited to source ports 80/443; no ICMP |
| Router management | Any internal source; Telnet + SSH | IT only; Telnet + SSH | IT only; SSH only |

Representative rules (Stage 3, HR); the full ACLs are in Appendix A:

```
ip access-list extended ACL-HR-IN
 permit udp 192.168.10.0 0.0.0.255 host 192.168.50.20 eq domain   ! R1
 permit tcp 192.168.10.0 0.0.0.255 host 192.168.50.10 eq www      ! R2
 permit tcp 192.168.10.0 0.0.0.255 host 192.168.50.10 eq 443      ! R2
 permit tcp 192.168.10.0 0.0.0.255 host 192.168.50.30 eq 443      ! R3
 deny   ip  192.168.10.0 0.0.0.255 192.168.0.0 0.0.255.255        ! X1-X6
 permit tcp 192.168.10.0 0.0.0.255 any eq www                     ! R7
 permit tcp 192.168.10.0 0.0.0.255 any eq 443                     ! R7
 deny   ip any any
```

**Table 6. Planned ACL size per stage** (derived from the design; *measured* values will come from `show access-lists`)

| Measure | Stage 1 | Stage 2 | Stage 3 |
|--------------------------|----------|----------|----------|
| Application points | 7 | 7 | 7 |
| ACL definitions (distinct names) | 4 (3) | 7 (6) | 7 (6) |
| Explicit ACL entries | 11 | 26 | 40 |
| Edge-ACL entries | 7 | 7 | 5 |
| Order-dependent entry pairs | 0 | 9 | 24 |

**FTP data channel (pending pilot P7).** Stage 3 is expected to permit TCP 21 for Finance → FIN-SRV (the required test T04). The Finance ACL only sees packets sent by Finance hosts. In active-mode FTP, the client's data-connection replies go to server port 20. In passive mode, the client connects to a high server port. Under real IOS behaviour, the Stage 3 "deny internal" entry would block both. No data-port rule has been added in advance. If pilot P7 shows one is needed, the team will choose between one minimal entry and switching the finance service to HTTPS, and record that decision. The forbidden FTP tests (T08, T09, T16) depend only on the control connection being refused, so they are unaffected.

## B6. Test Method

**Test set.** There are 26 test cases: 12 required, 13 forbidden, and one same-VLAN control (T18). They are run in Stage 0 and in every stage, in the same order, from the same PCs, after `clear access-list counters`.

| Service | How it is tested |
|--------------------|------------------------------------------------|
| HTTP/HTTPS | PC browser |
| DNS | `nslookup` |
| FTP (required test T04) | `ftp` with login, `dir` and `get` |
| SSH/Telnet | Client; *allowed* means the login prompt appears |
| ICMP | `ping`, used only for ICMP requirements |

**Evidence for a denial.** A denial counts only with the client-side failure **plus** either a rising deny-entry counter or Simulation Mode showing the drop.

**Directions.**

- Tested: user VLANs → servers, other VLANs, routers and outside; external → internal; any → router management.
- Not tested: server-initiated traffic (also not filtered) and inter-server traffic.

Planned outcomes in Table 7 use these codes:

| Code | Meaning |
|----------|------------------------------------------------|
| A | allowed |
| D | denied |
| A\* | allowed although forbidden |
| A† | allowed, but not filterable by a router ACL |
| (P7) | depends on pilot step P7 |

Stage 0 is planned as A for all 26 test cases. **The four Observed columns are blank because Packet Tracer has not been run.**

**Table 7. Test cases: planned outcomes and observed results**

| Test | Flow | Method | Req. | Plan S1 | Plan S2 | Plan S3 | Obs. S0 | Obs. S1 | Obs. S2 | Obs. S3 |
|------|--------------------|---------|----|-----|-----|------|----|----|----|----|
| T01 | HR-PC1 → WEB-SRV | HTTP | R2 | A | A | A | | | | |
| T02 | SAL-PC1 → WEB-SRV | HTTPS | R2 | A | A | A | | | | |
| T03 | HR-PC1 → DNS-SRV | nslookup | R1 | A | A | A | | | | |
| T04 | FIN-PC1 → FIN-SRV | FTP login + dir + get | R4 | A | A | A (P7) | | | | |
| T05 | HR-PC1 → HR-SRV | HTTPS | R3 | A | A | A | | | | |
| T06 | IT-PC1 → R-CORE 192.168.30.1 | SSH | R5 | A | A | A | | | | |
| T07 | HR-PC1 → FIN-PC1 | ping | X1 | A\* | D | D | | | | |
| T08 | SAL-PC1 → FIN-SRV | FTP | X3 | A\* | A\* | D | | | | |
| T09 | HR-PC1 → FIN-SRV | FTP | X3 | A\* | A\* | D | | | | |
| T10 | SAL-PC1 → HR-SRV | HTTPS | X2 | A\* | A\* | D | | | | |
| T11 | SAL-PC1 → R-CORE 192.168.40.1 | SSH | X4 | A\* | D | D | | | | |
| T12 | IT-PC1 → R-CORE 192.168.30.1 | Telnet | X5 | A\* | A\* | D | | | | |
| T13 | HR-PC1 → WEB-SRV | ping | X6 | A\* | A\* | D | | | | |
| T14 | IT-PC1 → FIN-SRV | ping | R6 | A | A | A | | | | |
| T15 | EXT-HOST → WEB-SRV | HTTP | R8 | A | A | A | | | | |
| T16 | EXT-HOST → FIN-SRV | FTP | X7 | D | D | D | | | | |
| T17 | HR-PC1 → EXT-WEB | HTTP | R7 | A | A | A | | | | |
| T18 | HR-PC1 → HR-PC2 | ping (same VLAN) | U1 | A† | A† | A† | | | | |
| T19 | SAL-PC1 → R-CORE 192.168.50.1 | SSH | X4 | A\* | D | D | | | | |
| T20 | SAL-PC1 → R-EDGE 10.0.0.2 | SSH | X4 | A\* | D | D | | | | |
| T21 | EXT-HOST → HR-PC1 | ping | X7 | D | D | D | | | | |
| T22 | IT-PC1 → R-EDGE 10.0.0.2 | SSH | R5 | A | A | A | | | | |
| T23 | SAL-PC1 → WEB-SRV | HTTP | R2 | A | A | A | | | | |
| T24 | SAL-PC1 → DNS-SRV | nslookup | R1 | A | A | A | | | | |
| T25 | SAL-PC1 → R-CORE 192.168.40.1 | Telnet | X4, X5 | A\* | D | D | | | | |
| T26 | SAL-PC1 → R-EDGE 10.0.0.2 | Telnet | X4, X5 | A\* | D | D | | | | |

## B7. Controlled Misconfiguration Experiments

These experiments run on **copies** of stage files. Their results are reported separately and never mixed into the stage metrics.

**Table 8. Misconfiguration experiments**

| Experiment | Base | Change | Planned observation | Observed |
|----------|--------|--------------------|--------------------|------|
| M1: shadowed rule | Copy of **Stage 2** | Append `deny tcp 192.168.40.0 0.0.0.255 host 192.168.50.40 eq ftp` to ACL-SAL-IN without a sequence number; then fix by inserting it at sequence 5 | Before the fix: T08 still allowed, and the appended deny shows 0 matches (shadowed, cf. [9], [10]). After the fix: T08 denied. | |
| M2: over-restriction | Copy of **Stage 3** | Remove the DNS permit from ACL-HR-IN | nslookup fails; browsing by IP works; browsing by name fails | |
| M3: misordered permit | — | **Deferred**; not part of this submission | — | — |

## B8. Metrics and Comparative Analysis

**Table 9. Metrics: planned and measured values** (measured columns are blank until the simulation is run; values must come only from saved configurations and test runs)

| Metric | Definition | Planned S1 / S2 / S3 | Meas. S1 | Meas. S2 | Meas. S3 |
|----------|------------------|--------|-----|-----|-----|
| Explicit ACL entries | Permit/deny lines in `show access-lists` | 11 / 26 / 40 | | | |
| Order-dependent entry pairs | Same ACL, opposite actions, overlapping matches; the terminal deny is excluded | 0 / 9 / 24 | | | |
| Required test cases passed (of 12) | From Table 7 | 12 / 12 / 12 | | | |
| Forbidden test cases permitted (of 13) | From Table 7 | 11 / 5 / 0 | | | |
| Sales exposed services (of 9) / unnecessary | Internal services only; router services counted only on the addresses tested from SAL-PC1; Internet browsing excluded | 9/6, 5/2, 3/0 | | | |
| Zero-match entries | Counter is 0 after the full run (relative to the 26 test cases) | — | | | |
| Configuration lines changed | Diff against the previous stage | — | | | |

[PLACEHOLDER: comparison chart (Figure F19) from the measured columns only.]

[PLACEHOLDER: discussion of results, to be written after measurement. Assess E1–E4 as supported, partly supported or not supported, using only observed data.]

## B9. Evidence Plan

**Table 10. Screenshot plan.** Every screenshot must come from the team's own `.pkt` files. None has been captured yet.

| Fig. | Content | Stage |
|------|------------------------------------------------------------|------|
| F01 | Final topology | 0 |
| F02 | `show vlan brief`, `show interfaces trunk` | 0 |
| F03 | Subinterfaces, `show ip interface brief`, `show ip route` | 0 |
| F04 | Stage 0 baseline: all 26 test cases | 0 |
| F05 | Stage 1 broad policy: edge ACL, shared internal ACL and remote-login restriction | 1 |
| F06–F07 | Stage 1 excess access (e.g. T08, T10); external denied (T16, T21) | 1 |
| F08–F10 | Stage 2 ACLs and access-class; inter-department denied (T07); residual access (T08) | 2 |
| F11–F14 | Stage 3 ACLs; required services permitted; unnecessary access denied; `show access-lists` counters | 3 |
| F15 | Simulation Mode: packet dropped at R-CORE | 3 |
| F16 | Same-VLAN traffic unaffected (T18) | 3 |
| F17 | M1: appended deny with zero matches, then fix | M1 |
| F18 | M2: DNS failure | M2 |
| F19 | Stage comparison chart | All |

\newpage

# PART C — Alignment and Limitations Note (provisional)

*This note is provisional: no Packet Tracer results exist yet. It separates what the literature supports, what the experiment is planned to show, and known design limitations. It will be rewritten from measured results.*

**C.1 Comparison with the literature (planned, not observed).** The experiment tests four positions from Part A:

- traffic should be denied by default and permitted only where needed [3], [5]
- rule order is the source of anomalies [9]–[11]
- complexity is associated with configuration risk [2]
- location-based trust is insufficient [4]

**Table 11. Provisional alignment**

| Planned observation (not yet measured) | Literature | Expected relation |
|------------------------------|----------|------------------------------|
| Forbidden test cases permitted: 11 → 5 → 0 | [3], [5] | Would agree |
| ACL entries 11 → 26 → 40; order-dependent pairs 0 → 9 → 24 | [2] | Would agree |
| Edge ACL shrinks (7 → 5) while becoming stricter | [2], [9] | Would partly agree (rule count can mislead) |
| M1 deny shows 0 matches | [9], [10] | Would agree, if counters work in Packet Tracer (P3) |
| Same-VLAN traffic allowed in every stage (T18) | [15], [16] | Would agree; a limit of router ACLs |

[PLACEHOLDER: replace "would agree" with *agrees*, *differs* or *partly agrees*, with reasons, once measured.]

**C.2 What the simulation cannot capture.**

- **Scale:** 19 devices and tens of rules, compared with the large multi-vendor rule sets in [1], [2].
- **People and process:** administrators, change management and policy drift over time [13].
- **Identity and continuous verification:** ACLs decide on addresses and ports only, never on user or device identity [4], [8], [14]. Stage 3 is therefore not Zero Trust.
- **State:** `established` is stateless and accepts any TCP segment with ACK set, unlike a stateful firewall.
- **Realism:** there is no real attack traffic, logging or monitoring, and protocol behaviour follows Packet Tracer's models. FTP behaviour is pending pilot P7.

**C.3 Simplifications.**

- **Finance service:** FTP replaces a database, which Packet Tracer lacks.
- **Network design:** there is no NAT or DMZ; routing is static; there is one core router with no redundancy.
- **Traffic not filtered:** server-initiated traffic is neither filtered nor tested.
- **Exposure metric scope:** Sales only, internal services only, and only the router addresses tested.

\newpage

# Individual Contribution Statement

[PLACEHOLDER: complete from `documentation/contribution.md`. Each member lists their functional role, viva section, main contributions and what they reviewed or verified, then signs.]

| Member | Reg. No. | Role(s) | Viva section | Main contributions | Reviewed / verified | Sign. |
|----------------|----------------|------|------|------------|--------|------|
| [PLACEHOLDER: name] | [PLACEHOLDER: reg. no.] | | | | | |
| [PLACEHOLDER: name] | [PLACEHOLDER: reg. no.] | | | | | |
| [PLACEHOLDER: name] | [PLACEHOLDER: reg. no.] | | | | | |
| [PLACEHOLDER: name] | [PLACEHOLDER: reg. no.] | | | | | |
| [PLACEHOLDER: name] | [PLACEHOLDER: reg. no.] | | | | | |

# Appendix A — Configuration Sources

The configuration scripts are in the project repository. **They have not yet been tested in Packet Tracer.**

| Repository path | Contents |
|----------------------------------|--------------------------------------------|
| `packet-tracer/configs/stage0/` | Base configuration of every device |
| `packet-tracer/configs/stage1/` | Stage 1 policy |
| `packet-tracer/configs/stage2/` | Stage 2 policy |
| `packet-tracer/configs/stage3/` | Stage 3 policy |
| `packet-tracer/configs/misconfig/` | M1 and M2 |
| `network-design/acl-design.md` | Full rule tables, rule-by-rule traces and metric definitions |

[PLACEHOLDER: replace with the saved `show running-config` outputs after the build.]

# Appendix B — Reference Verification Record

**What was checked.** On 2026-10-08, the bibliographic details below were checked against listings from the publisher, IETF, NIST, CISA, USENIX, the authors' pages or institutional repositories. Crossref and dblp could not be reached from the drafting environment.

**Still to do.** For each reference, the member who cites it must open the full text, confirm the claim attributed to it, tick the last column and add their name.

| Ref. | What was confirmed online | Claim in this draft that relies on it | Full text read (by whom) |
|----|----------------------|----------------------|------------------|
| [1] | Authors, title, venue, vol./issue/pages (IEEE Xplore) | First quantitative study of corporate rule-set quality | ☐ |
| [2] | Venue and pages (author page); content from the arXiv abstract | Still poorly configured; complexity correlated with risk items; complexity measure; no improvement in newer versions | ☐ (check that the IEEE version matches the arXiv abstract) |
| [3] | Authors, date, DOI (NIST CSRC) | Default deny; risk-based traffic list; keep the policy updated | ☐ |
| [4] | Authors, date, DOI (NIST) | No implicit trust from location; authentication and authorisation before a session; resource focus | ☐ |
| [5] | Venue, vol./issue, pp. 1278–1308 | Least privilege; fail-safe defaults | ☐ |
| [6] | RFC 2979, author, Oct. 2000, Informational | Firewall behaviour under-specified; filter and relay roles | ☐ |
| [7] | RFC 2827 / BCP 38, authors, May 2000, DOI | Ingress filtering of spoofed sources | ☐ |
| [8] | ;login: vol. 39 no. 6, Dec. 2014 (USENIX PDF) | Perimeter model questioned; access by user and device credentials | ☐ |
| [9] | INFOCOM 2004, pp. 2605–2616 (from citing sources) | Anomaly definitions | ☐ (confirm the DOI and the definitions) |
| [10] | JSAC 23(10):2069–2083, DOI (repository and a Crossref-deposited reference) | Anomaly classification; Firewall Policy Advisor | ☐ |
| [11] | S&P 2006, pp. 199–213, DOI (institutional repository) | Static analysis with BDDs; real misconfigurations found | ☐ |
| [12] | Computer Networks 51(4):1106–1120 (bibliographic index; author PDF) | Firewall decision diagrams; consistency, completeness, compactness | ☐ |
| [13] | ACM CSUR 50(6) Art. 87, DOI (ACM DL) | Configuration error-prone; usability rarely evaluated | ☐ |
| [14] | IEEE Access 10:57143–57179 (IEEE Xplore) | Microsegmentation as a ZTA building block | ☐ (confirm the author initials and DOI) |
| [15] | NIST SP 800-215, Nov. 2022, DOI | Vanished perimeter; lateral movement; microsegmentation, ZTNA and SDP; zone segmentation context (Table 1) | ☐ |
| [16] | CISA alert, 29 Jul. 2025 | Microsegmentation reduces the attack surface and limits lateral movement; implementation challenges | ☐ |
| [17] | ACM TOCS 22(4):381–420, DOI (dblp-derived listing; author page) | Entity-relationship model, compiler, operational prototype | ☐ |
| [18] | RFC 5737, authors, Jan. 2010 | 203.0.113.0/24 reserved for documentation | ☐ |

**Remaining source gaps.**

- **Minimum counts:** met (18 total; 10 peer-reviewed; 3 RFCs; 3 NIST publications).
- **Microsegmentation evidence:** mostly government guidance. One more *peer-reviewed* empirical microsegmentation study would strengthen §2.4. [PLACEHOLDER: optional additional source, verified.]
- **Full-text checks:** every claim must be checked against the full text before submission (last column above).
