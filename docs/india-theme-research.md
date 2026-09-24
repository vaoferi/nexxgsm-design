# India market theme

## Design decision

The India subdomain keeps the canonical English landing and shared conversion
flow. Fresh visitors see English; an explicit client-side Hindi toggle can
swap the visible copy and guide content without changing the URL or canonical.
Its regional distinction is an abstract atmosphere rather than a literal
flag, emblem, or religious motif:

- deep indigo/navy is the structural field;
- saffron is a moving light source and the market accent;
- dark green is a low-contrast depth layer;
- a restrained warm particle field adds texture without competing with the
  8FC8 hero figures or readable glass panels.

The shared product cards, copy, layout, hero figures, and CTA colors remain
unchanged so the experiment measures the background and atmosphere, not a
different product experience.

## Evidence used

The Government of India describes the national palette as deep saffron, white,
dark green, and a navy-blue Ashoka Chakra. This implementation uses those
colors as abstract visual cues only and does not reproduce the flag or Chakra.

- [National Portal of India — Indian Tricolor](https://knowindia.india.gov.in/my-india-my-pride/indian-tricolor.php)
- [Flag Code of India, Part I](https://knowindia.india.gov.in/assets/doc/flagcodeofindia_070214.pdf)

## Implementation boundary

`window.location.hostname` sets `html[data-market]` before the stylesheet is
parsed. The canonical market host is `in.biosunlocktool.com`; an earlier `india`
label is only a compatibility marker in client-side market detection, not the
public production route.
Unknown hosts, the apex, `www`, and the NAS staging host remain `us`.
The India theme is CSS-only after that marker and respects
`prefers-reduced-motion`.

Production implementation note: the Hindi toggle currently lives in the
Cloudflare copy at `biosunlocktool/assets/js/india-language.js`; the canonical
workspace still needs an explicit sync decision before the next release.
