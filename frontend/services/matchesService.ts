
import { BASE_URL, SportsDbEvent, fetchEventsByDate } from './theSportsDbService';

// --- Domain Models ---

export type MatchStatus = 'upcoming' | 'finished' | 'live' | 'postponed' | 'cancelled';

export type EventType = 'goal' | 'yellow_card' | 'red_card' | 'sub';
export type TeamSide = 'home' | 'away';

export interface MatchEvent {
    id: string;
    time: string;
    type: EventType;
    player: string;
    assist?: string;
    side: TeamSide;
}

export interface MatchStat {
    label: string;
    homeValue: number | string;
    awayValue: number | string;
    homePercent?: number;
    awayPercent?: number;
}

export interface MatchCardData {
    id: string;
    leagueId: string;
    leagueName: string;
    leagueBadge?: string | null;
    homeTeam: {
        id: string;
        name: string;
        badgeUrl?: string | null;
    };
    awayTeam: {
        id: string;
        name: string;
        badgeUrl?: string | null;
    };
    status: string;
    rawStatus: string;
    date: string;
    time: string;
    homeScore?: number;
    awayScore?: number;
}

export interface MatchDetails {
    id: string;
    status: MatchStatus;
    leagueName: string;
    leagueBadge?: string | null;
    date: string;
    time: string;
    stadium?: string;
    city?: string;
    homeTeam: {
        id: string;
        name: string;
        shortName: string;
        logoUrl?: string | null;
    };
    awayTeam: {
        id: string;
        name: string;
        shortName: string;
        logoUrl?: string | null;
    };
    score?: {
        home: number;
        away: number;
    };
    events?: MatchEvent[];
    stats?: MatchStat[];
}

// --- Mappers ---

function mapStatus(strStatus: string): MatchStatus {
    const status = strStatus.toLowerCase();
    if (status.includes('finish') || status.includes('ft')) return 'finished';
    if (status.includes('upcoming') || status.includes('not started')) return 'upcoming';
    if (status.includes('live')) return 'live';
    if (status.includes('postponed')) return 'postponed';
    if (status.includes('cancel')) return 'cancelled';
    return 'upcoming'; // Default fallback
}

function mapEventType(type: string): EventType {
    const t = type.toLowerCase();
    if (t.includes('goal')) return 'goal';
    if (t.includes('card')) {
        if (t.includes('yellow')) return 'yellow_card';
        if (t.includes('red')) return 'red_card';
    }
    if (t.includes('sub')) return 'sub';
    return 'goal'; // fallback
}

// --- Service Functions ---

/**
 * Fetch matches by day and normalize them.
 */
export async function fetchMatchesByDay(date: string, sport: string): Promise<MatchCardData[]> {
    const events = await fetchEventsByDate(date, sport);
    if (!events) return [];

    return events.map(e => ({
        id: e.idEvent,
        leagueId: e.idLeague,
        leagueName: e.strLeague,
        leagueBadge: e.strLeagueBadge,
        homeTeam: {
            id: e.idHomeTeam || '',
            name: e.strHomeTeam,
            badgeUrl: e.strHomeTeamBadge,
        },
        awayTeam: {
            id: e.idAwayTeam || '',
            name: e.strAwayTeam,
            badgeUrl: e.strAwayTeamBadge,
        },
        status: e.strStatus,
        rawStatus: e.strStatus,
        date: e.dateEvent,
        time: e.strTime?.substring(0, 5) || '',
        homeScore: e.intHomeScore ? parseInt(e.intHomeScore) : undefined,
        awayScore: e.intAwayScore ? parseInt(e.intAwayScore) : undefined,
    }));
}

/**
 * Fetch full match details including timeline and stats
 */
export async function fetchMatchDetails(idEvent: string): Promise<MatchDetails> {
    try {
        // 1. Basic Event Info
        const eventUrl = `${BASE_URL}/lookupevent.php?id=${idEvent}`;
        const eventRes = await fetch(eventUrl);
        const eventData = await eventRes.json();
        const event: SportsDbEvent = eventData.events?.[0];

        if (!event) {
            throw new Error('Match not found');
        }

        const matchStatus = mapStatus(event.strStatus);

        // Basic details
        const details: MatchDetails = {
            id: event.idEvent,
            status: matchStatus,
            leagueName: event.strLeague,
            leagueBadge: event.strLeagueBadge,
            date: event.dateEvent,
            time: event.strTime?.substring(0, 5) || '', // "15:00:00" -> "15:00"
            stadium: '', // Not always in lookupevent, might need to rely on assumptions or other calls
            city: '',
            homeTeam: {
                id: event.idHomeTeam || '',
                name: event.strHomeTeam,
                shortName: event.strHomeTeam.substring(0, 3).toUpperCase(), // Naive short name
                logoUrl: event.strHomeTeamBadge,
            },
            awayTeam: {
                id: event.idAwayTeam || '',
                name: event.strAwayTeam,
                shortName: event.strAwayTeam.substring(0, 3).toUpperCase(),
                logoUrl: event.strAwayTeamBadge,
            },
        };

        // Add venue info if available
        const rawEvent = event as any;
        if (rawEvent.strVenue) details.stadium = rawEvent.strVenue;
        if (rawEvent.strCity) details.city = rawEvent.strCity;

        // Scores
        if (matchStatus === 'finished' || matchStatus === 'live') {
            details.score = {
                home: parseInt(event.intHomeScore || '0', 10),
                away: parseInt(event.intAwayScore || '0', 10),
            };
        }

        // 2. Timeline / Events (Only if finished/live)
        if (matchStatus === 'finished' || matchStatus === 'live') {
            try {
                const timelineUrl = `${BASE_URL}/lookuptimeline.php?id=${idEvent}`;
                const timelineRes = await fetch(timelineUrl);
                const timelineData = await timelineRes.json();
                if (timelineData.timeline) {
                    details.events = timelineData.timeline.map((e: any, index: number) => {
                        return {
                            id: `evt-${index}`,
                            time: `${e.intTime}'`,
                            type: mapEventType(e.strEvent),
                            player: e.strPlayer || '',
                            side: e.strHome ? 'home' : 'away', // Basic heuristic
                        } as MatchEvent;
                    });
                }
            } catch (err) {
                console.log('No timeline available or error', err);
            }

            // 3. Stats
            try {
                // const statsUrl = `${BASE_URL}/lookupeventstats.php?id=${idEvent}`;
                // Optional stats fetching
            } catch (err) {
                console.log('No stats available', err);
            }
        }

        return details;

    } catch (error) {
        console.error('Error fetching match details:', error);
        throw error;
    }
}
