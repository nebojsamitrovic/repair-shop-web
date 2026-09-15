# CLAUDE.md — repair-shop-web

## Architectural decisions carry a source

Never present an architectural decision as settled on your own authority. Every one either
carries a source you actually opened, or states plainly that it has none.

The reason is not ceremony. Decisions made here get defended in review and forwarded to
people who were not in the conversation. A design argument nobody can check is
indistinguishable from one that was invented, and the reader cannot tell the difference from
the text alone.

**Named patterns and library guidance get a real reference.** Where the answer is a
documented position — server state versus client state, when a query should be invalidated
rather than refetched, why a list needs a stable key, what `useEffect` is and is not for,
which Ant Design component is meant for a job — cite the documentation that says so. React,
TanStack Query, React Router and Ant Design all publish reasoned guidance; use it instead of
paraphrasing it from memory.

**Open the link before citing it.** Fetch the page and quote what it actually says. A URL
recalled from memory is a fabrication risk, and the quote is the part that makes a citation
worth anything. This matters more here than in most codebases: React 19, React Router 7,
Ant Design 6, TanStack Query 5 and Vite 8 are all recent majors, and a remembered answer is
often a correct answer to the previous version. If a source cannot be verified — 403,
paywall, dead link — cite it anyway and label it unverified, with the reason.

**Local decisions usually have no literature, and that is fine.** Component boundaries,
folder layout, what belongs in a hook, how a form is split — these are judgment calls
specific to this codebase. Make them, but say so explicitly and give the reasoning, instead
of implying an authority that does not exist.

**The rule governs how you justify, never whether you decide.** Give the recommendation
first, then show the work. Do not stall waiting for a citation.

**It applies to critique too.** Telling someone their approach is wrong meets the same
standard of evidence you would demand for proposing your own.

**The backend is a source, not a guess.** `src/api/schema.d.ts` is generated from the running
API's OpenAPI document (`npm run api:gen`). Read the generated types, or the backend's
`repairshop-spec.md`, rather than inferring a response shape from how a component happens
to use it. Where the two disagree, the API contract wins and the mismatch is worth reporting.

## Working in this repository

- The sibling `car-dealer-web` is the reference for structure and conventions; this project was
  lifted from it. One folder per feature under `src/features/<name>/{pages,components,hooks,utils}`,
  shared hooks in `src/hooks`, the route registry in `src/routes/config.ts` (every route carries its
  own permission; the sidebar filters itself from the same list).
- Every text is in both `src/lang/resources/en.json` and `sr.json`. A new key goes into both, and
  backend codes are translated through `useEnumLabel`, never prettified inline.
- Permissions in the UI are a convenience (`ProtectedRoute`, `ProtectedComponent`); the backend
  checks the same permission again and is the authority.
- `npm run format && npm run lint && npm run build` before committing.
