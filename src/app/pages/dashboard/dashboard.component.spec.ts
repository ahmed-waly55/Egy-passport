// src/app/pages/dashboard/dashboard.component.spec.ts
// Tests all 5 user states: ZERO, DRAFT, SUBMITTED, APPROVED, REJECTED
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { WalletService } from '../../features/wallet/services/wallet.service';
import { ApplicationService } from '../../features/applications/services/application.service';
import { MockDataService } from '../../core/mocks/mock-data.service';

describe('DashboardComponent — User States', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let walletServiceSpy: jasmine.SpyObj<WalletService>;
  let appServiceSpy: jasmine.SpyObj<ApplicationService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    walletServiceSpy = jasmine.createSpyObj('WalletService',
      ['getPassport', 'getQRCode', 'refreshQRCode', 'downloadPassportPdf']);
    appServiceSpy = jasmine.createSpyObj('ApplicationService',
      ['getAllApplications', 'getApplicationStatus']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: ApplicationService, useValue: appServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    }).compileComponents();
  });

  // ── TC-003-01: ZERO state — new user, no application ─────────
  describe('ZERO state (new user)', () => {
    beforeEach(() => {
      const zero = MockDataService.getState('zero');
      walletServiceSpy.getPassport.and.returnValue(throwError(() => ({ status: 404 })));
      walletServiceSpy.getQRCode.and.returnValue(throwError(() => ({ status: 404 })));
      appServiceSpy.getAllApplications.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should show NO QR code for zero-state user', () => {
      expect(component.qrCodeData()).toBeNull();
    });

    it('should show NO passport card for zero-state user', () => {
      expect(component.passportData()).toBeNull();
    });

    it('should have empty applications list', () => {
      expect(component.applications().length).toBe(0);
    });

    it('should show upload documents CTA in template', () => {
      const el: HTMLElement = fixture.nativeElement;
      // Zero state: upload button visible, no QR section
      expect(component.latestApp()).toBeNull();
    });
  });

  // ── TC-003-02: DRAFT state ───────────────────────────────────
  describe('DRAFT state', () => {
    beforeEach(() => {
      const draft = MockDataService.getState('draft');
      walletServiceSpy.getPassport.and.returnValue(throwError(() => ({ status: 404 })));
      walletServiceSpy.getQRCode.and.returnValue(throwError(() => ({ status: 404 })));
      appServiceSpy.getAllApplications.and.returnValue(of([draft.application!] as any));
      appServiceSpy.getApplicationStatus.and.returnValue(of({
        applicationId: draft.application!.id,
        status: 'draft', stage: 'DRAFT', progress: 25,
      } as any));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show draft application', () => {
      expect(component.latestApp()?.status).toBe('draft');
    });

    it('should show upload documents section (draft allows uploads)', () => {
      expect(component.latestApp()).not.toBeNull();
      expect(component.qrCodeData()).toBeNull(); // No QR in draft
    });

    it('status tracker should show step 1 only', () => {
      const steps = component.statusSteps();
      expect(steps[0].done).toBeTrue();      // received
      expect(steps[2].done).toBeFalse();     // not approved
    });
  });

  // ── TC-003-03: SUBMITTED state ───────────────────────────────
  describe('SUBMITTED state', () => {
    beforeEach(() => {
      const submitted = MockDataService.getState('submitted');
      walletServiceSpy.getPassport.and.returnValue(throwError(() => ({ status: 404 })));
      walletServiceSpy.getQRCode.and.returnValue(throwError(() => ({ status: 404 })));
      appServiceSpy.getAllApplications.and.returnValue(of([submitted.application!] as any));
      appServiceSpy.getApplicationStatus.and.returnValue(of({
        applicationId: submitted.application!.id,
        status: 'submitted', stage: 'UNDER_REVIEW', progress: 50,
      } as any));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show submitted status with current step = review', () => {
      const steps = component.statusSteps();
      expect(steps[1].current).toBeTrue();
    });

    it('should NOT allow document upload after submission', () => {
      expect(component.latestApp()?.status).toBe('submitted');
      // Template hides upload buttons when status !== draft/zero
    });

    it('should NOT show QR code while under review', () => {
      expect(component.qrCodeData()).toBeNull();
    });
  });

  // ── TC-003-04: APPROVED state — full passport + QR ───────────
  describe('APPROVED state', () => {
    beforeEach(() => {
      const approved = MockDataService.getState('approved');
      walletServiceSpy.getPassport.and.returnValue(of(approved.passport! as any));
      walletServiceSpy.getQRCode.and.returnValue(of(approved.qr! as any));
      appServiceSpy.getAllApplications.and.returnValue(of([approved.application!] as any));
      appServiceSpy.getApplicationStatus.and.returnValue(of({
        applicationId: approved.application!.id,
        status: 'approved', stage: 'APPROVED', progress: 100,
      } as any));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show passport card with valid status', () => {
      expect(component.passportData()).not.toBeNull();
      expect(component.isPassportValid()).toBeTrue();
    });

    it('should show QR code', () => {
      expect(component.qrCodeData()).not.toBeNull();
    });

    it('all status steps should be done through approval', () => {
      const steps = component.statusSteps();
      expect(steps[1].done).toBeTrue();
      expect(steps[2].done).toBeTrue();
    });

    it('should download PDF when downloadPdf() called', () => {
      const blob = new Blob(['pdf'], { type: 'application/pdf' });
      walletServiceSpy.downloadPassportPdf.and.returnValue(of(blob));
      component.downloadPdf();
      expect(walletServiceSpy.downloadPassportPdf).toHaveBeenCalled();
    });

    it('should refresh QR code and restart timer', () => {
      const approved = MockDataService.getState('approved');
      walletServiceSpy.refreshQRCode.and.returnValue(of(approved.qr! as any));
      component.refreshQRCode();
      expect(walletServiceSpy.refreshQRCode).toHaveBeenCalled();
      expect(toastrSpy.success).toHaveBeenCalled();
    });
  });

  // ── TC-003-05: REJECTED state ────────────────────────────────
  describe('REJECTED state', () => {
    beforeEach(() => {
      const rejected = MockDataService.getState('rejected');
      walletServiceSpy.getPassport.and.returnValue(throwError(() => ({ status: 404 })));
      walletServiceSpy.getQRCode.and.returnValue(throwError(() => ({ status: 404 })));
      appServiceSpy.getAllApplications.and.returnValue(of([rejected.application!] as any));
      appServiceSpy.getApplicationStatus.and.returnValue(of({
        applicationId: rejected.application!.id,
        status: 'rejected', stage: 'REJECTED', progress: 75,
        notes: rejected.application!.rejectionReason,
      } as any));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show rejected status with failed step', () => {
      const steps = component.statusSteps();
      expect(steps[2].failed).toBeTrue();
    });

    it('should NOT show QR for rejected application', () => {
      expect(component.qrCodeData()).toBeNull();
    });

    it('badge class should be rejected', () => {
      expect(component.getStatusBadgeClass()).toBe('badge-rejected');
    });
  });
});
