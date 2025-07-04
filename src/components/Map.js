import React, { useState, useEffect } from 'react';
import MainContent from './Layout/MainContent';
import BirdingMap from './BirdingMap';
import { useLanguage } from '../context/LanguageContext';
import { ensureTestData } from '../utils/testData';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const Map = () => {
  const { t } = useLanguage();
  /** @type {[PhotoSighting[], React.Dispatch<React.SetStateAction<PhotoSighting[]>>]} */
  const [sightings, setSightings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [error, setError] = useState(null);

  // Check if we're in Electron or browser (same logic as Journal)
  useEffect(() => {
    const checkElectron = () => {
      const hasElectronAPI = !!window.electronAPI;
      console.log('Map: Checking Electron API...', hasElectronAPI);
      setIsElectron(hasElectronAPI);
      
      if (hasElectronAPI && window.electronAPI.database) {
        console.log('Map: Electron API and database available');
      } else if (hasElectronAPI) {
        console.log('Map: Electron API available but database missing');
      } else {
        console.log('Map: Using browser mode (localStorage)');
      }
      
      return hasElectronAPI;
    };
    
    // Initial check
    const initialCheck = checkElectron();
    
    // If not found initially, keep checking for up to 3 seconds
    if (!initialCheck) {
      let attempts = 0;
      const maxAttempts = 6;
      const interval = setInterval(() => {
        attempts++;
        const found = checkElectron();
        
        if (found || attempts >= maxAttempts) {
          clearInterval(interval);
          if (!found) {
            console.log('Map: Electron API not found after 3 seconds, using browser mode');
          }
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, []);

  // Mock database for browser testing
  const mockDatabase = {
    /**
     * Get all sightings from localStorage
     * @returns {Promise<DatabaseResponse>} Database response with sightings array
     */
    getAllSightings: () => {
      console.log('Map: Using mock database (localStorage)');
      /** @type {PhotoSighting[]} */
      const mockSightings = JSON.parse(localStorage.getItem('mockSightings') || '[]');
      console.log('Map: Mock sightings loaded:', mockSightings.length);
      return Promise.resolve({ success: true, data: mockSightings.reverse() });
    }
  };

  const getDB = () => {
    if (isElectron && window.electronAPI && window.electronAPI.database) {
      console.log('Map: Using Electron SQLite database');
      return window.electronAPI.database;
    }
    console.log('Map: Using mock database');
    return mockDatabase;
  };

  // Load all sightings from database (same logic as Journal)
  const loadSightings = async () => {
    console.log('Map: Loading sightings...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Wait a moment to ensure Electron API is ready
      if (isElectron) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const db = getDB();
      console.log('Map: Got database instance, calling getAllSightings...');
      
      const result = await db.getAllSightings();
      console.log('Map: Database result:', result);
      
      if (result && result.success) {
        const loadedSightings = result.data || [];
        
        // If no sightings exist and we're in browser mode, add test data
        if (loadedSightings.length === 0 && !isElectron) {
          console.log('Map: No sightings found, adding test data...');
          const testSightings = ensureTestData();
          setSightings(testSightings);
          console.log(`Map: Added ${testSightings.length} test sightings`);
        } else {
          setSightings(loadedSightings);
          console.log(`Map: Loaded ${loadedSightings.length} sightings`);
        }
      } else {
        const errorMsg = result?.error || 'Unknown database error';
        console.error('Map: Database error:', errorMsg);
        setError(`Failed to load sightings: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Map: Exception loading sightings:', err);
      setError(`Error loading sightings: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sightings when component mounts or when database environment changes
  useEffect(() => {
    // Add a small delay to ensure everything is initialized
    const timeoutId = setTimeout(() => {
      loadSightings();
    }, isElectron ? 500 : 100);
    
    return () => clearTimeout(timeoutId);
  }, [isElectron]);

  // Calculate map-specific stats
  const sightingsWithCoords = sightings.filter(s => s.latitude && s.longitude);
  const subtitle = sightingsWithCoords.length > 0 
    ? `${sightingsWithCoords.length} ${t('map.locatedSightings') || 'sightings with locations'}`
    : t('map.subtitle');

  // Header actions
  const headerActions = (
    <div className="flex gap-4 items-center">
      <button onClick={loadSightings} className="btn btn-sm">
        🔄 {t('map.refresh') || 'Refresh'}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <MainContent title={t('map.title')} subtitle={t('map.subtitle')} actions={headerActions}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('map.loading') || 'Loading map...'}</p>
        </div>
      </MainContent>
    );
  }

  if (error) {
    return (
      <MainContent title={t('map.title')} subtitle={t('map.subtitle')} actions={headerActions}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>{t('map.errorLoading') || 'Error loading map data'}</h3>
          <p>{error}</p>
          <button onClick={loadSightings} className="btn btn-primary">
            {t('common.tryAgain') || 'Try Again'}
          </button>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent 
      title={t('map.title')} 
      subtitle={subtitle}
      actions={headerActions}
    >
      <BirdingMap sightings={sightings} />
    </MainContent>
  );
};

export default Map; 