<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Read `docs/problems.md` before writing code

Same warning, wider scope: several libraries here do **not** behave the way your
training data says. These have already cost real debugging time in this repo —

- **shadcn here is built on Base UI, not Radix** → `render={<X/>}` not `asChild`;
  a `<Button>` rendering a `<Link>` needs `nativeButton={false}` or it throws
- **Next 16 renamed `middleware.ts` → `proxy.ts`** (function `proxy`)
- **Prisma 7 + driver adapter: `P2002` has no `meta.target`** — the field is in
  `meta.driverAdapterError.cause.constraint.fields`; use `isUniqueError()` in `lib/prisma-errors.ts`
- **zod v4** → `standardSchemaResolver`, not `zodResolver`

`docs/problems.md` has the full list with symptoms and fixes. Read it — do not
trust your memory on these. Add to it whenever a new trap costs more than ~10 min.

## Two rules that came from being wrong here

- **curl passing is not proof.** HTTP 200 cannot see React warnings, dead buttons,
  or stale dialog state. Any module with a UI needs a real click-through before it
  is called done.
- **A negative result needs a positive control.** "All 6 calls were rejected" proves
  nothing until an identical request from an allowed role succeeds — otherwise a
  malformed payload looks exactly like working authorization. The same applies to a
  grep returning 0: prove the pattern can match something first.

## Project docs

- `docs/spec.md` — target state
- `docs/roadmap.md` — phase-by-phase plan + history (git history deliberately does not duplicate it)
- `docs/problems.md` — traps and lessons
