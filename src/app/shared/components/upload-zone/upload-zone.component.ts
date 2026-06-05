
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-zone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-zone.component.html',
  styleUrls: ['./upload-zone.component.css'],
})
export class UploadZoneComponent {
  @Input() lang: 'ar' | 'en' = 'ar';
  @Output() fileSelected = new EventEmitter<File>();

  isDragging = signal(false);

  readonly MAX_MB  = 5;
  readonly ALLOWED = ['image/jpeg','image/png','image/jpg','application/pdf'];

  readonly i18n = {
    ar: { text:'اسحب وأفلت الملف الجديد هنا أو انقر للاختيار', hint:'JPG, PNG, PDF — حتى 5 ميجابايت',
          errType:'نوع الملف غير مدعوم. يرجى اختيار JPG أو PNG أو PDF.', errSize:'حجم الملف يتجاوز 5 ميجابايت.' },
    en: { text:'Drag & drop file here or click to browse', hint:'JPG, PNG, PDF — up to 5 MB',
          errType:'Unsupported file type. Please choose JPG, PNG, or PDF.', errSize:'File size exceeds 5 MB.' },
  };

  get t() { return this.i18n[this.lang]; }

  onDragOver(e: DragEvent)  { e.preventDefault(); this.isDragging.set(true); }
  onDragLeave()             { this.isDragging.set(false); }
  onDrop(e: DragEvent)      { e.preventDefault(); this.isDragging.set(false); const f = e.dataTransfer?.files[0]; if (f) this.validate(f); }
  onFileChange(e: Event)    { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.validate(f); }

  private validate(file: File) {
    if (!this.ALLOWED.includes(file.type)) { alert(this.t.errType); return; }
    if (file.size > this.MAX_MB * 1024 * 1024) { alert(this.t.errSize); return; }
    this.fileSelected.emit(file);
  }
}