import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-my-profile',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss',
})
export class MyProfile implements OnInit {
  userId: number | null = null; 
  profileData: any = null; 
  loading: boolean = true;
  errorMessage: string = '';
  isMe: boolean = false;

  constructor(
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const paramId = this.route.snapshot.paramMap.get('id'); 
    const currentUserId = this.authService.getCurrentUserId();

    if (paramId) {
      this.userId =+paramId; 
      this.isMe = (this.userId === currentUserId);
    } else {
      this.userId = currentUserId;
      this.isMe = true;
    }

    if (this.userId !== null) {
      
      this.authService.getUserProfile(this.userId).subscribe({
        next: (data: any) => { 
          this.profileData = data; 
          this.loading = false;    
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error fetching user profile info:', err);
          this.errorMessage = 'Cannot load profile data';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.errorMessage = 'User not found. Please log in.';
      this.loading = false;
      this.cdr.detectChanges();
    }
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


    this.http.patch(`http://localhost:8000/api/auth/profile/${this.userId}/`, formData, { headers }).subscribe({
      next: (updatedData: any) => {
        alert('Avatar updated successfully!');
        if (this.profileData && this.profileData.profile) {
          this.profileData.profile.avatar = updatedData.avatar;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to upload avatar', err);
        alert('Error updating avatar');
      }
    });
  }
}