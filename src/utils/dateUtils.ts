
export const formatDateToString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const normalizeDateString = (dateStr: string): string => {
  let normalizedDate = dateStr;
  
  // Handle different date formats and normalize to YYYY-MM-DD
  if (typeof normalizedDate === 'string') {
    // If it's an ISO string with time, extract just the date part
    if (normalizedDate.includes('T')) {
      normalizedDate = normalizedDate.split('T')[0];
    }
    // Convert M/D/YYYY to YYYY-MM-DD
    else if (normalizedDate.includes('/')) {
      const parts = normalizedDate.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        normalizedDate = `${year}-${month}-${day}`;
      }
    }
    // Convert MM-DD-YYYY to YYYY-MM-DD
    else if (normalizedDate.includes('-') && normalizedDate.length === 10) {
      const parts = normalizedDate.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        const month = parts[0];
        const day = parts[1];
        const year = parts[2];
        normalizedDate = `${year}-${month}-${day}`;
      }
    }
  }
  
  return normalizedDate;
};

export const filterLessonsByDate = (lessons: any[], selectedDateStr: string) => {
  return lessons.filter((lesson: any) => {
    if (!lesson.date) {
      return false;
    }
    
    const normalizedLessonDate = normalizeDateString(lesson.date);
    return normalizedLessonDate === selectedDateStr;
  });
};
