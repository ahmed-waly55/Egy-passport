import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormBuilder, FormsModule } from '@angular/forms';
import { FieldComponent } from '../../../shared/components/field/field.component';
import { LangComponent } from "../../../shared/components/lang/lang.component";
import { RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FieldComponent,
    LangComponent,
    RouterLink,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnDestroy {
  private _formBuilder = inject(FormBuilder);


selectedFile: File | null = null;
selectedFilePreview: string | null = null;
selectedFiles: {
  file: File;
  preview: string | null;
}[] = [];


onFilesSelected(event: Event): void {

  const input = event.target as HTMLInputElement;

  if (!input.files?.length) return;

  Array.from(input.files).forEach(file => {

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      return;
    }

    const fileData = {
      file,
      preview: null as string | null
    };

    // Image preview
    if (file.type.startsWith('image/')) {

      const reader = new FileReader();

      reader.onload = () => {
        fileData.preview = reader.result as string;
      };

      reader.readAsDataURL(file);
    }

    this.selectedFiles.push(fileData);
  });

  // validate form
  this.documentsForm.patchValue({
    docUploaded: this.selectedFiles.length > 0
  });

  this.documentsForm.controls.docUploaded.updateValueAndValidity();
}

removeFile(index: number): void {

  this.selectedFiles.splice(index, 1);

  this.documentsForm.patchValue({
    docUploaded: this.selectedFiles.length > 0
  });

  this.documentsForm.controls.docUploaded.updateValueAndValidity();
}
  activeLang = { code: 'ar', name: 'العربية', dir: 'rtl' };

  timer: number = 272;
  timerInterval: any;
  timerText: string = '04:32';

// step 1 => account details and personal info
  signupForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    nationalId: new FormControl('', [Validators.required, Validators.pattern(/^([1-9]{1})([0-9]{13})$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    agreeToTerms: new FormControl(false, [Validators.requiredTrue])
  }, {
    validators: (group) => {
      const pass = group.get('password')?.value;
      const confirmPass = group.get('confirmPassword')?.value;
      return pass === confirmPass ? null : { notSame: true };
    }
  });


  // step 2 => address field only for now, can be expanded later to include more personal info if needed
  personalForm = new FormGroup({
    address: new FormControl('', [Validators.required]),
    birthDate:new FormControl('', [Validators.required]),
    governorate: new FormControl('', [Validators.required]),
    nationality: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required])
  });



// step 3 => document upload status, can be expanded later to include actual file uploads if needed
  documentsForm = this._formBuilder.group({
    docUploaded: [false, Validators.requiredTrue]
  });


otpForm = new FormGroup({
  otp: new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(6)
  ])
});

  simulateUpload() {
    this.documentsForm.controls.docUploaded.setValue(true);
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        const mins = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const secs = (this.timer % 60).toString().padStart(2, '0');
        this.timerText = `${mins}:${secs}`;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  onSubmitAll() {
   const finalPayload = {
  accountAndDetails: this.signupForm.value,
  additionalPersonalInfo: this.personalForm.value,
  documents: this.selectedFiles.map(item => item.file),
  otpVerification: this.otpForm.value
};

console.log(finalPayload);
    console.log('إرسال كامل ملف التسجيل الموحد للمنصة:', finalPayload);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
