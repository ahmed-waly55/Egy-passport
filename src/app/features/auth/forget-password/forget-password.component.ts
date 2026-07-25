import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { FieldComponent } from '../../../shared/components/field/field.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forget-password',
  imports: [
    BtnComponent,
    FieldComponent,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,

  ],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {

  step = 1;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  emailForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  otpForm = new FormGroup(
    {
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^01[0125][0-9]{8}$/)
      ]),

      otpCode: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern(/^[0-9]{6}$/)
      ]),

      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ]),

      confirmPassword: new FormControl('', [
        Validators.required
      ])
    },
    {
      validators: ForgetPasswordComponent.passwordMatchValidator
    }
  );

  static passwordMatchValidator(
    form: AbstractControl
  ): { passwordMismatch: boolean } | null {

    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  get email() {
    return this.emailForm.controls.email;
  }

  get phoneNumber() {
    return this.otpForm.controls.phoneNumber;
  }

  get otpCode() {
    return this.otpForm.controls.otpCode;
  }

  get newPassword() {
    return this.otpForm.controls.newPassword;
  }

  get confirmPassword() {
    return this.otpForm.controls.confirmPassword;
  }

  sendOtp() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.authService
      .forgotPassword(this.emailForm.value.email ?? '')
      .subscribe({
        next: (response: any) => {
          this.toastr.success(
            'OTP has been sent to your email.',
            'Success'
          );

          this.step = 2;
        },
        error: (err: any) => {
          this.toastr.error(
            err.error?.messageAr ||
              'An error occurred while sending OTP.',
            'OTP Sending Failed'
          );
        }
      });
  }

  verifyOtp() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    if (this.otpForm.hasError('passwordMismatch')) {
      this.toastr.error(
        'كلمتا المرور غير متطابقتين',
        'خطأ'
      );
      return;
    }

    const payload = {
      phoneNumber: this.phoneNumber.value,
      otpCode: this.otpCode.value,
      newPassword: this.newPassword.value,
      confirmPassword: this.confirmPassword.value
    };
    this.authService.resetPassword(payload).subscribe({
      next: (response: any) => {
        this.toastr.success(
          'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.',
          'نجاح'
        );
        this.router.navigate(['/auth/login']);
      },
      error: (err: any) => {
        this.toastr.error(
          err.error?.messageAr ||
            'حدث خطأ أثناء إعادة تعيين كلمة المرور.',
          'فشل إعادة تعيين كلمة المرور'
        );
      }
    });

    // this.authService.resetPassword(payload).subscribe(...)
  }

  resendOtp() {
    if (!this.email.value) return;

    this.sendOtp();
  }
}
