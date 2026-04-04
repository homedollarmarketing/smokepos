import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent {
  readonly isOpen = signal(false);
  readonly isMinimized = signal(false);
  readonly inputMessage = signal('');
  readonly messages = signal<ChatMessage[]>([
    {
      id: 1,
      text: 'Hello! Welcome to Mr. P Authentic Autoparts. How can I help you today?',
      sender: 'bot',
      timestamp: this.getTimestamp(),
    },
  ]);

  readonly quickReplies = [
    'Check part availability',
    'Book a service',
    'Get pricing',
    'Contact support',
  ];

  readonly showQuickReplies = computed(() => this.messages().length === 1);

  openChat(): void {
    this.isOpen.set(true);
    this.isMinimized.set(false);
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  minimizeChat(): void {
    this.isMinimized.set(true);
  }

  restoreChat(): void {
    this.isMinimized.set(false);
  }

  sendMessage(text?: string): void {
    const messageText = text || this.inputMessage().trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: this.messages().length + 1,
      text: messageText,
      sender: 'user',
      timestamp: this.getTimestamp(),
    };

    this.messages.update((msgs) => [...msgs, userMessage]);
    this.inputMessage.set('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: this.messages().length + 1,
        text: this.getBotResponse(messageText),
        sender: 'bot',
        timestamp: this.getTimestamp(),
      };
      this.messages.update((msgs) => [...msgs, botResponse]);
    }, 1000);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onInputChange(value: string): void {
    this.inputMessage.set(value);
  }

  private getTimestamp(): string {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private getBotResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('availability') || lowerMessage.includes('stock')) {
      return "I can help you check part availability. Please provide the part name or your vehicle model, and I'll check our inventory.";
    } else if (lowerMessage.includes('service') || lowerMessage.includes('book')) {
      return 'Great! You can book a service by visiting our Services page or calling us at +256 759 204 449. What type of service do you need?';
    } else if (
      lowerMessage.includes('price') ||
      lowerMessage.includes('pricing') ||
      lowerMessage.includes('cost')
    ) {
      return 'For pricing information, please visit our Store page or contact us directly. Prices vary by part and vehicle model.';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
      return 'You can reach us at:\n📞 +256 759 204 449\n📧 info@mrpauthenticautoparts.com\n📍 HAM Tower, Opposite Makerere University Main Gate';
    } else {
      return 'Thank you for your message! For immediate assistance, please call us at +256 759 204 449 or use the WhatsApp button to chat with our team.';
    }
  }
}
