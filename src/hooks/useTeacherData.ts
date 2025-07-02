
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
  weeklyData: { week: string; total: number }[];
  monthlyData: { month: string; total: number }[];
}

interface UseTeacherDataOptions {
  weeklyStartDate?: Date;
  monthlyStartDate?: Date;
  useSampleData?: boolean;
}

export const useTeacherData = (teacherId: string, options: UseTeacherDataOptions = {}) => {
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

  const { weeklyStartDate, monthlyStartDate, useSampleData = false } = options;

  const processTeacherData = useCallback(() => {
    if (!teacherId || profiles.length === 0 || lessons.length === 0) {
      setLoading(false);
      return;
    }

    const teacher = profiles.find(p => p.id === teacherId);
    const teacherLessons = lessons.filter(lesson => lesson.user_id === teacherId);
    const completedLessons = teacherLessons.filter(lesson => lesson.completed);

    // Process weekly data with proper date handling
    const weeklyMap = new Map();
    const baseWeekDate = weeklyStartDate || new Date();
    
    teacherLessons.forEach(lesson => {
      const lessonDate = new Date(lesson.date);
      const weekStart = new Date(lessonDate);
      weekStart.setDate(lessonDate.getDate() - lessonDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { total: 0, dateObj: weekStart });
      }
      
      const weekData = weeklyMap.get(weekKey);
      weekData.total++;
    });

    // Generate sample/fill weekly data if needed
    if (useSampleData) {
      const sampleWeeks = 8;
      for (let i = sampleWeeks - 1; i >= 0; i--) {
        const weekStart = new Date(baseWeekDate);
        weekStart.setDate(baseWeekDate.getDate() - (baseWeekDate.getDay() + i * 7));
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyMap.has(weekKey)) {
          const sampleTotal = Math.floor(Math.random() * 15) + 5;
          weeklyMap.set(weekKey, { 
            total: sampleTotal, 
            dateObj: weekStart 
          });
        }
      }
    }

    const weeklyData = Array.from(weeklyMap.entries())
      .map(([weekKey, data]) => ({
        week: data.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: data.total,
        sortDate: data.dateObj
      }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .slice(-8)
      .map(({ sortDate, ...rest }) => rest);

    // Process monthly data with proper date handling
    const monthlyMap = new Map();
    const baseMonthDate = monthlyStartDate || new Date();
    
    teacherLessons.forEach(lesson => {
      const lessonDate = new Date(lesson.date);
      const monthKey = `${lessonDate.getFullYear()}-${lessonDate.getMonth()}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { 
          total: 0, 
          dateObj: new Date(lessonDate.getFullYear(), lessonDate.getMonth(), 1)
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.total++;
    });

    // Generate sample/fill monthly data if needed
    if (useSampleData) {
      const sampleMonths = 6;
      for (let i = sampleMonths - 1; i >= 0; i--) {
        const monthDate = new Date(baseMonthDate.getFullYear(), baseMonthDate.getMonth() - i, 1);
        const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
        
        if (!monthlyMap.has(monthKey)) {
          const sampleTotal = Math.floor(Math.random() * 40) + 20;
          monthlyMap.set(monthKey, { 
            total: sampleTotal, 
            dateObj: monthDate 
          });
        }
      }
    }

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([monthKey, data]) => ({
        month: data.dateObj.toLocaleDateString('en-US', { month: 'short' }),
        total: data.total,
        sortDate: data.dateObj
      }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .slice(-6)
      .map(({ sortDate, ...rest }) => rest);

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
  }, [teacherId, profiles, lessons, weeklyStartDate, monthlyStartDate, useSampleData]);

  useEffect(() => {
    processTeacherData();
  }, [processTeacherData]);

  return { ...teacherData, loading: loading || lessonsLoading };
};
