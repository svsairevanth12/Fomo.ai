# FOMO Backend

AI-Powered Meeting Assistant Backend with AssemblyAI and Anthropic Claude

## Features

- 🎤 **AssemblyAI Integration** - Real-time transcription with speaker diarization
- 🤖 **Anthropic Claude** - AI-powered analysis, summaries, and action items
- 💾 **JSON Storage** - Simple file-based data persistence
- 🔊 **System Audio Capture** - Cross-platform loopback recording with chunk processing
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

## System Audio Capture

The backend records system/loopback audio using the [sounddevice](https://python-sounddevice.readthedocs.io/) 
PortAudio bindings with an optional [soundcard](https://github.com/bastibe/SoundCard) fallback. Chunks are 
written to the `data/` directory and streamed to AssemblyAI for transcription.

### Supported platforms

- **Windows 10/11** – WASAPI loopback devices are discovered automatically. Optional virtual cable drivers
  (VB-CABLE, VoiceMeeter) also work if selected as the default output device.
- **macOS 12+** – Install a virtual audio driver such as [BlackHole](https://github.com/ExistentialAudio/BlackHole):
  `brew install blackhole-2ch`. Select the BlackHole (or Loopback/Background Music) device as the system output or create an Aggregate Device.
- **Linux (PulseAudio/PipeWire)** – Use the monitor source for your output sink (e.g. `alsa_output.pci-0000_00_1b.0.analog-stereo.monitor`).
  Verify with `pactl list short sources` and pass the matching device name or index.

### Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `FOMO_AUDIO_DEVICE_NAME` / `FOMO_AUDIO_DEVICE` | Case-insensitive substring of the device name to prefer | automatic detection |
| `FOMO_AUDIO_DEVICE_ID` | Numeric index from `/api/audio/devices` | automatic detection |
| `FOMO_AUDIO_SAMPLE_RATE` | Override the capture sample rate (Hz) | `44100` |
| `FOMO_AUDIO_CHANNELS` | Number of channels to record | `2` |
| `FOMO_AUDIO_CHUNK_SECONDS` | Seconds per chunk written to disk | `120` |
| `FOMO_AUDIO_SEGMENT_SECONDS` | Size of the streaming segment buffer | `1` |
| `FOMO_AUDIO_DATA_DIR` | Directory used for temporary chunk storage | `data/` |
| `FOMO_AUDIO_LOG_LEVEL` | Logging level for the capture service | `INFO` |
| `FOMO_BACKEND_LOG_LEVEL` | Logging level for the Flask API | `INFO` |

### Smoke test

A standalone smoke test script is available to validate loopback capture:

```bash
python -m backend.tests.audio_smoke_test --duration 6
```

Use `--device-id <index>` to target a specific device, or `--allow-missing-device` to succeed when the 
host does not expose any loopback sources (useful for CI environments).

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

### Audio Capture
- `GET /api/audio/status` - Inspect current recorder status and active device
- `GET /api/audio/devices` - Enumerate available loopback/input devices
- `POST /api/audio/start` - Begin recording system audio for a meeting
- `POST /api/audio/pause` / `POST /api/audio/resume` - Pause or resume the active capture
- `POST /api/audio/stop` - Stop recording and finalize the meeting session
- `POST /api/audio/test` - Run the in-process smoke test and return the measured audio level

## Data Storage

Meetings are stored in `data/` directory as JSON files:
- `meeting_<id>.json` – Meeting metadata, transcript, action items, and summaries
- `<meeting_id>_chunk_XXXX_timestamp.wav` – Temporary audio chunks generated during recording (removed after transcription)

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
