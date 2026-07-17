---
'elden-ring-github': patch
---

Restyle the "closed PR" banner to the Elden Ring death-screen look. Its caption
now renders in deep blood-red (`rgb(130, 16, 29)`) with a restrained red echo
instead of the shared victory gold, matching `src/assets/close-pull-request.png`.

Introduces a per-event theme registry (`bannerThemes.ts`): each `BannerType`
maps to a `BannerTheme` (face color, sheen color, sheen opacity), so restyling
an event or adding a new look is a one-line change there — the canvas renderer
(`eldenBanner.ts`) and DOM assembly (`banner.ts`) take colors as arguments and
stay untouched. The smoky dark band remains shared across all events.
