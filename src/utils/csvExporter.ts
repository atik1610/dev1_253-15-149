import { RequirementStatusResult, TenderHeader } from '../types/tenderPackage';

export function exportChecklistCsv(
  tender: TenderHeader,
  statusResults: RequirementStatusResult[]
) {
  const headers = [
    'Order',
    'Requirement ID',
    'Document Title (English)',
    'Document Title (Bangla)',
    'Mandatory',
    'Matched File Name',
    'Page Count',
    'Expiry Date',
    'Submission Deadline',
    'Status',
    'Blocks Package',
    'Details',
  ];

  const rows = statusResults.map((res) => [
    res.requirement.order,
    `"${res.requirement.id}"`,
    `"${res.requirement.title_en.replace(/"/g, '""')}"`,
    `"${res.requirement.title_bn.replace(/"/g, '""')}"`,
    res.requirement.mandatory ? 'Yes' : 'No',
    res.matchedFile ? `"${res.matchedFile.name.replace(/"/g, '""')}"` : 'None',
    res.matchedFile ? res.matchedFile.pageCount : 0,
    res.expiryDate || 'N/A',
    tender.submission_deadline,
    `"${res.status}"`,
    res.blocksPackage ? 'YES (Blocking)' : 'NO',
    `"${res.statusMessageEn.replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' + // UTF-8 BOM for Bangla character support in Excel!
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${tender.tender_id}_Checklist_Audit.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
