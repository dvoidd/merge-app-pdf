import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Use local worker via Vite URL import to avoid CDN and CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const mergePDFs = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  return await mergedPdf.save();
};

export const imagesToPDF = async (files: File[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const imageBytes = await file.arrayBuffer();
    let image;
    
    // Check type and embed accordingly
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      throw new Error(`Unsupported image type: ${file.type}`);
    }

    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
};

export interface PDFImageExtract {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
}

export const extractImagesFromPDF = async (file: File): Promise<PDFImageExtract[]> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Load PDF document using pdf.js
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  
  const extractedImages: PDFImageExtract[] = [];
  
  // Render each page to a canvas and convert to blob
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) continue;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    } as any;
    
    await page.render(renderContext).promise;
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas to Blob failed'));
      }, 'image/png');
    });
    
    const dataUrl = canvas.toDataURL('image/png');
    
    extractedImages.push({
      pageNumber: i,
      blob,
      dataUrl
    });
  }
  
  return extractedImages;
};

export const extractTextFromPDF = async (file: File): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Load PDF document using pdf.js
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  
  const docParagraphs = [];
  
  // Extract text from each page
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group items into lines based on Y position (bottom coordinate in PDF)
    const linesMap = new Map<number, any[]>();
    
    textContent.items.forEach((item: any) => {
      // transform[5] is the Y coordinate. Group within a 5-point tolerance.
      const y = Math.round(item.transform[5] / 5) * 5;
      if (!linesMap.has(y)) {
        linesMap.set(y, []);
      }
      linesMap.get(y)!.push(item);
    });

    // Sort lines by Y coordinate descending (PDF coordinates start from bottom left)
    const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);

    sortedY.forEach((y) => {
      const lineItems = linesMap.get(y)!;
      // Sort items within the line by X coordinate
      lineItems.sort((a, b) => a.transform[4] - b.transform[4]);

      const textRuns: any[] = [];
      let lastX = 0;

      lineItems.forEach((item, index) => {
        const x = item.transform[4];
        const fontSize = Math.abs(item.transform[0]);
        const fontName = item.fontName ? item.fontName.toLowerCase() : '';
        const isBold = fontName.includes('bold');
        const isItalic = fontName.includes('italic');

        // Estimate character width (heuristic: fontSize * 0.5)
        const charWidth = fontSize * 0.5;

        if (index > 0) {
          const gap = x - lastX;
          // If the gap is larger than 2 characters, insert spaces to simulate layout
          if (gap > charWidth * 2) {
            const spacesCount = Math.round(gap / charWidth);
            textRuns.push(new TextRun({ text: ' '.repeat(spacesCount) }));
          } else if (gap > charWidth * 0.5) {
            // normal space
            textRuns.push(new TextRun({ text: ' ' }));
          }
        }

        textRuns.push(new TextRun({
          text: item.str,
          bold: isBold,
          italics: isItalic,
          size: fontSize * 2, // docx uses half-points
        }));

        lastX = x + (item.width || (item.str.length * charWidth));
      });

      docParagraphs.push(
        new Paragraph({
          children: textRuns,
        })
      );
    });
    
    // Add page break logic if needed, but for now just add empty paragraph
    if (i < numPages) {
      docParagraphs.push(new Paragraph({ text: "" }));
    }
  }
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: docParagraphs,
    }],
  });
  
  return await Packer.toBlob(doc);
};
