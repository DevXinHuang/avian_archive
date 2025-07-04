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

## Building & Packaging

### 📦 Creating Distributable Apps

The app uses **electron-builder** to create installers and portable apps for different platforms.

#### 🍎 **macOS Builds**
```bash
# Build for macOS (creates .zip files for both Intel and Apple Silicon)
npm run build-mac
```

**Output files:**
- `dist/AvianArchive-1.0.0-mac.zip` - Intel Mac version
- `dist/AvianArchive-1.0.0-arm64-mac.zip` - Apple Silicon version
- `dist/mac/AvianArchive.app` - Intel app bundle
- `dist/mac-arm64/AvianArchive.app` - Apple Silicon app bundle

#### 🪟 **Windows Builds**
```bash
# Build for Windows (creates .exe installer and portable version)
npm run build-win
```

**Output files:**
- `dist/AvianArchive Setup 1.0.0.exe` - Windows installer
- `dist/AvianArchive 1.0.0.exe` - Portable Windows executable

#### 🐧 **Linux Builds**
```bash
# Build for Linux (creates AppImage and .deb package)
npm run build-linux
```

**Output files:**
- `dist/AvianArchive-1.0.0.AppImage` - Universal Linux AppImage
- `dist/avian-archive_1.0.0_amd64.deb` - Debian/Ubuntu package

#### 🌍 **All Platforms**
```bash
# Build for all platforms at once
npm run build-all
```

### 🛠️ **Build Configuration**

The app is configured in `package.json` under the `"build"` section:

- **App ID**: `com.avianarchive.app`
- **Product Name**: `AvianArchive` (executable name)
- **Architectures**: Intel x64 + Apple Silicon ARM64 for Mac
- **Auto-updater**: Ready for future implementation
- **Code Signing**: Optional (currently unsigned for easy distribution)

### 📋 **Build Requirements**

#### For macOS builds:
- macOS machine (for .dmg creation)
- Xcode Command Line Tools (optional, for code signing)

#### For Windows builds:
- Any platform (cross-compilation supported)
- Wine (on macOS/Linux) for advanced Windows features

#### For Linux builds:
- Any platform (cross-compilation supported)

### 🚀 **Distribution**

#### **Quick Distribution (Recommended)**
1. Run `npm run build-mac` or `npm run build-win`
2. Share the generated .zip or .exe files
3. Users can extract and run immediately

#### **App Store Distribution**
- macOS: Additional code signing required for Mac App Store
- Windows: Microsoft Store certification needed
- Linux: Snap Store or Flatpak packaging available

### 🔧 **Advanced Build Options**

#### Custom Icon
Place your app icon files in `build-resources/`:
- `icon.icns` - macOS icon
- `icon.ico` - Windows icon  
- `icon.png` - Linux icon (512x512 recommended)

#### Code Signing
For production distribution, add code signing certificates:
```bash
# macOS
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=certificate_password

# Windows
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=certificate_password
```

#### Environment Variables
- `ELECTRON_IS_DEV=true` - Development mode
- `DEBUG=electron-builder` - Verbose build output

### Available Scripts

#### Development Scripts
- `npm start` - Start React development server (browser mode)
- `npm run electron` - Start Electron app (production build)
- `npm run electron-dev` - Start Electron app (development mode)
- `npm run dev` - Start both React and Electron in development mode
- `npm run build` - Build React app for production

#### Packaging Scripts
- `npm run build-electron` - Build complete Electron app
- `npm run build-mac` - Package for macOS (Intel + Apple Silicon)
- `npm run build-win` - Package for Windows (64-bit)
- `npm run build-linux` - Package for Linux (AppImage + deb)
- `npm run build-all` - Package for all platforms
- `npm run release` - Create production release packages

#### Utility Scripts
- `npm run electron-rebuild` - Rebuild native dependencies for current platform

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
- **electron-builder** - App packaging and distribution

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

### Phase 3: Distribution & Packaging ✅
- [x] Cross-platform app packaging with electron-builder
- [x] macOS builds (Intel + Apple Silicon) with .zip distribution
- [x] Windows builds with .exe installer and portable versions
- [x] Linux builds with AppImage and .deb packages
- [x] Automated build scripts for all platforms
- [x] Production-ready distribution setup

### Phase 4: Advanced Features 🚧
- [ ] AI-powered bird species identification
- [ ] Advanced analytics and birding statistics
- [ ] Data export/import functionality
- [ ] Photo editing and enhancement tools
- [ ] Offline map tiles and GPS tracking

### Phase 5: Cloud & Sharing
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