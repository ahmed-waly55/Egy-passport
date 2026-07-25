export type ApplicationStatusValue = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | string;

export interface ApplicationPersonalInfo {
  nationalId: string;
  governorate: string;
  address: string;
  nationality: string;
  placeOfBirth: string;
  profilePhotoUrl: string;
}

export interface ApplicationDocument {
  id: string;
  type: string;
  uploadedAt: string;
  status: string;
}

export interface Application {
  id: string;
  status: ApplicationStatusValue;
  personalInfo?: ApplicationPersonalInfo;
  documents?: ApplicationDocument[];
  createdAt: string;
  updatedAt?: string;
  referenceNumber?: string | null;
}

export interface ApplicationStatus {
  applicationId: string;
  status: ApplicationStatusValue;
  stage: string;
  progress: number;
  estimatedCompletion?: string;
  notes?: string;
}

export interface ApplicationsListResponse {
  data: Application[];
  totalCount: number;
}
