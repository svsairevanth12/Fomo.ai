# FOMO Backend

AI-Powered Meeting Assistant Backend with AssemblyAI and Anthropic Claude

## Features

- 🎤 **AssemblyAI Integration** - Real-time transcription with speaker diarization
- 🤖 **Anthropic Claude** - AI-powered analysis, summaries, and action items
- 💾 **JSON Storage** - Simple file-based data persistence
- 🔌 **WebSocket Support** - Real-time updates to frontend
- 🔐 **API Key Management** - Configure keys from frontend

## Installation

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Configuration

Create `.env` file or configure API keys from frontend:

```env
ASSEMBLYAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## Running

```bash
python app.py
```

Server runs on: `http://localhost:5000`

## API Endpoints

### Configuration
- `POST /api/config` - Set API keys from frontend

### Meetings
- `GET /api/meetings` - List all meetings
- `POST /api/meetings` - Create new meeting
- `POST /api/meetings/<id>/transcribe` - Transcribe audio file
- `POST /api/meetings/<id>/analyze` - Analyze with Claude AI

### Action Items
- `POST /api/meetings/<id>/action-items/<item_id>/approve` - Approve action item
- `POST /api/meetings/<id>/github-issues` - Create GitHub issues

### WebSocket Events
- `connect` - Client connection
- `start_transcription` - Start real-time transcription
- `audio_data` - Send audio chunks
- `stop_transcription` - Stop transcription

## Data Storage

Meetings are stored in `data/` directory as JSON files:
- `meeting_<id>.json` - Meeting data
- `<meeting_id>_audio.wav` - Audio recording

## API Keys

Get your API keys:
- **AssemblyAI**: https://www.assemblyai.com/
- **Anthropic Claude**: https://www.anthropic.com/

## Features

### AssemblyAI Features Used:
- Speaker diarization (who said what)
- Auto chapters
- Entity detection
- Sentiment analysis
- Real-time transcription (WebSocket)

### Anthropic Claude Features:
- Meeting summarization
- Action item extraction
- Task prioritization
- Context understanding
- JSON structured output

## Example Usage

```python
# Configure API keys
POST /api/config
{
  "assemblyai_key": "xxx",
  "anthropic_key": "xxx"
}

# Create meeting
POST /api/meetings
{
  "title": "Team Standup"
}

# Transcribe
POST /api/meetings/<id>/transcribe
(multipart/form-data with audio file)

# Analyze with AI
POST /api/meetings/<id>/analyze

# Approve action item
POST /api/meetings/<id>/action-items/<item_id>/approve
```

## Development

```bash
# Run with hot reload
FLASK_DEBUG=True python app.py

# Test endpoints
curl http://localhost:5000/health
```

## Production

For production, use a proper WSGI server:

```bash
pip install gunicorn
gunicorn -k eventlet -w 1 app:app
```

## License

MIT
