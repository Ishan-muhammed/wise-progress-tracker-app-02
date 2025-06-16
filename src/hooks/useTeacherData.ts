
import { useState, useEffect, useCallback } from 'react';
import { useLessons } from './useLessons';
import { useTeacherProfiles } from './useTeacherProfiles';

interface TeacherData {
  teacher: {
    id: string;
    name: string;
    email: string;
    gender: string | null;
    age: number | null;
  } | null;
  lessons: any[];
  totalLessons: number;
  completedLessons: number;
  completionRate: number;
  weeklyData: { week: string; completed: number; total: number }[];
  monthlyData: { month: string; completed: number; total: number }[];
}

export const useTeacherData = (teacherId: string) => {
  const { profiles } = useTeacherProfiles();
  const { lessons, loading: lessonsLoading } = useLessons();
  const [teacherData, setTeacherData] = useState<TeacherData>({
    teacher: null,
    lessons: [],
    totalLessons: 0,
    completedLessons: 0,
    completionRate: 0,
    weeklyData: [],
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);

  const processTeacherData = useCallback(() => {
    if (!teacherId || profiles.length === 0 || lessons.length === 0) {
      setLoading(false);
      return;
    }

    const teacher = profiles.find(p => p.id === teacherId);
    const teacherLessons = lessons.filter(lesson => lesson.user_id === teacherId);
    const completedLessons = teacherLessons.filter(lesson => lesson.completed);

    // Process weekly data
    const weeklyMap = new Map();
    teacherLessons.forEach(lesson => {
      const lessonDate = new Date(lesson.date);
      const weekStart = new Date(lessonDate);
      weekStart.setDate(lessonDate.getDate() - lessonDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { completed: 0, total: 0 });
      }
      
      const weekData = weeklyMap.get(weekKey);
      weekData.total++;
      if (lesson.completed) weekData.completed++;
    });

    const weeklyData = Array.from(weeklyMap.entries())
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...data
      }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
      .slice(-8); // Last 8 weeks

    // Process monthly data
    const monthlyMap = new Map();
    teacherLessons.forEach(lesson => {
      const lessonDate = new Date(lesson.date);
      const monthKey = `${lessonDate.getFullYear()}-${lessonDate.getMonth()}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { completed: 0, total: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.total++;
      if (lesson.completed) monthData.completed++;
    });

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-');
        return {
          month: new Date(parseInt(year), parseInt(month)).toLocaleDateString('en-US', { month: 'short' }),
          ...data
        };
      })
      .slice(-6); // Last 6 months

    setTeacherData({
      teacher,
      lessons: teacherLessons,
      totalLessons: teacherLessons.length,
      completedLessons: completedLessons.length,
      completionRate: teacherLessons.length > 0 ? Math.round((completedLessons.length / teacherLessons.length) * 100) : 0,
      weeklyData,
      monthlyData
    });
    
    setLoading(false);
  }, [teacherId, profiles, lessons]);

  useEffect(() => {
    processTeacherData();
  }, [processTeacherData]);

  return { ...teacherData, loading: loading || lessonsLoading };
};
