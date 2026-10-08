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

**Status of this version.** Part A is a complete draft. Part B sets out our experimental design in full, but **we have not yet run the Cisco Packet Tracer simulation**. Every outcome in Part B is therefore a *planned* expectation, and every observed-result field is blank. Part C is provisional until we have results to compare with the literature.

**Review notes for the team.** Notes in the form [TEAM CHECK: …] mark statements that need our own evidence or judgement before submission. Notes in the form [PLACEHOLDER: …] mark missing details. Both must be resolved or removed before we submit.

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

**List of figures.** All figures will be screenshots taken from our own Packet Tracer simulation. **None has been captured yet.** Table 10 lists the planned figures.

\newpage

# PART A — Review Paper

## Firewall Policy Complexity: A Thematic Review of Perimeter Filtering, Least Privilege and Policy Management

### Abstract

Router access control lists (ACLs) and firewalls are still the most widely used way to control which hosts may talk to which, yet they protect a network only as well as the policy written into them. This paper reviews research papers, standards and government guidance on firewall and ACL policy management under five themes: perimeter filtering, policy anomalies, policy growth and misconfiguration, least privilege with microsegmentation and Zero Trust, and policy-management approaches.

Across these themes the sources agree that real rule sets are often misconfigured, that rule order hides conflicts, and that network location alone is a weak basis for trust. They part ways on whether finer-grained policy actually lowers risk, given that empirical work links rule-set complexity to errors, and on whether automated tooling removes that tension.

We identify three gaps: the empirical evidence rests on a few older datasets, the usability of management tools is seldom evaluated, and peer-reviewed measurements of microsegmentation are scarce. We argue that the security gained and the management cost incurred by a policy should be measured together, and we design a small Packet Tracer case study to do so.

**Keywords:** firewall policy, access control list, least privilege, policy anomalies, microsegmentation, Zero Trust.

### 1. Introduction

A packet filter is only as good as its rules. Wool's analysis of real corporate rule sets [1] was the first quantitative study of firewall configuration quality. A larger follow-up [2] concluded that firewalls were still poorly configured, and that the more complex a rule set was, the more risk items it tended to contain.

Standards guidance sets a demanding target: block all traffic that has not been expressly permitted, and derive the permitted traffic from a risk analysis of what the organisation actually needs [3]. Zero Trust guidance goes further, granting no implicit trust on the basis of network location [4]. Both restate the much older principle of least privilege [5].

Put together, these positions create the tension this review examines. A broad policy is short and easy to write, but it allows far more communication than anyone needs. A least-privilege policy allows only what is needed, but it has more rules, more conditions and more dependence on rule order, which are exactly the properties that [2] associates with configuration errors. We ask how the literature treats this trade-off, and where its evidence is thin.

**Method.** We searched IEEE Xplore, the ACM Digital Library, Google Scholar, the IETF RFC series and the NIST and CISA publication catalogues, using terms such as *firewall policy anomaly*, *firewall configuration errors*, *ACL shadowing*, *least privilege*, *microsegmentation* and *zero trust architecture*. [PLACEHOLDER: search dates and hit counts from `research/search-log.md`.] We preferred peer-reviewed papers and original standards. Government guidance and one practitioner article are used only as supporting context, and are labelled as such in the reference list.

Section 2 reviews the literature by theme, Section 3 compares the approaches and gives our interpretation, and Section 4 concludes.

### 2. Literature Review

#### 2.1 Perimeter Filtering and the Trusted-Inside Assumption

The classical firewall sits at the boundary between an organisation and the Internet. RFC 2979 [6] describes firewalls as packet filters, protocol relays or a mix of both, and notes that their behaviour was often under-specified, which caused problems in practice. NIST SP 800-41 Rev. 1 [3] gives the operational model that most later work assumes: write an explicit policy for both inbound and outbound traffic, allow only the IP protocols that are needed, block everything not expressly permitted, and keep the policy up to date. RFC 2827 [7] adds ingress filtering, which drops traffic whose source address does not belong to the network it arrives from. We use this source-validity check as the whole of our internal "broad" policy in Part B, because it is a realistic minimum that still leaves the inside of the network open.

These sources agree that a default-deny boundary is the minimum acceptable posture. Later work questions whether the boundary is the right place to decide trust at all: Ward and Beyer [8] describe an enterprise that abandoned its privileged internal network and granted access based on user and device credentials instead. The perimeter literature says little about traffic *between* internal segments, and that gap is where our case study begins.

#### 2.2 Policy Anomalies: Ordering, Shadowing and Redundancy

Because ACLs are evaluated first-match-wins, the meaning of any rule depends on every rule above it. Al-Shaer and Hamed [9] formalised the anomalies this produces, and Al-Shaer *et al.* [10] extended them to distributed firewalls and automated their discovery in the *Firewall Policy Advisor*. We use four of their anomaly classes:

- **Shadowing:** an earlier rule with a different action matches every packet of a later rule, so the later rule never takes effect.
- **Correlation:** rules with different actions partially overlap.
- **Generalisation:** a later rule covers a superset of an earlier rule's packets with the opposite action.
- **Redundancy:** a rule can be removed without changing what the policy does.

[PLACEHOLDER: confirm these definitions against the full text of [9], [10]; secondary sources agree with them.]

Other authors attack the same problem from different directions. FIREMAN [11] applies static analysis, modelling every packet and path with binary decision diagrams to flag violations and inconsistencies; its authors report real misconfigurations found in enterprise networks. Gouda and Liu [12] aim to prevent anomalies rather than find them: policies are written as firewall decision diagrams, which are conflict-free and complete by construction, and then compiled into a compact rule list.

The four works agree that order dependence is the root cause of anomalies, but they intervene at different times: [9]–[11] audit rules that already exist, while [12] works at design time. All of them rely mainly on formal analysis or tool case studies rather than on evidence of how often administrators actually introduce anomalies. In Part B we count order-dependent rule pairs in each policy stage, and we deliberately reproduce a shadowed rule (experiment M1).

#### 2.3 Policy Growth, Misconfiguration and Excessive Permissions

Wool's two studies [1], [2] are the strongest empirical evidence we found. The second used a larger dataset from two vendors, introduced a composite *firewall complexity* measure, and found no significant sign that newer software versions had fewer errors [2]. The implication is that complexity, not the raw number of rules, is what tracks risk. Voronkov *et al.* [13] reach a compatible conclusion from the usability literature: configuration is complicated and error-prone, it gets worse as networks grow, and the solutions proposed for it are rarely validated with real users.

The sources agree that misconfiguration is common and that complexity contributes to it. However, the datasets in [1] and [2] are now old, and neither measures *excessive permission*, meaning access the policy allows but the business does not need. This is why Part B defines unnecessary access against a requirements matrix that we wrote before writing any rule.

#### 2.4 Least Privilege, Microsegmentation and Zero Trust

Two of Saltzer and Schroeder's design principles [5] run through this whole literature: *least privilege*, under which every program and user operates with the smallest set of privileges it needs, and *fail-safe defaults*, under which access is decided by permission rather than by exclusion. NIST SP 800-207 [4] applies them to networks. It grants no implicit trust on the basis of location or asset ownership, authenticates and authorises subjects and devices before every session, and protects resources rather than network segments.

Microsegmentation is one way of putting this into practice. Syed *et al.* [14] identify it as one building block of Zero Trust, alongside authentication, access control, encryption and automation. NIST SP 800-215 [15] argues that the enterprise perimeter has effectively disappeared and that broad internal connectivity lets attackers move laterally, and it presents microsegmentation, Zero Trust network access and software-defined perimeters as responses. CISA [16] likewise presents microsegmentation as a way to shrink the attack surface and limit lateral movement, while acknowledging that it is hard to implement.

These sources agree that location-based trust is not enough and that segmentation limits lateral movement. There is an unresolved tension, though: microsegmentation multiplies policy boundaries and rules, the very property [2] links to errors, and the guidance we found does not quantify that cost. Most of it is also guidance rather than peer-reviewed measurement. Router ACLs cannot provide identity-aware, continuously verified access [4], so the least-privilege stage in Part B is a network-layer approximation of these ideas, not an implementation of Zero Trust.

#### 2.5 Policy-Management Approaches

Three families of approach try to make fine-grained policy manageable. Firmato [17] works at *specification* time: it keeps policy and topology in one entity-relationship model and compiles that model into vendor configurations, and its prototype ran an operational firewall for several months. FIREMAN [11] and the Firewall Policy Advisor [10] work at *audit* time, checking existing policies for anomalies. Firewall decision diagrams [12] work at *design* time, producing rule sets that are consistent, complete and compact.

All three share the premise that administrators should not hand-edit long, ordered rule lists; they differ in where they step in. What none of them has shown convincingly is that they reduce human error in practice. Voronkov *et al.* [13] found that such proposals rarely include usability evaluation, so the claim that tooling removes the cost of least privilege remains largely untested with real administrators.

#### 2.6 Research Gaps Across Themes

Four gaps recur across the themes:

1. The empirical misconfiguration data are dated and come from few sources [1], [2].
2. Excessive permission is rarely measured against stated requirements.
3. Security gain and management cost are seldom measured together, on the same policy, as it is refined.
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

**Is a broader policy easier to administer?** In the narrow sense, yes: it has fewer rules and fewer order dependencies to reason about. But [3] asks that only needed traffic be allowed, and a broad internal policy does not achieve that. Simplicity is bought at the cost of standards compliance.

**Does finer granularity reduce unnecessary access?** In principle it must, and [4], [5] and [16] argue for it on that basis. However, none of the empirical studies we found measures the reduction against a written list of required flows, which is the measurement Part B is designed to make.

**Is rule count a fair measure of complexity?** The evidence suggests not. Wool's complexity measure deliberately goes beyond counting rules [2], and the anomaly literature [9]–[12] shows that two short policies can differ greatly in risk depending on rule order and overlap. Our inference is that **order dependence and the number of enforcement points** are better guides to management difficulty than rule count. Part B tests this on a small scale. [TEAM CHECK: confirm that the team agrees with this inference before submission.]

**Does tooling remove the trade-off?** The tools in [10]–[12] and [17] reduce anomalies either by construction or by detection. Without usability studies [13], however, their effect on human error is asserted rather than demonstrated, so we treat tooling as a mitigation rather than as evidence that least privilege comes at no cost.

**Does microsegmentation change the management model?** It does. It moves enforcement next to each workload and, in its Zero Trust form, ties access decisions to identity [4], [14]. That removes the trusted-inside assumption, but it multiplies the number of policy objects, a cost the sources we found do not quantify.

**Our interpretation.** Taken together, the literature supports a *conditional* position. Least privilege reduces exposure, but its management cost is real, it appears to grow with order dependence and the number of enforcement points, and tooling offsets it only in part. Plain ACLs remain a reasonable choice for small, stable networks whose required flows are well understood; they are not sufficient where identity, device state or continuous verification must drive access decisions [4], [8]. [TEAM CHECK: this is our judgement from the sources, not a measured finding; confirm the wording.]

### 4. Conclusion and Future Scope

The sources we reviewed agree that misconfiguration is common, that rule order creates conflicts that are hard to see, and that network location is a weak basis for trust. They disagree, often implicitly, on whether finer-grained policy lowers net risk once its complexity is counted, and on how far automation changes that balance. The weakest points in the evidence are the age of the empirical datasets, the lack of measurements of unnecessary access against stated requirements, and the lack of usability evaluations of management tools.

Future work should measure security gain and management cost together, on the same policy, as it is refined. Part B of this report sets up exactly that comparison in a controlled Packet Tracer network, comparing broad, department-level and service-level policies over the same test cases and enforcement points. A study of this size cannot be generalised; work with real administrators and real rule sets would be needed for that.

### References (shared by Parts A, B and C)

The references follow IEEE style. We checked the bibliographic details of every entry online on 2026-10-08 (Appendix B), and give DOIs or URLs only where an authoritative listing showed them. The team has not yet checked every claim against the full text.

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

> **Status: design complete; simulation not yet run.** Every allowed or denied outcome in this part is a **planned expectation**, worked out by tracing packets through the rules by hand. Observed-result cells are blank and will be filled only from our own Packet Tracer runs. **Draft scope:** we run the same 17 of the 26 designed test cases in every stage; the other nine are marked *not run*. [PLACEHOLDER: Packet Tracer version used by all members.]

## B1. Experimental Objective and Research Question

**Research question.** How does refining policy from broad, to department-level, to service-level least privilege change (a) the unnecessary flows the policy allows and (b) the policy's size, specificity and dependence on rule order, and how does this compare with the literature reviewed in Part A?

**What we compare.** We compare three **policy stages**. Each stage changes several things at once (Table 5): the structure of the internal ACLs, their granularity, the edge filter and the rules for router management. We therefore attribute any difference to the stage as a whole, not to granularity alone.

To keep the comparison fair, we hold the following constant in every stage: the topology, addressing, routing and server services; the required and forbidden flows; the seven points where filters are applied; and the same 17 test cases (of 26 designed), run with the same methods. Our conclusions are limited to those 17 test cases and to the traffic directions listed in B6.

**Working expectations.** We expect the following, but we treat them as hypotheses to test, not as results:

- **E1.** The number of forbidden test cases that are permitted falls from Stage 1 to Stage 3.
- **E2.** The number of ACL entries and match conditions rises from Stage 1 to Stage 3.
- **E3.** Rule count alone does not capture complexity.
- **E4.** Some excess access remains in every stage, because L3/L4 ACLs cannot express it.

## B2. Network Architecture

We designed a 19-device network with four departments, a server zone and a small simulated "Internet". It is large enough for policy to grow in interesting ways, but small enough to build and test by hand.

- **R-CORE** routes between the department VLANs (router-on-a-stick) and holds all internal ACLs. We chose a router rather than a multilayer switch because IOS routers in Packet Tracer support extended ACLs and VTY access control fully, and because putting every internal policy decision on one device makes the rules easy to count and audit. The price is a single point of failure, which we accept as a simplification.
- **R-EDGE** connects the external network and holds the edge ACL. Without it we could not show perimeter filtering, which is where the topic starts.
- **External addresses** use the RFC 5737 documentation range 203.0.113.0/24 [18], so the simulated Internet does not use real public addresses.
- **Two PCs per department** let us test traffic inside a VLAN, which never reaches the router and so cannot be filtered by a router ACL.

Routing is static and there is no NAT, which keeps external tests readable; Part C discusses what this leaves out.

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

All internal subnets fall inside 192.168.0.0/16, so a single ACL entry can match "any internal destination". The address plan therefore directly affects how many rules the policy needs.

[PLACEHOLDER: Figure F01, topology screenshot.]

## B3. Communication Requirements

We wrote down which flows the organisation needs, and which it must not have, before writing any ACL. Every Stage 2 and Stage 3 rule traces back to one of the requirements in Table 4, and "unnecessary access" in our results means a flow in the forbidden (X) rows that the policy nevertheless allows.

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

Packet Tracer servers do not offer a database service, so we represent the finance records system with FTP (R4). Part C discusses what this substitution leaves out.

## B4. Network Configuration and Stage 0 Baseline

**Configuration.** Stage 0 builds the working network with **no ACLs**: VLANs and 802.1Q trunks, the R-CORE subinterfaces, static routes (a default route on R-CORE and a 192.168.0.0/16 route on R-EDGE), only the intended server services, the DNS records, and SSH on both routers. The configuration scripts are in our project repository (Appendix A).

**Why a baseline.** Stage 0 is a positive control. Every one of the 17 test cases, including the forbidden ones, must succeed before any ACL is applied. If a test later fails, we can then attribute the failure to the policy rather than to a routing or service fault.

**Pilot.** Before Stage 1, a pilot checks the Packet Tracer behaviours our design relies on. The full plan has nine steps (P1–P9). For this draft we run the three that the stage tests cannot cover on their own: **P3** (whether `show access-lists` match counters work, which we need as evidence of denials), **P7** (whether FTP works through a rule that allows only port 21) and **P8** (whether SSH and VTY `access-class` behave as expected, including on alternate router addresses). The other six are not run for this draft.

[PLACEHOLDER: Stage 0 results (Table 7, column Obs. S0) and the outcomes of pilot steps P3, P7 and P8, from `planning/decisions-log.md`.]

[PLACEHOLDER: Figures F02–F04, VLAN, trunk and route outputs and the Stage 0 baseline.]

## B5. Policy Stages

All three stages apply filters at the same seven points:

| Point | Location |
|----------|--------------------------------------------------|
| AP1 | R-EDGE G0/1 inbound |
| AP2–AP5 | R-CORE G0/0.10, .20, .30 and .40 inbound |
| AP6, AP7 | VTY `access-class` on R-CORE and R-EDGE |

Only the contents of the filters change. Table 5 shows what changes at each stage.

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

**FTP data channel (pending pilot P7).** The Stage 3 Finance ACL is expected to permit TCP port 21 from Finance to FIN-SRV, which the required test T04 depends on. That ACL only sees packets sent *by* Finance hosts. In active-mode FTP, the client's replies on the separate data connection go to server port 20; in passive mode, the client opens the data connection to a high server port. Under real IOS behaviour, the Stage 3 "deny internal" entry would block both. We have deliberately not added a data-port rule in advance. If pilot P7 shows that one is needed, the team will choose between adding one minimal entry and moving the finance service to HTTPS, and will record that decision. The forbidden FTP tests (T08, T09 and T16) depend only on the control connection being refused, so the data-channel question does not affect them.

## B6. Test Method

**Test set.** We designed 26 test cases: 12 required, 13 forbidden and one same-VLAN control (T18). To fit the time available for this draft, the team agreed to run the same **17** in Stage 0 and in every stage, in the same order, from the same PCs, after clearing the ACL counters:

- required (8): T01, T03, T04, T05, T06, T14, T15, T17
- forbidden (8): T07, T08, T10, T11, T12, T13, T16, T19
- control (1): T18

These 17 cover every forbidden flow (X1–X7) and every required flow, with one partial exception: R5 (IT SSH to both routers) is tested only towards R-CORE (T06), because the R-EDGE test (T22) is not run. The other nine test cases (T02, T09, T20–T26) are **not run**, so we do not measure the Sales exposure metric, which depends on them, and we draw no conclusion about them.

| Service | How it is tested |
|--------------------|------------------------------------------------|
| HTTP/HTTPS | PC browser |
| DNS | `nslookup` |
| FTP (required test T04) | `ftp` with login, `dir` and `get` |
| SSH/Telnet | Client; *allowed* means the login prompt appears |
| ICMP | `ping`, used only for ICMP requirements |

**Evidence for a denial.** We count a test as denied only when the client-side failure is accompanied by either a rising counter on the deny entry or Simulation Mode showing where the packet was dropped.

**Directions.** We test traffic from the user VLANs to servers, other VLANs, routers and the outside; from the outside to the inside; and towards router management. We do not test traffic that servers initiate (which our design also does not filter), or traffic between servers.

Planned outcomes in Table 7 use these codes:

| Code | Meaning |
|----------|------------------------------------------------|
| A | allowed |
| D | denied |
| A\* | allowed although forbidden |
| A† | allowed, but not filterable by a router ACL |
| (P7) | depends on pilot step P7 |
| not run | outside the 17-test draft scope; no result |

Stage 0 is planned as A for every test case. Observed cells for the 17 test cases run are blank until Packet Tracer has been run; the nine test cases outside the draft scope are marked *not run*.

**Table 7. Test cases: planned outcomes and observed results**

| Test | Flow | Method | Req. | Plan S1 | Plan S2 | Plan S3 | Obs. S0 | Obs. S1 | Obs. S2 | Obs. S3 |
|------|--------------------|---------|----|-----|-----|------|----|----|----|----|
| T01 | HR-PC1 → WEB-SRV | HTTP | R2 | A | A | A | | | | |
| T02 | SAL-PC1 → WEB-SRV | HTTPS | R2 | A | A | A | not run | not run | not run | not run |
| T03 | HR-PC1 → DNS-SRV | nslookup | R1 | A | A | A | | | | |
| T04 | FIN-PC1 → FIN-SRV | FTP login + dir + get | R4 | A | A | A (P7) | | | | |
| T05 | HR-PC1 → HR-SRV | HTTPS | R3 | A | A | A | | | | |
| T06 | IT-PC1 → R-CORE 192.168.30.1 | SSH | R5 | A | A | A | | | | |
| T07 | HR-PC1 → FIN-PC1 | ping | X1 | A\* | D | D | | | | |
| T08 | SAL-PC1 → FIN-SRV | FTP | X3 | A\* | A\* | D | | | | |
| T09 | HR-PC1 → FIN-SRV | FTP | X3 | A\* | A\* | D | not run | not run | not run | not run |
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
| T20 | SAL-PC1 → R-EDGE 10.0.0.2 | SSH | X4 | A\* | D | D | not run | not run | not run | not run |
| T21 | EXT-HOST → HR-PC1 | ping | X7 | D | D | D | not run | not run | not run | not run |
| T22 | IT-PC1 → R-EDGE 10.0.0.2 | SSH | R5 | A | A | A | not run | not run | not run | not run |
| T23 | SAL-PC1 → WEB-SRV | HTTP | R2 | A | A | A | not run | not run | not run | not run |
| T24 | SAL-PC1 → DNS-SRV | nslookup | R1 | A | A | A | not run | not run | not run | not run |
| T25 | SAL-PC1 → R-CORE 192.168.40.1 | Telnet | X4, X5 | A\* | D | D | not run | not run | not run | not run |
| T26 | SAL-PC1 → R-EDGE 10.0.0.2 | Telnet | X4, X5 | A\* | D | D | not run | not run | not run | not run |

## B7. Controlled Misconfiguration Experiments

These experiments recreate two of the problems described in Part A on **copies** of the stage files. We report their results separately and never mix them into the stage metrics. [TEAM CHECK: decide whether M1 and M2 will be run for this draft; if not, mark their Observed cells "not run".]

**Table 8. Misconfiguration experiments**

| Experiment | Base | Change | Planned observation | Observed |
|----------|--------|--------------------|--------------------|------|
| M1: shadowed rule | Copy of **Stage 2** | Append `deny tcp 192.168.40.0 0.0.0.255 host 192.168.50.40 eq ftp` to ACL-SAL-IN without a sequence number; then fix by inserting it at sequence 5 | Before the fix: T08 still allowed, and the appended deny shows 0 matches (shadowed, cf. [9], [10]). After the fix: T08 denied. | |
| M2: over-restriction | Copy of **Stage 3** | Remove the DNS permit from ACL-HR-IN | nslookup fails; browsing by IP works; browsing by name fails | |
| M3: misordered permit | — | **Deferred**; not part of this submission | — | — |

## B8. Metrics and Comparative Analysis

| Metric | Definition | Planned S1 / S2 / S3 | Meas. S1 | Meas. S2 | Meas. S3 |
|----------|------------------|--------|-----|-----|-----|
| Explicit ACL entries | Permit/deny lines in `show access-lists` | 11 / 26 / 40 | | | |
| Order-dependent entry pairs | Same ACL, opposite actions, overlapping matches; the terminal deny is excluded | 0 / 9 / 24 | | | |
| Required test cases passed (of 8 run) | From Table 7 | 8 / 8 / 8 | | | |
| Forbidden test cases permitted (of 8 run) | From Table 7 | 7 / 4 / 0 | | | |
| Sales exposed services | Needs the full Sales sweep (T02, T20, T23–T26), which is not run in this draft | — | not measured | not measured | not measured |
| Zero-match entries | Counter is 0 after the run (relative to the 17 test cases run only) | — | | | |
| Configuration lines changed | Diff against the previous stage | — | | | |

[PLACEHOLDER: comparison chart (Figure F19), drawn from the measured columns only.]

[PLACEHOLDER: discussion of results, to be written after measurement. Assess E1–E4 as supported, partly supported or not supported, using only observed data.]

## B9. Evidence Plan

**Table 10. Screenshot plan.** Every screenshot will come from our own `.pkt` files. None has been captured yet.

| Fig. | Content | Stage |
|------|------------------------------------------------------------|------|
| F01 | Final topology | 0 |
| F02 | `show vlan brief`, `show interfaces trunk` | 0 |
| F03 | Subinterfaces, `show ip interface brief`, `show ip route` | 0 |
| F04 | Stage 0 baseline: the 17 test cases run | 0 |
| F05 | Stage 1 broad policy: edge ACL, shared internal ACL and remote-login restriction | 1 |
| F06–F07 | Stage 1 excess access (e.g. T08, T10); external denied (T16) | 1 |
| F08–F10 | Stage 2 ACLs and access-class; inter-department denied (T07); residual access (T08) | 2 |
| F11–F14 | Stage 3 ACLs; required services permitted; unnecessary access denied; `show access-lists` counters | 3 |
| F15 | Simulation Mode: packet dropped at R-CORE | 3 |
| F16 | Same-VLAN traffic unaffected (T18) | 3 |
| F17 | M1: appended deny with zero matches, then fix | M1 |
| F18 | M2: DNS failure | M2 |
| F19 | Stage comparison chart | All |

\newpage

# PART C — Alignment and Limitations Note (provisional)

*This note is provisional because we have no Packet Tracer results yet. It separates what the literature supports, what the experiment is planned to show, and the known limits of our design. We will rewrite it from measured results.*

**C.1 Comparison with the literature (planned, not observed).** The experiment is designed to test four positions from Part A: that traffic should be denied by default and permitted only where needed [3], [5]; that rule order is the source of anomalies [9]–[11]; that complexity is associated with configuration risk [2]; and that location-based trust is insufficient [4]. Table 11 shows how each planned observation would relate to the literature *if* it is borne out.

**Table 11. Provisional alignment**

| Planned observation (not yet measured) | Literature | Expected relation |
|------------------------------|----------|------------------------------|
| Forbidden test cases permitted (of 8 run): 7 → 4 → 0 | [3], [5] | Would agree |
| ACL entries 11 → 26 → 40; order-dependent pairs 0 → 9 → 24 | [2] | Would agree |
| Edge ACL shrinks (7 → 5) while becoming stricter | [2], [9] | Would partly agree (rule count can mislead) |
| M1 deny shows 0 matches | [9], [10] | Would agree, if counters work in Packet Tracer (P3) |
| Same-VLAN traffic allowed in every stage (T18) | [15], [16] | Would agree; a limit of router ACLs |

[PLACEHOLDER: replace "would agree" with *agrees*, *differs* or *partly agrees*, with reasons, once measured.]

**C.2 What the simulation cannot capture.** Our network has 19 devices and a few dozen rules, while the rule sets studied in [1] and [2] were large and came from several vendors. The simulation leaves out the people and processes that cause policies to drift over time [13]. ACLs decide only on addresses and ports, never on user or device identity [4], [8], [14], so our Stage 3 is not Zero Trust. The `established` keyword is stateless and accepts any TCP segment with the ACK flag set, unlike a stateful firewall. There is no real attack traffic, logging or monitoring, and protocol behaviour follows Packet Tracer's models; how FTP behaves is still pending pilot P7.

**C.3 Simplifications.** We use FTP in place of a database, which Packet Tracer lacks. There is no NAT or DMZ, routing is static, and a single core router has no redundancy. Server-initiated traffic is neither filtered nor tested. Finally, we run only 17 of the 26 designed test cases, so the Sales exposure metric is not measured and zero-match counts reflect only the tests we ran.

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

Our configuration scripts are in the project repository. **We have not yet tested them in Packet Tracer.**

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

**What was checked.** On 2026-10-08 we checked the bibliographic details below against listings from the publisher, IETF, NIST, CISA, USENIX, the authors' own pages or institutional repositories. Crossref and dblp could not be reached from the drafting environment.

**Still to do.** For each reference, the member who cites it must read the full text, confirm the claim we attribute to it, tick the last column and add their name.

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
