import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Asks the backend who we are. The JWT lives in an HttpOnly cookie,
    // so JavaScript can't read it, the server has to tell us.

    const refresh = async () => {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            setUser(res.ok ? await res.json() : null);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, []);

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        setUser(null);
    };

    return (
        <AuthContext.Provider value ={{ user, loading, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);