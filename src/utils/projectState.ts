import { 
  RequirementsFile, 
  RequirementMatch, 
  SealConfig, 
  UploadedFileItem 
} from '../types/tenderPackage';

export interface SavedProjectState {
  version: string;
  savedAt: string;
  requirementsData: RequirementsFile;
  matches: Record<string, RequirementMatch>;
  sealConfig: SealConfig;
  // File metadata without massive buffers for compact JSON export
  fileMeta: {
    id: string;
    name: string;
    size: number;
    pageCount: number;
    hash: string;
    isDuplicate: boolean;
    duplicateOfName?: string;
  }[];
}

export function exportProjectState(
  requirementsData: RequirementsFile,
  matches: Record<string, RequirementMatch>,
  uploadedFiles: UploadedFileItem[],
  sealConfig: SealConfig
) {
  const state: SavedProjectState = {
    version: '2.0',
    savedAt: new Date().toISOString(),
    requirementsData,
    matches,
    sealConfig: {
      ...sealConfig,
      imageBytes: undefined, // Avoid circular/binary issues in JSON
    },
    fileMeta: uploadedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      pageCount: f.pageCount,
      hash: f.hash,
      isDuplicate: f.isDuplicate,
      duplicateOfName: f.duplicateOfName,
    })),
  };

  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${requirementsData.tender.tender_id}_Project_Backup.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
