export interface Wallet {
  id: string;
  balance: number;
  status: string;
  createdAt: string;
}

export interface PassportData {
  id?: string;
  number: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
  profilePhoto?: string;
  name?: string;
  nationalId?: string;
}

export interface QRCodeData {
  qrCode?: string;
  code?: string;
  image?: string;
  issuedDate?: string;
  expiryDate: string;
  refreshedAt?: string;
}
