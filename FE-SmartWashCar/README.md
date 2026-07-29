# AutoWash Pro Frontend

AutoWash Pro is a customer-facing web app for car wash booking, loyalty points, promotions, and the client dashboard experience.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn-compatible UI components
- lucide-react icons

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run preview
```

## Routes

Routes are defined in `src/app/routes.ts` and rendered by `src/app/router.tsx`.

| Path | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/login` | Customer login |
| `/register` | Customer registration |
| `/otp` | OTP confirmation |
| `/dashboard` | Customer home dashboard after login |
| `/admin` | Admin system dashboard |
| `/admin/promotions` | Admin promotion management |
| `/admin/configuration` | Admin tier and reward configuration |
| `/test` | Development route index for opening all screens quickly |

`/dashboard` is intentionally not protected yet. A TODO auth guard is left in `src/app/router.tsx`; enable it when backend/session auth is ready.

## Project Structure

```text
src/
  app/                  Route definitions, router, app-level notes
  assets/               Local images used by pages
  components/
    dashboard/          Client dashboard sections
    layout/             Shared headers and footer
    marketing/          Landing/auth marketing components
    ui/                 shadcn-compatible base UI components
  data/                 Static page data and menu/promotion config
  layouts/              Shared page layout wrappers
  lib/                  Shared utilities
  pages/                Route-level pages
```

## UI Notes

- Design tokens live in `src/App.css`.
- Use Tailwind utility classes for layout and page styling.
- Reusable primitives should go in `src/components/ui`.
- Route-level screens should stay in `src/pages`.
- Static copy, menu items, and promotion data should stay in `src/data` so components remain easy to reuse.

## Development Notes

- Use `/test` during development to jump between screens without typing URLs.
- The current router uses the browser History API to avoid adding a router dependency before package installation is available. It can be replaced later with `react-router-dom` without changing page ownership.
- Local dashboard promotion images were created from the provided design screenshot and are stored in `src/assets`.
