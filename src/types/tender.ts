export type Language = 'en' | 'bn';

export type TenderStatus = 'draft' | 'in_review' | 'ready_for_submission' | 'submitted' | 'awarded';

export type ComplianceStatus = 'compliant' | 'partially_compliant' | 'non_compliant' | 'exceeds';

export interface BOQItem {
  id: string;
  itemCode: string;
  description: string;
  category: 'Hardware' | 'Software' | 'Labor' | 'Services' | 'Logistics' | 'Contingency';
  unit: string;
  quantity: number;
  unitCost: number;
  vatPercent: number;
  overheadPercent: number;
  marginPercent: number;
}

export interface ComplianceClause {
  id: string;
  clauseNumber: string;
  title: string;
  rfpRequirement: string;
  status: ComplianceStatus;
  proposedSolution: string;
  deviationNote?: string;
  isMandatory: boolean;
}

export interface RequiredDocument {
  id: string;
  title: string;
  titleBn: string;
  category: 'Legal' | 'Financial' | 'Technical' | 'Experience';
  isMandatory: boolean;
  status: 'verified' | 'uploaded' | 'missing' | 'expired';
  fileName?: string;
  expiryDate?: string;
  notes?: string;
}

export interface KeyPersonnel {
  id: string;
  name: string;
  role: string;
  yearsOfExp: number;
  certifications: string[];
  allocatedCommitment: string;
}

export interface Milestone {
  id: string;
  title: string;
  durationWeeks: number;
  deliverables: string;
  completionPercent: number;
}

export interface TenderProposal {
  id: string;
  title: string;
  titleBn: string;
  referenceNumber: string;
  clientName: string;
  clientType: 'Government' | 'Autonomous' | 'Corporate' | 'International';
  currency: 'BDT' | 'USD' | 'EUR';
  submissionDeadline: string;
  estimatedBudgetCeiling: number;
  status: TenderStatus;
  executiveSummary: string;
  technicalScope: string;
  earnestMoneyAmount: number; // Bid security
  bankGuaranteeDetails: string;
  boqItems: BOQItem[];
  complianceClauses: ComplianceClause[];
  documents: RequiredDocument[];
  personnel: KeyPersonnel[];
  milestones: Milestone[];
  notes: string;
}

export interface AuditCheckItem {
  id: string;
  category: 'documentation' | 'financial' | 'compliance' | 'personnel' | 'timeline' | 'security';
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  status: 'passed' | 'warning' | 'failed';
  scoreImpact: number;
  details: string;
  recommendationEn: string;
  recommendationBn: string;
}

export interface AuditReport {
  overallScore: number; // 0 - 100
  qualificationVerdict: 'QUALIFIED' | 'CONDITIONAL' | 'DISQUALIFIED';
  passedTests: number;
  totalTests: number;
  criticalIssuesCount: number;
  warningsCount: number;
  financialSanityScore: number;
  complianceRatioScore: number;
  documentationScore: number;
  checkItems: AuditCheckItem[];
  timestamp: string;
}
