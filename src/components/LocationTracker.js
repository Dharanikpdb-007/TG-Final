import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
export default function LocationTracker({ userId }) {
    // Logic Only Component - No UI
    const { showNotification } = useNotification();
    const [internalUserId, setInternalUserId] = useState(userId);
    useEffect(() => {
        if (userId) {
            setInternalUserId(userId);
        }
        else {
            supabase.auth.getUser().then(({ data }) => {
                if (data.user)
                    setInternalUserId(data.user.id);
            });
        }
    }, [userId]);
    useEffect(() => {
        if (!internalUserId)
            return;
        // Auto-start tracking if permission exists
        if (!navigator.geolocation)
            return;
        const watchId = navigator.geolocation.watchPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const timestamp = new Date().toISOString();
            const now = Date.now();
            // --- AI SAFETY LOGIC ---
            // Check if AI SOS is enabled by user
            const isAiEnabled = localStorage.getItem('ai_sos_enabled') === 'true';
            // Load granular feature flags
            const featureConfigStr = localStorage.getItem('ai_features_config');
            const featureConfig = featureConfigStr ? JSON.parse(featureConfigStr) : {
                behavioral: true,
                voice: true,
                crowd: true,
                context: true,
                predictive: true
            };
            if (isAiEnabled) {
                // 1. Static Location Check (Behavioral Anomaly)
                if (featureConfig.behavioral) {
                    const lastLat = parseFloat(localStorage.getItem('ai_last_lat') || '0');
                    const lastLon = parseFloat(localStorage.getItem('ai_last_lon') || '0');
                    const lastMoveTs = parseInt(localStorage.getItem('ai_last_move_ts') || Date.now().toString());
                    const distMoved = getDistanceFromLatLonInKm(latitude, longitude, lastLat, lastLon);
                    // Threshold: 100 meters movement to be considered "moving"
                    if (distMoved > 0.1 || lastLat === 0) {
                        localStorage.setItem('ai_last_lat', latitude.toString());
                        localStorage.setItem('ai_last_lon', longitude.toString());
                        localStorage.setItem('ai_last_move_ts', now.toString());
                    }
                    else {
                        // Not moved significantly
                        const timeStatic = now - lastMoveTs;
                        // CHANGED FOR DEMO: 5 Minutes (was 24 hours)
                        const STATIC_THRESHOLD_MS = 5 * 60 * 1000;
                        if (timeStatic > STATIC_THRESHOLD_MS) {
                            // Check if we already triggered recently to avoid spam
                            const lastTrigger = parseInt(localStorage.getItem('ai_sos_trigger_static_ts') || '0');
                            if (now - lastTrigger > 60 * 1000) { // 1 minute cooldown (was 1 hour)
                                console.warn('AI ALERT: User static for > 5min. Triggering SOS.');
                                await triggerSOS('other', 'User location unchanged for 5 minutes. Potential stuck/injured.', latitude, longitude);
                                localStorage.setItem('ai_sos_trigger_static_ts', now.toString());
                            }
                        }
                    }
                }
                // 2. Zone Check (Context-Aware)
                if (featureConfig.context) {
                    const zone = await checkZoneStatus(latitude, longitude);
                    const previousZone = localStorage.getItem('current_safety_zone');
                    // Update storage
                    localStorage.setItem('current_safety_zone', zone);
                    // Handle Red Zone specifically for SOS (existing logic)
                    if (zone === 'red') {
                        const entryTs = parseInt(localStorage.getItem('ai_red_zone_entry_ts') || '0');
                        if (entryTs === 0) {
                            localStorage.setItem('ai_red_zone_entry_ts', now.toString());
                            showNotification('WARNING: You have entered a Red Zone (High Danger)!', 'error', 5000);
                        }
                        else {
                            // SOS Logic for prolonged stay in Red Zone
                            const timeInZone = now - entryTs;
                            const ZONE_THRESHOLD_MS = 2 * 60 * 1000; // 2 min demo
                            if (timeInZone > ZONE_THRESHOLD_MS) {
                                const lastTrigger = parseInt(localStorage.getItem('ai_sos_trigger_zone_ts') || '0');
                                if (now - lastTrigger > 60 * 1000) {
                                    console.warn('AI ALERT: User in Red Zone > 2min. Triggering SOS.');
                                    await triggerSOS('other', 'User in high-risk zone for over 2 minutes.', latitude, longitude);
                                    localStorage.setItem('ai_sos_trigger_zone_ts', now.toString());
                                }
                            }
                        }
                    }
                    else {
                        // Not in Red Zone
                        localStorage.setItem('ai_red_zone_entry_ts', '0');
                        // If zone changed, notify user (except if just leaving red, handled above implicitly by clearing)
                        if (previousZone !== zone) {
                            if (zone === 'orange')
                                showNotification('Caution: You have entered an Orange Zone (Moderate Risk).', 'warning', 4000);
                            if (zone === 'blue')
                                showNotification('Info: You are in a Blue Zone (Low Risk areas nearby).', 'info', 3000);
                            if (zone === 'green')
                                showNotification('You are in a Green Zone (Safe Area).', 'success', 3000);
                        }
                    }
                }
                // 3. Other Placeholder Checks
                if (featureConfig.predictive) {
                    // Future Implementation
                }
            }
            // --- END AI LOGIC ---
            try {
                await supabase
                    .from('users')
                    .update({
                    current_latitude: latitude,
                    current_longitude: longitude,
                    last_location_update: timestamp,
                })
                    .eq('id', internalUserId);
            }
            catch (err) {
                console.error('Error updating location:', err);
            }
        }, (err) => {
            console.error('Location tracker error:', err);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [internalUserId]);
    const triggerSOS = async (type, description, lat, lon) => {
        if (!internalUserId)
            return;
        try {
            const { data: sosEvent, error: insertError } = await supabase
                .from('sos_events')
                .insert({
                user_id: internalUserId,
                emergency_type: type,
                description: description,
                latitude: lat,
                longitude: lon,
                status: 'triggered',
                triggered_at: new Date().toISOString(),
                device_info: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    source: 'AI_LOCATION_TRACKER'
                }
            })
                .select()
                .single();
            if (insertError)
                throw insertError;
            showNotification(`AI Safety Trigger: ${description}`, 'warning', 10000);
            await supabase.functions.invoke('send-sos-email', {
                body: {
                    sos_event_id: sosEvent?.id,
                    emergency_type: type,
                    description: description,
                },
            });
        }
        catch (e) {
            console.error('Failed to trigger AI SOS:', e);
        }
    };
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    async function checkZoneStatus(lat, lon) {
        try {
            const { data } = await supabase
                .from('incident_reports')
                .select('severity, location_latitude, location_longitude')
                .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            if (!data || data.length === 0)
                return 'green';
            let hasCritical = false;
            let hasHigh = false;
            let hasMedium = false;
            for (const incident of data) {
                if (incident.location_latitude && incident.location_longitude) {
                    const dist = getDistanceFromLatLonInKm(lat, lon, incident.location_latitude, incident.location_longitude);
                    if (dist < 0.5) {
                        if (incident.severity === 'critical')
                            hasCritical = true;
                        else if (incident.severity === 'high')
                            hasHigh = true;
                        else if (incident.severity === 'medium')
                            hasMedium = true;
                    }
                }
            }
            if (hasCritical)
                return 'red';
            if (hasHigh)
                return 'orange';
            if (hasMedium)
                return 'blue';
            return 'green';
        }
        catch (e) {
            return 'green';
        }
    }
    return null;
}
