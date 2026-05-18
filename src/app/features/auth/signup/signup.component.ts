import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldComponent } from '../../../shared/components/field/field.component';
import { BtnComponent } from "../../../shared/components/btn/btn.component";
import { LangComponent } from "../../../shared/components/lang/lang.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FieldComponent,
    BtnComponent,
    LangComponent,
    RouterLink
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  activeLang = { code: 'ar', name: 'العربية', dir: 'rtl' };

  signupForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    nationalId: new FormControl('', [
      Validators.required,
      Validators.pattern(/^([1-9]{1})([0-9]{13})$/)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^01[0125][0-9]{8}$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    confirmPassword: new FormControl('', [
      Validators.required
    ]),
    agreeToTerms: new FormControl(false, [
      Validators.requiredTrue
    ])
  }, {

    validators: (group) => {
      const pass = group.get('password')?.value;
      const confirmPass = group.get('confirmPassword')?.value;
      return pass === confirmPass ? null : { notSame: true };
    }
  });

  get fullName() { return this.signupForm.controls.fullName; }
  get nationalId() { return this.signupForm.controls.nationalId; }
  get email() { return this.signupForm.controls.email; }
  get phone() { return this.signupForm.controls.phone; }
  get password() { return this.signupForm.controls.password; }
  get confirmPassword() { return this.signupForm.controls.confirmPassword; }
  get agreeToTerms() { return this.signupForm.controls.agreeToTerms; }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    console.log('بيانات الحساب الجديد:', this.signupForm.value);
  }
}
