import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { ensureTestData } from '../utils/testData';
import './BirdingMap.css';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

// Fix default marker icons (Leaflet + Webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMxOS40MDM2IDAgMjUgNS41OTY0NCAyNSAxMi41QzI1IDE5LjQwMzYgMTkuNDAzNiAyNSAxMi41IDI1QzUuNTk2NDQgMjUgMCAxOS40MDM2IDAgMTIuNUMwIDUuNTk2NDQgNS41OTY0NCAwIDEyLjUgMFoiIGZpbGw9IiMzQjgyRjYiLz4KPHBhdGggZD0iTTEyLjUgNEM5LjQ2MjQzIDQgNyA2LjQ2MjQzIDcgOS41QzcgMTIuNTM3NiA5LjQ2MjQzIDE1IDEyLjUgMTVDMTUuNTM3NiAxNSAxOCAxMi41Mzc2IDE4IDkuNUMxOCA2LjQ2MjQzIDE1LjUzNzYgNCAxMi41IDRaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIuNSA0MUw3LjUgMjVIMTcuNUwxMi41IDQxWiIgZmlsbD0iIzNCODJGNiIvPgo8L3N2Zz4K',
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMxOS40MDM2IDAgMjUgNS41OTY0NCAyNSAxMi41QzI1IDE5LjQwMzYgMTkuNDAzNiAyNSAxMi41IDI1QzUuNTk2NDQgMjUgMCAxOS40MDM2IDAgMTIuNUMwIDUuNTk2NDQgNS41OTY0NCAwIDEyLjUgMFoiIGZpbGw9IiMzQjgyRjYiLz4KPHBhdGggZD0iTTEyLjUgNEM5LjQ2MjQzIDQgNyA2LjQ2MjQzIDcgOS41QzcgMTIuNTM3NiA5LjQ2MjQzIDE1IDEyLjUgMTVDMTUuNTM3NiAxNSAxOCAxMi41Mzc2IDE4IDkuNUMxOCA2LjQ2MjQzIDE1LjUzNzYgNCAxMi41IDRaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIuNSA0MUw3LjUgMjVIMTcuNUwxMi41IDQxWiIgZmlsbD0iIzNCODJGNiIvPgo8L3N2Zz4K',
  shadowUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA0MSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGVsbGlwc2UgY3g9IjIwLjUiIGN5PSIyMC41IiByeD0iMjAuNSIgcnk9IjIwLjUiIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4zIi8+Cjwvc3ZnPgo=',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom bird marker icon
const createBirdIcon = (species) => {
  const birdEmojis = {
    'robin': '🐦',
    'cardinal': '🔴',
    'blue jay': '🔵', 
    'sparrow': '🐤',
    'hawk': '🦅',
    'eagle': '🦅',
    'owl': '🦉',
    'duck': '🦆',
    'swan': '🦢',
    'flamingo': '🦩'
  };
  
  const emoji = birdEmojis[species?.toLowerCase()] || '🐦';
  
  return L.divIcon({
    className: 'custom-bird-marker',
    html: `<div class="bird-marker-content">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Component to fit map bounds to markers
const FitBounds = ({ locations }) => {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations, map]);
  
  return null;
};

const BirdingMap = ({ sightings = [] }) => {
  const { t } = useLanguage();
  const [selectedSighting, setSelectedSighting] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showTestData, setShowTestData] = useState(false);
  const [debugInfo, setDebugInfo] = useState(false);

  // Use test data if enabled or if no real sightings with coordinates exist
  const sightingsWithCoords = sightings.filter(s => s.latitude && s.longitude);
  const shouldUseTestData = showTestData || (sightingsWithCoords.length === 0 && !showTestData);
  
  const displaySightings = useMemo(() => {
    if (shouldUseTestData) {
      // Generate test sightings with coordinates around a central location
      const centerLat = 40.7128; // New York area
      const centerLng = -74.0060;
      
      return Array.from({ length: 15 }, (_, i) => ({
        id: `test-${i}`,
        species: ['Robin', 'Cardinal', 'Blue Jay', 'Sparrow', 'Hawk', 'Eagle', 'Owl'][i % 7],
        latitude: centerLat + (Math.random() - 0.5) * 0.1,
        longitude: centerLng + (Math.random() - 0.5) * 0.1,
        datetime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: `Test sighting ${i + 1}`,
        filePath: `test-${i}.jpg`
      }));
    }
    return sightingsWithCoords;
  }, [shouldUseTestData, sightingsWithCoords]);

  // Group sightings by location (for clustering nearby sightings)
  const locationGroups = useMemo(() => {
    const groups = {};
    
    displaySightings.forEach(sighting => {
      // Round coordinates to group nearby sightings
      const lat = Math.round(sighting.latitude * 10000) / 10000;
      const lng = Math.round(sighting.longitude * 10000) / 10000;
      const key = `${lat},${lng}`;
      
      if (!groups[key]) {
        groups[key] = {
          latitude: sighting.latitude,
          longitude: sighting.longitude,
          sightings: []
        };
      }
      groups[key].sightings.push(sighting);
    });
    
    return Object.values(groups);
  }, [displaySightings]);

  // Calculate statistics
  const stats = useMemo(() => {
    const uniqueSpecies = new Set(displaySightings.map(s => s.species)).size;
    const totalSightings = displaySightings.length;
    const uniqueLocations = locationGroups.length;
    
    return { uniqueSpecies, totalSightings, uniqueLocations };
  }, [displaySightings, locationGroups]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return t('map.noDate') || 'No date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return t('map.invalidDate') || 'Invalid date';
    }
  };

  // Default center (will be overridden by FitBounds if there are sightings)
  const defaultCenter = [40.7128, -74.0060]; // New York

  console.log('BirdingMap rendering with sightings:', displaySightings.length);

  return (
    <div className="birding-map">
      {/* Map Header */}
      <div className="map-header">
        <div className="map-title">
          <h3>🗺️ {t('map.title') || 'Sighting Map'}</h3>
          <p className="map-subtitle">
            {t('map.subtitle') || 'Explore your birding locations on an interactive map'}
          </p>
        </div>
        
        <div className="map-controls">
          <div className="test-controls">
            <button
              onClick={() => setShowTestData(!showTestData)}
              className={`test-btn ${shouldUseTestData ? 'active' : ''}`}
              title="Toggle test data to see how the map looks with sample locations"
            >
              {shouldUseTestData ? '🔄 Real Data' : '🧪 Test Data'}
            </button>
            <button
              onClick={() => setDebugInfo(!debugInfo)}
              className={`debug-btn ${debugInfo ? 'active' : ''}`}
              title="Show debug information"
            >
              🐛 Debug
            </button>
          </div>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.totalSightings}</span>
          <span className="stat-label">{t('map.totalSightings') || 'Total Sightings'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.uniqueSpecies}</span>
          <span className="stat-label">{t('map.uniqueSpecies') || 'Species'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.uniqueLocations}</span>
          <span className="stat-label">{t('map.locations') || 'Locations'}</span>
        </div>
        {shouldUseTestData && (
          <div className="stat-item test-mode-indicator">
            <span className="stat-number">🧪</span>
            <span className="stat-label">Test Mode</span>
          </div>
        )}
      </div>

      {/* Debug Panel */}
      {debugInfo && (
        <div className="debug-panel">
          <h4>🐛 Map Debug Information</h4>
          <p><strong>Data Source:</strong> {shouldUseTestData ? 'Test Data' : 'Real Data'}</p>
          <p><strong>Total Sightings:</strong> {displaySightings.length}</p>
          <p><strong>Sightings with Coordinates:</strong> {sightingsWithCoords.length}</p>
          <p><strong>Location Groups:</strong> {locationGroups.length}</p>
          <p><strong>Map Loaded:</strong> {mapLoaded.toString()}</p>
        </div>
      )}

      {/* Map Container */}
      <div className="map-container">
        {displaySightings.length === 0 ? (
          <div className="map-empty-state">
            <div className="empty-icon">🗺️</div>
            <h4>No Location Data Yet</h4>
            <p>Import photos with GPS coordinates to see your sightings on the map!</p>
            <button onClick={() => setShowTestData(true)} className="test-btn">
              🧪 Try Test Data
            </button>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={10}
            className="leaflet-map"
            whenReady={() => setMapLoaded(true)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Fit map to show all markers */}
            <FitBounds locations={displaySightings} />
            
            {/* Render markers for each location group */}
            {locationGroups.map((group, index) => (
              <Marker
                key={index}
                position={[group.latitude, group.longitude]}
                icon={createBirdIcon(group.sightings[0]?.species)}
                eventHandlers={{
                  click: () => setSelectedSighting(group)
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <div className="popup-header">
                      <h4>📍 {t('map.locationDetails') || 'Location Details'}</h4>
                      <p className="popup-coords">
                        {group.latitude.toFixed(4)}, {group.longitude.toFixed(4)}
                      </p>
                    </div>
                    
                    <div className="popup-sightings">
                      <h5>{group.sightings.length} {group.sightings.length === 1 ? 
                        (t('journal.sighting') || 'Sighting') : 
                        (t('journal.sightings') || 'Sightings')
                      }</h5>
                      
                      {group.sightings.slice(0, 3).map((sighting, idx) => (
                        <div key={idx} className="popup-sighting">
                          <div className="sighting-header">
                            <span className="sighting-species">{sighting.species || 'Unknown'}</span>
                            <span className="sighting-date">{formatDate(sighting.datetime)}</span>
                          </div>
                          {sighting.notes && (
                            <p className="sighting-notes">{sighting.notes}</p>
                          )}
                        </div>
                      ))}
                      
                      {group.sightings.length > 3 && (
                        <p className="popup-more">
                          ...and {group.sightings.length - 3} more sightings
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        <h5>{t('map.legend') || 'Map Legend'}</h5>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-marker">🐦</span>
            <span>{t('map.birdSighting') || 'Bird Sighting'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker">📍</span>
            <span>{t('map.clickForDetails') || 'Click for details'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirdingMap; 