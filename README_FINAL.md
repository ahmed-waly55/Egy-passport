# Egy E-Passport — Final Merged Project

Base: latest `ahmed-waly55/Egy-passport` (commit a0ab634) + missing features restored
+ mock test system + clean code + SSR removed.

## Added on top of the latest team repo
- `pages/dashboard` — full dashboard (status tracker, passport card per state, QR live timer, quick actions) + route `/dashboard`
- `features/wallet` — digital ID (passport card, MRZ, QR countdown, PDF, tabs) + route `/wallet`
- `features/applications` — requests page (UUID, timeline, re-apply) + route `/applications`
- `Interceptors/test.interceptor.ts` + `core/mocks/test-users.mock.ts` — 6 test states, 25+ mocked endpoints, `POST /api/test/set-state`
- Auth: login → `/dashboard` (real API shape `data.accessToken`), signup OTP resend + 2-min cooldown + change-phone → step 1
- Sidebar keys fixed (`wallet`, `applications`) to match routes
- SSR + prerender removed (timeout issue eliminated) · hydration removed
- Production font-inlining disabled → build never depends on external fetch (Vercel/CI safe)
- Zero `console.log` in src · dead commented code removed
- Tests: 4 spec files + karma.conf.js (Phase 2) · `TEST_CASES_AND_STEPS.md` (38 cases)

## Run
```bash
npm install
npm start        # http://localhost:4200 → /login
```
Login (mock mode): `a@a.a` / `Aa@12345678` — any credentials work.
Switch states (console): `fetch('/api/test/set-state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:'APPROVED'})}).then(()=>location.reload())`
States: ZERO · WELCOME · PROFILE_COMPLETE · PENDING_REVIEW · APPROVED · REJECTED

Real API: `src/environments/environment.ts` → `useMockData: false`.

## Verified
- `ng build --configuration development` → 0 errors
- `ng build` (production) → 0 errors
