import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom blue dot icon for user location
const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:16px;height:16px;
    background:#1a73e8;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 2px rgba(26,115,232,0.3), 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  const once = useRef(false);
  useEffect(() => {
    if (center && !once.current) {
      map.setView(center, zoom);
      once.current = true;
    }
  }, [center, zoom, map]);
  return null;
}

function FitRoutes({ routes, selectedRouteIdx }) {
  const map = useMap();
  useEffect(() => {
    if (routes.length > 0 && routes[selectedRouteIdx]) {
      const coords = routes[selectedRouteIdx].coordinates;
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords.map(c => [c[0], c[1]]));
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    }
  }, [routes, selectedRouteIdx, map]);
  return null;
}

export default function Map({ userLocation, currentRoute, predictionData, routes, selectedRouteIdx, onLocate }) {
  const defaultCenter = [17.385, 78.4867]; // Hyderabad
  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  const getColor = (level) => {
    switch (level) {
      case 'Low': return '#1e8e3e';
      case 'Medium': return '#f9ab00';
      case 'High': return '#d93025';
      default: return '#1a73e8';
    }
  };

  return (
    <>
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <ChangeView center={center} zoom={14} />
        <FitRoutes routes={routes} selectedRouteIdx={selectedRouteIdx} />

        {/* Google Maps-style light tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {/* Draw all routes (non-selected in grey) */}
        {routes.map((route, idx) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            color={idx === selectedRouteIdx ? '#1a73e8' : '#9aa0a6'}
            weight={idx === selectedRouteIdx ? 6 : 4}
            opacity={idx === selectedRouteIdx ? 1 : 0.5}
          />
        ))}

        {/* Congestion segments for selected route */}
        {predictionData && predictionData.segments && predictionData.segments.map((seg, idx) => (
          <CircleMarker
            key={idx}
            center={seg.location}
            radius={10}
            pathOptions={{
              color: getColor(seg.congestionLevel),
              fillColor: getColor(seg.congestionLevel),
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              <strong>{seg.congestionLevel} Traffic</strong><br />
              Predicted in 20 min
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Locate me button */}
      <button className="map-locate-btn" onClick={onLocate} title="My location">
        ◎
      </button>
    </>
  );
}
