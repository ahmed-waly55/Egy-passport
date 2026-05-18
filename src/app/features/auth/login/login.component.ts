import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BtnComponent } from "../../../shared/components/btn/btn.component";
import { FieldComponent } from "../../../shared/components/field/field.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LangComponent } from "../../../shared/components/lang/lang.component";

@Component({
  selector: 'app-login',
  imports: [BtnComponent, FieldComponent, ReactiveFormsModule, CommonModule, RouterLink, LangComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {


  loginForm = new FormGroup({
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
    return this.loginForm.controls.emailOrPhone;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    console.log(this.loginForm.value);
  }
}





