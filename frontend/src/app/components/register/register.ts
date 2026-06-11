import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink} from '@angular/router';
import { Auth } from '../../services/auth';
import { RegistrationData } from '../../models/user.model';
@Component({
  selector: 'app-register',
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

  constructor (private authService: Auth, private router: Router)
  {}

  onRegister(): void {
    this.authService.register(this.registrationData).subscribe({
      next: (data) => {
        alert('Registered succesfully');
        this.router.navigate(['/login']);
        this.registrationData = {
            username: '',
            email: '',
            password: '',
            name: '',
            last_name: '',
            phone: '',
            bio: ''
            // очищаю форму
        };
      },

      error: (err) => {
        alert("Something went wrong while registration!")
      }
    })
  }
 

  
}
