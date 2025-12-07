import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any, data: any }>;
    signUp: (email: string, password: string) => Promise<{ error: any, data: any }>;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: false,
    signIn: async () => ({ error: null, data: null }),
    signUp: async () => ({ error: null, data: null }),
    signOut: () => { },
});

export function useSession() {
    const value = useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }
    return value;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and subscribe to auth changes
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        // No need to set isLoading(true) here as onAuthStateChange will trigger updates
        // but for better UX we often want to return the promise result to the UI
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    };

    const signUp = async (email: string, password: string) => {
        return await supabase.auth.signUp({
            email,
            password,
        });
    };

    const signOut = async () => {
        console.log("Sign out requested");
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Sign out error:", error);
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
                signIn,
                signUp,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
