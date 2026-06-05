import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DocumentService } from '../../../services/document.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],  //  .css not .scss
})
export class SidebarComponent {
  @Input() isOpen   = false;
  @Input() isMobile = false;  //  NEW: needed for correct CSS class

  readonly footerImage = '/images/egynav.png';
  readonly svc = inject(DocumentService);

  get lang()         { return this.svc.lang(); }
  get navItems()     { return this.svc.navItems; }
  get accountItems() { return this.svc.accountItems; }}