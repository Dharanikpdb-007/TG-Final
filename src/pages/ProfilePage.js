import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Save, X, CreditCard, Calendar } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import './ProfilePage.css';
export default function ProfilePage({ onClose }) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [settings, setSettings] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        profile_picture: '',
    });
    // Extra details state
    const [extraDetails, setExtraDetails] = useState({
        passport_number: '',
        entry_date: '',
        exit_date: '',
        digital_id: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        loadProfile();
    }, [user?.id]);
    const loadProfile = async () => {
        if (!user?.id)
            return;
        try {
            // Load Settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('app_settings')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();
            if (settingsError)
                throw settingsError;
            setSettings(settingsData);
            // Load Extended Profile
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            if (userError)
                throw userError;
            setFormData({
                name: userData.name || '',
                phone: userData.phone || '',
                profile_picture: userData.profile_picture || '',
            });
            setExtraDetails({
                passport_number: userData.passport_number || 'N/A',
                entry_date: userData.entry_date || 'N/A',
                exit_date: userData.exit_date || 'N/A',
                digital_id: userData.digital_id || userData.id || 'Unknown'
            });
        }
        catch (err) {
            console.error('Error loading profile:', err);
        }
    };
    const getQRData = () => {
        return `TOUR GUARD DIGITAL ID\n\nName: ${formData.name}\nPassport: ${extraDetails.passport_number}\nEntry: ${extraDetails.entry_date}\nExit: ${extraDetails.exit_date}\nRef: ${extraDetails.digital_id}`;
    };
    const handleSaveProfile = async () => {
        if (!user?.id)
            return;
        setError('');
        setSuccess('');
        setIsSaving(true);
        try {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                name: formData.name,
                phone: formData.phone,
                profile_picture: formData.profile_picture,
            })
                .eq('id', user.id);
            if (updateError)
                throw updateError;
            setSuccess('Profile updated successfully');
            setIsEditing(false);
            loadProfile();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleToggleSetting = async (setting, value) => {
        if (!settings?.id)
            return;
        try {
            const { error: updateError } = await supabase
                .from('app_settings')
                .update({ [setting]: value, updated_at: new Date().toISOString() })
                .eq('id', settings.id);
            if (updateError)
                throw updateError;
            setSettings({ ...settings, [setting]: value });
        }
        catch (err) {
            console.error('Error updating setting:', err);
        }
    };
    return (_jsx("div", { className: "profile-modal-overlay", onClick: onClose, children: _jsxs("div", { className: "profile-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "profile-modal-header", children: [_jsx("h2", { children: "My Profile & Settings" }), _jsx("button", { onClick: onClose, className: "close-button", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "profile-modal-content", children: [_jsxs("section", { className: "profile-section", children: [_jsx("h3", { children: "Personal Information" }), error && _jsx("div", { className: "error-message", children: error }), success && _jsx("div", { className: "success-message", children: success }), _jsxs("div", { style: {
                                        background: '#1f2937',
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 24,
                                        border: '1px solid #374151',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("div", { style: {
                                                        width: 48, height: 48,
                                                        borderRadius: '50%',
                                                        background: '#374151',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        overflow: 'hidden'
                                                    }, children: formData.profile_picture ? (_jsx("img", { src: formData.profile_picture, alt: "Profile", style: { width: '100%', height: '100%', objectFit: 'cover' } })) : (_jsx("span", { style: { fontSize: '1.2rem', color: '#9ca3af' }, children: formData.name.charAt(0) || 'U' })) }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, color: 'white', fontSize: '1.1rem' }, children: extraDetails.digital_id.substring(0, 12) }), _jsx("div", { style: { color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }, children: "Status: Location Active" })] })] }), _jsx("button", { onClick: () => setShowQR(!showQR), style: {
                                                background: '#374151',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: 20,
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 500
                                            }, children: showQR ? 'Hide ID' : 'View ID' })] }), showQR && (_jsxs("div", { style: {
                                        background: 'white',
                                        padding: 24,
                                        borderRadius: 16,
                                        marginBottom: 24,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }, children: [_jsx(QRCodeCanvas, { value: getQRData(), size: 180 }), _jsx("p", { style: { marginTop: 16, color: '#333', fontWeight: 700 }, children: extraDetails.digital_id }), _jsx("p", { style: { color: '#666', fontSize: '0.9rem' }, children: "Official Tourist Digital ID" })] })), !isEditing ? (_jsxs("div", { className: "profile-view", children: [_jsxs("div", { className: "profile-item", children: [_jsx("label", { children: "Name" }), _jsx("p", { children: formData.name })] }), _jsx("div", { className: "profile-grid", style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }, children: _jsxs("div", { className: "profile-item", children: [_jsx("label", { children: "Passport Number" }), _jsxs("p", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(CreditCard, { size: 16 }), " ", extraDetails.passport_number] })] }) }), _jsxs("div", { className: "profile-grid", style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }, children: [_jsxs("div", { className: "profile-item", children: [_jsx("label", { children: "Entry Date" }), _jsxs("p", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(Calendar, { size: 16 }), " ", extraDetails.entry_date] })] }), _jsxs("div", { className: "profile-item", children: [_jsx("label", { children: "Exit Date" }), _jsxs("p", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(Calendar, { size: 16 }), " ", extraDetails.exit_date] })] })] }), _jsxs("div", { className: "profile-item", children: [_jsx("label", { children: "Email" }), _jsx("p", { children: user?.email })] }), _jsxs("div", { className: "profile-item", children: [_jsx("label", { children: "Phone" }), _jsx("p", { children: formData.phone || 'Not added' })] }), _jsx("button", { onClick: () => setIsEditing(true), className: "btn-primary", style: { marginTop: 16 }, children: "Edit Profile" })] })) : (_jsxs("div", { className: "profile-edit-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Full Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), disabled: isSaving })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Phone Number" }), _jsx("input", { type: "tel", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), placeholder: "+1 (555) 000-0000", disabled: isSaving })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Profile Picture URL" }), _jsx("input", { type: "url", value: formData.profile_picture, onChange: (e) => setFormData({ ...formData, profile_picture: e.target.value }), placeholder: "https://example.com/photo.jpg", disabled: isSaving })] }), _jsxs("div", { className: "form-actions", children: [_jsxs("button", { onClick: handleSaveProfile, className: "btn-primary", disabled: isSaving, children: [_jsx(Save, { size: 18 }), isSaving ? 'Saving...' : 'Save Changes'] }), _jsx("button", { onClick: () => {
                                                        setIsEditing(false);
                                                        loadProfile();
                                                    }, className: "btn-secondary", disabled: isSaving, children: "Cancel" })] })] }))] }), settings && (_jsxs("section", { className: "settings-section", children: [_jsx("h3", { children: "Emergency Settings" }), _jsxs("div", { className: "setting-item", children: [_jsxs("div", { className: "setting-info", children: [_jsx("label", { children: "Auto Emergency Alert" }), _jsx("p", { children: "Automatically alert contacts when SOS is triggered" })] }), _jsxs("label", { className: "toggle-switch", children: [_jsx("input", { type: "checkbox", checked: settings.emergency_auto_alert, onChange: (e) => handleToggleSetting('emergency_auto_alert', e.target.checked) }), _jsx("span", { className: "toggle-slider" })] })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("div", { className: "setting-info", children: [_jsx("label", { children: "Location Tracking" }), _jsx("p", { children: "Share your location with the app" })] }), _jsxs("label", { className: "toggle-switch", children: [_jsx("input", { type: "checkbox", checked: settings.location_tracking_enabled, onChange: (e) => handleToggleSetting('location_tracking_enabled', e.target.checked) }), _jsx("span", { className: "toggle-slider" })] })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("div", { className: "setting-info", children: [_jsx("label", { children: "Share Location with Contacts" }), _jsx("p", { children: "Allow emergency contacts to view your location" })] }), _jsxs("label", { className: "toggle-switch", children: [_jsx("input", { type: "checkbox", checked: settings.share_location_with_contacts, onChange: (e) => handleToggleSetting('share_location_with_contacts', e.target.checked) }), _jsx("span", { className: "toggle-slider" })] })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("div", { className: "setting-info", children: [_jsx("label", { children: "SOS Sound Alert" }), _jsx("p", { children: "Play alert sound when SOS is triggered" })] }), _jsxs("label", { className: "toggle-switch", children: [_jsx("input", { type: "checkbox", checked: settings.sos_sound_enabled, onChange: (e) => handleToggleSetting('sos_sound_enabled', e.target.checked) }), _jsx("span", { className: "toggle-slider" })] })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("div", { className: "setting-info", children: [_jsx("label", { children: "SOS Vibration Alert" }), _jsx("p", { children: "Vibrate device when SOS is triggered" })] }), _jsxs("label", { className: "toggle-switch", children: [_jsx("input", { type: "checkbox", checked: settings.sos_vibration_enabled, onChange: (e) => handleToggleSetting('sos_vibration_enabled', e.target.checked) }), _jsx("span", { className: "toggle-slider" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Emergency Mode Timeout (minutes)" }), _jsxs("select", { value: settings.emergency_mode_timeout_minutes, onChange: (e) => {
                                                const value = parseInt(e.target.value);
                                                handleToggleSetting('emergency_mode_timeout_minutes', value);
                                            }, children: [_jsx("option", { value: 15, children: "15 minutes" }), _jsx("option", { value: 30, children: "30 minutes" }), _jsx("option", { value: 60, children: "1 hour" }), _jsx("option", { value: 120, children: "2 hours" })] })] })] }))] })] }) }));
}
