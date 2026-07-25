// src/app/core/mocks/test-users.mock.ts
// 6 Test User States — drives test.interceptor.ts
// Switch at runtime: POST /api/test/set-state  { "state": "APPROVED" }

export type TestState =
  | 'ZERO'              // Just registered — nothing yet
  | 'WELCOME'           // Welcome notification only
  | 'PROFILE_COMPLETE'  // Profile done — ready to create request / upload
  | 'PENDING_REVIEW'    // Submitted — docs under review, passport card NO QR
  | 'APPROVED'          // Passport issued — QR + PDF + details (DEFAULT)
  | 'REJECTED';         // Rejected with reason — re-apply

export const TEST_CREDENTIALS = { email: 'a@a.a', password: 'Aa@12345678' };

const APP_ID = 'a3f8c2e1-7b4d-4f2a-9c1e-8d5b6a3f2e1c';
const APP_ID_REJ = 'b7e2d4c9-1a3f-4e8b-a2d5-9c8e7f6b5a4d';
const NOW = () => new Date().toISOString();
const QR_PNG =
  'data:image/svg+xml;base64,' + btoa(
  `<svg viewBox="0 0 29 29" xmlns="http://www.w3.org/2000/svg"><rect width="29" height="29" fill="#fff"/><g fill="#0D1B2A"><rect width="7" height="7"/><rect x="1" y="1" width="5" height="5" fill="#fff"/><rect x="2" y="2" width="3" height="3"/><rect x="22" width="7" height="7"/><rect x="23" y="1" width="5" height="5" fill="#fff"/><rect x="24" y="2" width="3" height="3"/><rect y="22" width="7" height="7"/><rect x="1" y="23" width="5" height="5" fill="#fff"/><rect x="2" y="24" width="3" height="3"/><rect x="10" y="3" width="2" height="2"/><rect x="14" y="5" width="2" height="2"/><rect x="9" y="9" width="3" height="2"/><rect x="14" y="10" width="2" height="3"/><rect x="18" y="9" width="2" height="2"/><rect x="22" y="12" width="2" height="2"/><rect x="4" y="14" width="2" height="2"/><rect x="9" y="15" width="2" height="2"/><rect x="14" y="15" width="3" height="2"/><rect x="19" y="16" width="2" height="2"/><rect x="25" y="14" width="2" height="2"/><rect x="10" y="22" width="2" height="2"/><rect x="15" y="23" width="2" height="2"/><rect x="20" y="24" width="2" height="2"/><rect x="24" y="22" width="2" height="2"/></g></svg>`);

// ── Documents per state (ApiDocument shape used by DocumentService) ──
const doc = (i: number, type: string, status: string, reason: string | null = null) => ({
  id: `doc-00${i}-uuid`,
  applicationId: APP_ID,
  documentType: type,
  fileName: `${type}.jpg`,
  fileUrl: 'https://i.pravatar.cc/300?img=' + (i + 10),
  contentType: 'image/jpeg',
  fileSize: 245000,
  status,                       // Uploaded | UnderReview | Approved | Rejected
  rejectionReason: reason,
  uploadedAt: NOW(),
});

const DOCS = {
  none: [] as ReturnType<typeof doc>[],
  review: [
    doc(1, 'ProfilePhoto', 'UnderReview'),
    doc(2, 'NationalIdFront', 'UnderReview'),
    doc(3, 'NationalIdBack', 'UnderReview'),
    doc(4, 'BirthCertificate', 'UnderReview'),
  ],
  approved: [
    doc(1, 'ProfilePhoto', 'Approved'),
    doc(2, 'NationalIdFront', 'Approved'),
    doc(3, 'NationalIdBack', 'Approved'),
    doc(4, 'BirthCertificate', 'Approved'),
  ],
  rejected: [
    doc(1, 'ProfilePhoto', 'Rejected', 'صورة الوجه غير واضحة — Face photo unclear'),
    doc(2, 'NationalIdFront', 'Approved'),
    doc(3, 'NationalIdBack', 'Approved'),
    doc(4, 'BirthCertificate', 'Approved'),
  ],
};

// ── Notifications per state ──
const notif = (id: number, type: string, ar: string, en: string, msgAr: string, msgEn: string, sev: string, read = false) => ({
  id: `n-${id}`, type, titleAr: ar, titleEn: en, messageAr: msgAr, messageEn: msgEn,
  severity: sev, isRead: read, createdAt: NOW(),
});

const N_WELCOME  = notif(1, 'WELCOME', 'مرحباً بك في Egy E-Passport! 🎉', 'Welcome to Egy E-Passport!',
  'تم إنشاء حسابك بنجاح. ابدأ بإنشاء طلب جواز السفر الرقمي.', 'Your account was created. Start your digital passport request.', 'info');
const N_PROFILE  = notif(2, 'PROFILE_COMPLETED', 'اكتمل ملفك الشخصي ✅', 'Profile Completed',
  'تم حفظ بياناتك الشخصية بنجاح.', 'Your personal information was saved.', 'success');
const N_SUBMIT   = notif(3, 'APPLICATION_SUBMITTED', 'تم استلام طلبك 📨', 'Application Received',
  'تم إرسال طلبك وهو الآن قيد المراجعة الرسمية.', 'Your application was submitted and is under review.', 'info');
const N_REVIEW   = notif(4, 'DOC_UNDER_REVIEW', 'مستنداتك قيد المراجعة 🔍', 'Documents Under Review',
  'جارٍ التحقق من بياناتك ومستنداتك.', 'Our team is verifying your documents.', 'warning');
const N_DOC_OK   = notif(5, 'DOC_APPROVED', 'تمت الموافقة على مستنداتك ✅', 'Documents Approved',
  'تم التحقق من جميع المستندات (4/4) بنجاح.', 'All documents (4/4) were verified.', 'success');
const N_PASS_OK  = notif(6, 'PASSPORT_APPROVED', 'تمت الموافقة على جوازك الرقمي! 🎉', 'Passport Approved!',
  'مبروك! جواز سفرك الرقمي جاهز الآن.', 'Congrats! Your digital passport is ready.', 'success');
const N_QR       = notif(7, 'QR_GENERATED', 'تم توليد رمز QR الخاص بك 🔲', 'QR Code Generated',
  'رمز QR ديناميكي نشط ويتجدد كل 3 دقائق.', 'Dynamic QR is live — refreshes every 3 minutes.', 'info');
const N_REJECT   = notif(8, 'DOC_REJECTED', 'تم رفض مستند: الصورة الشخصية ❌', 'Document Rejected: Profile Photo',
  'السبب: صورة الوجه غير واضحة. يرجى إعادة الرفع وإعادة التقديم.', 'Reason: face photo unclear. Please re-upload and resubmit.', 'error');

// ── Application object per state ──
const app = (id: string, status: string, ref: string | null, rejectionReason?: string) => ({
  id, status, referenceNumber: ref,
  createdAt: '2025-05-20T10:30:00Z', updatedAt: NOW(),
  ...(rejectionReason ? { rejectionReason } : {}),
  documents: [],
});

// ── Passport + QR ──
export const MOCK_PASSPORT = {
  id: 'passport-001', number: 'A12345678',
  issuedDate: '2025-05-20', expiryDate: '2035-05-19',
  status: 'valid', profilePhoto: 'https://i.pravatar.cc/160?img=12',
  name: 'أحمد محمد علي', nationalId: '***-****-1234',
};
export const makeQR = () => ({
  qrCode: QR_PNG, image: QR_PNG,
  issuedDate: NOW(),
  expiryDate: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
  refreshedAt: NOW(),
});

export const TEST_STATES: Record<TestState, any> = {
  ZERO: {
    applications: [], documents: DOCS.none,
    passport: null, qr: null,
    notifications: [N_WELCOME],
  },
  WELCOME: {
    applications: [], documents: DOCS.none,
    passport: null, qr: null,
    notifications: [N_WELCOME],
  },
  PROFILE_COMPLETE: {
    applications: [app(APP_ID, 'draft', null)], documents: DOCS.none,
    passport: null, qr: null,
    notifications: [N_PROFILE, N_WELCOME],
  },
  PENDING_REVIEW: {
    applications: [app(APP_ID, 'submitted', 'EP-2025-0005847')], documents: DOCS.review,
    passport: null, qr: null,
    notifications: [N_REVIEW, N_SUBMIT, N_PROFILE, { ...N_WELCOME, isRead: true }],
  },
  APPROVED: {
    applications: [app(APP_ID, 'approved', 'EP-2025-0004123')], documents: DOCS.approved,
    passport: MOCK_PASSPORT, qr: 'DYNAMIC',   // qr generated fresh each call
    notifications: [N_PASS_OK, N_QR, N_DOC_OK, { ...N_REVIEW, isRead: true }],
  },
  REJECTED: {
    applications: [app(APP_ID_REJ, 'rejected', 'EP-2025-0001456',
      'صورة الوجه غير واضحة — يرجى إعادة التقاط الصورة وفقاً للمعايير الرسمية وإعادة التقديم.')],
    documents: DOCS.rejected,
    passport: null, qr: null,
    notifications: [N_REJECT, { ...N_REVIEW, isRead: true }],
  },
};

export const MOCK_USER = {
  id: 'user-001-uuid',
  fullName: 'أحمد محمد علي',
  email: TEST_CREDENTIALS.email,
  mobileNumber: '01012345678',
  nationalId: '29901011234567',
  role: 'Citizen',
};
