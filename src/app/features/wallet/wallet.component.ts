// src/app/features/wallet/wallet.component.ts
// REPLACES existing wallet.component.ts — adds PDF download, passport details, QR timer
import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal, OnDestroy, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

import { WalletService } from './services/wallet.service';
import { ApplicationService } from '../applications/services/application.service';
import { PassportData, QRCodeData } from '../../shared/models/wallet.model';
import { Application } from '../../shared/models/application.model';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent implements OnInit, OnDestroy {
  private readonly walletService = inject(WalletService);
  private readonly appService = inject(ApplicationService);
  private readonly docService = inject(DocumentService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);   // SSR fix

  readonly passport = signal<PassportData | null>(null);
  readonly qrCode = signal<QRCodeData | null>(null);
  readonly latestApp = signal<Application | null>(null);
  readonly isLoading = signal(false);
  readonly isRefreshingQr = signal(false);
  readonly isDownloadingPdf = signal(false);
  readonly loadError = signal<string | null>(null);

  // QR Timer
  readonly qrTimeLeft = signal('03:00');
  readonly qrIsExpiring = signal(false);
  private qrTimer: ReturnType<typeof setInterval> | null = null;

  // Active tab
  readonly activeTab = signal<'passport' | 'qr' | 'details'>('passport');

  readonly isPassportValid = computed(() => {
    const data = this.passport();
    if (!data) return false;
    return data.status === 'valid' && new Date(data.expiryDate).getTime() > Date.now();
  });

  readonly lang = computed(() => this.docService.lang());

  readonly mrzLine = computed(() => {
    const name = (this.passport()?.name ?? 'AHMED MOHAMED ALI').toUpperCase().split(' ').join('<');
    return ('P<EGY' + name + '<<<<<<<<<<<<<<<<<<<<').slice(0, 40);
  });

  readonly userName = computed(() => {
    const user = this.docService.user;
    return this.lang() === 'ar' ? user.name.ar : user.name.en;
  });

  ngOnInit(): void {
    // SSR FIX: browser-only — prevents server-side timeout
    if (isPlatformBrowser(this.platformId)) {
      this.loadWalletData();
    }
  }

  ngOnDestroy(): void {
    if (this.qrTimer) clearInterval(this.qrTimer);
  }

  loadWalletData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    let pending = 3;
    const done = () => { pending--; if (pending <= 0) this.isLoading.set(false); };

    this.walletService.getPassport()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: d => { this.passport.set(d); done(); },
        error: () => { this.loadError.set('تعذر تحميل بيانات الجواز'); done(); }
      });

    this.walletService.getQRCode()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: d => { this.qrCode.set(d); this.startQRTimer(d.expiryDate); done(); },
        error: () => { this.toastr.error('تعذر تحميل رمز QR'); done(); }
      });

    this.appService.getAllApplications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: apps => { if (apps.length > 0) this.latestApp.set(apps[0]); done(); },
        error: () => done()
      });
  }

  refreshQrCode(): void {
    this.isRefreshingQr.set(true);
    this.walletService.refreshQRCode()
      .pipe(
        finalize(() => this.isRefreshingQr.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: d => {
          this.qrCode.set(d);
          this.startQRTimer(d.expiryDate);
          this.toastr.success('تم تحديث رمز QR بنجاح');
        },
        error: () => this.toastr.error('فشل تحديث رمز QR')
      });
  }

  downloadPdf(): void {
    this.isDownloadingPdf.set(true);
    this.walletService.downloadPassportPdf()
      .pipe(
        finalize(() => this.isDownloadingPdf.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'EgyEPassport.pdf';
          a.click();
          URL.revokeObjectURL(url);
          this.toastr.success('تم تحميل الجواز بنجاح');
        },
        error: () => this.toastr.error('فشل تحميل ملف PDF — قد يكون الجواز غير جاهز بعد')
      });
  }

  setTab(tab: 'passport' | 'qr' | 'details'): void {
    this.activeTab.set(tab);
  }

  private startQRTimer(expiryDate: string): void {
    if (this.qrTimer) clearInterval(this.qrTimer);
    const expiry = new Date(expiryDate).getTime();

    this.qrTimer = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      this.qrTimeLeft.set(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      this.qrIsExpiring.set(diff < 60);
      if (diff <= 0) {
        clearInterval(this.qrTimer!);
        this.refreshQrCode();
      }
    }, 1000);
  }

  getStatusLabel(): string {
    const s = this.latestApp()?.status?.toLowerCase() ?? '';
    const l = this.lang();
    const map: Record<string, Record<string, string>> = {
      submitted:      { ar: 'قيد المراجعة', en: 'Under Review' },
      'under-review': { ar: 'قيد المراجعة', en: 'Under Review' },
      approved:       { ar: 'معتمد — نشط', en: 'Approved — Active' },
      rejected:       { ar: 'مرفوض', en: 'Rejected' },
    };
    return map[s]?.[l] ?? s;
  }
}
