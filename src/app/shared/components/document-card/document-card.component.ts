
import {
  Component, Input, Output, EventEmitter, inject,
  signal, computed, OnChanges
} from '@angular/core';
import { CommonModule,NgClass} from '@angular/common';
import { DocumentCard, UploadEvent } from '../../models/document';
import { DocumentService } from '../../../services/document.service';
import { UploadZoneComponent } from '../upload-zone/upload-zone.component';

@Component({
  selector: 'app-document-card',
  standalone: true,
  imports: [CommonModule, UploadZoneComponent,NgClass],
  templateUrl: './document-card.component.html',
  styleUrls: ['./document-card.component.css'],
})
export class DocumentCardComponent implements OnChanges {
  @Input() doc!: DocumentCard;

  @Output() view     = new EventEmitter<DocumentCard>();
  @Output() download = new EventEmitter<DocumentCard>();
  @Output() delete   = new EventEmitter<DocumentCard>();
  @Output() uploaded = new EventEmitter<UploadEvent>();

  private readonly svc = inject(DocumentService);

  // Local upload state
  readonly uploadedFile    = signal<File | null>(null);
  readonly previewUrl      = signal<string | null>(null);
  readonly isUploading     = signal(false);
  readonly uploadProgress  = signal(0);
  readonly uploadDone      = signal(false);
  readonly currentStatus   = signal(this.doc?.status ?? 'optional');
  readonly ddOpen          = signal(false);

  ngOnChanges() { this.currentStatus.set(this.doc.status); }

  get lang() { return this.svc.lang(); }
  get title() { return this.doc.title[this.lang]; }
  get reason() { return this.doc.rejectReason?.[this.lang] ?? ''; }
  get isRejected() { return this.currentStatus() === 'rejected'; }

  get badgeClass() {
    return { verified:'badge-verified', review:'badge-review', optional:'badge-optional',
             rejected:'badge-rejected', expired:'badge-expired' }[this.currentStatus()] ?? 'badge-optional';
  }
  get badgeIcon() {
    return { verified:'bi-check-circle-fill', review:'bi-hourglass-split', optional:'bi-dash-circle',
             rejected:'bi-x-circle-fill', expired:'bi-x-circle-fill' }[this.currentStatus()] ?? 'bi-dash-circle';
  }
  get statusLabel() {
    const m = { ar:{ verified:'تم التحقق', review:'قيد المراجعة', optional:'اختياري', rejected:'تم الرفض', expired:'منتهي' },
                en:{ verified:'Verified',  review:'Under Review',  optional:'Optional', rejected:'Rejected',  expired:'Expired' } };
    return m[this.lang][this.currentStatus()] ?? '';
  }
  get lbl() {
    return { ar:{ view:'عرض', dl:'تحميل', del:'حذف', up:'رفع مستند', reup:'رفع جديد',
                  rejTitle:'سبب الرفض:', ok:'تم الرفع بنجاح — في انتظار المراجعة', noFile:'لم يتم رفع مستند' },
             en:{ view:'View', dl:'Download', del:'Delete', up:'Upload', reup:'Re-upload',
                  rejTitle:'Rejection Reason:', ok:'Uploaded successfully — Pending review', noFile:'No file uploaded' } }[this.lang];
  }

  // ── Upload ──────────────────────────────────────────────────────
  onFileSelected(file: File) {
    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.uploadDone.set(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 25;
      if (p >= 100) {
        p = 100; clearInterval(iv);
        this.finishUpload(file);
      }
      this.uploadProgress.set(p);
    }, 180);
  }

  private finishUpload(file: File) {
    this.isUploading.set(false);
    this.uploadedFile.set(file);
    this.uploadDone.set(true);
    this.currentStatus.set('review');
    // Update service state
    this.svc.updateStatus(this.doc.id, 'review');
    if (file.type !== 'application/pdf') {
      const r = new FileReader();
      r.onload = e => this.previewUrl.set(e.target?.result as string);
      r.readAsDataURL(file);
    }
    this.uploaded.emit({ docId:this.doc.id, file, previewUrl:this.previewUrl(), isPdf:file.type==='application/pdf' });
  }

  removeUpload() {
    this.uploadedFile.set(null);
    this.previewUrl.set(null);
    this.uploadDone.set(false);
    this.currentStatus.set('rejected');
    this.svc.updateStatus(this.doc.id, 'rejected');
  }
toggleDd() { this.ddOpen.update(v => !v); }
  viewFile() {
    
    const f = this.uploadedFile();
    if (f) window.open(URL.createObjectURL(f), '_blank');
  }
}
