import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; 
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  constructor(public authService: Auth) {}

  onLogout(): void {
    this.authService.logout();
    window.location.reload();
  }

  get username(): string {
    return localStorage.getItem('username') || 'User';
  }
}