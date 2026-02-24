import React, { useRef, useEffect, useMemo, useCallback } from 'react';
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
 * Build self-contained Leaflet HTML that renders all markers + user location.
 * Runs inside an iframe via srcdoc so no external CORS issues.
 */
function buildLeafletHtml(
  markers: MapMarker[],
  userLocation?: { latitude: number; longitude: number } | null,
): string {
  // Compute center & zoom from markers + user location
  const points = [
    ...markers.map((m) => [m.latitude, m.longitude]),
    ...(userLocation ? [[userLocation.latitude, userLocation.longitude]] : []),
  ];

  let centerLat = 13.0827;
  let centerLng = 80.2707;
  let defaultZoom = 13;

  if (points.length === 1) {
    centerLat = points[0][0];
    centerLng = points[0][1];
    defaultZoom = 15;
  } else if (points.length > 1) {
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  }

  const markersJs = markers
    .map(
      (m) =>
        `L.circleMarker([${m.latitude}, ${m.longitude}], {
          radius: 10,
          fillColor: '${m.color}',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85
        }).addTo(map).bindPopup(\`<b>${m.title.replace(/'/g, "\\'").replace(/`/g, "\\`")}</b>${m.description ? `<br/><span style="color:#666;font-size:12px">${m.description.replace(/'/g, "\\'").replace(/`/g, "\\`")}</span>` : ''}\`).on('click', function(){ window.parent.postMessage({type:'marker-click',id:'${m.id}'},'*'); });`,
    )
    .join('\n');

  const userJs = userLocation
    ? `L.circleMarker([${userLocation.latitude}, ${userLocation.longitude}], {
        radius: 8,
        fillColor: '${Colors.secondary}',
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map).bindPopup('<b>Your Location</b>');
      L.circle([${userLocation.latitude}, ${userLocation.longitude}], {
        radius: 300,
        color: '${Colors.secondary}',
        fillColor: '${Colors.secondary}',
        fillOpacity: 0.08,
        weight: 1
      }).addTo(map);`
    : '';

  // Fit bounds to all points
  const fitBoundsJs =
    points.length > 1
      ? `map.fitBounds([${points.map((p) => `[${p[0]},${p[1]}]`).join(',')}], {padding:[40,40]});`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .leaflet-control-attribution { font-size: 10px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${centerLat}, ${centerLng}], ${defaultZoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    ${markersJs}
    ${userJs}
    ${fitBoundsJs}
  <\/script>
</body>
</html>`;
}

export default function ReportMapView({
  markers,
  userLocation,
  onMarkerPress,
  onMapPress,
}: ReportMapViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = useMemo(
    () => buildLeafletHtml(markers, userLocation),
    [markers, userLocation],
  );

  // Listen for marker click messages from the iframe
  const onMarkerPressRef = useRef(onMarkerPress);
  onMarkerPressRef.current = onMarkerPress;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'marker-click' && event.data?.id) {
        const marker = markers.find((m) => m.id === event.data.id);
        if (marker && onMarkerPressRef.current) {
          onMarkerPressRef.current(marker);
        }
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [markers]);

  const hasContent = markers.length > 0 || userLocation;

  const centerLat = markers[0]?.latitude ?? userLocation?.latitude ?? 0;
  const centerLng = markers[0]?.longitude ?? userLocation?.longitude ?? 0;
  const openStreetMapUrl =
    centerLat !== 0
      ? `https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}#map=16/${centerLat}/${centerLng}`
      : null;

  return (
    <View style={styles.container}>
      {hasContent ? (
        <View style={styles.mapWrapper}>
          <iframe
            ref={iframeRef}
            title="Map View"
            srcDoc={htmlContent}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 }}
            sandbox="allow-scripts"
          />

          {/* Floating coordinate badge */}
          <View style={styles.floatingInfo}>
            <Ionicons name="location" size={12} color={Colors.primary} />
            <Text style={styles.coordsText}>
              {markers.length} report{markers.length !== 1 ? 's' : ''} on map
            </Text>
          </View>

          {/* Open in OSM link */}
          {openStreetMapUrl && (
            <Pressable
              style={styles.openMapBtn}
              onPress={() => Linking.openURL(openStreetMapUrl)}
            >
              <Ionicons name="open-outline" size={14} color={Colors.primary} />
              <Text style={styles.openMapText}>Open in Maps</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.webFallback}>
          <Ionicons name="map" size={40} color={Colors.primary} />
          <Text style={styles.webFallbackTitle}>Map View</Text>
          <Text style={styles.webFallbackText}>No reports to show yet</Text>
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
    minHeight: 350,
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
