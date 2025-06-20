
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateTablePDF = async (
  tableElement: HTMLElement,
  filename: string,
  title: string
) => {
  try {
    const canvas = await html2canvas(tableElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.getImageData();
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 20, 20);
    
    // Calculate dimensions
    const imgWidth = 170;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 40;

    // Add image to PDF
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - position - 20;

    // Add new pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 20;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const generateCustomPDF = (
  content: string,
  filename: string,
  title: string
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Add title
  pdf.setFontSize(16);
  pdf.text(title, 20, 20);
  
  // Add content
  pdf.setFontSize(12);
  const lines = pdf.splitTextToSize(content, 170);
  pdf.text(lines, 20, 40);
  
  pdf.save(filename);
};
