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

  // Canonical Landscape dimensions (A4 Landscape ratio)
  const targetWidth = 842;
  const targetHeight = 595;

  // 1. Primary capture: html2canvas with untainted canvas & high DPI
  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#FAF9F6',
      logging: false,
      width: targetWidth,
      height: targetHeight,
      windowWidth: 1280,
      windowHeight: 900,
      onclone: (_clonedDoc, clonedElement) => {
        // Normalize cloned element style so it's captured in full landscape resolution
        const cert =
          clonedElement.id === 'coachspace-certificate-card'
            ? clonedElement
            : (clonedElement.querySelector('#coachspace-certificate-card') as HTMLElement) ||
              clonedElement;

        cert.style.transform = 'none';
        cert.style.width = `${targetWidth}px`;
        cert.style.height = `${targetHeight}px`;
        cert.style.minWidth = `${targetWidth}px`;
        cert.style.minHeight = `${targetHeight}px`;
        cert.style.maxWidth = `${targetWidth}px`;
        cert.style.maxHeight = `${targetHeight}px`;
        cert.style.margin = '0';
        cert.style.boxSizing = 'border-box';
      },
    });
    imgData = canvas.toDataURL('image/png', 1.0);
  } catch (canvasErr) {
    console.warn('html2canvas capture warning, attempting fallback:', canvasErr);
  }

  // 2. Fallback capture: html-to-image
  if (!imgData) {
    try {
      const { toPng } = await import('html-to-image');
      imgData = await toPng(element, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#FAF9F6',
        width: targetWidth,
        height: targetHeight,
        style: {
          transform: 'none',
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
          minWidth: `${targetWidth}px`,
          minHeight: `${targetHeight}px`,
          maxWidth: `${targetWidth}px`,
          maxHeight: `${targetHeight}px`,
          margin: '0',
          boxSizing: 'border-box',
        },
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

      const pdfPageWidth = 297;
      const pdfPageHeight = 210;

      // Fit full bleed / subtle edge margin (5mm)
      const margin = 6;
      const availableWidth = pdfPageWidth - margin * 2;
      const availableHeight = pdfPageHeight - margin * 2;

      const ratio = targetHeight / targetWidth;
      let renderWidth = availableWidth;
      let renderHeight = availableWidth * ratio;

      if (renderHeight > availableHeight) {
        renderHeight = availableHeight;
        renderWidth = availableHeight / ratio;
      }

      const posX = (pdfPageWidth - renderWidth) / 2;
      const posY = (pdfPageHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'SLOW');

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
