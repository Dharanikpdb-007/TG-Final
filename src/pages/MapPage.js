import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import SafetyMap from '../components/SafetyMap';
import { useNotification } from '../contexts/NotificationContext';
export default function MapPage() {
    const { showNotification } = useNotification();
    useEffect(() => {
        // Check current zone status from storage (set by LocationTracker)
        const currentZone = localStorage.getItem('current_safety_zone');
        if (currentZone === 'red') {
            showNotification('WARNING: You are currently in a Red Zone (High Risk)!', 'error', 6000);
        }
        else if (currentZone === 'orange') {
            showNotification('Caution: You are in an Orange Zone (Moderate Risk).', 'warning', 5000);
        }
        else if (currentZone === 'blue') {
            showNotification('Info: You are in a Blue Zone (Low Risk / Cautious).', 'info', 4000);
        }
        else if (currentZone === 'green') {
            showNotification('You are in a Green Zone (Safe Area).', 'success', 3000);
        }
    }, []);
    return (_jsx("div", { style: { height: 'calc(100vh - 144px)', width: '100%', position: 'relative' }, children: _jsx(SafetyMap, {}) }));
}
