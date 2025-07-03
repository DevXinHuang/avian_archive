const { contextBridge, ipcRenderer } = require('electron');

/**
 * @typedef {Object} PhotoSightingInput
 * @property {string} filePath - Path to the photo file
 * @property {string} species - Bird species name (common name)
 * @property {string} datetime - ISO datetime string when the photo was taken
 * @property {number|null} latitude - GPS latitude coordinate (-90 to 90)
 * @property {number|null} longitude - GPS longitude coordinate (-180 to 180)
 * @property {string} notes - User notes/observations about the sighting
 */

/**
 * @typedef {Object} DatabaseResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {*} [data] - Response data (varies by operation)
 * @property {string} [error] - Error message if operation failed
 * @property {number} [id] - ID of created/updated record (for insert/update operations)
 * @property {number} [changes] - Number of rows affected (for update/delete operations)
 */

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  ensureAppDirectory: () => ipcRenderer.invoke('ensure-app-directory'),
  
  // Database operations
  database: {
    /**
     * Insert a new sighting
     * @param {PhotoSightingInput} sightingData - Sighting data to insert
     * @returns {Promise<DatabaseResponse>} Database response
     */
    insertSighting: (sightingData) => ipcRenderer.invoke('db-insert-sighting', sightingData),
    
    /**
     * Get all sightings
     * @returns {Promise<DatabaseResponse>} Database response with sightings array
     */
    getAllSightings: () => ipcRenderer.invoke('db-get-all-sightings'),
    
    /**
     * Get sighting by ID
     * @param {number} id - Sighting ID
     * @returns {Promise<DatabaseResponse>} Database response with sighting object
     */
    getSightingById: (id) => ipcRenderer.invoke('db-get-sighting-by-id', id),
    
    /**
     * Update existing sighting
     * @param {number} id - Sighting ID to update
     * @param {PhotoSightingInput} sightingData - Updated sighting data
     * @returns {Promise<DatabaseResponse>} Database response
     */
    updateSighting: (id, sightingData) => ipcRenderer.invoke('db-update-sighting', id, sightingData),
    
    /**
     * Delete sighting
     * @param {number} id - Sighting ID to delete
     * @returns {Promise<DatabaseResponse>} Database response
     */
    deleteSighting: (id) => ipcRenderer.invoke('db-delete-sighting', id),
    
    /**
     * Search sightings by species or notes
     * @param {string} searchTerm - Search term
     * @returns {Promise<DatabaseResponse>} Database response with matching sightings
     */
    searchSightings: (searchTerm) => ipcRenderer.invoke('db-search-sightings', searchTerm)
  }
}); 