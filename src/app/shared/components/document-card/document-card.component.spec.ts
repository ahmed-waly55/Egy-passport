import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DocumentCard } from '../../models/document';

import { DocumentCardComponent } from './document-card.component';

describe('DocumentCardComponent', () => {
  let component: DocumentCardComponent;
  let fixture: ComponentFixture<DocumentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentCardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentCardComponent);
    component = fixture.componentInstance;
    component.doc = {
      id: 'doc-1',
      title: { ar: 'صورة شخصية', en: 'Personal Photo' },
      status: 'optional',
      img: null,
      optional: false,
    } as DocumentCard;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
