// src/app/pages/dashboard/dashboard.component.ts
// REPLACES the existing dashboard.component.ts
import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

import { WalletService } from '../../features/wallet/services/wallet.service';
import { ApplicationService } from '../../features/applications/services/application.service';
import { PassportData, QRCodeData } from '../../shared/models/wallet.model';
import { Application, ApplicationStatus } from '../../shared/models/application.model';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly appService = inject(ApplicationService);
  private readonly docService = inject(DocumentService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);   // SSR fix

  // ── State ─────────────────────────────────────────────────
  readonly passportData = signal<PassportData | null>(null);
  readonly qrCodeData = signal<QRCodeData | null>(null);
  readonly applications = signal<Application[]>([]);
  readonly latestApp = signal<Application | null>(null);
  readonly appStatus = signal<ApplicationStatus | null>(null);
  readonly isLoading = signal(true);
  readonly isRefreshingQr = signal(false);

  // QR countdown
  readonly qrTimeLeft = signal('03:00');
  private qrTimer: ReturnType<typeof setInterval> | null = null;
  private qrSecondsLeft = 180;

  // ── Computed ──────────────────────────────────────────────
  readonly userName = computed(() => {
    const user = this.docService.user;
    return this.docService.lang() === 'ar' ? user.name.ar : user.name.en;
  });

  readonly passportNumber = computed(() => this.passportData()?.number ?? '—');

  readonly isPassportValid = computed(() => {
    const p = this.passportData();
    if (!p) return false;
    return p.status === 'valid' && new Date(p.expiryDate).getTime() > Date.now();
  });

  readonly lang = computed(() => this.docService.lang());

  // Status tracker steps
  readonly statusSteps = computed(() => {
    const status = this.appStatus();
    const app = this.latestApp();
    if (!app) return [];

    const steps = [
      { key: 'received',  labelAr: 'تم استلام الطلب',  labelEn: 'Application Received',  icon: 'bi-check-circle-fill', done: true,  current: false, failed: false, date: app.createdAt },
      { key: 'review',    labelAr: 'قيد المراجعة',      labelEn: 'Under Review',           icon: 'bi-arrow-repeat',      done: false, current: false, failed: false, date: '' },
      { key: 'approved',  labelAr: 'تمت الموافقة',      labelEn: 'Approved',               icon: 'bi-check2-all',        done: false, current: false, failed: false, date: '' },
      { key: 'issued',    labelAr: 'تم الإصدار',        labelEn: 'Issued',                 icon: 'bi-shield-check',      done: false, current: false, failed: false, date: '' },
    ];

    const s = app.status?.toLowerCase() ?? '';
    if (s === 'submitted' || s === 'under-review') {
      steps[1].current = true;
      steps[1].date = status?.estimatedCompletion ?? '';
    } else if (s === 'approved') {
      steps[1].done = true;
      steps[2].done = true;
      steps[2].date = app.updatedAt ?? '';
    } else if (s === 'rejected') {
      steps[1].done = true;
      steps[2].failed = true;
    }

    return steps;
  });

  readonly documents = computed(() => this.docService.docs());

  ngOnInit(): void {
    // SSR FIX: only run in browser — prevents localStorage timeout on server
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
    }
  }

  // ── Load ──────────────────────────────────────────────────
  loadDashboardData(): void {
    this.isLoading.set(true);
    let pending = 3;
    const done = () => { pending--; if (pending <= 0) this.isLoading.set(false); };

    // Passport + QR
    this.walletService.getPassport()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: d => { this.passportData.set(d); done(); }, error: () => done() });

    this.walletService.getQRCode()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: d => { this.qrCodeData.set(d); this.startQRTimer(d.expiryDate); done(); },
        error: () => done()
      });

    // Applications
    this.appService.getAllApplications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: apps => {
          this.applications.set(apps);
          if (apps.length > 0) {
            const latest = apps[0];
            this.latestApp.set(latest);
            // Load status for latest
            this.appService.getApplicationStatus(latest.id)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({ next: s => this.appStatus.set(s), error: () => {} });
          }
          done();
        },
        error: () => done()
      });

    // Documents
    const token = isPlatformBrowser(this.platformId)
      ? (this.authService.getToken?.() ?? localStorage.getItem('token') ?? '')
      : '';   // SSR-safe
    if (token) this.docService.loadDocuments(token);
  }

  // ── QR Timer ──────────────────────────────────────────────
  private startQRTimer(expiryDate: string): void {
    if (this.qrTimer) clearInterval(this.qrTimer);

    const expiry = new Date(expiryDate).getTime();
    this.qrTimer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      this.qrSecondsLeft = diff;
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      this.qrTimeLeft.set(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      if (diff <= 0) {
        clearInterval(this.qrTimer!);
        this.refreshQRCode();
      }
    }, 1000);
  }

  refreshQRCode(): void {
    this.isRefreshingQr.set(true);
    this.walletService.refreshQRCode()
      .pipe(
        finalize(() => this.isRefreshingQr.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: d => {
          this.qrCodeData.set(d);
          this.startQRTimer(d.expiryDate);
          this.toastr.success('تم تحديث رمز QR بنجاح');
        },
        error: () => this.toastr.error('فشل تحديث رمز QR')
      });
  }

  // ── PDF Download ──────────────────────────────────────────
  downloadPdf(): void {
    this.walletService.downloadPassportPdf()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Egy-EPassport.pdf';
          a.click();
          URL.revokeObjectURL(url);
          this.toastr.success('تم تحميل ملف PDF بنجاح');
        },
        error: () => this.toastr.error('فشل تحميل ملف PDF')
      });
  }

  getStatusBadgeClass(): string {
    const s = this.latestApp()?.status?.toLowerCase() ?? '';
    if (s === 'approved') return 'badge-approved';
    if (s === 'rejected') return 'badge-rejected';
    return 'badge-pending';
  }

  getStatusLabel(): string {
    const s = this.latestApp()?.status?.toLowerCase() ?? '';
    const lang = this.lang();
    const map: Record<string, { ar: string; en: string }> = {
      'draft':        { ar: 'مسودة', en: 'Draft' },
      'submitted':    { ar: 'قيد المراجعة', en: 'Under Review' },
      'under-review': { ar: 'قيد المراجعة', en: 'Under Review' },
      'approved':     { ar: 'تمت الموافقة', en: 'Approved' },
      'rejected':     { ar: 'تم الرفض', en: 'Rejected' },
    };
    return map[s]?.[lang] ?? s;
  }
}
