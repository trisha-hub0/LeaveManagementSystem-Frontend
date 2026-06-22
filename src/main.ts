import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
class AppComponent {}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));