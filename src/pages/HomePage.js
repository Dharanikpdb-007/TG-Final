import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, User, MapPin, AlertTriangle, X, FileText, MessageSquare, Radar, Navigation, Users, Compass, BarChart3, Asterisk } from 'lucide-react';
import L from 'leaflet';
import { QRCodeCanvas } from 'qrcode.react';
import { useLanguage } from '../contexts/LanguageContext';
import './HomePage.css';
export default function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [userProfile, setUserProfile] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    // Location & Risk State
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationName, setLocationName] = useState('Locating...');
    const [riskLevel, setRiskLevel] = useState('Low');
    const [riskMessage, setRiskMessage] = useState("You're Safe");
    const [isLocationActive, setIsLocationActive] = useState(false);
    const [safetyScore, setSafetyScore] = useState(87.5);
    const [nearbyZoneName, setNearbyZoneName] = useState('');
    // Live Statistics State
    const [nearbyTouristsCount, setNearbyTouristsCount] = useState(0);
    const [activeAlertsCount, setActiveAlertsCount] = useState(0);
    useEffect(() => {
        if (user?.id) {
            loadUserProfile();
            fetchActiveAlerts();
        }
    }, [user?.id]);
    useEffect(() => {
        if (currentLocation && user?.id) {
            fetchNearbyTourists(currentLocation.lat, currentLocation.lng);
        }
    }, [currentLocation, user?.id]);
    const fetchActiveAlerts = async () => {
        try {
            const { count, error } = await supabase
                .from('incident_reports')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user?.id)
                .in('status', ['reported', 'investigating', 'under_review']); // Active statuses
            if (error)
                throw error;
            setActiveAlertsCount(count || 0);
        }
        catch (err) {
            console.error('Error fetching active alerts:', err);
        }
    };
    const fetchNearbyTourists = async (lat, lng) => {
        try {
            // Define a rough bounding box (~10km) to avoid fetching all users
            // 1 deg lat ~ 111km. 0.1 deg ~ 11km.
            const range = 0.1;
            const minLat = lat - range;
            const maxLat = lat + range;
            const minLng = lng - range;
            const maxLng = lng + range;
            const { data: users, error } = await supabase
                .from('users')
                .select('id, current_latitude, current_longitude')
                .neq('id', user?.id) // Exclude self
                .gte('current_latitude', minLat)
                .lte('current_latitude', maxLat)
                .gte('current_longitude', minLng)
                .lte('current_longitude', maxLng);
            if (error)
                throw error;
            // Client-side precise filtering
            let count = 0;
            if (users) {
                users.forEach(u => {
                    if (u.current_latitude && u.current_longitude) {
                        const dist = calculateDistance(lat, lng, u.current_latitude, u.current_longitude);
                        if (dist <= 5) { // 5km radius
                            count++;
                        }
                    }
                });
            }
            setNearbyTouristsCount(count);
        }
        catch (err) {
            console.error('Error fetching nearby tourists:', err);
        }
    };
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    useEffect(() => {
        if (showQRModal && user?.id) {
            loadUserProfile();
        }
    }, [showQRModal, user?.id]);
    // Watch location and calculate risk
    useEffect(() => {
        if (!navigator.geolocation) {
            setIsLocationActive(false);
            return;
        }
        const watchId = navigator.geolocation.watchPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setIsLocationActive(true);
            // Reverse geocode
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const data = await res.json();
                const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
                const country = data.address?.country || '';
                setLocationName(city ? `${city}, ${country}` : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
            catch {
                setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
            await checkRiskLevel(latitude, longitude);
        }, (err) => {
            console.error(err);
            setIsLocationActive(false);
        }, { enableHighAccuracy: true });
        return () => navigator.geolocation.clearWatch(watchId);
    }, [user?.id]);
    const loadUserProfile = async () => {
        const { data } = await supabase.from('users')
            .select('digital_id, name, passport_number, entry_date, exit_date')
            .eq('id', user?.id)
            .single();
        if (data)
            setUserProfile(data);
    };
    const checkRiskLevel = async (lat, lng) => {
        const { data: zones } = await supabase.from('trusted_zones').select('*');
        let newRisk = 'Low';
        let message = "You're Safe";
        let score = 87.5;
        let zone_name = '';
        if (zones) {
            zones.forEach((zone) => {
                const zoneCenter = L.latLng(zone.latitude, zone.longitude);
                const userPos = L.latLng(lat, lng);
                const distance = userPos.distanceTo(zoneCenter);
                if (distance <= zone.radius_meters) {
                    if (zone.zone_type === 'danger') {
                        newRisk = 'High';
                        message = `Danger Zone`;
                        score = 25;
                        zone_name = zone.zone_name;
                    }
                    else if (zone.zone_type === 'medium' && newRisk !== 'High') {
                        newRisk = 'Medium';
                        message = `Caution Advised`;
                        score = 55;
                        zone_name = zone.zone_name;
                    }
                    else if (zone.zone_type === 'safe' && newRisk === 'Low') {
                        zone_name = zone.zone_name;
                    }
                }
            });
        }
        setRiskLevel(newRisk);
        setRiskMessage(message);
        setSafetyScore(score);
        setNearbyZoneName(zone_name);
    };
    // QR Data
    const getQRData = () => {
        const name = userProfile?.name || 'Guest User';
        const passport = userProfile?.passport_number || 'N/A';
        const entry = userProfile?.entry_date || 'N/A';
        const exit = userProfile?.exit_date || 'N/A';
        const ref = userProfile?.digital_id || user?.id || 'Unknown';
        return `TOUR GUARD DIGITAL ID\n\nName: ${name}\nPassport: ${passport}\nEntry: ${entry}\nExit: ${exit}\nRef: ${ref}`;
    };
    const displayId = userProfile?.digital_id || user?.id?.substring(0, 12) || 'Generating...';
    // Score color logic
    const getScoreColor = () => {
        if (safetyScore >= 70)
            return '#10b981';
        if (safetyScore >= 40)
            return '#f59e0b';
        return '#ef4444';
    };
    const scoreColor = getScoreColor();
    // Progress bar percentage
    const scorePercent = Math.min(100, Math.max(0, safetyScore));
    // Sub-scores
    const locationScore = riskLevel === 'Low' ? 95 : riskLevel === 'Medium' ? 65 : 25;
    const behaviourScore = 85;
    const environmentScore = riskLevel === 'Low' ? 82 : riskLevel === 'Medium' ? 55 : 30;
    return (_jsxs("div", { className: "safer-home", children: [_jsxs("div", { className: "safety-score-card", children: [_jsxs("div", { className: "score-card-content", children: [_jsxs("div", { className: "score-info", children: [_jsx("h2", { className: "score-title", children: t('aiSafetyScore') }), _jsx("span", { className: "score-risk-label", style: { color: scoreColor }, children: riskLevel === 'Low' ? t('lowRisk') : riskLevel === 'Medium' ? t('mediumRisk') : t('highRisk') }), _jsx("span", { className: "score-updated", children: t('lastUpdated') })] }), _jsxs("div", { className: "score-rect-badge", style: { borderColor: `${scoreColor}33` }, children: [_jsx("span", { className: "score-rect-value", style: { color: scoreColor }, children: safetyScore.toFixed(1) }), _jsx("div", { className: "score-rect-bar-track", children: _jsx("div", { className: "score-rect-bar-fill", style: { width: `${scorePercent}%`, background: scoreColor } }) }), _jsx("span", { className: "score-rect-max", children: "/100" })] })] }), _jsxs("div", { className: "score-sub-metrics", children: [_jsxs("div", { className: "sub-metric", style: { borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.08)' }, children: [_jsx("span", { className: "sub-label", children: "Location" }), _jsxs("span", { className: "sub-value", style: { color: '#10b981' }, children: [locationScore, "%"] })] }), _jsxs("div", { className: "sub-metric", style: { borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.08)' }, children: [_jsx("span", { className: "sub-label", children: "Behaviour" }), _jsxs("span", { className: "sub-value", style: { color: '#10b981' }, children: [behaviourScore, "%"] })] }), _jsxs("div", { className: "sub-metric", style: { borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.08)' }, children: [_jsx("span", { className: "sub-label", children: "Environment" }), _jsxs("span", { className: "sub-value", style: { color: '#10b981' }, children: [environmentScore, "%"] })] })] })] }), _jsxs("div", { className: "location-status-card", children: [_jsxs("div", { className: "location-status-header", children: [_jsx(MapPin, { size: 18, color: "#10b981" }), _jsx("span", { className: "location-status-title", children: t('currentLocationStatus') })] }), _jsxs("div", { className: "location-status-body", children: [_jsxs("div", { className: "location-details", children: [_jsx("span", { className: "location-city", children: locationName }), _jsxs("span", { className: "location-zone-info", children: [nearbyZoneName ? nearbyZoneName : (isLocationActive ? 'Safe Tourist Zone' : 'Location not active'), isLocationActive && ' • Well-lit area'] })] }), _jsx("div", { className: `safe-badge ${riskLevel === 'Low' ? 'safe' : riskLevel === 'Medium' ? 'warning' : 'danger'}`, children: riskLevel === 'Low' ? (_jsxs(_Fragment, { children: [_jsx(Shield, { size: 14 }), " SAFE"] })) : riskLevel === 'Medium' ? (_jsxs(_Fragment, { children: [_jsx(AlertTriangle, { size: 14 }), " CAUTION"] })) : (_jsxs(_Fragment, { children: [_jsx(AlertTriangle, { size: 14 }), " DANGER"] })) })] })] }), _jsx("h3", { className: "section-title", children: t('quickActions') }), _jsxs("div", { className: "quick-actions-grid", children: [_jsxs("div", { className: "qa-card emergency", onClick: () => navigate('/sos'), children: [_jsx("div", { className: "qa-icon-wrap emergency-icon", children: _jsx(AlertTriangle, { size: 24 }) }), _jsx("span", { className: "qa-label", children: t('emergencyPanic') })] }), _jsxs("div", { className: "qa-card incident", onClick: () => navigate('/incident-log'), children: [_jsx("div", { className: "qa-icon-wrap incident-icon", children: _jsx(FileText, { size: 24 }) }), _jsx("span", { className: "qa-label", children: t('reportIncident') })] }), _jsxs("div", { className: "qa-card nearby", onClick: () => navigate('/nearby-incidents'), children: [_jsx("div", { className: "qa-icon-wrap nearby-icon", children: _jsx(Navigation, { size: 24 }) }), _jsx("span", { className: "qa-label", children: t('nearbyIncidents') })] }), _jsxs("div", { className: "qa-card ai-detect", onClick: () => navigate('/alerts'), children: [_jsx("div", { className: "qa-icon-wrap ai-detect-icon", children: _jsx(Radar, { size: 24 }) }), _jsx("span", { className: "qa-label", children: t('aiSafetyDetection') })] }), _jsxs("div", { className: "qa-card chatbot", onClick: () => navigate('/chatbot'), children: [_jsx("div", { className: "qa-icon-wrap chatbot-icon", children: _jsx(MessageSquare, { size: 24 }) }), _jsx("span", { className: "qa-label", children: t('smartChatbot') })] }), _jsxs("div", { className: "qa-card profile-mgr", onClick: () => navigate('/profile-id'), children: [_jsx("div", { className: "qa-icon-wrap profile-icon", children: _jsx(User, { size: 24 }) }), _jsx("span", { className: "qa-label", children: t('profileManager') })] }), _jsxs("div", { className: "qa-card community", onClick: () => navigate('/community'), children: [_jsx("div", { className: "qa-icon-wrap community-icon", children: _jsx(Users, { size: 24 }) }), _jsx("span", { className: "qa-label", children: t('communityInteraction') })] }), _jsxs("div", { className: "qa-card places", onClick: () => navigate('/places'), children: [_jsx("div", { className: "qa-icon-wrap places-icon", children: _jsx(Compass, { size: 24 }) }), _jsx("span", { className: "qa-label", children: t('nearbyPlaces') })] })] }), _jsxs("div", { className: "live-stats-section", children: [_jsxs("div", { className: "live-stats-header", children: [_jsx(BarChart3, { size: 20, color: "#60a5fa" }), _jsx("h3", { children: t('liveStatistics') })] }), _jsxs("div", { className: "live-stats-grid", children: [_jsxs("div", { className: "stat-item tourists", children: [_jsx(Users, { size: 18, className: "stat-icon" }), _jsx("span", { className: "stat-number", children: nearbyTouristsCount }), _jsx("span", { className: "stat-desc", children: t('nearbyTourists') })] }), _jsxs("div", { className: "stat-item alerts-stat", children: [_jsx(AlertTriangle, { size: 18, className: "stat-icon" }), _jsx("span", { className: "stat-number", children: activeAlertsCount }), _jsx("span", { className: "stat-desc", children: t('activeAlerts') })] }), _jsxs("div", { className: "stat-item response", children: [_jsx(Asterisk, { size: 18, className: "stat-icon" }), _jsx("span", { className: "stat-number", children: "< 5 min" }), _jsx("span", { className: "stat-desc", children: t('emergencyResponse') })] }), _jsxs("div", { className: "stat-item confidence", children: [_jsx(Shield, { size: 18, className: "stat-icon" }), _jsx("span", { className: "stat-number", children: "94.7%" }), _jsx("span", { className: "stat-desc", children: t('aiConfidence') })] })] })] }), showQRModal && (_jsx("div", { className: "qr-modal-overlay", onClick: () => setShowQRModal(false), children: _jsxs("div", { className: "qr-modal-card", onClick: e => e.stopPropagation(), children: [_jsx("button", { onClick: () => setShowQRModal(false), className: "qr-close-btn", children: _jsx(X, { size: 24, color: "#333" }) }), _jsx("h3", { style: { margin: '0 0 24px', color: '#1a1b1e' }, children: "Digital Tourist ID" }), _jsx("div", { style: { padding: 16, background: 'white', borderRadius: 12, display: 'inline-block' }, children: _jsx(QRCodeCanvas, { value: getQRData(), size: 200, bgColor: "#ffffff", fgColor: "#000000", level: "H" }) }), _jsxs("div", { style: { marginTop: 24, padding: '0 10px' }, children: [_jsxs("p", { style: { fontSize: '1rem', color: '#1a1b1e', marginBottom: 8, fontWeight: 700 }, children: ["ID: ", displayId] }), _jsx("p", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Scan this QR code to view full tourist details and verified status." })] })] }) }))] }));
}
