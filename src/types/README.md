# PhotoSighting Type System

This directory contains the shared type definitions used throughout the birding app to ensure consistency and type safety.

## PhotoSighting Type Definition

The `PhotoSighting` type represents a bird sighting record with associated photo and metadata:

```javascript
/**
 * @typedef {Object} PhotoSighting
 * @property {string} filePath - Path to the photo file
 * @property {string} species - Bird species name (common name)
 * @property {string} datetime - ISO datetime string when the photo was taken
 * @property {number|null} latitude - GPS latitude coordinate (-90 to 90)
 * @property {number|null} longitude - GPS longitude coordinate (-180 to 180)
 * @property {string} notes - User notes/observations about the sighting
 * @property {number} [id] - Database ID (auto-generated, optional for new entries)
 * @property {string} [created_at] - ISO datetime when record was created (database field)
 * @property {string} [updated_at] - ISO datetime when record was last updated (database field)
 */
```

## Usage Across the App

### Frontend Components

#### PhotoImport.js
- **Purpose**: Creates new PhotoSighting records from imported photos
- **Usage**: 
  - Uses `createPhotoSighting()` to initialize sighting objects
  - Uses `validatePhotoSighting()` before database insertion
  - Uses `normalizeCoordinates()` to convert string inputs to numbers

```javascript
const sightingInput = createPhotoSighting({
  filePath: photo.path || photo.name,
  species: species?.common_name || '',
  datetime: metadata.date || '',
  ...normalizeCoordinates({
    latitude: metadata.latitude,
    longitude: metadata.longitude
  }),
  notes: metadata.notes || ''
});

const validation = validatePhotoSighting(sightingInput);
if (validation.isValid) {
  await db.insertSighting(sightingInput);
}
```

#### Gallery.js
- **Purpose**: Displays all sightings in a searchable grid
- **Usage**: 
  - State typed as `PhotoSighting[]`
  - Filters and displays sighting data consistently

```javascript
/** @type {[PhotoSighting[], React.Dispatch<React.SetStateAction<PhotoSighting[]>>]} */
const [sightings, setSightings] = useState([]);
```

#### Journal.js
- **Purpose**: Shows sightings grouped by day in diary format
- **Usage**: 
  - Same typed state as Gallery
  - Groups sightings chronologically
  - Displays structured sighting data

### Backend Database

#### main.js (Electron)
- **Purpose**: SQLite database operations
- **Usage**:
  - All IPC handlers typed with PhotoSighting types
  - Database schema matches PhotoSighting structure
  - Returns DatabaseResponse objects

```javascript
/**
 * Insert a new sighting into the database
 * @param {PhotoSightingInput} sightingData - Sighting data to insert
 * @returns {Promise<DatabaseResponse>} Database response
 */
ipcMain.handle('db-insert-sighting', async (event, sightingData) => {
  // Implementation
});
```

#### preload.js
- **Purpose**: Secure IPC interface between frontend and backend
- **Usage**: 
  - All database methods typed with PhotoSighting interfaces
  - Consistent API contract

### Mock Database (Browser Mode)

All components include mock database implementations that use the same PhotoSighting types:

```javascript
/**
 * Insert a new sighting into localStorage
 * @param {PhotoSightingInput} data - Sighting data to insert
 * @returns {Promise<DatabaseResponse>} Database response
 */
insertSighting: (data) => {
  /** @type {PhotoSighting} */
  const newSighting = {
    id: Date.now() + Math.random(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  // Storage logic
}
```

### Test Data

#### testData.js
- **Purpose**: Generate sample sightings for testing
- **Usage**: 
  - Creates PhotoSighting objects with realistic data
  - Maintains type consistency in test scenarios

```javascript
/**
 * @returns {PhotoSighting[]} Array of test sightings
 */
export const createTestSightings = () => {
  // Returns properly typed test data
};
```

## Type Safety Benefits

1. **Consistency**: All components use the same data structure
2. **Validation**: Built-in validation ensures data integrity
3. **Documentation**: JSDoc comments provide inline documentation
4. **IDE Support**: Better autocomplete and error detection
5. **Refactoring**: Safe refactoring with type checking

## Utility Functions

### createPhotoSighting(input)
Creates a PhotoSighting object with default values for missing fields.

### validatePhotoSighting(sighting)
Validates a PhotoSighting object and returns validation results with specific error messages.

### normalizeCoordinates(metadata)
Converts string latitude/longitude values to numbers for database storage.

## Database Schema Alignment

The SQLite database schema exactly matches the PhotoSighting type:

```sql
CREATE TABLE sightings (
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
```

## API Contract

All database operations use consistent interfaces:

- **Input**: `PhotoSightingInput` (without id, created_at, updated_at)
- **Output**: `PhotoSighting` (with all fields)
- **Response**: `DatabaseResponse` (standardized response format)

This type system ensures that whether you're using the app in Electron mode (real SQLite) or browser mode (localStorage mock), the data structure and API remain exactly the same. 