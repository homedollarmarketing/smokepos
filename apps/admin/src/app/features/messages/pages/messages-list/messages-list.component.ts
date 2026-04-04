import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { MessagesService, MessageQuery } from '../../../../core/services/messages.service';
import { Message, MessageStatus } from '../../../../core/models/message.model';
import { PaginationMeta } from '../../../../core/models/pagination.model';

const DEFAULT_LIMIT = 20;

interface StatusOption {
  label: string;
  value: MessageStatus | '';
}

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TooltipModule],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.scss',
})
export class MessagesListComponent implements OnInit {
  private readonly messagesService = inject(MessagesService);
  private readonly router = inject(Router);

  // State
  readonly messages = signal<Message[]>([]);
  readonly pagination = signal<PaginationMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedStatus = signal<MessageStatus | ''>('');
  readonly unreadCount = signal(0);

  // Status filter options
  readonly statusOptions: StatusOption[] = [
    { label: 'All', value: '' },
    { label: 'Unread', value: 'unread' },
    { label: 'Read', value: 'read' },
    { label: 'Replied', value: 'replied' },
  ];

  // Computed
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);
  readonly isEmpty = computed(() => this.messages().length === 0 && !this.isLoading());

  ngOnInit() {
    this.loadMessages();
    this.loadStats();
  }

  loadMessages(page: number = 1) {
    this.isLoading.set(true);
    this.error.set(null);

    const query: MessageQuery = {
      page,
      limit: DEFAULT_LIMIT,
      status: this.selectedStatus() || undefined,
    };

    this.messagesService.getMessages(query).subscribe({
      next: (result) => {
        this.messages.set(result.data);
        this.pagination.set(result.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load messages');
        this.isLoading.set(false);
      },
    });
  }

  loadStats() {
    this.messagesService.getStats().subscribe({
      next: (stats) => {
        this.unreadCount.set(stats.unread);
      },
    });
  }

  onFilterChange(value: MessageStatus | '') {
    this.selectedStatus.set(value);
    this.loadMessages(1);
  }

  onStatusChange() {
    this.loadMessages(1);
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadMessages(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadMessages(this.pagination().page + 1);
    }
  }

  onMessageClick(message: Message) {
    this.router.navigate(['/messages', message.id]);
  }

  onRowClick(event: any) {
    const message = event.data as Message;
    if (message && message.id) {
      this.router.navigate(['/messages', message.id]);
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  truncateMessage(message: string, maxLength: number = 80): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength).trim() + '...';
  }

  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  getStartItem(): number {
    const p = this.pagination();
    return (p.page - 1) * p.limit + 1;
  }

  getEndItem(): number {
    const p = this.pagination();
    return Math.min(p.page * p.limit, p.total);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
