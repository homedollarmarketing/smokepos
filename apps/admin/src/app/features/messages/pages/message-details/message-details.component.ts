import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { MessagesService } from '../../../../core/services/messages.service';
import { Message, MessageStatus } from '../../../../core/models/message.model';

@Component({
  selector: 'app-message-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    TextareaModule,
    ConfirmDialogModule,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './message-details.component.html',
  styleUrl: './message-details.component.scss',
})
export class MessageDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messagesService = inject(MessagesService);
  private readonly confirmationService = inject(ConfirmationService);

  // State
  readonly message = signal<Message | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly replyContent = signal('');
  readonly isReplying = signal(false);
  readonly replyError = signal<string | null>(null);

  // Computed
  readonly canReply = computed(() => {
    const msg = this.message();
    return msg && msg.status !== 'replied' && this.replyContent().trim().length > 0;
  });

  readonly isReplied = computed(() => this.message()?.status === 'replied');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMessage(id);
    }
  }

  loadMessage(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.messagesService.getMessage(id).subscribe({
      next: (message) => {
        this.message.set(message);
        this.isLoading.set(false);

        // Mark as read if unread
        if (message.status === 'unread') {
          this.messagesService.markAsRead(id).subscribe({
            next: (updated) => this.message.set(updated),
          });
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load message');
        this.isLoading.set(false);
      },
    });
  }

  onReply() {
    const msg = this.message();
    if (!msg || !this.replyContent().trim()) return;

    this.isReplying.set(true);
    this.replyError.set(null);

    this.messagesService.replyToMessage(msg.id, { replyContent: this.replyContent() }).subscribe({
      next: (updated) => {
        this.message.set(updated);
        this.isReplying.set(false);
        this.replyContent.set('');
      },
      error: (err) => {
        this.replyError.set(err.error?.message || 'Failed to send reply');
        this.isReplying.set(false);
      },
    });
  }

  onDelete() {
    const msg = this.message();
    if (!msg) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this message?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.messagesService.deleteMessage(msg.id).subscribe({
          next: () => {
            this.router.navigate(['/messages']);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Failed to delete message');
          },
        });
      },
    });
  }

  goBack() {
    this.router.navigate(['/messages']);
  }

  getStatusSeverity(status: MessageStatus): 'danger' | 'warn' | 'success' {
    switch (status) {
      case 'unread':
        return 'danger';
      case 'read':
        return 'warn';
      case 'replied':
        return 'success';
      default:
        return 'warn';
    }
  }

  getStatusLabel(status: MessageStatus): string {
    switch (status) {
      case 'unread':
        return 'Unread';
      case 'read':
        return 'Read';
      case 'replied':
        return 'Replied';
      default:
        return status;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
