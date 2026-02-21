import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { ChevronLeft, Download, Trash2, Settings as SettingsIcon, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './SettingsPage.css';
export default function SettingsPage() {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const { isDark, setTheme } = useTheme();
    const { showNotification } = useNotification();
    // Notification states
    const [notifEnabled, setNotifEnabled] = useState(true);
    const [notifTypes, setNotifTypes] = useState({
        incident: true,
        zone: true,
        emergency: true,
        sos: true,
    });
    // Location states
    const [locationEnabled, setLocationEnabled] = useState(true);
    const [locationAccuracy, setLocationAccuracy] = useState('gps_network');
    const [isExporting, setIsExporting] = useState(false);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const handleLocationToggle = () => {
        if (!locationEnabled) {
            // Request location permission
            navigator.geolocation.getCurrentPosition(() => setLocationEnabled(true), () => showNotification('Location permission denied. Please enable in browser settings.', 'warning'), { enableHighAccuracy: true });
        }
        else {
            setLocationEnabled(false);
        }
    };
    const handleExportData = async () => {
        setIsExporting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showNotification('No user logged in', 'error');
                setIsExporting(false);
                return;
            }
            // Fetch all related data
            const [profile, touristRecord, contacts, incidents, locationHistory, alerts, logs] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('tourist_records').select('*').eq('user_id', user.id).single(),
                supabase.from('emergency_contacts').select('*').eq('user_id', user.id),
                supabase.from('incident_reports').select('*').eq('user_id', user.id),
                supabase.from('location_history').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(100), // Limit to last 100 for now
                supabase.from('alerts').select('*').eq('user_id', user.id),
                supabase.from('blockchain_event_logs').select('*').eq('user_id', user.id)
            ]);
            const exportData = {
                exportedAt: new Date().toISOString(),
                user: {
                    id: user.id,
                    email: user.email
                },
                profile: profile.data,
                touristRecord: touristRecord.data,
                emergencyContacts: contacts.data,
                incidents: incidents.data,
                locationHistory: locationHistory.data,
                alerts: alerts.data,
                blockchainLogs: logs.data
            };
            // Create download
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tourguard-data-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('Your data export has been downloaded successfully.', 'success');
        }
        catch (error) {
            console.error('Export failed:', error);
            showNotification('Failed to export data. Please try again.', 'error');
        }
        finally {
            setIsExporting(false);
        }
    };
    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('Are you absolutely sure? This action cannot be undone.');
        if (confirmed) {
            try {
                await signOut();
                navigate('/');
            }
            catch (error) {
                console.error(error);
            }
        }
    };
    const toggleNotifType = (key) => {
        setNotifTypes(prev => ({ ...prev, [key]: !prev[key] }));
    };
    // Custom toggle component
    const Toggle = ({ on, onToggle }) => (_jsx("div", { className: "s-toggle", "data-on": on, onClick: onToggle, children: _jsx("div", { className: "s-toggle-knob" }) }));
    // Custom checkbox
    const Checkbox = ({ checked, onChange, label }) => (_jsxs("label", { className: "s-checkbox-row", onClick: onChange, children: [_jsx("div", { className: `s-checkbox ${checked ? 'checked' : ''}`, children: checked && _jsx("span", { children: "\u2713" }) }), _jsx("span", { children: label })] }));
    // Radio item
    const RadioItem = ({ selected, label, onClick }) => (_jsxs("label", { className: "s-radio-row", onClick: onClick, children: [_jsx("div", { className: `s-radio ${selected ? 'selected' : ''}`, children: _jsx("div", { className: "s-radio-dot" }) }), _jsx("span", { children: label })] }));
    return (_jsxs("div", { className: "settings-page", children: [_jsxs("div", { className: "s-header", children: [_jsx("button", { onClick: () => navigate(-1), className: "s-back-btn", children: _jsx(ChevronLeft, { size: 24 }) }), _jsx(SettingsIcon, { size: 22, color: "#00e676" }), _jsx("h2", { children: t('settings') })] }), _jsxs("section", { className: "s-section", children: [_jsx("h3", { className: "s-section-title", children: t('languagePreferences') }), _jsxs("div", { className: "s-card", children: [_jsx("label", { className: "s-label", children: t('selectLanguage') }), _jsxs("select", { className: "s-select", value: language, onChange: (e) => setLanguage(e.target.value), children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "hi", children: "\u0939\u093F\u0928\u094D\u0926\u0940 (Hindi)" }), _jsx("option", { value: "ta", children: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD (Tamil)" }), _jsx("option", { value: "es", children: "Espa\u00F1ol (Spanish)" }), _jsx("option", { value: "fr", children: "Fran\u00E7ais (French)" })] })] })] }), _jsxs("section", { className: "s-section", children: [_jsx("h3", { className: "s-section-title", children: t('notifications') }), _jsxs("div", { className: "s-card", children: [_jsxs("div", { className: "s-row-between", children: [_jsxs("div", { children: [_jsx("span", { className: "s-row-label", children: t('enableNotifications') }), _jsx("span", { className: "s-row-desc", children: t('enableNotificationsDesc') })] }), _jsx(Toggle, { on: notifEnabled, onToggle: () => setNotifEnabled(!notifEnabled) })] }), notifEnabled && (_jsxs("div", { className: "s-sub-section", children: [_jsx("span", { className: "s-sub-label", children: t('notificationTypes') }), _jsx(Checkbox, { checked: notifTypes.incident, onChange: () => toggleNotifType('incident'), label: t('incidentNotifications') }), _jsx(Checkbox, { checked: notifTypes.zone, onChange: () => toggleNotifType('zone'), label: t('zoneAlerts') }), _jsx(Checkbox, { checked: notifTypes.emergency, onChange: () => toggleNotifType('emergency'), label: t('emergencyNotifications') }), _jsx(Checkbox, { checked: notifTypes.sos, onChange: () => toggleNotifType('sos'), label: t('sosAlerts') })] }))] })] }), _jsxs("section", { className: "s-section", children: [_jsx("h3", { className: "s-section-title", children: t('locationPrivacy') }), _jsxs("div", { className: "s-card", children: [_jsxs("div", { className: "s-row-between", children: [_jsxs("div", { children: [_jsx("span", { className: "s-row-label", children: t('locationServices') }), _jsx("span", { className: "s-row-desc", children: t('locationServicesDesc') })] }), _jsx(Toggle, { on: locationEnabled, onToggle: handleLocationToggle })] }), locationEnabled && (_jsxs("div", { className: "s-sub-section", children: [_jsx("span", { className: "s-sub-label", children: t('locationAccuracy') }), _jsx(RadioItem, { selected: locationAccuracy === 'gps_network', label: `High (${t('locationNetwork')})`, onClick: () => setLocationAccuracy('gps_network') }), _jsx(RadioItem, { selected: locationAccuracy === 'gps', label: t('locationOnly'), onClick: () => setLocationAccuracy('gps') }), _jsx(RadioItem, { selected: locationAccuracy === 'network', label: t('networkOnly'), onClick: () => setLocationAccuracy('network') })] }))] })] }), _jsxs("section", { className: "s-section", children: [_jsx("h3", { className: "s-section-title", children: t('appearance') }), _jsx("div", { className: "s-card", children: _jsxs("div", { className: "s-row-between", children: [_jsxs("div", { children: [_jsx("span", { className: "s-row-label", children: t('darkTheme') }), _jsx("span", { className: "s-row-desc", children: t('darkThemeDesc') })] }), _jsx(Toggle, { on: isDark, onToggle: () => setTheme(isDark ? 'light' : 'dark') })] }) })] }), _jsxs("section", { className: "s-section", children: [_jsx("h3", { className: "s-section-title", children: t('dataPrivacy') }), _jsxs("div", { className: "s-card", style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsxs("button", { className: "s-btn-outline", onClick: handleExportData, disabled: isExporting, children: [_jsx(Download, { size: 18 }), isExporting ? 'Exporting...' : t('exportData')] }), _jsxs("button", { className: "s-btn-danger", onClick: handleDeleteAccount, children: [_jsx(Trash2, { size: 18 }), t('deleteAccount')] })] })] }), _jsxs("section", { className: "s-footer", children: [_jsx(Shield, { size: 28, style: { opacity: 0.3 } }), _jsx("p", { children: "Version 1.0.2" })] })] }));
}
