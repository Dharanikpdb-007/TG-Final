import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MapPin } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import './LocationPermissionPage.css';
export default function LocationPermissionPage({ onPermissionGranted, onSkip }) {
    const { showNotification } = useNotification();
    const handleEnableLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log('Location granted:', position.coords);
                onPermissionGranted();
            }, (error) => {
                console.error('Location error:', error);
                if (error.code === error.PERMISSION_DENIED) {
                    showNotification('Please enable location services in your browser settings to use this feature.', 'error');
                }
            });
        }
        else {
            showNotification('Geolocation is not supported by your browser.', 'error');
        }
    };
    return (_jsx("div", { className: "location-permission-container", children: _jsxs("div", { className: "permission-card", children: [_jsxs("div", { className: "card-header", children: [_jsx("div", { className: "header-icon-bg", children: _jsx(MapPin, { size: 24, color: "#3b82f6" }) }), _jsx("span", { className: "header-title", children: "Location Tracking" })] }), _jsxs("div", { className: "status-row", children: [_jsx("div", { className: "status-indicator inactive" }), _jsx("span", { className: "status-text", children: "Tracking Inactive" })] }), _jsx("p", { className: "permission-description", children: "Tour Guard requires location access to provide real-time safety alerts and emergency response." }), _jsx("button", { onClick: handleEnableLocation, className: "btn-start-tracking", children: "Start Location Tracking" }), _jsx("button", { onClick: onSkip, className: "btn-skip-link", children: "Continue without location (Limited)" })] }) }));
}
