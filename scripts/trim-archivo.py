"""
Limits the Archivo variable font's axes to the ranges the site actually uses.

02-design-system.md section 3 needs wght 200 to 800 and wdth 75 to 100. The file
Google serves carries wght 100 to 900 and wdth 62 to 125. Limiting the axes keeps
both continuous, so every value the scale asks for still renders, and drops about
18 percent of the file. Run after scripts/fetch-fonts.mjs.

    python3 scripts/trim-archivo.py
"""

import os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

PATH = "public/fonts/archivo-variable.woff2"

font = TTFont(PATH)
axes = {a.axisTag: (a.minValue, a.maxValue) for a in font["fvar"].axes}

if axes.get("wght") == (200.0, 800.0) and axes.get("wdth") == (75.0, 100.0):
    print("archivo already trimmed")
    raise SystemExit

before = os.path.getsize(PATH)

instantiateVariableFont(
    font, {"wght": (200, 400, 800), "wdth": (75, 100, 100)}, inplace=True
)
font.flavor = "woff2"
font.save(PATH)

after = os.path.getsize(PATH)
print(f"archivo trimmed {before / 1024:.1f} KB -> {after / 1024:.1f} KB")
