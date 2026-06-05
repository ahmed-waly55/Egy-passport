
export type DocStatus = 'verified' | 'review' | 'optional' | 'rejected' | 'expired';
export type Lang = 'ar' | 'en';

export interface BilingualText {
  ar: string;
  en: string;
}

export interface DocumentCard {
  id: number;
  title: BilingualText;
  status: DocStatus;
  img: string | null;
  uploaded: string | null;
  expiry: string | null;
  optional: boolean;
  rejectReason?: BilingualText;
}

export interface NavItem {
  key: string;
  label: BilingualText;
  icon: string;          // Bootstrap icon class e.g. 'bi-house-door'
  badge?: number;
}

export interface UploadEvent {
  docId: number;
  file: File;
  previewUrl: string | null;
  isPdf: boolean;
}

export interface User {
  name: BilingualText;
  role: BilingualText;
  avatar: string;
}

