import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Shield, Home, Map as MapIcon, FileText, User, Bell, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import '../pages/DashboardRedesign.css'; // Reuse existing styles
import LocationTracker from './LocationTracker';
export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    // Helper to determine active state. Matches if path starts with or is exactly.
    // We use strict match or startswith for sub-routes if any.
    const isActive = (path) => {
        if (path === '/home' && location.pathname === '/')
            return true; // special case if index redirects to home or is home
        return location.pathname.startsWith(path);
    };
    return (_jsxs("div", { className: "dashboard-container", children: [_jsx(LocationTracker, {}), _jsxs("header", { className: "app-header", children: [_jsx(Shield, { size: 22, color: "#00e676" }), _jsx("h1", { style: { flex: 1, letterSpacing: '1px', fontWeight: 800, fontSize: '1.3rem' }, children: "Tour Guard" }), _jsx("button", { onClick: () => navigate('/alerts'), style: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }, children: _jsx(Bell, { size: 22 }) }), _jsx("button", { onClick: () => navigate('/settings'), style: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }, children: _jsx(Settings, { size: 22 }) })] }), _jsx("main", { style: { paddingBottom: '80px', minHeight: 'calc(100vh - 140px)' }, children: _jsx(Outlet, {}) }), _jsxs("nav", { className: "bottom-nav", children: [_jsxs("button", { className: `nav-item ${isActive('/home') ? 'active' : ''}`, onClick: () => navigate('/home'), children: [_jsx(Home, { size: 24 }), _jsx("span", { children: t('home') })] }), _jsxs("button", { className: `nav-item ${isActive('/map') ? 'active' : ''}`, onClick: () => navigate('/map'), children: [_jsx(MapIcon, { size: 24 }), _jsx("span", { children: t('map') })] }), _jsxs("button", { className: `nav-item ${isActive('/sos') ? 'active' : ''}`, onClick: () => navigate('/sos'), children: [_jsx("div", { style: {
                                    background: '#ef4444',
                                    padding: 12,
                                    borderRadius: '50%',
                                    marginTop: -24,
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                                }, children: _jsx(Shield, { size: 24, color: "white" }) }), _jsx("span", { style: { color: '#ef4444', fontWeight: 600 }, children: t('sos') })] }), _jsxs("button", { className: `nav-item ${isActive('/tips') ? 'active' : ''}`, onClick: () => navigate('/tips'), children: [_jsx(FileText, { size: 24 }), _jsx("span", { children: t('tips') })] }), _jsxs("button", { className: `nav-item ${isActive('/profile') ? 'active' : ''}`, onClick: () => navigate('/profile'), children: [_jsx(User, { size: 24 }), _jsx("span", { children: t('profile') })] })] }), !isActive('/sos') && (_jsx("button", { className: "sos-fab-mini", onClick: () => navigate('/sos'), title: "Emergency SOS", style: {
                    position: 'fixed',
                    bottom: 110,
                    right: 18,
                    zIndex: 50,
                    width: 54,
                    height: 54,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
                }, children: _jsx("span", { style: { fontSize: 24, lineHeight: 1 }, children: "\uD83D\uDEA8" }) }))] }));
}
