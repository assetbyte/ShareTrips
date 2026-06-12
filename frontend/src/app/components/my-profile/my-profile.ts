import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Импортируем CDR
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-my-profile',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss',
})
export class MyProfile implements OnInit {
  profileData: any = null;
  loading: boolean = true;
  errorMessage: string = '';

  
  constructor(
    private http: HttpClient, 
    private authService: Auth,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage = 'Log in into account';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });

    this.http.get('http://localhost:8000/api/auth/profile/', { headers }).subscribe({
      next: (data) => {
        this.profileData = data;
        this.loading = false;
        console.log('Success', this.profileData);
        

        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error', err);
        this.errorMessage = 'Cannot load profile data';
        this.loading = false;
        

        this.cdr.detectChanges(); 
      }
    });
  }

  onAvatarChange(event: any): void {
  const file = event.target.files[0];
  if (!file) return;

  const token = this.authService.getToken();
  if (!token) return;


  const formData = new FormData();
  formData.append('avatar', file, file.name);

  const headers = new HttpHeaders({
    'Authorization': `Token ${token}`
  });

  this.http.patch('http://localhost:8000/api/auth/profile/', formData, { headers }).subscribe({
    next: (updatedData: any) => {
      alert('Avatar updated successfully!');
      
      this.profileData.profile.avatar = updatedData.avatar;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Failed to upload avatar', err);
      alert('Error updating avatar');
    }
  });
}
}


