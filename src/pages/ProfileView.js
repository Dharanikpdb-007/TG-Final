import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Phone, Map as MapIcon, CreditCard, Settings, ChevronRight, LogOut, ChevronLeft, AlertTriangle, Edit2, Check, X, Calendar, FileText } from 'lucide-react';
import EmergencyContactsList from '../components/EmergencyContactsList';
import AddContactForm from '../components/AddContactForm';
import './DashboardRedesign.css';
export default function ProfileView() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    // Specific sub-views for Profile tab
    const [profileView, setProfileView] = useState('main');
    // Data State
    const [userProfile, setUserProfile] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [showAddContact, setShowAddContact] = useState(false);
    const [contactCount, setContactCount] = useState(0);
    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        nationality: '',
        passport_number: '',
        entry_date: '',
        exit_date: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        if (user?.id) {
            loadUserProfile();
            loadContacts();
        }
    }, [user?.id]);
    const loadUserProfile = async () => {
        const { data } = await supabase.from('users').select('*').eq('id', user?.id).single();
        if (data) {
            setUserProfile(data);
            setEditForm({
                name: data.name || '',
                phone: data.phone || '',
                nationality: data.nationality || '',
                passport_number: data.passport_number || '',
                entry_date: data.entry_date || '',
                exit_date: data.exit_date || ''
            });
        }
    };
    const loadContacts = async () => {
        const { data, count } = await supabase.from('emergency_contacts').select('*', { count: 'exact' }).eq('user_id', user?.id);
        if (data) {
            setContacts(data);
            setContactCount(count || data.length);
        }
    };
    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase.from('users').update({
                name: editForm.name,
                phone: editForm.phone,
                nationality: editForm.nationality,
                passport_number: editForm.passport_number,
                entry_date: editForm.entry_date || null,
                exit_date: editForm.exit_date || null
            }).eq('id', user?.id);
            if (error)
                throw error;
            await loadUserProfile();
            setIsEditing(false);
        }
        catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
        finally {
            setIsSaving(false);
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
    const renderContactsSubView = () => (_jsxs("div", { className: "view-container", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', marginBottom: 20, padding: '0 16px', marginTop: 16 }, children: [_jsx("button", { onClick: () => setProfileView('main'), style: { background: 'none', border: 'none', color: 'white', marginRight: 10 }, children: _jsx(ChevronLeft, { size: 24 }) }), _jsx("h2", { style: { margin: 0, fontSize: '1.25rem' }, children: "Emergency Contacts" })] }), _jsxs("div", { style: { padding: '0 16px' }, children: [contacts.length === 0 && !showAddContact && (_jsxs("div", { className: "empty-state", style: { textAlign: 'center', padding: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }, children: [_jsx("p", { children: "No emergency contacts added yet" }), _jsx("button", { onClick: () => setShowAddContact(true), className: "btn-secondary", style: { marginTop: 10, padding: '8px 16px', borderRadius: 8, background: '#8b5cf6', color: 'white', border: 'none' }, children: "Add Your First Contact" })] })), showAddContact ? (_jsx(AddContactForm, { userId: user?.id, onContactAdded: handleContactAdded, onCancel: () => setShowAddContact(false) })) : (_jsx(_Fragment, { children: contacts.length > 0 && (_jsxs(_Fragment, { children: [_jsx(EmergencyContactsList, { contacts: contacts, onContactDeleted: handleContactDeleted }), _jsx("button", { onClick: () => setShowAddContact(true), style: { width: '100%', padding: 16, marginTop: 20, background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 12 }, children: "+ Add Another Contact" })] })) }))] })] }));
    const renderProfileMain = () => (_jsxs("div", { className: "view-container", children: [_jsxs("div", { onClick: () => navigate('/profile-id'), style: {
                    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 24,
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsx("div", { style: {
                                    width: 48, height: 48,
                                    borderRadius: '50%',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }, children: _jsx(CreditCard, { size: 24, color: "#3b82f6" }) }), _jsxs("div", { children: [_jsx("h3", { style: { margin: 0, fontSize: '1.1rem', color: 'white' }, children: "Digital ID Card" }), _jsx("p", { style: { margin: 0, fontSize: '0.85rem', color: '#9ca3af' }, children: "View your official ID & QR Code" })] })] }), _jsx(ChevronRight, { size: 20, color: "#6b7280" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, children: [_jsx("h2", { className: "profile-section-title", style: { margin: 0 }, children: "My Profile" }), !isEditing ? (_jsxs("button", { onClick: () => setIsEditing(true), style: { background: 'none', border: 'none', color: '#8b5cf6', display: 'flex', gap: 4, alignItems: 'center' }, children: [_jsx(Edit2, { size: 16 }), " Edit"] })) : (_jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("button", { onClick: () => setIsEditing(false), style: { background: 'none', border: 'none', color: '#9ca3af' }, children: _jsx(X, { size: 20 }) }), _jsx("button", { onClick: handleSaveProfile, disabled: isSaving, style: { background: 'none', border: 'none', color: '#10b981' }, children: _jsx(Check, { size: 20 }) })] }))] }), _jsx("div", { className: "profile-card-list", children: !isEditing ? (
                // VIEW MODE
                _jsxs(_Fragment, { children: [_jsxs("div", { className: "profile-info-row", children: [_jsx(User, { size: 20, color: "#a78bfa" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Full Name" }), _jsx("div", { children: userProfile?.name || 'Not set' })] })] }), _jsxs("div", { className: "profile-info-row", children: [_jsx(Phone, { size: 20, color: "#a78bfa" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Phone" }), _jsx("div", { children: userProfile?.phone || 'Not set' })] })] }), _jsxs("div", { className: "profile-info-row", children: [_jsx(MapIcon, { size: 20, color: "#a78bfa" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Nationality" }), _jsx("div", { children: userProfile?.nationality || 'Not set' })] })] }), _jsxs("div", { className: "profile-info-row", children: [_jsx(FileText, { size: 20, color: "#a78bfa" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Passport Number" }), _jsx("div", { children: userProfile?.passport_number || 'N/A' })] })] }), _jsxs("div", { className: "profile-info-row", children: [_jsx(Calendar, { size: 20, color: "#a78bfa" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Entry Date" }), _jsx("div", { children: userProfile?.entry_date || 'N/A' })] })] }), _jsxs("div", { className: "profile-info-row", children: [_jsx(Calendar, { size: 20, color: "#a78bfa" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Exit Date" }), _jsx("div", { children: userProfile?.exit_date || 'N/A' })] })] })] })) : (
                // EDIT MODE
                _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Full Name" }), _jsx("input", { className: "form-input", style: { width: '100%', padding: 10, borderRadius: 8, background: '#0f1013', color: 'white', border: '1px solid #333' }, value: editForm.name, onChange: e => setEditForm({ ...editForm, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Phone" }), _jsx("input", { className: "form-input", style: { width: '100%', padding: 10, borderRadius: 8, background: '#0f1013', color: 'white', border: '1px solid #333' }, value: editForm.phone, onChange: e => setEditForm({ ...editForm, phone: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Nationality" }), _jsx("input", { className: "form-input", style: { width: '100%', padding: 10, borderRadius: 8, background: '#0f1013', color: 'white', border: '1px solid #333' }, value: editForm.nationality, onChange: e => setEditForm({ ...editForm, nationality: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Passport Number" }), _jsx("input", { className: "form-input", style: { width: '100%', padding: 10, borderRadius: 8, background: '#0f1013', color: 'white', border: '1px solid #333' }, value: editForm.passport_number, onChange: e => setEditForm({ ...editForm, passport_number: e.target.value }) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Entry Date" }), _jsx("input", { type: "date", className: "form-input", style: { width: '100%', padding: 10, borderRadius: 8, background: '#0f1013', color: 'white', border: '1px solid #333' }, value: editForm.entry_date, onChange: e => setEditForm({ ...editForm, entry_date: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Exit Date" }), _jsx("input", { type: "date", className: "form-input", style: { width: '100%', padding: 10, borderRadius: 8, background: '#0f1013', color: 'white', border: '1px solid #333' }, value: editForm.exit_date, onChange: e => setEditForm({ ...editForm, exit_date: e.target.value }) })] })] })] })) }), _jsx("h2", { className: "profile-section-title", children: "Manage" }), _jsxs("div", { className: "menu-item", onClick: () => setProfileView('contacts'), children: [_jsx(User, { size: 20 }), _jsx("span", { style: { flex: 1 }, children: "Emergency Contacts" }), _jsx("div", { style: { background: '#8b5cf6', padding: '2px 8px', borderRadius: 12, fontSize: 12 }, children: contactCount }), _jsx(ChevronRight, { size: 16, style: { opacity: 0.5 } })] }), _jsxs("div", { className: "menu-item", onClick: () => navigate('/incident-log'), children: [_jsx(AlertTriangle, { size: 20 }), _jsx("span", { style: { flex: 1 }, children: "Incident Report Log" }), _jsx(ChevronRight, { size: 16, style: { opacity: 0.5 } })] }), _jsxs("div", { className: "menu-item", onClick: () => navigate('/settings'), children: [_jsx(Settings, { size: 20 }), _jsx("span", { style: { flex: 1 }, children: "Settings" }), _jsx(ChevronRight, { size: 16, style: { opacity: 0.5 } })] }), _jsxs("button", { onClick: handleSignOut, className: "btn-signout-danger", children: [_jsx(LogOut, { size: 20 }), "Sign Out"] })] }));
    return profileView === 'contacts' ? renderContactsSubView() : renderProfileMain();
}
