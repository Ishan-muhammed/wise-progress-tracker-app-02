import { useState, useEffect, useCallback } from 'react';
import { useLessons } from './useLessons';
import { useTeacherProfiles } from './useTeacherProfiles';

interface TeacherLessonsData {
  teacher: {
    id: string;
    name: string;
    email: string;
    gender: string | null;
    age: number | null;
    status: 'active' | 'archived';
  } | null;
  allLessons: any[];
  completedLessons: any[];
  totalLessons: number;
  completedCount: number;
  completionRate: number;
}

interface UseTeacherLessonsOptions {
  includeArchived?: boolean;
  academicYear?: string;
}

export const useTeacherLessons = (teacherId: string, options: UseTeacherLessonsOptions = {}) => {
  const { includeArchived = false, academicYear } = options;
  
  // Fetch both active and archived profiles if needed
  const { profiles: activeProfiles } = useTeacherProfiles({ statusFilter: 'active', academicYear });
  const { profiles: archivedProfiles } = useTeacherProfiles({ statusFilter: 'archived', academicYear });
  const { lessons, loading: lessonsLoading } = useLessons();
  
  const [teacherLessonsData, setTeacherLessonsData] = useState<TeacherLessonsData>({
    teacher: null,
    allLessons: [],
    completedLessons: [],
    totalLessons: 0,
    completedCount: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  const processTeacherLessons = useCallback(() => {
    if (!teacherId || lessons.length === 0) {
      setLoading(false);
      return;
    }

    // Combine active and archived profiles if needed
    const allProfiles = includeArchived 
      ? [...activeProfiles, ...archivedProfiles]
      : activeProfiles;

    const teacher = allProfiles.find(p => p.id === teacherId);
    if (!teacher) {
      setLoading(false);
      return;
    }

    // Filter lessons for this teacher
    let teacherLessons = lessons.filter(lesson => lesson.user_id === teacherId);
    
    // Filter by academic year if specified
    if (academicYear) {
      const [startYear] = academicYear.split('/');
      const academicStartDate = new Date(`${startYear}-09-01`);
      const academicEndDate = new Date(`${parseInt(startYear) + 1}-08-31`);
      
      teacherLessons = teacherLessons.filter(lesson => {
        const lessonDate = new Date(lesson.date);
        return lessonDate >= academicStartDate && lessonDate <= academicEndDate;
      });
    }

    const completedLessons = teacherLessons.filter(lesson => lesson.completed);
    const completionRate = teacherLessons.length > 0 
      ? Math.round((completedLessons.length / teacherLessons.length) * 100) 
      : 0;

    setTeacherLessonsData({
      teacher,
      allLessons: teacherLessons,
      completedLessons,
      totalLessons: teacherLessons.length,
      completedCount: completedLessons.length,
      completionRate
    });
    
    setLoading(false);
  }, [teacherId, activeProfiles, archivedProfiles, lessons, includeArchived, academicYear]);

  useEffect(() => {
    processTeacherLessons();
  }, [processTeacherLessons]);

  return { ...teacherLessonsData, loading: loading || lessonsLoading };
};