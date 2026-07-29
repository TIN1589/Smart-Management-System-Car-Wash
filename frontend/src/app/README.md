# App Structure

AutoWash Pro is organized around route-level pages and reusable feature components.

- `app/`: application shell concerns such as routes and router primitives.
- `layouts/`: shared page chrome.
- `pages/`: route screens.
- `components/layout/`: header and footer components.
- `components/marketing/`: landing and auth presentation components.
- `components/ui/`: shadcn-compatible base UI components.
- `data/`: static copy and configuration used by pages.

Routes are defined in `routes.ts` and rendered by `router.tsx`. The current router uses the browser History API so the project can run without adding a new dependency; it can be replaced with `react-router-dom` later without changing page/component ownership.

Current routes:

- `/`: public landing page.
- `/login`: client login.
- `/register`: client registration.
- `/otp`: OTP confirmation.
- `/dashboard`: client home dashboard after login.
- `/test`: development route index for quickly opening every screen.
- `/admin`: admin system dashboard.
- `/admin/promotions`: admin promotion management.
- `/admin/configuration`: admin tier, point, and reward configuration.

The dashboard route intentionally does not block unauthenticated users yet. A TODO guard comment is left in `router.tsx`; when auth/session handling is ready, enable that guard to redirect unauthenticated users to `/login`.
