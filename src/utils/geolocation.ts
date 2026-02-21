/**
 * Cross-platform geolocation helper.
 *
 * On a Capacitor native app (Android / iOS) this module uses
 * @capacitor/geolocation which triggers the **native OS permission dialog**
 * ("Allow TourGuard to access your location?").
 *
 * On the web it falls back to navigator.geolocation (browser permission bar).
 *
 * Usage is identical to navigator.geolocation — just import the helpers
 * and call them instead of the raw browser API.
 */

import { Capacitor } from '@capacitor/core'
import { Geolocation, type WatchPositionCallback } from '@capacitor/geolocation'

// ─── Type aliases to stay compatible with the browser API ─────────────────────

export interface GeoPosition {
    coords: {
        latitude: number
        longitude: number
        accuracy: number
        altitude: number | null
        altitudeAccuracy: number | null
        heading: number | null
        speed: number | null
    }
    timestamp: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isNative = Capacitor.isNativePlatform()

/**
 * Request location permissions explicitly.
 * On **native** this shows the OS "Allow location?" dialog when called.
 * On **web** this is a no-op — the browser handles permissions automatically
 * when watchPosition / getCurrentPosition is called.
 */
export async function requestLocationPermission(): Promise<boolean> {
    if (!isNative) {
        // Web: browser asks automatically — nothing to do
        return true
    }

    try {
        // First check current status
        let status = await Geolocation.checkPermissions()

        if (status.location === 'granted' || status.coarseLocation === 'granted') {
            return true
        }

        // Request the native permission dialog
        status = await Geolocation.requestPermissions({ permissions: ['location'] })

        return status.location === 'granted' || status.coarseLocation === 'granted'
    } catch (err) {
        console.error('Permission request failed:', err)
        return false
    }
}

/**
 * One-shot position — requests permission first on native.
 */
export async function getCurrentPosition(
    options?: PositionOptions
): Promise<GeoPosition> {
    if (isNative) {
        await requestLocationPermission()
        const pos = await Geolocation.getCurrentPosition({
            enableHighAccuracy: options?.enableHighAccuracy ?? true,
            timeout: options?.timeout ?? 15_000,
            maximumAge: options?.maximumAge ?? 0,
        })
        return pos as GeoPosition
    }

    // Web fallback
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos as GeoPosition),
            reject,
            options
        )
    })
}

/**
 * Watch position continuously — requests permission first on native.
 *
 * Returns a cleanup function (call it to stop watching).
 */
export async function watchPosition(
    onSuccess: (pos: GeoPosition) => void,
    onError?: (err: any) => void,
    options?: PositionOptions
): Promise<() => void> {
    if (isNative) {
        const granted = await requestLocationPermission()
        if (!granted) {
            onError?.(new Error('Location permission denied'))
            return () => { }
        }

        const callbackId = await Geolocation.watchPosition(
            {
                enableHighAccuracy: options?.enableHighAccuracy ?? true,
                timeout: options?.timeout ?? 15_000,
                maximumAge: options?.maximumAge ?? 0,
            },
            ((pos: any, err: any) => {
                if (err) {
                    onError?.(err)
                } else if (pos) {
                    onSuccess(pos as GeoPosition)
                }
            }) as WatchPositionCallback
        )

        return () => {
            Geolocation.clearWatch({ id: callbackId })
        }
    }

    // Web fallback
    const watchId = navigator.geolocation.watchPosition(
        (pos) => onSuccess(pos as GeoPosition),
        onError ?? (() => { }),
        options
    )

    return () => navigator.geolocation.clearWatch(watchId)
}
