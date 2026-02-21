import { MapPin, Shield, AlertTriangle } from 'lucide-react'
import { useNotification } from '../contexts/NotificationContext'
import { requestLocationPermission, getCurrentPosition } from '../utils/geolocation'
import './LocationPermissionPage.css'

interface LocationPermissionPageProps {
    onPermissionGranted: () => void
    onSkip: () => void
}

export default function LocationPermissionPage({ onPermissionGranted, onSkip }: LocationPermissionPageProps) {
    const { showNotification } = useNotification()

    const handleEnableLocation = async () => {
        try {
            // On native mobile: triggers OS permission dialog
            // On web: triggers browser permission bar
            const granted = await requestLocationPermission()

            if (!granted) {
                showNotification('Please enable location services in your device settings to use this feature.', 'error')
                return
            }

            // Get an initial position to confirm it works
            await getCurrentPosition({ enableHighAccuracy: true, timeout: 10_000 })
            onPermissionGranted()
        } catch (error: any) {
            console.error('Location error:', error)
            if (error?.code === 1) {
                showNotification('Please enable location services in your device settings to use this feature.', 'error')
            } else {
                showNotification('Could not get your location. Please try again.', 'error')
            }
        }
    }

    return (
        <div className="location-permission-container">
            <div className="permission-card">
                {/* Header Section from screenshot */}
                <div className="card-header">
                    <div className="header-icon-bg">
                        <MapPin size={24} color="#3b82f6" />
                    </div>
                    <span className="header-title">Location Tracking</span>
                </div>

                {/* Status Section from screenshot */}
                <div className="status-row">
                    <div className="status-indicator inactive"></div>
                    <span className="status-text">Tracking Inactive</span>
                </div>

                <p className="permission-description">
                    Tour Guard requires location access to provide real-time safety alerts and emergency response.
                </p>

                {/* Button from screenshot */}
                <button onClick={handleEnableLocation} className="btn-start-tracking">
                    Start Location Tracking
                </button>

                <button onClick={onSkip} className="btn-skip-link">
                    Continue without location (Limited)
                </button>
            </div>
        </div>
    )
}
