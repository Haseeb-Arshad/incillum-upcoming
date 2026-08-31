# CLAUDE.md

**Read [AGENTS.md](AGENTS.md) before changing anything in this repository.** It
is the operating contract for this site — what it is for, what may never be
claimed on it, the design rules, and the definition of done. This file exists so
that contract is loaded automatically; AGENTS.md remains the source of truth and
nothing here overrides it.

## The three that get broken first

1. **No colour, two typefaces.** Every value is a token in `src/styles.css`. A
   literal hex in a component is a bug.
2. **Claim nothing.** No customers, no metrics, no launch date — see AGENTS.md
   §5. The site is pre-launch and its credibility is the only asset it has.
3. **Test, then commit.** Not batched, not deferred, not left for the end.

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm test:e2e
```
