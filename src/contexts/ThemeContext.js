import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem('app-theme');
        return saved || 'dark';
    });
    const setTheme = (t) => {
        setThemeState(t);
        localStorage.setItem('app-theme', t);
    };
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);
    return (_jsx(ThemeContext.Provider, { value: { theme, setTheme, isDark: theme === 'dark' }, children: children }));
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error('useTheme must be used within ThemeProvider');
    return context;
}
