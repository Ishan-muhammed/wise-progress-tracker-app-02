
export interface AcademicYear {
  label: string; // e.g., "2025/26"
  startDate: string; // e.g., "2025-05-01"
  endDate: string; // e.g., "2026-03-31"
}

export const generateAcademicYears = (startFromYear: number = 2025, count: number = 5): AcademicYear[] => {
  const years: AcademicYear[] = [];
  
  for (let i = 0; i < count; i++) {
    const year = startFromYear + i;
    const nextYear = year + 1;
    
    years.push({
      label: `${year}/${nextYear.toString().slice(-2)}`,
      startDate: `${year}-05-01`,
      endDate: `${nextYear}-03-31`
    });
  }
  
  return years;
};

export const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // If current month is May or later, we're in the current year's academic year
  // If current month is before May, we're still in the previous year's academic year
  if (currentMonth >= 5) {
    const nextYear = currentYear + 1;
    return `${currentYear}/${nextYear.toString().slice(-2)}`;
  } else {
    const prevYear = currentYear - 1;
    return `${prevYear}/${currentYear.toString().slice(-2)}`;
  }
};

export const getAcademicYearDateRange = (academicYearLabel: string): { startDate: string; endDate: string } => {
  const [startYear, endYearShort] = academicYearLabel.split('/');
  const startYearNum = parseInt(startYear);
  const endYearNum = parseInt(`20${endYearShort}`);
  
  return {
    startDate: `${startYearNum}-05-01`,
    endDate: `${endYearNum}-03-31`
  };
};

export const getMonthsInAcademicYear = (): Array<{ value: number; label: string; academicMonth: number }> => {
  return [
    { value: 4, label: 'May', academicMonth: 1 }, // May is month 1 of academic year
    { value: 5, label: 'June', academicMonth: 2 },
    { value: 6, label: 'July', academicMonth: 3 },
    { value: 7, label: 'August', academicMonth: 4 },
    { value: 8, label: 'September', academicMonth: 5 },
    { value: 9, label: 'October', academicMonth: 6 },
    { value: 10, label: 'November', academicMonth: 7 },
    { value: 11, label: 'December', academicMonth: 8 },
    { value: 0, label: 'January', academicMonth: 9 },
    { value: 1, label: 'February', academicMonth: 10 },
    { value: 2, label: 'March', academicMonth: 11 }
  ];
};

export const getMonthDateRange = (monthValue: number, academicYearLabel: string): { startDate: string; endDate: string } => {
  const [startYear, endYearShort] = academicYearLabel.split('/');
  const startYearNum = parseInt(startYear);
  const endYearNum = parseInt(`20${endYearShort}`);
  
  let year: number;
  let month: number;
  
  // Determine which calendar year the month belongs to
  if (monthValue >= 4) { // May-December
    year = startYearNum;
    month = monthValue + 1; // Convert 0-based to 1-based
  } else { // January-March
    year = endYearNum;
    month = monthValue + 1; // Convert 0-based to 1-based
  }
  
  const startDate = new Date(year, monthValue, 1);
  const endDate = new Date(year, monthValue + 1, 0); // Last day of month
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};
