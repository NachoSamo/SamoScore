import { supabase } from '@/lib/supabase';

export interface UserProfile {
    user_id: string;
    full_name: string | null;
    fav_sport: string | null;
    avatar_url?: string | null;
    has_completed_onboarding?: boolean;
    created_at?: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Unexpected error fetching profile:', error);
        return null;
    }
};

export const upsertUserProfile = async (profile: Partial<UserProfile> & { user_id: string }) => {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .upsert(profile)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error upserting profile:', error);
        throw error;
    }
};

export const ensureUserProfileExists = async (userId: string, email: string) => {
    const profile = await getUserProfile(userId);
    if (!profile) {
        // Create initial profile
        await upsertUserProfile({
            user_id: userId,
            full_name: email.split('@')[0], // Default name
            has_completed_onboarding: false
        });
    }
    return profile;
};

export const completeOnboarding = async (userId: string) => {
    return await upsertUserProfile({
        user_id: userId,
        has_completed_onboarding: true
    });
};
