
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  gender: string | null;
  age: number | null;
}

export const useTeacherProfiles = () => {
  const [profiles, setProfiles] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, gender, age')
          .eq('role', 'teacher');

        if (error) {
          console.error('Error fetching teacher profiles:', error);
        } else {
          setProfiles(data || []);
        }
      } catch (error) {
        console.error('Error fetching teacher profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const getTeacherName = (teacherId: string) => {
    const teacher = profiles.find(p => p.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  return { profiles, loading, getTeacherName };
};
