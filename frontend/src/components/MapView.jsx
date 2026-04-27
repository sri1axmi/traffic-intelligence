import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  TrafficLayer,
  InfoWindow,
} from '@react-google-maps/api';

const LIBRARIES = ['places'];

const mapContainerStyle = { width: '100%', height: '100%' };

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    // Subtle Google Maps-like clean style
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};

const routeColors = ['#1a73e8', '#9aa0a6', '#bdc1c6'];
const congestionColors = { Low: '#1e8e3e', Medium: '#f9ab00', High: '#d93025' };

export default function MapView({ userLocation, destination, routes, selectedRouteIdx, predictionData, onLocate }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  const mapRef = useRef(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const center = userLocation
    ? { lat: userLocation.lat, lng: userLocation.lng }
    : { lat: 17.385, lng: 78.4867 };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Fit bounds when routes change
  useEffect(() => {
    if (!mapRef.current || routes.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    const route = routes[selectedRouteIdx] || routes[0];
    route.path.forEach((p) => bounds.extend(p));
    mapRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 420, right: 60 });
  }, [routes, selectedRouteIdx]);

  if (loadError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5f6368' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <h3>Google Maps failed to load</h3>
          <p style={{ fontSize: 13, marginTop: 8 }}>Check your API key in <code>.env</code></p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5f6368' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse" style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <p>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {/* Live Traffic Layer from Google */}
        <TrafficLayer />

        {/* User location blue dot */}
        {userLocation && (
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#1a73e8',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            title="Your location"
            onClick={() => setActiveMarker('user')}
          >
            {activeMarker === 'user' && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                  <strong>📍 Your Location</strong>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Destination marker */}
        {destination && (
          <Marker
            position={{ lat: destination.lat, lng: destination.lng }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#d93025',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            title={destination.name || 'Destination'}
            onClick={() => setActiveMarker('dest')}
          >
            {activeMarker === 'dest' && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                  <strong>📌 {destination.name || 'Destination'}</strong>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Draw routes */}
        {routes.map((route, idx) => (
          <Polyline
            key={route.id}
            path={route.path}
            options={{
              strokeColor: idx === selectedRouteIdx
                ? congestionColors[route.congestion] || '#1a73e8'
                : routeColors[Math.min(idx, 2)],
              strokeWeight: idx === selectedRouteIdx ? 6 : 4,
              strokeOpacity: idx === selectedRouteIdx ? 0.9 : 0.4,
              zIndex: idx === selectedRouteIdx ? 10 : 1,
            }}
          />
        ))}

        {/* Congestion segment markers */}
        {predictionData && predictionData.segments && predictionData.segments.map((seg, idx) => (
          <Marker
            key={`seg-${idx}`}
            position={{ lat: seg.location[0], lng: seg.location[1] }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: congestionColors[seg.congestionLevel] || '#1a73e8',
              fillOpacity: 0.6,
              strokeColor: congestionColors[seg.congestionLevel] || '#1a73e8',
              strokeWeight: 2,
            }}
            title={`${seg.congestionLevel} traffic (predicted)`}
          />
        ))}
      </GoogleMap>

      {/* My location button */}
      <button className="map-locate-btn" onClick={onLocate} title="My location">
        ◎
      </button>
    </>
  );
}
