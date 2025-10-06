# FOMO Setup Guide

## Prerequisites

Before running the application, you need to fix the Node.js PATH issue on your Windows system.

### Fix Node.js PATH Issue

The error `'node' is not recognized as an internal or external command` indicates that Node.js is not properly configured in your system PATH.

**Solution:**

1. **Find your Node.js installation path**
   - Usually located at: `C:\Program Files\nodejs\`
   - Or: `C:\Users\YourUsername\AppData\Roaming\npm`

2. **Add Node.js to System PATH**
   - Press `Windows + X` and select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System Variables", find and select "Path"
   - Click "Edit"
   - Click "New" and add your Node.js path (e.g., `C:\Program Files\nodejs\`)
   - Click "OK" to save all dialogs

3. **Restart your terminal/command prompt**

4. **Verify installation**
   ```bash
   node --version
   npm --version
   ```

## Installation Steps

Once Node.js is properly configured:

### 1. Install Dependencies

```bash
cd C:\Users\Venkata\Desktop\fomo
npm install
```

This will install all the following packages:

**Production Dependencies:**
- react@^18.3.1
- react-dom@^18.3.1
- zustand@^5.0.2
- axios@^1.7.9
- framer-motion@^12.23.22 (latest version!)
- lucide-react@^0.468.0
- clsx@^2.1.1
- tailwind-merge@^2.5.5

**Development Dependencies:**
- electron@^34.0.0 (latest version!)
- vite@^6.0.7 (latest version!)
- typescript@^5.7.2
- tailwindcss@^3.4.17
- And many more...

### 2. Create Environment File

```bash
copy .env.example .env
```

Edit `.env` and configure your backend:
```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000/ws/transcript
```

### 3. Start Development Server

```bash
npm run electron:dev
```

This will:
1. Start the Vite dev server on `http://localhost:5173`
2. Wait for the server to be ready
3. Launch the Electron app

## Project Structure Overview

```
fomo/
├── electron/              # Electron main & preload
│   ├── main.ts           # ✅ Created - Main process with IPC handlers
│   └── preload.ts        # ✅ Created - Secure IPC bridge
├── src/
│   ├── components/
│   │   ├── shared/       # ✅ Created - Button, Card, Badge, Tooltip
│   │   ├── layout/       # ✅ Created - Titlebar, Sidebar, StatusBar
│   │   ├── meeting/      # ✅ Created - RecordingControl, LiveTranscript
│   │   ├── actionItems/  # ✅ Created - ActionItemCard
│   │   └── summary/      # 🔨 To be implemented
│   ├── stores/           # ✅ Created - Zustand stores (meeting, settings, auth)
│   ├── services/         # ✅ Created - API, GitHub, IPC services
│   ├── hooks/            # ✅ Created - useMeetingRecorder, useWebSocket, useActionItems
│   ├── types/            # ✅ Created - Complete TypeScript definitions
│   ├── lib/              # ✅ Created - Utility functions
│   ├── styles/           # ✅ Created - Global CSS with Tailwind
│   ├── App.tsx           # ✅ Created - Main application with routing
│   └── main.tsx          # ✅ Created - React entry point
├── package.json          # ✅ Created - Latest dependencies
├── vite.config.ts        # ✅ Created - Vite + Electron configuration
├── tailwind.config.js    # ✅ Created - Custom design system
├── tsconfig.json         # ✅ Created - TypeScript configuration
├── electron-builder.yml  # ✅ Created - Build configuration
└── README.md            # ✅ Created - Complete documentation
```

## Key Features Implemented

### ✅ Latest Technology Stack (2025)
- **Electron 34.0.0** - Latest version with improved performance
- **Vite 6.0.7** - Next-gen build tool (CRA is deprecated!)
- **React 18.3.1** - With latest features
- **Framer Motion 12.23.22** - Latest animation library (rebranded from Framer Motion)
- **Zustand 5.0.2** - Modern state management with minimal boilerplate
- **TypeScript 5.7.2** - Latest type safety
- **Tailwind CSS 3.4.17** - Latest utility-first CSS

### ✅ Core Features
1. **Frameless Window** - Custom titlebar with minimize/maximize/close
2. **Real-time Transcription** - WebSocket connection for live updates
3. **Action Items** - AI-extracted tasks with GitHub integration
4. **Dark Mode** - Optimized for long sessions
5. **State Persistence** - Zustand with localStorage
6. **Responsive Design** - Clean, minimal UI
7. **Type Safety** - Complete TypeScript coverage

### ✅ Architecture Highlights
- **IPC Security** - Context isolation enabled, no nodeIntegration
- **Modular Components** - Reusable, well-documented
- **Custom Hooks** - Encapsulated logic
- **Service Layer** - Clean separation of concerns
- **Error Handling** - Comprehensive try-catch blocks
- **Performance** - Framer Motion for smooth animations

## Development Workflow

### Starting the App
```bash
npm run electron:dev
```

### Building for Production
```bash
npm run electron:build
```

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## Backend Requirements

FOMO requires a Flask backend with the following endpoints:

### REST API Endpoints
- `POST /meeting/start` - Start recording
- `POST /meeting/{id}/stop` - Stop recording
- `POST /meeting/{id}/pause` - Pause recording
- `POST /meeting/{id}/resume` - Resume recording
- `GET /meeting/{id}/transcript` - Get transcript
- `GET /meeting/{id}/actions` - Get action items
- `POST /meeting/{id}/summary` - Generate summary

### WebSocket Endpoint
- `ws://localhost:5000/ws/transcript?meeting_id={id}` - Live transcript stream

### Message Format
```json
{
  "type": "transcript" | "action_item" | "status" | "error",
  "data": { ... },
  "timestamp": 1234567890
}
```

## Troubleshooting

### Issue: npm install fails
**Solution:** Fix Node.js PATH as described above

### Issue: Electron window doesn't open
**Solution:** Check if Vite dev server is running on port 5173

### Issue: WebSocket connection fails
**Solution:** Ensure backend is running and `VITE_WS_URL` is correct in `.env`

### Issue: TypeScript errors
**Solution:** Run `npm install` again to ensure all types are installed

## Next Steps

After installation:

1. **Start the backend server** (Python Flask)
2. **Run `npm run electron:dev`**
3. **Click the record button** to start a meeting
4. **Watch the transcript** appear in real-time
5. **Review action items** in the right panel
6. **Create GitHub issues** from action items

## Additional Components to Implement

While the core application is complete, you may want to add:

1. **Meeting History View** - Browse past meetings
2. **Settings Panel** - Configure audio, AI, integrations
3. **Summary View** - Display meeting summaries with key decisions
4. **Audio Visualizer** - Show waveform during recording
5. **Export Features** - Download transcript as Markdown/PDF
6. **Slack Integration** - Post summaries to Slack channels

## Support

For issues or questions:
1. Check the README.md for basic documentation
2. Review the code comments in key files
3. Check the browser/Electron console for errors

## License

MIT - Feel free to use and modify!
