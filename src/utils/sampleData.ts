
// Initialize sample data if not exists
export const initializeSampleData = () => {
  const existingData = localStorage.getItem("lessonCompletions");
  
  if (!existingData) {
    const sampleData = [
      // Today's lessons
      {
        id: 1,
        teacherId: 1,
        class: "9",
        subject: "Quran",
        lessonNumber: 5,
        date: new Date().toISOString().split('T')[0],
        completed: true,
        assessment: "Students showed good understanding of Tajweed rules",
        submittedAt: new Date().toISOString()
      },
      {
        id: 2,
        teacherId: 2,
        class: "10",
        subject: "Hadith",
        lessonNumber: 3,
        date: new Date().toISOString().split('T')[0],
        completed: true,
        assessment: "Excellent discussion on hadith interpretation",
        submittedAt: new Date().toISOString()
      },
      
      // This week's lessons
      {
        id: 3,
        teacherId: 1,
        class: "8",
        subject: "Aqeedah",
        lessonNumber: 2,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: true,
        assessment: "Good progress on fundamental beliefs",
        submittedAt: new Date().toISOString()
      },
      {
        id: 4,
        teacherId: 2,
        class: "11",
        subject: "Fiqh",
        lessonNumber: 7,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false,
        assessment: "Need to cover remaining topics next session",
        submittedAt: new Date().toISOString()
      },
      
      // This month's lessons
      {
        id: 5,
        teacherId: 1,
        class: "12",
        subject: "Arabic",
        lessonNumber: 10,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: true,
        assessment: "Advanced grammar concepts well understood",
        submittedAt: new Date().toISOString()
      },
      {
        id: 6,
        teacherId: 2,
        class: "9",
        subject: "Tajweed",
        lessonNumber: 4,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: true,
        assessment: "Students improving in recitation quality",
        submittedAt: new Date().toISOString()
      },
      
      // Earlier this year
      {
        id: 7,
        teacherId: 1,
        class: "8",
        subject: "Quran",
        lessonNumber: 8,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: true,
        assessment: "Memorization progress is excellent",
        submittedAt: new Date().toISOString()
      },
      {
        id: 8,
        teacherId: 2,
        class: "10",
        subject: "Aqeedah",
        lessonNumber: 6,
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: true,
        assessment: "Deep discussions on Islamic theology",
        submittedAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem("lessonCompletions", JSON.stringify(sampleData));
  }
};
