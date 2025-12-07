import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    UserFavoriteLeague, getUserFavoriteLeagues, addUserFavoriteLeague, removeUserFavoriteLeague,
    UserFavoriteTeam, getUserFavoriteTeams, addUserFavoriteTeam, removeUserFavoriteTeam,
    UserFavoriteSport, getUserFavoriteSports, addUserFavoriteSport, removeUserFavoriteSport
} from '@/services/supabaseFavoritesService';
import { useSession } from './AuthContext';

type FavoritesContextType = {
    favoriteLeagues: UserFavoriteLeague[];
    favoriteTeams: UserFavoriteTeam[];
    favoriteSports: UserFavoriteSport[];
    isLoading: boolean;
    refreshFavorites: () => Promise<void>;
    addFavorite: (league: UserFavoriteLeague) => Promise<void>;
    removeFavorite: (leagueId: number) => Promise<void>;
    isFavorite: (leagueId: number) => boolean;
    // Team methods
    addFavoriteTeam: (team: UserFavoriteTeam) => Promise<void>;
    removeFavoriteTeam: (teamId: number) => Promise<void>;
    isFavoriteTeam: (teamId: number) => boolean;
    // Sport methods
    addFavoriteSport: (sport: UserFavoriteSport) => Promise<void>;
    removeFavoriteSport: (sportName: string) => Promise<void>;
    isFavoriteSport: (sportName: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType>({
    favoriteLeagues: [],
    favoriteTeams: [],
    favoriteSports: [],
    isLoading: false,
    refreshFavorites: async () => { },
    addFavorite: async () => { },
    removeFavorite: async () => { },
    isFavorite: () => false,
    addFavoriteTeam: async () => { },
    removeFavoriteTeam: async () => { },
    isFavoriteTeam: () => false,
    addFavoriteSport: async () => { },
    removeFavoriteSport: async () => { },
    isFavoriteSport: () => false,
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
    const { session } = useSession();
    const [favoriteLeagues, setFavoriteLeagues] = useState<UserFavoriteLeague[]>([]);
    const [favoriteTeams, setFavoriteTeams] = useState<UserFavoriteTeam[]>([]);
    const [favoriteSports, setFavoriteSports] = useState<UserFavoriteSport[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshFavorites = async () => {
        if (!session?.user?.id) return;
        setIsLoading(true);
        // Parallel fetch
        const [leagues, teams, sports] = await Promise.all([
            getUserFavoriteLeagues(session.user.id),
            getUserFavoriteTeams(session.user.id),
            getUserFavoriteSports(session.user.id),
        ]);
        setFavoriteLeagues(leagues);
        setFavoriteTeams(teams);
        setFavoriteSports(sports);
        setIsLoading(false);
    };

    useEffect(() => {
        if (session?.user?.id) {
            refreshFavorites();
        } else {
            setFavoriteLeagues([]);
            setFavoriteTeams([]);
            setFavoriteSports([]);
        }
    }, [session?.user?.id]);

    // Leagues
    const addFavorite = async (league: UserFavoriteLeague) => {
        if (!session?.user?.id) return;
        setFavoriteLeagues(prev => [...prev, league]);
        try {
            await addUserFavoriteLeague(league);
            // await refreshFavorites(); 
        } catch (error) {
            console.error("Failed to add favorite league", error);
            refreshFavorites();
        }
    };

    const removeFavorite = async (leagueId: number) => {
        if (!session?.user?.id) return;
        setFavoriteLeagues(prev => prev.filter(l => l.id_league !== leagueId));
        try {
            await removeUserFavoriteLeague(session.user.id, leagueId);
        } catch (error) {
            console.error("Failed to remove favorite league", error);
            refreshFavorites();
        }
    };

    const isFavorite = (leagueId: number) => {
        return favoriteLeagues.some(l => l.id_league === leagueId);
    };

    // Teams
    const addFavoriteTeam = async (team: UserFavoriteTeam) => {
        if (!session?.user?.id) return;
        setFavoriteTeams(prev => [...prev, team]);
        try {
            await addUserFavoriteTeam(team);
        } catch (error) {
            console.error("Failed to add favorite team", error);
            refreshFavorites();
        }
    };

    const removeFavoriteTeam = async (teamId: number) => {
        if (!session?.user?.id) return;
        setFavoriteTeams(prev => prev.filter(t => t.id_team !== teamId));
        try {
            await removeUserFavoriteTeam(session.user.id, teamId);
        } catch (error) {
            console.error("Failed to remove favorite team", error);
            refreshFavorites();
        }
    };

    const isFavoriteTeam = (teamId: number) => {
        return favoriteTeams.some(t => t.id_team === teamId);
    };

    // Sports
    const addFavoriteSport = async (sport: UserFavoriteSport) => {
        if (!session?.user?.id) return;
        setFavoriteSports(prev => [...prev, sport]);
        try {
            await addUserFavoriteSport(sport);
        } catch (error) {
            console.error("Failed to add favorite sport", error);
            refreshFavorites();
        }
    };

    const removeFavoriteSport = async (sportName: string) => {
        if (!session?.user?.id) return;
        setFavoriteSports(prev => prev.filter(s => s.str_sport !== sportName));
        try {
            await removeUserFavoriteSport(session.user.id, sportName);
        } catch (error) {
            console.error("Failed to remove favorite sport", error);
            refreshFavorites();
        }
    };

    const isFavoriteSport = (sportName: string) => {
        return favoriteSports.some(s => s.str_sport === sportName);
    };

    return (
        <FavoritesContext.Provider value={{
            favoriteLeagues,
            favoriteTeams,
            favoriteSports,
            isLoading,
            refreshFavorites,
            addFavorite,
            removeFavorite,
            isFavorite,
            addFavoriteTeam,
            removeFavoriteTeam,
            isFavoriteTeam,
            addFavoriteSport,
            removeFavoriteSport,
            isFavoriteSport
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};
