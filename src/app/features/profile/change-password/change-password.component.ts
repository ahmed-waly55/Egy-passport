import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

function passwordsMatch(group: AbstractControl) {
  const newPwd = group.get('newPassword')?.value;
  const confirmPwd = group.get('confirmPassword')?.value;
  return newPwd === confirmPwd ? null : { mismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loading = false;
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  form = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  // Shortcuts for template
  get cur() {
    return this.form.get('currentPassword')!;
  }
  get nw() {
    return this.form.get('newPassword')!;
  }
  get conf() {
    return this.form.get('confirmPassword')!;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { currentPassword, newPassword, confirmPassword } = this.form.value;

    this.auth
      .changePassword(currentPassword!, newPassword!, confirmPassword!)
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.success('تم تغيير كلمة المرور بنجاح', 'نجاح');
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          this.loading = false;
          const msg = err?.error?.message ?? 'حدث خطأ، حاول مرة أخرى';
          this.toastr.error(msg, 'خطأ');
        },
      });
  }
}
