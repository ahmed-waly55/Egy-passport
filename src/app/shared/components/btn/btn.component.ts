import { NgClass, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-btn',
  imports: [NgStyle,RouterLink],
  templateUrl: './btn.component.html',
  styleUrl: './btn.component.css'
})
export class BtnComponent {
 @Input({required: true}) label: string = 'تسجيل الدخول'; // default label in Arabic
  @Input() customColor: string = '#b3000e'; // default color (a shade of red)
  @Input() iconClass: string = 'fa-solid fa-arrow-left-long'; // default icon (Bootstrap Icons)

  @Input() width: string = '100%';  // default to full width
  @Input() route: string = '';  // optional route for navigation
  @Input() isDisabled: boolean = false; // to control button state
}
