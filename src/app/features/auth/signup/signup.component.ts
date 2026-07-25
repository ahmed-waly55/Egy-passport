import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
  FormsModule,
} from "@angular/forms";
import { FieldComponent } from "../../../shared/components/field/field.component";
import { RouterLink, Router } from "@angular/router";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatStepperModule } from "@angular/material/stepper";
import { MatButtonModule } from "@angular/material/button";
import { AuthService } from "../../../services/auth.service";
import { ISignup } from "../../../core/models/iauth";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FieldComponent,
    RouterLink,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./signup.component.html",
  styleUrl: "./signup.component.css",
})
export class SignupComponent {
  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);
  constructor(
    private _authService: AuthService,
    private _toastr: ToastrService,
  ) {}

  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  selectedFiles: {
    file: File;
    preview: string | null;
  }[] = [];

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    Array.from(input.files).forEach((file) => {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
      ];

      if (!allowedTypes.includes(file.type)) {
        return;
      }

      const fileData = {
        file,
        preview: null as string | null,
      };

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          fileData.preview = reader.result as string;
        };
        reader.readAsDataURL(file);
      }

      this.selectedFiles.push(fileData);
    });

    this.documentsForm.patchValue({
      docUploaded: this.selectedFiles.length > 0,
    });
    this.documentsForm.controls.docUploaded.updateValueAndValidity();
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.documentsForm.patchValue({
      docUploaded: this.selectedFiles.length > 0,
    });
    this.documentsForm.controls.docUploaded.updateValueAndValidity();
  }

  activeLang = { code: "ar", name: "العربية", dir: "rtl" };

  // Step 1: Signup Details
  signupForm = new FormGroup(
    {
      fullName: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ]),
      nationalId: new FormControl("", [
        Validators.required,
        Validators.pattern(/^([1-9]{1})([0-9]{13})$/),
      ]),
      email: new FormControl("", [Validators.required, Validators.email]),
      mobileNumber: new FormControl("", [
        Validators.required,
        Validators.pattern(/^01[0125][0-9]{8}$/),
      ]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl("", [Validators.required]),
      termsAccepted: new FormControl(true, [Validators.requiredTrue]),
    },
    {
      validators: (group) => {
        const pass = group.get("password")?.value;
        const confirmPass = group.get("confirmPassword")?.value;
        return pass === confirmPass ? null : { notSame: true };
      },
    },
  );

  // Step 2: Personal Details
  personalForm = new FormGroup({
    address: new FormControl("", [Validators.required]),
    birthDate: new FormControl("", [Validators.required]),
    governorate: new FormControl("", [Validators.required]),
    nationality: new FormControl("", [Validators.required]),
    gender: new FormControl("", [Validators.required]),
  });

  // Step 3: Documents Upload
  documentsForm = this._formBuilder.group({
    docUploaded: [false, Validators.requiredTrue],
  });

  onSubmitAll() {
    const finalPayload = {
      accountAndDetails: this.signupForm.value,
      additionalPersonalInfo: this.personalForm.value,
      documents: this.selectedFiles.map((item) => item.file),
    };

    this._authService.register(finalPayload.accountAndDetails).subscribe({
      next: (response: ISignup) => {
        this._toastr.success("تم التسجيل بنجاح.", "نجاح");
        this._router.navigate(["/login"]);
      },
      error: (err) => {
        this._toastr.error("حدث خطأ أثناء التسجيل.", err.error?.messageAr);
      },
    });

    console.log("بيانات التسجيل النهائية:", finalPayload);
  }
}
