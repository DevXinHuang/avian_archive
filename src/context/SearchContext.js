import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ensureTestData } from '../utils/testData';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Data state
  /** @type {[PhotoSighting[], React.Dispatch<React.SetStateAction<PhotoSighting[]>>]} */
  const [allSightings, setAllSightings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [error, setError] = useState(null);

  // Advanced filter state
  const [activeFilters, setActiveFilters] = useState({
    species: '',
    dateFrom: '',
    dateTo: '',
    location: '',
    hasCoordinates: false,
    hasNotes: false
  });

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
      const mockSightings = JSON.parse(localStorage.getItem('mockSightings') || '[]');
      return Promise.resolve({ success: true, data: mockSightings });
    },
    searchSightings: (searchPattern) => {
      const mockSightings = JSON.parse(localStorage.getItem('mockSightings') || '[]');
      const filtered = mockSightings.filter(sighting => 
        (sighting.species && sighting.species.toLowerCase().includes(searchPattern.toLowerCase())) ||
        (sighting.notes && sighting.notes.toLowerCase().includes(searchPattern.toLowerCase()))
      );
      return Promise.resolve({ success: true, data: filtered });
    }
  };

  const getDB = () => {
    if (isElectron && window.electronAPI && window.electronAPI.database) {
      return window.electronAPI.database;
    }
    return mockDatabase;
  };

  // Load all sightings
  const loadAllSightings = async () => {
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
          setAllSightings(testSightings);
        } else {
          setAllSightings(loadedSightings);
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

  // Load sightings on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAllSightings();
    }, isElectron ? 500 : 100);
    
    return () => clearTimeout(timeoutId);
  }, [isElectron]);

  // Comprehensive search function
  const searchSightings = useMemo(() => {
    if (!searchTerm.trim() && Object.values(activeFilters).every(f => !f)) {
      return allSightings;
    }

    return allSightings.filter(sighting => {
      // Text search across multiple fields
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || (
        (sighting.species && sighting.species.toLowerCase().includes(searchTermLower)) ||
        (sighting.notes && sighting.notes.toLowerCase().includes(searchTermLower)) ||
        (sighting.filePath && sighting.filePath.toLowerCase().includes(searchTermLower))
      );

      // Species filter
      const matchesSpecies = !activeFilters.species || 
        (sighting.species && sighting.species.toLowerCase().includes(activeFilters.species.toLowerCase()));

      // Date range filter
      let matchesDateRange = true;
      if (activeFilters.dateFrom || activeFilters.dateTo) {
        const sightingDate = sighting.datetime ? new Date(sighting.datetime) : null;
        if (sightingDate) {
          if (activeFilters.dateFrom) {
            const start = new Date(activeFilters.dateFrom);
            matchesDateRange = matchesDateRange && sightingDate >= start;
          }
          if (activeFilters.dateTo) {
            const end = new Date(activeFilters.dateTo);
            end.setHours(23, 59, 59, 999);
            matchesDateRange = matchesDateRange && sightingDate <= end;
          }
        } else {
          matchesDateRange = false;
        }
      }

      // Location filter
      const matchesLocation = !activeFilters.location || (
        (sighting.notes && sighting.notes.toLowerCase().includes(activeFilters.location.toLowerCase())) ||
        (sighting.latitude && sighting.latitude.toString().includes(activeFilters.location)) ||
        (sighting.longitude && sighting.longitude.toString().includes(activeFilters.location))
      );

      // Has coordinates filter
      const matchesCoordinates = !activeFilters.hasCoordinates || 
        (sighting.latitude && sighting.longitude);

      // Has notes filter
      const matchesNotes = !activeFilters.hasNotes || 
        (sighting.notes && sighting.notes.trim());

      return matchesSearch && matchesSpecies && matchesDateRange && 
             matchesLocation && matchesCoordinates && matchesNotes;
    });
  }, [allSightings, searchTerm, activeFilters]);

  // Get unique species for filters
  const uniqueSpecies = useMemo(() => {
    const species = allSightings
      .map(s => s.species)
      .filter(s => s && s.trim())
      .filter((species, index, arr) => arr.indexOf(species) === index)
      .sort();
    return species;
  }, [allSightings]);

  // Search statistics
  const searchStats = useMemo(() => {
    const total = allSightings.length;
    const filtered = searchSightings.length;
    const isFiltering = searchTerm.trim() || Object.values(activeFilters).some(f => f);
    
    return {
      total,
      filtered,
      isFiltering,
      uniqueSpeciesCount: uniqueSpecies.length
    };
  }, [allSightings.length, searchSightings.length, searchTerm, activeFilters, uniqueSpecies.length]);

  // Clear search and filters
  const clearSearch = () => {
    setSearchTerm('');
    setActiveFilters({
      species: '',
      dateFrom: '',
      dateTo: '',
      location: '',
      hasCoordinates: false,
      hasNotes: false
    });
  };

  // Update individual filters
  const updateFilter = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Perform database search (for more complex queries)
  const performDatabaseSearch = async (term) => {
    if (!term.trim()) return;
    
    setIsSearching(true);
    try {
      const db = getDB();
      if (db.searchSightings) {
        const result = await db.searchSightings(term);
        if (result && result.success) {
          return result.data || [];
        }
      }
      return [];
    } catch (err) {
      console.error('Database search error:', err);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const value = {
    // Search state
    searchTerm,
    setSearchTerm,
    isSearching,
    
    // Data
    allSightings,
    searchResults: searchSightings,
    isLoading,
    error,
    
    // Filters
    activeFilters,
    updateFilter,
    clearSearch,
    
    // Statistics
    searchStats,
    uniqueSpecies,
    
    // Actions
    loadAllSightings,
    performDatabaseSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}; 