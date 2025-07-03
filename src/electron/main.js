const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

/**
 * @typedef {Object} PhotoSighting
 * @property {number} id - Database ID (auto-generated)
 * @property {string} filePath - Path to the photo file
 * @property {string} species - Bird species name (common name)
 * @property {string} datetime - ISO datetime string when the photo was taken
 * @property {number|null} latitude - GPS latitude coordinate (-90 to 90)
 * @property {number|null} longitude - GPS longitude coordinate (-180 to 180)
 * @property {string} notes - User notes/observations about the sighting
 * @property {string} created_at - ISO datetime when record was created
 * @property {string} updated_at - ISO datetime when record was last updated
 */

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
 * @property {PhotoSighting[]|PhotoSighting|number} [data] - Response data (varies by operation)
 * @property {string} [error] - Error message if operation failed
 * @property {number} [id] - ID of created/updated record (for insert/update operations)
 * @property {number} [changes] - Number of rows affected (for update/delete operations)
 */

const isDev = process.env.ELECTRON_IS_DEV === 'true';

let mainWindow;
let db;

// Initialize SQLite database
function initializeDatabase() {
  try {
    const userDataPath = app.getPath('userData');
    const appDataDir = path.join(userDataPath, 'birding-data');
    
    // Ensure app data directory exists
    if (!fs.existsSync(appDataDir)) {
      fs.mkdirSync(appDataDir, { recursive: true });
    }
    
    const dbPath = path.join(appDataDir, 'birding.db');
    console.log('Database path:', dbPath);
    
    // Initialize database connection
    db = new Database(dbPath);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    // Create sightings table if it doesn't exist
    const createSightingsTable = db.prepare(`
      CREATE TABLE IF NOT EXISTS sightings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filePath TEXT NOT NULL,
        species TEXT,
        datetime TEXT,
        latitude REAL,
        longitude REAL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    createSightingsTable.run();
    
    // Create an index on datetime for faster queries
    const createDatetimeIndex = db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_sightings_datetime ON sightings(datetime)
    `);
    createDatetimeIndex.run();
    
    // Create an index on species for faster searches
    const createSpeciesIndex = db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_sightings_species ON sightings(species)
    `);
    createSpeciesIndex.run();
    
    console.log('Database initialized successfully');
    return db;
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Database operations
const dbOperations = {
  // Insert a new sighting
  insertSighting: null,
  
  // Get all sightings
  getAllSightings: null,
  
  // Get sighting by ID
  getSightingById: null,
  
  // Update sighting
  updateSighting: null,
  
  // Delete sighting
  deleteSighting: null,
  
  // Search sightings
  searchSightings: null
};

// Prepare database statements after initialization
function prepareStatements() {
  dbOperations.insertSighting = db.prepare(`
    INSERT INTO sightings (filePath, species, datetime, latitude, longitude, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  dbOperations.getAllSightings = db.prepare(`
    SELECT * FROM sightings ORDER BY datetime DESC, created_at DESC
  `);
  
  dbOperations.getSightingById = db.prepare(`
    SELECT * FROM sightings WHERE id = ?
  `);
  
  dbOperations.updateSighting = db.prepare(`
    UPDATE sightings 
    SET filePath = ?, species = ?, datetime = ?, latitude = ?, longitude = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  dbOperations.deleteSighting = db.prepare(`
    DELETE FROM sightings WHERE id = ?
  `);
  
  dbOperations.searchSightings = db.prepare(`
    SELECT * FROM sightings 
    WHERE species LIKE ? OR notes LIKE ?
    ORDER BY datetime DESC, created_at DESC
  `);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png') // We'll add this later
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle file dialog for photo import
ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
    ]
  });
  return result;
});

// Handle directory creation for storing app data
ipcMain.handle('ensure-app-directory', async () => {
  const userDataPath = app.getPath('userData');
  const appDataDir = path.join(userDataPath, 'birding-data');
  
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir, { recursive: true });
  }
  
  return appDataDir;
});

// Database IPC handlers

/**
 * Insert a new sighting into the database
 * @param {Electron.IpcMainInvokeEvent} event - IPC event
 * @param {PhotoSightingInput} sightingData - Sighting data to insert
 * @returns {Promise<DatabaseResponse>} Database response
 */
ipcMain.handle('db-insert-sighting', async (event, sightingData) => {
  try {
    const { filePath, species, datetime, latitude, longitude, notes } = sightingData;
    const result = dbOperations.insertSighting.run(filePath, species, datetime, latitude, longitude, notes);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    console.error('Error inserting sighting:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Get all sightings from the database
 * @returns {Promise<DatabaseResponse>} Database response with array of sightings
 */
ipcMain.handle('db-get-all-sightings', async () => {
  try {
    /** @type {PhotoSighting[]} */
    const sightings = dbOperations.getAllSightings.all();
    return { success: true, data: sightings };
  } catch (error) {
    console.error('Error getting sightings:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Get a specific sighting by ID
 * @param {Electron.IpcMainInvokeEvent} event - IPC event
 * @param {number} id - Sighting ID
 * @returns {Promise<DatabaseResponse>} Database response with sighting object
 */
ipcMain.handle('db-get-sighting-by-id', async (event, id) => {
  try {
    /** @type {PhotoSighting|undefined} */
    const sighting = dbOperations.getSightingById.get(id);
    return { success: true, data: sighting };
  } catch (error) {
    console.error('Error getting sighting by ID:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Update an existing sighting
 * @param {Electron.IpcMainInvokeEvent} event - IPC event
 * @param {number} id - Sighting ID to update
 * @param {PhotoSightingInput} sightingData - Updated sighting data
 * @returns {Promise<DatabaseResponse>} Database response with changes count
 */
ipcMain.handle('db-update-sighting', async (event, id, sightingData) => {
  try {
    const { filePath, species, datetime, latitude, longitude, notes } = sightingData;
    const result = dbOperations.updateSighting.run(filePath, species, datetime, latitude, longitude, notes, id);
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error updating sighting:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Delete a sighting by ID
 * @param {Electron.IpcMainInvokeEvent} event - IPC event
 * @param {number} id - Sighting ID to delete
 * @returns {Promise<DatabaseResponse>} Database response with changes count
 */
ipcMain.handle('db-delete-sighting', async (event, id) => {
  try {
    const result = dbOperations.deleteSighting.run(id);
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error deleting sighting:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Search sightings by species or notes
 * @param {Electron.IpcMainInvokeEvent} event - IPC event
 * @param {string} searchTerm - Search term to look for
 * @returns {Promise<DatabaseResponse>} Database response with matching sightings
 */
ipcMain.handle('db-search-sightings', async (event, searchTerm) => {
  try {
    const searchPattern = `%${searchTerm}%`;
    /** @type {PhotoSighting[]} */
    const sightings = dbOperations.searchSightings.all(searchPattern, searchPattern);
    return { success: true, data: sightings };
  } catch (error) {
    console.error('Error searching sightings:', error);
    return { success: false, error: error.message };
  }
});

// Initialize database when app is ready
app.whenReady().then(() => {
  try {
    initializeDatabase();
    prepareStatements();
    createWindow();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Close database connection
  if (db) {
    db.close();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Graceful shutdown
app.on('before-quit', () => {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
}); 