# FOMO - AI-Powered Meeting Assistant

---

## 💡 Inspiration

We've all been in meetings where important details slip through the cracks. Action items get forgotten, decisions aren't documented, and hours of discussion vanish into thin air. We built FOMO to solve this - a brutally simple, AI-powered meeting assistant that captures everything so you never miss out (Fear Of Missing Out).

---

## 🎯 What it does

FOMO is a desktop app that records meetings, transcribes them in real-time, and extracts action items automatically using AI.

**Key Features:**
- 🎙️ **System Audio Capture** - Records your meetings (Zoom, Teams, Google Meet)
- 📝 **Smart Transcription** - Converts speech to text with speaker identification
- 🤖 **AI Action Items** - Automatically detects and extracts tasks
- 📊 **Meeting Summaries** - Generates key decisions, next steps, and blockers
- 📥 **Export & Share** - Download as Markdown, JSON, or Plain Text
- 🎨 **Brutalist Design** - Clean, minimal, black & white interface

---

## 🛠️ How we built it

**Tech Stack:**
- **Frontend:** Electron + React + TypeScript + Tailwind CSS
- **State:** Zustand for state management
- **Backend:** Flask (Python) REST API
- **AI:** AssemblyAI for transcription, Anthropic Claude for analysis
- **Storage:** IndexedDB for audio chunks, LocalStorage for meetings

**Architecture:**
1. Capture system audio in 2-minute chunks
2. Store chunks locally in IndexedDB
3. Upload to backend for transcription
4. Process with AssemblyAI (speaker labels)
5. Analyze with Claude AI (action items, summary)
6. Display in real-time UI

**Why Chunked Processing?**
- Lightweight - no memory buildup
- Resilient - chunks saved locally
- Scalable - handles long meetings
- Simple - no WebSocket complexity

---

## 🚧 Challenges we ran into

**1. System Audio Capture**
- Browser APIs limited to tab audio initially
- Solution: Used `getDisplayMedia()` with audio sharing option

**2. Real-time vs Batch Processing**
- WebSocket real-time was complex and resource-heavy
- Solution: Switched to 2-minute chunked batch processing

**3. Transcript Display Bug**
- View buttons weren't connected to any handlers
- Solution: Built MeetingDetail component with proper navigation

**4. Flask-SocketIO Dependency**
- Import errors after removing WebSocket
- Solution: Cleaned up dependencies and updated requirements.txt

**5. Export Functionality**
- Buttons were just UI placeholders
- Solution: Implemented full export system with 3 formats

---

## 🏆 Accomplishments that we're proud of

✅ **Working System Audio Capture** - Records any meeting app  
✅ **Chunked Architecture** - Lightweight and scalable  
✅ **AI Integration** - AssemblyAI + Claude working together  
✅ **Professional UI** - Brutalist design that's clean and functional  
✅ **Export System** - 3 formats (Markdown, JSON, Text)  
✅ **Share Features** - Copy to clipboard, email integration  
✅ **Test Data** - Mock data for easy testing  
✅ **Complete Documentation** - 5 comprehensive guides  

---

## 📚 What we learned

**Technical:**
- Web Audio API and MediaRecorder capabilities
- IndexedDB for client-side storage
- Chunked processing vs real-time streaming
- Electron desktop app development
- AI API integration (AssemblyAI, Claude)

**Design:**
- Brutalist design principles
- User feedback importance (loading states, success messages)
- Click-outside patterns for dropdowns
- Keyboard shortcuts for power users

**Architecture:**
- Sometimes simpler is better (batch vs real-time)
- Local-first approach for reliability
- Proper error handling and user feedback
- Importance of test data for development

---

## 🚀 What's next for FOMO

**Immediate:**
- 🔊 Audio playback with transcript sync
- 🔍 Search within transcripts
- 📱 Mobile companion app
- 🌐 Web version

**Integrations:**
- 💬 Slack - Post summaries to channels
- 🐙 GitHub - Auto-create issues from action items
- 📧 Email - Send summaries automatically
- 📅 Calendar - Attach notes to events

**AI Enhancements:**
- 🎯 Smart highlights - Key moments detection
- 📊 Sentiment analysis - Track meeting mood
- 🗣️ Speaker analytics - Talk time, interruptions
- 🔮 Predictive insights - Suggest follow-ups

**Enterprise:**
- 👥 Team workspaces
- 🔐 SSO authentication
- 📈 Analytics dashboard
- 🏢 On-premise deployment

---

## 🎯 Vision

**Make every meeting count.**

FOMO ensures no important detail is ever lost. Whether it's a quick standup or a critical client call, FOMO captures, transcribes, and analyzes everything - so you can focus on the conversation, not taking notes.

---

**Built with ❤️ using Electron, React, Flask, AssemblyAI, and Claude AI**

---



