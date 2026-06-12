import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MeResponse } from '../../../services/me.service';

@Component({
  selector: 'app-additional-info',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './additional-info.component.html',
  styleUrl: './additional-info.component.css',
})
export class AdditionalInfoComponent {
  @Input() me: MeResponse | null = null;
  @Input() loading = true;
}
