# 🦅 Avian Archive

A local-first desktop application for birdwatchers to organize their bird photos and sightings, built with Electron and React. Keep detailed records of your birding adventures with photo management, interactive maps, and activity tracking.

## Features

### ✅ Completed Features

#### 📸 **Photo Management**
- **Photo Import** - Drag-and-drop or file picker to import bird images with EXIF metadata
- **Smart Gallery** - Browse photos with search, filtering, and sorting options
- **Species Tagging** - Auto-complete based on comprehensive bird species database
- **Metadata Extraction** - Automatic GPS coordinates, timestamps, and camera settings

#### 🗺️ **Interactive Mapping**
- **Live Sighting Map** - View all bird sightings plotted on an interactive OpenStreetMap
- **Custom Bird Markers** - Species-specific emoji markers for easy identification
- **Location Clustering** - Nearby sightings grouped for better visualization
- **Detailed Popups** - Click markers to see sighting information with high-contrast design
- **Statistics Dashboard** - Real-time counts of total sightings, species, and locations

#### 📖 **Journal & Timeline**
- **Chronological Timeline** - All sightings organized by date with expandable day views
- **Activity Heatmap** - GitHub-style yearly activity visualization showing birding patterns
- **Daily Summaries** - Group sightings by day with species counts and notes
- **Search & Filter** - Find entries by species, date range, or location

#### 💾 **Data Management**
- **SQLite Database** - Robust local storage for all sighting data
- **Browser Fallback** - localStorage backup when not in Electron
- **Real-time Sync** - Changes instantly reflected across all views
- **Data Persistence** - All your birding records saved locally and securely

#### 🌍 **User Experience**
- **Multi-language Support** - Interface available in 7 languages (EN, ZH, ES, FR, DE, JA, RU)
- **Dark/Light Themes** - Automatic theme switching based on system preferences
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Modern UI** - Clean, intuitive interface with beautiful animations

### 🚧 Coming Soon
- **AI Bird Identification** - Offline species recognition using TensorFlow Lite
- **Data Export/Import** - Backup and share your birding database
- **Advanced Analytics** - Detailed statistics and birding insights
- **Photo Editing** - Basic image enhancement tools
- **Cloud Sync** - Optional cloud backup and cross-device synchronization

## Project Structure

```
avian-archive/
├── src/
│   ├── components/
│   │   ├── PhotoImport.js          # Photo import with metadata extraction
│   │   ├── ModernGallery.js        # Searchable photo gallery
│   │   ├── Journal.js              # Timeline view with daily grouping
│   │   ├── BirdingHeatmap.js       # GitHub-style activity heatmap
│   │   ├── BirdingMap.js           # Interactive Leaflet map
│   │   ├── Settings.js             # App preferences and language
│   │   ├── SpeciesAutocomplete.js  # Bird species search component
│   │   └── Layout/                 # Reusable layout components
│   ├── context/
│   │   ├── LanguageContext.js      # Multi-language support
│   │   └── ThemeContext.js         # Dark/light theme management
│   ├── data/
│   │   └── bird-species.json       # Comprehensive bird species database
│   ├── electron/
│   │   ├── main.js                 # Electron main process
│   │   └── preload.js              # Secure IPC interface
│   ├── types/
│   │   └── PhotoSighting.js        # TypeScript-style type definitions
│   └── utils/
│       └── testData.js             # Development test data
├── public/
│   └── index.html
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DevXinHuang/avian_archive.git
   cd avian_archive
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Development mode:**
   ```bash
   npm run dev
   ```
   This will start both the React development server and Electron app.

4. **Browser mode (for testing):**
   ```bash
   npm start
   ```
   Opens the app in your browser with localStorage fallback.

5. **Build for production:**
   ```bash
   npm run build-electron
   ```

### Available Scripts

- `npm start` - Start React development server (browser mode)
- `npm run electron` - Start Electron app (production build)
- `npm run electron-dev` - Start Electron app (development mode)
- `npm run dev` - Start both React and Electron in development mode
- `npm run build` - Build React app for production
- `npm run build-electron` - Build complete Electron app

## Usage Guide

### 📸 Importing Photos
1. Navigate to the **Import** tab
2. Drag and drop bird photos or click "Choose Files"
3. Fill in species information using auto-complete
4. Add GPS coordinates, date/time, and notes
5. Click "Process Photos" to save to your database

### 🖼️ Browsing Gallery
1. Go to the **Gallery** tab to see all your photos
2. Use the search bar to find specific species or notes
3. Filter by species, date range, or sort preferences
4. Click any photo to view full details

### 📖 Viewing Journal
1. Open the **Journal** tab for chronological timeline
2. View the activity heatmap to see your birding patterns
3. Expand/collapse days to see detailed sightings
4. Use the yearly selector to browse different time periods

### 🗺️ Exploring Map
1. Visit the **Map** tab to see your sightings geographically
2. Click on bird markers to see location details
3. Use test data mode if you don't have GPS coordinates yet
4. View statistics for total sightings, species, and locations

### ⚙️ Customizing Settings
1. Access **Settings** to change language and preferences
2. Switch between 7 supported languages
3. Manage theme preferences and app settings
4. Export or backup your birding database

## Technical Details

### Built With
- **Electron** - Cross-platform desktop app framework
- **React** - Modern frontend UI library with hooks
- **React Router** - Client-side navigation
- **Leaflet** - Interactive mapping with OpenStreetMap
- **SQLite3** - Local database for robust data storage
- **React Dropzone** - Drag-and-drop file handling

### Key Technical Features
- **Local-first Architecture** - All data stays on your device
- **Cross-platform Support** - Windows, macOS, Linux compatibility
- **Responsive Design** - Adapts to different screen sizes
- **Memory-efficient** - Optimized photo handling and rendering
- **Type Safety** - JSDoc type annotations for better code quality
- **Internationalization** - Complete i18n support with context providers

### Database Schema
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

## Development Roadmap

### Phase 1: Core Features ✅
- [x] Project setup and modern React architecture
- [x] Photo import with drag-and-drop and metadata extraction
- [x] Species database with auto-complete functionality
- [x] SQLite database integration with full CRUD operations
- [x] Responsive UI design with dark/light theme support

### Phase 2: Data Visualization ✅
- [x] Interactive photo gallery with search and filtering
- [x] Chronological journal with timeline view
- [x] GitHub-style activity heatmap for yearly patterns
- [x] Interactive map with Leaflet and custom markers
- [x] Multi-language support (7 languages)

### Phase 3: Advanced Features 🚧
- [ ] AI-powered bird species identification
- [ ] Advanced analytics and birding statistics
- [ ] Data export/import functionality
- [ ] Photo editing and enhancement tools
- [ ] Offline map tiles and GPS tracking

### Phase 4: Cloud & Sharing
- [ ] Optional cloud backup and synchronization
- [ ] Social features for sharing sightings
- [ ] eBird integration for community data
- [ ] Mobile companion app

## Contributing

This is an open-source birding app project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this code for your own birding adventures! 🐦 

---

**Happy Birding!** 🦅✨ Track your sightings, explore your data, and build your personal birding archive. 