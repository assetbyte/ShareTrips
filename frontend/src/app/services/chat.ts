import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket$!: WebSocketSubject<any>;

  connect(tripId: number): Observable<any> {
    if (this.socket$ && !this.socket$.closed) {
      this.disconnect();
    }

    const url = `ws://localhost:8000/ws/chat/${tripId}/`;
    
    this.socket$ = webSocket({
      url: url,
      deserializer: (msg) => JSON.parse(msg.data) 
    });
    
    return this.socket$.asObservable();
  }

  sendMessage(username: string, message: string): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next({
        username: username,
        message: message.trim() 
      });
    } else {
      console.error('Cannot send message. WS is closed.');
    }
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}