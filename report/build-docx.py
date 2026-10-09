#!/usr/bin/env python3
"""Build report/case-study-draft.docx from report/case-study-draft.md.

Steps: make a compact reference.docx from pandoc's default, convert with pandoc,
then post-process the Word XML (repeating table headers, rows kept together,
captions kept with tables, A4 page with margins, page numbers in the footer).

Usage: python3 report/build-docx.py [output.docx]
       python3 report/build-docx.py source.md output.docx
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
if len(sys.argv) > 2:
    SRC, OUT = sys.argv[1], sys.argv[2]
else:
    SRC = os.path.join(HERE, "case-study-draft.md")
    OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "case-study-draft.docx")

PAGE_BREAK = '\n```{=openxml}\n<w:p><w:r><w:br w:type="page"/></w:r></w:p>\n```\n'


def rewrite_zip(path, edits):
    """Rewrite selected members of a zip file; edits maps name -> function(str) -> str."""
    tmp = path + ".tmp"
    with zipfile.ZipFile(path) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        names = zin.namelist()
        for name in names:
            data = zin.read(name)
            if name in edits:
                data = edits.pop(name)(data.decode("utf-8")).encode("utf-8")
            zout.writestr(name, data)
        for name, fn in edits.items():  # new members
            zout.writestr(name, fn("").encode("utf-8"))
    os.replace(tmp, path)


def style_block(styles, style_id):
    m = re.search(r'<w:style [^>]*w:styleId="%s".*?</w:style>' % style_id, styles, re.S)
    return m


def set_style(styles, style_id, ppr=None, rpr=None):
    m = style_block(styles, style_id)
    if not m:
        return styles
    block = m.group(0)
    if ppr is not None:
        block = re.sub(r"<w:pPr>.*?</w:pPr>", "", block, flags=re.S)
        block = block.replace("</w:style>", "<w:pPr>%s</w:pPr></w:style>" % ppr)
    if rpr is not None:
        block = re.sub(r"<w:rPr>.*?</w:rPr>", "", block, flags=re.S)
        block = block.replace("</w:style>", "<w:rPr>%s</w:rPr></w:style>" % rpr)
    return styles[: m.start()] + block + styles[m.end():]


HEAD_FONT = '<w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi"/>'


def edit_styles(s):
    s = re.sub(r'(<w:rPrDefault>.*?<w:sz w:val=")24(".*?<w:szCs w:val=")24(")',
               r"\g<1>22\g<2>22\g<3>", s, flags=re.S)
    s = s.replace('<w:spacing w:after="200" />', '<w:spacing w:after="120" w:line="276" w:lineRule="auto" />')
    s = set_style(s, "BodyText", ppr='<w:spacing w:before="0" w:after="120"/><w:jc w:val="both"/>')
    s = set_style(s, "FirstParagraph", ppr='<w:spacing w:before="0" w:after="120"/><w:jc w:val="both"/>')
    s = set_style(s, "Compact", ppr='<w:spacing w:before="0" w:after="30"/>')
    heads = {"Heading1": (30, 300, 100, "0"), "Heading2": (26, 220, 80, "1"),
             "Heading3": (23, 180, 60, "2"), "Heading4": (21, 140, 40, "3")}
    for sid, (sz, before, after, lvl) in heads.items():
        s = set_style(s, sid,
                      ppr='<w:keepNext/><w:keepLines/><w:spacing w:before="%d" w:after="%d"/><w:outlineLvl w:val="%s"/>'
                      % (before, after, lvl),
                      rpr='%s<w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="%d"/><w:szCs w:val="%d"/>'
                      % (HEAD_FONT, sz, sz))
    s = set_style(s, "Title", ppr='<w:keepNext/><w:keepLines/><w:spacing w:before="600" w:after="120"/><w:jc w:val="center"/>',
                  rpr='%s<w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="36"/><w:szCs w:val="36"/>' % HEAD_FONT)
    s = set_style(s, "Subtitle", ppr='<w:keepNext/><w:keepLines/><w:spacing w:before="0" w:after="360"/><w:jc w:val="center"/>',
                  rpr='%s<w:color w:val="404040"/><w:sz w:val="24"/><w:szCs w:val="24"/>' % HEAD_FONT)
    # Table style: light grid, 9 pt text.
    m = style_block(s, "Table")
    if m:
        block = m.group(0)
        border = '<w:%s w:val="single" w:sz="4" w:space="0" w:color="A6A6A6"/>'
        borders = "<w:tblBorders>%s</w:tblBorders>" % "".join(
            border % side for side in ("top", "left", "bottom", "right", "insideH", "insideV"))
        block = block.replace('<w:tblInd w:w="0" w:type="dxa" />', '<w:tblInd w:w="0" w:type="dxa" />' + borders, 1)
        block = block.replace("<w:tblCellMar>", "<w:tblCellMar>", 1)
        if "<w:rPr>" not in block.split("<w:tblStylePr")[0]:
            block = block.replace("<w:tblPr>", '<w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:tblPr>', 1)
        s = s[: m.start()] + block + s[m.end():]
    # Pandoc default-template quirks: stray "&gt;", spacing after jc, tcBorders after vAlign.
    s = re.sub(r"<w:rPr>.*?</w:rPr>", lambda m: re.sub(r">[^<]*?(&gt;|[^\s<])[^<]*<", "><", m.group(0)), s, flags=re.S)
    s = re.sub(r"(<w:jc [^>]*/>)(\s*)(<w:spacing [^>]*/>)", r"\3\2\1", s)
    s = re.sub(r"(<w:vAlign [^>]*/>)(\s*)(<w:tcBorders>.*?</w:tcBorders>)", r"\3\2\1", s, flags=re.S)
    # Code blocks slightly smaller.
    s = set_style(s, "SourceCode", ppr='<w:wordWrap w:val="off"/><w:spacing w:before="60" w:after="100"/>')
    return s


def cell_text(xml):
    return "".join(re.findall(r"<w:t(?: [^>]*)?>([^<]*)</w:t>", xml))


PPR_ORDER = ["pStyle", "keepNext", "keepLines", "pageBreakBefore", "framePr", "widowControl", "numPr",
             "suppressLineNumbers", "pBdr", "shd", "tabs", "suppressAutoHyphens", "kinsoku", "wordWrap",
             "overflowPunct", "topLinePunct", "autoSpaceDE", "autoSpaceDN", "bidi", "adjustRightInd",
             "snapToGrid", "spacing", "ind", "contextualSpacing", "mirrorIndents", "suppressOverlap", "jc",
             "textDirection", "textAlignment", "textboxTightWrap", "outlineLvl", "divId", "cnfStyle", "rPr",
             "sectPr", "pPrChange"]


def set_ppr(p, tag, xml):
    """Insert or replace a pPr child (by tag name) in paragraph XML, respecting schema order."""
    m = re.search(r"<w:pPr>(.*?)</w:pPr>", p, re.S)
    if not m:
        return re.sub(r"(<w:p(?: [^>]*)?>)", r"\1<w:pPr>%s</w:pPr>" % xml, p, count=1)
    inner = m.group(1)
    inner = re.sub(r"<w:%s\b[^>]*/>|<w:%s\b[^>]*>.*?</w:%s>" % (tag, tag, tag), "", inner, flags=re.S)
    rank = PPR_ORDER.index(tag)
    pos = len(inner)
    for later in PPR_ORDER[rank + 1:]:
        k = inner.find("<w:%s" % later)
        if k != -1 and (k < pos):
            # make sure we matched the tag name exactly
            if re.match(r"<w:%s[\s/>]" % later, inner[k:]):
                pos = k
    inner = inner[:pos] + xml + inner[pos:]
    return p[: m.start(1)] + inner + p[m.end(1):]


def edit_document(d):
    # Tables: header row repeats; no row splits across pages; title-page table without header styling.
    def fix_table(m):
        tbl = m.group(0)
        rows = list(re.finditer(r"<w:tr(?: [^>]*)?>.*?</w:tr>", tbl, re.S))
        out, last = [], 0
        for i, r in enumerate(rows):
            row = r.group(0)
            row = re.sub(r"<w:trPr>.*?</w:trPr>", "", row, flags=re.S)
            props = "<w:cantSplit/>" + ("<w:tblHeader/>" if i == 0 else "")
            row = re.sub(r"(<w:tr(?: [^>]*)?>)", r"\1<w:trPr>%s</w:trPr>" % props, row, count=1)
            out.append(tbl[last: r.start()])
            out.append(row)
            last = r.end()
        out.append(tbl[last:])
        tbl = "".join(out)
        if "What was confirmed online" not in tbl:  # long verification table may split
            rows = list(re.finditer(r"<w:tr(?: [^>]*)?>.*?</w:tr>", tbl, re.S))
            for r in reversed(rows[:-1]):
                row = re.sub(r"<w:p(?: [^>]*)?>(?:(?!<w:p[ >]).)*?</w:p>",
                             lambda pm: set_ppr(pm.group(0), "keepNext", "<w:keepNext/>"), r.group(0), flags=re.S)
                tbl = tbl[: r.start()] + row + tbl[r.end():]
        return tbl

    d = re.sub(r"<w:tbl>.*?</w:tbl>", fix_table, d, flags=re.S)

    # Schema order fixes for pandoc output: table jc after tblW; pStyle first in pPr.
    def fix_tblpr(m):
        t = m.group(0)
        jc = re.search(r"<w:jc [^>]*/>", t)
        if jc:
            t = t.replace(jc.group(0), "")
            t = re.sub(r"(<w:tblW [^>]*/>)", r'\1<w:jc w:val="left"/>', t, count=1)
        return t

    d = re.sub(r"<w:tblPr>.*?</w:tblPr>", fix_tblpr, d, flags=re.S)

    def fix_ppr(m):
        t = m.group(0)
        ps = re.search(r"<w:pStyle [^>]*/>", t)
        if ps and not re.match(r"<w:pPr>\s*<w:pStyle", t):
            t = t.replace(ps.group(0), "", 1).replace("<w:pPr>", "<w:pPr>" + ps.group(0), 1)
        return t

    d = re.sub(r"<w:pPr>.*?</w:pPr>", fix_ppr, d, flags=re.S)

    # Keep "Table N." captions (and any paragraph directly before a table) with the next block.
    def keep_next(p):
        return set_ppr(p, "keepNext", "<w:keepNext/>")

    def fix_para(m):
        p = m.group(0)
        if re.match(r"\s*Table \d+\.", cell_text(p)):
            return keep_next(p)
        return p

    d = re.sub(r"<w:p(?: [^>]*)?>(?:(?!<w:p[ >]).)*?</w:p>(?=\s*<w:tbl>)", lambda m: keep_next(m.group(0)), d, flags=re.S)
    d = re.sub(r"<w:p(?: [^>]*)?>(?:(?!<w:p[ >]).)*?</w:p>", fix_para, d, flags=re.S)

    # Code blocks: keep each block on one page, together with the paragraph that introduces it.
    paras = list(re.finditer(r"<w:p(?: [^>]*)?>(?:(?!<w:p[ >]).)*?</w:p>", d, re.S))
    edits = []
    for prev, cur in zip(paras, paras[1:]):
        if 'w:val="SourceCode"' in cur.group(0):
            edits.append((cur.start(), cur.end(), set_ppr(cur.group(0), "keepLines", "<w:keepLines/>")))
            if 'w:val="SourceCode"' not in prev.group(0):
                edits.append((prev.start(), prev.end(), set_ppr(prev.group(0), "keepNext", "<w:keepNext/>")))
    for st, en, new in sorted(edits, reverse=True):
        d = d[:st] + new + d[en:]

    # Space after tables: first paragraph following a table gets spacing before.
    d = re.sub(r"(</w:tbl>\s*)(<w:p(?: [^>]*)?>(?:(?!<w:p[ >]).)*?</w:p>)",
               lambda m: m.group(1) + set_ppr(m.group(2), "spacing", '<w:spacing w:before="160"/>'), d, flags=re.S)

    # Space after lists: last list item before a non-list paragraph gets spacing after.
    paras = list(re.finditer(r"<w:p(?: [^>]*)?>(?:(?!<w:p[ >]).)*?</w:p>", d, re.S))
    edits = []
    for cur, nxt in zip(paras, paras[1:]):
        if "<w:numPr>" in cur.group(0) and "<w:numPr>" not in nxt.group(0) and "<w:tc>" not in d[cur.start() - 200: cur.start()]:
            edits.append((cur.start(), cur.end(), set_ppr(cur.group(0), "spacing", '<w:spacing w:after="140"/>')))
    for st, en, new in reversed(edits):
        d = d[:st] + new + d[en:]

    # References: left-aligned with hanging indent.
    def fix_ref(m):
        p = m.group(0)
        if re.match(r"\[\d+\] ", cell_text(p)) and "<w:tc>" not in p:
            p = set_ppr(p, "ind", '<w:ind w:left="567" w:hanging="567"/>')
            p = set_ppr(p, "jc", '<w:jc w:val="left"/>')
            p = set_ppr(p, "spacing", '<w:spacing w:after="80"/>')
            p = set_ppr(p, "keepLines", "<w:keepLines/>")
        return p

    d = re.sub(r"<w:p(?: [^>]*)?>(?:(?!<w:p[ >]).)*?</w:p>", fix_ref, d, flags=re.S)

    # Section: A4, ~2 cm margins, footer with page number.
    sect = ('<w:sectPr><w:footerReference w:type="default" r:id="rIdFooterPg"/>'
            '<w:pgSz w:w="11906" w:h="16838"/>'
            '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/>'
            '<w:cols w:space="708"/></w:sectPr>')
    d = re.sub(r"<w:sectPr\b.*?</w:sectPr>|<w:sectPr\b[^>]*/>", "", d, flags=re.S)
    d = d.replace("</w:body>", sect + "</w:body>")
    if 'xmlns:r="' not in d[:2000]:
        d = d.replace("<w:document ", '<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ', 1)
    return d


def fix_settings(s):
    z = re.search(r"<w:zoom [^>]*/>", s)
    if z:
        s = s.replace(z.group(0), "", 1)
        s = re.sub(r"(<w:settings[^>]*>)", r"\1" + z.group(0), s, count=1)
    # rsids belong just before m:mathPr; clrSchemeMapping just after it (or after themeFontLang).
    rs = re.search(r"<w:rsids>.*?</w:rsids>|<w:rsids\s*/>", s, re.S)
    cs = re.search(r"<w:clrSchemeMapping [^>]*/>", s)
    sp = re.search(r"<w:stylePaneFormatFilter [^>]*/>", s)
    if sp and "<w:doNotTrackMoves" in s:
        s = s.replace(sp.group(0), "", 1).replace("<w:doNotTrackMoves", sp.group(0) + "<w:doNotTrackMoves", 1)
    fn = re.search(r"<w:footnotePr>.*?</w:footnotePr>", s, re.S)
    if rs and "<m:mathPr" in s:
        s = s.replace(rs.group(0), "", 1)
        if fn:
            s = s.replace(fn.group(0), "", 1)
        s = s.replace("<m:mathPr", (fn.group(0) if fn else "") + rs.group(0) + "<m:mathPr", 1)
    if cs and "</m:mathPr>" in s:
        s = s.replace(cs.group(0), "", 1)
        anchor = re.search(r"<w:themeFontLang [^>]*/>", s) or re.search(r"</m:mathPr>", s)
        s = s[: anchor.end()] + cs.group(0) + s[anchor.end():]
    return s


def fix_output_styles(s):
    # Code (block and inline) at 8.5 pt so ACL lines do not wrap.
    return set_style(s, "VerbatimChar", rpr='<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="17"/><w:szCs w:val="17"/>')


def fix_numbering(s):
    # nsid must be 8 hex digits.
    return re.sub(r'(<w:nsid w:val=")([0-9A-Fa-f]{1,7})(")', lambda m: m.group(1) + m.group(2).rjust(8, "0") + m.group(3), s)


FOOTER = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
          '<w:p><w:pPr><w:jc w:val="center"/></w:pPr>'
          '<w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>'
          '<w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>'
          '<w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>'
          '<w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>1</w:t></w:r>'
          '<w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>'
          '</w:p></w:ftr>')


def main():
    work = tempfile.mkdtemp()
    try:
        ref = os.path.join(work, "reference.docx")
        subprocess.check_call(["pandoc", "-o", ref, "--print-default-data-file", "reference.docx"])
        rewrite_zip(ref, {"word/styles.xml": edit_styles})

        md = open(SRC, encoding="utf-8").read().replace("\\newpage", PAGE_BREAK)
        tmp_md = os.path.join(work, "build.md")
        open(tmp_md, "w", encoding="utf-8").write(md)
        out_tmp = os.path.join(work, "out.docx")
        subprocess.check_call(["pandoc", tmp_md, "-o", out_tmp, "--reference-doc", ref])

        rewrite_zip(out_tmp, {
            "word/document.xml": edit_document,
            "word/footer1.xml": lambda _: FOOTER,
            "word/_rels/document.xml.rels": lambda s: s.replace(
                "</Relationships>",
                '<Relationship Id="rIdFooterPg" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>'),
            "word/styles.xml": fix_output_styles,
            "word/settings.xml": fix_settings,
            "word/numbering.xml": fix_numbering,
            "[Content_Types].xml": lambda s: s.replace(
                "</Types>",
                '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>'),
        })
        shutil.copy(out_tmp, OUT)
        print("wrote", OUT)
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()
