// src/app/features/wallet/wallet.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { WalletComponent } from './wallet.component';
import { WalletService } from './services/wallet.service';
import { ApplicationService } from '../applications/services/application.service';
import { MockDataService } from '../../core/mocks/mock-data.service';

describe('WalletComponent (Digital ID)', () => {
  let component: WalletComponent;
  let fixture: ComponentFixture<WalletComponent>;
  let walletSpy: jasmine.SpyObj<WalletService>;
  let appSpy: jasmine.SpyObj<ApplicationService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    walletSpy = jasmine.createSpyObj('WalletService',
      ['getPassport', 'getQRCode', 'refreshQRCode', 'downloadPassportPdf']);
    appSpy = jasmine.createSpyObj('ApplicationService', ['getAllApplications']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [WalletComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        provideRouter([]), provideNoopAnimations(),
        { provide: WalletService, useValue: walletSpy },
        { provide: ApplicationService, useValue: appSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    }).compileComponents();
  });

  // ── TC-004-01: Approved user sees full wallet ────────────────
  describe('APPROVED user', () => {
    beforeEach(() => {
      const s = MockDataService.getState('approved');
      walletSpy.getPassport.and.returnValue(of(s.passport! as any));
      walletSpy.getQRCode.and.returnValue(of(s.qr! as any));
      appSpy.getAllApplications.and.returnValue(of([s.application!] as any));

      fixture = TestBed.createComponent(WalletComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => expect(component).toBeTruthy());

    it('should load passport data', () => {
      expect(component.passport()).not.toBeNull();
      expect(component.passport()!.number).toBeTruthy();
    });

    it('should show passport as valid', () => {
      expect(component.isPassportValid()).toBeTrue();
    });

    it('should load QR code', () => {
      expect(component.qrCode()).not.toBeNull();
    });

    // TC-004-03: tabs
    it('should switch tabs', () => {
      component.setTab('qr');
      expect(component.activeTab()).toBe('qr');
      component.setTab('details');
      expect(component.activeTab()).toBe('details');
      component.setTab('passport');
      expect(component.activeTab()).toBe('passport');
    });

    // TC-004-04: QR auto-refresh on expiry
    it('should refresh QR when timer expires', fakeAsync(() => {
      const s = MockDataService.getState('approved');
      // QR that expires in 2 seconds
      const expiringQr = { ...s.qr!, expiryDate: new Date(Date.now() + 2000).toISOString() };
      walletSpy.refreshQRCode.and.returnValue(of(s.qr! as any));

      (component as any).startQRTimer(expiringQr.expiryDate);
      tick(3000);
      expect(walletSpy.refreshQRCode).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should download PDF successfully', () => {
      const blob = new Blob(['x'], { type: 'application/pdf' });
      walletSpy.downloadPassportPdf.and.returnValue(of(blob));
      spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(URL, 'revokeObjectURL');
      component.downloadPdf();
      expect(walletSpy.downloadPassportPdf).toHaveBeenCalled();
      expect(toastrSpy.success).toHaveBeenCalled();
    });

    it('should show error toast if PDF download fails', () => {
      walletSpy.downloadPassportPdf.and.returnValue(throwError(() => ({ status: 404 })));
      component.downloadPdf();
      expect(toastrSpy.error).toHaveBeenCalled();
    });
  });

  // ── TC-004-02: Not-approved user ─────────────────────────────
  describe('NOT APPROVED user', () => {
    beforeEach(() => {
      const s = MockDataService.getState('submitted');
      walletSpy.getPassport.and.returnValue(throwError(() => ({ status: 404 })));
      walletSpy.getQRCode.and.returnValue(throwError(() => ({ status: 404 })));
      appSpy.getAllApplications.and.returnValue(of([s.application!] as any));

      fixture = TestBed.createComponent(WalletComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show error/status message instead of passport', () => {
      expect(component.passport()).toBeNull();
    });

    it('should NOT show QR', () => {
      expect(component.qrCode()).toBeNull();
    });

    it('status label should be under review', () => {
      expect(component.getStatusLabel()).toContain('قيد المراجعة');
    });
  });
});
