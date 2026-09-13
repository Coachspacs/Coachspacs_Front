/**
 * Generates and downloads a high-fidelity PDF from an HTML certificate element
 * directly to the user's device without print dialogs.
 * Heavy canvas & PDF libraries are dynamically imported to keep bundle size lightweight.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  fileName: string = 'certificate.pdf'
): Promise<void> {
  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  let imgData: string | null = null;

  // 1. Primary capture: html2canvas with untainted canvas
  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
    });
    imgData = canvas.toDataURL('image/png');
  } catch (canvasErr) {
    console.warn('html2canvas capture warning, attempting fallback:', canvasErr);
  }

  // 2. Fallback capture: html-to-image
  if (!imgData) {
    try {
      const { toPng } = await import('html-to-image');
      imgData = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
      });
    } catch (pngErr) {
      console.warn('html-to-image capture warning:', pngErr);
    }
  }

  // 3. If image was captured, build PDF and download
  if (imgData) {
    try {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 8;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      const elWidth = element.offsetWidth || 1;
      const elHeight = element.offsetHeight || 1;
      const ratio = elHeight / elWidth;

      let targetWidth = availableWidth;
      let targetHeight = availableWidth * ratio;

      if (targetHeight > availableHeight) {
        targetHeight = availableHeight;
        targetWidth = availableHeight / ratio;
      }

      const posX = (pageWidth - targetWidth) / 2;
      const posY = (pageHeight - targetHeight) / 2;

      pdf.addImage(imgData, 'PNG', posX, posY, targetWidth, targetHeight, undefined, 'FAST');

      // Native Blob download via anchor link
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 2000);
      return;
    } catch (pdfErr) {
      console.warn('jsPDF blob export failed, trying direct image download fallback:', pdfErr);
      const imgLink = document.createElement('a');
      imgLink.href = imgData;
      imgLink.download = cleanFileName.replace(/\.pdf$/i, '.png');
      imgLink.style.display = 'none';
      document.body.appendChild(imgLink);
      imgLink.click();
      setTimeout(() => {
        document.body.removeChild(imgLink);
      }, 2000);
      return;
    }
  }

  throw new Error('Failed to generate certificate file');
}
