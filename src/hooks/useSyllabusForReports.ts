
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SyllabusLookup {
  [key: string]: number; // key format: "subject-class", value: total_lessons
}

export interface SyllabusData {
  subject: string;
  class: string;
  total_lessons: number;
}

export const useSyllabusForReports = () => {
  const [syllabusLookup, setSyllabusLookup] = useState<SyllabusLookup>({});
  const [syllabusData, setSyllabusData] = useState<SyllabusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSyllabus = async () => {
    if (!user) {
      setSyllabusLookup({});
      setSyllabusData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: syllabusError } = await supabase
        .from('syllabus')
        .select('subject, class, total_lessons');

      if (syllabusError) {
        setError('Failed to fetch syllabus');
        setSyllabusLookup({});
        setSyllabusData([]);
        return;
      }

      // Create lookup object for easy access
      const lookup: SyllabusLookup = {};
      data?.forEach(item => {
        const key = `${item.subject}-${item.class}`;
        lookup[key] = item.total_lessons;
      });

      setSyllabusLookup(lookup);
      setSyllabusData(data || []);
    } catch (err) {
      console.error('Error fetching syllabus for reports:', err);
      setError('An unexpected error occurred');
      setSyllabusLookup({});
      setSyllabusData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, [user]);

  const getTotalLessons = (subject: string, className: string): number => {
    const key = `${subject}-${className}`;
    return syllabusLookup[key] || 0;
  };

  return {
    syllabusLookup,
    syllabusData,
    loading,
    error,
    getTotalLessons,
    refetch: fetchSyllabus
  };
};
