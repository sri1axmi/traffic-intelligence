import React, { useRef, useEffect, useState } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import ExplainabilityPanel from './ExplainabilityPanel';

const LIBRARIES = ['places'];

export default function Sidebar({
  userLocation,
  locationError,
  destination,
  setDestination,
  predictionData,
  routes,
  selectedRouteIdx,
  setSelectedRouteIdx,
  backendStatus,
  predicting,
  onPredict,
}) {
  const [destInput, setDestInput] = useState('');
  const autocompleteRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  const onAutoLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      setDestination({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        name: place.name || place.formatted_address || destInput,
      });
      setDestInput(place.name || place.formatted_address || '');
    }
  };

  const statusLabel = {
    checking: { icon: '🟡', text: 'Checking backend...' },
    connected: { icon: '🟢', text: 'Backend Connected' },
    predicting: { icon: '🟡', text: 'Predicting...' },
    error: { icon: '🔴', text: 'Backend Offline (mock mode)' },
  };

  const status = statusLabel[backendStatus] || statusLabel.error;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">T</div>
        <div className="sidebar-title">TrafficAI</div>
      </div>

      <div className="sidebar-content">
        {/* System Status */}
        <div className="status-bar">
          <span>{status.icon}</span>
          <span>{status.text}</span>
        </div>

        {/* Location Banner */}
        {locationError ? (
          <div className="location-banner error">⚠ {locationError}</div>
        ) : userLocation ? (
          <div className="location-banner">📍 Location detected</div>
        ) : (
          <div className="location-banner">⏳ Getting your location...</div>
        )}

        {/* Search Box */}
        <div className="search-box">
          <div className="search-row">
            <div className="search-dot origin" />
            <input
              className="search-input"
              placeholder="Your location"
              value={userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : ''}
              readOnly
            />
          </div>
          <div className="search-divider" />
          <div className="search-row">
            <div className="search-dot destination" />
            {isLoaded ? (
              <Autocomplete
                onLoad={onAutoLoad}
                onPlaceChanged={onPlaceChanged}
                options={{ types: ['geocode', 'establishment'] }}
              >
                <input
                  className="search-input"
                  placeholder="Search a destination..."
                  value={destInput}
                  onChange={(e) => setDestInput(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Autocomplete>
            ) : (
              <input
                className="search-input"
                placeholder="Loading autocomplete..."
                disabled
              />
            )}
          </div>
        </div>

        {/* Predict Button */}
        <button
          className="btn-primary"
          onClick={onPredict}
          disabled={predicting || !destination}
        >
          {predicting ? '🔄 Predicting traffic in 20 min...' : '🔮 Predict & Find Best Route'}
        </button>

        {/* Traffic Comparison */}
        {predictionData && (
          <div className="traffic-comparison fade-in">
            <div className="comparison-row">
              <div className="comparison-item">
                <span className="comparison-label">🟢 Google Traffic</span>
                <span className="comparison-value">Live</span>
              </div>
              <div className="comparison-divider" />
              <div className="comparison-item">
                <span className="comparison-label">🔮 AI Predicted (20 min)</span>
                <span className={`comparison-value badge-${predictionData.overallCongestion.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: '8px' }}>
                  {predictionData.overallCongestion}
                </span>
              </div>
            </div>
            <div className="prediction-delay">
              ⏱ Predicted delay: +{predictionData.delay} mins
            </div>
          </div>
        )}

        {/* Route Results */}
        {routes.length > 0 && (
          <div className="routes-section fade-in">
            <div className="routes-title">Routes — AI Ranked</div>
            {routes.map((route, idx) => (
              <div
                key={route.id}
                className={`route-card ${idx === selectedRouteIdx ? 'active' : ''}`}
                onClick={() => setSelectedRouteIdx(idx)}
              >
                <div className={`route-icon ${idx === 0 ? 'best' : 'alt'}`}>
                  {idx === 0 ? '★' : '→'}
                </div>
                <div className="route-info">
                  <div className="route-name">{route.name}</div>
                  <div className="route-meta">
                    {route.eta} • Score: {route.smartScore}
                  </div>
                </div>
                <span className={`route-badge badge-${route.congestion.toLowerCase()}`}>
                  {route.congestion}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Prediction confidence */}
        {predictionData && (
          <div className="prediction-card fade-in">
            <div className="prediction-header">
              <div className="prediction-title">
                🔮 {predictionData.predictionWindow} Ahead
              </div>
              <div className="prediction-confidence">
                {(predictionData.confidence * 100).toFixed(0)}% confident
              </div>
            </div>
          </div>
        )}

        {/* Explainability */}
        {predictionData && (
          <ExplainabilityPanel
            features={predictionData.features}
            confidence={predictionData.confidence}
          />
        )}
      </div>
    </div>
  );
}
