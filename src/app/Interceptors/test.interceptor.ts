// src/app/Interceptors/test.interceptor.ts
// FULL MOCK HTTP INTERCEPTOR — 25+ endpoints, 6 user states
// Active only when environment.useMockData === true
//
// Switch state at runtime (DevTools console):
//   fetch('/api/test/set-state', {method:'POST',
//     headers:{'Content-Type':'application/json'},
//     body: JSON.stringify({state:'APPROVED'})}).then(()=>location.reload())
//
// States: ZERO | WELCOME | PROFILE_COMPLETE | PENDING_REVIEW | APPROVED | REJECTED
// Login:  a@a.a / Aa@12345678  (any credentials also accepted)
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, delay } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  TEST_STATES, TestState, MOCK_USER, MOCK_PASSPORT, makeQR,
} from '../core/mocks/test-users.mock';

const STATE_KEY = 'egy_test_state';
const DEFAULT_STATE: TestState = 'APPROVED';

// SSR-safe state read/write (localStorage exists only in browser)
function getState(): TestState {
  try {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem(STATE_KEY) as TestState) || DEFAULT_STATE;
    }
  } catch {}
  return DEFAULT_STATE;
}
function setState(s: TestState): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STATE_KEY, s);
  } catch {}
}

function ok(body: any, ms = environment.mockDelay ?? 300) {
  return of(new HttpResponse({ status: 200, body })).pipe(delay(ms));
}
function fail(status: number, messageAr: string, messageEn: string, ms = environment.mockDelay ?? 300) {
  return of(new HttpResponse({ status, body: { success: false, messageAr, messageEn } })).pipe(delay(ms));
}
const wrap = (data: any) => ({
  success: true, code: 'OK', message: 'Success',
  messageAr: 'تمت العملية بنجاح', messageEn: 'Operation successful', data,
});

export const testInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockData) return next(req);

  const url = req.url;
  const method = req.method;
  const S = () => TEST_STATES[getState()];

  // ── TEST CONTROL ─────────────────────────────────────────────
  if (url.includes('/api/test/set-state') && method === 'POST') {
    const state = (req.body as any)?.state as TestState;
    if (state && TEST_STATES[state]) {
      setState(state);
      return ok({ success: true, state, message: `State switched to ${state}` }, 50);
    }
    return fail(400, 'حالة غير صحيحة', 'Invalid state', 50);
  }
  if (url.includes('/api/test/get-state')) {
    return ok({ state: getState(), available: Object.keys(TEST_STATES) }, 50);
  }

  // ── AUTH ─────────────────────────────────────────────────────
  if (url.includes('/api/auth/login') && method === 'POST') {
    return ok({
      success: true,
      messageAr: 'تم تسجيل الدخول بنجاح', messageEn: 'Login successful',
      data: {
        userId: MOCK_USER.id,
        accessToken: 'mock-jwt-' + Date.now(),
        refreshToken: 'mock-refresh-' + Date.now(),
        user: MOCK_USER,
      },
    });
  }
  if (url.includes('/api/auth/register') && method === 'POST') {
    setState('ZERO');   // new user starts at ZERO
    return ok({
      success: true, token: 'mock-jwt-token-' + Date.now(),
      user: MOCK_USER,
      messageAr: 'تم التسجيل بنجاح', messageEn: 'Registered successfully',
    });
  }
  if (url.includes('/api/auth/forgot-password') && method === 'POST') {
    return ok({ success: true, messageAr: 'تم إرسال رابط الاستعادة', messageEn: 'Reset link sent' });
  }
  if (url.includes('/api/otp/resend') && method === 'POST') {
    return ok({ success: true, messageAr: 'تم إعادة إرسال الرمز', messageEn: 'OTP resent' });
  }

  // ── PROFILE ──────────────────────────────────────────────────
  if (url.includes('/api/me/profile')) {
    return ok(wrap(MOCK_USER));
  }

  // ── DOCUMENTS (list — shape matches ApiDocumentsResponse) ────
  if (url.includes('/api/me/documents') && method === 'GET') {
    const items = S().documents;
    return ok({
      success: true, code: 'OK', message: 'Success',
      messageAr: 'تم', messageEn: 'Success',
      data: {
        items, pageNumber: 1, pageSize: 10,
        totalCount: items.length, totalPages: 1,
        hasNextPage: false, hasPreviousPage: false,
      },
    });
  }

  // ── APPLICATIONS ─────────────────────────────────────────────
  if (url.includes('/api/applications/draft') && method === 'POST') {
    setState('PROFILE_COMPLETE');
    return ok(wrap({ id: 'a3f8c2e1-7b4d-4f2a-9c1e-8d5b6a3f2e1c', status: 'draft' }));
  }
  if (/\/api\/applications\/[^/]+\/personal-info/.test(url) && method === 'PUT') {
    return ok(wrap({ updated: true }));
  }
  if (/\/api\/applications\/[^/]+\/documents/.test(url) && method === 'POST') {
    return ok(wrap({ uploaded: true }));
  }
  if (/\/api\/applications\/[^/]+\/submit/.test(url) && method === 'POST') {
    setState('PENDING_REVIEW');   // submit → under review
    return ok(wrap({ submitted: true, status: 'submitted' }));
  }
  if (/\/api\/applications\/[^/]+\/status/.test(url) && method === 'GET') {
    const a = S().applications[0];
    if (!a) return fail(404, 'لا يوجد طلب', 'No application found');
    const map: Record<string, { stage: string; progress: number }> = {
      draft: { stage: 'DRAFT', progress: 25 },
      submitted: { stage: 'UNDER_REVIEW', progress: 50 },
      approved: { stage: 'APPROVED', progress: 100 },
      rejected: { stage: 'REJECTED', progress: 75 },
    };
    const m = map[a.status] ?? { stage: 'UNKNOWN', progress: 0 };
    return ok(wrap({
      applicationId: a.id, status: a.status, stage: m.stage, progress: m.progress,
      estimatedCompletion: '2025-05-27', notes: (a as any).rejectionReason ?? '',
    }));
  }
  if (url.includes('/api/applications') && method === 'GET' && !url.includes('/admin/')) {
    return ok(wrap({ data: S().applications, totalCount: S().applications.length }));
  }

  // ── WALLET ───────────────────────────────────────────────────
  if (url.includes('/api/wallet/passport/pdf')) {
    if (getState() !== 'APPROVED') return fail(404, 'الجواز غير جاهز بعد', 'Passport not ready yet');
    const blob = new Blob(['%PDF-1.4 Egy E-Passport Mock PDF'], { type: 'application/pdf' });
    return of(new HttpResponse({ status: 200, body: blob })).pipe(delay(300));
  }
  if (url.includes('/api/wallet/qr/refresh') && method === 'POST') {
    if (getState() !== 'APPROVED') return fail(404, 'QR غير متاح', 'QR not available');
    return ok(makeQR());
  }
  if (url.includes('/api/wallet/qr')) {
    if (getState() !== 'APPROVED') return fail(404, 'QR غير متاح — الطلب لم يُعتمد', 'QR unavailable — not approved');
    return ok(makeQR());
  }
  if (url.includes('/api/wallet/passport')) {
    if (getState() !== 'APPROVED') return fail(404, 'الجواز غير متاح', 'Passport unavailable');
    return ok(MOCK_PASSPORT);
  }
  if (url.includes('/api/wallet')) {
    return ok({ id: 'wallet-001', balance: 0, status: getState() === 'APPROVED' ? 'active' : 'pending', createdAt: '2025-05-20' });
  }

  // ── NOTIFICATIONS ────────────────────────────────────────────
  if (url.includes('/api/notifications')) {
    return ok(wrap({ items: S().notifications, totalCount: S().notifications.length }));
  }

  // ── ADMIN ────────────────────────────────────────────────────
  if (url.includes('/api/admin/auth/login') && method === 'POST') {
    return ok({ success: true, token: 'mock-admin-token', role: 'Admin' });
  }
  if (/\/api\/admin\/applications\/[^/]+\/approve/.test(url) && method === 'PATCH') {
    setState('APPROVED');   // approval flips the whole app state
    return ok(wrap({ approved: true }));
  }
  if (/\/api\/admin\/applications\/[^/]+\/reject/.test(url) && method === 'PATCH') {
    setState('REJECTED');
    return ok(wrap({ rejected: true, ...((req.body as any) ?? {}) }));
  }
  if (/\/api\/admin\/documents\/[^/]+\/verify/.test(url) && method === 'PATCH') {
    return ok(wrap({ verified: true }));
  }
  if (/\/api\/admin\/documents\/[^/]+\/reject/.test(url) && method === 'PATCH') {
    return ok(wrap({ rejected: true, reason: (req.body as any)?.reason ?? '' }));
  }
  if (url.includes('/api/admin/applications') && method === 'GET') {
    return ok(wrap({ data: S().applications, totalCount: S().applications.length, pageNumber: 1, pageSize: 20 }));
  }

  // ── Anything else → pass through to real API ─────────────────
  return next(req);
};
