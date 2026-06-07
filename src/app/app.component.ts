import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './Components/Shared/sidebar/sidebar.component';
import { TopbarComponent } from './Components/Shared/topbar/topbar.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    TopbarComponent,
    ProfileComponent,
    SidebarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'egy-epassport';
  menuState: boolean = false;

  receive(menu: boolean) {
    this.menuState = menu;
    if (menu) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }
}
