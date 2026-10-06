import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { 
  RequirementStatusResult, 
  SealConfig, 
  TenderHeader 
} from '../types/tenderPackage';

export interface PackageBuildOptions {
  includeIndexPage?: boolean;
  sealConfig?: SealConfig;
}

export async function buildTenderPackagePdf(
  tender: TenderHeader,
  statusResults: RequirementStatusResult[],
  options: PackageBuildOptions = {}
): Promise<{ pdfBytes: Uint8Array; fileName: string; totalPages: number }> {
  const mergedPdf = await PDFDocument.create();
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await mergedPdf.embedFont(StandardFonts.Courier);

  // Filter only included documents (matched files that are OK)
  const includedDocs = statusResults.filter(
    (res) => res.status === 'OK' && res.matchedFile
  );

  const packageCreationDate = new Date().toISOString().split('T')[0];

  // ==========================================
  // PAGE 1: COVER PAGE (Rule 6.1)
  // Shows: tender ID, tender title, procuring entity, bidder name,
  // submission deadline, date package made, and list of included documents in order.
  // ==========================================
  const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4 size in points
  const { width: pageWidth, height: pageHeight } = coverPage.getSize();

  // Top header banner box
  coverPage.drawRectangle({
    x: 40,
    y: pageHeight - 110,
    width: pageWidth - 80,
    height: 70,
    color: rgb(0.08, 0.12, 0.18),
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 55,
    y: pageHeight - 75,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  coverPage.drawText('OFFICIAL BID COMPLIANCE DOSSIER', {
    x: 55,
    y: pageHeight - 95,
    size: 9,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.9),
  });

  // Tender Metadata Grid
  let currentY = pageHeight - 140;
  const drawMetaRow = (label: string, value: string) => {
    coverPage.drawText(label.toUpperCase(), {
      x: 50,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.35, 0.4, 0.45),
    });
    coverPage.drawText(value, {
      x: 200,
      y: currentY,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.12, 0.15),
    });
    coverPage.drawLine({
      start: { x: 50, y: currentY - 6 },
      end: { x: pageWidth - 50, y: currentY - 6 },
      thickness: 0.5,
      color: rgb(0.88, 0.9, 0.92),
    });
    currentY -= 26;
  };

  drawMetaRow('Tender ID / Ref', tender.tender_id);
  drawMetaRow('Tender Title', tender.title);
  drawMetaRow('Procuring Entity', tender.procuring_entity);
  drawMetaRow('Bidder Name', tender.bidder);
  drawMetaRow('Submission Deadline', tender.submission_deadline);
  drawMetaRow('Package Generation Date', packageCreationDate);

  // List of Included Documents in order
  currentY -= 15;
  coverPage.drawText('LIST OF INCLUDED DOCUMENTS (IN TENDER ORDER):', {
    x: 50,
    y: currentY,
    size: 11,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.18),
  });
  currentY -= 18;

  // Table header for document list
  coverPage.drawRectangle({
    x: 50,
    y: currentY - 5,
    width: pageWidth - 100,
    height: 18,
    color: rgb(0.93, 0.95, 0.97),
  });

  coverPage.drawText('#', { x: 55, y: currentY, size: 8, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  coverPage.drawText('ID', { x: 75, y: currentY, size: 8, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  coverPage.drawText('DOCUMENT TITLE', { x: 115, y: currentY, size: 8, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  coverPage.drawText('FILE NAME', { x: 340, y: currentY, size: 8, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  coverPage.drawText('PAGES', { x: 495, y: currentY, size: 8, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  currentY -= 18;

  includedDocs.forEach((doc, idx) => {
    if (currentY > 70) {
      const isEven = idx % 2 === 0;
      if (isEven) {
        coverPage.drawRectangle({
          x: 50,
          y: currentY - 4,
          width: pageWidth - 100,
          height: 16,
          color: rgb(0.98, 0.98, 0.99),
        });
      }

      coverPage.drawText(String(doc.requirement.order), { x: 55, y: currentY, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
      coverPage.drawText(doc.requirement.id, { x: 75, y: currentY, size: 8.5, font: fontMono, color: rgb(0.2, 0.2, 0.2) });
      
      const title = doc.requirement.title_en.length > 38 
        ? doc.requirement.title_en.substring(0, 36) + '...' 
        : doc.requirement.title_en;
      coverPage.drawText(title, { x: 115, y: currentY, size: 8.5, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

      const fileName = doc.matchedFile?.name 
        ? (doc.matchedFile.name.length > 25 ? doc.matchedFile.name.substring(0, 23) + '..' : doc.matchedFile.name) 
        : '-';
      coverPage.drawText(fileName, { x: 340, y: currentY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

      const pages = doc.matchedFile?.pageCount ? String(doc.matchedFile.pageCount) : '1';
      coverPage.drawText(pages, { x: 505, y: currentY, size: 8.5, font: fontMono, color: rgb(0.2, 0.2, 0.2) });

      currentY -= 18;
    }
  });

  // Bottom official notice on cover page
  coverPage.drawText('This submission dossier has been assembled and verified according to procurement instructions.', {
    x: 50,
    y: 50,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.6),
  });

  // Track document start page numbers for the Index Page (Bonus Task 7)
  interface DocPageLocation {
    order: number;
    id: string;
    title: string;
    startPage: number;
    pageCount: number;
  }
  const docLocations: DocPageLocation[] = [];

  // If index page is requested, reserve space or create index page now
  let indexPageNumber = 0;
  let indexPage: any = null;
  if (options.includeIndexPage) {
    indexPage = mergedPdf.addPage([595.28, 841.89]);
    indexPageNumber = 2; // Cover is page 1, index is page 2
  }

  // Current page count so far: 1 (cover) + (1 if index page)
  let runningPageNumber = options.includeIndexPage ? 3 : 2;

  // ==========================================
  // APPEND DOCUMENTS IN ORDER (Rule 6.2)
  // ==========================================
  for (const docItem of includedDocs) {
    if (!docItem.matchedFile) continue;

    try {
      const sourcePdf = await PDFDocument.load(docItem.matchedFile.buffer, { ignoreEncryption: true });
      const pageIndices = sourcePdf.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);

      docLocations.push({
        order: docItem.requirement.order,
        id: docItem.requirement.id,
        title: docItem.requirement.title_en,
        startPage: runningPageNumber,
        pageCount: copiedPages.length,
      });

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
        runningPageNumber++;
      });
    } catch (err) {
      console.error(`Failed to copy pages for ${docItem.matchedFile.name}`, err);
    }
  }

  // Populate Index Page if enabled
  if (indexPage && options.includeIndexPage) {
    let indexY = pageHeight - 80;
    indexPage.drawText('TABLE OF CONTENTS / DOCUMENT INDEX', {
      x: 50,
      y: indexY,
      size: 16,
      font: fontBold,
      color: rgb(0.08, 0.12, 0.18),
    });
    indexY -= 20;

    indexPage.drawText(`Tender ID: ${tender.tender_id} | Package Reference Guide`, {
      x: 50,
      y: indexY,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.5),
    });
    indexY -= 30;

    // Header bar
    indexPage.drawRectangle({
      x: 50,
      y: indexY - 4,
      width: pageWidth - 100,
      height: 20,
      color: rgb(0.12, 0.18, 0.25),
    });
    indexPage.drawText('ORDER', { x: 55, y: indexY + 2, size: 8, font: fontBold, color: rgb(1, 1, 1) });
    indexPage.drawText('REQUIREMENT ID', { x: 105, y: indexY + 2, size: 8, font: fontBold, color: rgb(1, 1, 1) });
    indexPage.drawText('DOCUMENT TITLE', { x: 210, y: indexY + 2, size: 8, font: fontBold, color: rgb(1, 1, 1) });
    indexPage.drawText('PAGE RANGE', { x: 440, y: indexY + 2, size: 8, font: fontBold, color: rgb(1, 1, 1) });
    indexPage.drawText('TOTAL PAGES', { x: 510, y: indexY + 2, size: 8, font: fontBold, color: rgb(1, 1, 1) });
    indexY -= 22;

    docLocations.forEach((loc, idx) => {
      const isEven = idx % 2 === 0;
      if (isEven) {
        indexPage.drawRectangle({
          x: 50,
          y: indexY - 4,
          width: pageWidth - 100,
          height: 18,
          color: rgb(0.96, 0.97, 0.98),
        });
      }

      indexPage.drawText(String(loc.order), { x: 65, y: indexY + 1, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
      indexPage.drawText(loc.id, { x: 110, y: indexY + 1, size: 9, font: fontMono, color: rgb(0.2, 0.2, 0.2) });
      
      const title = loc.title.length > 34 ? loc.title.substring(0, 32) + '...' : loc.title;
      indexPage.drawText(title, { x: 210, y: indexY + 1, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

      const endPage = loc.startPage + loc.pageCount - 1;
      const rangeStr = loc.pageCount > 1 ? `Page ${loc.startPage} - ${endPage}` : `Page ${loc.startPage}`;
      indexPage.drawText(rangeStr, { x: 440, y: indexY + 1, size: 9, font: fontMono, color: rgb(0.1, 0.4, 0.7) });

      indexPage.drawText(String(loc.pageCount), { x: 525, y: indexY + 1, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

      indexY -= 20;
    });
  }

  // ==========================================
  // EMBED SEAL OR SIGNATURE (Bonus Task 7)
  // ==========================================
  let embeddedImage: any = null;
  if (options.sealConfig?.hasSeal && options.sealConfig.imageBytes) {
    try {
      embeddedImage = await mergedPdf.embedPng(options.sealConfig.imageBytes);
    } catch (e) {
      console.warn('Could not embed PNG seal/signature', e);
    }
  }

  // ==========================================
  // FOOTER ON EVERY PAGE (Rules 6.3 & 6.4)
  // "<tender_id> | Page X of Y"
  // Must be easy to read and must not cover the document's content.
  // ==========================================
  const allPages = mergedPdf.getPages();
  const totalPages = allPages.length;

  allPages.forEach((page, index) => {
    const pageNum = index + 1;
    const { width: pWidth, height: pHeight } = page.getSize();

    // Footer background band for guaranteed legibility
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pWidth,
      height: 28,
      color: rgb(0.97, 0.98, 0.99),
    });

    // Clean top boundary line for footer
    page.drawLine({
      start: { x: 0, y: 28 },
      end: { x: pWidth, y: 28 },
      thickness: 0.5,
      color: rgb(0.85, 0.88, 0.9),
    });

    // Left tender reference
    page.drawText(`${tender.tender_id} · OFFICIAL SUBMISSION PACKAGE`, {
      x: 35,
      y: 10,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.5),
    });

    // Mandatory Rule 6.3: "<tender_id> | Page X of Y"
    const footerText = `${tender.tender_id} | Page ${pageNum} of ${totalPages}`;
    const textWidth = fontBold.widthOfTextAtSize(footerText, 8.5);

    page.drawText(footerText, {
      x: pWidth - textWidth - 35,
      y: 10,
      size: 8.5,
      font: fontBold,
      color: rgb(0.12, 0.16, 0.22),
    });

    // Apply seal/signature if configured
    if (embeddedImage && options.sealConfig) {
      const shouldApply = 
        options.sealConfig.placement === 'all' ||
        (options.sealConfig.placement === 'cover' && pageNum === 1) ||
        (options.sealConfig.placement === 'last_page' && pageNum === totalPages);

      if (shouldApply) {
        const imgScale = (options.sealConfig.scale || 1) * 0.45;
        const imgWidth = embeddedImage.width * imgScale;
        const imgHeight = embeddedImage.height * imgScale;

        let sealX = pWidth - imgWidth - 40;
        let sealY = 40;

        if (options.sealConfig.position === 'bottom-left') {
          sealX = 40;
        } else if (options.sealConfig.position === 'bottom-center') {
          sealX = (pWidth - imgWidth) / 2;
        }

        page.drawImage(embeddedImage, {
          x: sealX,
          y: sealY,
          width: imgWidth,
          height: imgHeight,
        });
      }
    }
  });

  const pdfBytes = await mergedPdf.save();
  const fileName = `${tender.tender_id}_Package.pdf`;

  return {
    pdfBytes,
    fileName,
    totalPages,
  };
}
