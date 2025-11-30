# Local Difference Checker

A privacy-first, offline desktop application for comparing text differences. Built with Electron, React, and Vite, this tool provides a fast and secure way to analyze differences between text files, JSON documents, code snippets, and more—all without any network communication.

## Features

### Core Functionality
- **Real-time diff comparison** between two text inputs
- **Multiple diff modes**:
  - Line-level diff
  - Word-level diff
  - Character-level diff
- **JSON-aware diff mode** that:
  - Ignores key ordering
  - Pretty-prints JSON before comparing
  - Collapses unchanged sections
- **Dual view modes**:
  - Side-by-side (split) view
  - Unified view
- **Visual highlighting**:
  - Green for additions
  - Red for deletions
  - Highlighted modifications

### Input Methods
- **Paste** content directly into input panes
- **Drag-and-drop** files (.txt, .json, .js, .py, etc.)
- **Open File** dialog for selecting files
- **Auto-detection** of file types from extensions

### Navigation & Search
- **Jump between changes** with Previous/Next buttons
- **Keyboard shortcuts** (Alt+Arrow Up/Down) for navigation
- **Search functionality** to find specific text
- **Synchronized scrolling** between input panes
- **Collapsible unchanged sections** (like GitHub)

### Export & Copy
- **Copy to clipboard**:
  - Plain text format
  - HTML format (with syntax highlighting)
- **Export to file**:
  - `.txt` unified diff format
  - `.html` colored diff output

### Customization
- **Theme support**: Light and Dark modes
- **Settings panel** with options for:
  - JSON formatting toggle
  - Whitespace sensitivity
  - Diff granularity selection
  - Font size and font family
  - Scroll synchronization
  - Collapse threshold
- **Undo/Redo** for each input field

### Privacy & Security
- **100% offline** - No network calls
- **Local-only** - All data stays on your machine
- **No telemetry** - Zero analytics or tracking
- **No cloud sync** - Complete privacy

## Screenshots

*Add screenshots of your application here*

## Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd local-difference-checker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```
   This will:
   - Start the Vite dev server for the renderer process
   - Watch and compile the main process TypeScript
   - Launch Electron with hot reload

### Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production build**
   ```bash
   npm start
   ```

### Building Distributables

The project is configured with `electron-builder` to create distributables for Mac, Windows, and Linux.

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Build for your current platform:**
   ```bash
   npm run dist
   ```

3. **Build for specific platforms:**
   ```bash
   npm run dist:mac    # macOS (.dmg)
   npm run dist:win    # Windows (.exe installer)
   npm run dist:linux  # Linux (.AppImage, .deb)
   npm run dist:all    # All platforms
   ```

4. **Find your distributables** in the `release/` directory.

For detailed distribution instructions, including how to create download links via GitHub Releases, see [DISTRIBUTION.md](./DISTRIBUTION.md).

## Usage

### Basic Comparison

1. **Enter or paste content** into the two input panes (Input A and Input B)
2. The diff will **automatically compute** and display below
3. **Navigate changes** using the Previous/Next buttons or keyboard shortcuts

### Loading Files

- **Drag and drop** a file onto either input pane
- Click the **file icon** in the input pane to open a file dialog
- Files are automatically detected by extension

### JSON Mode

- Toggle **JSON Mode** button in the header to enable JSON-aware diffing
- JSON mode automatically:
  - Normalizes key ordering
  - Pretty-prints JSON
  - Collapses large unchanged sections

### Keyboard Shortcuts

- `Alt + ↑` - Navigate to previous change
- `Alt + ↓` - Navigate to next change
- Standard text editing shortcuts work in input fields

### Exporting Results

- **Copy Text**: Copies plain text diff to clipboard
- **Copy HTML**: Copies formatted HTML diff to clipboard
- **Export .txt**: Saves unified diff format to file
- **Export .html**: Saves colored HTML diff to file

## Project Structure

```
local-difference-checker/
├── app/
│   ├── main/              # Electron main process
│   │   ├── ipc/          # IPC handlers
│   │   ├── main.ts       # Main entry point
│   │   └── preload.ts    # Preload script
│   └── renderer/         # React frontend
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── hooks/       # Custom React hooks
│       │   ├── lib/         # Utility functions
│       │   ├── types/       # TypeScript types
│       │   └── workers/     # Web Workers
│       └── index.html
├── dist/                  # Build output
├── package.json
├── vite.config.ts         # Vite configuration
└── tsconfig.*.json        # TypeScript configurations
```

## Technology Stack

- **Electron** - Desktop application framework
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library (Radix UI primitives)
- **diff** - Diff algorithm library
- **diff2html** - HTML diff rendering
- **electron-store** - Local preferences storage

## Development

### Scripts

- `npm run dev` - Start development mode with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run ESLint
- `npm run dist` - Build distributable for current platform
- `npm run dist:mac` - Build macOS distributable
- `npm run dist:win` - Build Windows distributable
- `npm run dist:linux` - Build Linux distributable
- `npm run dist:all` - Build for all platforms

### Code Style

The project uses:
- ESLint for linting
- Prettier (via ESLint config) for formatting
- TypeScript strict mode

## Performance

- Diffs compute in ≤ 100ms for text up to 200k characters
- Large diffs run in Web Workers to prevent UI freezing
- Memory usage optimized for large JSON files

## Platform Support

- **macOS** - Full support with native title bar
- **Windows** - Full support
- **Linux** - Full support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

*Add your license information here*

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Diff algorithm from [diff](https://github.com/kpdecker/jsdiff)
- Icons from [Lucide](https://lucide.dev/)

