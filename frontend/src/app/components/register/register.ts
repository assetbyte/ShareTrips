import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { RegistrationData } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registrationData: RegistrationData = {
    username: '',
    email: '',
    password: '',
    name: '',
    last_name: '',
    phone: '',
    bio: ''
  };

  selectedFile: File | null = null;
  selectedFileName: string = '';

  constructor(private authService: Auth, private router: Router) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  onRegister(): void {
    const formData = new FormData();

    formData.append('username', this.registrationData.username);
    formData.append('email', this.registrationData.email);
    formData.append('password', this.registrationData.password);
    formData.append('name', this.registrationData.name);
    formData.append('last_name', this.registrationData.last_name);
    formData.append('phone', this.registrationData.phone);
    
    if (this.registrationData.bio) {
      formData.append('bio', this.registrationData.bio);
    }

    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile, this.selectedFile.name);
    }
    this.authService.register(formData).subscribe({
      next: (data) => {
        alert('Registered successfully');
        this.router.navigate(['/login']);
        

        this.registrationData = {
          username: '', email: '', password: '',
          name: '', last_name: '', phone: '', bio: ''
        };
        this.selectedFile = null;
        this.selectedFileName = '';
      },
      error: (err) => {
        console.error(err);
        alert("Something went wrong while registration!");
      }
    });
  }
}