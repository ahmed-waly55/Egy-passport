import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './field.component.html',
  styleUrl: './field.component.css'
})
export class FieldComponent {

@Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() icon: string = '';

  @Input({ required: true }) control!: FormControl;

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get errorMessage(): string | null {
    if (!this.control?.touched || !this.control?.errors) return null;

    const errors = this.control.errors;

    if (errors['required']) return 'هذا الحقل مطلوب';
    if (errors['email']) return 'البريد الإلكتروني غير صحيح';
    if (errors['minlength']) return `الحد الأدنى ${errors['minlength'].requiredLength} حروف`;
    if (errors['maxlength']) return `الحد الأقصى ${errors['maxlength'].requiredLength} حروف`;

    return 'حقل غير صالح';
  }

  get isInvalid(): boolean {
    return this.control.invalid && this.control.touched;
  }

  get isValid(): boolean {
    return this.control.valid && this.control.touched;
  }
}


// used component in app.component.html as <app-field> with inputs label, placeholder, type, icon and control.
// example usage in app.component.html:
// <app-field
//   label="الاسم"
//   placeholder="أدخل اسمك"
//   type="text"
//   icon="person"
//   [control]="name"
// ></app-field>

