import React, { useState, useEffect, useMemo } from 'react';
import MainContent from './Layout/MainContent';
// import BirdingHeatmap from './BirdingHeatmap';
import { ensureTestData } from '../utils/testData';
import './ModernJournal.css';

// Temporary simple heatmap for debugging
const SimpleHeatmap = ({ sightings }) => {
  console.log('SimpleHeatmap rendering with:', sightings.length, 'sightings');
  return (
    <div style={{ 
      background: 'lightblue', 
      padding: '20px', 
      margin: '20px 0',
      border: '3px solid blue',
      borderRadius: '10px'
    }}>
      <h2>🗓️ Simple Heatmap Test</h2>
      <p>Found {sightings.length} sightings</p>
      <button 
        onClick={() => alert(`Sightings: ${JSON.stringify(sightings.slice(0, 2), null, 2)}`)}
        style={{ padding: '10px', background: 'white', border: '1px solid black', cursor: 'pointer' }}
      >
        Show Sample Data
      </button>
    </div>
  );
};

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const ModernJournal = () => {
  console.log('ModernJournal component rendering...');
  
  /** @type {[PhotoSighting[], React.Dispatch<React.SetStateAction<PhotoSighting[]>>]} */
  const [sightings, setSightings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [error, setError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Check if we're in Electron or browser
  useEffect(() => {
    const checkElectron = () => {
      const hasElectronAPI = !!window.electronAPI;
      setIsElectron(hasElectronAPI);
      return hasElectronAPI;
    };
    
    const initialCheck = checkElectron();
    if (!initialCheck) {
      let attempts = 0;
      const maxAttempts = 6;
      const interval = setInterval(() => {
        attempts++;
        const found = checkElectron();
        
        if (found || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, []);

  // Mock database for browser testing
  const mockDatabase = {
    getAllSightings: () => {
      /** @type {PhotoSighting[]} */
      const mockSightings = JSON.parse(localStorage.getItem('mockSightings') || '[]');
      return Promise.resolve({ success: true, data: mockSightings.reverse() });
    }
  };

  const getDB = () => {
    if (isElectron && window.electronAPI && window.electronAPI.database) {
      return window.electronAPI.database;
    }
    return mockDatabase;
  };

  // Load sightings
  const loadSightings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isElectron) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const db = getDB();
      const result = await db.getAllSightings();
      
      if (result && result.success) {
        const loadedSightings = result.data || [];
        
        // If no sightings exist and we're in browser mode, add test data
        if (loadedSightings.length === 0 && !isElectron) {
          const testSightings = ensureTestData();
          setSightings(testSightings);
        } else {
          setSightings(loadedSightings);
        }
      } else {
        setError(result?.error || 'Unknown database error');
      }
    } catch (err) {
      setError(`Error loading sightings: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSightings();
    }, isElectron ? 500 : 100);
    
    return () => clearTimeout(timeoutId);
  }, [isElectron]);

  // Group sightings by date and sort chronologically
  const groupedSightings = useMemo(() => {
    // Sort by datetime descending
    const sortedSightings = [...sightings].sort((a, b) => {
      const dateA = a.datetime ? new Date(a.datetime) : new Date(0);
      const dateB = b.datetime ? new Date(b.datetime) : new Date(0);
      return dateB - dateA;
    });

    // Group by day
    const groups = {};
    sortedSightings.forEach(sighting => {
      let dayKey;
      if (sighting.datetime) {
        try {
          const date = new Date(sighting.datetime);
          dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } catch {
          dayKey = 'no-date';
        }
      } else {
        dayKey = 'no-date';
      }

      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(sighting);
    });

    // Convert to sorted array
    const sortedGroups = Object.entries(groups).sort(([dayA], [dayB]) => {
      if (dayA === 'no-date') return 1;
      if (dayB === 'no-date') return -1;
      return dayB.localeCompare(dayA);
    });

    return sortedGroups;
  }, [sightings]);

  // Toggle group expansion
  const toggleGroup = (dayKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey);
    } else {
      newExpanded.add(dayKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Expand all groups
  const expandAll = () => {
    const allDays = new Set(groupedSightings.map(([dayKey]) => dayKey));
    setExpandedGroups(allDays);
  };

  // Collapse all groups
  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  // Format date headers
  const formatDayHeader = (dayKey) => {
    if (dayKey === 'no-date') return 'Unknown Date';
    
    try {
      const date = new Date(dayKey + 'T00:00:00');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isToday = date.toDateString() === today.toDateString();
      const isYesterday = date.toDateString() === yesterday.toDateString();
      
      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dayKey;
    }
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  // Format location
  const formatLocation = (latitude, longitude) => {
    if (!latitude || !longitude) return null;
    return `${parseFloat(latitude).toFixed(2)}, ${parseFloat(longitude).toFixed(2)}`;
  };

  // Header actions
  const headerActions = (
    <div className="flex gap-4 items-center">
      <button onClick={expandAll} className="btn btn-sm">
        📖 Expand All
      </button>
      <button onClick={collapseAll} className="btn btn-sm">
        📕 Collapse All
      </button>
      <button onClick={loadSightings} className="btn btn-sm">
        🔄 Refresh
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <MainContent title="Journal" subtitle="Your birding timeline" actions={headerActions}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your birding journal...</p>
        </div>
      </MainContent>
    );
  }

  if (error) {
    return (
      <MainContent title="Journal" subtitle="Your birding timeline" actions={headerActions}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Journal</h3>
          <p>{error}</p>
          <button onClick={loadSightings} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent 
      title="Journal" 
      subtitle={`${sightings.length} entries across ${groupedSightings.length} days`}
      actions={headerActions}
    >
      {/* Debug Section */}
      <div style={{ background: 'yellow', padding: '20px', margin: '20px 0', border: '3px solid orange' }}>
        <h2>🔧 DEBUG SECTION - Should Always Be Visible</h2>
        <p><strong>Sightings count:</strong> {sightings.length}</p>
        <p><strong>Loading state:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Error state:</strong> {error ? error : 'None'}</p>
        <button 
          onClick={() => console.log('Full sightings:', sightings)}
          style={{ padding: '10px', background: 'white', border: '1px solid black', cursor: 'pointer' }}
        >
          Log Sightings to Console
        </button>
      </div>

      {/* Simple Heatmap Test */}
      <SimpleHeatmap sightings={sightings} />

      {groupedSightings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>No Journal Entries Yet</h3>
          <p>Start by importing some photos to create your first birding journal entries!</p>
        </div>
      ) : (
        <div className="timeline">
          {groupedSightings.map(([dayKey, daySightings]) => (
            <div key={dayKey} className="timeline-group">
              {/* Day Header */}
              <div 
                className="day-header"
                onClick={() => toggleGroup(dayKey)}
              >
                <div className="day-marker">
                  <div className="day-dot"></div>
                  <div className="day-line"></div>
                </div>
                <div className="day-content">
                  <h3 className="day-title">{formatDayHeader(dayKey)}</h3>
                  <p className="day-summary">
                    {daySightings.length} sighting{daySightings.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="day-toggle">
                  {expandedGroups.has(dayKey) ? '▼' : '▶'}
                </div>
              </div>

              {/* Day Sightings */}
              {expandedGroups.has(dayKey) && (
                <div className="day-sightings">
                  {daySightings.map((sighting, index) => (
                    <div key={sighting.id} className="timeline-entry">
                      <div className="entry-marker">
                        <div className="entry-dot"></div>
                        {index < daySightings.length - 1 && <div className="entry-line"></div>}
                      </div>
                      
                      <div className="entry-content">
                        <div className="entry-header">
                          <div className="entry-time">
                            {formatTime(sighting.datetime)}
                          </div>
                          <h4 className="entry-species">
                            {sighting.species || 'Unknown Species'}
                          </h4>
                        </div>

                        <div className="entry-body">
                          {/* Photo Preview */}
                          <div className="entry-photo">
                            <div className="photo-placeholder">
                              <span className="photo-icon">📸</span>
                            </div>
                          </div>

                          {/* Sighting Details */}
                          <div className="entry-details">
                            {formatLocation(sighting.latitude, sighting.longitude) && (
                              <div className="detail-item">
                                <span className="detail-icon">📍</span>
                                <span className="detail-text">
                                  {formatLocation(sighting.latitude, sighting.longitude)}
                                </span>
                              </div>
                            )}

                            {sighting.notes && (
                              <div className="entry-notes">
                                <span className="notes-icon">📝</span>
                                <p>{sighting.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </MainContent>
  );
};

export default ModernJournal; 