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

  const profileMap: Record<string, { name?: string }> = { ...cachedProfiles };
  
  // Fetch profiles individually to handle missing records gracefully
  for (const userId of uncachedUserIds) {
    if (signal?.aborted) return null;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn(`Profile not found for user ${userId}:`, profileError);
        // Don't cache missing profiles to avoid repeated failed requests
        profileMap[userId] = { name: undefined };
      } else if (profileData) {
        profileMap[userId] = { name: profileData.name };
        
        // Update cache
        profileCache.set(userId, {
          name: profileData.name,
          timestamp: now
        });
      }
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      profileMap[userId] = { name: undefined };
    }
  }

  return profileMap;
}

// Function to clear profile cache (useful for testing or manual refresh)
export function clearProfileCache() {
  profileCache.clear();
}
