import { RequirementMatch, TenderRequirement, UploadedFileItem } from '../types/tenderPackage';

/**
 * Normalizes string for token-based keyword matching
 */
function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[._\-–/\\]/g, ' ')
    .replace(/\.pdf$/i, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !['the', 'and', 'for', 'of', 'in', 'copy'].includes(w));
}

/**
 * Scores the match between a requirement and a file name
 */
export function scoreMatch(req: TenderRequirement, file: UploadedFileItem): number {
  if (file.isCorrupt) return 0;

  const fileNameTokens = normalizeText(file.name);
  const reqEnTokens = normalizeText(req.title_en);

  let matches = 0;
  for (const token of reqEnTokens) {
    if (fileNameTokens.some((ft) => ft.includes(token) || token.includes(ft))) {
      matches += 2;
    }
  }

  // Exact acronym checks (e.g. TIN, BIN, MAF, ISO)
  const acronyms = ['tin', 'bin', 'vat', 'maf', 'iso'];
  for (const acr of acronyms) {
    if (req.title_en.toLowerCase().includes(acr) && file.name.toLowerCase().includes(acr)) {
      matches += 5;
    }
  }

  return matches;
}

/**
 * Automatically suggests best 1-to-1 matches for unmatched requirements and files
 */
export function autoMatchFiles(
  requirements: TenderRequirement[],
  files: UploadedFileItem[],
  existingMatches: Record<string, RequirementMatch>
): Record<string, RequirementMatch> {
  const result: Record<string, RequirementMatch> = { ...existingMatches };

  // Set of already matched file IDs
  const usedFileIds = new Set(
    Object.values(result)
      .map((m) => m.fileId)
      .filter(Boolean) as string[]
  );

  // Available files that are not duplicates and not corrupt
  const availableFiles = files.filter((f) => !f.isDuplicate && !f.isCorrupt);

  // For each requirement without a matched file
  for (const req of requirements) {
    if (result[req.id]?.fileId) continue; // Already matched

    let bestScore = 0;
    let bestFile: UploadedFileItem | null = null;

    for (const file of availableFiles) {
      if (usedFileIds.has(file.id)) continue;

      const score = scoreMatch(req, file);
      if (score > bestScore && score >= 2) {
        bestScore = score;
        bestFile = file;
      }
    }

    if (bestFile) {
      usedFileIds.add(bestFile.id);
      result[req.id] = {
        requirementId: req.id,
        fileId: bestFile.id,
        expiryDate: result[req.id]?.expiryDate,
      };
    }
  }

  return result;
}

