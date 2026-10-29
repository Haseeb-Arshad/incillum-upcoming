# What the site describes that is not built yet

The site at incillum.com describes Incillum in the present tense, on the owner's
decision of 22 October 2026: the product is being built, and the page says what
it does. This file is where the difference is kept. Every capability the site
states that the platform (`E:\projects\altherail`, GitHub
`Haseeb-Arshad/incillum`) does not do yet is listed here, with where it stands
and what would make the sentence true.

Read it before a sales conversation, a design-partner call or a security
review: a buyer will ask about exactly these.

Status as of 22 October 2026, from the platform's `docs/STATE.md` (Stage Seven,
local implementation complete; **hosted unverified, provider unqualified,
customer pilot blocked**) and the trust review in
`altherail/docs/incillum-review/11-SECURITY-AND-TRUST-GATES.md`.

---

## Charlie — reaching outside

| The site says | Where it stands | To make it true |
| --- | --- | --- |
| Charlie asks your approved suppliers for a firm price and lead time | Not built. Charlie's tools write only to an internal record (`continuum/internal/app/charlie_tools.go`, destination `internal_record`). A bounded Gmail *reply to a supplier* exists in code behind an approval, tested against a protocol double only; no real provider call has been made. | Qualify the mail provider (OAuth app review, sandbox), add an outbound "request for quotation" action through the Tool Gateway with its approval, and an approved-supplier list. |
| Charlie calls a supplier and books the meeting | Not built. No telephony or calendar code exists. | Choose a voice provider and a calendar connector; both are new Tool Gateway actions behind approval. |
| Charlie posts in Slack, Teams or email, answers when mentioned and takes an instruction in plain words (the Charlie page's channel, and the telephone, supplier and team cards under it: every outward step waits for an approval) | Not built. Studio Settings lists Slack, Teams and email digests as "not yet" (`apps/studio/src/features/settings/notification-channels.tsx`). Briefs C10–C14 (Slack) need the founder's Slack app. | Create the Slack app (C10), then the mention bot and channel posts (C11–C13); Teams after. |
| Charlie sends the quotation to the customer once a person approves | Not built as an outbound send. Quotation drafts render as PDF (C15–C17), and approvals exist; there is no qualified customer-facing send. | The same provider qualification as above, with the customer send as its own approved action. |
| The Charlie film sends the approved quotation to Halvorsen Marine and shows the night's record | Not built in Studio. Studio's approval says "nothing is sent to the customer"; the film's send screen and its record of the night are composed in the film (`video/charlie/index.html`), not Studio pages. | The customer send above, and an activity record of a piece of work in Studio. |
| The Meet Charlie film (`public/charlie/meet-charlie.mp4`, not yet on a page) shows Charlie reading the business system's account record, and drafting an email to the customer, to a supplier and to a manufacturer and a Google Meet invitation, each sent once a person approves it | Not built in Studio. The record, the four drafts and their approvals are composed in the film (`video/charlie-launch`), not Studio pages. No business-system (ERP) connector, outbound mail or calendar exists; Google Meet is named in words only, with no logo. | A read-only business-system connector, the outbound mail actions and a calendar connector, each a Tool Gateway action behind its approval, as above. |
| The front page's film (`public/film/incillum.mp4`) shows Charlie picking a request up from the inbox the moment it lands, reading a slide deck and a shared Google Sheet among its sources, asking suppliers for a firm price once a person approves, and a reply carrying the quotation, its workbook and its letter, ready to send | Partly built. The matrix, the finding, the supplier comparison and the approval are Studio's own pages, captured from its sample workspace; the request card, the wall of sources, the workbook and letter cards and the reply are composed in the film (`video/product-film/index.html`). Nothing reads a mailbox by itself yet, slide decks are kept and not read, and there is no Google Sheets connector; the supplier request and the customer send are as in the rows above. | A mailbox reader on the qualified mail provider, slide-deck and Google Sheets reading, and the outbound actions above, each behind its approval. |
| Charlie compares the supplier quotations for coverage, quantity and cost | Built locally: Studio's supplier intelligence review (sample workspace). Not on a hosted environment, and not read from live supplier mail. | Hosted environment, and supplier mail read through the qualified provider. |
| Charlie reads mail, PDFs, drawings and price lists into lines | Partly built. Uploads, OCR (local RapidOCR), Word and the review engine read requests into lines locally; customer uploads are blocked by default until reader isolation is qualified. | Qualify reader isolation and lift the upload block for a pilot. |
| Charlie cites the page every figure came from | Built locally for the Review: citations carry source, page and span (P1 Evidence Matrix). Not yet carried through to the quotation draft (the "Review → draft" bridge, Gates 1–3). | Build the source-bound quotation draft bridge. |
| Charlie makes the quotation, a workbook or a chart from a PDF or spreadsheet | Built locally (Studio Charlie panel, PR #53; document engine C15–C19). Not on a hosted environment. | Hosted environment (P7 / C04). |

## The quotation itself

The front-page showcase and trust drawing (29 October 2026) are composed
scenes of RFQ 8841, not captured Studio screens or a generated UI image, and
every count and figure in them comes from that example's documents, matrix,
evidence document and channel. They show four things the platform does not do
yet, each already listed above: Charlie picking a request up from the mailbox
the moment it lands (no mailbox reader yet); repricing a line when a supplier's
answer arrives (not built end to end); and a supplier request, a team update
and a call marked sent once a person approves (no outbound provider is
qualified). The approval they show, and the rule that nothing leaves without
one, are true of the platform today. Neither adds a provider capability or a
claim of hosted readiness.

**Marks and portraits on the page (29 October 2026).** Two things in those
drawings are not Incillum's own, and a buyer, an investor or a lawyer may ask
about either.

- **Gmail's mark** is drawn on every email in the scenes (the customer's
  request, the supplier's answer, the quotation and supplier request going
  out), at the owner's request. It is Google's trademark, shown as the identity
  of an email, never named on the page. It must not be read as "works with
  Gmail": no mailbox reader exists (see the film row above), and the platform
  reads uploaded files, not an inbox. Before the site is public, check
  Google's brand terms for showing the mark in a product illustration, and
  keep the page from saying or implying an integration. Removing it is one
  component (`GmailMark` in `src/components/file-icon.tsx`).
- **The people** in the scenes (James, Sara, the customer's buyer, the
  supplier's contact) are invented, and their portraits are illustrated line
  drawings, not photographs: CC0 portraits from the Lorelei set by Lisa
  Wischofsky, via DiceBear, chosen option by option (`design/people.md`). They
  carry no licence obligation, but they are not real people and must never be
  given a company, a quotation or a testimonial. Replacing one with a photograph
  means a person who has agreed to it, in a role that is true.

| The site says | Where it stands | To make it true |
| --- | --- | --- |
| Incillum reads the six sources onto one sheet | Partly built: request, catalogue and price list are read; the framework agreement's floor and a supplier confirmation are entered or read per case, not joined automatically across all six. | The source-bound bridge and the change ledger (06-CHANGE-LEDGER-SPEC). |
| A supplier answer arrives and the quotation is recalculated on the spot | Not built end to end. Deterministic margin arithmetic exists; a supplier update invalidating an exact approval is specified (G5) but not built. | Build CA-01 and the change ledger. |
| Lines that cannot be settled are held for a person | Built locally in the Review (held lines, required-spec status). | — |
| Margin is checked against the floor on every line | Built locally (commercial decision context, integer-minor economics). | — |

## Data and trust

| The site says | Where it stands | To make it true |
| --- | --- | --- |
| Not used for training | Decided. It is a policy; provider terms still have to be checked per model provider. | Record the selected provider's terms and settings. |
| Nothing leaves without a person | True of the platform today: no outbound action runs without an approval (Tool Gateway authority). | Keep it true as outward actions are added. |
| Kept to your organisation | Built in code and tested locally: 111 tenant tables with forced row-level security, restricted-role SQL tests. Not verified on a hosted environment. | Hosted isolation proof (G1) before customer data. |
| A record of every decision | Built: review revisions and the Continuum journal refuse update and delete for the application role. A database administrator can still alter data; it is not cryptographically tamper-proof. | Privileged-access auditing if a buyer asks. |
| Every figure cited | Built for the Review; see "Charlie cites the page" above. | — |
| Credentials sealed | Built: AES-256-GCM with the organisation bound as associated data (`control-plane/internal/secrets`). Keys live in the process environment, not a managed KMS. | Managed key custody on the hosted environment. |

## Not on the site any more, and still not true

The site no longer names these. If a buyer asks:

- **Certifications** — SOC 2, ISO/IEC 27001, 42001, 27701: none held, no audit
  started. GDPR and CCPA obligations not assessed.
- **Encryption at rest and in transit on a hosted environment** — no hosted
  environment exists yet (C04 waits on the founder's cloud account).
- **SAML single sign-on, IP allow-listing** — not built.
- **Independent penetration test** — not done.
- **Customers, usage figures, accuracy or savings** — none. The site must still
  never state any.

---

When something here is built, move it out of this file in the same commit that
makes it true, and say so in the commit message.
