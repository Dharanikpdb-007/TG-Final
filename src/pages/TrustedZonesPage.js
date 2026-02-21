import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, Plus, MapPin, Trash2 } from 'lucide-react';
import './TrustedZonesPage.css';
export default function TrustedZonesPage({ onClose }) {
    const { user } = useAuth();
    const [zones, setZones] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        zone_name: '',
        latitude: '',
        longitude: '',
        radius_meters: '1000',
    });
    useEffect(() => {
        loadZones();
    }, [user?.id]);
    const loadZones = async () => {
        if (!user?.id)
            return;
        setIsLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('trusted_zones')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (fetchError)
                throw fetchError;
            setZones(data || []);
        }
        catch (err) {
            console.error('Error loading zones:', err);
            setError('Failed to load trusted zones');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateZone = async () => {
        setError('');
        setSuccess('');
        if (!formData.zone_name.trim()) {
            setError('Zone name is required');
            return;
        }
        if (!formData.latitude.trim() || !formData.longitude.trim()) {
            setError('Location coordinates are required');
            return;
        }
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            setError('Invalid coordinates');
            return;
        }
        setIsSaving(true);
        try {
            if (!user?.id)
                return;
            const { error: insertError } = await supabase
                .from('trusted_zones')
                .insert({
                user_id: user.id,
                zone_name: formData.zone_name,
                latitude: lat,
                longitude: lng,
                radius_meters: parseInt(formData.radius_meters) || 1000,
                is_active: true,
            });
            if (insertError)
                throw insertError;
            setFormData({
                zone_name: '',
                latitude: '',
                longitude: '',
                radius_meters: '1000',
            });
            setShowForm(false);
            setSuccess('Trusted zone created successfully');
            await loadZones();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create zone');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDeleteZone = async (zoneId) => {
        if (!confirm('Are you sure you want to delete this trusted zone?'))
            return;
        try {
            const { error: deleteError } = await supabase
                .from('trusted_zones')
                .delete()
                .eq('id', zoneId);
            if (deleteError)
                throw deleteError;
            setSuccess('Trusted zone deleted');
            await loadZones();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete zone');
        }
    };
    const handleToggleZone = async (zone) => {
        try {
            const { error: updateError } = await supabase
                .from('trusted_zones')
                .update({ is_active: !zone.is_active })
                .eq('id', zone.id);
            if (updateError)
                throw updateError;
            await loadZones();
        }
        catch (err) {
            console.error('Error toggling zone:', err);
        }
    };
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6),
                }));
                setSuccess('Location updated from device GPS');
            });
        }
        else {
            setError('Geolocation is not supported by your browser');
        }
    };
    return (_jsx("div", { className: "zones-modal-overlay", onClick: onClose, children: _jsxs("div", { className: "zones-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "zones-modal-header", children: [_jsx("h2", { children: "Trusted Zones" }), _jsx("button", { onClick: onClose, className: "close-button", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "zones-modal-content", children: [error && _jsx("div", { className: "error-message", children: error }), success && _jsx("div", { className: "success-message", children: success }), !showForm ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setShowForm(true), className: "btn-create-zone", children: [_jsx(Plus, { size: 18 }), "Add Trusted Zone"] }), isLoading ? (_jsx("div", { className: "loading", children: "Loading zones..." })) : zones.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx(MapPin, { size: 48 }), _jsx("p", { children: "No trusted zones added yet" }), _jsx("p", { className: "empty-subtitle", children: "Add safe locations where you want reduced emergency alerts" })] })) : (_jsx("div", { className: "zones-list", children: zones.map((zone) => (_jsxs("div", { className: "zone-card", children: [_jsxs("div", { className: "zone-header", children: [_jsxs("div", { className: "zone-info", children: [_jsx("h4", { children: zone.zone_name }), _jsxs("p", { className: "zone-coords", children: [zone.latitude.toFixed(4), ", ", zone.longitude.toFixed(4)] })] }), _jsx("button", { onClick: () => handleDeleteZone(zone.id), className: "delete-button", title: "Delete zone", children: _jsx(Trash2, { size: 18 }) })] }), _jsxs("div", { className: "zone-details", children: [_jsxs("span", { className: "zone-radius", children: ["Radius: ", zone.radius_meters.toLocaleString(), "m"] }), _jsxs("label", { className: "toggle-switch", children: [_jsx("input", { type: "checkbox", checked: zone.is_active, onChange: () => handleToggleZone(zone) }), _jsx("span", { className: "toggle-slider" }), _jsx("span", { className: "toggle-label", children: zone.is_active ? 'Active' : 'Inactive' })] })] })] }, zone.id))) }))] })) : (_jsxs("div", { className: "zones-form", children: [_jsx("h3", { children: "Add New Trusted Zone" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Zone Name *" }), _jsx("input", { type: "text", value: formData.zone_name, onChange: (e) => setFormData({ ...formData, zone_name: e.target.value }), placeholder: "e.g., Home, Office, School", disabled: isSaving })] }), _jsxs("div", { className: "location-section", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Latitude *" }), _jsx("input", { type: "number", step: "0.0001", value: formData.latitude, onChange: (e) => setFormData({ ...formData, latitude: e.target.value }), placeholder: "40.7128", disabled: isSaving })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Longitude *" }), _jsx("input", { type: "number", step: "0.0001", value: formData.longitude, onChange: (e) => setFormData({ ...formData, longitude: e.target.value }), placeholder: "-74.0060", disabled: isSaving })] }), _jsxs("button", { onClick: getCurrentLocation, className: "btn-gps", type: "button", disabled: isSaving, children: [_jsx(MapPin, { size: 16 }), "Use Current Location"] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Radius (meters)" }), _jsx("input", { type: "number", value: formData.radius_meters, onChange: (e) => setFormData({ ...formData, radius_meters: e.target.value }), placeholder: "1000", disabled: isSaving }), _jsx("small", { children: "Default safe zone radius around the location" })] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { onClick: handleCreateZone, className: "btn-primary", disabled: isSaving, children: isSaving ? 'Creating...' : 'Create Zone' }), _jsx("button", { onClick: () => setShowForm(false), className: "btn-secondary", disabled: isSaving, children: "Cancel" })] })] }))] })] }) }));
}
