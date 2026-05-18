import { Component } from '@angular/core';
import { FieldComponent } from '../../../shared/components/field/field.component';
import { BtnComponent } from "../../../shared/components/btn/btn.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [FieldComponent, BtnComponent,ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

   SignUpForms = new FormGroup({
    emailOrPhone: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  get emailOrPhone() {
    return this.SignUpForms.controls.emailOrPhone;
  }

  get password() {
    return this.SignUpForms.controls.password;
  }

  onSubmit() {
    if (this.SignUpForms.invalid) {
      this.SignUpForms.markAllAsTouched();
      return;
    }

    console.log(this.SignUpForms.value);
  }


}
