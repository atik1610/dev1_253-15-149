import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { RequirementsFile, UploadedFileItem } from '../types/tenderPackage';

export const OFFICIAL_SAMPLE_REQUIREMENTS: RequirementsFile = {
  tender: {
    tender_id: 'T-2026-0417',
    title: 'Supply of IT Equipment',
    procuring_entity: 'Example Directorate',
    bidder: 'Example Company Ltd.',
    submission_deadline: '2026-10-20',
  },
  requirements: [
    {
      id: 'R01',
      order: 1,
      title_en: 'Trade License',
      title_bn: 'হালনাগাদ ট্রেড লাইসেন্স',
      mandatory: true,
      has_expiry: true,
    },
    {
      id: 'R02',
      order: 2,
      title_en: 'Tax Identification Number (TIN) Certificate',
      title_bn: 'টিআইএন কর প্রত্যয়নপত্র',
      mandatory: true,
      has_expiry: false,
    },
    {
      id: 'R03',
      order: 3,
      title_en: 'VAT Registration (BIN) Certificate',
      title_bn: 'ভ্যাট নিবন্ধন সনদ (BIN)',
      mandatory: true,
      has_expiry: false,
    },
    {
      id: 'R04',
      order: 4,
      title_en: 'Bank Solvency Letter',
      title_bn: 'ব্যাংক সচ্ছলতা সনদ',
      mandatory: true,
      has_expiry: false,
    },
    {
      id: 'R05',
      order: 5,
      title_en: 'Similar Past Experience Certificates',
      title_bn: 'অনুরূপ কাজের অভিজ্ঞতা সনদ',
      mandatory: true,
      has_expiry: false,
    },
    {
      id: 'R06',
      order: 6,
      title_en: 'ISO 9001:2015 Quality Management Certificate',
      title_bn: 'আইএসও ৯০০১ কোয়ালিটি সনদ',
      mandatory: false,
      has_expiry: true,
    },
    {
      id: 'R07',
      order: 7,
      title_en: 'Technical Proposal Specification Schedule',
      title_bn: 'কারিগরি স্পেসিফিকেশন তফসিল',
      mandatory: true,
      has_expiry: false,
    },
    {
      id: 'R08',
      order: 8,
      title_en: 'Financial Bid & Price Proposal Schedule',
      title_bn: 'আর্থিক প্রস্তাব ও দরপত্র তফসিল',
      mandatory: true,
      has_expiry: false,
    },
    {
      id: 'R09',
      order: 9,
      title_en: 'Manufacturer Authorization Form (MAF)',
      title_bn: 'প্রস্তুতকারকের অনুমোদনপত্র (MAF)',
      mandatory: false,
      has_expiry: false,
    },
  ],
};

// Generates a lightweight, valid single-page or multi-page sample PDF with realistic mock certificate text
async function createMockPdf(title: string, pages: number = 1, uniquePayload: string = ''): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    // Top decorative bar
    page.drawRectangle({
      x: 40,
      y: height - 80,
      width: width - 80,
      height: 40,
      color: rgb(0.1, 0.2, 0.35),
    });

    page.drawText('OFFICIAL PROCUREMENT ATTESTATION', {
      x: 60,
      y: height - 62,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(title, {
      x: 50,
      y: height - 130,
      size: 18,
      font: fontBold,
      color: rgb(0.1, 0.12, 0.15),
    });

    page.drawText(`Document Sheet ${i + 1} of ${pages} | Reference: ${title.replace(/\s+/g, '_')}`, {
      x: 50,
      y: height - 155,
      size: 10,
      font,
      color: rgb(0.4, 0.45, 0.5),
    });

    // Content body box
    page.drawRectangle({
      x: 50,
      y: height - 450,
      width: width - 100,
      height: 270,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.85, 0.88, 0.9),
      borderWidth: 1,
    });

    page.drawText('CERTIFIED STATUTORY DECLARATION', {
      x: 70,
      y: height - 200,
      size: 11,
      font: fontBold,
      color: rgb(0.2, 0.25, 0.3),
    });

    const sampleText = [
      'This document confirms compliance with tender submission prerequisites.',
      `Bearer: Example Company Ltd. (Bidder ID: B-77401)`,
      `Issued under regulatory guidelines and statutory authority verification.`,
      `Verification Hash: SHA256-${title.slice(0, 4)}-${i}-${uniquePayload}`,
      'Original sealed document registered with authorized procurement registrar.',
    ];

    sampleText.forEach((line, idx) => {
      page.drawText(line, {
        x: 70,
        y: height - 230 - idx * 22,
        size: 9.5,
        font,
        color: rgb(0.25, 0.3, 0.35),
      });
    });

    // Mock seal circle
    page.drawCircle({
      x: width - 120,
      y: height - 380,
      size: 35,
      borderColor: rgb(0.1, 0.4, 0.8),
      borderWidth: 1.5,
    });
    page.drawText('VERIFIED', {
      x: width - 142,
      y: height - 384,
      size: 8.5,
      font: fontBold,
      color: rgb(0.1, 0.4, 0.8),
    });
  }

  const uint8 = await doc.save();
  return uint8.buffer as ArrayBuffer;
}

// Compute SHA-256 hash using browser Web Crypto API
export async function computeFileHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Pre-packaged realistic sample PDFs for instant demo testing!
export async function generateDemoPdfs(): Promise<UploadedFileItem[]> {
  const items: { name: string; title: string; pages: number; duplicateWith?: string }[] = [
    { name: 'Trade_License_2026_2027.pdf', title: 'Trade License (Valid to June 2027)', pages: 2 },
    { name: 'TIN_Certificate_NBR.pdf', title: 'Tax Identification Number (TIN) Certificate', pages: 1 },
    { name: 'VAT_BIN_13Digit_Certified.pdf', title: 'VAT BIN Registration Certificate', pages: 1 },
    { name: 'Bank_Solvency_Certificate_Sonali.pdf', title: 'Bank Solvency Letter (Credit BDT 25M)', pages: 1 },
    { name: 'Past_Experience_Completion_Cert.pdf', title: 'Similar Past Experience Certificates', pages: 3 },
    { name: 'ISO_9001_Quality_Certificate.pdf', title: 'ISO 9001:2015 Quality Certificate', pages: 2 },
    { name: 'Technical_Specification_Schedule.pdf', title: 'Technical Proposal Specification Schedule', pages: 4 },
    { name: 'Financial_Price_Schedule_Signed.pdf', title: 'Financial Bid Schedule Form PG4', pages: 2 },
    { name: 'Manufacturer_Authorization_Form_MAF.pdf', title: 'Manufacturer Authorization Form (Dell/HP)', pages: 1 },
    // Intentional Duplicate file to test duplicate detection (Task 4.6):
    { name: 'TIN_Certificate_Duplicate_Copy.pdf', title: 'Tax Identification Number (TIN) Certificate', pages: 1, duplicateWith: 'TIN_Certificate_NBR.pdf' },
  ];

  const results: UploadedFileItem[] = [];
  const hashCache: Record<string, string> = {};

  for (const item of items) {
    // If it's a duplicate, use identical payload to ensure same SHA-256 hash
    const payload = item.duplicateWith ? 'IDENTICAL_DUPLICATE_PAYLOAD' : (item.name.includes('TIN_Certificate_NBR') ? 'IDENTICAL_DUPLICATE_PAYLOAD' : Math.random().toString());
    const buffer = await createMockPdf(item.title, item.pages, payload);
    const hash = await computeFileHash(buffer);

    const isDuplicate = Boolean(hashCache[hash]);
    const duplicateOfName = hashCache[hash];
    if (!hashCache[hash]) {
      hashCache[hash] = item.name;
    }

    results.push({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: item.name,
      size: buffer.byteLength,
      pageCount: item.pages,
      hash,
      isDuplicate,
      duplicateOfName,
      isCorrupt: false,
      buffer,
      uploadedAt: new Date().toLocaleTimeString(),
    });
  }

  return results;
}
