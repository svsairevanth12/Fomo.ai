# 🚀 FOMO - Run Commands

## ⚡ Quick Start Commands

### 1. Install Dependencies (First Time Only)
```bash
cd C:\Users\Venkata\Desktop\fomo
npm install
```

### 2. Run the Electron App
```bash
npm run electron:dev
```

---

## 📋 All Available Commands

### Development Commands

#### Start Electron App in Development Mode
```bash
npm run electron:dev
```
**What it does:**
- Starts Vite dev server on http://localhost:5173
- Waits for server to be ready
- Launches Electron window
- Enables hot reload
- Opens DevTools automatically

#### Start Vite Dev Server Only (No Electron)
```bash
npm run dev
```
**What it does:**
- Starts Vite dev server
- Opens in browser
- Good for testing UI without Electron

#### Run Preview Build
```bash
npm run preview
```
**What it does:**
- Previews production build
- Tests optimized version

---

### Build Commands

#### Build for Production
```bash
npm run build
```
**What it does:**
- Compiles TypeScript
- Bundles React app with Vite
- Creates optimized production build

#### Build & Package Electron App
```bash
npm run electron:build
```
**What it does:**
- Builds the app
- Packages with electron-builder
- Creates installer for your platform:
  - **Windows**: `release/FOMO Setup.exe`
  - **macOS**: `release/FOMO.dmg`
  - **Linux**: `release/FOMO.AppImage`

---

### Code Quality Commands

#### Run ESLint
```bash
npm run lint
```
**What it does:**
- Checks for code issues
- Shows warnings and errors

#### Type Check (TypeScript)
```bash
npx tsc --noEmit
```
**What it does:**
- Checks TypeScript types
- Doesn't emit files
- Shows type errors

---

## ⚠️ Before Running - Fix Node.js PATH

If you get `'node' is not recognized` error:

### Windows Fix:
1. Press `Windows + R`
2. Type `sysdm.cpl` and press Enter
3. Click **Advanced** tab → **Environment Variables**
4. Find **Path** under System Variables
5. Click **Edit** → **New**
6. Add: `C:\Program Files\nodejs\`
7. Click **OK** on all dialogs
8. **Restart your terminal**

### Verify Fix:
```bash
node --version
npm --version
```

---

## 🎯 Recommended Workflow

### First Time Setup:
```bash
# 1. Navigate to project
cd C:\Users\Venkata\Desktop\fomo

# 2. Install dependencies
npm install

# 3. Create environment file
copy .env.example .env

# 4. Edit .env with your backend URL (optional)
notepad .env

# 5. Run the app!
npm run electron:dev
```

### Daily Development:
```bash
# Just run this:
npm run electron:dev

# Press Ctrl+C to stop
```

### Before Committing Code:
```bash
# Check for errors
npm run lint

# Check types
npx tsc --noEmit
```

### Building for Release:
```bash
# Create installer
npm run electron:build

# Find your installer in:
# C:\Users\Venkata\Desktop\fomo\release\
```

---

## 🔥 Pure Black & White UI Features

The app now has a **brutalist black & white aesthetic**:

✨ **Design Features:**
- Pure black (#000000) background
- Pure white (#FFFFFF) text and accents
- Sharp, square edges (no rounded corners)
- Bold, uppercase typography
- Brutalist shadows on hover
- Grid pattern background
- Monospace font for status/numbers
- High contrast for maximum readability

🎨 **Visual Effects:**
- Recording button glows white when active
- Hover states invert colors (black↔white)
- Sharp 2px borders everywhere
- Status indicators with brackets `[ IDLE ]`
- Scan line effects (optional)

---

## 🐛 Troubleshooting

### Issue: `npm install` fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Issue: Port 5173 already in use
**Solution:**
```bash
# Kill process on Windows:
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Or change port in vite.config.ts
```

### Issue: Electron window doesn't open
**Check:**
1. Is Vite running? (Should see "Local: http://localhost:5173")
2. Any errors in terminal?
3. Try: `npm run dev` first, then `npm run electron:dev`

### Issue: Module not found errors
**Solution:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
**Solution:**
```bash
# Reinstall type definitions
npm install --save-dev @types/node @types/react @types/react-dom
```

---

## 🎮 Keyboard Shortcuts in App

When the app is running:

- `Ctrl+Shift+I` or `Cmd+Option+I` - Open DevTools
- `Ctrl+R` or `Cmd+R` - Reload app
- `Ctrl+Q` or `Cmd+Q` - Quit app
- `F11` - Toggle fullscreen (may need to implement)

---

## 📦 Package Scripts Explained

From `package.json`:

```json
{
  "dev": "vite",
  // Starts Vite dev server

  "build": "tsc && vite build && electron-builder",
  // Full production build

  "lint": "eslint . --ext ts,tsx",
  // Lint TypeScript files

  "preview": "vite preview",
  // Preview production build

  "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
  // Development mode with hot reload

  "electron:build": "vite build && electron-builder"
  // Package Electron app
}
```

---

## 🌐 Environment Variables

Edit `.env` file:

```env
# Backend API
VITE_API_URL=http://localhost:5000

# WebSocket
VITE_WS_URL=ws://localhost:5000/ws/transcript

# GitHub OAuth (Optional)
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
```

---

## 🎯 Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm install` | Install deps | First time only |
| `npm run electron:dev` | **Run app** | **Every time** |
| `npm run lint` | Check code | Before commit |
| `npm run electron:build` | Build installer | For release |
| `npx tsc --noEmit` | Type check | Debug types |

---

## 🚀 THE MAIN COMMAND YOU NEED

### To run the Electron app:

```bash
npm run electron:dev
```

**That's it!** This is the main command you'll use every day.

---

## 💡 Pro Tips

1. **Keep terminal open** - See live logs and errors
2. **DevTools is your friend** - Press `Ctrl+Shift+I` to debug
3. **Hot reload works** - Edit React files, see changes instantly
4. **Check console** - All errors appear in DevTools console
5. **Backend required** - For full functionality, run Flask backend too

---

## 🎨 New UI Preview

When you run the app, you'll see:

```
┌─────────────────────────────────────────┐
│ ■ FOMO              [MINIMIZE] [MAX] [X]│ ← Titlebar
├─────┬───────────────────────────────────┤
│     │                                   │
│ [■] │         [ READY ]                 │
│     │   PRESS TO RECORD                 │
│ [●] │                                   │
│     │   ████████████████                │ ← Grid pattern
│ [#] │                                   │
│     │                                   │
│ [⚙] │                                   │
└─────┴───────────────────────────────────┘
  ↑                    ↑
Sidebar          Main content
```

**Colors:**
- Background: Pure black
- Text: Pure white
- Borders: White with 10% opacity
- Accents: White glow effects

---

**Built with pure black & white brutalist aesthetic** 🖤🤍

Run `npm run electron:dev` to see the magic! ✨
