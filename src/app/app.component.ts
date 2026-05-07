import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BtnComponent } from './shared/components/btn/btn.component';
import { FieldComponent } from "./shared/components/field/field.component";

@Component({
  selector: 'app-root',
  imports: [BtnComponent, FieldComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Egy-passport';
}
