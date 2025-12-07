export const API_KEY = process.env.EXPO_PUBLIC_THESPORTSDB_API_KEY || '123';
export const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

// --- Types ---

export interface SportsDbEvent {
    idEvent: string;
    idLeague: string;
    strLeague: string;
    strHomeTeam: string;
    strAwayTeam: string;
    intHomeScore: string | null;
    intAwayScore: string | null;
    dateEvent: string; // "YYYY-MM-DD"
    strTime: string; // "HH:mm:ss"
    strStatus: string; // "Match Finished", "Not Started", etc.
    strThumb?: string | null;
    strVideo?: string | null;
    idHomeTeam?: string;
    idAwayTeam?: string;
    strLeagueBadge?: string | null;
    strHomeTeamBadge?: string | null;
    strAwayTeamBadge?: string | null;
}

export interface SportsDbLeague {
    idLeague: string;
    strLeague: string;
    strSport: string;
    strLeagueAlternate?: string;
}

export interface SportsDbTableEntry {
    idStanding: string;
    intRank: string;
    idTeam: string;
    strTeam: string;
    strTeamBadge?: string;
    idLeague: string;
    strLeague: string;
    strSeason: string;
    intPlayed: string;
    intWin: string;
    intDraw: string;
    intLoss: string;
    intGoalsFor: string;
    intGoalsAgainst: string;
    intGoalDifference: string;
    intPoints: string;
}

// --- Service Functions ---

/**
 * Fetch matches for a specific date.
 * @param date YYYY-MM-DD string
 * @param sport Optional sport filter (default 'Soccer')
 */
export const fetchEventsByDate = async (date: string, sport: string = 'Soccer'): Promise<SportsDbEvent[]> => {
    try {
        const url = `${BASE_URL}/eventsday.php?d=${date}&s=${encodeURIComponent(sport)}`;
        console.log('Fetching events:', url);
        const response = await fetch(url);
        const data = await response.json();
        return data.events || [];
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
};

/**
 * Fetch league standings table.
 * @param leagueId TheSportsDB League ID
 * @param season Optional season string (e.g. '2024-2025')
 */
export const fetchLeagueTable = async (leagueId: string | number, season?: string): Promise<SportsDbTableEntry[]> => {
    try {
        let url = `${BASE_URL}/lookuptable.php?l=${leagueId}`;
        if (season) {
            url += `&s=${season}`;
        }
        console.log('Fetching table:', url);
        const response = await fetch(url);
        const data = await response.json();
        return data.table || [];
    } catch (error) {
        console.error('Error fetching league table:', error);
        return [];
    }
};

/**
 * Fetch details for a specific league (useful for icons etc).
 */
export const fetchLeagueDetails = async (leagueId: string | number): Promise<SportsDbLeague | null> => {
    try {
        const url = `${BASE_URL}/lookupleague.php?id=${leagueId}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.leagues?.[0] || null;
    } catch (error) {
        console.error('Error fetching league details:', error);
        return null;
    }
}

/**
 * Fetch all available leagues.
 */
export const fetchAllLeagues = async (): Promise<SportsDbLeague[]> => {
    try {
        const url = `${BASE_URL}/all_leagues.php`;
        console.log('Fetching all leagues:', url);
        const response = await fetch(url);
        const data = await response.json();
        return data.leagues || [];
    } catch (error) {
        console.error('Error fetching all leagues:', error);
        return [];
    }
};
