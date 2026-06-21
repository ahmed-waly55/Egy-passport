import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MeService } from '../../../services/me.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css',
})
export class EditProfileComponent {
  private fb = inject(FormBuilder);
  private meService = inject(MeService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  loading = false;

  profileForm = this.fb.group({
    nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],

    governorate: ['', Validators.required],

    address: ['', [Validators.required, Validators.minLength(10)]],

    nationality: ['', Validators.required],

    placeOfBirth: ['', Validators.required],

    profilePhotoUrl: [''],
  });
  backendErrors: Record<string, string> = {};

  hasError(controlName: string, errorName: string): boolean {
    const control = this.profileForm.get(controlName);

    return !!(control && control.touched && control.hasError(errorName));
  }
  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.meService.getProfile().subscribe({
      next: (res) => {
        if (res.data) {
          this.profileForm.patchValue(res.data);
        }
      },
    });
  }

  submit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.backendErrors = {};

    this.meService
      .updateProfile(this.profileForm.getRawValue() as any)
      .subscribe({
        next: () => {
          this.loading = false;

          this.toastr.success('تم تحديث البيانات بنجاح');

          this.router.navigate(['/profile']);
        },

        error: (err) => {
          this.loading = false;

          if (err.error?.errors) {
            err.error.errors.forEach((e: any) => {
              this.backendErrors[
                e.field.charAt(0).toLowerCase() + e.field.slice(1)
              ] = e.messageEn;
            });
          }

          this.toastr.error('فشل تحديث البيانات');
        },
      });
  }
}
