// src/app/features/auth/signup/signup.component.ts
// FIXES:
// 1. OTP resend calls /api/otp/resend
// 2. Resend cooldown = 2 minutes (120s), counter resets ONLY after 2 mins
// 3. "Change phone" goes to Step 1 (not previous step)
// 4. After successful registration → redirect to /dashboard
// 5. Documents upload uses localStorage for persistence
import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormBuilder, FormsModule } from '@angular/forms';
import { FieldComponent } from '../../../shared/components/field/field.component';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, FieldComponent,
    RouterLink, MatButtonModule, MatStepperModule, MatFormFieldModule, MatInputModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnDestroy {
  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _http = inject(HttpClient);

  // ViewChild to control stepper programmatically
  @ViewChild('stepper') stepper!: MatStepper;

  constructor(private _authService: AuthService, private _toastr: ToastrService) {}

  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  selectedFiles: { file: File; preview: string | null }[] = [];

  activeLang = { code: 'ar', name: 'العربية', dir: 'rtl' };

  // ── OTP Timer: 5 minutes validity ────────────────────────
  timer: number = 300;       // 5 min OTP validity
  timerInterval: any;
  timerText: string = '05:00';

  // ── Resend Cooldown: 2 minutes ───────────────────────────
  resendCooldown: number = 0;  // seconds remaining before resend allowed
  resendCooldownInterval: any;
  resendCooldownText: string = '';
  resendCount: number = 0;
  maxResend: number = 3;

  // ── Loading states ───────────────────────────────────────
  isSubmitting = false;
  isResending = false;

  // ── Step 1: Account Details ──────────────────────────────
  signupForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    nationalId: new FormControl('', [Validators.required, Validators.pattern(/^([1-9]{1})([0-9]{13})$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    mobileNumber: new FormControl('', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    termsAccepted: new FormControl(true, [Validators.requiredTrue])
  }, {
    validators: (group) => {
      const pass = group.get('password')?.value;
      const confirmPass = group.get('confirmPassword')?.value;
      return pass === confirmPass ? null : { notSame: true };
    }
  });

  // ── Step 2: Personal Info ────────────────────────────────
  personalForm = new FormGroup({
    address: new FormControl('', [Validators.required]),
    birthDate: new FormControl('', [Validators.required]),
    governorate: new FormControl('', [Validators.required]),
    nationality: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required])
  });

  // ── Step 3: Documents ────────────────────────────────────
  documentsForm = this._formBuilder.group({
    docUploaded: [false, Validators.requiredTrue]
  });

  // ── Step 4: OTP ──────────────────────────────────────────
  otpForm = new FormGroup({
    otp: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
  });

  // ── File Upload ──────────────────────────────────────────
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    Array.from(input.files).forEach(file => {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) return;

      const fileData = { file, preview: null as string | null };
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          fileData.preview = reader.result as string;
          // Save preview to localStorage for persistence
          this.saveFilesToLocalStorage();
        };
        reader.readAsDataURL(file);
      }
      this.selectedFiles.push(fileData);
    });

    this.documentsForm.patchValue({ docUploaded: this.selectedFiles.length > 0 });
    this.documentsForm.controls.docUploaded.updateValueAndValidity();
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.documentsForm.patchValue({ docUploaded: this.selectedFiles.length > 0 });
    this.documentsForm.controls.docUploaded.updateValueAndValidity();
    this.saveFilesToLocalStorage();
  }

  // Persist file previews to localStorage
  private saveFilesToLocalStorage(): void {
    const previews = this.selectedFiles.map(f => ({
      name: f.file.name,
      type: f.file.type,
      size: f.file.size,
      preview: f.preview
    }));
    localStorage.setItem('egy_signup_docs', JSON.stringify(previews));
  }

  // Restore file previews from localStorage (call in ngOnInit if needed)
  private loadFilesFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('egy_signup_docs');
      if (stored) {
        const previews = JSON.parse(stored);
        // Note: actual File objects can't be stored in localStorage,
        // only previews. Files must be re-selected for upload.
      }
    } catch {}
  }

  // ── OTP Timer (5 min validity) ───────────────────────────
  startTimer(): void {
    this.timer = 300; // Reset to 5 minutes
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        const mins = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const secs = (this.timer % 60).toString().padStart(2, '0');
        this.timerText = `${mins}:${secs}`;
      } else {
        clearInterval(this.timerInterval);
        this.timerText = '00:00';
      }
    }, 1000);

    // Start 2-minute resend cooldown
    this.startResendCooldown();
  }

  // ── Resend Cooldown (2 minutes) ──────────────────────────
  private startResendCooldown(): void {
    this.resendCooldown = 120; // 2 minutes
    if (this.resendCooldownInterval) clearInterval(this.resendCooldownInterval);

    this.resendCooldownInterval = setInterval(() => {
      if (this.resendCooldown > 0) {
        this.resendCooldown--;
        const mins = Math.floor(this.resendCooldown / 60).toString().padStart(2, '0');
        const secs = (this.resendCooldown % 60).toString().padStart(2, '0');
        this.resendCooldownText = `${mins}:${secs}`;
      } else {
        clearInterval(this.resendCooldownInterval);
        this.resendCooldownText = '';
      }
    }, 1000);
  }

  // Resend OTP — calls /api/otp/resend, resets timer ONLY if cooldown is 0
  resendOtp(): void {
    // Block if cooldown hasn't finished
    if (this.resendCooldown > 0) {
      this._toastr.warning(`يرجى الانتظار ${this.resendCooldownText} قبل إعادة الإرسال`, 'انتظر');
      return;
    }

    // Block if max resends reached
    if (this.resendCount >= this.maxResend) {
      this._toastr.error('تجاوزت الحد الأقصى لإعادة الإرسال.', 'فشل');
      return;
    }

    this.isResending = true;
    const phone = this.signupForm.value.mobileNumber ?? '';

    // Call /api/otp/resend
    this._http.post(`${environment.baseApiUrl}/api/otp/resend`, { phone })
      .subscribe({
        next: () => {
          this.resendCount++;
          this._toastr.success('تم إعادة إرسال الرمز بنجاح.', 'نجاح');

          // Reset OTP timer to 5 minutes
          this.timer = 300;
          this.otpForm.reset();

          // Start new 2-minute resend cooldown
          this.startResendCooldown();
          this.isResending = false;
        },
        error: (err) => {
          this._toastr.error(err.error?.messageAr || 'فشل إعادة إرسال الرمز.', 'خطأ');
          this.isResending = false;
        }
      });
  }

  // Change phone number → go to Step 1 (not previous step)
  goToPhoneStep(): void {
    // Reset stepper to step 0 (first step where phone is entered)
    if (this.stepper) {
      this.stepper.selectedIndex = 0;
    }
    // Clear OTP
    this.otpForm.reset();
    this.timer = 0;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerText = '00:00';
  }

  // ── Final Submit ─────────────────────────────────────────
  onSubmitAll(): void {
    if (this.otpForm.invalid) {
      this._toastr.warning('يرجى إدخال رمز التحقق.', 'تنبيه');
      return;
    }

    this.isSubmitting = true;

    const finalPayload = {
      accountAndDetails: this.signupForm.value,
      additionalPersonalInfo: this.personalForm.value,
      documents: this.selectedFiles.map(item => item.file),
      otpVerification: this.otpForm.value
    };

    this._authService.register(finalPayload.accountAndDetails).subscribe({
      next: (response: any) => {
        this._toastr.success('تم التسجيل بنجاح! مرحباً بك.', 'نجاح');

        // Store token if returned
        if (response?.token) {
          localStorage.setItem('token', response.token);
        }
        if (response?.user?.id) {
          localStorage.setItem('userId', response.user.id);
        }

        // Clean up localStorage docs
        localStorage.removeItem('egy_signup_docs');

        // FIX: Redirect to dashboard after registration
        this._router.navigate(['/dashboard']);
        this.isSubmitting = false;
      },
      error: (err) => {
        this._toastr.error(err.error?.messageAr || 'حدث خطأ أثناء التسجيل.', 'فشل');
        this.isSubmitting = false;
      }
    });
  }

  simulateUpload() {
    this.documentsForm.controls.docUploaded.setValue(true);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.resendCooldownInterval) clearInterval(this.resendCooldownInterval);
  }
}
