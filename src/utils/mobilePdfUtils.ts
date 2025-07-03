import jsPDF from 'jspdf';

interface LessonData {
  date: string;
  class: string;
  subject: string;
  lesson_number: string;
  completed: boolean;
  assessment: string | null;
  profiles?: { name: string };
}

export const generateMobilePDF = (
  lessons: LessonData[],
  filename: string,
  title: string
) => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  
  // Title
  pdf.setFontSize(18);
  pdf.text(title, 20, 20);
  
  // Headers
  const headers = ['Teacher', 'Class', 'Subject', 'Date', 'Lesson', 'Status', 'Assessment'];
  const colWidths = [35, 25, 30, 30, 20, 25, 110];
  let yPosition = 35;
  
  // Draw headers
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  let xPosition = 20;
  headers.forEach((header, index) => {
    pdf.text(header, xPosition, yPosition);
    xPosition += colWidths[index];
  });
  
  // Draw header line
  yPosition += 5;
  pdf.line(20, yPosition, 275, yPosition);
  yPosition += 10;
  
  // Data rows
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  
  lessons.forEach((lesson) => {
    if (yPosition > 190) { // Page break
      pdf.addPage('landscape');
      yPosition = 20;
      
      // Redraw headers on new page
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(12);
      let headerX = 20;
      headers.forEach((header, index) => {
        pdf.text(header, headerX, yPosition);
        headerX += colWidths[index];
      });
      yPosition += 5;
      pdf.line(20, yPosition, 275, yPosition);
      yPosition += 10;
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(10);
    }
    
    const rowData = [
      lesson.profiles?.name || 'Unknown Teacher',
      `Class ${lesson.class}`,
      lesson.subject,
      new Date(lesson.date).toLocaleDateString(),
      lesson.lesson_number,
      lesson.completed ? 'Completed' : 'In Progress',
      lesson.assessment || '-'
    ];
    
    xPosition = 20;
    rowData.forEach((data, index) => {
      const text = String(data);
      if (index === 6) { // Assessment column - wrap text
        const lines = pdf.splitTextToSize(text, colWidths[index] - 5);
        pdf.text(lines, xPosition, yPosition);
      } else {
        pdf.text(text, xPosition, yPosition);
      }
      xPosition += colWidths[index];
    });
    
    yPosition += 15;
  });
  
  pdf.save(filename);
};

export const generateMobileTablePDF = async (
  tableElement: HTMLElement,
  filename: string,
  title: string
) => {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // For mobile, use text-based PDF generation
    const lessons = extractLessonDataFromTable(tableElement);
    generateMobilePDF(lessons, filename, title);
    return;
  }
  
  // For desktop, use the existing image-based approach with optimized settings
  const html2canvas = (await import('html2canvas')).default;
  
  const canvas = await html2canvas(tableElement, {
    scale: 1.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: Math.min(tableElement.scrollWidth, 1200),
    height: tableElement.scrollHeight,
    scrollX: 0,
    scrollY: 0
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  
  // Add title
  pdf.setFontSize(16);
  pdf.text(title, 20, 20);
  
  // Calculate dimensions for landscape
  const imgWidth = 250;
  const pageHeight = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 40;
  
  // Add image to PDF
  pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
  heightLeft -= pageHeight - position - 20;
  
  // Add new pages if needed
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight + 20;
    pdf.addPage('landscape');
    pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;
  }
  
  pdf.save(filename);
};

const extractLessonDataFromTable = (tableElement: HTMLElement): LessonData[] => {
  const lessons: LessonData[] = [];
  const rows = tableElement.querySelectorAll('tbody tr');
  
  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 7) {
      lessons.push({
        profiles: { name: cells[0]?.textContent?.trim() || 'Unknown Teacher' },
        class: cells[1]?.textContent?.trim().replace('Class ', '') || '',
        subject: cells[2]?.textContent?.trim() || '',
        date: cells[3]?.textContent?.trim() || '',
        lesson_number: cells[4]?.textContent?.trim() || '',
        completed: cells[5]?.textContent?.trim() === 'Completed',
        assessment: cells[6]?.textContent?.trim() || null
      });
    }
  });
  
  return lessons;
};