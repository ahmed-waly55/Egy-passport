
import { Injectable, signal, computed } from '@angular/core';
import { DocumentCard, DocStatus, Lang, NavItem, User } from '../shared/models/document';

@Injectable({ providedIn: 'root' })
export class DocumentService { //Document

  // ── Language ─────────────────────────────────────────────────────
  readonly lang = signal<Lang>('ar');

  setLang(l: Lang) { this.lang.set(l); }

  // ── User ─────────────────────────────────────────────────────────
  readonly user: User = {
    name:   { ar: 'أحمد محمد علي',   en: 'Ahmed Mohamed Ali' },
    role:   { ar: 'المواطن المصري',  en: 'Egyptian Citizen' },
    avatar: 'https://i.pravatar.cc/80?img=12',
  };

  // ── Navigation ────────────────────────────────────────────────────
readonly navItems: NavItem[] = [
  { key:'dashboard',     label:{ ar:'الرئيسية',       en:'Dashboard'      }, icon:'bi-house-door'       },
  { key:'identity',      label:{ ar:'الهوية الرقمية', en:'Digital ID'      }, icon:'bi-person-vcard'     },
  { key:'requests',      label:{ ar:'طلباتي',         en:'My Applications' }, icon:'bi-file-earmark-text'},
  { key:'documents',     label:{ ar:'المستندات',      en:'Documents'       }, icon:'bi-folder2-open'     },
  { key:'notifications', label:{ ar:'الإشعارات',      en:'Notifications'   }, icon:'bi-bell', badge:3    },
];
readonly accountItems: NavItem[] = [
  { key:'profile',  label:{ ar:'الملف الشخصي', en:'Profile'  }, icon:'bi-person-circle' },
  { key:'settings', label:{ ar:'الإعدادات',    en:'Settings' }, icon:'bi-gear'           },
];



  activeNav = signal<string>('documents');
  setActiveNav(key: string) { this.activeNav.set(key); }

  // ── Documents ─────────────────────────────────────────────────────
  private readonly _docs = signal<DocumentCard[]>([
    {
      id: 1,
      title:    { ar: 'صورة شخصية', en: 'Personal Photo' },
      status:   'verified',
      img:      'https://i.pravatar.cc/120?img=12',
      uploaded: '20 May 2025',
      expiry:   '20 May 2028',
      optional: false,
    },
    {
      id: 2,
      title:    { ar: 'بطاقة الرقم القومي', en: 'National ID (Front)' },
      status:   'verified',
      img:      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Egyptian_ID.jpg/220px-Egyptian_ID.jpg',
      uploaded: '20 May 2025',
      expiry:   '20 May 2030',
      optional: false,
    },
    {
      id: 3,
      title:    { ar: 'بطاقة الرقم (الخلفي)', en: 'National ID (Back)' },
      status:   'verified',
      img:      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Egyptian_ID.jpg/220px-Egyptian_ID.jpg',
      uploaded: '20 May 2025',
      expiry:   '20 May 2030',
      optional: false,
    },
    {
      id: 4,
      title:    { ar: 'شهادة الميلاد', en: 'Birth Certificate' },
      status:   'rejected',
      img:      null,
      uploaded: '20 May 2025',
      expiry:   'Permanent',
      optional: false,
      rejectReason: {
        ar: 'الصورة غير واضحة — يرجى رفع صورة عالية الجودة تظهر فيها جميع البيانات بوضوح تام، بدون انعكاسات ضوئية أو أجزاء مقطوعة.',
        en: 'Document image is blurry — Please upload a high-quality, well-lit scan with no reflections or cut-off edges.',
      },
    },
    {
      id: 5,
      title:    { ar: 'جواز سفر سابق (إن وجد)', en: 'Previous Passport (if any)' },
      status:   'optional',
      img:      null,
      uploaded: '20 May 2025',
      expiry:   '20 May 2027',
      optional: true,
    },
    {
      id: 6,
      title:    { ar: 'شهادة المؤهل الدراسي', en: 'Educational Certificate' },
      status:   'review',
      img:      null,
      uploaded: '20 May 2025',
      expiry:   'Permanent',
      optional: false,
    },
    {
      id: 7,
      title:    { ar: 'إثبات محل الإقامة', en: 'Proof of Residence' },
      status:   'review',
      img:      null,
      uploaded: '20 May 2025',
      expiry:   '20 May 2026',
      optional: false,
    },
    {
      id: 8,
      title:    { ar: 'أي مستندات إضافية', en: 'Additional Documents' },
      status:   'optional',
      img:      null,
      uploaded: null,
      expiry:   null,
      optional: true,
    },
  ]);

  // ── Search & Filter ───────────────────────────────────────────────
  readonly searchQuery  = signal('');
  readonly statusFilter = signal<DocStatus | ''>('');

  /** Read-only signal derived from the internal list */
  readonly docs = this._docs.asReadonly();

  /** Filtered & searched list */
  readonly filteredDocs = computed(() => {
    const q   = this.searchQuery().trim().toLowerCase();
    const st  = this.statusFilter();
    const lng = this.lang();
    return this._docs().filter(d => {
      const matchQ  = !q  || d.title[lng].toLowerCase().includes(q);
      const matchSt = !st || d.status === st;
      return matchQ && matchSt;
    });
  });

  // ── CRUD ──────────────────────────────────────────────────────────

  /** Remove a document by id */
  deleteDoc(id: number): void {
    this._docs.update(list => list.filter(d => d.id !== id));
  }

  /** Update a document's status (e.g. after re-upload → 'review') */
  updateStatus(id: number, status: DocStatus): void {
    this._docs.update(list =>
      list.map(d => d.id === id ? { ...d, status } : d)
    );
  }

  /** Get a single document by id */
  getDocById(id: number): DocumentCard | undefined {
    return this._docs().find(d => d.id === id);
  }

  /** Get docs grouped by status */
  getDocsByStatus(status: DocStatus): DocumentCard[] {
    return this._docs().filter(d => d.status === status);
  }
}