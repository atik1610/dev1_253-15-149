export type Language = 'en' | 'bn';

export interface TenderHeader {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string; // YYYY-MM-DD
}

export interface TenderRequirement {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsFile {
  tender: TenderHeader;
  requirements: TenderRequirement[];
}

export type DocumentStatus = 
  | 'Missing' 
  | 'Expiry date needed' 
  | 'Expired' 
  | 'Not provided' 
  | 'OK';

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  hash: string; // SHA-256 hex string
  isDuplicate: boolean;
  duplicateOfName?: string;
  isCorrupt: boolean;
  errorMessage?: string;
  buffer: ArrayBuffer;
  uploadedAt: string;
}

export interface RequirementMatch {
  requirementId?: string;
  fileId?: string;
  expiryDate?: string; // YYYY-MM-DD
}

export interface RequirementStatusResult {
  requirement: TenderRequirement;
  status: DocumentStatus;
  blocksPackage: boolean;
  matchedFile?: UploadedFileItem;
  expiryDate?: string;
  statusMessageEn: string;
  statusMessageBn: string;
}

export interface SealConfig {
  hasSeal: boolean;
  imageDataUrl?: string;
  imageBytes?: Uint8Array;
  fileName?: string;
  placement: 'all' | 'cover' | 'last_page' | 'first_page_of_each';
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  scale: number;
}
