
import { Lesson } from '@/types/lesson';

// Cache for profile data to avoid repeated fetches
const profileCache = new Map<string, { name?: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

// Helper to fetch profiles for lesson user IDs with caching
export async function fetchLessonProfiles(userIds: string[], signal?: AbortSignal) {
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Check cache first
  const now = Date.now();
  const cachedProfiles: Record<string, { name?: string }> = {};
  const uncachedUserIds: string[] = [];

  userIds.forEach(userId => {
    const cached = profileCache.get(userId);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      cachedProfiles[userId] = { name: cached.name };
    } else {
      uncachedUserIds.push(userId);
    }
  });

  // If all profiles are cached, return them
  if (uncachedUserIds.length === 0) {
    return cachedProfiles;
  }

  try {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', uncachedUserIds);

    if (signal?.aborted) return null;

    if (profilesError) {
      console.error('Error fetching profile names:', profilesError);
      return cachedProfiles; // Return cached data even if fetch fails
    }

    const profileMap: Record<string, { name?: string }> = { ...cachedProfiles };
    
    if (profilesData) {
      profilesData.forEach((profile: any) => {
        const profileId = String(profile.id);
        profileMap[profileId] = { name: profile.name };
        
        // Update cache
        profileCache.set(profileId, {
          name: profile.name,
          timestamp: now
        });
      });
    }

    return profileMap;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return cachedProfiles; // Return cached data on error
  }
}

// Function to clear profile cache (useful for testing or manual refresh)
export function clearProfileCache() {
  profileCache.clear();
}
