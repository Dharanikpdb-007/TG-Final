import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, Plus, AlertCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './IncidentReportPage.css';
export default function IncidentReportPage({ onClose }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    // Determine if running as Standalone Page or Modal
    const isPageMode = !onClose;
    // Handle Close Action
    const handleClose = () => {
        if (onClose)
            onClose();
        else
            navigate(-1); // Go back if page mode
    };
    const [formData, setFormData] = useState({
        incident_type: 'harassment',
        severity: 'medium',
        description: '',
        witnesses: '',
        evidence_notes: '',
    });
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    useEffect(() => {
        loadIncidents();
    }, [user?.id]);
    const loadIncidents = async () => {
        if (!user?.id)
            return;
        setIsLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('incident_reports')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (fetchError)
                throw fetchError;
            setIncidents(data || []);
        }
        catch (err) {
            console.error('Error loading incidents:', err);
            setError('Failed to load incidents');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateIncident = async () => {
        if (!user?.id)
            return;
        setError('');
        if (!formData.description.trim()) {
            setError('Description is required');
            return;
        }
        try {
            // Get current location
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
            }).catch(() => null);
            const witnesses = formData.witnesses
                .split(',')
                .map((w) => w.trim())
                .filter((w) => w);
            const { error: insertError } = await supabase
                .from('incident_reports')
                .insert({
                user_id: user.id,
                incident_type: formData.incident_type,
                severity: formData.severity,
                description: formData.description,
                witnesses: witnesses.length > 0 ? witnesses : null,
                evidence_notes: formData.evidence_notes || null,
                status: 'reported',
                location_latitude: position?.coords.latitude || null,
                location_longitude: position?.coords.longitude || null
            });
            if (insertError)
                throw insertError;
            setFormData({
                incident_type: 'harassment',
                severity: 'medium',
                description: '',
                witnesses: '',
                evidence_notes: '',
            });
            setShowForm(false);
            await loadIncidents();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create incident');
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return '#dc2626';
            case 'high':
                return '#ea580c';
            case 'medium':
                return '#eab308';
            case 'low':
                return '#16a34a';
            default:
                return '#6b7280';
        }
    };
    const getStatusBadge = (status) => {
        const statusMap = {
            reported: 'Reported',
            under_review: 'Under Review',
            investigating: 'Investigating',
            resolved: 'Resolved',
            closed: 'Closed',
        };
        return statusMap[status] || status;
    };
    // Wrapper Class: If page mode, use full screen container, else modal overlay
    const containerClass = isPageMode ? 'incident-page-container' : 'incident-modal-overlay';
    const contentClass = isPageMode ? 'incident-page-content' : 'incident-modal';
    return (_jsx("div", { className: containerClass, onClick: !isPageMode ? handleClose : undefined, children: _jsxs("div", { className: contentClass, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "incident-modal-header", children: [isPageMode ? (_jsx("button", { onClick: handleClose, className: "back-button", style: { background: 'none', border: 'none', color: 'white', marginRight: 10 }, children: _jsx(ChevronLeft, { size: 24 }) })) : null, _jsx("h2", { children: "Incident Reports" }), !isPageMode && (_jsx("button", { onClick: handleClose, className: "close-button", children: _jsx(X, { size: 24 }) }))] }), _jsxs("div", { className: "incident-modal-content", children: [error && (_jsxs("div", { className: "error-alert", children: [_jsx(AlertCircle, { size: 18 }), _jsx("span", { children: error })] })), !showForm ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setShowForm(true), className: "btn-create-incident", children: [_jsx(Plus, { size: 18 }), "Report New Incident"] }), isLoading ? (_jsx("div", { className: "loading", children: "Loading incidents..." })) : incidents.length === 0 ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "No incidents reported yet" }) })) : (_jsx("div", { className: "incidents-list", children: incidents.map((incident) => (_jsxs("div", { className: "incident-card", onClick: () => setSelectedIncident(incident), children: [_jsxs("div", { className: "incident-header", children: [_jsxs("div", { className: "incident-type", children: [_jsx("span", { className: "severity-badge", style: {
                                                                    backgroundColor: getSeverityColor(incident.severity),
                                                                }, children: incident.severity.toUpperCase() }), _jsx("h4", { children: incident.incident_type })] }), _jsx("span", { className: "incident-status", children: getStatusBadge(incident.status) })] }), _jsx("p", { className: "incident-description", children: incident.description }), _jsx("div", { className: "incident-meta", children: _jsx("span", { className: "incident-date", children: new Date(incident.created_at).toLocaleDateString() }) })] }, incident.id))) }))] })) : (_jsxs("div", { className: "incident-form", children: [_jsx("h3", { children: "Report an Incident" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Incident Type *" }), _jsxs("select", { value: formData.incident_type, onChange: (e) => setFormData({ ...formData, incident_type: e.target.value }), children: [_jsx("option", { value: "harassment", children: "Harassment" }), _jsx("option", { value: "threats", children: "Threats" }), _jsx("option", { value: "assault", children: "Physical Assault" }), _jsx("option", { value: "theft", children: "Theft" }), _jsx("option", { value: "accident", children: "Accident" }), _jsx("option", { value: "suspicious_activity", children: "Suspicious Activity" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Severity *" }), _jsxs("select", { value: formData.severity, onChange: (e) => setFormData({ ...formData, severity: e.target.value }), children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "critical", children: "Critical" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description *" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Provide detailed description of the incident", rows: 4 })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Witnesses (comma-separated)" }), _jsx("input", { type: "text", value: formData.witnesses, onChange: (e) => setFormData({ ...formData, witnesses: e.target.value }), placeholder: "John Doe, Jane Smith" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Evidence Notes" }), _jsx("textarea", { value: formData.evidence_notes, onChange: (e) => setFormData({ ...formData, evidence_notes: e.target.value }), placeholder: "Any evidence or additional details", rows: 3 })] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { onClick: handleCreateIncident, className: "btn-primary", children: "Submit Report" }), _jsx("button", { onClick: () => setShowForm(false), className: "btn-secondary", children: "Cancel" })] })] })), selectedIncident && (_jsx("div", { className: "incident-detail-overlay", onClick: () => setSelectedIncident(null), children: _jsxs("div", { className: "incident-detail", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => setSelectedIncident(null), className: "close-button", children: _jsx(X, { size: 24 }) }), _jsx("h3", { children: selectedIncident.incident_type }), _jsxs("div", { className: "detail-grid", children: [_jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Severity" }), _jsx("span", { className: "severity-badge", style: {
                                                            backgroundColor: getSeverityColor(selectedIncident.severity),
                                                        }, children: selectedIncident.severity.toUpperCase() })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Status" }), _jsx("span", { className: "status-text", children: getStatusBadge(selectedIncident.status) })] }), _jsxs("div", { className: "detail-item full-width", children: [_jsx("label", { children: "Description" }), _jsx("p", { children: selectedIncident.description })] }), selectedIncident.witnesses && selectedIncident.witnesses.length > 0 && (_jsxs("div", { className: "detail-item full-width", children: [_jsx("label", { children: "Witnesses" }), _jsx("ul", { children: selectedIncident.witnesses.map((w, i) => (_jsx("li", { children: w }, i))) })] })), selectedIncident.evidence_notes && (_jsxs("div", { className: "detail-item full-width", children: [_jsx("label", { children: "Evidence Notes" }), _jsx("p", { children: selectedIncident.evidence_notes })] })), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Created" }), _jsx("p", { children: new Date(selectedIncident.created_at).toLocaleString() })] }), selectedIncident.resolved_at && (_jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Resolved" }), _jsx("p", { children: new Date(selectedIncident.resolved_at).toLocaleString() })] }))] })] }) }))] })] }) }));
}
