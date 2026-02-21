import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';
// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LocationPermissionPage from './pages/LocationPermissionPage';
import HomePage from './pages/HomePage';
import ProfileManagerPage from './pages/ProfileManagerPage';
import ProfileView from './pages/ProfileView';
import MapPage from './pages/MapPage';
import IncidentReportPage from './pages/IncidentReportPage';
import SettingsPage from './pages/SettingsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SOSTrackingPage from './pages/SOSTrackingPage';
import NearbyIncidentsPage from './pages/NearbyIncidentsPage';
import NearbyPlacesPage from './pages/NearbyPlacesPage';
import CommunityPage from './pages/CommunityPage';
import ChatbotPage from './pages/ChatbotPage';
import AlertsPage from './pages/AlertsPage';
import TipsPage from './pages/TipsPage';
// Components
import DashboardLayout from './components/DashboardLayout';
import SOSButton from './components/SOSButton';
import ScrollToTop from './components/ScrollToTop';
// Helper for SOS Page
const SOSPage = () => {
    const { user } = useAuth();
    return (_jsxs("div", { style: { padding: 20, textAlign: 'center', marginTop: 100 }, children: [_jsx("h2", { children: "Emergency Mode Active" }), _jsx(SOSButton, { userId: user?.id }), _jsx("p", { style: { marginTop: 20, color: '#9ca3af' }, children: "Press and hold to send alert" })] }));
};
function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading)
        return _jsx("div", { className: "loading-container", children: _jsx("div", { className: "spinner" }) });
    if (!isAuthenticated)
        return _jsx(Navigate, { to: "/" });
    return _jsx(Outlet, {});
}
function AppContent() {
    const { isLoading, isAuthenticated } = useAuth();
    const [isCheckingLocation, setIsCheckingLocation] = useState(true);
    const [locationVerified, setLocationVerified] = useState(false);
    // Location Permission Logic (Global check for authenticated users)
    useEffect(() => {
        if (isAuthenticated) {
            const checkPermission = async () => {
                const skipped = localStorage.getItem('location_skipped') === 'true';
                if (skipped) {
                    setLocationVerified(true);
                    setIsCheckingLocation(false);
                    return;
                }
                try {
                    // Simple check if browser API works
                    if (navigator.permissions && navigator.permissions.query) {
                        navigator.permissions.query({ name: 'geolocation' }).then(result => {
                            if (result.state === 'granted')
                                setLocationVerified(true);
                        });
                    }
                }
                catch (e) {
                    console.error(e);
                }
                // Timeout to stop checking
                setTimeout(() => setIsCheckingLocation(false), 1000);
            };
            checkPermission();
        }
        else {
            setIsCheckingLocation(false);
        }
    }, [isAuthenticated]);
    const handlePermissionGranted = () => {
        setLocationVerified(true);
        localStorage.removeItem('location_skipped');
    };
    const handleSkipLocation = () => {
        setLocationVerified(true); // Allow proceeding
        localStorage.setItem('location_skipped', 'true');
    };
    if (isLoading) {
        return _jsxs("div", { className: "loading-container", children: [_jsx("div", { className: "spinner" }), _jsx("p", { children: "Loading..." })] });
    }
    return (_jsxs(Router, { children: [_jsx(ScrollToTop, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: !isAuthenticated ? _jsx(LandingPage, { onGetStarted: () => window.location.href = '/register', onLogin: () => window.location.href = '/login' }) : _jsx(Navigate, { to: "/home" }) }), _jsx(Route, { path: "/login", element: !isAuthenticated ? _jsx(LoginPage, { onSwitchToRegister: () => window.location.href = '/register' }) : _jsx(Navigate, { to: "/home" }) }), _jsx(Route, { path: "/register", element: !isAuthenticated ? _jsx(RegisterPage, { onSwitchToLogin: () => window.location.href = '/login' }) : _jsx(Navigate, { to: "/home" }) }), _jsx(Route, { element: _jsx(ProtectedRoute, {}), children: _jsxs(Route, { element: !locationVerified && !isCheckingLocation ? (_jsx(LocationPermissionPage, { onPermissionGranted: handlePermissionGranted, onSkip: handleSkipLocation })) : (_jsx(DashboardLayout, {})), children: [_jsx(Route, { path: "/home", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/map", element: _jsx(MapPage, {}) }), _jsx(Route, { path: "/profile", element: _jsx(ProfileView, {}) }), _jsx(Route, { path: "/profile-id", element: _jsx(ProfileManagerPage, {}) }), _jsx(Route, { path: "/incident-log", element: _jsx(IncidentReportPage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "/alerts", element: _jsx(AlertsPage, {}) }), _jsx(Route, { path: "/tips", element: _jsx(TipsPage, {}) }), _jsx(Route, { path: "/sos", element: _jsx(SOSPage, {}) }), _jsx(Route, { path: "/sos-tracking", element: _jsx(SOSTrackingPage, {}) }), _jsx(Route, { path: "/nearby-incidents", element: _jsx(NearbyIncidentsPage, {}) }), _jsx(Route, { path: "/places", element: _jsx(NearbyPlacesPage, {}) }), _jsx(Route, { path: "/community", element: _jsx(CommunityPage, {}) }), _jsx(Route, { path: "/chatbot", element: _jsx(ChatbotPage, {}) })] }) }), _jsx(Route, { path: "/admin", element: _jsx(AdminLoginPage, {}) }), _jsx(Route, { path: "/admin/dashboard", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/" }) })] })] }));
}
function App() {
    return (_jsx(AuthProvider, { children: _jsx(NotificationProvider, { children: _jsx(AppContent, {}) }) }));
}
export default App;
