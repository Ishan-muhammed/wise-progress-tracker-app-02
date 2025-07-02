
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SyllabusLookup {
  [key: string]: number; // key format: "subject-class", value: total_lessons
}

export const useSyllabusForReports = (academicYear?: string) => {
  const [syllabusLookup, setSyllabusLookup] = useState<SyllabusLookup>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSyllabus = async () => {
    if (!user) {
      setSyllabusLookup({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('syllabus')
        .select('subject, class, total_lessons, academic_year');
      
      if (academicYear) {
        query = query.eq('academic_year', academicYear);
      }
      
      const { data, error: syllabusError } = await query;

      if (syllabusError) {
        setError('Failed to fetch syllabus');
        setSyllabusLookup({});
        return;
      }

      // Create lookup object for easy access
      const lookup: SyllabusLookup = {};
      data?.forEach(item => {
        const key = `${item.subject}-${item.class}`;
        lookup[key] = item.total_lessons;
      });

      setSyllabusLookup(lookup);
    } catch (err) {
      console.error('Error fetching syllabus for reports:', err);
      setError('An unexpected error occurred');
      setSyllabusLookup({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, [user, academicYear]);

  const getTotalLessons = (subject: string, className: string): number => {
    const key = `${subject}-${className}`;
    return syllabusLookup[key] || 0;
  };

  return {
    syllabusLookup,
    loading,
    error,
    getTotalLessons,
    refetch: fetchSyllabus
  };
};
