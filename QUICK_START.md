# 🚀 FOMO Quick Start Guide

## ⚠️ Important: Fix Node.js PATH First

Your system has a Node.js PATH issue. Here's how to fix it:

### Windows PATH Fix (Required)

1. **Press** `Windows + R`
2. **Type** `sysdm.cpl` and press Enter
3. **Click** "Advanced" tab → "Environment Variables"
4. **Find** "Path" under System Variables
5. **Click** "Edit"
6. **Add** these paths if missing:
   - `C:\Program Files\nodejs\`
   - `C:\Users\Venkata\AppData\Roaming\npm`
7. **Click** OK on all dialogs
8. **Close and reopen** your terminal

### Verify Fix
```bash
node --version
npm --version
```

If both commands work, you're ready to proceed!

---

## 🎯 Installation (3 Steps)

### Step 1: Install Dependencies
```bash
cd C:\Users\Venkata\Desktop\fomo
npm install
```

**This will install:**
- Electron 34 (latest!)
- React 18.3
- Vite 6 (latest!)
- Framer Motion 12 (latest!)
- Zustand, Axios, Tailwind, TypeScript, and more...

**Expected time:** 2-3 minutes

### Step 2: Create Environment File
```bash
copy .env.example .env
```

**Edit `.env` and set your backend URL:**
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000/ws/transcript
```

### Step 3: Start the App
```bash
npm run electron:dev
```

**This will:**
1. Start Vite dev server (http://localhost:5173)
2. Launch Electron window
3. Open DevTools for debugging

---

## 🎨 What You'll See

### Main Window
- **Custom Titlebar** - Minimize, maximize, close buttons
- **Sidebar** - Navigation (Live, History, Integrations, Settings)
- **Center Panel** - Large recording button
- **Status Bar** - Connection status, duration, counts

### When Recording
- **Left Panel** - Live transcript feed
- **Right Panel** - Action items extracted by AI
- **Recording Pulse** - Visual feedback on record button
- **Duration Timer** - HH:MM:SS format

---

## 🔌 Backend Setup (Required for Full Functionality)

The frontend is complete, but you need a Python Flask backend for:
- Audio transcription
- AI processing
- Real-time updates

### Backend Requirements
```python
# Required endpoints:
POST   /meeting/start
POST   /meeting/{id}/stop
GET    /meeting/{id}/transcript
GET    /meeting/{id}/actions
POST   /meeting/{id}/summary

# WebSocket:
WS     /ws/transcript?meeting_id={id}
```

### WebSocket Message Format
```json
{
  "type": "transcript",
  "data": {
    "id": "seg-123",
    "speaker": "Speaker 1",
    "text": "Hello, everyone...",
    "timestamp": 1234567890,
    "confidence": 0.95
  }
}
```

---

## 📁 Project Structure

```
fomo/
├── electron/           # Electron main process
├── src/
│   ├── components/    # React components
│   │   ├── shared/    # Button, Card, Badge, Tooltip
│   │   ├── layout/    # Titlebar, Sidebar, StatusBar
│   │   ├── meeting/   # Recording controls, Transcript
│   │   └── actionItems/ # Action item cards
│   ├── stores/        # Zustand state (meeting, settings, auth)
│   ├── services/      # API clients (REST, GitHub, IPC)
│   ├── hooks/         # Custom hooks
│   ├── types/         # TypeScript definitions
│   └── App.tsx        # Main application
├── package.json       # Dependencies
├── vite.config.ts     # Vite configuration
└── tailwind.config.js # Design system
```

---

## ✅ Testing Without Backend

You can test the UI without a backend:

1. **Start the app** - `npm run electron:dev`
2. **Click record button** - UI will respond
3. **Navigate** - Use sidebar to switch views
4. **Window controls** - Test minimize, maximize, close

**What won't work without backend:**
- Actual recording
- Real transcription
- AI action items
- WebSocket connection

---

## 🐛 Troubleshooting

### Issue: `npm install` fails
**Cause:** Node.js PATH not configured
**Fix:** Follow PATH fix steps above

### Issue: Electron window doesn't open
**Check:**
1. Is Vite running? (Should see http://localhost:5173)
2. Any errors in terminal?
3. Try: `npm run dev` first, then `npm run electron:dev`

### Issue: "Module not found" errors
**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
**Fix:**
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

### Issue: WebSocket connection fails
**Expected:** Backend not running yet
**Solution:** Set up Python Flask backend

---

## 🎓 Key Files to Know

### For Development
- `src/App.tsx` - Main application logic
- `src/stores/meetingStore.ts` - Meeting state
- `src/hooks/useMeetingRecorder.ts` - Recording logic
- `src/services/api.ts` - Backend API calls

### For Styling
- `src/styles/globals.css` - Global styles
- `tailwind.config.js` - Design tokens
- Individual component files - Component styles

### For Configuration
- `.env` - Environment variables
- `vite.config.ts` - Build configuration
- `electron/main.ts` - Electron settings

---

## 📚 Available Scripts

```bash
# Development
npm run electron:dev   # Start Electron app
npm run dev           # Vite dev server only

# Building
npm run build         # Build for production
npm run electron:build # Package Electron app

# Code Quality
npm run lint          # Run ESLint
npx tsc --noEmit      # Type check
```

---

## 🚀 Production Build

```bash
# Build the app
npm run electron:build

# Find your app in:
# Windows: release/FOMO Setup.exe
# macOS: release/FOMO.dmg
# Linux: release/FOMO.AppImage
```

---

## 🎯 Next Steps

1. ✅ **Install dependencies** (`npm install`)
2. ✅ **Start the app** (`npm run electron:dev`)
3. ✅ **Explore the UI** - Click around, test features
4. 🔄 **Build backend** - Set up Python Flask server
5. 🔄 **Connect backend** - Update `.env` with backend URL
6. 🔄 **Test recording** - Start a meeting, watch it transcribe
7. 🔄 **Add GitHub OAuth** - Get client ID, configure
8. 🔄 **Create issues** - Test GitHub integration

---

## 💡 Pro Tips

### Development Tips
1. **Keep DevTools open** - Press `Ctrl+Shift+I` / `Cmd+Option+I`
2. **Hot Reload works** - Edit React components, see changes instantly
3. **Check console** - Frontend logs appear in Electron DevTools
4. **Backend logs** - Run Flask in debug mode

### Design System
- **Colors** - Use Tailwind classes: `bg-primary-600`, `text-error-500`
- **Spacing** - Use Tailwind spacing: `p-4`, `mt-6`, `gap-3`
- **Components** - Import from `@/components/shared/*`

### State Management
```typescript
// Access meeting state
import { useMeetingStore } from '@/stores/meetingStore';

function MyComponent() {
  const { currentMeeting, startMeeting } = useMeetingStore();
  // ...
}
```

### API Calls
```typescript
import { api } from '@/services/api';

// Make API call
const result = await api.startRecording();
```

---

## 📞 Need Help?

1. **Read README.md** - Comprehensive documentation
2. **Check SETUP_GUIDE.md** - Detailed setup instructions
3. **Review PROJECT_SUMMARY.md** - Complete file overview
4. **Inspect code** - Well-commented, self-documenting

---

## 🎉 You're All Set!

Your FOMO application is ready to run. Once you:
1. Fix the Node.js PATH
2. Run `npm install`
3. Start with `npm run electron:dev`

You'll have a fully functional AI meeting assistant frontend!

**Happy coding! 🚀**
