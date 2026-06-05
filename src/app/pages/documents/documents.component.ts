import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentCardComponent } from '../../shared/components/document-card/document-card.component';
import { DocumentService } from '../../services/document.service';
import { DocumentCard, UploadEvent } from '../../shared/models/document';

@Component({
  selector: 'app-documents',
    standalone: true,
  imports: [CommonModule, FormsModule, DocumentCardComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent {
  readonly svc = inject(DocumentService);

  get lang()    { return this.svc.lang(); }
  get filtered(){ return this.svc.filteredDocs(); }

  get searchQuery()         { return this.svc.searchQuery(); }
  set searchQuery(v: string){ this.svc.searchQuery.set(v); }

  get statusFilter()        { return this.svc.statusFilter(); }
  set statusFilter(v: any)  { this.svc.statusFilter.set(v); }

  onView(doc: DocumentCard)     { console.log('View:', doc.title[this.lang]);  }
  onDownload(doc: DocumentCard) { console.log('Download:', doc.title[this.lang]); }
  onDelete(doc: DocumentCard)   { this.svc.deleteDoc(doc.id); }
  onUploaded(e: UploadEvent)    { console.log('Uploaded doc', e.docId, e.file.name); }}