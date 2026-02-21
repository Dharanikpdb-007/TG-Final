import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SOSButton from '../components/SOSButton';
import LocationTracker from '../components/LocationTracker';
import { Home, Map as MapIcon, Shield, User, Bell, CloudRain, FileText, Settings, LogOut, Phone, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import './DashboardRedesign.css';
// Import components
import SafetyMap from '../components/SafetyMap';
import EmergencyContactsList from '../components/EmergencyContactsList';
import AddContactForm from '../components/AddContactForm';
export default function DashboardRedesign() {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
    // Specific sub-views for Profile tab
    const [profileView, setProfileView] = useState('main');
    // Data State
    const [userProfile, setUserProfile] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [showAddContact, setShowAddContact] = useState(false);
    // Real-time weather mockup
    const [weather] = useState({ temp: 28, condition: 'Clear' });
    // Contacts count for badge
    const [contactCount, setContactCount] = useState(0);
    useEffect(() => {
        if (user?.id) {
            loadUserProfile();
            loadContacts();
        }
    }, [user?.id]);
    const loadUserProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user?.id)
                .single();
            if (data) {
                setUserProfile(data);
            }
        }
        catch (error) {
            console.error('Error loading profile:', error);
        }
    };
    const loadContacts = async () => {
        try {
            const { data, count, error } = await supabase
                .from('emergency_contacts')
                .select('*', { count: 'exact' })
                .eq('user_id', user?.id);
            if (data) {
                setContacts(data);
                setContactCount(count || data.length);
            }
        }
        catch (error) {
            console.error('Error loading contacts:', error);
        }
    };
    const handleContactAdded = async () => {
        setShowAddContact(false);
        await loadContacts();
    };
    const handleContactDeleted = async () => {
        await loadContacts();
    };
    const handleSignOut = async () => {
        try {
            await signOut();
        }
        catch (error) {
            console.error('Sign out error:', error);
        }
    };
    // --- Views ---
    const renderHome = () => (_jsxs("div", { className: "view-container", children: [_jsxs("div", { className: "status-card safe", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx("div", { className: "status-icon-wrapper", children: _jsx(Shield, { size: 24 }) }), _jsxs("div", { children: [_jsx("strong", { children: "You're Safe" }), _jsx("div", { style: { fontSize: '0.8rem', opacity: 0.8 }, children: "Enable location for full protection" })] })] }), _jsx("div", { className: "risk-badge", children: "Medium Risk" })] }), _jsxs("div", { className: "id-card", children: [_jsxs("div", { className: "id-info", children: [_jsx(User, { size: 20, className: "text-muted" }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600 }, children: userProfile?.digital_id || user?.digital_id || 'TG-Generating...' }), _jsx("div", { style: { fontSize: '0.8rem', opacity: 0.6 }, children: "Status: Active" })] })] }), _jsx("button", { className: "btn-view-id", children: "View ID" })] }), _jsx("div", { className: "central-sos-section", children: _jsx("div", { style: { transform: 'scale(1.2)' }, children: _jsx(SOSButton, { userId: user?.id }) }) }), _jsxs("div", { className: "actions-grid", children: [_jsxs("div", { className: "action-card", onClick: () => setActiveTab('map'), children: [_jsx(MapIcon, { size: 32, color: "#a78bfa" }), _jsx("span", { children: "View Map" })] }), _jsxs("div", { className: "action-card", children: [_jsx(Bell, { size: 32, color: "#f472b6" }), _jsx("span", { children: "Alerts" }), _jsx("div", { className: "notification-badge", children: "5" })] }), _jsxs("div", { className: "action-card", onClick: () => setActiveTab('tips'), children: [_jsx(Shield, { size: 32, color: "#34d399" }), _jsx("span", { children: "Safety Tips" })] }), _jsxs("div", { className: "action-card", children: [_jsx(CloudRain, { size: 32, color: "#60a5fa" }), _jsx("span", { children: "Weather" }), _jsxs("div", { style: { fontSize: '0.8rem', marginTop: 4 }, children: [weather.temp, "\u00B0C"] }), _jsx("div", { className: "weather-fab", children: _jsx(CloudRain, { size: 20, color: "white" }) })] })] }), _jsx("div", { style: { display: 'none' }, children: _jsx(LocationTracker, { userId: user?.id }) })] }));
    const renderContactsSubView = () => (_jsxs("div", { className: "view-container", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', marginBottom: 20, padding: '0 16px', marginTop: 16 }, children: [_jsx("button", { onClick: () => setProfileView('main'), style: { background: 'none', border: 'none', color: 'white', marginRight: 10 }, children: _jsx(ChevronLeft, { size: 24 }) }), _jsx("h2", { style: { margin: 0, fontSize: '1.25rem' }, children: "Emergency Contacts" })] }), _jsxs("div", { style: { padding: '0 16px' }, children: [contacts.length === 0 && !showAddContact && (_jsxs("div", { className: "empty-state", style: { textAlign: 'center', padding: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }, children: [_jsx("p", { children: "No emergency contacts added yet" }), _jsx("button", { onClick: () => setShowAddContact(true), className: "btn-secondary", style: { marginTop: 10, padding: '8px 16px', borderRadius: 8, background: '#8b5cf6', color: 'white', border: 'none' }, children: "Add Your First Contact" })] })), showAddContact ? (_jsx(AddContactForm, { userId: user?.id, onContactAdded: handleContactAdded, onCancel: () => setShowAddContact(false) })) : (_jsx(_Fragment, { children: contacts.length > 0 && (_jsxs(_Fragment, { children: [_jsx(EmergencyContactsList, { contacts: contacts, onContactDeleted: handleContactDeleted }), _jsx("button", { onClick: () => setShowAddContact(true), style: { width: '100%', padding: 16, marginTop: 20, background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 12 }, children: "+ Add Another Contact" })] })) }))] })] }));
    const renderProfileMain = () => (_jsxs("div", { className: "view-container", children: [_jsx("h2", { className: "profile-section-title", children: "Personal Information" }), _jsxs("div", { className: "profile-card-list", children: [_jsxs("div", { className: "profile-info-row", children: [_jsx(User, { size: 20 }), _jsx("span", { children: userProfile?.email || user?.email })] }), _jsxs("div", { className: "profile-info-row", children: [_jsx(Phone, { size: 20 }), _jsx("span", { children: userProfile?.phone || user?.phone || 'No phone added' })] }), _jsxs("div", { className: "profile-info-row", children: [_jsx(MapIcon, { size: 20 }), _jsxs("span", { children: ["Nationality: ", userProfile?.nationality || 'India'] })] }), _jsxs("div", { className: "profile-info-row", children: [_jsx(MapIcon, { size: 20 }), _jsx("span", { children: "10.9039, 76.9982" })] })] }), _jsx("h2", { className: "profile-section-title", children: "Account" }), _jsxs("div", { className: "menu-item", onClick: () => setProfileView('contacts'), children: [_jsx(User, { size: 20 }), _jsx("span", { style: { flex: 1 }, children: "Emergency Contacts" }), _jsx("div", { style: { background: '#8b5cf6', padding: '2px 8px', borderRadius: 12, fontSize: 12 }, children: contactCount }), _jsx(ChevronRight, { size: 16, style: { opacity: 0.5 } })] }), _jsxs("div", { className: "menu-item", children: [_jsx(CreditCard, { size: 20 }), _jsx("span", { style: { flex: 1 }, children: "Blockchain Activity Log" }), _jsx(ChevronRight, { size: 16, style: { opacity: 0.5 } })] }), _jsxs("div", { className: "menu-item", children: [_jsx(Settings, { size: 20 }), _jsx("span", { style: { flex: 1 }, children: "Settings" }), _jsx(ChevronRight, { size: 16, style: { opacity: 0.5 } })] }), _jsxs("button", { onClick: handleSignOut, className: "btn-signout-danger", children: [_jsx(LogOut, { size: 20 }), "Sign Out"] })] }));
    const renderProfile = () => {
        if (profileView === 'contacts')
            return renderContactsSubView();
        return renderProfileMain();
    };
    const renderMap = () => (_jsx("div", { className: "view-container", style: { height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }, children: _jsx(SafetyMap, {}) }));
    // --- Main Layout ---
    return (_jsxs("div", { className: "dashboard-container", children: [_jsxs("header", { className: "app-header", children: [_jsx(Shield, { className: "text-primary", size: 24, color: "#8b5cf6" }), _jsx("h1", { children: "Tour Guard" })] }), _jsxs("main", { style: { paddingBottom: '80px' }, children: [activeTab === 'home' && renderHome(), activeTab === 'profile' && renderProfile(), activeTab === 'map' && renderMap(), activeTab === 'sos' && (_jsxs("div", { style: { padding: 20, textAlign: 'center', marginTop: 100 }, children: [_jsx("h2", { children: "Emergency Mode Active" }), _jsx(SOSButton, { userId: user?.id }), _jsx("p", { style: { marginTop: 20, color: '#9ca3af' }, children: "Press and hold to send alert" }), _jsx("button", { onClick: () => setActiveTab('home'), style: { marginTop: 40, background: 'none', border: '1px solid #333', padding: '10px 20px', color: '#9ca3af', borderRadius: 8 }, children: "Cancel" })] })), activeTab === 'tips' && (_jsxs("div", { style: { padding: 20 }, children: [_jsx("h2", { children: "Safety Tips" }), _jsx("p", { children: "Content coming soon..." }), _jsx("button", { onClick: () => setActiveTab('home'), style: { marginTop: 20, padding: 10 }, children: "Back" })] }))] }), _jsxs("nav", { className: "bottom-nav", children: [_jsxs("button", { className: `nav-item ${activeTab === 'home' ? 'active' : ''}`, onClick: () => { setActiveTab('home'); setProfileView('main'); }, children: [_jsx(Home, { size: 24 }), _jsx("span", { children: "Home" })] }), _jsxs("button", { className: `nav-item ${activeTab === 'map' ? 'active' : ''}`, onClick: () => setActiveTab('map'), children: [_jsx(MapIcon, { size: 24 }), _jsx("span", { children: "Map" })] }), _jsxs("button", { className: `nav-item ${activeTab === 'sos' ? 'active' : ''}`, onClick: () => setActiveTab('sos'), children: [_jsx("div", { style: {
                                    background: '#ef4444',
                                    padding: 12,
                                    borderRadius: '50%',
                                    marginTop: -24,
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                                }, children: _jsx(Shield, { size: 24, color: "white" }) }), _jsx("span", { style: { color: '#ef4444', fontWeight: 600 }, children: "SOS" })] }), _jsxs("button", { className: `nav-item ${activeTab === 'tips' ? 'active' : ''}`, onClick: () => setActiveTab('tips'), children: [_jsx(FileText, { size: 24 }), _jsx("span", { children: "Tips" })] }), _jsxs("button", { className: `nav-item ${activeTab === 'profile' ? 'active' : ''}`, onClick: () => setActiveTab('profile'), children: [_jsx(User, { size: 24 }), _jsx("span", { children: "Profile" })] })] })] }));
}
