import { Component, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { BtnComponent } from "../../../shared/components/btn/btn.component";
import { FieldComponent } from "../../../shared/components/field/field.component";
import { AuthService } from "../../../services/auth.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    BtnComponent,
    FieldComponent,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  // --- Services Injection ---
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _toastr = inject(ToastrService);

  // --- Form Initialization ---
  loginForm = new FormGroup({
    emailOrPhone: new FormControl("", [
      Validators.required,
      // Removed Validators.email to allow entering mobile phone numbers smoothly
    ]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  // --- Getters for Form Controls ---
  get emailOrPhone() {
    return this.loginForm.controls.emailOrPhone;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  // --- Form Submission ---
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this._toastr.warning(
        "Please fill in all required fields correctly.",
        "Validation Warning",
      );
      return;
    }

    const emailOrMobile = this.loginForm.value.emailOrPhone ?? "";
    const password = this.loginForm.value.password ?? "";

    this._authService.login(emailOrMobile, password).subscribe({
      next: (response: any) => {
        this._toastr.success("Welcome back! Login successful.", "Success");
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("token", response.data.accessToken);
        this._router.navigate(["/dashboard"]);
      },
      error: (err: any) => {
        this._toastr.error(
          `${err.error.messageAr || "An error occurred during login."}`,
          "Authentication Failed",
        );
      },
    });
  }
}
