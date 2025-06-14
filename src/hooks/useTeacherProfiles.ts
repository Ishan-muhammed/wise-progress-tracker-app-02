
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
        // Fetch all users who have the teacher role (including those who also have admin role)
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, 
            name, 
            email, 
            gender, 
            age,
            user_roles!inner(role)
          `)
          .eq('user_roles.role', 'teacher');

        if (error) {
          console.error('Error fetching teacher profiles:', error);
        } else {
          // Transform the data to match our interface
          const teacherProfiles = data?.map((profile: any) => ({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            gender: profile.gender,
            age: profile.age
          })) || [];
          
          setProfiles(teacherProfiles);
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
