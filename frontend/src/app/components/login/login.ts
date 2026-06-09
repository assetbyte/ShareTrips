import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginCredentials = {
    username: '',
    password: ''
  };

  constructor(private authService: Auth, private router: Router) {}

  onLogin(): void {
    if (!this.loginCredentials.username || !this.loginCredentials.password) return;

    this.authService.login(this.loginCredentials).subscribe({
      next: (res) => {
        this.router.navigate(['/reviews']).then(() => {
          window.location.reload(); 
        });
      },
      error: (err) => {
        alert('Invalid credentials');
      }
    });
  }
}
