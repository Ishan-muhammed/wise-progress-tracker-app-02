
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
  includeArchived?: boolean;
}

export const useTeacherData = (teacherId: string, options: UseTeacherDataOptions = {}) => {
  const { profiles: activeProfiles } = useTeacherProfiles({ statusFilter: 'active' });
  const { profiles: archivedProfiles } = useTeacherProfiles({ statusFilter: 'archived' });
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

  const { weeklyStartDate, monthlyStartDate, includeArchived = false } = options;

  const processTeacherData = useCallback(() => {
    if (!teacherId || lessons.length === 0) {
      setLoading(false);
      return;
    }

    // Combine active and archived profiles if needed
    const allProfiles = includeArchived 
      ? [...activeProfiles, ...archivedProfiles]
      : activeProfiles;

    if (allProfiles.length === 0) {
      setLoading(false);
      return;
    }

    const teacher = allProfiles.find(p => p.id === teacherId);
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
  }, [teacherId, activeProfiles, archivedProfiles, lessons, weeklyStartDate, monthlyStartDate, includeArchived]);

  useEffect(() => {
    processTeacherData();
  }, [processTeacherData]);

  return { ...teacherData, loading: loading || lessonsLoading };
};
