import { Component, ElementRef, HostListener, inject, Renderer2, model, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';

interface Language {
  code: string;
  name: string;
  dir: 'rtl' | 'ltr';
}

@Component({
  selector: 'app-lang',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lang.component.html',
  styleUrl: './lang.component.css'
})
export class LangComponent {
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);
  private document = inject(DOCUMENT);

  isOpen = signal(false);

  currentLang = model<Language>({ code: 'EN', name: 'English', dir: 'rtl' });

  languages: Language[] = [
    { code: 'ar', name: 'العربية', dir: 'ltr' },
    { code: 'en', name: 'English', dir: 'rtl' }
  ];

  toggleDropdown() {
    this.isOpen.update(value => !value);
  }

  selectLanguage(lang: Language) {
    // this.currentLang.set(lang);
    this.isOpen.set(false);

    // const htmlTag = this.document.documentElement;
    // if (htmlTag) {
    //   this.renderer.setAttribute(htmlTag, 'dir', lang.dir);
    //   this.renderer.setAttribute(htmlTag, 'lang', lang.code);
    // }

    // const existingLink = this.document.getElementById('bootstrap-rtl') as HTMLLinkElement;

    // if (lang.dir === 'rtl') {
    //   if (!existingLink) {
    //     const link = this.renderer.createElement('link');
    //     this.renderer.setAttribute(link, 'id', 'bootstrap-rtl');
    //     this.renderer.setAttribute(link, 'rel', 'stylesheet');
    //     this.renderer.appendChild(this.document.head, link);
    //   }
    // } else {
    //   if (existingLink) {
    //     this.renderer.removeChild(this.document.head, existingLink);
    //   }
    // }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
