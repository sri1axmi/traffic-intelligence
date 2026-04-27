import React, { useState } from 'react';
import ExplainabilityPanel from './ExplainabilityPanel';

export default function Sidebar({
  userLocation,
  locationError,
  currentRoute,
  setCurrentRoute,
  predictionData,
  setPredictionData,
  routes,
  setRoutes,
  selectedRouteIdx,
  setSelectedRouteIdx,
}) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill source when location is available
  React.useEffect(() => {
    if (userLocation && !source) {
      setSource(`${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);
    }
  }, [userLocation]);

  const handlePredict = () => {
    if (!destination.trim()) return;
    setLoading(true);

    // Simulate API call to /predict and /route
    setTimeout(() => {
      const baseLat = userLocation ? userLocation.lat : 17.385;
      const baseLng = userLocation ? userLocation.lng : 78.4867;

      const mockRoutes = [
        {
          id: 1,
          name: 'AI-Optimal Route',
          coordinates: [
            [baseLat, baseLng],
            [baseLat + 0.008, baseLng + 0.006],
            [baseLat + 0.018, baseLng + 0.015],
          ],
          eta: '12 mins',
          distance: '3.1 km',
          smartScore: 96.2,
          congestion: 'Low',
        },
        {
          id: 2,
          name: 'Fastest Route',
          coordinates: [
            [baseLat, baseLng],
            [baseLat + 0.012, baseLng + 0.003],
            [baseLat + 0.018, baseLng + 0.015],
          ],
          eta: '10 mins',
          distance: '2.8 km',
          smartScore: 88.7,
          congestion: 'Medium',
        },
        {
          id: 3,
          name: 'Alternate Route',
          coordinates: [
            [baseLat, baseLng],
            [baseLat + 0.005, baseLng + 0.012],
            [baseLat + 0.018, baseLng + 0.015],
          ],
          eta: '16 mins',
          distance: '3.8 km',
          smartScore: 79.3,
          congestion: 'Low',
        },
      ];

      const mockPrediction = {
        overallCongestion: 'Medium',
        delay: 4,
        confidence: 0.87,
        predictionWindow: '20 minutes',
        segments: [
          { location: [baseLat + 0.003, baseLng + 0.002], congestionLevel: 'Low' },
          { location: [baseLat + 0.010, baseLng + 0.008], congestionLevel: 'High' },
          { location: [baseLat + 0.016, baseLng + 0.013], congestionLevel: 'Low' },
        ],
        features: [
          { name: 'Time of Day', impact: 42 },
          { name: 'Historical Pattern', impact: 28 },
          { name: 'Weather Conditions', impact: 18 },
          { name: 'Road Incidents', impact: 12 },
        ],
      };

      setRoutes(mockRoutes);
      setCurrentRoute(mockRoutes[0]);
      setPredictionData(mockPrediction);
      setSelectedRouteIdx(0);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">T</div>
        <div className="sidebar-title">TrafficAI</div>
      </div>

      <div className="sidebar-content">
        {/* Location Status */}
        {locationError ? (
          <div className="location-banner error">
            ⚠ {locationError}
          </div>
        ) : userLocation ? (
          <div className="location-banner">
            📍 Location detected
          </div>
        ) : (
          <div className="location-banner">
            ⏳ Getting your location...
          </div>
        )}

        {/* Search Box */}
        <div className="search-box">
          <div className="search-row">
            <div className="search-dot origin" />
            <input
              className="search-input"
              placeholder="Your location"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <div className="search-divider" />
          <div className="search-row">
            <div className="search-dot destination" />
            <input
              className="search-input"
              placeholder="Choose destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        {/* Time Picker */}
        <div className="time-row">
          <span className="time-icon">🕐</span>
          <input
            className="time-input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="Departure time"
          />
        </div>

        {/* Predict Button */}
        <button
          className="btn-primary"
          onClick={handlePredict}
          disabled={loading || !destination.trim()}
        >
          {loading ? '🔄 Predicting traffic in 20 min...' : '🔮 Predict & Find Best Route'}
        </button>

        {/* Route Results */}
        {routes.length > 0 && (
          <div className="routes-section fade-in">
            <div className="routes-title">Routes — AI Ranked</div>
            {routes.map((route, idx) => (
              <div
                key={route.id}
                className={`route-card ${idx === selectedRouteIdx ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRouteIdx(idx);
                  setCurrentRoute(route);
                }}
              >
                <div className={`route-icon ${idx === 0 ? 'best' : 'alt'}`}>
                  {idx === 0 ? '★' : '→'}
                </div>
                <div className="route-info">
                  <div className="route-name">{route.name}</div>
                  <div className="route-meta">
                    {route.distance} • {route.eta} • Score: {route.smartScore}
                  </div>
                </div>
                <span className={`route-badge badge-${route.congestion.toLowerCase()}`}>
                  {route.congestion}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Prediction Summary */}
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
            <div className="prediction-delay">
              ⏱ Predicted delay: +{predictionData.delay} mins on selected route
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
