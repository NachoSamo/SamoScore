import { supabase } from '@/lib/supabase';

export interface UserFavoriteLeague {
    id?: number; // bigserial
    user_id: string;
    id_league: number;
    str_league: string;
    str_sport: string | null;
    str_country: string | null;
    badge_url: string | null;
    created_at?: string;
}

export interface UserFavoriteTeam {
    id?: number;
    user_id: string;
    id_team: number;
    str_team: string;
    id_league?: number;
    str_league?: string;
    str_sport?: string;
    str_country?: string;
    badge_url?: string | null;
    created_at?: string;
}

export interface UserFavoriteSport {
    id?: number;
    user_id: string;
    str_sport: string;
    created_at?: string;
}

// ... existing League functions ...

export const getUserFavoriteLeagues = async (userId: string): Promise<UserFavoriteLeague[]> => {
    try {
        const { data, error } = await supabase
            .from('user_favorite_leagues')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching favorites:', error);
        return [];
    }
};

export const addUserFavoriteLeague = async (favorite: UserFavoriteLeague) => {
    try {
        const { data, error } = await supabase
            .from('user_favorite_leagues')
            .insert(favorite)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};

export const removeUserFavoriteLeague = async (userId: string, leagueId: number) => {
    try {
        const { error } = await supabase
            .from('user_favorite_leagues')
            .delete()
            .eq('user_id', userId)
            .eq('id_league', leagueId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

// Teams
export const getUserFavoriteTeams = async (userId: string): Promise<UserFavoriteTeam[]> => {
    try {
        const { data, error } = await supabase
            .from('user_favorite_teams')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching favorite teams:', error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching favorite teams:', error);
        return [];
    }
};

export const addUserFavoriteTeam = async (favorite: UserFavoriteTeam) => {
    try {
        const { data, error } = await supabase
            .from('user_favorite_teams')
            .insert(favorite)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding favorite team:', error);
        throw error;
    }
};

export const removeUserFavoriteTeam = async (userId: string, teamId: number) => {
    try {
        const { error } = await supabase
            .from('user_favorite_teams')
            .delete()
            .eq('user_id', userId)
            .eq('id_team', teamId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing favorite team:', error);
        throw error;
    }
};

// Sports
export const getUserFavoriteSports = async (userId: string): Promise<UserFavoriteSport[]> => {
    try {
        const { data, error } = await supabase
            .from('user_favorite_sports')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching favorite sports:', error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching favorite sports:', error);
        return [];
    }
};

export const addUserFavoriteSport = async (favorite: UserFavoriteSport) => {
    try {
        const { data, error } = await supabase
            .from('user_favorite_sports')
            .insert(favorite)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding favorite sport:', error);
        throw error;
    }
};

export const removeUserFavoriteSport = async (userId: string, sportName: string) => {
    try {
        const { error } = await supabase
            .from('user_favorite_sports')
            .delete()
            .eq('user_id', userId)
            .eq('str_sport', sportName);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing favorite sport:', error);
        throw error;
    }
};
