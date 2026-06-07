import { Component, EventEmitter, Output } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  @Output() toggleMenue = new EventEmitter<boolean>();
  isMenueOpen = false;

  toggleNavigationMenue() {
    this.isMenueOpen = !this.isMenueOpen;
    this.toggleMenue.emit(this.isMenueOpen);
  }
}
