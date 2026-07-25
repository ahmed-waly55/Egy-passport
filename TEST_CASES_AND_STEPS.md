# 🧪 Egy E-Passport — Test Cases & Execution Guide
**QA Lead:** Sarah Belal Younis · **Phase 1:** Manual + Mock APIs · **Phase 2:** Automation (specs ready)

---

# PART A — HOW TO TEST (Setup & Execution Steps)

## A1. Setup (once)
```bash
npm install
npm start          # → http://localhost:4200
```
Or test the deployed site directly: `https://egy-passport.vercel.app`

## A2. Test credentials (Mock Mode — default)
| Field | Value |
|---|---|
| Email | `a@a.a` |
| Password | `Aa@12345678` |
| Note | Any other credentials also work in mock mode |

## A3. Switching user states (the core testing tool)
Open **DevTools Console (F12)** and paste — change the state name as needed:
```js
fetch('/api/test/set-state',{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({state:'APPROVED'})}).then(()=>location.reload());
```
Available states: `ZERO` · `WELCOME` · `PROFILE_COMPLETE` · `PENDING_REVIEW` · `APPROVED` · `REJECTED`

## A4. The natural flow (state moves by itself too)
| Action in UI | State becomes |
|---|---|
| Register a new account | ZERO |
| Click "إنشاء طلب" (Create Request) | PROFILE_COMPLETE |
| Submit application | PENDING_REVIEW |
| Admin PATCH approve (mocked) | APPROVED |
| Admin PATCH reject (mocked) | REJECTED |

## A5. Real API mode (optional)
`src/environments/environment.ts` → `useMockData: false` → app calls `egypassport.runasp.net`.
Admin actions then run from Swagger: `egypassport.runasp.net/swagger`
(`POST /api/admin/auth/login` → Authorize → `PATCH .../documents/{id}/verify` ×4 → `PATCH .../applications/{id}/approve`).

## A6. Execution order (recommended run)
1. **Suite 1 — Registration** (TC-001-xx): fresh browser, /signup
2. **Suite 2 — Login** (TC-002-xx): /login
3. **Suite 3 — Dashboard per state** (TC-003-xx): use A3 to switch states
4. **Suite 4 — Digital ID / Wallet** (TC-004-xx)
5. **Suite 5 — Documents** (TC-005-xx)
6. **Suite 6 — Requests** (TC-006-xx)
7. **Suite 7 — Notifications** (TC-007-xx)
8. **Suite 8 — Admin cycle** (TC-008-xx): console fetch or Swagger
9. Log every result: Pass ✅ / Fail ❌ + screenshot for failures

---

# PART B — TEST CASES (38)

## Suite 1 — Registration (Signup) — /signup

| ID | Title | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-001-01 | National ID validation | Step 1 → enter NID `12345` → blur | Field invalid — must be 14 digits starting 1-9 | High |
| TC-001-02 | Valid NID accepted | Enter `29901011234567` | Field valid ✅ | High |
| TC-001-03 | Egyptian phone validation | Enter `0221234567` | Invalid — must match 010/011/012/015 + 8 digits | High |
| TC-001-04 | Valid phone accepted | Enter `01012345678` | Valid ✅ | High |
| TC-001-05 | Password mismatch blocked | Password `pass123`, confirm `different` | Form error `notSame` — Next disabled | High |
| TC-001-06 | OTP resend BLOCKED during cooldown | Reach Step 4 → click "إعادة إرسال" immediately | Warning toast + countdown shown, **no API call**, timer NOT reset | **Critical** |
| TC-001-07 | OTP resend works after 2 min | Wait 02:00 → click resend | `POST /api/otp/resend` fires · OTP timer resets to 05:00 · new 2-min cooldown starts | **Critical** |
| TC-001-08 | Max 3 resends enforced | Resend 3 times → try 4th | Error toast, button disabled | Medium |
| TC-001-09 | Change phone → Step 1 | On OTP step click "تعديل رقم الهاتف" | Stepper jumps to **Step 1** (not previous step), OTP cleared | **Critical** |
| TC-001-10 | Upload valid file types | Step 3 → upload PNG/JPG/PDF | Preview card appears, Next enabled | High |
| TC-001-11 | Reject invalid file type | Upload `.exe` | File ignored — no card added | High |
| TC-001-12 | Previews persist (localStorage) | Upload image → check DevTools → Application → localStorage | Key `egy_signup_docs` contains preview | Medium |
| TC-001-13 | Remove last file blocks Next | Delete all files | `docUploaded` invalid — Next disabled | Medium |
| TC-001-14 | OTP expired blocks submit | Let timer reach 00:00 | Expired warning shown, Submit disabled | High |
| TC-001-15 | Successful registration → dashboard | Complete all steps, valid OTP → submit | Success toast → redirected to **/dashboard** (ZERO state) | **Critical** |

## Suite 2 — Login — /login

| ID | Title | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-002-01 | Login success → /dashboard | `a@a.a` / `Aa@12345678` → submit | Token + userId stored → redirect **/dashboard** (NOT /documents) | **Critical** |
| TC-002-02 | Invalid credentials | Wrong password (real-API mode) | Error toast with Arabic message, stays on /login | High |
| TC-002-03 | Empty fields blocked | Submit empty form | Warning toast, no API call | High |
| TC-002-04 | Short password invalid | Password `123` | Field invalid (min 6) | Medium |

## Suite 3 — Dashboard per State — /dashboard

| ID | Title | State | Expected Result | Priority |
|---|---|---|---|---|
| TC-003-01 | ZERO dashboard | `ZERO` | Welcome header · "إنشاء طلب" CTA · **NO** passport card · **NO** QR · PDF quick-action disabled | **Critical** |
| TC-003-02 | PROFILE_COMPLETE dashboard | `PROFILE_COMPLETE` | Draft app exists · upload/complete CTAs · no QR | High |
| TC-003-03 | PENDING dashboard | `PENDING_REVIEW` | Status tracker step 2 spinning · **passport card WITHOUT QR** with "قيد المراجعة" label · uploads locked · PDF disabled | **Critical** |
| TC-003-04 | APPROVED dashboard | `APPROVED` | Full passport card · **QR visible with live countdown** · PDF quick-action enabled · tracker steps done | **Critical** |
| TC-003-05 | REJECTED dashboard | `REJECTED` | Rejection reason box · Re-apply button · no QR · tracker shows failed step | **Critical** |
| TC-003-06 | QR auto-refresh | `APPROVED` — wait for timer 00:00 | New QR fetched automatically, timer restarts 03:00, toast shown | High |
| TC-003-07 | Manual QR refresh | Click "تحديث رمز QR" | `POST /api/wallet/qr/refresh` · timer resets · success toast | High |
| TC-003-08 | Sidebar navigation | Click each sidebar item | Correct page loads, active item highlighted | High |

## Suite 4 — Digital ID / Wallet — /wallet

| ID | Title | State | Expected Result | Priority |
|---|---|---|---|---|
| TC-004-01 | Approved wallet full view | `APPROVED` | Passport card (name, number, dates, MRZ) + QR + timer | **Critical** |
| TC-004-02 | Non-approved wallet | `PENDING_REVIEW` | Status message instead of passport, CTA to requests | High |
| TC-004-03 | Info tabs switch | `APPROVED` — click 3 tabs | Passport data / QR details / verification status panels swap | Medium |
| TC-004-04 | PDF download success | `APPROVED` — click PDF | `GET /api/wallet/passport/pdf` → file downloads, success toast | **Critical** |
| TC-004-05 | PDF blocked when not approved | `PENDING_REVIEW` — call PDF | 404 → error toast "قد يكون الجواز غير جاهز" | High |

## Suite 5 — Documents — /documents

| ID | Title | State | Expected Result | Priority |
|---|---|---|---|---|
| TC-005-01 | Upload zone visible (early states) | `ZERO` / `PROFILE_COMPLETE` | Dashed upload zone clickable | High |
| TC-005-02 | Docs under review badges | `PENDING_REVIEW` | 4 docs, each "🔍 قيد المراجعة" badge | High |
| TC-005-03 | Approved badges | `APPROVED` | 4 docs "✅ موثّق" | High |
| TC-005-04 | Rejected doc + re-upload | `REJECTED` | Profile photo "❌ مرفوض" + re-upload button; other 3 approved | **Critical** |

## Suite 6 — Requests (طلباتي) — /applications

| ID | Title | State | Expected Result | Priority |
|---|---|---|---|---|
| TC-006-01 | Empty state | `ZERO` | "لا توجد طلبات" + Create Request button | High |
| TC-006-02 | Request card fields | `PENDING_REVIEW` | UUID shown · type · date · status badge · timeline | High |
| TC-006-03 | UUID format valid | Any state with app | id matches `8-4-4-4-12` hex UUID | Medium |
| TC-006-04 | Rejected shows reason + re-apply | `REJECTED` | Red reason box + "إعادة التقديم" button → restarts flow | **Critical** |
| TC-006-05 | Approved links to wallet | `APPROVED` | Green "الهوية الرقمية" button → /wallet | Medium |

## Suite 7 — Notifications — /notifications

| ID | Title | State | Expected Result | Priority |
|---|---|---|---|---|
| TC-007-01 | Welcome only for new user | `ZERO` | 1 notification: WELCOME 👋, unread badge = 1 | High |
| TC-007-02 | Pending set | `PENDING_REVIEW` | DOC_UNDER_REVIEW + APPLICATION_SUBMITTED + PROFILE_COMPLETED | High |
| TC-007-03 | Approval set | `APPROVED` | PASSPORT_APPROVED 🎉 + QR_GENERATED 🔲 + DOC_APPROVED ✅ | **Critical** |
| TC-007-04 | Rejection notification | `REJECTED` | DOC_REJECTED ❌ with reason text | **Critical** |
| TC-007-05 | Mark all read | Click "تحديد الكل كمقروء" | Unread badges (bell + sidebar) go to 0 | Medium |

## Suite 8 — Admin Cycle (mock console or Swagger)

| ID | Title | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-008-01 | Admin approve flips state | From PENDING: `fetch('/api/admin/applications/x/approve',{method:'PATCH'})` → reload | Whole app becomes **APPROVED** — QR + PDF live | **Critical** |
| TC-008-02 | Admin reject flips state | `PATCH .../reject` with `{reasonAr, reasonEn}` → reload | State **REJECTED**, reason visible in requests + notifications | **Critical** |
| TC-008-03 | Document verify | `PATCH /api/admin/documents/{id}/verify` | 200 success response | Medium |
| TC-008-04 | Document reject | `PATCH .../documents/{id}/reject` `{reason}` | 200 with reason echoed | Medium |

---

# PART C — AUTOMATION (Phase 2 — specs already in the project)

| Spec file | Location | Covers |
|---|---|---|
| `dashboard.component.spec.ts` | `src/app/pages/dashboard/` | TC-003 all 5 states |
| `wallet.component.spec.ts` | `src/app/features/wallet/` | TC-004 (incl. fakeAsync QR timer) |
| `auth.components.spec.ts` | `src/app/features/auth/login/` | TC-001 + TC-002 (incl. tick(121_000) cooldown) |
| `notifications-applications.spec.ts` | `src/app/features/notifications/` | TC-006 + TC-007 |

```bash
npm run test:coverage        # → coverage/index.html (thresholds 70%)
npm run test:all-browsers    # Chrome + Firefox + Edge
```

---

# PART D — Result Log Template

| TC ID | Date | Browser | State | Result | Notes / Screenshot |
|---|---|---|---|---|---|
| TC-001-06 | | Chrome | — | ☐ Pass ☐ Fail | |
| TC-003-04 | | Chrome | APPROVED | ☐ Pass ☐ Fail | |
| … | | | | | |
