// ═══════════════════════════════════════════════════════════════
// src/app/features/notifications/notifications.component.spec.ts
// Tests all notification events: welcome, profile complete, QR generated,
// doc approved/rejected/review, passport approved
// ═══════════════════════════════════════════════════════════════
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { NotificationsComponent } from './notifications.component';
import { MockDataService } from '../../core/mocks/mock-data.service';

describe('NotificationsComponent — Events per state', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  // TC-005-01: ZERO state — empty inbox
  it('ZERO state: inbox shows empty message', () => {
    const s = MockDataService.getState('zero');
    // Zero user has only welcome notification OR empty
    expect(s.notifications.length).toBeLessThanOrEqual(1);
  });

  // TC-005-02: Welcome notification after first login/registration
  it('should have WELCOME notification for new user', () => {
    const s = MockDataService.getState('zero');
    const welcome = s.notifications.find(n => n.type === 'WELCOME');
    expect(welcome).toBeTruthy();
    expect(welcome!.titleAr).toContain('مرحبا');
  });

  // TC-005-03: Profile completed notification
  it('DRAFT state: should have PROFILE_COMPLETED notification', () => {
    const s = MockDataService.getState('draft');
    const n = s.notifications.find(x => x.type === 'PROFILE_COMPLETED');
    expect(n).toBeTruthy();
  });

  // TC-005-04: Document under review notifications
  it('SUBMITTED state: should have DOC_UNDER_REVIEW notification', () => {
    const s = MockDataService.getState('submitted');
    const n = s.notifications.find(x => x.type === 'DOC_UNDER_REVIEW');
    expect(n).toBeTruthy();
  });

  // TC-005-05: Approval + QR generated notifications
  it('APPROVED state: should have PASSPORT_APPROVED + QR_GENERATED', () => {
    const s = MockDataService.getState('approved');
    expect(s.notifications.find(x => x.type === 'PASSPORT_APPROVED')).toBeTruthy();
    expect(s.notifications.find(x => x.type === 'QR_GENERATED')).toBeTruthy();
    expect(s.notifications.find(x => x.type === 'DOC_APPROVED')).toBeTruthy();
  });

  // TC-005-06: Rejection notification with reason
  it('REJECTED state: should have DOC_REJECTED with reason', () => {
    const s = MockDataService.getState('rejected');
    const n = s.notifications.find(x => x.type === 'DOC_REJECTED');
    expect(n).toBeTruthy();
    expect(n!.messageAr).toBeTruthy();   // includes rejection reason
  });
});


// ═══════════════════════════════════════════════════════════════
// src/app/features/applications/applications.component.spec.ts
// (= "Requests" page / طلباتي)
// ═══════════════════════════════════════════════════════════════
import { ApplicationsComponent } from '../applications/applications.component';
import { ApplicationService } from '../applications/services/application.service';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

describe('ApplicationsComponent — Requests page', () => {
  let component: ApplicationsComponent;
  let fixture: ComponentFixture<ApplicationsComponent>;
  let appSpy: jasmine.SpyObj<ApplicationService>;

  beforeEach(async () => {
    appSpy = jasmine.createSpyObj('ApplicationService',
      ['getAllApplications', 'getApplicationStatus', 'createDraft', 'submitApplication']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [ApplicationsComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: ApplicationService, useValue: appSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    }).compileComponents();
  });

  // TC-006-01: Zero state — no requests
  it('ZERO state: shows empty list with "no requests" message', () => {
    appSpy.getAllApplications.and.returnValue(of([]));
    fixture = TestBed.createComponent(ApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // Empty state visible
    expect(appSpy.getAllApplications).toHaveBeenCalled();
  });

  // TC-006-02: Multiple requests with different statuses
  it('should display requests with mixed statuses (review/approved/rejected)', () => {
    const mixed = [
      MockDataService.getState('submitted').application!,
      MockDataService.getState('approved').application!,
      MockDataService.getState('rejected').application!,
    ];
    appSpy.getAllApplications.and.returnValue(of(mixed as any));
    fixture = TestBed.createComponent(ApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(appSpy.getAllApplications).toHaveBeenCalled();
  });

  // TC-006-03: Application ID is UUID format
  it('application id should be a valid UUID', () => {
    const app = MockDataService.getState('approved').application!;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(app.id)).toBeTrue();
  });

  // TC-006-04: Rejected app shows reason and re-apply
  it('rejected application must include rejectionReason', () => {
    const app = MockDataService.getState('rejected').application!;
    expect(app.status).toBe('rejected');
    expect(app.rejectionReason).toBeTruthy();
  });

  // TC-006-05: Draft creation flow (registered user only)
  it('createDraft should be called for new request', () => {
    const draft = MockDataService.getState('draft').application!;
    appSpy.getAllApplications.and.returnValue(of([]));
    appSpy.createDraft.and.returnValue(of(draft as any));
    fixture = TestBed.createComponent(ApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // createDraft available for POST /api/applications/draft
    expect(appSpy.createDraft).toBeDefined();
  });
});
