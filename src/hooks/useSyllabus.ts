
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SyllabusItem {
  id: string;
  subject: string;
  class: string;
  total_lessons: number;
  created_at: string;
  updated_at: string;
}

export const useSyllabus = () => {
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  const fetchSyllabus = async () => {
    if (!user || !isAdmin) {
      setSyllabus([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: syllabusError } = await supabase
        .from('syllabus')
        .select('*')
        .order('class', { ascending: true })
        .order('subject', { ascending: true });

      if (syllabusError) {
        setError('Failed to fetch syllabus');
        setSyllabus([]);
        return;
      }

      setSyllabus(data || []);
    } catch (err) {
      console.error('Error fetching syllabus:', err);
      setError('An unexpected error occurred');
      setSyllabus([]);
    } finally {
      setLoading(false);
    }
  };

  const addSyllabusItem = async (item: Omit<SyllabusItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('syllabus')
        .insert([item])
        .select()
        .single();

      if (error) throw error;

      setSyllabus(prev => [...prev, data]);
      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding syllabus item:', err);
      return { success: false, error: err.message };
    }
  };

  const updateSyllabusItem = async (id: string, updates: Partial<Omit<SyllabusItem, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('syllabus')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSyllabus(prev => prev.map(item => item.id === id ? data : item));
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating syllabus item:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteSyllabusItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('syllabus')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSyllabus(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting syllabus item:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, [user, isAdmin]);

  return {
    syllabus,
    loading,
    error,
    refetch: fetchSyllabus,
    addSyllabusItem,
    updateSyllabusItem,
    deleteSyllabusItem
  };
};
