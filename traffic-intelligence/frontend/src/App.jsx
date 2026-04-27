import React, { useState, useEffect, useCallback } from 'react';
import Auth from './components/Auth';
import Map from './components/Map';
import Sidebar from './components/Sidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [currentRoute, setCurrentRoute] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [routes, setRoutes] = useState([]);

  // Request geolocation on login
  useEffect(() => {
    if (isAuthenticated && !userLocation) {
      requestLocation();
    }
  }, [isAuthenticated]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationError('');
      },
      (err) => {
        setLocationError('Location access denied. Using default location.');
        // Fallback: Hyderabad
        setUserLocation({ lat: 17.385, lng: 78.4867 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        userLocation={userLocation}
        locationError={locationError}
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
        predictionData={predictionData}
        setPredictionData={setPredictionData}
        routes={routes}
        setRoutes={setRoutes}
        selectedRouteIdx={selectedRouteIdx}
        setSelectedRouteIdx={setSelectedRouteIdx}
      />
      <div className="map-container">
        <Map
          userLocation={userLocation}
          currentRoute={currentRoute}
          predictionData={predictionData}
          routes={routes}
          selectedRouteIdx={selectedRouteIdx}
          onLocate={requestLocation}
        />
      </div>
    </div>
  );
}

export default App;
