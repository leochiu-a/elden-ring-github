---
'elden-ring-github': patch
---

Render the banner on viewport-sized canvases instead of three fixed 4K PNGs, bake the band's drop shadow into the canvas, and coalesce DOM-change detection to once per animation frame, so showing a banner no longer freezes slower machines.
