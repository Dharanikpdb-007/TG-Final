import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SOSButton from '../components/SOSButton';
import EmergencyContactsList from '../components/EmergencyContactsList';
import AddContactForm from '../components/AddContactForm';
import LocationTracker from '../components/LocationTracker';
import ProfilePage from './ProfilePage';
import IncidentReportPage from './IncidentReportPage';
import TrustedZonesPage from './TrustedZonesPage';
import { LogOut, Shield, User, AlertTriangle, MapPin } from 'lucide-react';
import './DashboardPage.css';
export default function DashboardPage() {
    const { user, signOut } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(true);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showIncidents, setShowIncidents] = useState(false);
    const [showZones, setShowZones] = useState(false);
    useEffect(() => {
        if (user?.id) {
            loadContacts();
        }
    }, [user?.id]);
    const loadContacts = async () => {
        if (!user?.id)
            return;
        try {
            const { data, error } = await supabase
                .from('emergency_contacts')
                .select('*')
                .eq('user_id', user.id);
            if (error)
                throw error;
            setContacts(data || []);
        }
        catch (error) {
            console.error('Error loading contacts:', error);
        }
        finally {
            setIsLoadingContacts(false);
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
            console.error('Signout error:', error);
        }
    };
    return (_jsxs("div", { className: "dashboard-container", children: [_jsx("header", { className: "dashboard-header", children: _jsxs("div", { className: "header-content", children: [_jsxs("div", { className: "logo-section", children: [_jsx(Shield, { size: 32 }), _jsx("h1", { children: "Tour Guard" })] }), _jsxs("div", { className: "header-actions", children: [_jsx("button", { onClick: () => setShowProfile(true), className: "action-button", title: "Profile", children: _jsx(User, { size: 20 }) }), _jsx("button", { onClick: () => setShowIncidents(true), className: "action-button", title: "Incidents", children: _jsx(AlertTriangle, { size: 20 }) }), _jsx("button", { onClick: () => setShowZones(true), className: "action-button", title: "Trusted Zones", children: _jsx(MapPin, { size: 20 }) }), _jsxs("button", { onClick: handleSignOut, className: "logout-button", children: [_jsx(LogOut, { size: 20 }), "Sign Out"] })] })] }) }), _jsxs("main", { className: "dashboard-main", children: [_jsxs("div", { className: "dashboard-grid", children: [_jsxs("div", { className: "sos-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "Emergency SOS" }), _jsx("p", { children: "One-touch emergency alert system" })] }), _jsx(LocationTracker, { userId: user?.id }), _jsx(SOSButton, { userId: user?.id }), _jsxs("div", { className: "sos-info", children: [_jsx("h4", { children: "How SOS Works" }), _jsxs("ul", { children: [_jsx("li", { children: "Press the SOS button to trigger an emergency alert" }), _jsx("li", { children: "Your current location will be sent to emergency contacts" }), _jsx("li", { children: "All emergency contacts will receive detailed email notifications" }), _jsx("li", { children: "Include emergency type and description for better response" })] })] })] }), _jsxs("div", { className: "contacts-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "Emergency Contacts" }), _jsx("p", { children: "Notify these people during SOS" })] }), contacts.length === 0 && !showAddContact && (_jsxs("div", { className: "empty-state", children: [_jsx("p", { children: "No emergency contacts added yet" }), _jsx("button", { onClick: () => setShowAddContact(true), className: "btn-secondary", children: "Add Your First Contact" })] })), showAddContact ? (_jsx(AddContactForm, { userId: user?.id, onContactAdded: handleContactAdded, onCancel: () => setShowAddContact(false) })) : (_jsx(_Fragment, { children: contacts.length > 0 && (_jsxs(_Fragment, { children: [_jsx(EmergencyContactsList, { contacts: contacts, onContactDeleted: handleContactDeleted }), _jsx("button", { onClick: () => setShowAddContact(true), className: "btn-secondary", children: "Add Another Contact" })] })) }))] })] }), _jsxs("div", { className: "user-info-section", children: [_jsx("h3", { children: "Quick Info" }), _jsxs("div", { className: "profile-info", children: [_jsxs("div", { className: "info-row", children: [_jsx("span", { className: "label", children: "Name:" }), _jsx("span", { className: "value", children: user?.name })] }), _jsxs("div", { className: "info-row", children: [_jsx("span", { className: "label", children: "Email:" }), _jsx("span", { className: "value", children: user?.email })] }), _jsxs("div", { className: "info-row", children: [_jsx("span", { className: "label", children: "Digital ID:" }), _jsx("span", { className: "value", children: user?.digital_id })] }), user?.phone && (_jsxs("div", { className: "info-row", children: [_jsx("span", { className: "label", children: "Phone:" }), _jsx("span", { className: "value", children: user.phone })] }))] })] })] }), showProfile && _jsx(ProfilePage, { onClose: () => setShowProfile(false) }), showIncidents && (_jsx(IncidentReportPage, { onClose: () => setShowIncidents(false) })), showZones && _jsx(TrustedZonesPage, { onClose: () => setShowZones(false) })] }));
}
