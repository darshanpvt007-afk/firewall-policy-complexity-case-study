#!/usr/bin/env python3
"""Draw the planned topology (design drawing, not a Packet Tracer screenshot).

Output: figures/design-topology.png. Data come from network-design/addressing-plan.md.
"""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "figures", "design-topology.png")
plt.rcParams["font.family"] = "Liberation Sans"

fig, ax = plt.subplots(figsize=(10, 7.4))
ax.set_xlim(0, 100)
ax.set_ylim(0, 74)
ax.axis("off")


def box(x, y, w, h, text, size=9, fc="#ffffff"):
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle="round,pad=0.3,rounding_size=1",
                                fc=fc, ec="#000000", lw=1.1, zorder=2))
    ax.text(x, y, text, ha="center", va="center", fontsize=size, zorder=3)


def line(x1, y1, x2, y2, label=None, lx=0, ly=0):
    ax.plot([x1, x2], [y1, y2], "-", color="#000000", lw=1.0, zorder=1)
    if label:
        ax.text((x1 + x2) / 2 + lx, (y1 + y2) / 2 + ly, label, fontsize=9, ha="center", va="center",
                bbox=dict(fc="white", ec="none", pad=0.5), zorder=3)


def ap(x, y, text):
    ax.text(x, y, text, fontsize=9.5, fontweight="bold", color="#a00000", ha="center", va="center",
            bbox=dict(fc="#fff2f2", ec="#a00000", lw=0.8, boxstyle="round,pad=0.25"), zorder=4)


# External zone
ax.add_patch(FancyBboxPatch((62, 55.5), 37, 17, boxstyle="round,pad=0.3", fc="#f4f4f4", ec="#888888", ls="--"))
ax.text(80.5, 71, "External 203.0.113.0/24", fontsize=9, ha="center", style="italic")
box(80.5, 66.5, 11, 3.4, "SW-EXT", size=10)
box(70.5, 59.5, 14, 5, "EXT-WEB\n203.0.113.10")
box(91, 59.5, 14, 5, "EXT-HOST\n203.0.113.50")
line(80.5, 64.8, 70.5, 62)
line(80.5, 64.8, 91, 62)

# Routers
box(40, 64, 22, 7, "R-EDGE (ISR 2911)\nG0/1 203.0.113.1\nG0/0 10.0.0.2", size=10)
line(51, 65.5, 75, 66.5, "G0/1", lx=-4)
box(40, 43, 22, 7, "R-CORE (ISR 2911)\nrouter-on-a-stick\nG0/2 10.0.0.1", size=10)
line(40, 60.5, 40, 46.5, "transit 10.0.0.0/30")
ap(57, 55.5, "AP1  edge ACL, G0/1 in")
ap(14, 64, "AP7  VTY access-class")
ap(14, 43, "AP6  VTY access-class")

# Access side
box(25, 27, 18, 3.6, "SW-ACCESS (2960)", size=10)
line(35, 39.5, 25, 28.8, "G0/0 trunk", lx=-1)
ap(12, 33.5, "AP2–AP5  ACL in on\nG0/0.10 .20 .30 .40")
depts = [("HR  VLAN 10\n192.168.10.0/24\nHR-PC1 .11\nHR-PC2 .12", 6.5),
         ("FIN  VLAN 20\n192.168.20.0/24\nFIN-PC1 .11\nFIN-PC2 .12", 19),
         ("IT  VLAN 30\n192.168.30.0/24\nIT-PC1 .11\nIT-PC2 .12", 31),
         ("SALES  VLAN 40\n192.168.40.0/24\nSAL-PC1 .11\nSAL-PC2 .12", 43)]
for t, x in depts:
    box(x, 9, 10.6, 11, t, size=7.8)
    line(25, 25.2, x, 14.5)

# Server side
box(75, 27, 18, 3.6, "SW-SERVER (2960)", size=10)
line(45, 39.5, 75, 28.8, "G0/1.50  VLAN 50\n192.168.50.0/24", lx=4, ly=1)
srv = [("WEB-SRV\n.10\nHTTP, HTTPS", 57.5), ("DNS-SRV\n.20\nDNS", 69.5),
       ("HR-SRV\n.30\nHTTPS", 81.5), ("FIN-SRV\n.40\nFTP", 93.5)]
for t, x in srv:
    box(x, 9.5, 10.6, 8.5, t, size=8.6)
    line(75, 25.2, x, 13.8)

fig.savefig(OUT, dpi=200, bbox_inches="tight", facecolor="white")
print("wrote", os.path.relpath(OUT, ROOT))
