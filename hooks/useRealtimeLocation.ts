import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Platform, AppState } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
}

interface UseRealtimeLocationOptions {
  /** How often to receive location updates (ms). Default 3000 */
  intervalMs?: number;
  /** Minimum distance (meters) change to trigger update. Default 5 */
  distanceFilter?: number;
  /** expo-location accuracy level. Default High */
  accuracy?: Location.Accuracy;
  /** Start tracking immediately. Default true */
  autoStart?: boolean;
}

interface UseRealtimeLocationReturn {
  location: LocationCoords | null;
  error: string | null;
  isTracking: boolean;
  permissionGranted: boolean | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  /** Request a single fresh fix */
  refresh: () => Promise<LocationCoords | null>;
}

export function useRealtimeLocation(
  options: UseRealtimeLocationOptions = {},
): UseRealtimeLocationReturn {
  const {
    intervalMs = 3000,
    distanceFilter = 5,
    accuracy = Location.Accuracy.High,
    autoStart = true,
  } = options;

  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  /* ── permission ────────────────────────────── */
  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      if (!granted) setError('Location permission denied');
      return granted;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Permission request failed';
      setError(msg);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  /* ── start / stop ──────────────────────────── */
  const startTracking = useCallback(async () => {
    if (subscriptionRef.current) return; // already active

    const granted = await requestPermission();
    if (!granted) return;

    try {
      // Grab an initial fix immediately
      const initial = await Location.getCurrentPositionAsync({ accuracy });
      setLocation(initial.coords);
      setError(null);

      // Web fallback: poll with getCurrentPositionAsync
      if (Platform.OS === 'web') {
        const id = setInterval(async () => {
          try {
            const pos = await Location.getCurrentPositionAsync({ accuracy });
            setLocation(pos.coords);
          } catch {
            /* swallow */
          }
        }, intervalMs);
        subscriptionRef.current = { remove: () => clearInterval(id) } as unknown as Location.LocationSubscription;
      } else {
        const sub = await Location.watchPositionAsync(
          {
            accuracy,
            timeInterval: intervalMs,
            distanceInterval: distanceFilter,
          },
          (pos) => {
            setLocation(pos.coords);
            setError(null);
          },
        );
        subscriptionRef.current = sub;
      }

      setIsTracking(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to start location tracking';
      setError(msg);
    }
  }, [accuracy, distanceFilter, intervalMs, requestPermission]);

  const stopTracking = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setIsTracking(false);
  }, []);

  const refresh = useCallback(async (): Promise<LocationCoords | null> => {
    const granted = permissionGranted ?? (await requestPermission());
    if (!granted) return null;
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy });
      setLocation(pos.coords);
      return pos.coords;
    } catch {
      return null;
    }
  }, [accuracy, permissionGranted, requestPermission]);

  /* ── auto-start ────────────────────────────── */
  useEffect(() => {
    if (autoStart) {
      startTracking();
    }
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── pause when app is backgrounded (native) ──── */
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && autoStart && !subscriptionRef.current) {
        startTracking();
      } else if (state !== 'active') {
        stopTracking();
      }
    });
    return () => sub.remove();
  }, [autoStart, startTracking, stopTracking]);

  return {
    location,
    error,
    isTracking,
    permissionGranted,
    startTracking,
    stopTracking,
    refresh,
  };
}
