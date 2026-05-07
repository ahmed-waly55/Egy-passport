import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BtnComponent } from './shared/components/btn/btn.component';

@Component({
  selector: 'app-root',
  imports: [BtnComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Egy-passport';
}
