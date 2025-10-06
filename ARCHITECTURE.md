# FOMO Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FOMO Desktop App                         │
│                      (Electron + React + TS)                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐       ┌───────▼────────┐
            │  Main Process  │       │    Renderer    │
            │   (Node.js)    │◄─IPC─►│     (React)    │
            └────────────────┘       └────────────────┘
                    │                         │
            ┌───────┴─────────┐      ┌────────┴────────┐
            │                 │      │                  │
    ┌───────▼──────┐  ┌──────▼─┐   │  ┌───────────┐  │
    │ System Audio │  │ Window │   │  │  UI Layer │  │
    │   Capture    │  │Control │   │  └─────┬─────┘  │
    └──────────────┘  └────────┘   │        │        │
                                    │  ┌─────▼──────┐ │
                                    │  │ Components │ │
                                    │  └─────┬──────┘ │
                                    │        │        │
                                    │  ┌─────▼──────┐ │
                                    │  │   Stores   │ │
                                    │  │  (Zustand) │ │
                                    │  └─────┬──────┘ │
                                    │        │        │
                                    │  ┌─────▼──────┐ │
                                    │  │  Services  │ │
                                    │  └─────┬──────┘ │
                                    └────────┼────────┘
                                             │
                    ┌────────────────────────┴────────────────────┐
                    │                                              │
            ┌───────▼────────┐                          ┌─────────▼────────┐
            │  Backend API   │                          │   GitHub API     │
            │ (Flask/Python) │                          │   (REST/OAuth)   │
            └────────┬───────┘                          └──────────────────┘
                     │
        ┌────────────┼───────────┐
        │            │           │
┌───────▼──────┐ ┌──▼────┐ ┌────▼────┐
│   Whisper    │ │ GPT-4 │ │  DB     │
│ (Transcribe) │ │ (AI)  │ │ (Store) │
└──────────────┘ └───────┘ └─────────┘
```

## Component Hierarchy

```
App
├── Titlebar (Window controls)
│
├── Sidebar (Navigation)
│   ├── Live Recording (current)
│   ├── Meeting History
│   ├── Integrations
│   └── Settings
│
├── Main Content (Routes)
│   │
│   ├── Live View
│   │   ├── RecordingControl
│   │   │   ├── Play/Stop Button
│   │   │   ├── Duration Timer
│   │   │   └── Pause Button
│   │   │
│   │   ├── LiveTranscript (Left Panel)
│   │   │   └── TranscriptSegmentCard[]
│   │   │       ├── Speaker Badge
│   │   │       ├── Text Content
│   │   │       └── Edit Button
│   │   │
│   │   └── Action Items (Right Panel)
│   │       └── ActionItemCard[]
│   │           ├── Task Text
│   │           ├── Priority Badge
│   │           ├── Context
│   │           ├── Assignee
│   │           └── Create Issue Button
│   │
│   ├── History View (TODO)
│   ├── Integrations View (TODO)
│   └── Settings View (TODO)
│
└── StatusBar
    ├── Recording Status
    ├── Segment Count
    ├── Action Item Count
    └── Connection Status
```

## Data Flow

### Recording Flow
```
User clicks Record
       │
       ▼
RecordingControl
       │
       ├──► useMeetingRecorder hook
       │           │
       │           ├──► meetingStore.startMeeting()
       │           │           │
       │           │           └──► Creates Meeting object
       │           │
       │           ├──► ipc.startAudioCapture()
       │           │           │
       │           │           └──► Electron captures audio
       │           │
       │           └──► api.startRecording()
       │                       │
       │                       └──► Backend starts processing
       │
       └──► WebSocket connects
                   │
                   ├──► Receives transcript segments
                   │           │
                   │           └──► meetingStore.addTranscriptSegment()
                   │
                   └──► Receives action items
                               │
                               └──► meetingStore.addActionItem()
```

### Action Item → GitHub Issue Flow
```
User clicks "Create Issue"
       │
       ▼
ActionItemCard
       │
       ▼
useActionItems.createGitHubIssue()
       │
       ├──► Update status to "creating"
       │           │
       │           └──► meetingStore.updateActionItem()
       │
       ├──► github.createIssueFromActionItem()
       │           │
       │           ├──► Format issue body
       │           │
       │           └──► GitHub API call
       │                   │
       │                   └──► Returns issue object
       │
       └──► Update status to "created"
               │
               └──► Store issue number & URL
```

## State Management (Zustand)

```
┌──────────────────────────────────────────────────┐
│                 Meeting Store                     │
├──────────────────────────────────────────────────┤
│ State:                                           │
│  • currentMeeting: Meeting | null               │
│  • recordingState: RecordingState               │
│  • meetings: Meeting[]                           │
│                                                  │
│ Actions:                                         │
│  • startMeeting()                               │
│  • stopMeeting()                                │
│  • addTranscriptSegment()                       │
│  • addActionItem()                              │
│  • updateActionItem()                           │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                Settings Store                     │
├──────────────────────────────────────────────────┤
│ State:                                           │
│  • audio: AudioSettings                         │
│  • ai: AISettings                               │
│  • integrations: IntegrationSettings            │
│  • appearance: AppearanceSettings               │
│                                                  │
│ Actions:                                         │
│  • updateAudioSettings()                        │
│  • updateAISettings()                           │
│  • updateGitHubConnection()                     │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                  Auth Store                       │
├──────────────────────────────────────────────────┤
│ State:                                           │
│  • github: GitHubAuth | null                    │
│  • isAuthenticated: boolean                     │
│                                                  │
│ Actions:                                         │
│  • setGitHubAuth()                              │
│  • clearGitHubAuth()                            │
│  • isTokenValid()                               │
└──────────────────────────────────────────────────┘
```

## Service Layer

```
┌────────────────┐
│   API Service  │  ← REST API calls to Flask backend
├────────────────┤
│ • startRecording()
│ • stopRecording()
│ • getTranscript()
│ • getActionItems()
│ • generateSummary()
└────────────────┘

┌────────────────┐
│ GitHub Service │  ← GitHub API integration
├────────────────┤
│ • getCurrentUser()
│ • getUserRepositories()
│ • createIssue()
│ • getCollaborators()
└────────────────┘

┌────────────────┐
│  IPC Service   │  ← Electron main ↔ renderer
├────────────────┤
│ • minimizeWindow()
│ • maximizeWindow()
│ • closeWindow()
│ • getAudioSources()
│ • startAudioCapture()
└────────────────┘
```

## WebSocket Communication

```
Renderer Process          WebSocket Server
     │                          │
     ├──── Connect ────────────►│
     │                          │
     │◄──── onOpen ─────────────┤
     │                          │
     │                   ┌──────┴──────┐
     │                   │ Transcription│
     │                   │   Pipeline   │
     │                   └──────┬───────┘
     │                          │
     │◄──── transcript ─────────┤
     │     {type, data}         │
     │                          │
     │◄──── action_item ────────┤
     │     {type, data}         │
     │                          │
     │◄──── status ─────────────┤
     │     {type, data}         │
     │                          │
     ├──── Disconnect ──────────►│
     │                          │
```

## Type System

```typescript
// Core Meeting Types
Meeting {
  id: string
  title: string
  startTime: number
  duration: number
  transcript: TranscriptSegment[]
  actionItems: ActionItem[]
  summary?: MeetingSummary
  status: 'recording' | 'processing' | 'completed'
}

TranscriptSegment {
  id: string
  speaker: string
  text: string
  timestamp: number
  confidence: number
}

ActionItem {
  id: string
  text: string
  assignee: string | null
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'creating' | 'created' | 'failed'
  githubIssue?: {
    number: number
    url: string
  }
}
```

## Security Model

```
┌──────────────────────────────────────┐
│       Renderer Process (React)       │
│                                      │
│  ⚠️ No direct Node.js access         │
│  ✅ Context isolation enabled        │
│  ✅ Sandbox enabled                  │
└───────────────┬──────────────────────┘
                │
                │ IPC (Secure Bridge)
                │
┌───────────────▼──────────────────────┐
│         Preload Script                │
│                                      │
│  ✅ contextBridge.exposeInMainWorld  │
│  ✅ Limited API surface              │
└───────────────┬──────────────────────┘
                │
┌───────────────▼──────────────────────┐
│        Main Process (Node.js)        │
│                                      │
│  ✅ Full system access               │
│  ✅ File system, audio, etc.         │
└──────────────────────────────────────┘
```

## Build Pipeline

```
Development:
    Vite Dev Server (Port 5173)
            │
            ├──► Hot Module Replacement
            │
            └──► Electron loads from http://localhost:5173

Production:
    npm run electron:build
            │
            ├──► TypeScript compilation
            │
            ├──► Vite build (dist/)
            │
            ├──► Electron main build (dist-electron/)
            │
            └──► electron-builder
                    │
                    ├──► Windows: .exe
                    ├──► macOS: .dmg
                    └──► Linux: .AppImage, .deb
```

## Performance Optimizations

### 1. State Management
- Zustand uses subscription model (no Context API overhead)
- Selective re-renders with selectors
- Persistence without performance cost

### 2. Rendering
- Framer Motion for GPU-accelerated animations
- Virtual scrolling ready for large transcripts
- Memoized components where needed

### 3. Build
- Vite for instant dev server start
- Code splitting by route
- Tree shaking enabled
- Minification in production

### 4. IPC
- Batched messages when possible
- Async handlers (no blocking)
- Structured cloning for data transfer

## Deployment Architecture

```
User's Machine
    │
    └──► FOMO App (Electron)
            │
            ├──► Local State (localStorage)
            │
            ├──► HTTP/WS ──────► Backend Server
            │                         │
            │                         ├──► PostgreSQL
            │                         ├──► Redis (cache)
            │                         └──► ML Models
            │
            └──► HTTPS ───────► GitHub API
                                      │
                                      └──► User's Repositories
```

## Technology Choices Rationale

| Technology | Why Chosen |
|-----------|-----------|
| **Electron** | Cross-platform desktop, system access |
| **Vite** | Fastest dev experience, official React support |
| **Zustand** | Minimal boilerplate, excellent performance |
| **Framer Motion** | Best-in-class animations, declarative API |
| **Tailwind** | Rapid development, consistent design |
| **TypeScript** | Type safety, better DX, fewer bugs |
| **Lucide Icons** | Modern, consistent, tree-shakeable |
| **Axios** | Better error handling than fetch |

## Extensibility Points

### Adding New Features
1. **New Route**: Add to `Route` type, create view component
2. **New Store**: Create in `stores/`, use in components
3. **New Service**: Add to `services/`, use in hooks
4. **New Component**: Add to `components/`, export from index

### Plugin System (Future)
```typescript
interface Plugin {
  name: string;
  init: (app: App) => void;
  hooks: {
    onMeetingStart?: () => void;
    onTranscriptSegment?: (segment: TranscriptSegment) => void;
    onActionItem?: (item: ActionItem) => void;
  };
}
```

---

**This architecture provides:**
- ✅ Separation of concerns
- ✅ Testability
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Performance
