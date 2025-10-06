"""
FOMO Backend - AI-Powered Meeting Assistant
Uses AssemblyAI for transcription and Anthropic Claude for AI features
Python-based audio capture with chunked processing
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import anthropic
import assemblyai as aai
from dotenv import load_dotenv
import threading
from audio_capture import get_audio_service

load_dotenv()

app = Flask(__name__)
CORS(app)

# Storage (using JSON files as simple database)
DATA_DIR = 'data'
os.makedirs(DATA_DIR, exist_ok=True)

# Global clients (will be initialized with API keys from frontend)
anthropic_client = None
aai_client = None

# Audio capture service
audio_service = get_audio_service()

def save_meeting(meeting_data):
    """Save meeting to JSON file"""
    meeting_id = meeting_data['id']
    filepath = os.path.join(DATA_DIR, f'meeting_{meeting_id}.json')
    with open(filepath, 'w') as f:
        json.dump(meeting_data, f, indent=2)
    return meeting_data

def load_meeting(meeting_id):
    """Load meeting from JSON file"""
    filepath = os.path.join(DATA_DIR, f'meeting_{meeting_id}.json')
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return None

def list_meetings():
    """List all meetings"""
    meetings = []
    for filename in os.listdir(DATA_DIR):
        if filename.startswith('meeting_') and filename.endswith('.json'):
            filepath = os.path.join(DATA_DIR, filename)
            with open(filepath, 'r') as f:
                meetings.append(json.load(f))
    return sorted(meetings, key=lambda x: x['startTime'], reverse=True)


# ============ API Routes ============

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'services': {
            'assemblyai': aai_client is not None,
            'anthropic': anthropic_client is not None
        }
    })


@app.route('/api/config', methods=['POST'])
def set_config():
    """Set API keys from frontend"""
    global anthropic_client, aai_client

    data = request.json
    assemblyai_key = data.get('assemblyai_key')
    anthropic_key = data.get('anthropic_key')

    if assemblyai_key:
        aai.settings.api_key = assemblyai_key
        aai_client = aai

    if anthropic_key:
        anthropic_client = anthropic.Anthropic(api_key=anthropic_key)

    return jsonify({'success': True, 'message': 'API keys configured'})


@app.route('/api/meetings', methods=['GET'])
def get_meetings():
    """Get all meetings"""
    try:
        meetings = list_meetings()
        return jsonify({'success': True, 'data': meetings})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/meetings/<meeting_id>', methods=['GET'])
def get_meeting(meeting_id):
    """Get a specific meeting"""
    try:
        meeting = load_meeting(meeting_id)
        if not meeting:
            return jsonify({'success': False, 'error': 'Meeting not found'}), 404
        return jsonify({'success': True, 'data': meeting})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/meetings', methods=['POST'])
def create_meeting():
    """Create a new meeting"""
    try:
        data = request.json
        meeting_id = data.get('id', f"meeting_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        meeting_data = {
            'id': meeting_id,
            'title': data.get('title', 'Untitled Meeting'),
            'startTime': datetime.now().isoformat(),
            'endTime': None,
            'duration': 0,
            'status': 'recording',
            'transcript': [],
            'actionItems': [],
            'summary': None,
            'audioFile': None,
            'chunksProcessed': 0
        }
        save_meeting(meeting_data)
        return jsonify({'success': True, 'data': meeting_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


def process_audio_chunk(chunk_path: str, chunk_index: int, meeting_id: str):
    """
    Process audio chunk: transcribe and analyze
    Called automatically when a chunk is ready
    """
    if not aai_client:
        print(f"[Backend] AssemblyAI not configured, skipping chunk {chunk_index}")
        return

    try:
        print(f"[Backend] Processing chunk {chunk_index} for meeting {meeting_id}...")

        # Transcribe with AssemblyAI
        config = aai.TranscriptionConfig(
            speaker_labels=True,
            language_detection=True
        )

        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(chunk_path, config=config)

        # Convert to our format
        segments = []
        if transcript.utterances:
            for i, utterance in enumerate(transcript.utterances):
                segments.append({
                    'id': f'seg_{meeting_id}_{chunk_index}_{i}',
                    'speaker': f'Speaker {utterance.speaker}',
                    'text': utterance.text,
                    'startTime': utterance.start / 1000,  # Convert to seconds
                    'endTime': utterance.end / 1000,
                    'confidence': utterance.confidence,
                    'timestamp': utterance.start / 1000
                })

        # Load meeting and append segments
        meeting = load_meeting(meeting_id)
        if meeting:
            if 'transcript' not in meeting:
                meeting['transcript'] = []
            meeting['transcript'].extend(segments)
            save_meeting(meeting)

        print(f"[Backend] Chunk {chunk_index} transcribed: {len(segments)} segments")

        # Clean up chunk file after processing
        try:
            os.remove(chunk_path)
        except:
            pass

    except Exception as e:
        print(f"[Backend] Error processing chunk {chunk_index}: {e}")


@app.route('/api/audio/start', methods=['POST'])
def start_audio_capture():
    """Start Python-based audio capture"""
    try:
        data = request.json
        meeting_id = data.get('meetingId')

        if not meeting_id:
            return jsonify({'success': False, 'error': 'Meeting ID required'}), 400

        # Start audio capture with callback
        audio_service.start_recording(
            meeting_id=meeting_id,
            chunk_callback=lambda path, idx, mid: threading.Thread(
                target=process_audio_chunk,
                args=(path, idx, mid),
                daemon=True
            ).start()
        )

        return jsonify({
            'success': True,
            'message': 'Audio capture started',
            'meeting_id': meeting_id
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/audio/stop', methods=['POST'])
def stop_audio_capture():
    """Stop Python-based audio capture"""
    try:
        summary = audio_service.stop_recording()

        # Trigger final analysis if meeting exists
        if summary.get('meeting_id'):
            meeting = load_meeting(summary['meeting_id'])
            if meeting and len(meeting.get('transcript', [])) > 0:
                # Analyze meeting in background
                threading.Thread(
                    target=analyze_meeting_background,
                    args=(summary['meeting_id'],),
                    daemon=True
                ).start()

        return jsonify(summary)

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/audio/status', methods=['GET'])
def get_audio_status():
    """Get current audio capture status"""
    try:
        status = audio_service.get_status()
        return jsonify({'success': True, 'data': status})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/audio/devices', methods=['GET'])
def list_audio_devices():
    """List available audio devices"""
    try:
        from audio_capture import AudioCaptureService
        devices = AudioCaptureService.list_audio_devices()
        return jsonify({'success': True, 'data': devices})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/audio/test', methods=['POST'])
def test_audio_capture():
    """Test audio capture for a few seconds"""
    try:
        data = request.json or {}
        duration = data.get('duration', 5)

        from audio_capture import AudioCaptureService
        result = AudioCaptureService.test_audio_capture(duration)

        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


def analyze_meeting_background(meeting_id: str):
    """Analyze meeting in background thread"""
    try:
        if not anthropic_client:
            print(f"[Backend] Anthropic not configured, skipping analysis")
            return

        meeting = load_meeting(meeting_id)
        if not meeting or len(meeting.get('transcript', [])) == 0:
            return

        # Build transcript text
        transcript_text = "\n\n".join([
            f"{seg['speaker']} ({seg['startTime']}s): {seg['text']}"
            for seg in meeting['transcript']
        ])

        # Analyze with Claude
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": f"""Analyze this meeting transcript and extract:

1. **Action Items**: Tasks that need to be done
2. **Summary**: Key points and decisions
3. **Next Steps**: What should happen next

Format as JSON with this structure:
{{
  "actionItems": [
    {{
      "text": "Task description",
      "assignee": "Person name or null",
      "priority": "high" | "medium" | "low",
      "context": "Relevant conversation context"
    }}
  ],
  "summary": {{
    "overview": "Brief summary",
    "keyDecisions": ["Decision 1", "Decision 2"],
    "nextSteps": ["Step 1", "Step 2"],
    "blockers": ["Blocker 1"],
    "topics": ["Topic 1", "Topic 2"]
  }}
}}

TRANSCRIPT:
{transcript_text}
"""
            }]
        )

        # Parse Claude's response
        response_text = message.content[0].text

        # Extract JSON from response
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        analysis = json.loads(response_text[json_start:json_end])

        # Add IDs and timestamps to action items
        for i, item in enumerate(analysis['actionItems']):
            item['id'] = f'action_{meeting_id}_{i}'
            item['meetingId'] = meeting_id
            item['status'] = 'pending'
            item['timestamp'] = datetime.now().isoformat()

        meeting['actionItems'] = analysis['actionItems']
        meeting['summary'] = analysis['summary']
        meeting['status'] = 'completed'
        save_meeting(meeting)

        print(f"[Backend] Meeting {meeting_id} analyzed successfully")

    except Exception as e:
        print(f"[Backend] Error analyzing meeting: {e}")


@app.route('/api/meetings/<meeting_id>/analyze', methods=['POST'])
def analyze_meeting(meeting_id):
    """Analyze meeting with Anthropic Claude to extract action items and summary"""
    if not anthropic_client:
        return jsonify({'success': False, 'error': 'Anthropic not configured'}), 400

    try:
        meeting = load_meeting(meeting_id)
        if not meeting:
            return jsonify({'success': False, 'error': 'Meeting not found'}), 404

        # Build transcript text
        transcript_text = "\n\n".join([
            f"{seg['speaker']} ({seg['startTime']}s): {seg['text']}"
            for seg in meeting['transcript']
        ])

        # Analyze with Claude
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": f"""Analyze this meeting transcript and extract:

1. **Action Items**: Tasks that need to be done
2. **Summary**: Key points and decisions
3. **Next Steps**: What should happen next

Format as JSON with this structure:
{{
  "actionItems": [
    {{
      "text": "Task description",
      "assignee": "Person name or null",
      "priority": "high" | "medium" | "low",
      "context": "Relevant conversation context"
    }}
  ],
  "summary": {{
    "overview": "Brief summary",
    "keyPoints": ["Point 1", "Point 2"],
    "decisions": ["Decision 1", "Decision 2"],
    "blockers": ["Blocker 1"]
  }},
  "nextSteps": ["Step 1", "Step 2"]
}}

TRANSCRIPT:
{transcript_text}
"""
            }]
        )

        # Parse Claude's response
        response_text = message.content[0].text

        # Extract JSON from response (Claude might wrap it in markdown)
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        analysis = json.loads(response_text[json_start:json_end])

        # Add IDs and timestamps to action items
        for i, item in enumerate(analysis['actionItems']):
            item['id'] = f'action_{meeting_id}_{i}'
            item['meetingId'] = meeting_id
            item['status'] = 'pending'
            item['timestamp'] = datetime.now().isoformat()

        meeting['actionItems'] = analysis['actionItems']
        meeting['summary'] = analysis['summary']
        meeting['nextSteps'] = analysis.get('nextSteps', [])
        meeting['status'] = 'analyzed'
        save_meeting(meeting)

        return jsonify({'success': True, 'data': meeting})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/meetings/<meeting_id>/action-items/<item_id>/approve', methods=['POST'])
def approve_action_item(meeting_id, item_id):
    """Approve an action item (user reviewed)"""
    try:
        meeting = load_meeting(meeting_id)
        if not meeting:
            return jsonify({'success': False, 'error': 'Meeting not found'}), 404

        # Find and update action item
        for item in meeting['actionItems']:
            if item['id'] == item_id:
                item['status'] = 'approved'
                item['approvedAt'] = datetime.now().isoformat()
                break

        save_meeting(meeting)
        return jsonify({'success': True, 'data': meeting})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/meetings/<meeting_id>/github-issues', methods=['POST'])
def create_github_issues(meeting_id):
    """Create GitHub issues from approved action items"""
    try:
        meeting = load_meeting(meeting_id)
        if not meeting:
            return jsonify({'success': False, 'error': 'Meeting not found'}), 404

        data = request.json
        github_token = data.get('github_token')
        repo = data.get('repo')

        # This would integrate with GitHub API
        # For now, just mark items as created
        created_issues = []
        for item in meeting['actionItems']:
            if item['status'] == 'approved':
                item['status'] = 'created'
                item['githubIssue'] = {
                    'number': len(created_issues) + 1,
                    'url': f'https://github.com/{repo}/issues/{len(created_issues) + 1}',
                    'repository': repo
                }
                created_issues.append(item)

        save_meeting(meeting)
        return jsonify({'success': True, 'data': created_issues})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============ WebSocket Removed ============
# Real-time transcription removed in favor of chunked batch processing
# Audio is recorded in 2-minute chunks and transcribed via REST API


if __name__ == '__main__':
    print("=" * 60)
    print("FOMO Backend Starting...")
    print("=" * 60)
    print("API: http://localhost:5000")
    print("Mode: Chunked audio processing (2-minute segments)")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
