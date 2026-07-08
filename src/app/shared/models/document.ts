
// export type DocStatus = 'verified' | 'review' | 'optional' | 'rejected' | 'expired';
// export type Lang = 'ar' | 'en';

// export interface BilingualText {
//   ar: string;
//   en: string;
// }

// export interface DocumentCard {
//   id: number;
//   title: BilingualText;
//   status: DocStatus;
//   img: string | null;
//   uploaded: string | null;
//   expiry: string | null;
//   optional: boolean;
//   rejectReason?: BilingualText;
// }

// export interface NavItem {
//   key: string;
//   label: BilingualText;
//   icon: string;          // Bootstrap icon class e.g. 'bi-house-door'
//   badge?: number;
// }

// export interface UploadEvent {
//   docId: number;
//   file: File;
//   previewUrl: string | null;
//   isPdf: boolean;
// }

// export interface User {
//   name: BilingualText;
//   role: BilingualText;
//   avatar: string;
// }



export type DocStatus = 'verified' | 'review' | 'optional' | 'rejected' | 'expired';
export type Lang = 'ar' | 'en';

export interface BilingualText {
  ar: string;
  en: string;
}

export interface DocumentCard {
  id:            number | string;
  title:         BilingualText;
  status:        DocStatus;
  img:           string | null;
  uploaded:      string | null;
  expiry:        string | null;
  optional:      boolean;
  rejectReason?: BilingualText;
  viewUrl?:      string;
}

export interface NavItem {
  key:    string;
  label:  BilingualText;
  icon:   string;
  badge?: number;
}

export interface User {
  name:   BilingualText;
  role:   BilingualText;
  avatar: string;
}

export interface UploadEvent {
  docId:      number | string;
  file:       File;
  previewUrl: string | null;
  isPdf:      boolean;
}

// ── API Response Models ──────────────────────────────────────────
export interface ApiDocument {
  id:              string;
  applicationId:   string;
  documentType:    string;
  fileName:        string;
  fileUrl:         string;
  contentType:     string;
  fileSize:        number;
  status:          string;           // 'Uploaded' | 'Rejected' | 'UnderReview' etc.
  rejectionReason: string | null;
  uploadedAt:      string;
}

export interface ApiDocumentsResponse {
  success:   boolean;
  code:      string;
  message:   string;
  messageAr: string;
  messageEn: string;
  data: {
    items:             ApiDocument[];
    pageNumber:        number;
    pageSize:          number;
    totalCount:        number;
    totalPages:        number;
    hasNextPage:       boolean;
    hasPreviousPage:   boolean;
  };
  errors: any;
}