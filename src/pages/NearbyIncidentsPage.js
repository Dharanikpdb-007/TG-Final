import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, AlertTriangle, MapPin, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NearbyIncidentsPage.css';
export default function NearbyIncidentsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    useEffect(() => {
        loadNearbyIncidents();
    }, [user?.id]);
    const loadNearbyIncidents = async () => {
        if (!user?.id)
            return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('incident_reports')
                .select(`
                    id,
                    incident_type,
                    severity,
                    description,
                    status,
                    created_at,
                    location_latitude,
                    location_longitude,
                    user_id,
                    users:user_id (name)
                `)
                .neq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);
            if (error)
                throw error;
            setIncidents(data || []);
        }
        catch (err) {
            console.error('Error loading nearby incidents:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };
    const getSeverityBg = (severity) => {
        switch (severity) {
            case 'critical': return 'rgba(239, 68, 68, 0.1)';
            case 'high': return 'rgba(249, 115, 22, 0.1)';
            case 'medium': return 'rgba(245, 158, 11, 0.1)';
            case 'low': return 'rgba(16, 185, 129, 0.1)';
            default: return 'rgba(107, 114, 128, 0.1)';
        }
    };
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };
    const formatIncidentType = (type) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };
    const filteredIncidents = incidents.filter(inc => {
        if (filter === 'recent') {
            const hourAgo = Date.now() - 3600000;
            return new Date(inc.created_at).getTime() > hourAgo;
        }
        if (filter === 'critical') {
            return inc.severity === 'critical' || inc.severity === 'high';
        }
        return true;
    });
    return (_jsxs("div", { className: "nearby-incidents-page", children: [_jsxs("div", { className: "ni-header", children: [_jsx("button", { onClick: () => navigate(-1), className: "ni-back-btn", children: _jsx(ChevronLeft, { size: 24 }) }), _jsx("h2", { children: "Nearby Incidents" }), _jsx("span", { className: "ni-count", children: incidents.length })] }), _jsxs("div", { className: "ni-filters", children: [_jsx("button", { className: `ni-filter-btn ${filter === 'all' ? 'active' : ''}`, onClick: () => setFilter('all'), children: "All" }), _jsx("button", { className: `ni-filter-btn ${filter === 'recent' ? 'active' : ''}`, onClick: () => setFilter('recent'), children: "Last Hour" }), _jsx("button", { className: `ni-filter-btn ${filter === 'critical' ? 'active' : ''}`, onClick: () => setFilter('critical'), children: "Critical" })] }), isLoading ? (_jsxs("div", { className: "ni-loading", children: [_jsx("div", { className: "ni-spinner" }), _jsx("span", { children: "Loading incidents..." })] })) : filteredIncidents.length === 0 ? (_jsxs("div", { className: "ni-empty", children: [_jsx(AlertTriangle, { size: 40, color: "#6b7280" }), _jsx("h3", { children: "No Incidents Found" }), _jsx("p", { children: filter === 'all'
                            ? 'No incidents have been reported by other users yet.'
                            : filter === 'recent'
                                ? 'No incidents reported in the last hour.'
                                : 'No critical or high severity incidents.' })] })) : (_jsx("div", { className: "ni-list", children: filteredIncidents.map((incident) => (_jsxs("div", { className: "ni-card", children: [_jsxs("div", { className: "ni-card-header", children: [_jsxs("div", { className: "ni-severity-badge", style: {
                                        background: getSeverityBg(incident.severity),
                                        color: getSeverityColor(incident.severity),
                                        borderColor: `${getSeverityColor(incident.severity)}33`
                                    }, children: [_jsx(AlertTriangle, { size: 12 }), incident.severity.toUpperCase()] }), _jsxs("span", { className: "ni-time", children: [_jsx(Clock, { size: 12 }), formatTime(incident.created_at)] })] }), _jsx("h4", { className: "ni-type", children: formatIncidentType(incident.incident_type) }), _jsx("p", { className: "ni-description", children: incident.description }), _jsxs("div", { className: "ni-card-footer", children: [_jsxs("span", { className: "ni-reporter", children: [_jsx(User, { size: 13 }), incident.users?.name || 'Anonymous'] }), incident.location_latitude && (_jsxs("span", { className: "ni-location", children: [_jsx(MapPin, { size: 13 }), incident.location_latitude.toFixed(3), ", ", incident.location_longitude?.toFixed(3)] })), _jsx("span", { className: "ni-status", style: {
                                        color: incident.status === 'resolved' ? '#10b981' : '#f59e0b'
                                    }, children: incident.status })] })] }, incident.id))) }))] }));
}
