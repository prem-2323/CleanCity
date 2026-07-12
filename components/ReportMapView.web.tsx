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
 * Build self-contained Google Maps HTML that renders all markers + user location.
 * Runs inside an iframe via srcdoc.
 */
function buildGoogleMapsHtml(
  markers: MapMarker[],
  userLocation?: { latitude: number; longitude: number } | null,
): string {
  const points = [
    ...markers.map((m) => ({ lat: m.latitude, lng: m.longitude, title: m.title, color: m.color, desc: m.description })),
    ...(userLocation ? [{ lat: userLocation.latitude, lng: userLocation.longitude, title: 'Your Location', color: Colors.secondary, desc: '' }] : []),
  ];

  let centerLat = 13.0827;
  let centerLng = 80.2707;
  let defaultZoom = 13;

  if (points.length === 1) {
    centerLat = points[0].lat;
    centerLng = points[0].lng;
    defaultZoom = 15;
  } else if (points.length > 1) {
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  }

  const markersData = JSON.stringify(points);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function initMap() {
      const markers = ${markersData};
      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: ${centerLat}, lng: ${centerLng} },
        zoom: ${defaultZoom},
        mapId: 'DEMO_MAP_ID', // For advanced markers if needed
        disableDefaultUI: false,
        zoomControl: true,
      });

      const bounds = new google.maps.LatLngBounds();

      markers.forEach((m, index) => {
        const position = { lat: m.lat, lng: m.lng };
        const marker = new google.maps.Marker({
          position: position,
          map: map,
          title: m.title,
          icon: m.title === 'Your Location' ? undefined : {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: m.color,
            fillOpacity: 0.9,
            strokeColor: '#fff',
            strokeWeight: 2,
            scale: 10
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: '<div style="padding:5px"><b>' + m.title + '</b>' + (m.desc ? '<br/><span style="color:#666;font-size:12px">' + m.desc + '</span>' : '') + '</div>'
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          window.parent.postMessage({type:'marker-click', id: markers[index].id}, '*');
        });

        bounds.extend(position);
      });

      if (markers.length > 1) {
        map.fitBounds(bounds);
      }
    }
  </script>
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyClRYCfkZNAMFg6mrpeeJ0UotwkLy50kQY&callback=initMap" async defer></script>
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
    () => buildGoogleMapsHtml(markers, userLocation),
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
  const googleMapsUrl =
    centerLat !== 0
      ? `https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}`
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

          {/* Open in Google Maps link */}
          {googleMapsUrl && (
            <Pressable
              style={styles.openMapBtn}
              onPress={() => Linking.openURL(googleMapsUrl)}
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
