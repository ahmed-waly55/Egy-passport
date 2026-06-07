import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { FieldComponent } from '../../../shared/components/field/field.component';
import { CommonModule } from '@angular/common';
import { LangComponent } from "../../../shared/components/lang/lang.component";
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forget-password',
  imports: [BtnComponent, FieldComponent, ReactiveFormsModule, CommonModule, RouterLink, LangComponent],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {


  step: number = 1;

  constructor(private router: Router, private _authService: AuthService , private _toastr: ToastrService) {}

  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  otpForm = new FormGroup({
    otpCode: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
      Validators.pattern('^[0-8]*$')
    ])
  });

  get email() {
    return this.emailForm.controls.email;
  }

  get otpCode() {
    return this.otpForm.controls.otpCode;
  }

  sendOtp() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this._authService.forgotPassword(this.emailForm.value.email ?? '').subscribe({
      next: (response:any) => {
        console.log('OTP sent successfully:', response.data.message);
        this._toastr.success('OTP has been sent to your email.', 'Success');
        this.step = 2;
      },
      error: (err:any) => {
        this._toastr.error(`${err.error.messageAr || 'An error occurred while sending OTP.'}`, 'OTP Sending Failed');
        console.error('Error sending OTP:', err.error.message);
      }
    });
    console.log('Sending OTP to:', this.emailForm.value.email);

  }

  verifyOtp() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    console.log('Verifying OTP Code:', this.otpForm.value.otpCode);

  }

  resendOtp() {
    console.log('Resending OTP to:', this.emailForm.value.email);
  }


}
