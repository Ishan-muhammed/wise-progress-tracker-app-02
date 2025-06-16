
export interface LessonFormData {
  class: string;
  subject: string;
  lessonNumber: string;
  date: string;
  completed: boolean;
  assessment: string;
}

export interface Subject {
  name: string;
  totalLessons: number;
}

export const classes = ["8", "9", "10", "11", "12"];

export const subjects: Subject[] = [
  { name: "Aqeedah", totalLessons: 20 },
  { name: "Quran", totalLessons: 20 },
  { name: "Hadith", totalLessons: 20 },
  { name: "Tajweed", totalLessons: 20 },
  { name: "Fiqh", totalLessons: 20 },
  { name: "Arabic", totalLessons: 20 }
];
