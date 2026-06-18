import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChatService } from '../../services/chat';
import { Auth } from '../../services/auth';

interface Message {
  username: string;
  message: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.html',
})
export class ChatComponent implements OnInit, OnDestroy {
  tripId!: number;
  currentUsername: string = '';
  newMessage: string = '';
  messages: Message[] = [];

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private authService: Auth,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.tripId = Number(this.route.snapshot.paramMap.get('id'));
    this.currentUsername = localStorage.getItem('username') || 'Anonymous';

    this.chatService.connect(this.tripId).subscribe({
      next: (msg: Message) => {
        this.messages.push(msg);
        
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('WebSocket Error:', err),
      complete: () => console.log('WebSocket connection closed')
    });
  }

  send(): void {
    if (!this.newMessage.trim()) return;

    this.chatService.sendMessage(this.currentUsername, this.newMessage);
    this.newMessage = ''; 
    this.cdr.detectChanges();

  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }
}