import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MeResponse, ProfileResponse } from '../../../../Services/me.service';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.css',
})
export class ProfileHeaderComponent {
  @Input() me: MeResponse | null = null;
  @Input() profile: ProfileResponse | null = null;
  @Input() loading = true;
}
