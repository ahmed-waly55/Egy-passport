// src/app/core/mocks/mock-data.service.ts
// Central mock data service — provides complete dummy data for all user states
// Usage: Import and call MockDataService.getState('zero') | 'draft' | 'submitted' | 'approved' | 'rejected'

import { Injectable } from '@angular/core';

// ── Types ────────────────────────────────────────────────────
export type UserState = 'zero' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface MockUser {
  id: string;
  fullName: string;
  fullNameEn: string;
  email: string;
  phone: string;
  nationalId: string;
  passportNumber: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  governorate: string;
  address: string;
  profilePhoto: string;
  createdAt: string;
}

export interface MockApplication {
  id: string;
  referenceNumber: string;
  status: string;
  passportType: string;
  submittedAt: string;
  updatedAt: string;
  rejectionReason?: string;
  documents: MockDocument[];
  trackingSteps: MockTrackingStep[];
}

export interface MockDocument {
  id: string;
  type: string;
  labelAr: string;
  labelEn: string;
  status: 'verified' | 'pending' | 'rejected' | 'not_uploaded';
  fileUrl?: string;
  rejectionReason?: string;
  uploadedAt?: string;
}

export interface MockTrackingStep {
  step: number;
  labelAr: string;
  labelEn: string;
  status: 'done' | 'current' | 'pending' | 'failed';
  date?: string;
  note?: string;
}

export interface MockPassport {
  number: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
  name: string;
  nationalId: string;
  profilePhoto: string;
}

export interface MockQR {
  qrCode: string;
  issuedDate: string;
  expiryDate: string;
  refreshedAt: string;
}

export interface MockNotification {
  id: string;
  type: 'welcome' | 'success' | 'error' | 'info' | 'security';
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  isRead: boolean;
  createdAt: string;
  icon: string;
}

export interface MockStateData {
  user: MockUser;
  application: MockApplication | null;
  passport: MockPassport | null;
  qr: MockQR | null;
  notifications: MockNotification[];
  dashboardConfig: {
    showPassportCard: boolean;
    showQR: boolean;
    showUploadDocs: boolean;
    showPdfButton: boolean;
    showStatusTracker: boolean;
    showQuickActions: string[];
  };
}

// ── Service ──────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class MockDataService {

  // ── Base User ──────────────────────────────────────────────
  private static readonly USER: MockUser = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    fullName: 'أحمد محمد علي',
    fullNameEn: 'Ahmed Mohamed Ali',
    email: 'ahmed.ali@example.com',
    phone: '01012345678',
    nationalId: '29503150101234',
    passportNumber: 'A12345678',
    dateOfBirth: '1995-03-15',
    gender: 'male',
    nationality: 'مصري',
    governorate: 'القاهرة',
    address: 'شارع جامعة الدول العربية - ميدان سفنكس - الجيزة',
    profilePhoto: '',
    createdAt: '2025-05-20T10:30:00Z',
  };

  // ── Documents ──────────────────────────────────────────────
  private static readonly DOCS_VERIFIED: MockDocument[] = [
    { id: 'd1', type: 'ProfilePhoto',    labelAr: 'صورة شخصية',              labelEn: 'Personal Photo',      status: 'verified', uploadedAt: '2025-05-20', fileUrl: '/uploads/photo.jpg' },
    { id: 'd2', type: 'NationalIdFront', labelAr: 'بطاقة الرقم القومي (أمامي)', labelEn: 'National ID Front',   status: 'verified', uploadedAt: '2025-05-20', fileUrl: '/uploads/nid_front.jpg' },
    { id: 'd3', type: 'NationalIdBack',  labelAr: 'بطاقة الرقم القومي (خلفي)', labelEn: 'National ID Back',    status: 'verified', uploadedAt: '2025-05-20', fileUrl: '/uploads/nid_back.jpg' },
    { id: 'd4', type: 'BirthCertificate',labelAr: 'شهادة الميلاد',            labelEn: 'Birth Certificate',   status: 'verified', uploadedAt: '2025-05-20', fileUrl: '/uploads/birth.jpg' },
  ];

  private static readonly DOCS_PENDING: MockDocument[] = [
    { id: 'd1', type: 'ProfilePhoto',    labelAr: 'صورة شخصية',              labelEn: 'Personal Photo',      status: 'verified', uploadedAt: '2025-05-20' },
    { id: 'd2', type: 'NationalIdFront', labelAr: 'بطاقة الرقم القومي (أمامي)', labelEn: 'National ID Front',   status: 'pending',  uploadedAt: '2025-05-20' },
    { id: 'd3', type: 'NationalIdBack',  labelAr: 'بطاقة الرقم القومي (خلفي)', labelEn: 'National ID Back',    status: 'pending',  uploadedAt: '2025-05-20' },
    { id: 'd4', type: 'BirthCertificate',labelAr: 'شهادة الميلاد',            labelEn: 'Birth Certificate',   status: 'rejected', rejectionReason: 'الصورة غير واضحة', uploadedAt: '2025-05-20' },
  ];

  // ── Get State Data ─────────────────────────────────────────
  static getState(state: UserState): MockStateData {
    switch (state) {
      case 'zero':         return this.zeroState();
      case 'draft':        return this.draftState();
      case 'submitted':    return this.submittedState();
      case 'under_review': return this.underReviewState();
      case 'approved':     return this.approvedState();
      case 'rejected':     return this.rejectedState();
    }
  }

  // ── STATE: Zero (just registered) ──────────────────────────
  private static zeroState(): MockStateData {
    return {
      user: this.USER,
      application: null,
      passport: null,
      qr: null,
      notifications: [
        { id: 'n1', type: 'welcome', icon: '👋', titleAr: 'مرحباً بك!', titleEn: 'Welcome!', messageAr: 'مرحباً بك في Egy E-Passport! حسابك تم إنشاؤه بنجاح.', messageEn: 'Welcome to Egy E-Passport! Your account was created successfully.', isRead: false, createdAt: '2025-05-20T10:30:00Z' },
      ],
      dashboardConfig: {
        showPassportCard: false, showQR: false, showUploadDocs: true,
        showPdfButton: false, showStatusTracker: false,
        showQuickActions: ['upload_docs', 'complete_profile', 'help'],
      },
    };
  }

  // ── STATE: Draft ───────────────────────────────────────────
  private static draftState(): MockStateData {
    return {
      user: this.USER,
      application: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        referenceNumber: 'EP-2025-0005847',
        status: 'draft',
        passportType: 'جواز السفر العادي',
        submittedAt: '',
        updatedAt: '2025-05-20T11:00:00Z',
        documents: [],
        trackingSteps: [
          { step: 1, labelAr: 'تم إنشاء المسودة', labelEn: 'Draft Created', status: 'current', date: '2025-05-20' },
          { step: 2, labelAr: 'رفع المستندات', labelEn: 'Upload Documents', status: 'pending' },
          { step: 3, labelAr: 'إرسال الطلب', labelEn: 'Submit', status: 'pending' },
          { step: 4, labelAr: 'تمت الموافقة', labelEn: 'Approved', status: 'pending' },
        ],
      },
      passport: null,
      qr: null,
      notifications: [
        { id: 'n1', type: 'welcome', icon: '👋', titleAr: 'مرحباً بك!', titleEn: 'Welcome!', messageAr: 'مرحباً بك في Egy E-Passport!', messageEn: 'Welcome to Egy E-Passport!', isRead: true, createdAt: '2025-05-20T10:30:00Z' },
        { id: 'n2', type: 'info', icon: '📋', titleAr: 'تم إنشاء مسودة الطلب', titleEn: 'Draft Created', messageAr: 'تم إنشاء مسودة طلب جواز السفر. يرجى رفع المستندات المطلوبة.', messageEn: 'Passport draft created. Please upload required documents.', isRead: false, createdAt: '2025-05-20T11:00:00Z' },
      ],
      dashboardConfig: {
        showPassportCard: false, showQR: false, showUploadDocs: true,
        showPdfButton: false, showStatusTracker: true,
        showQuickActions: ['upload_docs', 'complete_application', 'help'],
      },
    };
  }

  // ── STATE: Submitted ───────────────────────────────────────
  private static submittedState(): MockStateData {
    return {
      user: this.USER,
      application: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        referenceNumber: 'EP-2025-0005847',
        status: 'submitted',
        passportType: 'جواز السفر العادي',
        submittedAt: '2025-05-20T12:00:00Z',
        updatedAt: '2025-05-20T12:00:00Z',
        documents: this.DOCS_PENDING,
        trackingSteps: [
          { step: 1, labelAr: 'تم استلام الطلب', labelEn: 'Received', status: 'done', date: '2025-05-20' },
          { step: 2, labelAr: 'قيد المراجعة', labelEn: 'Under Review', status: 'current', note: 'جارٍ التحقق من بياناتك' },
          { step: 3, labelAr: 'تمت الموافقة', labelEn: 'Approved', status: 'pending' },
          { step: 4, labelAr: 'تم الإصدار', labelEn: 'Issued', status: 'pending' },
        ],
      },
      passport: null,
      qr: null,
      notifications: [
        { id: 'n1', type: 'welcome', icon: '👋', titleAr: 'مرحباً بك!', titleEn: 'Welcome!', messageAr: 'مرحباً بك في Egy E-Passport!', messageEn: 'Welcome!', isRead: true, createdAt: '2025-05-20T10:30:00Z' },
        { id: 'n3', type: 'info', icon: '📬', titleAr: 'تم استلام طلبك', titleEn: 'Application Received', messageAr: 'تم استلام طلبك بنجاح. رقم الطلب: EP-2025-0005847', messageEn: 'Application received. Ref: EP-2025-0005847', isRead: false, createdAt: '2025-05-20T12:00:00Z' },
        { id: 'n4', type: 'success', icon: '✅', titleAr: 'تم اعتماد مستند: صورة شخصية', titleEn: 'Document Approved: Photo', messageAr: 'تم اعتماد مستند الصورة الشخصية بنجاح.', messageEn: 'Personal photo verified.', isRead: false, createdAt: '2025-05-20T13:00:00Z' },
        { id: 'n5', type: 'error', icon: '❌', titleAr: 'تم رفض مستند: شهادة الميلاد', titleEn: 'Document Rejected', messageAr: 'تم رفض شهادة الميلاد. السبب: الصورة غير واضحة.', messageEn: 'Birth certificate rejected: Image blurry.', isRead: false, createdAt: '2025-05-20T13:15:00Z' },
      ],
      dashboardConfig: {
        showPassportCard: false, showQR: false, showUploadDocs: false,
        showPdfButton: false, showStatusTracker: true,
        showQuickActions: ['track_application', 'help'],
      },
    };
  }

  // ── STATE: Under Review ────────────────────────────────────
  private static underReviewState(): MockStateData {
    const data = this.submittedState();
    if (data.application) data.application.status = 'under-review';
    return data;
  }

  // ── STATE: Approved ✅ ─────────────────────────────────────
  private static approvedState(): MockStateData {
    return {
      user: this.USER,
      application: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        referenceNumber: 'EP-2025-0005847',
        status: 'approved',
        passportType: 'جواز السفر العادي',
        submittedAt: '2025-05-20T12:00:00Z',
        updatedAt: '2025-05-21T09:00:00Z',
        documents: this.DOCS_VERIFIED,
        trackingSteps: [
          { step: 1, labelAr: 'تم استلام الطلب', labelEn: 'Received', status: 'done', date: '2025-05-20' },
          { step: 2, labelAr: 'تمت المراجعة', labelEn: 'Reviewed', status: 'done', date: '2025-05-20' },
          { step: 3, labelAr: 'تمت الموافقة', labelEn: 'Approved', status: 'done', date: '2025-05-21' },
          { step: 4, labelAr: 'تم الإصدار', labelEn: 'Issued', status: 'done', date: '2025-05-21' },
        ],
      },
      passport: {
        number: 'A12345678',
        issuedDate: '2025-05-21',
        expiryDate: '2035-05-20',
        status: 'valid',
        name: 'أحمد محمد علي',
        nationalId: '295***01234',
        profilePhoto: '',
      },
      qr: {
        qrCode: 'data:image/png;base64,iVBORw0KGgo=', // placeholder
        issuedDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
        refreshedAt: new Date().toISOString(),
      },
      notifications: [
        { id: 'n1', type: 'welcome', icon: '👋', titleAr: 'مرحباً بك!', titleEn: 'Welcome!', messageAr: 'مرحباً بك في Egy E-Passport!', messageEn: 'Welcome!', isRead: true, createdAt: '2025-05-20T10:30:00Z' },
        { id: 'n6', type: 'success', icon: '🎉', titleAr: 'تمت الموافقة على طلبك!', titleEn: 'Application Approved!', messageAr: 'تهانينا! تمت الموافقة على طلب جواز السفر الرقمي. يمكنك الآن الوصول إلى هويتك الرقمية.', messageEn: 'Congratulations! Your digital passport is approved.', isRead: false, createdAt: '2025-05-21T09:00:00Z' },
        { id: 'n7', type: 'success', icon: '🔲', titleAr: 'تم إنشاء رمز QR', titleEn: 'QR Code Generated', messageAr: 'تم إنشاء أول رمز QR خاص بك. يتجدد تلقائياً كل 3 دقائق.', messageEn: 'Your first QR code has been generated.', isRead: false, createdAt: '2025-05-21T09:01:00Z' },
        { id: 'n8', type: 'success', icon: '✅', titleAr: 'تم التحقق من جميع المستندات', titleEn: 'All Documents Verified', messageAr: 'تم التحقق من جميع مستنداتك بنجاح.', messageEn: 'All documents verified.', isRead: true, createdAt: '2025-05-21T08:30:00Z' },
        { id: 'n9', type: 'info', icon: '📬', titleAr: 'تم استلام طلبك', titleEn: 'Application Received', messageAr: 'تم استلام طلبك EP-2025-0005847 بنجاح.', messageEn: 'Application EP-2025-0005847 received.', isRead: true, createdAt: '2025-05-20T12:00:00Z' },
      ],
      dashboardConfig: {
        showPassportCard: true, showQR: true, showUploadDocs: false,
        showPdfButton: true, showStatusTracker: true,
        showQuickActions: ['view_qr', 'view_details', 'download_pdf', 'help'],
      },
    };
  }

  // ── STATE: Rejected ❌ ─────────────────────────────────────
  private static rejectedState(): MockStateData {
    return {
      user: this.USER,
      application: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        referenceNumber: 'EP-2025-0001456',
        status: 'rejected',
        passportType: 'جواز السفر العادي',
        submittedAt: '2025-04-25T10:00:00Z',
        updatedAt: '2025-04-28T16:45:00Z',
        rejectionReason: 'صورة الوجه غير واضحة. يرجى رفع صورة شخصية بجودة عالية على خلفية بيضاء.',
        documents: this.DOCS_PENDING,
        trackingSteps: [
          { step: 1, labelAr: 'تم استلام الطلب', labelEn: 'Received', status: 'done', date: '2025-04-25' },
          { step: 2, labelAr: 'تمت المراجعة', labelEn: 'Reviewed', status: 'done', date: '2025-04-26' },
          { step: 3, labelAr: 'تم الرفض', labelEn: 'Rejected', status: 'failed', date: '2025-04-28' },
          { step: 4, labelAr: 'تم الإصدار', labelEn: 'Issued', status: 'pending' },
        ],
      },
      passport: null,
      qr: null,
      notifications: [
        { id: 'n10', type: 'error', icon: '❌', titleAr: 'تم رفض طلبك', titleEn: 'Application Rejected', messageAr: 'تم رفض طلبك. السبب: صورة الوجه غير واضحة. يمكنك إعادة التقديم.', messageEn: 'Application rejected. Reason: Blurry photo.', isRead: false, createdAt: '2025-04-28T16:45:00Z' },
      ],
      dashboardConfig: {
        showPassportCard: false, showQR: false, showUploadDocs: false,
        showPdfButton: false, showStatusTracker: true,
        showQuickActions: ['reapply', 'help'],
      },
    };
  }

  // ── Helper: Get current state from localStorage ────────────
  static getCurrentState(): UserState {
    return (localStorage.getItem('egy_mock_state') as UserState) ?? 'approved';
  }

  static setCurrentState(state: UserState): void {
    localStorage.setItem('egy_mock_state', state);
  }
}
