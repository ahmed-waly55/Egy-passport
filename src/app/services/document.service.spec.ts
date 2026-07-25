import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { DocumentService } from './document.service';
import { NotificationStoreService } from '../features/notifications/notification-store.service';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: { get: jasmine.createSpy('get') } },
        { provide: NotificationStoreService, useValue: { unreadCount: () => 0 } },
      ],
    });
    service = TestBed.inject(DocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
