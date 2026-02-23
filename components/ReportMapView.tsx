import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

/* Conditionally import react-native-maps (unavailable on web) */
let MapView: any;
let Marker: any;
let Circle: any;
let UrlTile: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
  UrlTile = Maps.UrlTile;
}

/* ── Types ────────────────────────────────── */
interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  color: string;
  /** Ionicons icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReportMapViewProps {
  markers: MapMarker[];
  /** User's real-time location, if available */
  userLocation?: { latitude: number; longitude: number } | null;
  /** Show a pulsing circle around the user pin */
  showUserRadius?: boolean;
  userRadiusMeters?: number;
  /** Initial region override; auto-fits to markers by default */
  initialRegion?: Region;
  /** Called when a marker is tapped */
  onMarkerPress?: (marker: MapMarker) => void;
  /** Called when map is tapped */
  onMapPress?: (coords: { latitude: number; longitude: number }) => void;
  /** Extra React children rendered inside MapView */
  children?: React.ReactNode;
}

/* ── Default region (world center) ──────── */
const DEFAULT_REGION: Region = {
  latitude: 13.0827,
  longitude: 80.2707,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

/* ── Helpers ──────────────────────────────── */
function computeRegion(
  markers: { latitude: number; longitude: number }[],
  userLocation?: { latitude: number; longitude: number } | null,
): Region {
  const points = [...markers];
  if (userLocation) points.push(userLocation);
  if (points.length === 0) return DEFAULT_REGION;

  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.01),
  };
}

function markerColor(c: string) {
  // react-native-maps supports named colors and hex
  return c;
}

/* ── Component ───────────────────────────── */
export default function ReportMapView({
  markers,
  userLocation,
  showUserRadius = true,
  userRadiusMeters = 300,
  initialRegion,
  onMarkerPress,
  onMapPress,
  children,
}: ReportMapViewProps) {
  const mapRef = useRef<any>(null);

  const region = useMemo(
    () => initialRegion ?? computeRegion(markers, userLocation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markers.length, userLocation?.latitude, userLocation?.longitude],
  );

  /* Animate to new region when markers/user location change */
  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      mapRef.current.animateToRegion(region, 600);
    }
  }, [region, markers.length]);

  /* ── Web fallback (react-native-maps not supported) ── */
  if (Platform.OS === 'web' || !MapView) {
    return (
      <View style={styles.container}>
        <View style={styles.webFallback}>
          <Ionicons name="map" size={40} color={Colors.primary} />
          <Text style={styles.webFallbackTitle}>Map View</Text>
          <Text style={styles.webFallbackText}>
            {markers.length} location{markers.length !== 1 ? 's' : ''} pinned
          </Text>
          {userLocation && (
            <Text style={styles.webFallbackCoords}>
              Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Text>
          )}
          <ScrollView style={styles.webMarkerList} showsVerticalScrollIndicator={false}>
            {markers.map((m) => (
              <View
                key={m.id}
                style={styles.webMarkerItem}
                // @ts-ignore - onStartShouldSetResponder used for press on web
                onStartShouldSetResponder={() => {
                  onMarkerPress?.(m);
                  return true;
                }}
              >
                <View style={[styles.webMarkerDot, { backgroundColor: m.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.webMarkerTitle}>{m.title}</Text>
                  {m.description ? <Text style={styles.webMarkerDesc}>{m.description}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onPress={(event: any) => {
          const coordinate = event?.nativeEvent?.coordinate;
          if (coordinate) {
            onMapPress?.({
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
            });
          }
        }}
        showsUserLocation={false} // we draw our own marker
        showsMyLocationButton={false}
        showsCompass
        showsScale
        rotateEnabled={false}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
      >
        {UrlTile && (
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
        )}

        {/* ── Report / Task markers ────────── */}
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
            description={m.description}
            pinColor={markerColor(m.color)}
            onPress={() => onMarkerPress?.(m)}
          />
        ))}

        {/* ── User location marker ─────────── */}
        {userLocation && (
          <>
            {showUserRadius && (
              <Circle
                center={userLocation}
                radius={userRadiusMeters}
                fillColor="rgba(59,130,246,0.12)"
                strokeColor="rgba(59,130,246,0.35)"
                strokeWidth={1}
              />
            )}
            <Marker
              coordinate={userLocation}
              title="You"
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.userDot}>
                <View style={styles.userDotInner} />
              </View>
            </Marker>
          </>
        )}

        {children}
      </MapView>
    </View>
  );
}

/* ── Legend strip (optional helper) ──────── */
export function MapLegend({
  items,
}: {
  items: { label: string; color: string }[];
}) {
  return (
    <View style={styles.legend}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

/* ── Styles ───────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  map: { flex: 1 },
  userDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(59,130,246,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray600,
    textTransform: 'capitalize',
  },
  webFallback: {
    flex: 1,
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 6,
  },
  webFallbackTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.gray900,
    marginTop: 8,
  },
  webFallbackText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray500,
  },
  webFallbackCoords: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray400,
    marginTop: 4,
  },
  webMarkerList: {
    width: '100%',
    maxHeight: 200,
    marginTop: 12,
  },
  webMarkerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  webMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  webMarkerTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray800,
  },
  webMarkerDesc: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray500,
    marginTop: 1,
  },
});
