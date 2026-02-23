import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  color: string;
  icon?: keyof typeof Ionicons.glyphMap;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReportMapViewProps {
  markers: MapMarker[];
  userLocation?: { latitude: number; longitude: number } | null;
  showUserRadius?: boolean;
  userRadiusMeters?: number;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMarkerPress?: (marker: MapMarker) => void;
  onMapPress?: (coords: { latitude: number; longitude: number }) => void;
  children?: React.ReactNode;
}

/**
 * Builds an embeddable OpenStreetMap iframe URL for a given lat/lng.
 * Works reliably on web without CORS or API-key issues.
 */
function buildOsmEmbedUrl(lat: number, lng: number, zoom = 16): string {
  const bbox = 0.005; // roughly covers ~500m at mid-latitudes
  return (
    `https://www.openstreetmap.org/export/embed.html?` +
    `bbox=${lng - bbox},${lat - bbox},${lng + bbox},${lat + bbox}` +
    `&layer=mapnik&marker=${lat},${lng}`
  );
}

export default function ReportMapView({
  markers,
  userLocation,
  onMarkerPress,
  onMapPress,
}: ReportMapViewProps) {
  const primaryPoint = markers[0] ?? (userLocation
    ? {
        id: 'user-location',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        title: 'Current Location',
        color: Colors.primary,
      }
    : null);

  const centerLat = primaryPoint?.latitude ?? 0;
  const centerLng = primaryPoint?.longitude ?? 0;

  const mapEmbedUrl = primaryPoint
    ? buildOsmEmbedUrl(centerLat, centerLng)
    : null;

  const openStreetMapUrl = primaryPoint
    ? `https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}#map=16/${centerLat}/${centerLng}`
    : null;

  return (
    <View style={styles.container}>
      {mapEmbedUrl ? (
        <View style={styles.mapWrapper}>
          {/* Use an iframe for an interactive embedded OSM map on web */}
          <iframe
            title="Map View"
            src={mapEmbedUrl}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 }}
          />

          {/* Floating coordinate badge */}
          <View style={styles.floatingInfo}>
            <Ionicons name="location" size={12} color={Colors.primary} />
            <Text style={styles.coordsText}>
              {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
            </Text>
          </View>

          {/* Open in OSM link */}
          <Pressable
            style={styles.openMapBtn}
            onPress={() => {
              if (openStreetMapUrl) Linking.openURL(openStreetMapUrl);
            }}
          >
            <Ionicons name="open-outline" size={14} color={Colors.primary} />
            <Text style={styles.openMapText}>Open in Maps</Text>
          </Pressable>
        </View>
      ) : (
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
        </View>
      )}

      {/* Marker list beneath the map */}
      {markers.length > 0 && (
        <ScrollView style={styles.markerList} showsVerticalScrollIndicator={false}>
          {markers.map((m) => (
            <Pressable
              key={m.id}
              style={styles.webMarkerItem}
              onPress={() => onMarkerPress?.(m)}
            >
              <View style={[styles.webMarkerDot, { backgroundColor: m.color }]} />
              <View style={styles.webMarkerBody}>
                <Text style={styles.webMarkerTitle}>{m.title}</Text>
                {m.description ? <Text style={styles.webMarkerDesc}>{m.description}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export function MapLegend({ items }: { items: { label: string; color: string }[] }) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.gray100,
    minHeight: 150,
  },
  mapWrapper: {
    flex: 1,
    minHeight: 250,
    position: 'relative' as const,
  },
  floatingInfo: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coordsText: {
    fontSize: 11,
    color: Colors.gray600,
  },
  openMapBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openMapText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
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
    fontWeight: '700',
    color: Colors.gray900,
    marginTop: 8,
  },
  webFallbackText: {
    fontSize: 13,
    color: Colors.gray500,
  },
  webFallbackCoords: {
    fontSize: 11,
    color: Colors.gray400,
    marginTop: 4,
  },
  markerList: {
    maxHeight: 150,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  webMarkerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: Colors.gray50,
  },
  webMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  webMarkerBody: {
    flex: 1,
  },
  webMarkerTitle: {
    fontSize: 14,
    color: Colors.gray900,
    fontWeight: '600',
  },
  webMarkerDesc: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 2,
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
    color: Colors.gray700,
  },
});
