import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
} from 'react'
import L from 'leaflet'
import { AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { watchPosition as watchPosNative, type GeoPosition } from '../utils/geolocation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Zone {
    id: string
    zone_name: string
    latitude: number
    longitude: number
    radius_meters: number
    zone_type: 'danger' | 'medium' | 'safe' | 'public'
    description?: string
}

interface ActiveAlert {
    type: 'danger' | 'medium'
    message: string
    zoneName: string
}

interface GeofenceContextData {
    zones: Zone[]
    userPos: L.LatLng | null
    reloadZones: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GeofenceContext = createContext<GeofenceContextData>({
    zones: [],
    userPos: null,
    reloadZones: async () => { },
})

export const useGeofence = () => useContext(GeofenceContext)

// ─── Provider ─────────────────────────────────────────────────────────────────

export const GeofenceProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { user } = useAuth()

    const [zones, setZones] = useState<Zone[]>([])
    const [userPos, setUserPos] = useState<L.LatLng | null>(null)
    const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null)

    // Always-fresh ref to zones — watchPosition callback reads this, never stale
    const zonesRef = useRef<Zone[]>([])

    // True once the first Supabase load completes
    const zonesLoadedRef = useRef(false)

    // If watchPosition fires BEFORE zones load, save the position here
    // and replay it inside reloadZones() once zones are ready
    const pendingPosRef = useRef<L.LatLng | null>(null)

    // Persists across page navigations for the lifetime of the SPA tab
    const alertedZoneIds = useRef<Set<string>>(new Set())

    // ── Geofence check (declared FIRST so reloadZones can reference it) ───────

    const checkGeofencing = useCallback(
        (pos: L.LatLng, currentZones: Zone[]) => {
            const toAlert: ActiveAlert[] = []

            currentZones.forEach((zone) => {
                const zoneCenter = new L.LatLng(zone.latitude, zone.longitude)
                const distance = pos.distanceTo(zoneCenter)

                if (distance <= zone.radius_meters) {
                    // User is INSIDE the zone
                    if (!alertedZoneIds.current.has(zone.id)) {
                        if (zone.zone_type === 'danger') {
                            toAlert.push({
                                type: 'danger',
                                zoneName: zone.zone_name,
                                message: `You have entered ${zone.zone_name}. Do not enter!`,
                            })
                            alertedZoneIds.current.add(zone.id)
                            if (navigator.vibrate) navigator.vibrate([200, 100, 200])
                        } else if (zone.zone_type === 'medium') {
                            toAlert.push({
                                type: 'medium',
                                zoneName: zone.zone_name,
                                message: `You are in an Orange Zone (${zone.zone_name}). Be careful.`,
                            })
                            alertedZoneIds.current.add(zone.id)
                        }
                    }
                } else {
                    // User LEFT the zone — allow re-trigger on next entry
                    alertedZoneIds.current.delete(zone.id)
                }
            })

            if (toAlert.length > 0) {
                // Danger takes priority over medium
                const dangerAlert = toAlert.find((a) => a.type === 'danger')
                setActiveAlert(dangerAlert ?? toAlert[0])
            }
        },
        []
    )

    // ── Load zones from Supabase ──────────────────────────────────────────────

    const reloadZones = useCallback(async () => {
        const { data: trustedData } = await supabase
            .from('trusted_zones')
            .select('*')

        let allZones: Zone[] = []
        if (trustedData) allZones = [...(trustedData as Zone[])]

        // Merge recent incident reports as virtual danger/medium zones
        const { data: incidentData } = await supabase
            .from('incident_reports')
            .select('*')
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (incidentData) {
            const incidentZones: Zone[] = incidentData
                .filter((inc: any) => inc.location_latitude && inc.location_longitude)
                .map((inc: any) => {
                    let type: Zone['zone_type'] = 'public'
                    if (inc.severity === 'critical') type = 'danger'
                    else if (inc.severity === 'high') type = 'medium'
                    else if (inc.severity === 'medium') type = 'public'
                    else type = 'safe'
                    return {
                        id: `inc-${inc.id}`,
                        zone_name: `Reported Incident: ${inc.incident_type}`,
                        latitude: inc.location_latitude,
                        longitude: inc.location_longitude,
                        radius_meters: 500,
                        zone_type: type,
                        description: inc.description,
                    }
                })
            allZones = [...allZones, ...incidentZones]
        }

        zonesRef.current = allZones
        zonesLoadedRef.current = true
        setZones(allZones)

        // If watchPosition fired before we finished loading, replay the check now
        if (pendingPosRef.current) {
            checkGeofencing(pendingPosRef.current, allZones)
            pendingPosRef.current = null
        }
    }, [checkGeofencing])

    // ── Start persistent geolocation watch ───────────────────────────────────

    useEffect(() => {
        if (!user?.id) return

        // Load zones first (async — may finish after the first GPS fix)
        reloadZones()

        const handlePosition = (pos: GeoPosition) => {
            const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude)
            setUserPos(latlng)

            if (zonesLoadedRef.current) {
                checkGeofencing(latlng, zonesRef.current)
            } else {
                pendingPosRef.current = latlng
            }
        }

        // Cross-platform watch: uses Capacitor (native permission dialog) on
        // Android/iOS, navigator.geolocation on web.
        let cleanupFn: (() => void) | null = null

        watchPosNative(
            handlePosition,
            (err) => console.error('Geolocation error:', err),
            { enableHighAccuracy: true, timeout: 20_000, maximumAge: 10_000 }
        ).then((stop) => {
            cleanupFn = stop
        })

        return () => {
            cleanupFn?.()
        }
    }, [user?.id, reloadZones, checkGeofencing])

    // Re-check whenever zones reload and we already have a position
    useEffect(() => {
        if (userPos && zonesLoadedRef.current) {
            checkGeofencing(userPos, zones)
        }
    }, [zones]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <GeofenceContext.Provider value={{ zones, userPos, reloadZones }}>
            {children}

            {/* Danger Zone Modal — always at app level, survives page navigation */}
            {activeAlert && (
                <div className="custom-alert-overlay">
                    <div className={`custom-alert-card ${activeAlert.type}`}>
                        <div className="alert-icon-wrapper">
                            <AlertTriangle size={32} color="white" />
                        </div>
                        <h3>
                            {activeAlert.type === 'danger'
                                ? 'DANGER ZONE WARNING'
                                : 'CAUTION ADVISED'}
                        </h3>
                        <p>{activeAlert.message}</p>
                        <button
                            onClick={() => setActiveAlert(null)}
                            className="btn-dismiss"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            )}
        </GeofenceContext.Provider>
    )
}
