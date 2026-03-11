# GreatFrontEnd Portfolio

Portfolio app for solving and showcasing:

- [GFE 75](https://www.greatfrontend.com/interviews/gfe75)
- [Blind 75](https://www.greatfrontend.com/interviews/blind75)

The app includes two track tabs, question grids, and detail pages that can render:

- UI demos
- Algorithm visualizers
- Code + tests solutions
- System design and quiz writeups

## Stack

- React + Next.js (App Router) + TypeScript
- Redux (currently used for shared question filter state)
- GraphQL (`/api/graphql`) + `graphql-request`
- Tailwind CSS + MUI
- Jest (unit testing)
- Playwright (integration testing)
- ESLint
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:unit
npm run test:e2e
npm run test:e2e:chromium
npm run build
npm run start
```

`npm run test` runs Jest plus the Playwright Chromium project.

`npm run test:e2e` runs the full Playwright matrix: Chromium, Firefox, and WebKit.

Playwright commands require browsers to be installed once via `npx playwright install`. If you only plan to use `npm run test` or `npm run test:e2e:chromium`, `npx playwright install chromium` is enough.

## Project layout

- `src/app`: routes and API handlers
- `src/content/questions/`: typed question manifests (`gfe75.ts`, `blind75.ts`) and shared types
- `src/features/questions`: grid/detail pages and renderer logic
- `src/solutions`: solution implementations and visualizers
- `tests/e2e`: Playwright tests

## Boilerplate status

- This repo is intentionally seeded with a full challenge backlog.
- Most entries in `src/content/questions/` are `todo` and act as placeholders for iterative implementation.
- A small set of questions are fully implemented as working examples (`done`) to validate app flow and testing setup.

## State management notes

- Redux is intentionally wired globally and currently powers question filters and the Todo demo task list.
- As you implement more challenges, prefer local state first and promote to Redux only when state must be shared across routes/components.
- Redux state persists across in-app route navigation, but resets on full browser refresh unless you add storage hydration.

## Add a new question

1. Add a new question entry to the matching track file in `src/content/questions/` (`gfe75.ts` or `blind75.ts`).
2. Create implementation files under `src/solutions/<track>/<path>` based on `solutionType`.
   - For runnable UI/visualizer solutions, add `renderer.tsx` and register it in `src/solutions/renderer-loaders.ts`.
3. Run `npm run test` and `npm run lint`. Run `npm run test:e2e` as well if you want full cross-browser coverage.

For a fuller challenge-by-challenge workflow, see `CONTRIBUTING.md`.

## Store tests

- Redux slice tests live in `src/lib/store/*.test.ts` and run as part of `npm run test:unit` and `npm run test`.

## Deployment

Deploy to [Vercel](https://vercel.com/) as a standard Next.js app.
