"""
FOMO Backend - AI-Powered Meeting Assistant
Uses AssemblyAI for transcription and Anthropic Claude for AI features
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import json
from datetime import datetime
import anthropic
import assemblyai as aai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Storage (using JSON files as simple database)
DATA_DIR = 'data'
os.makedirs(DATA_DIR, exist_ok=True)

# Global clients (will be initialized with API keys from frontend)
anthropic_client = None
aai_client = None

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


@app.route('/api/meetings', methods=['POST'])
def create_meeting():
    """Create a new meeting"""
    try:
        data = request.json
        meeting_data = {
            'id': f"meeting_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'title': data.get('title', 'Untitled Meeting'),
            'startTime': datetime.now().isoformat(),
            'endTime': None,
            'duration': 0,
            'status': 'created',
            'transcript': [],
            'actionItems': [],
            'summary': None,
            'audioFile': None
        }
        save_meeting(meeting_data)
        return jsonify({'success': True, 'data': meeting_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/meetings/<meeting_id>/transcribe', methods=['POST'])
def transcribe_meeting(meeting_id):
    """Transcribe audio file using AssemblyAI"""
    if not aai_client:
        return jsonify({'success': False, 'error': 'AssemblyAI not configured'}), 400

    try:
        meeting = load_meeting(meeting_id)
        if not meeting:
            return jsonify({'success': False, 'error': 'Meeting not found'}), 404

        # Get audio file from request
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        audio_path = os.path.join(DATA_DIR, f'{meeting_id}_audio.wav')
        audio_file.save(audio_path)

        # Transcribe with AssemblyAI
        config = aai.TranscriptionConfig(
            speaker_labels=True,
            auto_chapters=True,
            entity_detection=True,
            sentiment_analysis=True
        )

        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(audio_path, config=config)

        # Convert to our format
        segments = []
        for utterance in transcript.utterances:
            segments.append({
                'id': f'seg_{len(segments)}',
                'speaker': f'Speaker {utterance.speaker}',
                'text': utterance.text,
                'startTime': utterance.start,
                'endTime': utterance.end,
                'confidence': utterance.confidence,
                'timestamp': utterance.start
            })

        meeting['transcript'] = segments
        meeting['status'] = 'transcribed'
        meeting['audioFile'] = audio_path
        save_meeting(meeting)

        return jsonify({'success': True, 'data': meeting})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


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


# ============ WebSocket for Real-Time Transcription ============

@socketio.on('connect')
def handle_connect():
    """Client connected"""
    print('Client connected')
    emit('connected', {'status': 'ready'})


@socketio.on('start_transcription')
def handle_start_transcription(data):
    """Start real-time transcription"""
    if not aai_client:
        emit('error', {'message': 'AssemblyAI not configured'})
        return

    meeting_id = data.get('meeting_id')
    emit('transcription_started', {'meeting_id': meeting_id})


@socketio.on('audio_data')
def handle_audio_data(data):
    """Receive audio data for real-time transcription"""
    # This would process audio chunks with AssemblyAI real-time API
    # For now, emit mock data
    pass


@socketio.on('stop_transcription')
def handle_stop_transcription(data):
    """Stop real-time transcription"""
    meeting_id = data.get('meeting_id')
    emit('transcription_stopped', {'meeting_id': meeting_id})


if __name__ == '__main__':
    print("FOMO Backend Starting...")
    print("API: http://localhost:5000")
    print("WebSocket: ws://localhost:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
