# Contributing

This repository is organized for solving one challenge at a time while keeping the app runnable.

## Recommended workflow

1. Pick the next challenge from `src/content/questions/` (`gfe75.ts` or `blind75.ts`).
2. Implement solution files under `src/solutions/<track>/<path>`.
   - For runnable UI/visualizer solutions, add `renderer.tsx` in that folder (default export).
   - Register the renderer with one line in `src/solutions/renderer-loaders.ts`.
3. Update the matching manifest entry in the relevant file in `src/content/questions/`:
   - replace `TODO` fields (`sourceUrl`, `summary`, `approach`, `complexity`)
   - set `status` to `in-progress` or `done` as work advances
4. Verify locally before commit:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run test` runs Jest plus the Playwright Chromium project.

5. If you want full browser coverage locally, install Playwright browsers once:

```bash
npx playwright install
npm run test:e2e
```

If you only need the default `npm run test` flow, `npx playwright install chromium` is enough.

Store-level Redux tests are colocated under `src/lib/store/*.test.ts` and run via `npm run test:unit`.

## Notes on state management

- Redux is currently used for cross-component question filters and Todo demo tasks.
- Prefer local component state by default; lift to Redux only when state is shared across routes or distant components.
- Current Redux behavior persists during in-app navigation but does not survive full refresh yet.
