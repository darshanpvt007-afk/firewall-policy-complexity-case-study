---
title: "Firewall Policy Complexity: From Simple ACLs to Least Privilege Network Access"
subtitle: "BACSE203 Computer Networks — Fall 2026 Case Study (Topic 17)"
---

<!--
DRAFT STATUS (remove this comment block before submission)
- Prepared 2026-10-08 from the project repository. Draft version 0.1.
- Packet Tracer has NOT been run. Every outcome in Part B is PLANNED; every observed-result cell is blank.
- References: 18 listed. Their metadata was checked online (publisher, IETF, NIST or author pages). Each team member must still
  open the full text of the sources they cite and confirm the attributed claims (see Appendix B).
- Placeholders are written as [PLACEHOLDER: ...]. Search for "PLACEHOLDER" before submission.
-->

# Title Page

| | |
|---|---|
| **Course** | BACSE203 Computer Networks, Fall 2026, School of Computer Science and Engineering, VIT Vellore |
| **Topic** | 17. Firewall Policy Complexity: From Simple ACLs to Least Privilege Network Access |
| **Team name** | [PLACEHOLDER: team name] |
| **Members and registration numbers** | [PLACEHOLDER: Member 1 — Reg. No.]<br>[PLACEHOLDER: Member 2 — Reg. No.]<br>[PLACEHOLDER: Member 3 — Reg. No.]<br>[PLACEHOLDER: Member 4 — Reg. No.]<br>[PLACEHOLDER: Member 5 — Reg. No.] |
| **Faculty** | [PLACEHOLDER: faculty name] |
| **Submission date** | [PLACEHOLDER: date] |

**Status of this version.** Part A is a complete draft. Part B describes the full experimental design, but the Cisco Packet Tracer simulation **has not yet been run**: every expected outcome is labelled *planned*, and every observed-result field is blank. Part C is provisional until Part B results exist.

## List of Tables

1. Comparison of access-control approaches (Part A)
2. Device inventory
3. VLAN and addressing plan
4. Required and forbidden communication flows
5. What changes between policy stages
6. Planned ACL size per stage
7. Test cases with planned and observed outcomes
8. Controlled misconfiguration experiments
9. Planned and measured metrics
10. Evidence (screenshot) plan
11. Provisional alignment of planned observations with the literature (Part C)

## List of Figures

All figures will be original screenshots from the team's own Packet Tracer simulation. **None has been captured yet.** The planned list is in Table 10.

\newpage

# PART A — Review Paper

## Firewall Policy Complexity: A Thematic Review of Perimeter Filtering, Least Privilege and Policy Management

### Abstract

Firewalls and router access control lists (ACLs) remain the most widely deployed network access-control mechanism. Yet the protection they provide depends entirely on the quality of the policy they enforce. This paper reviews research, standards and government guidance on firewall and ACL policy management. It organises the material into five themes:

1. Perimeter filtering.
2. Policy anomalies such as shadowing and redundancy.
3. Policy growth, misconfiguration and excessive permissions.
4. Least privilege, microsegmentation and Zero Trust.
5. Policy-management approaches.

Across these themes the literature agrees on three points. Real-world rule sets are frequently misconfigured. Rule order creates conflicts that are hard to see by inspection. Trust based only on network location is insufficient. The literature divides on whether finer-grained policy reduces risk or adds the complexity that empirical studies associate with configuration errors. It also divides on whether automated tooling resolves that tension. We find that the evidence base relies on a small number of older empirical datasets. We also find that the usability of proposed management tools is rarely evaluated, and that peer-reviewed evaluations of microsegmentation remain scarce compared with government and vendor guidance. We argue that security gain and management cost should be measured together. A companion Packet Tracer case study is designed to do this on a small scale.

**Keywords:** firewall policy, access control list, least privilege, policy anomalies, microsegmentation, Zero Trust.

### 1. Introduction

A packet filter is only as good as its rules. Wool's analysis of real corporate rule sets [1] was the first quantitative study of firewall configuration quality. A larger follow-up [2] concluded that firewalls were still poorly configured, and that rule-set complexity was positively correlated with the number of risk items found. Standards guidance asks for a different kind of policy. It recommends that firewalls block all inbound and outbound traffic that has not been expressly permitted, and that the permitted traffic be derived from a risk analysis of what the organisation actually needs [3]. Zero Trust guidance goes further. It holds that no implicit trust should be granted on the basis of network location alone [4]. This is a modern restatement of the much older principle of least privilege [5].

Taken together, these positions create a practical tension. A broad policy has few rules and is easy to write, but it allows more communication than the organisation needs. A policy that grants only what is required has more rules, more conditions and more dependence on rule order. Empirical work links exactly those properties to configuration errors [2].

This review asks how the literature characterises that trade-off. It is organised around five themes, not around individual papers. Sources were identified through IEEE Xplore, the ACM Digital Library, Google Scholar, the IETF RFC series and the NIST and CISA publication catalogues. Search terms included *firewall policy anomaly*, *firewall configuration errors*, *ACL shadowing*, *least privilege network access*, *microsegmentation* and *zero trust architecture*. [PLACEHOLDER: add search dates and hit counts from `research/search-log.md`.] Peer-reviewed papers and original standards were preferred. Government guidance and one practitioner article are used as supporting context and are identified as such.

Section 2 presents the themes. Section 3 compares them and gives our interpretation. Section 4 concludes and outlines future work, including the companion simulation in Part B.

### 2. Literature Review

#### 2.1 Perimeter Filtering and the Trusted-Inside Assumption

The classical firewall sits at the boundary between an organisation and the Internet. RFC 2979 [6] describes firewalls as packet filters, protocol relays, or both. It also observes that their behaviour was often unspecified or underspecified, which caused interoperability problems in practice. NIST SP 800-41 Rev. 1 [3] gives operational guidance for this model:

- Write an explicit policy for both inbound and outbound traffic.
- Allow only the IP protocols that are needed.
- Block everything not expressly permitted.
- Keep the policy updated as needs and threats change.

The ingress-filtering practice of RFC 2827 [7] adds a source-validity check: traffic arriving from a network should be dropped if its source address does not belong to that network. This check reappears as the "broad" baseline policy in Part B.

*Agreement.* These sources agree that a default-deny boundary policy is the minimum expected posture.

*Disagreement.* They differ sharply from later work on whether the boundary is the right place to decide trust. Ward and Beyer [8] describe an enterprise that abandoned the privileged internal network altogether and granted access based on user and device credentials. They argue that perimeter security rests on a flawed assumption.

*Limitation and gap.* The perimeter sources say little about traffic *between* internal segments. That is precisely where the topic of this case study begins.

#### 2.2 Policy Anomalies: Ordering, Shadowing and Redundancy

Because ACLs are evaluated first-match-wins, the meaning of a rule depends on every rule above it. Al-Shaer and Hamed [9] formalised the resulting anomalies. Al-Shaer *et al.* [10] extended the classification to distributed firewalls and implemented automatic discovery in the *Firewall Policy Advisor*. The anomaly classes used throughout this report follow that line of work:

- **Shadowing:** an earlier rule with a different action matches every packet a later rule would match, so the later rule never takes effect.
- **Correlation:** two rules with different actions partially overlap.
- **Generalisation:** a later rule covers a superset of an earlier rule's packets but takes the opposite action.
- **Redundancy:** a rule can be removed without changing the policy's effect.

[PLACEHOLDER: confirm these definitions against the full text of [9]–[10]; secondary sources agree with them.]

FIREMAN [11] approaches the problem by static analysis. It treats configurations as programs and models every possible packet and path with binary decision diagrams. This lets it flag violations, inconsistencies and inefficiencies in single and distributed firewalls. Its authors report finding real misconfigurations in enterprise networks. Gouda and Liu [12] take the opposite route. Instead of detecting anomalies after the fact, they have designers express the policy as a firewall decision diagram, which is conflict-free and complete by construction. The diagram is then compiled into a compact rule sequence.

*Agreement.* All four works agree that order dependence is the root cause of anomalies.

*Disagreement.* They differ in method: [9]–[11] audit an existing rule list, whereas [12] avoids anomalies at design time.

*Limitation.* All four rely mainly on formal analysis or tool case studies, rather than measuring how often administrators actually introduce these anomalies.

*Link to our study.* Part B counts order-dependent rule pairs in each policy stage. It also reproduces a shadowed rule deliberately (experiment M1).

#### 2.3 Policy Growth, Misconfiguration and Excessive Permissions

The strongest empirical evidence on misconfiguration comes from Wool's two studies [1], [2]. The second analysed a larger dataset that covered two vendors. It reported that its earlier conclusions held, introduced a composite *firewall complexity* measure, and found no significant sign that newer software versions reduced errors [2]. Two consequences follow. First, complexity, not rule count alone, is the quantity associated with risk. Second, errors persist despite vendor improvements.

Voronkov *et al.* [13] reviewed the usability literature on firewall configuration. They describe configuration as complicated and error-prone, and say the problem worsens as network complexity grows. They also found that the proposed solutions are rarely validated through usability evaluation or user studies.

*Agreement.* These sources agree that misconfiguration is common and that complexity contributes to it.

*Gap.* The two empirical datasets [1], [2] are now old. Neither directly measures *excessive permission*, meaning access that is allowed but not required. Errors are detected as risky rules, not as unnecessary reachability relative to stated business needs.

*Link to our study.* Part B therefore defines unnecessary access explicitly, against a requirements matrix written before any rule.

#### 2.4 Least Privilege, Microsegmentation and Zero Trust

Saltzer and Schroeder's design principles [5] include *least privilege*: every program and user should operate with the least set of privileges necessary for the job. They also include *fail-safe defaults*, meaning access decisions should be based on permission rather than exclusion.

NIST SP 800-207 [4] applies these ideas to networks. Zero Trust grants no implicit trust on the basis of network location or asset ownership. It authenticates and authorises subjects and devices before a session is established, and it focuses protection on resources rather than on network segments. Syed *et al.* [14] survey Zero Trust architectures and identify microsegmentation as one of several building blocks, alongside authentication, access control, encryption and security automation. NIST SP 800-215 [15] observes that the enterprise perimeter has effectively vanished, that attack surfaces have grown, and that broad connectivity lets attackers move laterally. It discusses microsegmentation, Zero Trust network access and software-defined perimeters as architectural responses. CISA's 2025 guidance [16] presents microsegmentation as a way to shrink the attack surface, limit lateral movement and improve visibility. It also acknowledges implementation challenges.

*Agreement.* These sources agree that location-based trust is insufficient and that segmentation limits lateral movement.

*Disagreement or tension.* Microsegmentation multiplies the number of policy boundaries and rules. That is the very property [2] associates with errors. The guidance documents recommend it, but they do not quantify the management cost it adds.

*Limitation.* Much of the microsegmentation material is government or vendor guidance, not peer-reviewed measurement.

*Link to our study.* Router ACLs cannot implement identity-aware, continuously verified access [4]. Part B therefore treats its least-privilege stage as a *network-layer approximation* of these ideas, not as Zero Trust.

#### 2.5 Policy-Management Approaches

Three families of approach try to make fine-grained policy manageable:

- **Abstraction and compilation.** Firmato [17] holds the security policy and the network topology in one entity-relationship model. A model definition language edits it, and a compiler generates firewall-specific configurations. Its prototype ran an operational firewall for several months.
- **Analysis and verification.** FIREMAN [11] and the Firewall Policy Advisor [10] check existing policies for anomalies.
- **Structured design.** Firewall decision diagrams [12] produce consistent, complete and compact rule sets.

*Agreement.* These approaches agree that administrators should not hand-edit long ordered rule lists.

*Disagreement.* They disagree on where to intervene: at specification [17], at design [12], or at audit [10], [11].

*Gap.* Voronkov *et al.* [13] found that such proposals rarely include usability evaluation. So the claim that tooling removes the complexity cost of least privilege is largely untested with real administrators.

#### 2.6 Research Gaps

Four gaps recur across the themes:

1. **Old empirical base.** Empirical misconfiguration data are dated and come from few sources [1], [2].
2. **Unmeasured excess.** Excessive permission is rarely measured against stated requirements.
3. **No joint measurement.** Security gain and management cost are seldom measured together for the same policy as it is refined.
4. **Untested tools.** The usability and real-world effect of policy-management tools are under-evaluated [13].

### 3. Comparative Discussion and Analysis

Table 1 compares the approaches reviewed.

**Table 1. Comparison of access-control approaches in the reviewed literature**

| Approach | Where trust is decided | Typical granularity | Main strength reported | Main weakness or open issue | Sources |
|---|---|---|---|---|---|
| Perimeter filtering | Network boundary | Zone or subnet | Simple; clear default-deny posture | Little control over internal (lateral) traffic | [3], [6], [7] |
| Department or zone segmentation | Internal zone boundaries | Subnet | Blocks cross-department paths | Whole zones still trusted | [3], [15] |
| Service-level least privilege (ACL) | Every enforcement point | Host + protocol + port | Minimal required reachability | More rules and more order dependence | [2], [5], [9] |
| Microsegmentation / Zero Trust | Per resource or session, identity-aware | Workload or session | Limits lateral movement; no location-based trust | Implementation and management cost; little peer-reviewed measurement | [4], [14]–[16] |
| Policy-management tooling | Specification, design or audit | Any | Detects or prevents anomalies | Usability rarely evaluated | [10]–[13], [17] |

**Is a broader policy easier to administer?** The literature implies yes, in the narrow sense that it has fewer rules and fewer order dependencies. But [3] recommends allowing only what is needed, which a broad internal policy does not do. "Easy" therefore trades directly against standards compliance.

**Does granularity reduce unnecessary access?** Logically yes, and [4], [5] and [16] all argue for it. However, none of the reviewed empirical studies measures the reduction against a written list of required flows.

**Does rule count equal complexity?** The evidence says no. Wool's complexity measure deliberately goes beyond the raw number of rules [2]. The anomaly literature [9]–[12] shows that two short policies can differ greatly in risk depending on rule order and overlap. Our inference is that **order dependence and the number of enforcement points** are better predictors of management difficulty than rule count. Part B tests this claim on a small scale.

**Does tooling remove the trade-off?** The tools in [10]–[12], [17] reduce anomalies by construction or by detection. However, the lack of usability studies [13] means their effect on human error is largely asserted rather than shown. We therefore treat tooling as a mitigation, not as evidence that least privilege is free.

**Does microsegmentation change the management model?** Yes. It moves enforcement closer to each workload and, in Zero Trust form, ties decisions to identity [4], [14]. This removes the "trusted inside" assumption but multiplies policy objects. The microsegmentation literature we found does not quantify that multiplication.

**Our interpretation.** We reach three conclusions:

- The reviewed work supports a *conditional* position: least privilege reduces exposure, but its management cost is real, grows with order dependence and enforcement points, and is only partly offset by tooling.
- Plain ACLs remain adequate where the environment is small and stable and the required flows are well understood.
- ACLs are insufficient where identity, device state or continuous verification must drive decisions [4], [8].

### 4. Conclusion and Future Scope

The literature agrees that misconfiguration is common, that rule order creates hidden conflicts, and that network location is a weak basis for trust. It disagrees, implicitly, on whether finer-grained policy reduces net risk once its complexity cost is counted, and on how much automation changes that balance. The main gaps are dated empirical evidence, little measurement of unnecessary access against stated requirements, and little evaluation of tool usability.

Future work should measure security gain and management cost together, on the same policy, as it is refined. The companion case study (Part B) does this in a controlled Cisco Packet Tracer network. It compares a broad, a department-level and a service-level least-privilege policy using the same test cases and the same enforcement points. Larger-scale studies with real administrators and real rule sets would be needed before generalising.

### References (shared by Parts A, B and C)

IEEE style. Metadata for every entry was checked online on 2026-10-08 (see Appendix B). DOIs or URLs are given only where an authoritative listing showed them.

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

[14] N. Syed, S. W. Shah, A. Shaghaghi, A. Anwar, Z. Baig, and R. Doss, "Zero trust architecture (ZTA): A comprehensive survey," *IEEE Access*, vol. 10, pp. 57143–57179, 2022. [Online]. Available: https://ieeexplore.ieee.org/document/9773102

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
| **Total** | **18** | Minimum required: 15 total, of which at least 8 peer-reviewed or original standards. |

\newpage

# PART B — Simulation-Based Case Study

> **Status: design complete; simulation not yet run.** No Packet Tracer results exist yet.
>
> - Every allowed or denied outcome below is a **planned expectation**, derived by tracing the rules by hand.
> - Observed-result cells are blank and must be filled only from the team's own runs.
> - [PLACEHOLDER: Packet Tracer version used by all members.]

## B1. Experimental Objective and Research Question

**Research question.** How does refining policy from broad, to department-level, to service-level least privilege change:

- (a) the unnecessary flows the policy allows, and
- (b) the policy's size, specificity and dependence on rule order?

And how does this compare with the literature reviewed in Part A?

**What is compared.** The experiment compares three **policy stages**. Each stage is a bundle of refinements, not a change in granularity alone (Table 5), so differences are attributed to the stage as a whole.

**Held constant across stages:**

- topology, addressing, routing and server services
- the required and forbidden flows
- the seven enforcement points and their direction
- the 26 test cases and the methods used to run them

**Scope.** Conclusions will be limited to the 26 test cases and to the traffic directions listed in B6.

**Working expectations (to be tested, not assumed):**

- **E1.** The number of forbidden test cases that are permitted falls from Stage 1 to Stage 3.
- **E2.** ACL entries and match conditions rise from Stage 1 to Stage 3.
- **E3.** Rule count alone does not capture complexity.
- **E4.** Some excess access remains because L3/L4 ACLs cannot express it.

## B2. Network Architecture

The topology is an enterprise network with four departments, a server zone and a simulated external network. It contains 19 devices.

- R-CORE performs router-on-a-stick inter-VLAN routing and holds the internal ACLs.
- R-EDGE holds the edge ACL.
- External test addresses use the RFC 5737 documentation range 203.0.113.0/24 [18].

The design uses static routing and no NAT. That simplification is discussed in Part C.

**Table 2. Device inventory**

| Device | Packet Tracer model | Role |
|---|---|---|
| R-CORE | ISR 2911 | Inter-VLAN routing; internal ACLs; SSH management target |
| R-EDGE | ISR 2911 | Edge router; edge ACL; SSH management target |
| SW-ACCESS, SW-SERVER, SW-EXT | 2960-24TT | Department, server and external access switches |
| HR-PC1/2, FIN-PC1/2, IT-PC1/2, SAL-PC1/2 | PC-PT | Two users per department |
| WEB-SRV, DNS-SRV, HR-SRV, FIN-SRV | Server-PT | Portal (HTTP/HTTPS), DNS, HR app (HTTPS), finance records (FTP, standing in for a database) |
| EXT-WEB, EXT-HOST | Server-PT, PC-PT | External web site and external client |

**Table 3. VLAN and addressing plan**

| VLAN / zone | Subnet | Gateway | Hosts |
|---|---|---|---|
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

Requirements were written before any ACL. Every Stage 2 and Stage 3 rule traces back to one of them.

**Table 4. Required (R) and forbidden (X) flows**

| ID | Source → Destination | Service | Type |
|---|---|---|---|
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
| U1 | PC ↔ PC in the same VLAN | Any | Not filterable by a router ACL (Layer-2 only) |

## B4. Network Configuration and Stage 0 Baseline

**Configuration.** Stage 0 configures the following, with **no ACLs**:

- VLANs and 802.1Q trunks
- R-CORE subinterfaces
- static routes: a default route on R-CORE, and 192.168.0.0/16 on R-EDGE
- server services, with only the intended services enabled
- DNS records
- SSH on both routers

The complete configuration scripts are in the project repository under `packet-tracer/configs/stage0/` (Appendix A).

**Baseline test.** Stage 0 is a positive control. All 26 test cases must succeed with no ACLs, including the forbidden flows. That proves each flow is routable and each service is running, so that any later denial can be attributed to an ACL rather than to a fault.

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

[PLACEHOLDER: Stage 0 results (Table 7, column S0) and pilot outcomes P1–P9, from `planning/decisions-log.md`.]

[PLACEHOLDER: Figures F02–F04, VLAN/trunk/route outputs and the Stage 0 baseline.]

## B5. Policy Stages

**Enforcement points (identical in every stage):**

| Point | Location |
|---|---|
| AP1 | R-EDGE G0/1 inbound |
| AP2–AP5 | R-CORE G0/0.10, .20, .30 and .40 inbound |
| AP6, AP7 | VTY `access-class` on R-CORE and R-EDGE |

**Table 5. What changes between policy stages**

| Factor | Stage 1 — Broad | Stage 2 — Department-level | Stage 3 — Service-level least privilege |
|---|---|---|---|
| Internal ACL | One shared ACL: any internal source → any destination (source-validity check only, cf. [7]) | One ACL per department: own department → whole server subnet and outside; other departments denied | One ACL per department naming host + protocol + port; deny internal *before* the Internet-web permits |
| Edge ACL | Public web to WEB-SRV; `established` return traffic; ICMP replies | Same as Stage 1 | Return traffic limited to source ports 80/443; no ICMP |
| Router management | Any internal source; Telnet + SSH | IT only; Telnet + SSH | IT only; SSH only |

Representative rules (Stage 3, HR):

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

The full ACLs for every stage are in Appendix A.

**Table 6. Planned ACL size per stage** (derived from the design; *measured* values to be taken from `show access-lists`)

| Measure | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|
| Application points | 7 | 7 | 7 |
| ACL definitions (distinct names) | 4 (3) | 7 (6) | 7 (6) |
| Explicit ACL entries | 11 | 26 | 40 |
| Edge-ACL entries | 7 | 7 | 5 |
| Order-dependent entry pairs | 0 | 9 | 24 |

**FTP data channel (pending pilot P7).** The Finance ACL sees only packets sent by Finance hosts.

- **Control connection.** Stage 3 is expected to permit TCP 21 for Finance → FIN-SRV (the required test T04).
- **Active-mode FTP.** The client's replies on the data connection go to server port 20.
- **Passive-mode FTP.** The client opens the data connection to a high server port.
- **Consequence.** Both data-connection patterns would be blocked by the Stage 3 "deny internal" entry if Packet Tracer modelled them as real IOS does.
- **What we have done about it.** No data-port rule has been added in advance. Pilot P7 will show whether one is needed. If it is, the team will choose between one minimal entry and switching the finance service to HTTPS, and record that decision.
- **Forbidden FTP tests.** These (T08, T09, T16) depend only on the control connection being refused, so they are unaffected.

## B6. Test Method

**Test set.** There are 26 test cases:

- 12 required
- 13 forbidden
- 1 same-VLAN control (T18)

They are run in Stage 0 and in every stage, in the same order, from the same PCs, after `clear access-list counters`.

**Method per service:**

| Service | How it is tested |
|---|---|
| HTTP/HTTPS | PC browser |
| DNS | `nslookup` |
| FTP (required test T04) | `ftp` with login, `dir` and `get` |
| SSH/Telnet | Client; *allowed* means the login prompt appears |
| ICMP | `ping`, and only for ICMP requirements |

**Evidence for a denial.** A denial counts only with both:

- the client-side failure, and
- either a rising deny-entry counter or Simulation Mode showing the drop.

**Directions tested:**

- user VLANs → servers, other VLANs, routers and outside
- external → internal
- any source → router management

**Not tested:**

- server-initiated traffic, which is also not filtered
- inter-server traffic

**Table 7. Test cases: planned outcomes and observed results**

Planned outcomes: A = allowed, D = denied, A\* = allowed although forbidden, A† = allowed but not filterable by a router ACL. "(P7)" = depends on pilot step P7. S0 is planned as A for all 26 test cases. **The four Observed columns are blank because Packet Tracer has not been run.**

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
| M1: shadowed rule | Copy of **Stage 2** | Append `deny tcp 192.168.40.0 0.0.0.255 host 192.168.50.40 eq ftp` to ACL-SAL-IN without a sequence number; then fix it by inserting the entry at sequence 5 | Before the fix: T08 still allowed, and the appended deny shows 0 matches (shadowed by the earlier broad permit, cf. [9], [10]). After the fix: T08 denied. | |
| M2: over-restriction | Copy of **Stage 3** | Remove the DNS permit from ACL-HR-IN | nslookup fails; browsing by IP works; browsing by name fails (a required flow is broken) | |
| M3: misordered permit | — | **Deferred**; not part of this submission | — | — |

## B8. Metrics and Comparative Analysis

**Table 9. Metrics: planned values and measured values**

The *Measured* columns are blank until the simulation is run. Measured values must come only from saved configurations and test runs.

| Metric | Definition | Planned S1 / S2 / S3 | Measured S1 | Measured S2 | Measured S3 |
|----------|------------------|--------|-----|-----|-----|
| Explicit ACL entries | Permit/deny lines in `show access-lists` | 11 / 26 / 40 | | | |
| Order-dependent entry pairs | Same ACL, opposite actions, overlapping matches; the terminal deny is excluded | 0 / 9 / 24 | | | |
| Required test cases passed (of 12) | From Table 7 | 12 / 12 / 12 | | | |
| Forbidden test cases permitted (of 13) | From Table 7 | 11 / 5 / 0 | | | |
| Sales exposed services (of 9) / unnecessary | Internal services only; router services counted only on the addresses tested from SAL-PC1; Internet browsing excluded | 9/6, 5/2, 3/0 | | | |
| Zero-match entries | Counter is 0 after the full run (relative to the 26 test cases) | — | | | |
| Configuration lines changed | Diff against the previous stage | — | | | |

[PLACEHOLDER: comparison chart (Figure F19) from the measured columns only.]

[PLACEHOLDER: Discussion of results, to be written after measurement. Assess E1–E4 as supported, partly supported or not supported, using only observed data.]

## B9. Evidence Plan

**Table 10. Screenshot plan.** Every screenshot must come from the team's own `.pkt` files. None has been captured yet.

| Fig. | Content | Stage |
|---|---|---|
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

> This note is provisional. No Packet Tracer results exist yet, so it separates three kinds of statement:
>
> 1. what the literature supports
> 2. what our experiment is *planned* to show
> 3. known design limitations
>
> It must be rewritten once Part B results are available. The final version must be ½–1 page.

**C.1 Literature-supported positions the experiment will test.**

- Default-deny and need-based permits [3].
- Order dependence as the source of anomalies such as shadowing [9]–[11].
- Complexity associated with configuration risk [2].
- Location-based trust being insufficient [4], [8].

**Planned (unverified) comparison.**

**Table 11. Provisional alignment**

| Planned observation (not yet measured) | Literature | Expected relation |
|---|---|---|
| Forbidden test cases permitted fall from 11 to 5 to 0 | Least privilege and default deny [3], [5] | Would agree |
| ACL entries rise from 11 to 26 to 40, and order-dependent pairs from 0 to 9 to 24 | Complexity grows with granularity [2] | Would agree |
| The edge ACL shrinks from 7 to 5 entries while becoming stricter | Rule count is not complexity [2], [9] | Would partly agree; tests whether count misleads |
| M1 deny shows 0 matches (shadowed) | Anomaly taxonomy [9], [10] | Would agree, if counters work in Packet Tracer (pilot P3) |
| Same-VLAN traffic stays allowed in every stage (T18) | Need for microsegmentation [15], [16] | Would agree; it is a limit of router ACLs |

[PLACEHOLDER: replace "would agree" with *agrees*, *differs* or *partly agrees*, with reasons, once measured.]

**C.2 What the simulation cannot capture.**

- **Scale.** 19 devices and a few dozen rules, compared with the large, multi-vendor rule sets studied in [1], [2].
- **People and process.** Administrators, change management and policy drift over time [13].
- **Identity and continuous verification.** Router ACLs decide on addresses and ports only. They cannot use user or device identity, or re-evaluate a session [4], [8], [14]. Our Stage 3 is therefore *not* Zero Trust.
- **State.** The `established` keyword is stateless and accepts any TCP segment with ACK set. Stateful firewalls track sessions instead.
- **Traffic realism.** No real attack traffic, logging or monitoring.
- **Protocol fidelity.** Application behaviour follows Packet Tracer's protocol models. FTP data-connection behaviour is pending pilot P7.

**C.3 Simplifications and what they leave out.**

- **FTP instead of a database.** Packet Tracer has no database service, so finance access is represented by FTP. Database-specific access patterns are therefore not represented.
- **No NAT and no DMZ.** These omissions keep the test cases readable, but they leave out address translation and a separate zone for public services.
- **Static routing and a single core router.** There is no redundancy, and no dynamic routing effect on policy.
- **Server-initiated traffic.** It is neither filtered nor tested, so egress control from the server zone is outside the results.
- **Scope of the exposure metric.** It is limited to Sales, to internal services, and to the tested router addresses.

\newpage

# Individual Contribution Statement

[PLACEHOLDER: complete from `documentation/contribution.md`. Each member lists their functional role, viva section, main contributions, what they reviewed or verified, and signs.]

| Member | Reg. No. | Role(s) | Viva section | Main contributions | Reviewed / verified | Signature |
|---|---|---|---|---|---|---|
| [PLACEHOLDER] | [PLACEHOLDER] | | | | | |
| [PLACEHOLDER] | [PLACEHOLDER] | | | | | |
| [PLACEHOLDER] | [PLACEHOLDER] | | | | | |
| [PLACEHOLDER] | [PLACEHOLDER] | | | | | |
| [PLACEHOLDER] | [PLACEHOLDER] | | | | | |

\newpage

# Appendix A — Configuration Sources

The configuration scripts referenced in Part B are in the project repository. They are **not yet tested** in Packet Tracer.

- `packet-tracer/configs/stage0/`: base configuration for every device
- `packet-tracer/configs/stage1/`: Stage 1 policy
- `packet-tracer/configs/stage2/`: Stage 2 policy
- `packet-tracer/configs/stage3/`: Stage 3 policy
- `packet-tracer/configs/misconfig/`: M1 and M2
- `network-design/acl-design.md`: full rule tables, rule-by-rule traces and metric definitions

[PLACEHOLDER: replace with the saved `show running-config` outputs after the build.]

# Appendix B — Reference Verification Record

**How the references were checked.** On 2026-10-08 the bibliographic details below were checked against web listings from the publisher, IETF, NIST, CISA, USENIX, the authors' own pages, or institutional repositories. Crossref and dblp could not be reached from the drafting environment.

**What the team must still do.** For each reference, the member citing it must open the full text and confirm that the claim attributed to it in Part A is accurate. They then tick "Full text read" and add their name.

| Ref. | What was confirmed online | Claim in this draft that relies on it | Full text read (by whom) |
|---|---|---|---|
| [1] | Authors, title, venue, vol./issue/pages (IEEE Xplore listing) | First quantitative study of corporate rule-set quality | ☐ |
| [2] | Venue and pages (author page); content from the arXiv abstract | Firewalls still poorly configured; complexity correlated with risk items; complexity measure; no improvement in newer versions | ☐ (check that the IEEE version matches the arXiv abstract) |
| [3] | Authors, date, DOI (NIST CSRC) | Default deny; risk-based traffic list; keep the policy updated | ☐ |
| [4] | Authors, date, DOI (NIST) | No implicit trust from location; authentication and authorisation before a session; resource focus | ☐ |
| [5] | Venue, vol./issue, pages 1278–1308 | Least privilege; fail-safe defaults | ☐ |
| [6] | RFC 2979, author, Oct. 2000, Informational | Firewall behaviour under-specified; filter and relay roles | ☐ |
| [7] | RFC 2827 / BCP 38, authors, May 2000, DOI | Ingress filtering of spoofed sources | ☐ |
| [8] | ;login: vol. 39 no. 6, Dec. 2014 (USENIX PDF) | Perimeter model flawed; access by user and device credentials | ☐ |
| [9] | INFOCOM 2004, pp. 2605–2616 (from citing sources) | Anomaly definitions | ☐ (confirm the DOI and the definitions) |
| [10] | JSAC 23(10):2069–2083, DOI (repository and Crossref-deposited reference) | Anomaly classification; Firewall Policy Advisor | ☐ |
| [11] | S&P 2006, pp. 199–213, DOI (institutional repository) | Static analysis with BDDs; real misconfigurations found | ☐ |
| [12] | Computer Networks 51(4):1106–1120 (bibliographic index; author PDF) | Firewall decision diagrams; consistency, completeness, compactness | ☐ |
| [13] | ACM CSUR 50(6) Art. 87, DOI (ACM DL) | Configuration error-prone; usability rarely evaluated | ☐ |
| [14] | IEEE Access 10:57143–57179 (IEEE Xplore) | Microsegmentation as a ZTA building block | ☐ (confirm the author initials and DOI on Xplore) |
| [15] | NIST SP 800-215, Nov. 2022, DOI | Vanished perimeter; lateral movement; microsegmentation, ZTNA and SDP | ☐ |
| [16] | CISA alert, 29 Jul. 2025 | Microsegmentation reduces the attack surface and limits lateral movement | ☐ |
| [17] | ACM TOCS 22(4):381–420, DOI (dblp-derived listing; author page) | Entity-relationship model, compiler, operational prototype | ☐ |
| [18] | RFC 5737, authors, Jan. 2010 | 203.0.113.0/24 reserved for documentation | ☐ |

**Remaining source gaps:**

- **Minimum met.** No gap against the minimum counts (18 total; 10 peer-reviewed; 3 RFCs; 3 NIST).
- **Thin microsegmentation evidence.** The evidence on microsegmentation is mostly government guidance. One additional *peer-reviewed* empirical microsegmentation study would strengthen theme 2.4. [PLACEHOLDER: optional additional source, verified.]
- **Final step for every source.** Every claim must be confirmed against the full text before submission (column 4 above).
