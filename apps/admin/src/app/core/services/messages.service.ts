import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message, MessageStats, MessageStatus, ReplyMessageDto } from '../models/message.model';
import { PaginatedResult, PaginationQuery } from '../models/pagination.model';

export interface MessageQuery extends PaginationQuery {
  status?: MessageStatus;
}

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/messages`;

  getMessages(query: MessageQuery): Observable<PaginatedResult<Message>> {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('limit', query.limit.toString());

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.http.get<PaginatedResult<Message>>(this.apiUrl, { params });
  }

  getMessage(id: string): Observable<Message> {
    return this.http.get<Message>(`${this.apiUrl}/${id}`);
  }

  markAsRead(id: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/${id}/read`, {});
  }

  replyToMessage(id: string, dto: ReplyMessageDto): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/${id}/reply`, dto);
  }

  deleteMessage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<MessageStats> {
    return this.http.get<MessageStats>(`${this.apiUrl}/stats`);
  }
}
