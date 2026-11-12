"""Subset Material Symbols Rounded to the icons the prototype uses.

Usage: pip install fonttools brotli && python3 scripts/subset-icons.py
Add a name to ICONS, run, and commit src/fonts/material-symbols-rounded-subset.woff2.
"""
from fontTools import subset
from fontTools.ttLib import TTFont

ICONS = """
chevron_left chevron_right mail home auto_awesome credit_card check group
apartment search tune grid_view favorite keyboard_arrow_down person close
add remove bed inventory_2 calendar_month location_on near_me
refresh shopping_cart hourglass_empty check_circle error info arrow_upward lightbulb
photo_camera receipt_long local_shipping
weekend chair shelves table_bar photo_library square_foot thumb_up more_horiz
""".split()

SRC = "../../node_modules/material-symbols/material-symbols-rounded.woff2"
OUT = "src/fonts/material-symbols-rounded-subset.woff2"

font = TTFont(SRC)
by_char = {chr(code): glyph for code, glyph in font.getBestCmap().items()}

ligatures = {}
for lookup in font["GSUB"].table.LookupList.Lookup:
    for table in lookup.SubTable:
        if table.LookupType == 7:
            table = table.ExtSubTable
        if getattr(table, "LookupType", None) != 4:
            continue
        for first, rules in table.ligatures.items():
            for rule in rules:
                ligatures[tuple([first] + rule.Component)] = rule.LigGlyph

keep = {by_char[c] for c in "abcdefghijklmnopqrstuvwxyz_0123456789" if c in by_char}
for name in ICONS:
    glyph = ligatures.get(tuple(by_char[c] for c in name))
    if not glyph:
        raise SystemExit(f"Unknown icon: {name}")
    keep.add(glyph)

options = subset.Options()
options.layout_closure = False
options.layout_features = ["*"]
options.flavor = "woff2"
subsetter = subset.Subsetter(options)
subsetter.populate(glyphs=sorted(keep))
subsetter.subset(font)
font.flavor = "woff2"
font.save(OUT)
print(f"Wrote {OUT} with {len(ICONS)} icons")
