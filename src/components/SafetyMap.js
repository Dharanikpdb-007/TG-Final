import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, AlertTriangle, Crosshair, Loader } from 'lucide-react';
import './SafetyMap.css';
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
const ZONE_COLORS = {
    danger: '#ef4444', // Red
    medium: '#f97316', // Orange
    safe: '#22c55e', // Green
    public: '#3b82f6' // Blue
};
const UserIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzODQgNTEyIj48IS0tIUZvbnQgQXdlc29tZSBGcmVlIDYuNS4xIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlL2ZyZWUgQ29weXJpZ2h0IDIwMjQgRm9udGljb25zLCBJbmMuLS0+PHBhdGggZmlsbD0iIzNiODJmNiIgZD0iTTIxNS43IDQ5OS4yQzI2NyA0MzUgMzg0IDI3OS40IDM4NCAxOTJDMzg0IDg2IDI5OCAwIDE5MiAwUzAgODYgMCAxOTJjMCA4Ny40IDExNyAyNDMgMTY4LjMgMzA3LjJjMTIuMyAxNS4zIDM1LjEgMTUuMyA0Ny40IDB6TTE5MiAxMjhhNjQgNjQgMCAxIDEgMCAxMjggNjQgNjQgMCAxIDEgMC0xMjh6Ii8+PC9zdmc+',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
    shadowUrl: iconShadow,
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});
function LocationMarker() {
    const [position, setPosition] = useState(null);
    const [accuracy, setAccuracy] = useState(0);
    const map = useMap();
    useEffect(() => {
        map.locate({ watch: true, enableHighAccuracy: true })
            .on('locationfound', function (e) {
            setPosition(e.latlng);
            setAccuracy(e.accuracy);
        })
            .on('locationerror', function (e) {
            console.warn("Location access denied or failed", e);
        });
    }, [map]);
    return position === null ? null : (_jsxs(_Fragment, { children: [_jsx(Circle, { center: position, radius: accuracy, pathOptions: { fillColor: '#3b82f6', fillOpacity: 0.1, color: 'transparent' } }), _jsx(Marker, { position: position, icon: UserIcon, children: _jsx(Popup, { children: "You are here" }) })] }));
}
function LocateMeButton() {
    const map = useMap();
    const [locating, setLocating] = useState(false);
    const handleLocate = () => {
        setLocating(true);
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            setLocating(false);
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            map.flyTo([latitude, longitude], 16, { duration: 1.5 });
            setLocating(false);
        }, (err) => {
            console.error('Geolocation error:', err);
            let msg = 'Unable to get your location.';
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    msg = 'Location access denied. Please enable permissions in your browser settings.';
                    break;
                case err.POSITION_UNAVAILABLE:
                    msg = 'Location information is unavailable. Check your GPS.';
                    break;
                case err.TIMEOUT:
                    msg = 'Location request timed out. Please try again.';
                    break;
            }
            alert(msg);
            setLocating(false);
        }, {
            enableHighAccuracy: true,
            timeout: 30000, // Increased to 30s
            maximumAge: 10000 // Accept positions up to 10s old
        });
    };
    return (_jsx("button", { className: `btn-locate-me ${locating ? 'locating' : ''}`, onClick: handleLocate, disabled: locating, title: "Go to my location", children: locating ? _jsx(Loader, { size: 20, className: "spin-icon" }) : _jsx(Crosshair, { size: 20 }) }));
}
function AddZoneInterceptor({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
}
export default function SafetyMap() {
    const { user } = useAuth();
    const [zones, setZones] = useState([]);
    const [userPos, setUserPos] = useState(null);
    // UI State
    const [isAddingZone, setIsAddingZone] = useState(false);
    const [newZonePos, setNewZonePos] = useState(null);
    const [showZoneForm, setShowZoneForm] = useState(false);
    // Alert State (Custom Modal)
    const [activeAlert, setActiveAlert] = useState(null);
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'safe',
        radius: 500
    });
    // Alert State to prevent spamming
    const alertedZoneIds = useRef(new Set());
    useEffect(() => {
        loadZones();
        // Track user location for geofencing alerts
        const watchId = navigator.geolocation.watchPosition((pos) => {
            const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
            setUserPos(latlng);
            checkGeofencing(latlng, zones);
        }, (err) => console.error(err), { enableHighAccuracy: true });
        return () => navigator.geolocation.clearWatch(watchId);
    }, [user?.id]);
    // Re-check geofencing when zones update
    useEffect(() => {
        if (userPos)
            checkGeofencing(userPos, zones);
    }, [zones]);
    const loadZones = async () => {
        const { data: trustedData } = await supabase
            .from('trusted_zones')
            .select('*');
        let allZones = [];
        if (trustedData) {
            allZones = [...trustedData];
        }
        // Fetch Incidents to visualize as zones
        const { data: incidentData } = await supabase
            .from('incident_reports')
            .select('*')
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // last 24h
        if (incidentData) {
            const incidentZones = incidentData
                .filter(inc => inc.location_latitude && inc.location_longitude)
                .map(inc => {
                let type = 'public'; // default blue/medium
                if (inc.severity === 'critical')
                    type = 'danger';
                else if (inc.severity === 'high')
                    type = 'medium';
                else if (inc.severity === 'medium')
                    type = 'public';
                else
                    type = 'safe'; // Should not happen for incidents usually
                return {
                    id: `inc-${inc.id}`,
                    zone_name: `Reported Incident: ${inc.incident_type}`,
                    latitude: inc.location_latitude,
                    longitude: inc.location_longitude,
                    radius_meters: 500, // Fixed 500m radius for incidents
                    zone_type: type,
                    description: inc.description
                };
            });
            allZones = [...allZones, ...incidentZones];
        }
        setZones(allZones);
    };
    const checkGeofencing = (pos, currentZones) => {
        currentZones.forEach(zone => {
            const zoneCenter = new L.LatLng(zone.latitude, zone.longitude);
            const distance = pos.distanceTo(zoneCenter);
            if (distance <= zone.radius_meters) {
                if (!alertedZoneIds.current.has(zone.id)) {
                    // Trigger Custom Alert based on type
                    if (zone.zone_type === 'danger') {
                        setActiveAlert({
                            type: 'danger',
                            zoneName: zone.zone_name,
                            message: `You have entered ${zone.zone_name}. Do not enter!`
                        });
                        alertedZoneIds.current.add(zone.id);
                        // Vibration API if supported
                        if (navigator.vibrate)
                            navigator.vibrate([200, 100, 200]);
                    }
                    else if (zone.zone_type === 'medium') {
                        setActiveAlert({
                            type: 'medium',
                            zoneName: zone.zone_name,
                            message: `You are in an Orange Zone (${zone.zone_name}). Be careful.`
                        });
                        alertedZoneIds.current.add(zone.id);
                    }
                }
            }
            else {
                // Reset alert if user leaves the zone
                if (alertedZoneIds.current.has(zone.id)) {
                    alertedZoneIds.current.delete(zone.id);
                }
            }
        });
    };
    const handleMapClick = (latlng) => {
        if (isAddingZone) {
            setNewZonePos(latlng);
            setShowZoneForm(true);
            setIsAddingZone(false); // Stop capturing clicks
        }
    };
    const handleCreateZone = async () => {
        if (!newZonePos || !user?.id)
            return;
        try {
            const { error } = await supabase
                .from('trusted_zones')
                .insert({
                user_id: user.id,
                zone_name: formData.name || 'New Zone',
                latitude: newZonePos.lat,
                longitude: newZonePos.lng,
                radius_meters: formData.radius,
                zone_type: formData.type,
                is_active: true
            });
            if (error)
                throw error;
            // Reset
            setShowZoneForm(false);
            setNewZonePos(null);
            setFormData({ name: '', type: 'safe', radius: 500 });
            loadZones();
            // Use Toast ideally, but console for now or small alert
            console.log('Zone added');
        }
        catch (err) {
            console.error('Error creating zone:', err);
            alert('Failed to create zone. Ensure database migration is applied.');
        }
    };
    return (_jsxs("div", { className: "safety-map-container", children: [_jsxs(MapContainer, { center: [20.5937, 78.9629], zoom: 5, style: { height: '100%', width: '100%' }, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), _jsx(LocationMarker, {}), _jsx(LocateMeButton, {}), isAddingZone && _jsx(AddZoneInterceptor, { onMapClick: handleMapClick }), zones.map(zone => (_jsx(Circle, { center: [zone.latitude, zone.longitude], radius: zone.radius_meters, pathOptions: {
                            color: ZONE_COLORS[zone.zone_type] || ZONE_COLORS.safe,
                            fillColor: ZONE_COLORS[zone.zone_type] || ZONE_COLORS.safe,
                            fillOpacity: 0.2
                        }, children: _jsxs(Popup, { children: [_jsx("strong", { children: zone.zone_name }), _jsx("br", {}), "Type: ", zone.zone_type?.toUpperCase(), _jsx("br", {}), "Radius: ", zone.radius_meters, "m"] }) }, zone.id))), newZonePos && (_jsx(Marker, { position: newZonePos, children: _jsx(Popup, { children: "New Zone Location" }) }))] }), _jsx("div", { className: "map-controls", children: _jsxs("button", { className: `btn-add-map-zone ${isAddingZone ? 'active' : ''}`, onClick: () => { setIsAddingZone(!isAddingZone); setNewZonePos(null); }, children: [isAddingZone ? _jsx(X, { size: 20 }) : _jsx(Plus, { size: 20 }), isAddingZone ? 'Cancel' : 'Add Zone'] }) }), activeAlert && (_jsx("div", { className: "custom-alert-overlay", children: _jsxs("div", { className: `custom-alert-card ${activeAlert.type}`, children: [_jsx("div", { className: "alert-icon-wrapper", children: _jsx(AlertTriangle, { size: 32, color: "white" }) }), _jsx("h3", { children: activeAlert.type === 'danger' ? 'DANGER ZONE WARNING' : 'CAUTION ADVISED' }), _jsx("p", { children: activeAlert.message }), _jsx("button", { onClick: () => setActiveAlert(null), className: "btn-dismiss", children: "I Understand" })] }) })), showZoneForm && (_jsx("div", { className: "zone-form-overlay", children: _jsxs("div", { className: "zone-form-card", children: [_jsx("h3", { children: "Add Safety Zone" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Zone Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "e.g. Dangerous Junction", autoFocus: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Zone Type" }), _jsxs("div", { className: "zone-type-selector", children: [_jsx("button", { className: `type-btn danger ${formData.type === 'danger' ? 'selected' : ''}`, onClick: () => setFormData({ ...formData, type: 'danger' }), children: "Danger (Red)" }), _jsx("button", { className: `type-btn medium ${formData.type === 'medium' ? 'selected' : ''}`, onClick: () => setFormData({ ...formData, type: 'medium' }), children: "Medium (Orange)" }), _jsx("button", { className: `type-btn safe ${formData.type === 'safe' ? 'selected' : ''}`, onClick: () => setFormData({ ...formData, type: 'safe' }), children: "Safe (Green)" }), _jsx("button", { className: `type-btn public ${formData.type === 'public' ? 'selected' : ''}`, onClick: () => setFormData({ ...formData, type: 'public' }), children: "Public (Blue)" })] })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: ["Radius: ", formData.radius, "m"] }), _jsx("input", { type: "range", min: "100", max: "5000", step: "100", value: formData.radius, onChange: (e) => setFormData({ ...formData, radius: parseInt(e.target.value) }) })] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { className: "btn-save", onClick: handleCreateZone, children: "Create Zone" }), _jsx("button", { className: "btn-cancel", onClick: () => setShowZoneForm(false), children: "Cancel" })] })] }) })), isAddingZone && (_jsx("div", { className: "instruction-toast", children: "Tap on the map to place the zone center" }))] }));
}
