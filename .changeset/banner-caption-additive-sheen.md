---
'elden-ring-github': patch
---

Restore the layered-gold look of the reference banner artwork. The caption is a
deep matte gold face with the image-creator's warm ghost (blurTint [255,208,66]
@ 0.18) stacked on top and blended additively via `mix-blend-mode: plus-lighter`
(falling back to `screen`). Where the ghost aligns over the face it adds to it —
the bright overlap tone (~255,213,57) — and where it spreads past the letters it
becomes the dim offset echo, so overlapping text shows a real blended colour
instead of flat gold. The ghost is a separate layer so its outward-spread
(scaleX -> 1.11) can animate after the fade-in.
