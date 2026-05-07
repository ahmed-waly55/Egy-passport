import { NgClass, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-field',
  imports: [NgClass],
  templateUrl: './field.component.html',
  styleUrl: './field.component.css'
})
export class FieldComponent {

 @Input() label: string = '';
  @Input({required: true}) placeholder: string = '';
  @Input() icon: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';

  @Output() valueChange = new EventEmitter<string>();

  showPassword: boolean = false;

  onInput(event: any): void {
    this.valueChange.emit(event.target.value);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

}
