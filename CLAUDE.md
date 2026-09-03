# CLAUDE.md

**Read [AGENTS.md](AGENTS.md) before changing anything in this repository.** It
is the operating contract for this site — what it is for, what may never be
claimed on it, the design rules, and the definition of done. This file exists so
that contract is loaded automatically; AGENTS.md remains the source of truth and
nothing here overrides it.

## The four that get broken first

1. **Two typefaces, one colour.** Every value is a token in `src/styles.css`; a
   literal hex in a component is a bug. The one hue is `--ic-signal`, it means
   *something is still lit*, and it is allowed in exactly four places — see
   AGENTS.md §4. A fifth use is how a site acquires a palette by accident.
2. **Claim nothing.** No customers, no metrics, no launch date, no ERP names, no
   outbound supplier contact — see AGENTS.md §5. The site is pre-launch and its
   credibility is the only asset it has.
3. **One story.** The night thread is one request carried from 23:47 to 08:04,
   and its figures reconcile to the cent with the evidence document. Adding a
   second story, or a capability list, is the standing temptation.
4. **Test, then commit.** Not batched, not deferred, not left for the end.

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm test:e2e
```
