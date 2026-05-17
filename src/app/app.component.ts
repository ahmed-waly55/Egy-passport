import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { LoginComponent } from "./features/auth/login/login.component";

@Component({
  selector: 'app-root',
  imports: [ LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Egy-passport';

}
