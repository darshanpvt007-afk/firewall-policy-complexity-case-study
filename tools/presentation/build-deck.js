const pptxgen = require("pptxgenjs");
const path = require("path");
const { applyTheme } = require("/root/.claude/skills/synced/0406920f-eb0b-4e9b-83a4-a212484d469c_887cecd6-6e62-4015-ab90-ba71d4435e76/pptx/scripts/apply_theme.js");

const ROOT = "/home/user/firewall-policy-complexity-case-study";
const FIG = (f) => path.join(ROOT, "figures", f);
const OBS = (f) => path.join(ROOT, "figures", "observed", f);
const OUT = path.join(ROOT, "report", "case-study-presentation.pptx");

// Palette: charcoal network + permit green / deny red signal colours, amber highlight
const THEME = {
  name: "Firewall Policy",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1E252E", lt1: "FFFFFF", dk2: "2E3A46", lt2: "EEF1F4",
    accent1: "C0392B", // deny red
    accent2: "1E8E5A", // permit green
    accent3: "E09F3E", // amber highlight
    accent4: "5B6B7A", // slate
    accent5: "3D5A80",
    accent6: "98A6B3",
    hlink: "3D5A80", folHlink: "5B6B7A",
  },
};
const HEX = { deny: "C0392B", permit: "1E8E5A", amber: "E09F3E", slate: "5B6B7A", dark: "1E252E", light: "EEF1F4", grid: "D5DBE1" };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Firewall Policy Complexity: From Simple ACLs to Least Privilege Network Access";
pres.author = "BACSE203 case study team";
const C = pres.SchemeColor;

const W = 13.33, H = 7.5;

pres.defineSlideMaster({
  title: "Title dark",
  background: { color: C.text1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 1.7, w: 11.9, h: 1.9, fontSize: 40, bold: true, color: C.background1, valign: "bottom" }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 3.8, w: 11.9, h: 0.8, fontSize: 18, color: C.accent3 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "Content",
  background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.9, fontSize: 32, bold: true, color: C.text1, valign: "middle" }, text: "" } },
  ],
  slideNumber: { x: 12.4, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6 },
});
pres.defineSlideMaster({
  title: "Section dark",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.5, w: 11.9, h: 0.9, fontSize: 32, bold: true, color: C.background1, valign: "middle" }, text: "" } },
  ],
  slideNumber: { x: 12.4, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6 },
});

// ---------- helpers ----------
let n = 0;
const T = (o) => Object.assign({ isTextBox: true, margin: 0, fontSize: 16, color: C.text1, valign: "top" }, o);
const shadow = () => ({ type: "outer", color: "000000", opacity: 0.12, blur: 6, offset: 2, angle: 90 });
function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill || C.background2 }, line: { color: fill || C.background2 }, shadow: shadow(), objectName: "card" + (++n) });
}
function pill(slide, x, y, label, kind) {
  const col = kind === "deny" ? C.accent1 : kind === "permit" ? C.accent2 : C.accent3;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.15, h: 0.36, rectRadius: 0.18, fill: { color: col }, line: { color: col }, objectName: "pill" + (++n) });
  slide.addText(label, T({ x, y, w: 1.15, h: 0.36, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle" }));
}
function img(slide, file, x, y, w, pw, ph, extra) {
  const h = w * ph / pw;
  slide.addImage(Object.assign({ path: file, x, y, w, h, objectName: "img" + (++n) }, extra || {}));
  return h;
}
function add(master, section) { return pres.addSlide({ masterName: master, sectionTitle: section }); }
const React = require("react"), RDS = require("react-dom/server"), sharp = require("sharp"), FA = require("react-icons/fa");
const ICON = {};
async function prepIcon(name, color) {
  const svg = RDS.renderToStaticMarkup(React.createElement(FA[name], { color: "#" + color, size: 256 }));
  ICON[name + color] = "image/png;base64," + (await sharp(Buffer.from(svg)).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()).toString("base64");
}
// icon in a coloured circle (circleHex) or bare (circleHex null)
function icon(slide, name, x, y, d, circleHex, iconHex) {
  const ic = iconHex || "FFFFFF";
  if (circleHex) slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: circleHex }, line: { color: circleHex }, objectName: "iconbg" + (++n) });
  const pad = circleHex ? d * 0.24 : 0;
  slide.addImage({ data: ICON[name + ic], x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, altText: name, objectName: "icon" + (++n) });
}
const ICON_USES = [["FaShieldAlt","FFFFFF"],["FaSortAmountDown","FFFFFF"],["FaExclamationTriangle","FFFFFF"],["FaUserLock","FFFFFF"],["FaTools","FFFFFF"],
  ["FaNetworkWired","FFFFFF"],["FaClipboardList","FFFFFF"],["FaLayerGroup","FFFFFF"],["FaChartBar","FFFFFF"],["FaBug","FFFFFF"],["FaBalanceScale","FFFFFF"],
  ["FaWrench","FFFFFF"],["FaCamera","FFFFFF"],["FaFingerprint","FFFFFF"],["FaChartLine","FFFFFF"],["FaUserCog","FFFFFF"],
  ["FaCompress","FFFFFF"],["FaEyeSlash","FFFFFF"],["FaIdCard","FFFFFF"],["FaDesktop","FFFFFF"],["FaBan","FFFFFF"],["FaExchangeAlt","FFFFFF"],
  ["FaLockOpen","FFFFFF"],["FaLock","FFFFFF"],["FaChevronRight","98A6B3"],["FaShieldAlt","2E3A46"],["FaProjectDiagram","FFFFFF"],["FaCodeBranch","FFFFFF"],["FaRandom","FFFFFF"]];
(async () => {
for (const [nm, c] of ICON_USES) await prepIcon(nm, c);


// ---------- 1. Title ----------
pres.addSection({ title: "Introduction" });
let s = add("Title dark", "Introduction");
s.addText("Firewall Policy Complexity: From Simple ACLs to Least Privilege Network Access", { placeholder: "title" });
s.addText("BACSE203 Computer Networks · Fall 2026 · Case Study (Topic 17)", { placeholder: "body" });
const team = [["Ramsrivathsan R", "25BCE2111"], ["S Darshan", "25BCE2883"], ["M B Adavan", "25BCE0063"], ["Naveen V S", "25BCE0059"], ["Himaneesh S", "25BAI0007"]];
team.forEach(([nm, reg], i) => {
  const x = 0.7 + i * 2.42;
  s.addText([{ text: nm, options: { bold: true, breakLine: true } }, { text: reg, options: { color: C.accent6, fontSize: 13 } }],
    T({ x, y: 5.4, w: 2.3, h: 0.8, fontSize: 15, color: C.background1 }));
});
icon(s, "FaShieldAlt", 11.35, 0.45, 1.4, null, "2E3A46");
pill(s, 0.7, 6.55, "PERMIT", "permit"); pill(s, 1.98, 6.55, "DENY", "deny");
s.addText("School of Computer Science and Engineering, VIT Vellore", T({ x: 3.4, y: 6.55, w: 8, h: 0.36, fontSize: 13, color: C.accent6, valign: "middle" }));
s.addNotes("Introduce the team and the topic: how firewall/ACL policy changes as we move from simple, broad rules to least-privilege rules, and what that costs in complexity.");


// ---------- Agenda ----------
s = add("Content", "Introduction");
s.addText("Agenda", { placeholder: "title" });
const agenda = [["Part A", "Review paper", "Problem, five literature themes, research gaps"], ["Part B", "Design", "Requirements, network, three policies, test method"], ["Part B", "Results", "Stage-by-stage evidence, metrics, key findings"], ["Part C", "Alignment", "Comparison with the literature, limitations, future work"]];
agenda.forEach(([p, h, d], i) => {
  const y = 1.5 + i * 1.3;
  s.addShape(pres.shapes.OVAL, { x: 0.8, y: y + 0.12, w: 0.8, h: 0.8, fill: { color: C.text2 }, line: { color: C.text2 }, objectName: "ag" + i });
  s.addText(String(i + 1), T({ x: 0.8, y: y + 0.12, w: 0.8, h: 0.8, fontSize: 24, bold: true, color: C.background1, align: "center", valign: "middle", fontFace: "Cambria" }));
  card(s, 1.9, y, 10.8, 1.05);
  s.addText(p, T({ x: 2.2, y, w: 1.4, h: 1.05, fontSize: 14, color: C.accent3, bold: true, valign: "middle" }));
  s.addText(h, T({ x: 3.6, y, w: 2.6, h: 1.05, fontSize: 20, bold: true, valign: "middle" }));
  s.addText(d, T({ x: 6.3, y, w: 6.2, h: 1.05, fontSize: 16, color: C.text2, valign: "middle" }));
});
s.addNotes("Walk through the structure: the assignment has a review paper (Part A), a Packet Tracer case study (Part B) and an alignment note (Part C).");

// ---------- 2. Problem & RQ ----------
s = add("Content", "Introduction");
s.addText("The problem we studied", { placeholder: "title" });
card(s, 0.6, 1.5, 6.0, 4.9);
icon(s, "FaLockOpen", 0.95, 1.85, 0.75, HEX.deny);
s.addText("Broad rules are easy, but open", T({ x: 1.9, y: 1.85, w: 4.5, h: 0.75, fontSize: 20, bold: true, valign: "middle" }));
s.addText("Most small networks let every department reach every server. One router ACL can close those paths.", T({ x: 0.95, y: 2.75, w: 5.4, h: 1.2, fontSize: 17, color: C.text2 }));
icon(s, "FaLock", 0.95, 4.1, 0.75, HEX.permit);
s.addText("Strict rules are safe, but costly", T({ x: 1.9, y: 4.1, w: 4.5, h: 0.75, fontSize: 20, bold: true, valign: "middle" }));
s.addText("Each step towards least privilege adds rules, conditions and rule-order dependence, which the literature links to errors.", T({ x: 0.95, y: 5.0, w: 5.4, h: 1.25, fontSize: 17, color: C.text2 }));
s.addText("Research question", T({ x: 7.1, y: 1.6, w: 5.6, h: 0.4, fontSize: 14, bold: true, color: C.accent3 }));
s.addText("How does refining network access policy from broad, to department-level, to service-level least privilege change (a) the unnecessary flows the policy allows and (b) the policy's size, specificity and dependence on rule order, and how do these results compare with the literature?",
  T({ x: 7.1, y: 2.1, w: 5.6, h: 3.0, fontSize: 19, italic: true, fontFace: "Cambria", color: C.text2 }));
pill(s, 7.1, 5.6, "SECURITY", "permit"); pill(s, 8.4, 5.6, "COST", "deny");
s.addText("measured together, on one network", T({ x: 9.7, y: 5.6, w: 3, h: 0.36, fontSize: 14, color: C.accent4, valign: "middle" }));
s.addNotes("The gap: studies rarely measure the security gained and the management cost on the same policy as it is refined. We do that on a small simulated enterprise.");


// ---------- Objectives ----------
s = add("Content", "Introduction");
s.addText("Objectives", { placeholder: "title" });
const objs = [
  ["Build", "A multi-department network in Packet Tracer; confirm every test flow works with no ACLs"],
  ["Specify", "Write the required and forbidden flows before writing any rule"],
  ["Implement", "Three policy stages at the same seven enforcement points"],
  ["Measure", "Unnecessary access left, and policy size, specificity and rule-order dependence"],
  ["Stress", "Design two typical policy mistakes (shadowed rule, missing DNS rule)"],
  ["Compare", "Relate the results to the literature reviewed in Part A"],
];
objs.forEach(([h, d], i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.6 + col * 6.15, y = 1.5 + row * 1.7;
  card(s, x, y, 5.95, 1.5);
  icon(s, ["FaNetworkWired", "FaClipboardList", "FaLayerGroup", "FaChartBar", "FaBug", "FaBalanceScale"][i], x + 0.25, y + 0.38, 0.72, HEX.amber);
  s.addText(h, T({ x: x + 1.15, y: y + 0.2, w: 4.6, h: 0.45, fontSize: 19, bold: true }));
  s.addText(d, T({ x: x + 1.15, y: y + 0.65, w: 4.6, h: 0.8, fontSize: 15, color: C.text2 }));
});
s.addNotes("Objective 5 (the misconfiguration experiments) was designed but not run in the time available; we say so on the limitations slide.");

// ---------- 3. Literature themes ----------
pres.addSection({ title: "Part A: Literature" });
s = add("Content", "Part A: Literature");
s.addText("What the literature says (Part A)", { placeholder: "title" });
const themes = [
  ["Perimeter filtering", "Default deny at the boundary; inside often trusted", "[3], [6], [7]"],
  ["Policy anomalies", "First-match order causes shadowing and redundancy", "[9]–[12]"],
  ["Growth & misconfiguration", "Real rule sets are often wrong; complexity tracks risk", "[1], [2], [13]"],
  ["Least privilege & Zero Trust", "No trust from location; segment to limit lateral movement", "[4], [5], [14]–[16]"],
  ["Management tools", "Detect or prevent anomalies; usability rarely tested", "[10]–[13], [17]"],
];
themes.forEach(([h, d, r], i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.6 + col * 4.12 + (row === 1 ? 2.06 : 0), y = 1.55 + row * 2.6;
  card(s, x, y, 3.85, 2.3);
  icon(s, ["FaShieldAlt", "FaSortAmountDown", "FaExclamationTriangle", "FaUserLock", "FaTools"][i], x + 0.25, y + 0.22, 0.62, "2E3A46");
  s.addText(h, T({ x: x + 0.95, y: y + 0.27, w: 2.75, h: 0.55, fontSize: 17, bold: true, valign: "middle" }));
  s.addText(d, T({ x: x + 0.25, y: y + 1.0, w: 3.4, h: 0.85, fontSize: 15, color: C.text2 }));
  s.addText(r, T({ x: x + 0.25, y: y + 1.85, w: 3.4, h: 0.3, fontSize: 11, color: C.accent4 }));
});
s.addNotes("Five themes from 18 sources (10 peer-reviewed). They agree misconfiguration is common, rule order hides conflicts and location-based trust is weak. They disagree on whether finer policy lowers net risk once complexity is counted.");

// ---------- 4. Gaps ----------
s = add("Content", "Part A: Literature");
s.addText("Gaps we found, and our response", { placeholder: "title" });
const gaps = [
  "Empirical data on misconfiguration are dated and from few sources",
  "Unnecessary access is rarely measured against written requirements",
  "Security gain and management cost are seldom measured on the same policy",
  "Management tools are seldom evaluated with real users",
];
gaps.forEach((g, i) => {
  const y = 1.55 + i * 1.2;
  card(s, 0.6, y, 7.0, 1.0, i === 2 ? "FBEFD9" : undefined);
  s.addText(String(i + 1), T({ x: 0.85, y, w: 0.5, h: 1.0, fontSize: 26, bold: true, color: i === 2 ? C.accent3 : C.accent4, valign: "middle", fontFace: "Cambria" }));
  s.addText(g, T({ x: 1.45, y, w: 6.0, h: 1.0, fontSize: 17, valign: "middle" }));
});
card(s, 8.1, 1.55, 4.6, 4.6, HEX.dark);
s.addText([
  { text: "Our response to gap 3", options: { bold: true, fontSize: 20, color: C.accent3, breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Write required and forbidden flows first.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Apply three policies of increasing precision to one network.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Measure leakage and policy size at every stage." },
], T({ x: 8.45, y: 1.85, w: 3.9, h: 4.0, fontSize: 17, color: C.background1 }));
s.addNotes("Gap 3 is the one our case study addresses on a small scale.");

// ---------- 5. Topology ----------
pres.addSection({ title: "Part B: Design" });
s = add("Content", "Part B: Design");
s.addText("Network design: 19 devices, 7 enforcement points", { placeholder: "title" });
img(s, FIG("design-topology.png"), 0.6, 1.35, 7.4, 1590, 1179, { altText: "Network topology with enforcement points AP1 to AP7" });
const facts = [["4 departments", "HR, Finance, IT, Sales: VLANs 10–40"], ["4 servers", "Web, DNS, HR records (HTTPS), Finance (FTP)"], ["Simulated Internet", "203.0.113.0/24 (RFC 5737)"], ["7 enforcement points", "Edge ACL, 4 department ACLs, 2 router logins"]];
facts.forEach(([a, b], i) => {
  const y = 1.5 + i * 1.3;
  card(s, 8.4, y, 4.3, 1.1);
  s.addText(a, T({ x: 8.65, y: y + 0.12, w: 3.9, h: 0.4, fontSize: 18, bold: true, color: C.text2 }));
  s.addText(b, T({ x: 8.65, y: y + 0.55, w: 3.9, h: 0.45, fontSize: 13, color: C.accent4 }));
});
s.addNotes("Router-on-a-stick core router holds all internal ACLs; edge router holds the Internet filter. Same seven enforcement points in every stage, only the rules change.");


// ---------- Requirements ----------
s = add("Content", "Part B: Design");
s.addText("Requirements written before any rule", { placeholder: "title" });
const rq = [["R1", "All departments → DNS server (UDP 53)"], ["R2", "All departments → web portal (HTTP/HTTPS)"], ["R3", "HR → HR records server (HTTPS)"], ["R4", "Finance → finance server (FTP)"], ["R5", "IT → both routers (SSH)"], ["R6", "IT → servers (ping)"], ["R7", "All departments → Internet web"], ["R8", "Internet → public web portal"]];
const xq = [["X1", "Department → other department"], ["X2", "Non-HR → HR records server"], ["X3", "Non-Finance → finance server"], ["X4", "Non-IT → router management"], ["X5", "Anyone → routers by Telnet"], ["X6", "Non-IT → servers by ping / unused ports"], ["X7", "Internet → anything except the portal"]];
pill(s, 0.6, 1.45, "REQUIRED", "permit");
pill(s, 6.85, 1.45, "FORBIDDEN", "deny");
const reqRows = (arr, col) => arr.map(([k, v]) => [{ text: k, options: { bold: true, color: col } }, v]);
s.addTable(reqRows(rq, HEX.permit), { x: 0.6, y: 1.95, w: 5.95, colW: [0.7, 5.25], fontSize: 14, fontFace: "Calibri", color: HEX.dark, border: { type: "solid", pt: 0.5, color: HEX.grid }, rowH: 0.52, valign: "middle", margin: [0.04, 0.1, 0.04, 0.1] });
s.addTable(reqRows(xq, HEX.deny), { x: 6.85, y: 1.95, w: 5.85, colW: [0.7, 5.15], fontSize: 14, fontFace: "Calibri", color: HEX.dark, border: { type: "solid", pt: 0.5, color: HEX.grid }, rowH: 0.52, valign: "middle", margin: [0.04, 0.1, 0.04, 0.1] });
s.addText("U1: PC-to-PC traffic inside one VLAN cannot be filtered by a router ACL. \"Unnecessary access\" = any X flow the policy still allows.", T({ x: 6.85, y: 5.85, w: 5.85, h: 0.8, fontSize: 13, italic: true, color: C.accent4 }));
s.addNotes("Every Stage 2 and Stage 3 rule traces back to one of these requirements. FTP stands in for a database because Packet Tracer servers have no database service.");

// ---------- 6. Stages ----------
s = add("Content", "Part B: Design");
s.addText("Three policies of increasing precision", { placeholder: "title" });
const stages = [
  ["Stage 1", "Broad", "Any internal source → any destination; only the Internet edge filtered", "10 rules", HEX.deny],
  ["Stage 2", "Department-level", "Own department → whole server zone and Internet; other departments denied", "25 rules", HEX.amber],
  ["Stage 3", "Least privilege", "Each department → exact host, protocol and port it needs; SSH only for IT", "40 rules", HEX.permit],
];
stages.forEach(([st, nm, d, r, col], i) => {
  const x = 0.6 + i * 4.15;
  card(s, x, 1.5, 3.9, 4.6);
  s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 1.8, w: 0.5, h: 0.5, fill: { color: col }, line: { color: col }, objectName: "dot" + i });
  s.addText(st, T({ x: x + 0.95, y: 1.8, w: 2.7, h: 0.5, fontSize: 15, color: C.accent4, valign: "middle" }));
  s.addText(nm, T({ x: x + 0.3, y: 2.5, w: 3.4, h: 0.6, fontSize: 24, bold: true, fontFace: "Cambria" }));
  s.addText(d, T({ x: x + 0.3, y: 3.25, w: 3.35, h: 1.6, fontSize: 16, color: C.text2 }));
  s.addText(r, T({ x: x + 0.3, y: 5.15, w: 3.4, h: 0.6, fontSize: 28, bold: true, color: col }));
});
s.addText("Stage 0 (no ACLs) is the positive control: every test must work before any rule is applied.", T({ x: 0.6, y: 6.35, w: 12.1, h: 0.45, fontSize: 15, italic: true, color: C.accent4 }));
s.addNotes("Each stage is applied on top of the previous one in the same Packet Tracer network. Rule counts are as configured (one Stage 1 edge line was rejected by Packet Tracer).");


// ---------- ACL example ----------
s = add("Content", "Part B: Design");
s.addText("What a least-privilege ACL looks like", { placeholder: "title" });
card(s, 0.6, 1.45, 7.6, 5.0, HEX.dark);
const aclLines = [
  ["ip access-list extended ACL-HR-IN", null],
  [" permit udp HR host DNS-SRV eq domain", "R1"],
  [" permit tcp HR host WEB-SRV eq www", "R2"],
  [" permit tcp HR host WEB-SRV eq 443", "R2"],
  [" permit tcp HR host HR-SRV eq 443", "R3"],
  [" deny   ip  HR 192.168.0.0/16", "X1–X6"],
  [" permit tcp HR any eq www", "R7"],
  [" permit tcp HR any eq 443", "R7"],
  [" deny   ip  any any", null],
];
s.addText(aclLines.map(([l, r], i) => ({ text: l, options: { breakLine: i < aclLines.length - 1, color: l.includes("deny") ? "F1948A" : (l.startsWith("ip") ? "E09F3E" : "D5F5E3") } })),
  T({ x: 0.9, y: 1.75, w: 5.6, h: 4.4, fontSize: 15, fontFace: "Courier New", paraSpaceAfter: 6 }));
s.addText(aclLines.map(([l, r], i) => ({ text: r || " ", options: { breakLine: i < aclLines.length - 1 } })),
  T({ x: 6.7, y: 1.75, w: 1.3, h: 4.4, fontSize: 15, fontFace: "Courier New", color: C.accent6, paraSpaceAfter: 6 }));
const notesAcl = [["Host + protocol + port", "Each permit names exactly what one requirement needs"], ["Order matters", "The internal deny must stay above the Internet permits, or HR can reach any internal host on 80/443"], ["24 such pairs", "In Stage 3, 24 rule pairs would change behaviour if swapped"]];
notesAcl.forEach(([h, d], i) => {
  const y = 1.45 + i * 1.7;
  card(s, 8.6, y, 4.1, 1.5);
  s.addText(h, T({ x: 8.85, y: y + 0.15, w: 3.7, h: 0.45, fontSize: 17, bold: true, color: C.text2 }));
  s.addText(d, T({ x: 8.85, y: y + 0.62, w: 3.7, h: 0.8, fontSize: 13 }));
});
s.addNotes("Simplified names: HR = 192.168.10.0/24. The full ACLs are in Appendix B of the report.");

// ---------- 7. Method ----------
s = add("Content", "Part B: Design");
s.addText("Test method", { placeholder: "title" });
const steps = [["1", "Write flows", "8 required, 7 forbidden, 1 uncontrollable"], ["2", "Build Stage 0", "All 17 tests must work"], ["3", "Apply stage", "Paste ACLs on both routers"], ["4", "Run same 17 tests", "Same PCs, same order"], ["5", "Record evidence", "Screenshots and ACL counters"]];
steps.forEach(([k, a, b], i) => {
  const x = 0.6 + i * 2.5;
  card(s, x, 1.6, 2.25, 2.6);
  s.addText(k, T({ x: x + 0.25, y: 1.8, w: 1, h: 0.7, fontSize: 36, bold: true, color: C.accent3, fontFace: "Cambria" }));
  s.addText(a, T({ x: x + 0.25, y: 2.6, w: 1.85, h: 0.5, fontSize: 17, bold: true }));
  s.addText(b, T({ x: x + 0.25, y: 3.15, w: 1.85, h: 0.9, fontSize: 14, color: C.text2 }));
  if (i < 4) icon(s, "FaChevronRight", x + 2.29, 2.75, 0.18, null, "98A6B3");
});
card(s, 0.6, 4.6, 12.1, 1.9);
s.addText([
  { text: "Metrics fixed before any result", options: { bold: true, fontSize: 18, breakLine: true } },
  { text: "Leakage = forbidden tests that succeeded ÷ forbidden tests evidenced", options: { bullet: true, breakLine: true } },
  { text: "Required success = required tests that succeeded ÷ required tests evidenced", options: { bullet: true, breakLine: true } },
  { text: "Policy size, rule specificity and order-dependent rule pairs, from the configurations", options: { bullet: true } },
], T({ x: 0.9, y: 4.8, w: 11.5, h: 1.6, fontSize: 15, paraSpaceAfter: 4 }));
s.addNotes("A test with no screenshot is marked not evidenced and left out of every count; we never assume an outcome.");

// ---------- 8. Results chart ----------
pres.addSection({ title: "Part B: Results" });

// ---------- Stage 0 evidence ----------
s = add("Content", "Part B: Results");
s.addText("Stage 0: the network works with no rules", { placeholder: "title" });
img(s, OBS("F04-stage0-sales-ssh-open.png"), 0.6, 1.4, 5.0, 868, 865, { altText: "Stage 0: Sales PC reaches R-CORE by SSH and Telnet" });
card(s, 6.1, 1.4, 6.6, 2.3);
s.addText([
  { text: "Positive control: 17 of 17 reachable", options: { bold: true, fontSize: 20, color: C.accent2, breakLine: true } },
  { text: "Every test, even the forbidden ones, worked with no ACLs. So any later block is caused by the policy, not by a broken cable or a stopped service." },
], T({ x: 6.4, y: 1.6, w: 6.0, h: 2.0, fontSize: 15 }));
card(s, 6.1, 3.95, 6.6, 2.5);
s.addText([
  { text: "Faults found and fixed during the build", options: { bold: true, fontSize: 18, breakLine: true } },
  { text: "R-CORE G0/1 had R-EDGE's address 203.0.113.1, which blocked external traffic", options: { bullet: true, breakLine: true } },
  { text: "DNS-SRV and EXT-WEB first had wrong IP addresses", options: { bullet: true, breakLine: true } },
  { text: "Two tests ran from a different PC than planned (T05, T12)", options: { bullet: true } },
], T({ x: 6.4, y: 4.15, w: 6.0, h: 2.2, fontSize: 14, paraSpaceAfter: 4 }));
s.addNotes("The screenshot shows a Sales PC logging in to the core router by SSH and Telnet: forbidden later, allowed here because no rules exist yet.");

// ---------- Stage 1 evidence ----------
s = add("Content", "Part B: Results");
s.addText("Stage 1 (broad): the inside stays open", { placeholder: "title" });
img(s, OBS("F06-stage1-excess-ping.png"), 0.6, 1.95, 5.8, 798, 621, { altText: "Stage 1: HR pings WEB-SRV and FIN-PC1" });
img(s, OBS("F07-stage1-edge-counters.png"), 7.0, 1.95, 4.9, 877, 783, { altText: "Stage 1: R-EDGE access-list counters" });
pill(s, 0.6, 1.4, "PERMIT", "permit");
s.addText("HR pings a server (T13) and a Finance PC (T07): both forbidden, both work", T({ x: 1.9, y: 1.4, w: 4.6, h: 0.36, fontSize: 13, bold: true, valign: "middle" }));
pill(s, 7.0, 1.4, "COUNTERS", "amber");
s.addText("Edge ACL: return traffic matched 3×, deny matched 8×", T({ x: 8.3, y: 1.4, w: 4.4, h: 0.36, fontSize: 13, bold: true, valign: "middle" }));
s.addNotes("The broad policy only filters the Internet edge. One edge line (time-exceeded) was rejected by Packet Tracer, so Stage 1 has 10 rules instead of the planned 11.");

// ---------- Stage 2 evidence ----------
s = add("Content", "Part B: Results");
s.addText("Stage 2 (department-level): departments separated", { placeholder: "title" });
img(s, OBS("F09-stage2-dept-denied.png"), 0.6, 1.95, 5.6, 863, 778, { altText: "Stage 2: HR to Finance ping blocked" });
img(s, OBS("F08-stage2-acl-counters.png"), 6.8, 1.95, 5.6, 860, 780, { altText: "Stage 2: R-CORE ACLs with counters" });
pill(s, 0.6, 1.4, "DENY", "deny");
s.addText("HR → Finance PC now blocked (T07)", T({ x: 1.9, y: 1.4, w: 4.4, h: 0.36, fontSize: 13, bold: true, valign: "middle" }));
pill(s, 6.8, 1.4, "COUNTERS", "amber");
s.addText("One ACL per department; deny entries count hits", T({ x: 8.1, y: 1.4, w: 4.6, h: 0.36, fontSize: 13, bold: true, valign: "middle" }));
s.addNotes("Stage 2 blocks department-to-department traffic, but each department can still reach the whole server zone, so 4 of 8 forbidden flows still work.");

// ---------- Results matrix ----------
s = add("Content", "Part B: Results");
s.addText("All observed results", { placeholder: "title" });
const M = [
  ["T01", "HR → web portal", "Req", "A", "A", "A", "A"], ["T03", "HR → DNS", "Req", "A", "n/e", "A", "n/e"], ["T04", "Finance → FTP", "Req", "P", "n/e", "n/e", "P"],
  ["T05", "HR → HR records", "Req", "A", "n/e", "n/e", "A"], ["T06", "IT → router SSH", "Req", "A", "n/e", "n/e", "A"], ["T14", "IT → ping server", "Req", "A", "n/e", "A", "n/e"],
  ["T15", "Internet → portal", "Req", "A", "n/e", "A", "n/e"], ["T17", "HR → Internet web", "Req", "A", "A", "A", "n/e"], ["T07", "HR → Finance PC", "Forb", "A", "A", "D", "D"],
  ["T08", "Sales → FTP", "Forb", "A", "n/e", "A", "D"], ["T10", "Sales → HR records", "Forb", "A", "n/e", "A", "D"], ["T11", "Sales → router SSH", "Forb", "A", "n/e", "D", "D"],
  ["T12", "Telnet → router", "Forb", "A", "n/e", "A", "n/e"], ["T13", "HR → ping server", "Forb", "A", "A", "A", "n/e"], ["T16", "Internet → FTP", "Forb", "A", "n/e", "D", "n/e"],
  ["T19", "Sales → router SSH (2)", "Forb", "A", "n/e", "D", "n/e"], ["T18", "Same-VLAN ping", "Ctrl", "A", "n/e", "A", "n/e"],
];
const cellCol = (v, kind) => v === "n/e" ? "F2F4F6" : v === "P" ? "FBEFD9" : (kind === "Forb" && v === "A") || (kind !== "Forb" && v === "D") ? "F6D5D1" : "D8F0E3";
const head = ["Test", "Flow", "Type", "S0", "S1", "S2", "S3"].map(t => ({ text: t, options: { bold: true, fill: { color: HEX.light } } }));
const half = (rowsArr) => [head].concat(rowsArr.map(r => r.map((v, j) => j >= 3 && j <= 6 && r[0] ? { text: v, options: { align: "center", fill: { color: j === 3 ? "FFFFFF" : cellCol(v, r[2]) } } } : v)));
const tOpts = (x) => ({ x, y: 1.4, w: 5.95, colW: [0.65, 2.3, 0.7, 0.575, 0.575, 0.575, 0.575], fontSize: 12, fontFace: "Calibri", color: HEX.dark, border: { type: "solid", pt: 0.5, color: HEX.grid }, rowH: 0.48, valign: "middle", margin: [0.02, 0.06, 0.02, 0.06] });
s.addTable(half(M.slice(0, 9)), tOpts(0.6));
s.addTable(half(M.slice(9)), tOpts(6.75));
s.addText("Green = policy goal met · Red = forbidden flow worked or required flow failed · Amber P = partial (FTP login only) · n/e = no screenshot, excluded from counts · S0 has no rules, so every flow should work",
  T({ x: 6.75, y: 5.85, w: 5.95, h: 0.9, fontSize: 11, italic: true, color: C.accent4 }));
s.addNotes("This is Table 7 of the report in colour. Read across a row to see a flow being closed as the policy is refined, for example T07 and T10.");

s = add("Content", "Part B: Results");
s.addText("Results: access fell as rules grew", { placeholder: "title" });
s.addChart(pres.charts.BAR, [
  { name: "Explicit ACL entries", labels: ["Stage 1", "Stage 2", "Stage 3"], values: [10, 25, 40] },
  { name: "Order-dependent rule pairs", labels: ["Stage 1", "Stage 2", "Stage 3"], values: [0, 9, 24] },
], {
  x: 0.6, y: 1.4, w: 7.0, h: 5.1, barDir: "col", barGrouping: "clustered",
  chartColors: [HEX.dark, HEX.amber], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 13, dataLabelColor: HEX.dark,
  dataLabelFontFace: "+mn-lt", catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt", titleFontFace: "+mj-lt",
  showTitle: true, title: "Policy cost (from configurations)", titleFontSize: 16, titleColor: HEX.dark,
  showLegend: true, legendPos: "b", legendFontSize: 12, legendColor: HEX.slate,
  catAxisLabelColor: HEX.slate, valAxisLabelColor: HEX.slate, catAxisLabelFontSize: 13, valAxisLabelFontSize: 11,
  valGridLine: { color: HEX.grid, size: 0.5 }, catGridLine: { style: "none" }, valAxisMaxVal: 45,
});
const res = [["Stage 1", "2 of 2", "forbidden flows worked", HEX.deny], ["Stage 2", "4 of 8", "forbidden flows worked", HEX.amber], ["Stage 3", "0 of 4", "forbidden flows worked", HEX.permit]];
res.forEach(([st, v, l, col], i) => {
  const y = 1.45 + i * 1.65;
  card(s, 8.1, y, 4.6, 1.45);
  s.addText(st, T({ x: 8.4, y: y + 0.15, w: 1.6, h: 0.4, fontSize: 14, color: C.accent4 }));
  s.addText(v, T({ x: 8.4, y: y + 0.5, w: 1.9, h: 0.8, fontSize: 36, bold: true, color: col, fontFace: "Cambria" }));
  s.addText(l, T({ x: 10.35, y: y + 0.55, w: 2.2, h: 0.7, fontSize: 14, color: C.text2, valign: "middle" }));
});
s.addText("Counts cover only tests with screenshot evidence, so they are not compared as percentages.", T({ x: 8.1, y: 6.45, w: 4.6, h: 0.5, fontSize: 11, italic: true, color: C.accent4 }));
s.addNotes("Security improved stage by stage while the rule count quadrupled and order-dependent pairs went from 0 to 24. Required flows: 2 of 2, 5 of 5, 3 of 4.");

// ---------- 9. Stage 2 vs Stage 3 evidence ----------
s = add("Content", "Part B: Results");
s.addText("Same test, two policies: Sales → HR records (T10)", { placeholder: "title" });
const iw = 5.6;
img(s, OBS("F10-stage2-residual-T10.png"), 0.6, 1.95, iw, 852, 777, { altText: "Stage 2: SAL-PC1 opens HR records page" });
img(s, OBS("F13-stage3-T10-denied.png"), 7.1, 1.95, iw, 853, 752, { altText: "Stage 3: SAL-PC1 gets Request Timeout" });
pill(s, 0.6, 1.4, "PERMIT", "permit");
s.addText("Stage 2: department rule opens the whole server zone", T({ x: 1.9, y: 1.4, w: 4.4, h: 0.36, fontSize: 14, bold: true, valign: "middle" }));
pill(s, 7.1, 1.4, "DENY", "deny");
s.addText("Stage 3: only HR may reach HR-SRV on port 443", T({ x: 8.4, y: 1.4, w: 4.4, h: 0.36, fontSize: 14, bold: true, valign: "middle" }));
s.addNotes("Under the department-level policy any Sales PC could still open the confidential HR site, simply because it is inside the network. Least privilege closes it.");

// ---------- 10. FTP finding ----------
s = add("Content", "Part B: Results");
s.addText("Key finding: least privilege broke a required service", { placeholder: "title" });
img(s, OBS("F12-stage3-T04-ftp.png"), 0.6, 1.4, 6.1, 865, 755, { altText: "Stage 3 FTP: login works, dir fails" });
card(s, 7.2, 1.4, 5.5, 5.3);
s.addText([
  { text: "What happened", options: { bold: true, fontSize: 19, breakLine: true } },
  { text: "Finance could log in to its FTP server, but listing files failed: \"Timed out\" (passive) and \"Ftp peer reset\" (active).", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Why", options: { bold: true, fontSize: 19, breakLine: true } },
  { text: "The Stage 3 rule permits only the FTP control port (21). FTP's separate data connection hits the \"deny internal\" rule.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "So what", options: { bold: true, fontSize: 19, color: C.accent1, breakLine: true } },
  { text: "Least privilege costs more than rules: multi-connection services need extra, carefully ordered entries." },
], T({ x: 7.5, y: 1.65, w: 4.9, h: 4.9, fontSize: 15 }));
s.addNotes("Our design predicted this. It is the clearest example of the usability cost of a strict port-based policy.");

// ---------- 11. Two enforcement points ----------
s = add("Content", "Part B: Results");
s.addText("Other observations", { placeholder: "title" });
const obs = [
  ["Two locks, two symptoms", "In Stage 2, Sales SSH to 192.168.40.1 timed out (interface ACL) while SSH to 192.168.50.1 was refused (router login rule): one goal, enforced in two places."],
  ["Rule count can mislead", "The Stage 3 edge ACL is the strictest but has the fewest entries (6 → 6 → 5)."],
  ["Same-VLAN traffic", "HR-PC1 always reached HR-PC2: traffic inside a VLAN never passes the router, so no router ACL can filter it."],
  ["Build issues fixed", "A duplicate IP on R-CORE and wrong server addresses were found in Stage 0 and corrected before testing."],
];
obs.forEach(([h, d], i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.6 + col * 6.15, y = 1.5 + row * 2.6;
  card(s, x, y, 5.95, 2.35);
  icon(s, ["FaCodeBranch", "FaSortAmountDown", "FaProjectDiagram", "FaWrench"][i], x + 0.3, y + 0.25, 0.6, "2E3A46");
  s.addText(h, T({ x: x + 1.1, y: y + 0.25, w: 4.6, h: 0.6, fontSize: 19, bold: true, color: C.text2, valign: "middle" }));
  s.addText(d, T({ x: x + 0.3, y: y + 1.0, w: 5.35, h: 1.3, fontSize: 16 }));
});
s.addNotes("The timeout versus refusal shows overlapping enforcement points, which makes policies harder to reason about.");

// ---------- 12. Part C alignment ----------
pres.addSection({ title: "Part C and conclusion" });
s = add("Content", "Part C and conclusion");
s.addText("How our results compare with the literature (Part C)", { placeholder: "title" });
const hdr = (t) => ({ text: t, options: { bold: true, color: HEX.dark, fill: { color: HEX.light } } });
const rows = [
  [hdr("Observation"), hdr("Literature"), hdr("Relation")],
  ["Forbidden flows: 2 of 2 → 4 of 8 → 0 of 4", "[3], [5]", "Agrees"],
  ["Rules 10 → 25 → 40; order pairs 0 → 9 → 24", "[2]", "Agrees in direction"],
  ["Strictest edge ACL has fewest entries", "[9], [10]", "Agrees: count misleads"],
  ["Department rules still let Sales reach HR data", "[4], [15]", "Agrees: zone trust too coarse"],
  ["Stage 3 broke FTP file listing", "[13]", "Partly: adds a concrete usability cost"],
  ["Same-VLAN traffic never filtered", "[15], [16]", "Agrees: limit of router ACLs"],
];
s.addTable(rows, { x: 0.6, y: 1.45, w: 12.1, colW: [6.2, 1.9, 4.0], fontSize: 15, fontFace: "Calibri", color: HEX.dark, border: { type: "solid", pt: 0.75, color: HEX.grid }, rowH: 0.62, valign: "middle", margin: [0.06, 0.12, 0.06, 0.12] });
s.addText("We measured reachability and policy structure, not administrator error, so [2] is matched in direction, not proven.", T({ x: 0.6, y: 6.15, w: 12.1, h: 0.5, fontSize: 13, italic: true, color: C.accent4 }));
s.addNotes("Our results support default-deny and need-based access, and show concretely that location-based trust is too coarse.");

// ---------- 13. Limitations ----------
s = add("Content", "Part C and conclusion");
s.addText("Limitations", { placeholder: "title" });
const lim = [
  ["Small scale", "19 devices and 40 rules, versus large real rule sets"],
  ["Evidence gaps", "Screenshots for 17 tests in Stage 0, 4 in Stage 1, 14 in Stage 2, 7 in Stage 3"],
  ["Not Zero Trust", "ACLs see addresses and ports, never user or device identity"],
  ["Simulator models", "FTP stands in for a database; no NAT, logging or attack traffic"],
  ["Not run", "Misconfiguration experiments M1 and M2; zero-hit and line-change metrics"],
  ["Stateless filter", "`established` accepts any TCP segment with ACK or RST set"],
];
lim.forEach(([h, d], i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.6 + col * 4.12, y = 1.5 + row * 2.6;
  card(s, x, y, 3.85, 2.3);
  icon(s, ["FaCompress", "FaEyeSlash", "FaIdCard", "FaDesktop", "FaBan", "FaExchangeAlt"][i], x + 0.3, y + 0.28, 0.58, HEX.deny);
  s.addText(h, T({ x: x + 1.05, y: y + 0.28, w: 2.6, h: 0.58, fontSize: 19, bold: true, color: C.text2, valign: "middle" }));
  s.addText(d.replace(/`/g, ""), T({ x: x + 0.3, y: y + 1.0, w: 3.3, h: 1.2, fontSize: 16 }));
});
s.addNotes("Be upfront: counts describe only the tests with screenshot evidence.");


// ---------- Future work ----------
s = add("Content", "Part C and conclusion");
s.addText("Future work", { placeholder: "title" });
const fut = [
  ["Fix the FTP gap", "Add one minimal, correctly ordered data-channel rule, or move the finance service to HTTPS/SFTP, and re-test"],
  ["Run the mistake experiments", "M1 (shadowed rule) and M2 (missing DNS rule) on copies of Stages 2 and 3"],
  ["Complete the evidence", "Capture every test and ACL counter in every stage; save running configs to measure lines changed"],
  ["Stateful and identity-aware", "Compare with a stateful firewall and with identity-based microsegmentation (Zero Trust)"],
];
fut.forEach(([h, d], i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.6 + col * 6.15, y = 1.5 + row * 2.55;
  card(s, x, y, 5.95, 2.3);
  icon(s, ["FaWrench", "FaBug", "FaCamera", "FaFingerprint"][i], x + 0.3, y + 0.27, 0.6, HEX.amber);
  s.addText(h, T({ x: x + 1.1, y: y + 0.32, w: 4.6, h: 0.5, fontSize: 19, bold: true, valign: "middle" }));
  s.addText(d, T({ x: x + 0.3, y: y + 1.05, w: 5.4, h: 1.15, fontSize: 16, color: C.text2 }));
});
s.addNotes("Each item addresses a limitation from the previous slide.");

// ---------- 14. Conclusion ----------
s = add("Section dark", "Part C and conclusion");
s.addText("Conclusion", { placeholder: "title" });
const concl = [
  ["Security improved", "Forbidden access fell from broad to least privilege; all forbidden flows we captured were blocked in Stage 3", HEX.permit],
  ["Cost rose", "Rules grew 4× and order-dependent pairs from 0 to 24", HEX.amber],
  ["Usability suffered", "Least privilege broke FTP file listing until the policy is extended", HEX.deny],
];
concl.forEach(([h, d, col], i) => {
  const x = 0.7 + i * 4.1;
  icon(s, ["FaShieldAlt", "FaChartLine", "FaUserCog"][i], x, 1.75, 0.85, col);
  s.addText(h, T({ x, y: 2.75, w: 3.8, h: 0.6, fontSize: 24, bold: true, color: C.background1, fontFace: "Cambria" }));
  s.addText(d, T({ x, y: 3.45, w: 3.7, h: 1.6, fontSize: 16, color: C.background2 }));
});
s.addText("Write the required flows first, then refine — the trade-off is real, and it can be measured.", T({ x: 0.7, y: 5.55, w: 11.9, h: 0.6, fontSize: 20, italic: true, color: C.accent3, fontFace: "Cambria" }));
s.addText("Thank you · Questions?", T({ x: 0.7, y: 6.35, w: 11.9, h: 0.5, fontSize: 18, bold: true, color: C.background1 }));
s.addNotes("Summarise the three findings and invite questions.");


// ---------- References ----------
s = add("Content", "Part C and conclusion");
s.addText("Key references", { placeholder: "title" });
const refs = [
  "[1] A. Wool, \"A quantitative study of firewall configuration errors,\" Computer, 37(6), 2004.",
  "[2] A. Wool, \"Trends in firewall configuration errors,\" IEEE Internet Computing, 14(4), 2010.",
  "[3] K. Scarfone, P. Hoffman, \"Guidelines on firewalls and firewall policy,\" NIST SP 800-41r1, 2009.",
  "[4] S. Rose et al., \"Zero trust architecture,\" NIST SP 800-207, 2020.",
  "[5] J. H. Saltzer, M. D. Schroeder, \"The protection of information in computer systems,\" Proc. IEEE, 1975.",
  "[9] E. Al-Shaer, H. Hamed, \"Discovery of policy anomalies in distributed firewalls,\" INFOCOM, 2004.",
  "[10] E. Al-Shaer et al., \"Conflict classification and analysis of distributed firewall policies,\" IEEE JSAC, 2005.",
  "[11] L. Yuan et al., \"FIREMAN: A toolkit for firewall modeling and analysis,\" IEEE S&P, 2006.",
  "[13] A. Voronkov et al., \"Systematic literature review on usability of firewall configuration,\" ACM CSUR, 2017.",
  "[15] R. Chandramouli, \"Guide to a secure enterprise network landscape,\" NIST SP 800-215, 2022.",
];
s.addText(refs.map((r, i) => ({ text: r, options: { breakLine: i < refs.length - 1 } })), T({ x: 0.8, y: 1.5, w: 11.8, h: 4.9, fontSize: 15, paraSpaceAfter: 8, color: C.text2 }));
s.addText("Full list of 18 references in the report (IEEE style).", T({ x: 0.8, y: 6.5, w: 11.8, h: 0.4, fontSize: 12, italic: true, color: C.accent4 }));
s.addNotes("Ten of the eighteen sources; the full list is in the report.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
