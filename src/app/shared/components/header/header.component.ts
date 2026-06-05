
import {
  Component, Output, EventEmitter, inject,
  signal, HostListener, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../services/document.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  readonly svc        = inject(DocumentService);
  private readonly el = inject(ElementRef);

  langOpen     = signal(false);
  userMenuOpen = signal(false);

  get lang()       { return this.svc.lang(); }
  get user()       { return this.svc.user; }
  get notifCount() { return this.svc.navItems.find(n => n.key === 'notifications')?.badge ?? 0; }

  toggleLang()     { this.langOpen.update(v => !v); this.userMenuOpen.set(false); }
  toggleUserMenu() { this.userMenuOpen.update(v => !v); this.langOpen.set(false); }
  selectLang(l: 'ar' | 'en') { this.svc.setLang(l); this.langOpen.set(false); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.langOpen.set(false);
      this.userMenuOpen.set(false);
    }
  }
}