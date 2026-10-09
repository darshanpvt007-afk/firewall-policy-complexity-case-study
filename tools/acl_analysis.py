#!/usr/bin/env python3
"""Static analysis of the project's ACL configuration scripts.

Replays packet-tracer/configs/stage0..3 (and optionally the misconfiguration
scripts) per router, then reports, for each policy stage:

  * enforcement points (interface/direction bindings and VTY access-class)
  * explicit ACE counts (per ACL definition and per enforcement point)
  * edge-ACL entry count
  * specificity of each entry (rubric in network-design/metrics-spec.md)
  * order-dependent entry pairs, shadowed entries and redundant entries

Everything here is DERIVED FROM THE CONFIGURATION TEXT. It is not a Packet
Tracer observation. Running configurations saved from Packet Tracer can be
analysed with --running: each stage is then read from its own complete
configs/stageN/<ROUTER>.running.txt (no replay across stages).

Usage:
  python3 tools/acl_analysis.py                 # summary of stages 1-3
  python3 tools/acl_analysis.py --detail        # list every order-dependent pair
  python3 tools/acl_analysis.py --m1            # M1: Stage 2 + appended deny
  python3 tools/acl_analysis.py --running       # same, from saved running configs
  python3 tools/acl_analysis.py --diff A B      # configuration lines changed
"""
import argparse
import difflib
import ipaddress
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, "packet-tracer", "configs")
ROUTERS = ("R-EDGE", "R-CORE")
PORTS = {"www": 80, "http": 80, "domain": 53, "ftp": 21, "ftp-data": 20, "telnet": 23, "22": 22, "ssh": 22}
TERMINAL_DENY = ("deny", "ip", (0, 2**32 - 1), (0, 2**32 - 1))


# ----------------------------------------------------------------------------- parsing
def addr_range(tokens):
    """Consume an address spec; return ((lo, hi), remaining tokens)."""
    t = tokens[0]
    if t == "any":
        return (0, 2**32 - 1), tokens[1:]
    if t == "host":
        a = int(ipaddress.IPv4Address(tokens[1]))
        return (a, a), tokens[2:]
    a = int(ipaddress.IPv4Address(t))
    w = int(ipaddress.IPv4Address(tokens[1]))
    return (a & ~w & 0xFFFFFFFF, a | w), tokens[2:]


def port_spec(tokens):
    if tokens and tokens[0] == "eq":
        p = tokens[1]
        return int(PORTS.get(p, p)), tokens[2:]
    return None, tokens


class Ace:
    def __init__(self, seq, text, standard=False):
        self.seq, self.text = seq, text.strip()
        tk = self.text.split()
        self.action = tk[0]
        if standard:
            self.proto = "ip"
            self.src, _ = addr_range(tk[1:]) if len(tk) > 2 or tk[1] == "any" else ((int(ipaddress.IPv4Address(tk[1])),) * 2, [])
            self.dst, self.sport, self.dport, self.est, self.icmp = (0, 2**32 - 1), None, None, False, None
            return
        self.proto = tk[1]
        rest = tk[2:]
        self.src, rest = addr_range(rest)
        self.sport, rest = port_spec(rest) if self.proto in ("tcp", "udp") else (None, rest)
        self.dst, rest = addr_range(rest)
        self.dport, rest = port_spec(rest) if self.proto in ("tcp", "udp") else (None, rest)
        self.est = "established" in rest
        self.icmp = rest[0] if self.proto == "icmp" and rest else None

    # --- packet-space relations
    def overlaps(self, o):
        if not (self.proto == "ip" or o.proto == "ip" or self.proto == o.proto):
            return False
        if self.src[1] < o.src[0] or o.src[1] < self.src[0]:
            return False
        if self.dst[1] < o.dst[0] or o.dst[1] < self.dst[0]:
            return False
        for a, b in ((self.dport, o.dport), (self.sport, o.sport)):
            if a is not None and b is not None and a != b:
                return False
        if self.icmp and o.icmp and self.icmp != o.icmp:
            return False
        return True

    def covers(self, o):
        """True if every packet matched by o is matched by self."""
        if not (self.proto == "ip" or self.proto == o.proto):
            return False
        if not (self.src[0] <= o.src[0] and o.src[1] <= self.src[1]):
            return False
        if not (self.dst[0] <= o.dst[0] and o.dst[1] <= self.dst[1]):
            return False
        for a, b in ((self.dport, o.dport), (self.sport, o.sport)):
            if a is not None and a != b:
                return False
        if self.est and not o.est:
            return False
        if self.icmp and self.icmp != o.icmp:
            return False
        return True

    def is_terminal_deny(self):
        return (self.action, self.proto, self.src, self.dst) == TERMINAL_DENY and self.dport is None

    def specificity(self):
        """Rubric (metrics-spec.md §4): one point each for a constrained source,
        destination, protocol and service (port or ICMP type)."""
        full = (0, 2**32 - 1)
        return (int(self.src != full) + int(self.dst != full) + int(self.proto != "ip")
                + int(self.dport is not None or self.sport is not None or self.icmp is not None))


class Router:
    def __init__(self, name):
        self.name = name
        self.acls = {}      # name -> {"type": std|ext, "aces": [Ace]}
        self.bind = {}      # interface -> acl name (inbound)
        self.vty_acl = None
        self.vty_transport = None

    def apply(self, path):
        ctx, cur = None, None
        for raw in open(path, encoding="utf-8"):
            line = raw.split("!")[0].rstrip() if not raw.lstrip().startswith(("permit", "deny")) else raw.split("!")[0].rstrip()
            s = line.strip()
            if not s:
                continue
            m = re.match(r"no ip access-list (standard|extended) (\S+)", s)
            if m:
                self.acls.pop(m.group(2), None)
                continue
            m = re.match(r"ip access-list (standard|extended) (\S+)", s)
            if m:
                ctx, cur = "acl", m.group(2)
                self.acls.setdefault(cur, {"type": m.group(1)[:3], "aces": []})
                continue
            m = re.match(r"interface (\S+)", s)
            if m:
                ctx, cur = "if", m.group(1)
                continue
            if s.startswith("line vty"):
                ctx, cur = "vty", None
                continue
            if s in ("exit", "end") or (s.startswith("line ") or not raw[:1].isspace()) and ctx and not s.startswith(("permit", "deny", "remark", "no ")) and not re.match(r"\d+ ", s):
                ctx, cur = None, None
                continue
            if ctx == "acl":
                acl = self.acls[cur]
                m = re.match(r"no (\d+)$", s)
                if m:
                    acl["aces"] = [a for a in acl["aces"] if a.seq != int(m.group(1))]
                    continue
                if s.startswith("remark"):
                    continue
                m = re.match(r"(\d+) ((?:permit|deny) .*)", s)
                if m:
                    seq, body = int(m.group(1)), m.group(2)
                elif s.startswith(("permit", "deny")):
                    seq, body = (max([a.seq for a in acl["aces"]], default=0) // 10 + 1) * 10, s
                else:
                    continue
                acl["aces"].append(Ace(seq, body, standard=acl["type"] == "sta"))
                acl["aces"].sort(key=lambda a: a.seq)
            elif ctx == "if":
                m = re.match(r"(no )?ip access-group (\S+) in", s)
                if m:
                    if m.group(1):
                        self.bind.pop(cur, None)
                    else:
                        self.bind[cur] = m.group(2)
            elif ctx == "vty":
                m = re.match(r"(no )?access-class (\S+) in", s)
                if m:
                    self.vty_acl = None if m.group(1) else m.group(2)
                m = re.match(r"transport input (.*)", s)
                if m:
                    self.vty_transport = m.group(1)


def build_stages(include_m1=False):
    routers = {r: Router(r) for r in ROUTERS}
    stages = {}
    for st in range(4):
        for r in ROUTERS:
            p = os.path.join(CFG, "stage%d" % st, r + ".txt")
            if os.path.exists(p):
                routers[r].apply(p)
        stages[st] = snapshot(routers)
        if include_m1 and st == 2:
            m1 = snapshot(routers)
            # M1-a only (append the deny); M1-c is a separate state.
            apply_lines(m1["R-CORE"], ["ip access-list extended ACL-SAL-IN",
                                       " deny tcp 192.168.40.0 0.0.0.255 host 192.168.50.40 eq ftp", "end"])
            stages["M1-a"] = m1
            m1c = snapshot(m1)
            apply_lines(m1c["R-CORE"], ["ip access-list extended ACL-SAL-IN", " no 50",
                                        " 5 deny tcp 192.168.40.0 0.0.0.255 host 192.168.50.40 eq ftp", "end"])
            stages["M1-c"] = m1c
    return stages


def build_running(cfg_dir=CFG):
    """Each saved running config is complete, so every stage starts from scratch."""
    stages = {}
    for st in range(1, 4):
        routers = {r: Router(r) for r in ROUTERS}
        found = False
        for r in ROUTERS:
            p = os.path.join(cfg_dir, "stage%d" % st, r + ".running.txt")
            if os.path.exists(p):
                routers[r].apply(p)
                found = True
            else:
                print("missing (not analysed): %s" % os.path.relpath(p, ROOT))
        if found:
            stages[st] = routers
    return stages


def snapshot(routers):
    import copy
    return copy.deepcopy(routers)


def apply_lines(router, lines):
    import tempfile
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        f.write("\n".join(lines) + "\n")
    router.apply(f.name)
    os.unlink(f.name)


# ----------------------------------------------------------------------------- metrics
def enforcement_points(rs):
    eps = []
    for r in ROUTERS:
        for intf, acl in sorted(rs[r].bind.items()):
            eps.append((r, intf + " in", acl))
        if rs[r].vty_acl:
            eps.append((r, "vty access-class in", rs[r].vty_acl))
    return eps


def analyse_acl(aces):
    pairs, shadowed, redundant = [], [], []
    body = [a for a in aces]
    for j, b in enumerate(body):
        if b.is_terminal_deny() and j == len(body) - 1:
            continue
        for i in range(j):
            a = body[i]
            if a.is_terminal_deny() and i == len(body) - 1:
                continue
            if a.action != b.action and a.overlaps(b):
                pairs.append((a, b))
        if any(body[i].action != b.action and body[i].covers(b) for i in range(j)):
            shadowed.append(b)
        elif any(body[i].action == b.action and body[i].covers(b) for i in range(j)):
            redundant.append(b)
    return pairs, shadowed, redundant


def report(stages, detail=False, source="DERIVED FROM CONFIGURATION SCRIPTS - not Packet Tracer observations"):
    keys = [k for k in stages if k != 0]
    rows = []
    for k in keys:
        rs = stages[k]
        eps = enforcement_points(rs)
        defs = [(r, n, a) for r in ROUTERS for n, a in rs[r].acls.items()]
        ace_defs = sum(len(a["aces"]) for _, _, a in defs)
        ace_eps = sum(len(rs[r].acls[n]["aces"]) for r, _, n in eps)
        edge = len(rs["R-EDGE"].acls.get("ACL-EDGE-IN", {"aces": []})["aces"])
        pairs = shadowed = redundant = 0
        spec = []
        detail_lines = []
        for r, n, a in defs:
            p, s, rd = analyse_acl(a["aces"])
            pairs += len(p); shadowed += len(s); redundant += len(rd)
            spec += [x.specificity() for x in a["aces"] if x.action == "permit"]
            for x, y in p:
                detail_lines.append("    %s %s: %d %s  <->  %d %s" % (r, n, x.seq, x.text, y.seq, y.text))
            for y in s:
                detail_lines.append("    %s %s: SHADOWED %d %s" % (r, n, y.seq, y.text))
            for y in rd:
                detail_lines.append("    %s %s: REDUNDANT %d %s" % (r, n, y.seq, y.text))
        dist = {v: spec.count(v) for v in range(5)}
        rows.append((k, len(eps), len(defs), len({n for _, n, _ in defs}), ace_defs, ace_eps, edge,
                     pairs, shadowed, redundant, dist,
                     rs["R-CORE"].vty_transport, rs["R-EDGE"].vty_transport, eps, detail_lines))
    print(source + "\n")
    print("%-6s %4s %9s %9s %10s %9s %5s %6s %6s %6s  %s" % (
        "Stage", "EPs", "ACL defs", "(names)", "ACEs/defs", "ACEs/EPs", "Edge", "OrdDep", "Shadow", "Redund",
        "permit specificity 0/1/2/3/4"))
    for r in rows:
        print("%-6s %4d %9d %9d %10d %9d %5d %6d %6d %6d  %s" % (
            r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9],
            "/".join(str(r[10][v]) for v in range(5))))
    print()
    for r in rows:
        print("Stage %s: VTY transport R-CORE=%s R-EDGE=%s" % (r[0], r[11], r[12]))
        for ep in r[13]:
            print("   EP %-7s %-26s %s" % ep)
        if detail:
            print("\n".join(r[14]))
        print()


def norm_running(path):
    skip = re.compile(r"^(Building configuration|Current configuration|!|\s*$|end$|version |service timestamps)")
    return [l.rstrip() for l in open(path, encoding="utf-8") if not skip.match(l)]


def diff_count(a, b):
    la, lb = norm_running(a), norm_running(b)
    added = removed = 0
    for l in difflib.unified_diff(la, lb, lineterm="", n=0):
        if l.startswith("+") and not l.startswith("+++"):
            added += 1
        elif l.startswith("-") and not l.startswith("---"):
            removed += 1
    print("%s -> %s: +%d -%d (total %d)" % (a, b, added, removed, added + removed))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--detail", action="store_true")
    ap.add_argument("--m1", action="store_true")
    ap.add_argument("--diff", nargs=2)
    ap.add_argument("--running", action="store_true",
                    help="analyse configs/stageN/<ROUTER>.running.txt saved from Packet Tracer")
    a = ap.parse_args()
    if a.diff:
        diff_count(*a.diff)
        return
    if a.running:
        stages = build_running()
        if not stages:
            print("No saved running configurations found; nothing measured.")
            return
        report(stages, detail=a.detail,
               source="DERIVED FROM SAVED RUNNING CONFIGURATIONS - configuration measures only, not test outcomes")
        return
    report(build_stages(include_m1=a.m1), detail=a.detail or a.m1)


if __name__ == "__main__":
    main()
