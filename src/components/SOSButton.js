import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import './SOSButton.css';
export default function SOSButton({ userId }) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const [isActivating, setIsActivating] = useState(false);
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        emergencyType: 'other',
        description: '',
    });
    // ... (rest of logic remains same)
    const getDeviceInfo = () => {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timestamp: new Date().toISOString(),
        };
    };
    const handleSubmitSOS = async () => {
        if (!userId) {
            setErrorMessage('User not authenticated');
            setStatus('error');
            return;
        }
        setIsActivating(true);
        setStatus('idle');
        setErrorMessage('');
        try {
            const location = await new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition((position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                }, () => {
                    resolve({ latitude: 0, longitude: 0 });
                });
            });
            const { data: sosEvent, error: sosError } = await supabase
                .from('sos_events')
                .insert({
                user_id: userId,
                emergency_type: formData.emergencyType,
                description: formData.description,
                latitude: location.latitude,
                longitude: location.longitude,
                device_info: getDeviceInfo(),
                status: 'triggered',
            })
                .select()
                .single();
            if (sosError)
                throw sosError;
            try {
                const { data, error } = await supabase.functions.invoke('send-sos-email', {
                    body: {
                        sos_event_id: sosEvent.id,
                        emergency_type: formData.emergencyType,
                        description: formData.description,
                    },
                });
                if (error)
                    console.warn('Email service error:', error);
                else
                    console.log('Email service response:', data);
            }
            catch (invokeError) {
                console.warn('Email service invocation failed:', invokeError);
            }
            showNotification('SOS Sent Successfully! Help is on the way.', 'success');
            setStatus('success');
            setFormData({ emergencyType: 'other', description: '' });
        }
        catch (error) {
            console.error('SOS activation error:', error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Failed to send emergency alert');
        }
        finally {
            setIsActivating(false);
        }
    };
    return (_jsxs("div", { className: "sos-button-container", children: [status === 'success' && (_jsxs("div", { style: {
                    background: '#1a1b1e',
                    borderRadius: 16,
                    padding: 32,
                    textAlign: 'center',
                    border: '1px solid #333'
                }, children: [_jsx("div", { style: {
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(139, 92, 246, 0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px'
                        }, children: _jsx(CheckCircle, { size: 32, color: "#8b5cf6" }) }), _jsx("h3", { style: { marginBottom: 8 }, children: "Help is on the way" }), _jsx("p", { style: { color: '#9ca3af', fontSize: '0.9rem', marginBottom: 24 }, children: "Your emergency has been reported. Stay calm and stay where you are if safe." }), _jsx("button", { onClick: () => navigate('/sos-tracking'), style: {
                            width: '100%',
                            padding: '14px',
                            borderRadius: 12,
                            border: 'none',
                            background: '#a78bfa',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            marginBottom: 12
                        }, children: "Track Incident Status" }), _jsx("button", { onClick: () => setStatus('idle'), style: {
                            width: '100%',
                            padding: '14px',
                            borderRadius: 12,
                            border: '1px solid #333',
                            background: 'transparent',
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }, children: "Report Another Emergency" }), _jsxs("div", { style: { marginTop: 24, textAlign: 'left' }, children: [_jsx("h4", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }, children: "\uD83D\uDCDE Emergency Numbers" }), [
                                { name: 'National Emergency', number: '112', bg: '#7f1d1d' },
                                { name: 'Police', number: '100', bg: '#3b1d1d' },
                                { name: 'Ambulance', number: '108', bg: '#1d1d2e' },
                            ].map(item => (_jsxs("a", { href: `tel:${item.number}`, style: {
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: item.bg, borderRadius: 10, padding: '12px 16px',
                                    marginBottom: 8, color: 'white', textDecoration: 'none',
                                    fontWeight: 500
                                }, children: [_jsx("span", { children: item.name }), _jsx("span", { style: { color: '#ef4444', fontWeight: 700 }, children: item.number })] }, item.number)))] })] })), status === 'error' && (_jsxs("div", { className: "error-message", children: [_jsx(AlertCircle, { size: 20 }), _jsx("span", { children: errorMessage })] })), status === 'idle' && (_jsxs(_Fragment, { children: [_jsx("h2", { style: { textAlign: 'center', color: '#e5e7eb', marginBottom: 24, fontSize: '1.2rem', fontWeight: 700 }, children: t('emergencyModeActive') }), _jsxs("div", { className: "sos-form", children: [_jsxs("div", { className: "form-header", children: [_jsx("h3", { children: t('sendEmergencyAlert') }), _jsx("button", { type: "button", onClick: () => navigate(-1), className: "close-button", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "emergency-type", children: t('emergencyType') }), _jsxs("select", { id: "emergency-type", value: formData.emergencyType, onChange: (e) => setFormData((prev) => ({
                                            ...prev,
                                            emergencyType: e.target.value,
                                        })), disabled: isActivating, children: [_jsx("option", { value: "medical", children: "Medical Emergency" }), _jsx("option", { value: "crime", children: "Crime / Assault" }), _jsx("option", { value: "lost", children: "Lost / Disoriented" }), _jsx("option", { value: "accident", children: "Accident" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "description", children: t('descriptionOptional') }), _jsx("textarea", { id: "description", value: formData.description, onChange: (e) => setFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        })), placeholder: "Describe the emergency situation...", disabled: isActivating, rows: 3 })] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", onClick: () => navigate(-1), className: "btn-cancel", disabled: isActivating, children: t('cancel') }), _jsx("button", { type: "button", onClick: handleSubmitSOS, className: "btn-send", disabled: isActivating, children: isActivating ? 'Sending...' : t('sendEmergencyAlert') })] })] })] }))] }));
}
