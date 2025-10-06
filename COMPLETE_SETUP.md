# 🚀 FOMO - Complete Setup Guide

## What's New!

I've completely redesigned FOMO with:

✨ **Improved UI/UX**
- Professional Dashboard with meeting creation
- Better layout structure
- Improved icon positions
- Meeting management interface

🤖 **Full Python Backend**
- AssemblyAI for transcription
- Anthropic Claude for AI analysis
- Real-time WebSocket support
- JSON file-based storage

🔐 **API Key Management**
- Configure keys from frontend
- Secure storage in localStorage
- No hardcoded credentials

✅ **Approval Flow**
- Review AI-generated action items
- Approve before creating GitHub issues
- Edit and refine AI suggestions

---

## 📋 Prerequisites

### 1. Fix Node.js PATH (Windows)
```
1. Press Windows + R
2. Type: sysdm.cpl
3. Advanced → Environment Variables
4. Edit "Path" → Add: C:\Program Files\nodejs\
5. Restart terminal
```

### 2. Install Python 3.8+
Download from: https://www.python.org/downloads/

### 3. Get API Keys

**AssemblyAI** (For transcription):
- Sign up: https://www.assemblyai.com/
- Get API key from dashboard
- Free tier available!

**Anthropic Claude** (For AI):
- Sign up: https://www.anthropic.com/
- Get API key from console
- Pay-as-you-go pricing

---

## 🎯 Installation

### Step 1: Install Frontend Dependencies

```bash
cd C:\Users\Venkata\Desktop\fomo
npm install
```

### Step 2: Install Backend Dependencies

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

---

## 🚀 Running the Application

### Terminal 1: Start Backend

```bash
cd backend
venv\Scripts\activate  # Windows
python app.py
```

You should see:
```
🚀 FOMO Backend Starting...
📍 API: http://localhost:5000
🔌 WebSocket: ws://localhost:5000
```

### Terminal 2: Start Frontend

```bash
cd C:\Users\Venkata\Desktop\fomo
npm run electron:dev
```

The Electron app will open!

---

## 🔑 First-Time Setup

### 1. Open Settings

Click the ⚙️ icon in the sidebar

### 2. Enter API Keys

- **AssemblyAI API Key**: Your key from AssemblyAI dashboard
- **Anthropic API Key**: Your key from Anthropic console
- **GitHub Token** (Optional): For creating issues

Click **Save Configuration**

---

## 📖 How to Use

### Creating a Meeting

1. Click **"New Meeting"** on Dashboard
2. Enter a meeting title (e.g., "Team Standup - Jan 15")
3. Click **Start**

### Recording

1. Click the microphone button to start recording
2. Speak into your microphone
3. Real-time transcription will appear (if AssemblyAI configured)
4. Click stop when done

### AI Analysis

After recording:
1. Backend transcribes audio with AssemblyAI
2. Claude analyzes transcript
3. Generates:
   - Meeting summary
   - Action items
   - Next steps
   - Task priorities

### Reviewing Action Items

1. View generated action items in right panel
2. Review each item
3. Edit text if needed
4. Click **"Approve"** to confirm
5. Click **"Create Issue"** to make GitHub issue

### Meeting History

1. Click 📋 icon in sidebar
2. View all past meetings
3. Click meeting to see details
4. Export transcripts
5. Re-analyze if needed

---

## 🎨 UI Features

### Dashboard
- Quick access to create meetings
- Recent meetings overview
- Statistics and insights

### Live Meeting View
- Real-time transcript feed
- Speaker identification
- Action items panel
- Recording controls

### Settings
- API key configuration
- Audio device selection
- GitHub integration
- Export preferences

---

## 🔌 Backend API

### Endpoints

```
POST /api/config
- Configure API keys

GET /api/meetings
- List all meetings

POST /api/meetings
- Create new meeting

POST /api/meetings/<id>/transcribe
- Transcribe audio file

POST /api/meetings/<id>/analyze
- Analyze with Claude AI

POST /api/meetings/<id>/action-items/<item_id>/approve
- Approve action item

POST /api/meetings/<id>/github-issues
- Create GitHub issues
```

### WebSocket Events

```
connect - Client connected
start_transcription - Begin real-time transcription
audio_data - Send audio chunks
stop_transcription - End transcription
```

---

## 📁 Data Storage

### Frontend (localStorage)
```
- Meeting list
- User settings
- API keys (encrypted)
- UI preferences
```

### Backend (JSON files)
```
backend/data/
├── meeting_<id>.json        # Meeting metadata
├── <meeting_id>_audio.wav   # Audio recording
└── ...
```

---

## 🎯 Workflow Example

### 1. Create Meeting
```
Dashboard → New Meeting → Enter "Team Standup" → Start
```

### 2. Record
```
Click Mic → Speak → Stop Recording
```

### 3. Backend Process
```
✓ Upload audio to backend
✓ AssemblyAI transcribes with speaker labels
✓ Claude analyzes for action items
✓ Results sent back to frontend
```

### 4. Review
```
✓ Read AI-generated summary
✓ Review action items
✓ Edit/approve items
✓ Create GitHub issues
```

### 5. Save
```
✓ Meeting saved to localStorage
✓ Transcript exported
✓ Ready for next meeting
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend won't connect
```
1. Check backend is running on port 5000
2. Check CORS is enabled
3. Check API keys are configured
```

### Transcription not working
```
1. Verify AssemblyAI API key
2. Check audio file format (WAV, MP3 supported)
3. Check backend logs for errors
```

### AI analysis fails
```
1. Verify Anthropic API key
2. Check you have credits
3. Check transcript has content
```

---

## 💡 Tips & Tricks

### Better Transcriptions
- Use good quality microphone
- Minimize background noise
- Speak clearly
- Use speaker names in conversation

### Better AI Analysis
- Longer meetings = better context
- Clear action items in speech
- Mention names for assignees
- Explicit decisions help

### GitHub Integration
- Configure default repository in settings
- Use consistent label templates
- Review issues before creating
- Add assignees manually if needed

---

## 📊 Features Summary

### Frontend
✅ Dashboard with meeting creation
✅ Live meeting view
✅ Real-time transcript display
✅ Action items panel with approval
✅ Meeting history
✅ Settings management
✅ API key configuration
✅ localStorage persistence

### Backend
✅ Flask REST API
✅ WebSocket support
✅ AssemblyAI integration
✅ Anthropic Claude integration
✅ JSON file storage
✅ Speaker diarization
✅ AI-powered analysis
✅ Action item extraction

---

## 🚀 Next Steps

1. ✅ Install dependencies
2. ✅ Start backend
3. ✅ Start frontend
4. ✅ Configure API keys
5. ✅ Create first meeting
6. ✅ Test transcription
7. ✅ Review AI analysis
8. ✅ Create GitHub issues

---

## 📚 Additional Resources

- AssemblyAI Docs: https://www.assemblyai.com/docs
- Anthropic Docs: https://docs.anthropic.com/
- Flask Docs: https://flask.palletsprojects.com/
- React Docs: https://react.dev/

---

## 🎉 You're All Set!

Run these commands:

```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python app.py

# Terminal 2 - Frontend
npm run electron:dev
```

**Enjoy your AI-powered meeting assistant!** 🎤🤖

---

Built with:
- Electron 34
- React 18.3
- Python 3.x
- AssemblyAI
- Anthropic Claude
- Flask
- WebSockets
