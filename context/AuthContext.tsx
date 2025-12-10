import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken, saveToken } from '../services/auth';

interface AuthContextType {
    session: string | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export const useSession = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await getToken();
                if (token) {
                    setSession(token);
                }
            } catch (e) {
                console.error('Failed to load token', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const signIn = async (token: string) => {
        setSession(token);
        await saveToken(token);
    };

    const signOut = async () => {
        setSession(null);
        await removeToken();
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
