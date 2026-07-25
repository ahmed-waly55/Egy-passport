// ═══════════════════════════════════════════════════════════════
// src/app/features/auth/login/login.component.spec.ts
// ═══════════════════════════════════════════════════════════════
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['login']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    }).compileComponents();
    
    TestBed.overrideProvider(AuthService, { useValue: authSpy });
    TestBed.overrideProvider(ToastrService, { useValue: toastrSpy });
    
    TestBed.overrideProvider(AuthService, { useValue: authSpy });
    TestBed.overrideProvider(ToastrService, { useValue: toastrSpy });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spyOn(localStorage, 'setItem');
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  // TC-002-01: successful login → /dashboard
  it('should redirect to /dashboard after successful login', () => {
    authSpy.login.and.returnValue(of({
      data: { userId: 'u-123', accessToken: 'jwt-token' }
    } as any));

    component.loginForm.setValue({ emailOrPhone: 'test@mail.com', password: '123456' });
    component.onSubmit();

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'jwt-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('userId', 'u-123');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);   // ← NOT /documents
    expect(toastrSpy.success).toHaveBeenCalled();
  });

  // TC-002-02: invalid credentials
  it('should show error toast on invalid credentials', () => {
    authSpy.login.and.returnValue(throwError(() => ({
      error: { messageAr: 'بيانات الدخول غير صحيحة' }
    })));
    component.loginForm.setValue({ emailOrPhone: 'wrong@mail.com', password: 'wrongpw' });
    component.onSubmit();
    expect(toastrSpy.error).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  // TC-002-03/04: empty fields blocked
  it('should block submit with empty fields', () => {
    component.loginForm.setValue({ emailOrPhone: '', password: '' });
    component.onSubmit();
    expect(authSpy.login).not.toHaveBeenCalled();
    expect(toastrSpy.warning).toHaveBeenCalled();
  });

  it('should require min 6 chars for password', () => {
    component.loginForm.setValue({ emailOrPhone: 'a@b.com', password: '123' });
    expect(component.password.invalid).toBeTrue();
  });
});


// ═══════════════════════════════════════════════════════════════
// src/app/features/auth/signup/signup.component.spec.ts
// ═══════════════════════════════════════════════════════════════
import { SignupComponent } from '../signup/signup.component';
import { fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HttpTestingController } from '@angular/common/http/testing';

describe('SignupComponent — Registration Flow', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['register']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        provideRouter([]), provideNoopAnimations(),
        { provide: AuthService, useValue: authSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => expect(component).toBeTruthy());

  // ── TC-001: Form validation ──────────────────────────────────
  describe('Step 1 validation', () => {
    it('should reject invalid national ID (not 14 digits)', () => {
      component.signupForm.controls.nationalId.setValue('12345');
      expect(component.signupForm.controls.nationalId.invalid).toBeTrue();
    });

    it('should accept valid 14-digit national ID', () => {
      component.signupForm.controls.nationalId.setValue('29901011234567');
      expect(component.signupForm.controls.nationalId.valid).toBeTrue();
    });

    it('should reject invalid Egyptian phone', () => {
      component.signupForm.controls.mobileNumber.setValue('0221234567');
      expect(component.signupForm.controls.mobileNumber.invalid).toBeTrue();
    });

    it('should accept valid Egyptian phone (010/011/012/015)', () => {
      component.signupForm.controls.mobileNumber.setValue('01012345678');
      expect(component.signupForm.controls.mobileNumber.valid).toBeTrue();
    });

    it('should reject mismatched passwords', () => {
      component.signupForm.patchValue({ password: 'pass123', confirmPassword: 'different' });
      expect(component.signupForm.errors?.['notSame']).toBeTruthy();
    });
  });

  // ── TC-001-06/07: OTP resend cooldown (2 min) ────────────────
  describe('OTP Resend — 2-minute cooldown', () => {
    it('resend should be BLOCKED during cooldown', fakeAsync(() => {
      component.startTimer();          // starts 5min OTP + 2min cooldown
      tick(1000);
      expect(component.resendCooldown).toBeGreaterThan(0);

      component.resendOtp();           // click before 2 min
      expect(toastrSpy.warning).toHaveBeenCalled();  // blocked with warning
      httpMock.expectNone(r => r.url.includes('/api/otp/resend'));
      discardPeriodicTasks();
    }));

    it('resend should WORK after 2-minute cooldown finishes', fakeAsync(() => {
      component.signupForm.controls.mobileNumber.setValue('01012345678');
      component.startTimer();
      tick(121_000);                   // wait full 2 minutes
      expect(component.resendCooldown).toBe(0);

      component.resendOtp();
      const req = httpMock.expectOne(r => r.url.includes('/api/otp/resend'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body.phone).toBe('01012345678');
      req.flush({ success: true });

      // After successful resend: timer resets + new cooldown starts
      expect(component.timer).toBe(300);
      expect(component.resendCooldown).toBe(120);
      expect(component.resendCount).toBe(1);
      discardPeriodicTasks();
    }));

    it('should enforce max 3 resends', fakeAsync(() => {
      component.resendCount = 3;
      component.resendCooldown = 0;
      component.resendOtp();
      expect(toastrSpy.error).toHaveBeenCalled();
      httpMock.expectNone(r => r.url.includes('/api/otp/resend'));
      discardPeriodicTasks();
    }));
  });

  // ── TC-001-08: Change phone → Step 1 ─────────────────────────
  describe('Change phone number', () => {
    it('goToPhoneStep() should reset stepper to index 0', () => {
      component.stepper = { selectedIndex: 3 } as any;
      component.goToPhoneStep();
      expect(component.stepper.selectedIndex).toBe(0);   // ← Step 1, not previous
    });

    it('should clear OTP form when changing phone', () => {
      component.otpForm.controls.otp.setValue('123456');
      component.stepper = { selectedIndex: 3 } as any;
      component.goToPhoneStep();
      expect(component.otpForm.value.otp).toBeFalsy();
    });
  });

  // ── TC-001: Registration submit → /dashboard ─────────────────
  describe('Final submission', () => {
    it('should redirect to /dashboard after successful registration', () => {
      authSpy.register.and.returnValue(of({ token: 'jwt', user: { id: 'u-1' } } as any));
      spyOn(localStorage, 'setItem');
      spyOn(localStorage, 'removeItem');

      component.otpForm.controls.otp.setValue('123456');
      component.onSubmitAll();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);  // ← dashboard!
      expect(localStorage.removeItem).toHaveBeenCalledWith('egy_signup_docs');
    });

    it('should block submit if OTP invalid', () => {
      component.otpForm.controls.otp.setValue('12');    // too short
      component.onSubmitAll();
      expect(authSpy.register).not.toHaveBeenCalled();
    });
  });

  // ── TC-001: Document upload with localStorage ────────────────
  describe('Document upload persistence', () => {
    it('should save previews to localStorage on file select', () => {
      spyOn(localStorage, 'setItem');
      const file = new File(['x'], 'id.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as unknown as Event;
      component.onFilesSelected(event);
      expect(component.selectedFiles.length).toBe(1);
    });

    it('should reject disallowed file types', () => {
      const file = new File(['x'], 'malware.exe', { type: 'application/x-msdownload' });
      const event = { target: { files: [file] } } as unknown as Event;
      component.onFilesSelected(event);
      expect(component.selectedFiles.length).toBe(0);
    });

    it('should update form validity when all files removed', () => {
      const file = new File(['x'], 'id.png', { type: 'image/png' });
      component.selectedFiles = [{ file, preview: null }];
      component.removeFile(0);
      expect(component.documentsForm.controls.docUploaded.value).toBeFalse();
    });
  });
});
