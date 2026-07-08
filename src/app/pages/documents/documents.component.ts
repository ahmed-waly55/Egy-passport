// import { Component, inject, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { DocumentCardComponent } from '../../shared/components/document-card/document-card.component';
// import { DocumentService } from '../../services/document.service';
// import { DocumentCard, UploadEvent } from '../../shared/models/document';

// @Component({
//   selector: 'app-documents',
//     standalone: true,
//   imports: [CommonModule, FormsModule, DocumentCardComponent],
//   templateUrl: './documents.component.html',
//   styleUrl: './documents.component.css'
// })
// export class DocumentsComponent {
//   readonly svc = inject(DocumentService);

//   get lang()    { return this.svc.lang(); }
//   get filtered(){ return this.svc.filteredDocs(); }

//   get searchQuery()         { return this.svc.searchQuery(); }
//   set searchQuery(v: string){ this.svc.searchQuery.set(v); }

//   get statusFilter()        { return this.svc.statusFilter(); }
//   set statusFilter(v: any)  { this.svc.statusFilter.set(v); }

//   onView(doc: DocumentCard)     { console.log('View:', doc.title[this.lang]);  }
//   onDownload(doc: DocumentCard) { console.log('Download:', doc.title[this.lang]); }
//   onDelete(doc: DocumentCard)   { this.svc.deleteDoc(doc.id); }
//   onUploaded(e: UploadEvent)    { console.log('Uploaded doc', e.docId, e.file.name); }}


import { Component, inject, OnInit } from '@angular/core';
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
  styleUrl: './documents.component.css',
})
export class DocumentsComponent implements OnInit {


  readonly svc = inject(DocumentService);

  get lang()       { return this.svc.lang(); }
  get filtered()   { return this.svc.filteredDocs(); }
  get isLoading()  { return this.svc.isLoading(); }
  get loadError()  { return this.svc.loadError(); }

  get searchQuery()          { return this.svc.searchQuery(); }
  set searchQuery(v: string) { this.svc.searchQuery.set(v); }

  get statusFilter()         { return this.svc.statusFilter(); }
  set statusFilter(v: any)   { this.svc.statusFilter.set(v); }

  ngOnInit() {
    // ── Get token from localStorage (set during login) ──
    const token = localStorage.getItem('token') ?? '';
   if (token) {
    console.log("tooken"+token)
    this.svc.loadDocuments(token)
   }
  }

//   onDownload(doc: DocumentCard) {
// if (doc.viewUrl) window.open(doc.viewUrl, '_blank');

// }
 async onDownload(doc: DocumentCard) {
    const url = doc.viewUrl ?? doc.img;
    if (!url) { console.warn('No download URL'); return; }

    try {
      // Fetch the file as blob so browser saves it instead of opening it
      const res   = await fetch(url);
      const blob  = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a       = document.createElement('a');
      a.href        = blobUrl;
      a.download    = this.buildFileName(doc, blob.type);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

    } catch (err) {
      // Fallback: open in new tab if fetch fails (CORS etc.)
      console.warn('Download failed, opening in new tab:', err);
      window.open(url, '_blank');
    }
  }

 private buildFileName(doc: DocumentCard, mimeType: string): string {
    const date  = new Date().toISOString().split('T')[0];
    const title = doc.title.en.replace(/\s+/g, '_');
    const ext   = mimeType.includes('pdf')  ? '.pdf'
                : mimeType.includes('png')  ? '.png'
                : mimeType.includes('jpeg') ? '.jpg'
                : '.jpg';
    return `${title}_${date}${ext}`;
  }
/** Generate filename from document title */
private getFileName(doc: DocumentCard): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const title = doc.title.en.replace(/\s+/g, '_');
  return `${title}_${timestamp}.pdf`;
  }
  onDelete(doc: DocumentCard)   { this.svc.deleteDoc(doc.id); }
  onUploaded(e: UploadEvent)    { console.log('Uploaded doc', e.docId, e.file.name); }
    onView(doc: DocumentCard)     { 
      if (doc.viewUrl) {
    window.open(doc.viewUrl, '_blank');
  } else {
    console.warn('No view URL available for this document');
  }
      console.log('View:', doc.title[this.lang]);  }

}



