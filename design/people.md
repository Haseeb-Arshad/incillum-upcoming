# The people in the example: their portraits

Written 29 October 2026. The front page's scenes (the showcase, the trust
board and the morning) draw four people from the example quotation, RFQ 8841.
They are invented, like the customer. This file records where their portraits
come from and exactly how each was chosen, so they can be remade or replaced.

## Who they are

| Key | Name | Role | In the scenes |
| --- | --- | --- | --- |
| `director` | James | Sales director | Approves the supplier request; decides the morning's call |
| `sales` | Sara | Inside sales | Named in Charlie's 08:04 message |
| `buyer` | Marta Keller | Purchasing, at the customer | Sends the request; receives the quotation |
| `supplier` | Tomas Berg | Supplier | Sends the cost confirmation; receives the supplier request |

They live in `people` in `src/content/site.ts`, and are drawn by
`src/components/avatar.tsx`. None is a customer, a user or a member of this
company, and nothing about them is a claim.

## What the portraits are

Illustrated line drawings in black and white, on the sunken paper: the
**Lorelei** avatar style by **Lisa Wischofsky**, released under **CC0 1.0**
(public domain dedication; no attribution is required, and it is given here
anyway). They are in `public/people/` as plain SVG, 4 to 6 kB each, with the
licence metadata stripped and nothing active in them (no script, no handler,
no link). They were fetched as static files from DiceBear's public API, which
is not a dependency of the site: nothing about them is generated at runtime.

Why drawings and not photographs: a stranger's photograph under a job title
reads as a customer, which the site must never imply, and is not ours to use.
Generated photographs would spend credits on an image account and have the same
problem. The drawings are the site's own ink, legible at 36 px, and distinct
from one another by hair, glasses and beard.

## The choices

Base URL: `https://api.dicebear.com/9.x/lorelei/svg?seed=incillum&frecklesProbability=0&hairAccessoriesProbability=0`

| File | Options added to the base URL |
| --- | --- |
| `james.svg` | `hair=variant03&eyes=variant04&eyebrows=variant04&mouth=happy03&glassesProbability=0&beardProbability=100&beard=variant01&earringsProbability=0` |
| `sara.svg` | `hair=variant13&eyes=variant06&eyebrows=variant07&mouth=happy02&glassesProbability=0&beardProbability=0&earringsProbability=100&earrings=variant01` |
| `marta.svg` | `hair=variant24&eyes=variant10&eyebrows=variant11&mouth=happy03&glassesProbability=100&glasses=variant01&beardProbability=0&earringsProbability=0` |
| `tomas.svg` | `hair=variant01&eyes=variant16&eyebrows=variant06&mouth=happy03&glassesProbability=0&beardProbability=0&earringsProbability=0` |

Mouths `happy02` to `happy04` are the calm smiles; the style's others include
teeth, a tongue and a wink, which are wrong for a sales director. Eyes avoid
the winking variants (`01`, `15`, `18`, `19`, `22`). The style's default
colours are black hair and white skin, which is why the set is monochrome
without any change.

## Replacing one with a photograph

Change the `portrait` path of that person in `people`. `Avatar` shows whatever
image it is given, in the same square, with the same hairline. It should be a
photograph of a real person who has agreed to it, in a role that is true:
see `requirements/README.md`.
