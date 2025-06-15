
import { Lesson } from '@/types/lesson';

// Helper to merge teacher name into lessons
export function mergeProfiles(lessons: Lesson[], profiles: Record<string, { name?: string }>): Lesson[] {
  return lessons.map(lesson => {
    const teacherName = profiles[lesson.user_id]?.name || "Unknown Teacher";
    return {
      ...lesson,
      profiles: {
        name: teacherName
      }
    };
  });
}

// Helper to fetch profiles for lesson user IDs
export async function fetchLessonProfiles(userIds: string[], signal?: AbortSignal) {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds);

  if (signal?.aborted) return null;

  if (profilesError) {
    console.error('Error fetching profile names:', profilesError);
    return {};
  }

  const profileMap: Record<string, { name?: string }> = {};
  if (profilesData) {
    profilesData.forEach((profile: any) => {
      const profileId = String(profile.id);
      profileMap[profileId] = { name: profile.name };
    });
  }

  return profileMap;
}
