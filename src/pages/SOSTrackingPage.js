import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, MapPin, Phone, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const statusConfig = {
    triggered: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: AlertTriangle, label: 'Waiting for responder...' },
    pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock, label: 'Pending Review' },
    responding: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: Shield, label: 'Responder assigned' },
    solved: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle, label: 'Resolved' },
    not_solved: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: AlertTriangle, label: 'Not Resolved' },
    closed: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', icon: CheckCircle, label: 'Closed by user' },
};
export default function SOSTrackingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const fetchSOSEvents = async () => {
        if (!user?.id)
            return;
        setIsLoading(true);
        const { data, error } = await supabase
            .from('sos_events')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (data) {
            setEvents(data);
            if (data.length > 0 && !selectedEvent) {
                setSelectedEvent(data[0]);
            }
        }
        if (error)
            console.error('Error fetching SOS events:', error);
        setIsLoading(false);
    };
    useEffect(() => {
        fetchSOSEvents();
        const interval = setInterval(fetchSOSEvents, 10000);
        return () => clearInterval(interval);
    }, [user?.id]);
    const handleCloseSOS = async (eventId) => {
        const { error } = await supabase
            .from('sos_events')
            .update({ status: 'closed' })
            .eq('id', eventId)
            .eq('user_id', user?.id);
        if (!error) {
            fetchSOSEvents();
        }
    };
    const getStatusInfo = (status) => {
        return statusConfig[status] || statusConfig.triggered;
    };
    const formatTime = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        if (diff < 60000)
            return 'Just now';
        if (diff < 3600000)
            return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000)
            return `${Math.floor(diff / 3600000)} hours ago`;
        return new Date(dateStr).toLocaleDateString();
    };
    if (isLoading && events.length === 0) {
        return (_jsxs("div", { style: { padding: 20, textAlign: 'center', marginTop: 40 }, children: [_jsx("div", { className: "spinner" }), _jsx("p", { style: { color: '#9ca3af', marginTop: 12 }, children: "Loading SOS events..." })] }));
    }
    // Detail view for a selected event
    if (selectedEvent) {
        const statusInfo = getStatusInfo(selectedEvent.status);
        const StatusIcon = statusInfo.icon;
        return (_jsxs("div", { className: "view-container", style: { padding: 0 }, children: [_jsxs("div", { style: {
                        background: '#e6a817',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx(ArrowLeft, { size: 20, onClick: () => setSelectedEvent(null), style: { cursor: 'pointer' } }), _jsxs("div", { children: [_jsxs("div", { style: { fontWeight: 700, fontSize: '1.1rem', textTransform: 'capitalize' }, children: [selectedEvent.emergency_type, " Emergency"] }), _jsx("div", { style: { fontSize: '0.8rem', opacity: 0.8 }, children: "Help is on the way" })] })] }), _jsx("span", { style: {
                                padding: '4px 12px',
                                borderRadius: 20,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: statusInfo.bg,
                                color: statusInfo.color,
                                border: `1px solid ${statusInfo.color}`
                            }, children: selectedEvent.status })] }), _jsxs("div", { style: { padding: 16 }, children: [_jsxs("div", { style: {
                                background: statusInfo.bg,
                                border: `1px solid ${statusInfo.color}33`,
                                borderRadius: 12,
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                marginBottom: 16
                            }, children: [_jsx(StatusIcon, { size: 18, color: statusInfo.color }), _jsx("span", { style: { color: statusInfo.color, fontWeight: 500 }, children: statusInfo.label })] }), _jsxs("div", { style: {
                                background: '#1a1b1e',
                                borderRadius: 12,
                                padding: 20,
                                marginBottom: 16,
                                borderLeft: `3px solid ${statusInfo.color}`
                            }, children: [_jsx("div", { style: { fontWeight: 600, marginBottom: 16 }, children: "Status Timeline" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }, children: [_jsx(CheckCircle, { size: 18, color: "#10b981" }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 500 }, children: "SOS Received" }), _jsx("div", { style: { fontSize: '0.8rem', color: '#6b7280' }, children: formatTime(selectedEvent.created_at) })] })] }), selectedEvent.status !== 'triggered' && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }, children: [_jsx(StatusIcon, { size: 18, color: statusInfo.color }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 500, textTransform: 'capitalize' }, children: selectedEvent.status.replace('_', ' ') }), _jsx("div", { style: { fontSize: '0.8rem', color: '#6b7280' }, children: "Updated by admin" })] })] }))] }), selectedEvent.latitude !== 0 && (_jsxs("div", { style: {
                                background: '#1a1b1e',
                                borderRadius: 12,
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                marginBottom: 16
                            }, children: [_jsx(MapPin, { size: 18, color: "#8b5cf6" }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 500 }, children: "Your Location Shared" }), _jsx("div", { style: { fontSize: '0.8rem', color: '#6b7280' }, children: "Live location being shared with responders" })] })] })), selectedEvent.description && (_jsxs("div", { style: {
                                background: '#1a1b1e',
                                borderRadius: 12,
                                padding: '12px 16px',
                                marginBottom: 16
                            }, children: [_jsx("div", { style: { fontWeight: 500, marginBottom: 8 }, children: "Description" }), _jsx("p", { style: { color: '#9ca3af', fontSize: '0.9rem' }, children: selectedEvent.description })] })), _jsxs("a", { href: "tel:112", style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                background: '#1a1b1e',
                                border: '1px solid #333',
                                borderRadius: 12,
                                padding: '14px',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: 500,
                                marginBottom: 12
                            }, children: [_jsx(Phone, { size: 18 }), " Call Emergency: 112"] }), selectedEvent.status !== 'closed' && selectedEvent.status !== 'solved' && (_jsxs("button", { onClick: () => handleCloseSOS(selectedEvent.id), style: {
                                width: '100%',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: 12,
                                padding: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                fontSize: '1rem'
                            }, children: [_jsx(CheckCircle, { size: 18 }), " I'm Safe - Close Incident"] }))] })] }));
    }
    // List view of all SOS events
    return (_jsxs("div", { className: "view-container", style: { padding: 16 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }, children: [_jsx(ArrowLeft, { size: 20, onClick: () => navigate('/home'), style: { cursor: 'pointer' } }), _jsx("h2", { style: { margin: 0 }, children: "My SOS History" })] }), events.length === 0 ? (_jsxs("div", { style: { textAlign: 'center', padding: 40, color: '#6b7280' }, children: [_jsx(Shield, { size: 48, color: "#333", style: { marginBottom: 12 } }), _jsx("p", { children: "No SOS events found." }), _jsx("p", { style: { fontSize: '0.85rem' }, children: "Your emergency alerts will appear here." })] })) : (events.map(event => {
                const info = getStatusInfo(event.status);
                const Icon = info.icon;
                return (_jsxs("div", { onClick: () => setSelectedEvent(event), style: {
                        background: '#1a1b1e',
                        borderRadius: 12,
                        padding: '16px',
                        marginBottom: 12,
                        cursor: 'pointer',
                        borderLeft: `3px solid ${info.color}`,
                        transition: 'transform 0.1s',
                    }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx(Icon, { size: 18, color: info.color }), _jsxs("div", { children: [_jsxs("div", { style: { fontWeight: 600, textTransform: 'capitalize' }, children: [event.emergency_type, " Emergency"] }), _jsx("div", { style: { fontSize: '0.8rem', color: '#6b7280' }, children: formatTime(event.created_at) })] })] }), _jsx("span", { style: {
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        background: info.bg,
                                        color: info.color,
                                        textTransform: 'capitalize'
                                    }, children: event.status.replace('_', ' ') })] }), event.description && (_jsx("p", { style: {
                                marginTop: 8,
                                fontSize: '0.85rem',
                                color: '#9ca3af',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }, children: event.description }))] }, event.id));
            }))] }));
}
