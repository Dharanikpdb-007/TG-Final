import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();
                    if (!error && data) {
                        setUser(data);
                    }
                }
            }
            catch (error) {
                console.error('Auth initialization error:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        initAuth();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                (async () => {
                    const { data } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();
                    if (data) {
                        setUser(data);
                    }
                })();
            }
            else {
                setUser(null);
            }
        });
        return () => {
            subscription?.unsubscribe();
        };
    }, []);
    const signUp = async (email, password, name, phone) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });
        if (authError) {
            console.error('Auth signUp error:', authError);
            throw authError;
        }
        if (authData.user) {
            const { error: userError } = await supabase
                .from('users')
                .insert({
                id: authData.user.id,
                email,
                name,
                phone,
                email_verified: false,
                phone_verified: false,
                emergency_mode_active: false,
            });
            if (userError) {
                console.error('User insert error:', userError);
                throw new Error(`Failed to create user profile: ${userError.message}`);
            }
            const { error: settingsError } = await supabase
                .from('app_settings')
                .insert({
                user_id: authData.user.id,
                emergency_auto_alert: true,
                location_tracking_enabled: true,
                share_location_with_contacts: true,
                sos_sound_enabled: true,
                sos_vibration_enabled: true,
                emergency_mode_timeout_minutes: 30,
                two_factor_enabled: false,
            });
            if (settingsError) {
                console.error('Settings insert error:', settingsError);
                // Don't throw here - settings are non-critical, user can still proceed
            }
        }
    };
    const signIn = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error)
            throw error;
    };
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error)
            throw error;
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isLoading,
            isAuthenticated: !!user,
            signUp,
            signIn,
            signOut,
        }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
