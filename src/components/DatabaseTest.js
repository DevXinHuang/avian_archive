import React, { useState, useEffect } from 'react';
import { createPhotoSighting, validatePhotoSighting } from '../types/PhotoSighting';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').PhotoSightingInput} PhotoSightingInput
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  /** @type {[PhotoSighting[], React.Dispatch<React.SetStateAction<PhotoSighting[]>>]} */
  const [sightings, setSightings] = useState([]);
  const [isElectron, setIsElectron] = useState(false);

  // Mock database for browser testing
  const mockDatabase = {
    /** @type {PhotoSighting[]} */
    sightings: JSON.parse(localStorage.getItem('mockSightings') || '[]'),
    
    /**
     * Insert a new sighting
     * @param {PhotoSightingInput} data - Sighting data to insert
     * @returns {DatabaseResponse} Database response
     */
    insertSighting: (data) => {
      /** @type {PhotoSighting} */
      const newSighting = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockDatabase.sightings.push(newSighting);
      localStorage.setItem('mockSightings', JSON.stringify(mockDatabase.sightings));
      return { success: true, id: newSighting.id };
    },
    
    getAllSightings: () => {
      return { success: true, data: [...mockDatabase.sightings].reverse() };
    },
    
    getSightingById: (id) => {
      const sighting = mockDatabase.sightings.find(s => s.id === id);
      return { success: true, data: sighting };
    },
    
    updateSighting: (id, data) => {
      const index = mockDatabase.sightings.findIndex(s => s.id === id);
      if (index !== -1) {
        mockDatabase.sightings[index] = {
          ...mockDatabase.sightings[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('mockSightings', JSON.stringify(mockDatabase.sightings));
        return { success: true, changes: 1 };
      }
      return { success: false, error: 'Sighting not found' };
    },
    
    deleteSighting: (id) => {
      const index = mockDatabase.sightings.findIndex(s => s.id === id);
      if (index !== -1) {
        mockDatabase.sightings.splice(index, 1);
        localStorage.setItem('mockSightings', JSON.stringify(mockDatabase.sightings));
        return { success: true, changes: 1 };
      }
      return { success: false, error: 'Sighting not found' };
    },
    
    searchSightings: (searchTerm) => {
      const results = mockDatabase.sightings.filter(s => 
        (s.species && s.species.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      return { success: true, data: results };
    }
  };

  // Check if we're in Electron or browser
  useEffect(() => {
    const checkElectron = () => {
      setIsElectron(!!window.electronAPI);
    };
    checkElectron();
    
    // Check again after a delay in case Electron API loads slowly
    setTimeout(checkElectron, 1000);
  }, []);

  const getDB = () => {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.database;
    }
    return mockDatabase;
  };

  const addTestResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runDatabaseTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    const db = getDB();
    const dbType = isElectron ? 'SQLite (Electron)' : 'Mock (Browser)';
    
    addTestResult('Environment', true, `🚀 Using ${dbType} database`);

    try {
      // Test 1: Insert a sighting
      addTestResult('Insert Test', null, 'Testing sighting insertion...');
      /** @type {PhotoSightingInput} */
      const testSighting = createPhotoSighting({
        filePath: '/test/path/robin.jpg',
        species: 'American Robin',
        datetime: '2024-01-15T14:30:00.000Z',
        latitude: 40.7128,
        longitude: -74.0060,
        notes: 'Test sighting - singing from oak tree'
      });

      // Validate the test sighting
      const validation = validatePhotoSighting(testSighting);
      if (!validation.isValid) {
        addTestResult('Insert Test', false, `❌ Test data validation failed: ${validation.errors.join(', ')}`);
        setIsLoading(false);
        return;
      }

      const insertResult = await db.insertSighting(testSighting);
      if (insertResult.success) {
        addTestResult('Insert Test', true, `✅ Sighting inserted with ID: ${insertResult.id}`);
      } else {
        addTestResult('Insert Test', false, `❌ Insert failed: ${insertResult.error}`);
      }

      // Test 2: Get all sightings
      addTestResult('Get All Test', null, 'Testing get all sightings...');
      const getAllResult = await db.getAllSightings();
      if (getAllResult.success) {
        addTestResult('Get All Test', true, `✅ Retrieved ${getAllResult.data.length} sighting(s)`);
        setSightings(getAllResult.data);
      } else {
        addTestResult('Get All Test', false, `❌ Get all failed: ${getAllResult.error}`);
      }

      // Test 3: Search sightings
      if (getAllResult.success && getAllResult.data.length > 0) {
        addTestResult('Search Test', null, 'Testing search functionality...');
        const searchResult = await db.searchSightings('Robin');
        if (searchResult.success) {
          addTestResult('Search Test', true, `✅ Search found ${searchResult.data.length} result(s)`);
        } else {
          addTestResult('Search Test', false, `❌ Search failed: ${searchResult.error}`);
        }

        // Test 4: Update sighting
        const firstSighting = getAllResult.data[0];
        if (firstSighting) {
          addTestResult('Update Test', null, 'Testing sighting update...');
          const updatedData = {
            ...testSighting,
            notes: 'Updated test sighting - now with more details'
          };
          const updateResult = await db.updateSighting(firstSighting.id, updatedData);
          if (updateResult.success) {
            addTestResult('Update Test', true, `✅ Sighting updated (${updateResult.changes} changes)`);
          } else {
            addTestResult('Update Test', false, `❌ Update failed: ${updateResult.error}`);
          }
        }
      }

    } catch (error) {
      addTestResult('General Error', false, `❌ Test error: ${error.message}`);
    }

    setIsLoading(false);
  };

  const clearDatabase = async () => {
    setIsLoading(true);
    const db = getDB();
    
    try {
      if (isElectron) {
        const getAllResult = await db.getAllSightings();
        if (getAllResult.success) {
          for (const sighting of getAllResult.data) {
            await db.deleteSighting(sighting.id);
          }
          addTestResult('Clear Database', true, `✅ Cleared ${getAllResult.data.length} sighting(s)`);
        }
      } else {
        // Clear mock database
        const count = mockDatabase.sightings.length;
        mockDatabase.sightings = [];
        localStorage.removeItem('mockSightings');
        addTestResult('Clear Database', true, `✅ Cleared ${count} sighting(s) from mock database`);
      }
      setSightings([]);
    } catch (error) {
      addTestResult('Clear Database', false, `❌ Clear failed: ${error.message}`);
    }
    setIsLoading(false);
  };

  const refreshSightings = async () => {
    try {
      const db = getDB();
      const result = await db.getAllSightings();
      if (result.success) {
        setSightings(result.data);
      }
    } catch (error) {
      console.error('Failed to refresh sightings:', error);
    }
  };

  useEffect(() => {
    refreshSightings();
  }, [isElectron]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 Database Test Console</h2>
      <p>Test the database operations in both Electron (SQLite) and Browser (Mock) environments.</p>
      
      {/* Environment Status */}
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px', 
        backgroundColor: isElectron ? '#d4edda' : '#fff3cd',
        border: `1px solid ${isElectron ? '#c3e6cb' : '#ffeaa7'}`,
        borderRadius: '5px'
      }}>
        <strong>Environment:</strong> {isElectron ? '🖥️ Electron (Real SQLite Database)' : '🌐 Browser (Mock Database)'}
        <br />
        {!isElectron && (
          <small style={{ color: '#856404' }}>
            💡 To test with real SQLite database, open this app in the Electron desktop window
          </small>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runDatabaseTests} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isLoading ? 'Running Tests...' : 'Run Database Tests'}
        </button>
        
        <button 
          onClick={clearDatabase} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Database
        </button>
        
        <button 
          onClick={refreshSightings} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Test Results:</h3>
          <div style={{ 
            backgroundColor: '#f7fafc', 
            padding: '15px', 
            borderRadius: '5px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {testResults.map((result, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <span style={{ color: '#666' }}>[{result.timestamp}]</span> {result.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Sightings */}
      <div>
        <h3>Current Sightings in Database ({sightings.length}):</h3>
        {sightings.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No sightings in database</p>
        ) : (
          <div style={{ 
            backgroundColor: '#f7fafc', 
            padding: '15px', 
            borderRadius: '5px'
          }}>
            {sightings.map((sighting, index) => (
              <div key={sighting.id} style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                backgroundColor: 'white', 
                borderRadius: '3px',
                border: '1px solid #e2e8f0'
              }}>
                <div><strong>ID:</strong> {sighting.id}</div>
                <div><strong>Species:</strong> {sighting.species || 'Not specified'}</div>
                <div><strong>Date:</strong> {sighting.datetime || 'Not specified'}</div>
                <div><strong>Location:</strong> {sighting.latitude && sighting.longitude ? `${sighting.latitude}, ${sighting.longitude}` : 'Not specified'}</div>
                <div><strong>File:</strong> {sighting.filePath}</div>
                <div><strong>Notes:</strong> {sighting.notes || 'No notes'}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>Created:</strong> {sighting.created_at}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseTest; 