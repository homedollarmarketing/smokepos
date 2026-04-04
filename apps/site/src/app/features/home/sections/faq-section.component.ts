import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-section.component.html',
  styleUrl: './faq-section.component.scss',
})
export class FaqSectionComponent {
  openIndex = signal<number | null>(null);

  faqs: FaqItem[] = [
    {
      question: 'Are your parts genuine and authentic?',
      answer: `Yes, 100% genuine and authentic.

        At Mr. P Authentic Autoparts, we only deal in original, verified parts sourced from trusted suppliers. No copies, no imitations — just authentic quality built for performance and durability.
        
        Drive Luxury. Choose Authentic.`,
    },
    {
      question: 'Which luxury car brands do you supply parts for?',
      answer: `We supply genuine and authentic parts for top European luxury brands, including:

        • Range Rover / Land Rover
        • Mercedes-Benz
        • BMW
        • Audi
        • Volkswagen
        • Porsche
        • Jaguar
        • Volvo
        • Lexus

        At Mr. P Authentic Autoparts, we make sure every part matches your car's original standard — built for performance, reliability, and class.

        Drive Luxury. Choose Authentic.`,
    },
    {
      question: 'Do you offer installation services?',
      answer: `Yes, we do.

        At Mr. P Authentic Autoparts, we offer professional installation and fitting services done by skilled technicians who understand luxury vehicles. Every part is fitted with precision to ensure perfect performance and safety.

        You get the best parts — and the right hands to install them.

        Drive Luxury. Choose Authentic.`,
    },
    {
      question: 'How can I verify if a part is available?',
      answer: `You can easily verify part availability by contacting us directly with your car model, year, and part name or photo.

        Our team will check stock instantly and confirm if it's available — or help you order it quickly if it's not in stock.

        You can also visit our website for quick part inquiries and updates.

        At Mr. P Authentic Autoparts, we make it easy to get the right genuine part every time.

        Drive Luxury. Choose Authentic.`,
    },
    {
      question: 'What is your warranty and return policy?',
      answer: `At Mr. P Authentic Autoparts, every product is backed by our authenticity and performance guarantee.

        ✅ Warranty:
        All our genuine parts come with a warranty period that covers manufacturing defects and quality issues (varies by brand and product type).

        ✅ Returns & Exchanges:
        If a part has a verified defect or doesn't match your order, we offer a replacement or return within the warranty period — provided it's unused, uninstalled, and in original packaging.

        Our goal is to ensure you receive only authentic, high-performance parts that meet luxury standards.

        For quick assistance, contact us or visit our website to process your warranty or return request.

        Drive Luxury. Choose Authentic.`,
    },
  ];

  toggleFaq(index: number): void {
    if (this.openIndex() === index) {
      this.openIndex.set(null);
    } else {
      this.openIndex.set(index);
    }
  }
}
