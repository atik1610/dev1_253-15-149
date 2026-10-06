import { 
  DocumentStatus, 
  RequirementMatch, 
  RequirementStatusResult, 
  TenderHeader, 
  TenderRequirement, 
  UploadedFileItem 
} from '../types/tenderPackage';

/**
 * Normalizes date string to YYYY-MM-DD for strictly accurate string/date comparison
 */
export function normalizeDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr.trim();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Evaluates the status of a single requirement according to Section 5 Status Rules.
 */
export function evaluateRequirementStatus(
  requirement: TenderRequirement,
  tender: TenderHeader,
  match: RequirementMatch | undefined,
  uploadedFiles: UploadedFileItem[]
): RequirementStatusResult {
  const matchedFile = match?.fileId 
    ? uploadedFiles.find((f) => f.id === match.fileId && !f.isCorrupt) 
    : undefined;

  const expiryDate = match?.expiryDate ? normalizeDate(match.expiryDate) : '';
  const deadline = normalizeDate(tender.submission_deadline);

  // Rule 1: No file matched
  if (!matchedFile) {
    if (requirement.mandatory) {
      return {
        requirement,
        status: 'Missing',
        blocksPackage: true,
        matchedFile: undefined,
        expiryDate: undefined,
        statusMessageEn: 'Required document, no file matched.',
        statusMessageBn: 'বাধ্যতামূলক নথি, কোনো ফাইল সংযুক্ত করা হয়নি।',
      };
    } else {
      return {
        requirement,
        status: 'Not provided',
        blocksPackage: false,
        matchedFile: undefined,
        expiryDate: undefined,
        statusMessageEn: 'Optional document, no file matched.',
        statusMessageBn: 'ঐচ্ছিক নথি, কোনো ফাইল দেওয়া হয়নি।',
      };
    }
  }

  // Rule 2 & 3: File is matched, check expiry requirements
  if (requirement.has_expiry) {
    if (!expiryDate) {
      return {
        requirement,
        status: 'Expiry date needed',
        blocksPackage: true,
        matchedFile,
        expiryDate: undefined,
        statusMessageEn: 'File matched, but no expiry date entered.',
        statusMessageBn: 'ফাইল সংযুক্ত আছে, কিন্তু মেয়াদের তারিখ দেওয়া হয়নি।',
      };
    }

    // Date comparison: YYYY-MM-DD string comparison is safe and exact
    // If a document expires on the same day as the submission deadline, it is still OK.
    if (expiryDate < deadline) {
      return {
        requirement,
        status: 'Expired',
        blocksPackage: true,
        matchedFile,
        expiryDate,
        statusMessageEn: `Expired on ${expiryDate} (Before deadline ${deadline}).`,
        statusMessageBn: `মেয়াদ উত্তীর্ণ: ${expiryDate} (দাখিলের তারিখ ${deadline}-এর পূর্বে)।`,
      };
    }
  }

  // Rule 5: OK
  return {
    requirement,
    status: 'OK',
    blocksPackage: false,
    matchedFile,
    expiryDate: requirement.has_expiry ? expiryDate : undefined,
    statusMessageEn: requirement.has_expiry 
      ? `Valid through ${expiryDate} (On or after deadline).` 
      : 'File matched and verified.',
    statusMessageBn: requirement.has_expiry
      ? `মেয়াদ বৈধ: ${expiryDate} পর্যন্ত।`
      : 'ফাইল সফলভাবে সংযুক্ত ও যাচাইকৃত।',
  };
}

/**
 * Computes all requirements statuses, checks duplicate restrictions, and determines package block state.
 */
export function checkPackageEligibility(
  requirements: TenderRequirement[],
  tender: TenderHeader,
  matches: Record<string, RequirementMatch>,
  uploadedFiles: UploadedFileItem[]
) {
  // Sort by order (1 = first)
  const sortedRequirements = [...requirements].sort((a, b) => a.order - b.order);

  const results: RequirementStatusResult[] = sortedRequirements.map((req) => {
    const match = matches[req.id];
    return evaluateRequirementStatus(req, tender, match, uploadedFiles);
  });

  const blockingIssues: string[] = [];

  results.forEach((res) => {
    if (res.blocksPackage) {
      blockingIssues.push(
        `[Order ${res.requirement.order}: ${res.requirement.title_en}] Status: ${res.status} (${res.statusMessageEn})`
      );
    }
  });

  // Section 4.6 Duplicate check rule:
  // "Do not allow them to be matched to different documents."
  const matchedFileIds = Object.values(matches)
    .map((m) => m.fileId)
    .filter(Boolean) as string[];

  const matchedDuplicateFiles = uploadedFiles.filter(
    (f) => f.isDuplicate && matchedFileIds.includes(f.id)
  );

  if (matchedDuplicateFiles.length > 0) {
    const dupNames = matchedDuplicateFiles.map((f) => f.name).join(', ');
    blockingIssues.push(`Duplicate file detected in package: ${dupNames}. Duplicate files cannot be included.`);
  }

  const canGenerate = blockingIssues.length === 0;

  return {
    results,
    canGenerate,
    blockingIssues,
    totalRequirements: requirements.length,
    okCount: results.filter((r) => r.status === 'OK').length,
    missingCount: results.filter((r) => r.status === 'Missing').length,
    expiredCount: results.filter((r) => r.status === 'Expired').length,
    expiryNeededCount: results.filter((r) => r.status === 'Expiry date needed').length,
    notProvidedCount: results.filter((r) => r.status === 'Not provided').length,
  };
}
