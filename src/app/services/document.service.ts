




















import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DocumentCard, DocStatus, Lang, NavItem, User,
         ApiDocument, ApiDocumentsResponse ,BilingualText} from '../shared/models/document';
import { NotificationStoreService } from '../features/notifications/notification-store.service';

const DOC_TYPE_LABELS: Record<string, BilingualText> = {
  ProfilePhoto:       { ar: 'صورة شخصية',           en: 'Profile Photo'          },
  NationalIdFront:    { ar: 'بطاقة الرقم القومي',    en: 'National ID (Front)'    },
  NationalIdBack:     { ar: 'بطاقة الرقم (الخلفي)',  en: 'National ID (Back)'     },
  BirthCertificate:   { ar: 'شهادة الميلاد',         en: 'Birth Certificate'      },
  Passport:           { ar: 'جواز السفر',             en: 'Passport'               },
  DrivingLicense:     { ar: 'رخصة القيادة',           en: 'Driving License'        },
  ResidenceProof:     { ar: 'إثبات محل الإقامة',      en: 'Proof of Residence'     },
  EducationCert:      { ar: 'شهادة المؤهل الدراسي',  en: 'Educational Certificate'},
  MarriageCertificate:{ ar: 'عقد الزواج',             en: 'Marriage Certificate'   },
};

const STATUS_MAP: Record<string, DocStatus> = {
  Uploaded:     'review',    // Uploaded = under review
  UnderReview:  'review',
  Approved:     'verified',
  Rejected:     'rejected',
  Expired:      'expired',
  Pending:      'optional',
};

@Injectable({ providedIn: 'root' })
export class DocumentService {
private readonly notifStore = inject(NotificationStoreService);
  private readonly http = inject(HttpClient);

  // ── Base URL ──────────────────────────────────────────────────
  private readonly BASE_URL = 'https://egypassport.runasp.net';

  // ── Language ──────────────────────────────────────────────────
  readonly lang = signal<Lang>('ar');
  setLang(l: Lang) { this.lang.set(l); }

  // ── User ──────────────────────────────────────────────────────
  readonly user: User = {
    name:   { ar: 'أحمد محمد علي',  en: 'Ahmed Mohamed Ali' },
    role:   { ar: 'المواطن المصري', en: 'Egyptian Citizen'   },
    avatar: 'https://i.pravatar.cc/80?img=12',
  };

  // ── Navigation ────────────────────────────────────────────────
  readonly navItems: NavItem[] = [
    { key:'dashboard',     label:{ ar:'الرئيسية',       en:'Dashboard'      }, icon:'bi-house-door'        },
    { key:'wallet',        label:{ ar:'الهوية الرقمية', en:'Digital ID'      }, icon:'bi-person-vcard'      },
    { key:'applications',  label:{ ar:'طلباتي',         en:'My Applications' }, icon:'bi-file-earmark-text' },
    { key:'documents',     label:{ ar:'المستندات',      en:'Documents'       }, icon:'bi-folder2-open'      },
    { key:'notifications', label:{ ar:'الإشعارات',      en:'Notifications'   }, icon:'bi-bell', badge: this.notifStore.unreadCount() || undefined    },
  ];
  readonly accountItems: NavItem[] = [
    { key:'profile',  label:{ ar:'الملف الشخصي', en:'Profile'  }, icon:'bi-person-circle' },
    { key:'settings', label:{ ar:'الإعدادات',    en:'Settings' }, icon:'bi-gear'           },
  ];

  activeNav = signal<string>('documents');
  setActiveNav(key: string) { this.activeNav.set(key); }

  // ── Documents state ───────────────────────────────────────────
  private readonly _docs    = signal<DocumentCard[]>([]);
  readonly isLoading        = signal(false);
  readonly loadError        = signal<string | null>(null);
  readonly searchQuery      = signal('');
  readonly statusFilter     = signal<DocStatus | ''>('');

  readonly docs = this._docs.asReadonly();

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

  // ── Load documents from API ───────────────────────────────────
  loadDocuments(token: string, pageNumber = 1, pageSize = 10): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    const headers = new HttpHeaders({
      'accept':        '*/*',
      'Authorization': `Bearer ${token}`,
    });
    this.http.get<ApiDocumentsResponse>(
      `${this.BASE_URL}/api/me/documents?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { headers }
    ).subscribe({
      next: (res) => {
        if (res.success && res.data?.items) {
          this._docs.set(res.data.items.map(item => this.mapApiDoc(item)));
        } else {
          this.loadError.set(res.messageAr || 'فشل تحميل المستندات');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loadError.set('حدث خطأ أثناء تحميل المستندات');
        this.isLoading.set(false);
      }
    });
  }

  // ── Map API document → DocumentCard ──────────────────────────
  private mapApiDoc(item: ApiDocument): DocumentCard {
    // Get bilingual title from type map, or fallback to raw type
    const title = DOC_TYPE_LABELS[item.documentType] ?? {
      ar: item.documentType,
      en: item.documentType,
    };

    // Map API status to DocStatus
    const status: DocStatus = STATUS_MAP[item.status] ?? 'optional';

    // Build full image URL
    const imgUrl = item.fileUrl
      ? `${this.BASE_URL}${item.fileUrl}`
      : null;

    // Format uploaded date
    const uploaded = item.uploadedAt
      ? new Date(item.uploadedAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        })
      : null;

    // Rejection reason
    const rejectReason = item.rejectionReason
      ? { ar: item.rejectionReason, en: item.rejectionReason }
      : undefined;

    return {
      id:           item.id,
      title,
      status,
      img:          imgUrl,
      viewUrl:      imgUrl ?? undefined,
      uploaded,
      expiry:       null,              // API doesn't return expiry — set manually if needed
      optional:     false,
      rejectReason,
    };
  }

  // ── CRUD ──────────────────────────────────────────────────────
  deleteDoc(id: number | string): void {
    this._docs.update(list => list.filter(d => d.id !== id));
  }

  updateStatus(id: number | string, status: DocStatus): void {
    this._docs.update(list =>
      list.map(d => d.id === id ? { ...d, status } : d)
    );
  }

  getDocById(id: number | string): DocumentCard | undefined {
    return this._docs().find(d => d.id === id);
  }

  getDocsByStatus(status: DocStatus): DocumentCard[] {
    return this._docs().filter(d => d.status === status);
  }
}
