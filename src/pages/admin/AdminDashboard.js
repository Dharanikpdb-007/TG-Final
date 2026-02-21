import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, AlertTriangle, FileText, Map as MapIcon, LogOut, Bell, User, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../lib/supabase';
import './Admin.css';
// Fix for default Leaflet icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [24, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// Placeholders for sub-components
const StatsView = () => {
    const [stats, setStats] = useState({ sos: 0, incidents: 0, users: 0 });
    useEffect(() => {
        // Mock fetch or real DB count
        const fetchStats = async () => {
            const { count: sosCount } = await supabase.from('sos_events').select('*', { count: 'exact' });
            const { count: incCount } = await supabase.from('incident_reports').select('*', { count: 'exact' });
            const { count: userCount } = await supabase.from('users').select('*', { count: 'exact' });
            setStats({ sos: sosCount || 0, incidents: incCount || 0, users: userCount || 0 });
        };
        fetchStats();
    }, []);
    return (_jsxs("div", { children: [_jsxs("div", { className: "page-header", children: [_jsx("h2", { children: "Dashboard Overview" }), _jsx("p", { children: "Welcome back, Administrator." })] }), _jsxs("div", { className: "stats-grid", children: [_jsxs("div", { className: "stat-card", children: [_jsx(AlertTriangle, { size: 32, color: "#ef4444" }), _jsx("div", { className: "stat-value", children: stats.sos }), _jsx("div", { className: "stat-label", children: "Total SOS Alerts" })] }), _jsxs("div", { className: "stat-card", children: [_jsx(FileText, { size: 32, color: "#f59e0b" }), _jsx("div", { className: "stat-value", children: stats.incidents }), _jsx("div", { className: "stat-label", children: "Incident Reports" })] }), _jsxs("div", { className: "stat-card", children: [_jsx(Shield, { size: 32, color: "#8b5cf6" }), _jsx("div", { className: "stat-value", children: stats.users }), _jsx("div", { className: "stat-label", children: "Active Users" })] })] })] }));
};
const IncidentsView = () => {
    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const fetchIncidents = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('incident_reports').select('*, users(name, email)').order('created_at', { ascending: false }).limit(20);
        if (data)
            setIncidents(data);
        if (error)
            console.error('Error fetching incidents:', error);
        setIsLoading(false);
    };
    useEffect(() => {
        fetchIncidents();
        // Auto-refresh every 15 seconds
        const interval = setInterval(fetchIncidents, 15000);
        return () => clearInterval(interval);
    }, []);
    return (_jsxs("div", { children: [_jsxs("div", { className: "page-header", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("h2", { children: "Incident Logs" }), _jsx("p", { children: "Recent incident reports from users." })] }), _jsxs("button", { onClick: fetchIncidents, className: "btn-admin-login", style: { padding: '8px 16px', fontSize: '0.9rem' }, children: [_jsx(RefreshCw, { size: 16, className: isLoading ? 'spin-anim' : '' }), " Refresh"] })] }), _jsx("div", { className: "data-table-container", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Reported By" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Severity" }), _jsx("th", { children: "Description" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Date" })] }) }), _jsxs("tbody", { children: [incidents.map(inc => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { style: { fontWeight: 500 }, children: inc.users?.name || 'Unknown' }), _jsx("div", { style: { fontSize: '0.75rem', color: '#6b7280' }, children: inc.users?.email || '' })] }), _jsx("td", { style: { textTransform: 'capitalize' }, children: inc.incident_type }), _jsx("td", { children: _jsx("span", { className: `status-badge ${inc.severity}`, children: inc.severity }) }), _jsx("td", { style: { maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: inc.description }), _jsx("td", { children: inc.status }), _jsx("td", { children: new Date(inc.created_at).toLocaleDateString() })] }, inc.id))), incidents.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, style: { textAlign: 'center', color: '#6b7280', padding: 20 }, children: "No incidents reported yet." }) }))] })] }) })] }));
};
const AlertsView = () => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const handleSendAlert = async () => {
        if (!message)
            return;
        setIsSending(true);
        try {
            const { error } = await supabase.from('admin_alerts').insert({
                message,
                type: 'warning',
                is_active: true
            });
            if (error)
                throw error;
            alert('Alert broadcasted to all active users!');
            setMessage('');
        }
        catch (err) {
            console.error('Error sending alert:', err);
            alert('Failed to send alert');
        }
        finally {
            setIsSending(false);
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "page-header", children: [_jsx("h2", { children: "Send Alert Notification" }), _jsx("p", { children: "Broadcast emergency messages to all users in a specific area." })] }), _jsxs("div", { className: "admin-login-card", style: { maxWidth: '600px', margin: '0' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Alert Message" }), _jsx("textarea", { rows: 4, value: message, onChange: (e) => setMessage(e.target.value), placeholder: "Enter alert details (e.g. Heavy rain warning in Mumbai...)", style: { width: '100%', padding: 12, borderRadius: 8, background: '#0f1013', border: '1px solid #333', color: 'white' } })] }), _jsxs("button", { onClick: handleSendAlert, disabled: isSending, className: "btn-admin-login", style: { background: '#ef4444' }, children: [_jsx(Bell, { size: 18 }), " ", isSending ? 'Broadcasting...' : 'Broadcast Alert'] })] })] }));
};
const LocationTrackingView = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fetchUserLocations = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('users')
            .select('id, name, email, current_latitude, current_longitude, last_location_update')
            .not('current_latitude', 'is', null)
            .not('current_longitude', 'is', null);
        if (data)
            setUsers(data);
        setIsLoading(false);
    };
    useEffect(() => {
        fetchUserLocations();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchUserLocations, 30000);
        return () => clearInterval(interval);
    }, []);
    function FlyToUser({ user }) {
        const map = useMap();
        useEffect(() => {
            if (user) {
                map.flyTo([user.current_latitude, user.current_longitude], 15);
            }
        }, [user, map]);
        return null;
    }
    return (_jsxs("div", { style: { height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { className: "page-header", style: { marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("h2", { children: "Live User Tracking" }), _jsx("p", { children: "Monitor real-time locations of active users." })] }), _jsxs("button", { onClick: fetchUserLocations, className: "btn-admin-login", style: { padding: '8px 16px', fontSize: '0.9rem' }, children: [_jsx(RefreshCw, { size: 16, className: isLoading ? 'spin-anim' : '' }), " Refresh"] })] }), _jsxs("div", { style: { flex: 1, display: 'flex', gap: 16, overflow: 'hidden' }, children: [_jsxs("div", { style: { width: 300, background: '#1a1b1e', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { style: { padding: 16, borderBottom: '1px solid #333', fontWeight: 600 }, children: ["Active Users (", users.length, ")"] }), _jsxs("div", { style: { overflowY: 'auto', flex: 1 }, children: [users.map(user => (_jsxs("div", { onClick: () => setSelectedUser(user), style: {
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #222',
                                            cursor: 'pointer',
                                            background: selectedUser?.id === user.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                            borderLeft: selectedUser?.id === user.id ? '3px solid #3b82f6' : '3px solid transparent'
                                        }, children: [_jsxs("div", { style: { fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(User, { size: 14, color: "#9ca3af" }), " ", user.name || 'Anonymous'] }), _jsxs("div", { style: { fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }, children: ["Last seen: ", new Date(user.last_location_update).toLocaleTimeString()] })] }, user.id))), users.length === 0 && (_jsx("div", { style: { padding: 20, textAlign: 'center', color: '#6b7280' }, children: "No active users found with location data." }))] })] }), _jsx("div", { style: { flex: 1, borderRadius: 12, overflow: 'hidden', position: 'relative' }, children: _jsxs(MapContainer, { center: [20.5937, 78.9629], zoom: 5, style: { height: '100%', width: '100%' }, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), users.map(user => (_jsx(Marker, { position: [user.current_latitude, user.current_longitude], eventHandlers: {
                                        click: () => setSelectedUser(user),
                                    }, children: _jsxs(Popup, { children: [_jsx("strong", { children: user.name }), _jsx("br", {}), user.email, _jsx("br", {}), "Updated: ", new Date(user.last_location_update).toLocaleString()] }) }, user.id))), _jsx(FlyToUser, { user: selectedUser })] }) })] })] }));
};
const SOSLogsView = () => {
    const [sosEvents, setSOSEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const fetchSOSEvents = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('sos_events')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false })
            .limit(50);
        if (data)
            setSOSEvents(data);
        if (error)
            console.error('Error fetching SOS events:', error);
        setIsLoading(false);
    };
    useEffect(() => {
        fetchSOSEvents();
        const interval = setInterval(fetchSOSEvents, 15000);
        return () => clearInterval(interval);
    }, []);
    const updateStatus = async (eventId, newStatus) => {
        const { error } = await supabase
            .from('sos_events')
            .update({ status: newStatus })
            .eq('id', eventId);
        if (!error) {
            setSOSEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
        }
        else {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'solved': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'triggered': return '#f59e0b';
            case 'responding': return '#3b82f6';
            case 'not_solved': return '#ef4444';
            case 'closed': return '#6b7280';
            default: return '#9ca3af';
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "page-header", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("h2", { children: "SOS Event Logs" }), _jsx("p", { children: "Monitor and manage emergency SOS alerts from users." })] }), _jsxs("button", { onClick: fetchSOSEvents, className: "btn-admin-login", style: { padding: '8px 16px', fontSize: '0.9rem' }, children: [_jsx(RefreshCw, { size: 16, className: isLoading ? 'spin-anim' : '' }), " Refresh"] })] }), _jsx("div", { className: "data-table-container", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "User" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Description" }), _jsx("th", { children: "Location" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Status" })] }) }), _jsxs("tbody", { children: [sosEvents.map(event => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { style: { fontWeight: 500 }, children: event.users?.name || 'Unknown' }), _jsx("div", { style: { fontSize: '0.75rem', color: '#6b7280' }, children: event.users?.email || '' })] }), _jsx("td", { style: { textTransform: 'capitalize' }, children: event.emergency_type }), _jsx("td", { style: { maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: event.description || '-' }), _jsx("td", { style: { fontSize: '0.8rem' }, children: event.latitude && event.longitude
                                                ? `${Number(event.latitude).toFixed(4)}, ${Number(event.longitude).toFixed(4)}`
                                                : 'N/A' }), _jsx("td", { style: { fontSize: '0.8rem' }, children: new Date(event.created_at).toLocaleString() }), _jsx("td", { children: _jsxs("select", { value: event.status, onChange: (e) => updateStatus(event.id, e.target.value), style: {
                                                    background: '#0f1013',
                                                    color: getStatusColor(event.status),
                                                    border: `1px solid ${getStatusColor(event.status)}44`,
                                                    borderRadius: 8,
                                                    padding: '6px 10px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    outline: 'none'
                                                }, children: [_jsx("option", { value: "triggered", children: "Triggered" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "responding", children: "Responding" }), _jsx("option", { value: "solved", children: "Solved" }), _jsx("option", { value: "not_solved", children: "Not Solved" }), _jsx("option", { value: "closed", children: "Closed" })] }) })] }, event.id))), sosEvents.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, style: { textAlign: 'center', color: '#6b7280', padding: 20 }, children: "No SOS events recorded yet." }) }))] })] }) })] }));
};
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        navigate('/admin');
    };
    return (_jsxs("div", { className: "admin-dashboard-layout", children: [_jsxs("div", { className: "admin-sidebar", children: [_jsxs("div", { className: "sidebar-header", children: [_jsx(Shield, { size: 28, color: "#8b5cf6" }), _jsx("span", { style: { fontWeight: 700, fontSize: '1.1rem' }, children: "TG Admin" })] }), _jsxs("div", { className: "sidebar-nav", children: [_jsxs("div", { className: `nav-item ${activeTab === 'dashboard' ? 'active' : ''}`, onClick: () => setActiveTab('dashboard'), children: [_jsx(LayoutDashboard, { size: 20 }), " Dashboard"] }), _jsxs("div", { className: `nav-item ${activeTab === 'incidents' ? 'active' : ''}`, onClick: () => setActiveTab('incidents'), children: [_jsx(FileText, { size: 20 }), " Incidents"] }), _jsxs("div", { className: `nav-item ${activeTab === 'map' ? 'active' : ''}`, onClick: () => navigate('/map'), children: [_jsx(MapIcon, { size: 20 }), " Zone Map (Live)"] }), _jsxs("div", { className: `nav-item ${activeTab === 'alerts' ? 'active' : ''}`, onClick: () => setActiveTab('alerts'), children: [_jsx(Bell, { size: 20 }), " Alerts"] }), _jsxs("div", { className: `nav-item ${activeTab === 'tracking' ? 'active' : ''}`, onClick: () => setActiveTab('tracking'), children: [_jsx(MapIcon, { size: 20 }), " User Tracking"] }), _jsxs("div", { className: `nav-item ${activeTab === 'sos' ? 'active' : ''}`, onClick: () => setActiveTab('sos'), children: [_jsx(AlertTriangle, { size: 20 }), " SOS Logs"] })] }), _jsx("div", { className: "admin-logout", children: _jsxs("div", { className: "nav-item", onClick: handleLogout, style: { color: '#ef4444' }, children: [_jsx(LogOut, { size: 20 }), " Logout"] }) })] }), _jsxs("div", { className: "admin-content", children: [activeTab === 'dashboard' && _jsx(StatsView, {}), activeTab === 'incidents' && _jsx(IncidentsView, {}), activeTab === 'alerts' && _jsx(AlertsView, {}), activeTab === 'tracking' && _jsx(LocationTrackingView, {}), activeTab === 'sos' && _jsx(SOSLogsView, {})] })] }));
}
