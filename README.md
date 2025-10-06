# FOMO - AI-Powered Meeting Assistant

An Electron-based desktop application that transcribes meetings in real-time, extracts action items, and creates GitHub issues automatically.

## 🚀 Features

- **Real-time Transcription**: Live audio capture and transcription with speaker identification
- **AI-Powered Action Items**: Automatically extract action items from conversations
- **GitHub Integration**: Create issues directly from action items
- **Meeting History**: Review past meetings, transcripts, and summaries
- **Dark Mode First**: Optimized for long recording sessions
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🛠️ Tech Stack

- **Framework**: Electron with Vite
- **UI Library**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v3+ with custom design system
- **State Management**: Zustand
- **API Communication**: Axios
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Build Tool**: Vite 6

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fomo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL and GitHub credentials
   ```

4. **Start the development server**
   ```bash
   npm run electron:dev
   ```

## 🏗️ Project Structure

```
fomo/
├── electron/              # Electron main process and preload scripts
│   ├── main.ts           # Main process entry point
│   └── preload.ts        # IPC bridge
├── src/
│   ├── components/       # React components
│   │   ├── layout/      # Titlebar, Sidebar, StatusBar
│   │   ├── meeting/     # Recording controls, Live transcript
│   │   ├── actionItems/ # Action item cards and management
│   │   ├── summary/     # Meeting summaries
│   │   └── shared/      # Reusable UI components
│   ├── stores/          # Zustand state management
│   ├── services/        # API and service layers
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global CSS and Tailwind config
│   ├── App.tsx          # Main application component
│   └── main.tsx         # React entry point
├── public/              # Static assets
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── electron-builder.yml # Electron build configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start Vite dev server only
- `npm run electron:dev` - Start Electron app in development mode
- `npm run build` - Build for production
- `npm run electron:build` - Build and package Electron app
- `npm run lint` - Run ESLint

## 🔌 Backend Integration

FOMO requires a Python Flask backend for:
- Audio transcription (using Whisper or similar)
- AI processing (GPT-4/Claude for action items and summaries)
- WebSocket connection for real-time updates

Configure the backend URL in `.env`:
```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000/ws/transcript
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6) - Professional, trustworthy
- **Accent**: Purple (#8b5cf6) - AI/Smart features
- **Success**: Green (#10b981) - Completed actions
- **Warning**: Orange (#f59e0b) - Pending items
- **Error**: Red (#ef4444) - Critical issues

### Typography
- **Primary Font**: Inter
- **Monospace**: JetBrains Mono (for timestamps, code)

## 🔐 GitHub Integration

1. Create a GitHub OAuth App at https://github.com/settings/developers
2. Set the callback URL to `http://localhost:5173/auth/callback`
3. Add credentials to `.env`:
   ```
   VITE_GITHUB_CLIENT_ID=your_client_id
   VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

## 📝 Development Notes

- The app uses a frameless window with custom titlebar
- WebSocket connection automatically reconnects if disconnected
- Transcript segments are stored locally using Zustand persist
- All sensitive data (GitHub tokens) are stored securely

## 🚢 Building for Production

```bash
npm run electron:build
```

This will create distributable packages in the `release/` directory for your platform.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
