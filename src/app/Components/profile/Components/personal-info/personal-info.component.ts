import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MeResponse, ProfileResponse } from '../../../../Services/me.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css',
})
export class PersonalInfoComponent {
  @Input() me: MeResponse | null = null;
  @Input() profile: ProfileResponse | null = null;
  @Input() loading = true;
}
