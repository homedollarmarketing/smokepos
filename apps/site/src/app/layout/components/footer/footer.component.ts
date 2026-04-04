import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/store' },
    { label: 'My Account', path: '/account' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'About', path: '/about' },
  ];

  socialLinks = [
    {
      name: 'Instagram',
      icon: 'instagram',
      url: 'https://www.instagram.com/mr.p_authentic_auto_parts/',
    },
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com/mrpauthenticautoparts' },
    { name: 'TikTok', icon: 'tiktok', url: 'https://www.tiktok.com/@mr.p_authentic_autoparts' },
    { name: 'Twitter', icon: 'twitter', url: 'https://x.com/Mrp_AutoSpares' },
    { name: 'YouTube', icon: 'youtube', url: 'https://youtube.com/@mrpauthenticautoparts' },
  ];

  contactInfo = {
    phones: ['+256 759 204 449', '+256 791 063 897'],
    email: 'info@mrpauthenticautoparts.com',
    address: 'HAM Tower, Opposite Makerere University Main Gate, Kampala',
  };

  businessHours = {
    weekdays: '8:30 AM - 9:00 PM',
    sunday: '10:00 AM - 4:00 PM',
  };
}
