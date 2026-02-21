import { useState, useEffect } from 'react'
import {
    MapContainer,
    TileLayer,
    Circle,
    Marker,
    Popup,
    useMapEvents,
    useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useGeofence } from '../contexts/GeofenceContext'
import { Plus, X, Crosshair, Loader } from 'lucide-react'
import './SafetyMap.css'

// Fix for default Leaflet icon
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [24, 41],
    iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface Zone {
    id: string
    zone_name: string
    latitude: number
    longitude: number
    radius_meters: number
    zone_type: 'danger' | 'medium' | 'safe' | 'public'
    description?: string
}

const ZONE_COLORS = {
    danger: '#ef4444', // Red
    medium: '#f97316', // Orange
    safe: '#22c55e', // Green
    public: '#3b82f6', // Blue
}

const UserIcon = new L.Icon({
    iconUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzODQgNTEyIj48IS0tIUZvbnQgQXdlc29tZSBGcmVlIDYuNS4xIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlL2ZyZWUgQ29weXJpZ2h0IDIwMjQgRm9udGljb25zLCBJbmMuLS0+PHBhdGggZmlsbD0iIzNiODJmNiIgZD0iTTIxNS43IDQ5OS4yQzI2NyA0MzUgMzg0IDI3OS40IDM4NCAxOTJDMzg0IDg2IDI5OCAwIDE5MiAwUzAgODYgMCAxOTJjMCA4Ny40IDExNyAyNDMgMTY4LjMgMzA3LjJjMTIuMyAxNS4zIDM1LjEgMTUuMyA0Ny40IDB6TTE5MiAxMjhhNjQgNjQgMCAxIDEgMCAxMjggNjQgNjQgMCAxIDEgMC0xMjh6Ii8+PC9zdmc+',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
    shadowUrl: iconShadow,
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
})

// ── Sub-components ────────────────────────────────────────────────────────────

function LocationMarker({ userPos }: { userPos: L.LatLng | null }) {
    const [accuracy, setAccuracy] = useState<number>(0)
    const map = useMap()

    useEffect(() => {
        map
            .locate({ watch: false, enableHighAccuracy: true })
            .on('locationfound', (e) => setAccuracy(e.accuracy))
    }, [map])

    if (!userPos) return null

    return (
        <>
            <Circle
                center={userPos}
                radius={accuracy}
                pathOptions={{
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    color: 'transparent',
                }}
            />
            <Marker position={userPos} icon={UserIcon}>
                <Popup>You are here</Popup>
            </Marker>
        </>
    )
}

function LocateMeButton() {
    const map = useMap()
    const [locating, setLocating] = useState(false)

    const handleLocate = () => {
        setLocating(true)
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            setLocating(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                map.flyTo([latitude, longitude], 16, { duration: 1.5 })
                setLocating(false)
            },
            (err) => {
                console.error('Geolocation error:', err)
                let msg = 'Unable to get your location.'
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        msg = 'Location access denied. Please enable permissions in your browser settings.'
                        break
                    case err.POSITION_UNAVAILABLE:
                        msg = 'Location information is unavailable. Check your GPS.'
                        break
                    case err.TIMEOUT:
                        msg = 'Location request timed out. Please try again.'
                        break
                }
                alert(msg)
                setLocating(false)
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
        )
    }

    return (
        <button
            className={`btn-locate-me ${locating ? 'locating' : ''}`}
            onClick={handleLocate}
            disabled={locating}
            title="Go to my location"
        >
            {locating ? (
                <Loader size={20} className="spin-icon" />
            ) : (
                <Crosshair size={20} />
            )}
        </button>
    )
}

function AddZoneInterceptor({
    onMapClick,
}: {
    onMapClick: (latlng: L.LatLng) => void
}) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng)
        },
    })
    return null
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SafetyMap() {
    const { user } = useAuth()

    // Zones and user position come from the persistent GeofenceContext — no
    // duplicate watchPosition, no stale closure, no resets on page change.
    const { zones, userPos, reloadZones } = useGeofence()

    // UI State
    const [isAddingZone, setIsAddingZone] = useState(false)
    const [newZonePos, setNewZonePos] = useState<L.LatLng | null>(null)
    const [showZoneForm, setShowZoneForm] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'safe' as Zone['zone_type'],
        radius: 500,
    })

    const handleMapClick = (latlng: L.LatLng) => {
        if (isAddingZone) {
            setNewZonePos(latlng)
            setShowZoneForm(true)
            setIsAddingZone(false)
        }
    }

    const handleCreateZone = async () => {
        if (!newZonePos || !user?.id) return

        try {
            const { error } = await supabase.from('trusted_zones').insert({
                user_id: user.id,
                zone_name: formData.name || 'New Zone',
                latitude: newZonePos.lat,
                longitude: newZonePos.lng,
                radius_meters: formData.radius,
                zone_type: formData.type,
                is_active: true,
            })

            if (error) throw error

            setShowZoneForm(false)
            setNewZonePos(null)
            setFormData({ name: '', type: 'safe', radius: 500 })
            // Reload zones in context so geofencing picks up the new zone too
            await reloadZones()
        } catch (err: any) {
            console.error('Error creating zone:', err)
            alert('Failed to create zone. Ensure database migration is applied.')
        }
    }

    return (
        <div className="safety-map-container">
            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location dot — reads from context position */}
                <LocationMarker userPos={userPos} />
                <LocateMeButton />

                {isAddingZone && (
                    <AddZoneInterceptor onMapClick={handleMapClick} />
                )}

                {zones.map((zone) => (
                    <Circle
                        key={zone.id}
                        center={[zone.latitude, zone.longitude]}
                        radius={zone.radius_meters}
                        pathOptions={{
                            color: ZONE_COLORS[zone.zone_type] || ZONE_COLORS.safe,
                            fillColor: ZONE_COLORS[zone.zone_type] || ZONE_COLORS.safe,
                            fillOpacity: 0.2,
                        }}
                    >
                        <Popup>
                            <strong>{zone.zone_name}</strong>
                            <br />
                            Type: {zone.zone_type?.toUpperCase()}
                            <br />
                            Radius: {zone.radius_meters}m
                        </Popup>
                    </Circle>
                ))}

                {newZonePos && (
                    <Marker position={newZonePos}>
                        <Popup>New Zone Location</Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Control Button */}
            <div className="map-controls">
                <button
                    className={`btn-add-map-zone ${isAddingZone ? 'active' : ''}`}
                    onClick={() => {
                        setIsAddingZone(!isAddingZone)
                        setNewZonePos(null)
                    }}
                >
                    {isAddingZone ? <X size={20} /> : <Plus size={20} />}
                    {isAddingZone ? 'Cancel' : 'Add Zone'}
                </button>
            </div>

            {/* NOTE: The danger-zone alert modal is rendered by GeofenceProvider
          at the app level so it persists across all page navigations. */}

            {/* Zone Creation Modal */}
            {showZoneForm && (
                <div className="zone-form-overlay">
                    <div className="zone-form-card">
                        <h3>Add Safety Zone</h3>

                        <div className="form-group">
                            <label>Zone Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g. Dangerous Junction"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Zone Type</label>
                            <div className="zone-type-selector">
                                {(['danger', 'medium', 'safe', 'public'] as const).map(
                                    (t) => (
                                        <button
                                            key={t}
                                            className={`type-btn ${t} ${formData.type === t ? 'selected' : ''}`}
                                            onClick={() =>
                                                setFormData({ ...formData, type: t })
                                            }
                                        >
                                            {t === 'danger'
                                                ? 'Danger (Red)'
                                                : t === 'medium'
                                                    ? 'Medium (Orange)'
                                                    : t === 'safe'
                                                        ? 'Safe (Green)'
                                                        : 'Public (Blue)'}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Radius: {formData.radius}m</label>
                            <input
                                type="range"
                                min="100"
                                max="5000"
                                step="100"
                                value={formData.radius}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        radius: parseInt(e.target.value),
                                    })
                                }
                            />
                        </div>

                        <div className="form-actions">
                            <button className="btn-save" onClick={handleCreateZone}>
                                Create Zone
                            </button>
                            <button
                                className="btn-cancel"
                                onClick={() => setShowZoneForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddingZone && (
                <div className="instruction-toast">
                    Tap on the map to place the zone center
                </div>
            )}
        </div>
    )
}
