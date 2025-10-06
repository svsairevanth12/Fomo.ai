# Pause/Resume & Audio Device Selection Features

**Date:** 2025-10-06  
**Status:** ✅ Implemented and Ready to Use

---

## 🎯 **New Features**

### **1. Pause/Resume Recording**
- Pause recording at any time during a meeting
- Resume recording without losing any data
- Visual feedback when paused (yellow badge + button)
- Seamless integration with chunked recording system

### **2. Audio Device Selection**
- Select which audio device to capture from
- List all available audio devices (input/output/loopback)
- Save device preference to localStorage
- Visual device selector modal with device icons
- Display selected device name during recording

---

## 📦 **Files Modified/Created**

### **Backend:**
- ✅ `backend/audio_capture.py` - Added pause/resume methods
- ✅ `backend/app.py` - Added pause/resume endpoints

### **Frontend:**
- ✅ `src/services/pythonAudioApi.ts` - Added pause/resume/device methods
- ✅ `src/hooks/useMeetingRecorder.ts` - Implemented pause/resume handlers
- ✅ `src/components/meeting/RecordingControl.tsx` - Added device selector & paused badge
- ✅ `src/components/settings/AudioDeviceSelector.tsx` - NEW device selector modal

---

## 🔧 **Backend Implementation**

### **1. AudioCaptureService Updates**

**New Properties:**
```python
self.is_paused = False
self.pause_event = threading.Event()
self.selected_device_id: Optional[int] = None
```

**New Methods:**
```python
def pause_recording(self) -> dict:
    """Pause the current recording"""
    self.is_paused = True
    self.pause_event.clear()  # Signal pause
    return {'success': True, 'status': 'paused'}

def resume_recording(self) -> dict:
    """Resume a paused recording"""
    self.is_paused = False
    self.pause_event.set()  # Signal resume
    return {'success': True, 'status': 'recording'}
```

**Updated start_recording():**
```python
def start_recording(self, meeting_id: str, chunk_callback=None, device_id=None):
    self.selected_device_id = device_id
    # ... rest of implementation
```

**Recording Loop with Pause Support:**
```python
def _record_loop(self):
    while self.is_recording:
        # Wait if paused
        self.pause_event.wait()
        
        # Record in 1-second segments for pause responsiveness
        for i in range(segments_per_chunk):
            self.pause_event.wait()  # Check pause state
            segment_data = mic.record(numframes=frames_per_segment)
            audio_segments.append(segment_data)
        
        # Combine segments into chunk
        audio_data = np.concatenate(audio_segments, axis=0)
```

---

### **2. Flask API Endpoints**

**Pause Recording:**
```python
@app.route('/api/audio/pause', methods=['POST'])
def pause_audio_capture():
    result = audio_service.pause_recording()
    return jsonify(result)
```

**Resume Recording:**
```python
@app.route('/api/audio/resume', methods=['POST'])
def resume_audio_capture():
    result = audio_service.resume_recording()
    return jsonify(result)
```

**Start with Device Selection:**
```python
@app.route('/api/audio/start', methods=['POST'])
def start_audio_capture():
    data = request.json
    meeting_id = data.get('meetingId')
    device_id = data.get('deviceId')  # Optional
    
    audio_service.start_recording(
        meeting_id=meeting_id,
        device_id=device_id,
        chunk_callback=...
    )
```

---

## 🎨 **Frontend Implementation**

### **1. PythonAudioAPI Updates**

**New Methods:**
```typescript
static async pauseCapture(): Promise<{success: boolean; status?: string}>
static async resumeCapture(): Promise<{success: boolean; status?: string}>
static async startCapture(meetingId: string, deviceId?: number)
```

**Updated AudioStatus Interface:**
```typescript
interface AudioStatus {
  is_recording: boolean;
  is_paused: boolean;  // NEW
  meeting_id: string | null;
  current_chunk: number;
  chunk_duration: number;
  selected_device_id: number | null;  // NEW
}
```

---

### **2. useMeetingRecorder Hook**

**Pause Handler:**
```typescript
const handlePause = useCallback(async () => {
  // Pause Python audio capture
  const result = await PythonAudioAPI.pauseCapture();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to pause recording');
  }
  
  // Update local state
  pauseMeeting();
  await api.pauseRecording(currentMeeting.id);
}, [currentMeeting, pauseMeeting]);
```

**Resume Handler:**
```typescript
const handleResume = useCallback(async () => {
  // Resume Python audio capture
  const result = await PythonAudioAPI.resumeCapture();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to resume recording');
  }
  
  // Update local state
  resumeMeeting();
  await api.resumeRecording(currentMeeting.id);
}, [currentMeeting, resumeMeeting]);
```

**Start with Device Selection:**
```typescript
const handleStart = useCallback(async () => {
  // Get selected device from localStorage
  const selectedDeviceId = localStorage.getItem('selectedAudioDevice');
  const deviceId = selectedDeviceId ? parseInt(selectedDeviceId, 10) : undefined;
  
  // Start Python audio capture with selected device
  const result = await PythonAudioAPI.startCapture(meetingId, deviceId);
}, []);
```

---

### **3. AudioDeviceSelector Component**

**Features:**
- Modal dialog with device list
- Device icons (Speaker for output, Mic for input)
- Device type labels (System Audio, Input Device, Output Device)
- Selected device highlighting
- Save to localStorage
- Refresh devices button
- Use default device option

**Usage:**
```tsx
<AudioDeviceSelector
  isOpen={showDeviceSelector}
  onClose={() => setShowDeviceSelector(false)}
  onDeviceSelected={(deviceId) => {
    // Device selected and saved
    loadSelectedDeviceName();
  }}
/>
```

**Device Display:**
```tsx
{devices.map((device) => (
  <button
    onClick={() => handleSelectDevice(device.id)}
    className={selectedDeviceId === device.id ? 'selected' : ''}
  >
    {getDeviceIcon(device)}
    <div>
      <p>{device.name}</p>
      <p>{getDeviceTypeLabel(device)}</p>
    </div>
  </button>
))}
```

---

### **4. RecordingControl Component Updates**

**Device Selector Button (Before Recording):**
```tsx
{!isRecording && (
  <button onClick={() => setShowDeviceSelector(true)}>
    <Speaker /> {selectedDeviceName} <Settings />
  </button>
)}
```

**Selected Device Display (During Recording):**
```tsx
{isRecording && (
  <div className="text-xs text-gray-500">
    <Speaker /> {selectedDeviceName}
  </div>
)}
```

**Paused Badge:**
```tsx
{isRecording && isPaused && (
  <div className="absolute -top-6 bg-yellow-500 text-black">
    PAUSED
  </div>
)}
```

**Recording Button with Paused State:**
```tsx
<button
  className={`
    ${isRecording && !isPaused ? 'bg-white border-white' : ''}
    ${isRecording && isPaused ? 'bg-yellow-500 border-yellow-500' : ''}
    ${!isRecording ? 'bg-black border-white' : ''}
  `}
>
  {isRecording ? <Square /> : <Play />}
</button>
```

---

## 🚀 **How to Use**

### **1. Select Audio Device**

**Before Starting Recording:**
1. Click the device selector button (shows current device name)
2. Modal opens with list of available devices
3. Select desired device
4. Click "Save Selection"
5. Device preference saved to localStorage

**Device Types:**
- **System Audio (Loopback)** - Captures all system audio output
- **Output Device** - Speaker/headphone devices
- **Input Device** - Microphone devices

---

### **2. Pause/Resume Recording**

**During Recording:**
1. Click "PAUSE" button
2. Recording pauses (yellow badge appears)
3. Recording button turns yellow
4. Status shows "[ PAUSED ]"
5. Click "RESUME" to continue
6. Recording resumes seamlessly
7. No audio data is lost

**Visual Feedback:**
- **Recording:** White button, pulsing border, "[ RECORDING ]"
- **Paused:** Yellow button, "PAUSED" badge, "[ PAUSED ]"
- **Stopped:** Black button, "[ PRESS TO RECORD ]"

---

## 📊 **API Reference**

### **Backend Endpoints:**

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/audio/start` | Start recording | `{meetingId, deviceId?}` |
| POST | `/api/audio/pause` | Pause recording | None |
| POST | `/api/audio/resume` | Resume recording | None |
| POST | `/api/audio/stop` | Stop recording | None |
| GET | `/api/audio/status` | Get status | None |
| GET | `/api/audio/devices` | List devices | None |

### **Frontend API Methods:**

```typescript
// Start with optional device
PythonAudioAPI.startCapture(meetingId, deviceId?)

// Pause/Resume
PythonAudioAPI.pauseCapture()
PythonAudioAPI.resumeCapture()

// Get status (includes is_paused)
PythonAudioAPI.getStatus()

// List devices
PythonAudioAPI.listDevices()
```

---

## ✅ **Testing**

### **Test Pause/Resume:**

1. Start recording
2. Wait for first chunk to process
3. Click "PAUSE"
4. Verify:
   - Button turns yellow
   - "PAUSED" badge appears
   - Status shows "[ PAUSED ]"
   - Backend logs "Recording paused"
5. Click "RESUME"
6. Verify:
   - Button turns white
   - Badge disappears
   - Status shows "[ RECORDING ]"
   - Backend logs "Recording resumed"
7. Stop recording
8. Verify transcript is complete (no gaps)

---

### **Test Device Selection:**

1. Click device selector button
2. Verify modal opens with device list
3. Select a device
4. Click "Save Selection"
5. Verify device name updates in UI
6. Start recording
7. Verify backend logs show selected device
8. Check transcript quality

---

## 🎯 **Benefits**

### **Pause/Resume:**
- ✅ Take breaks during long meetings
- ✅ Pause for private conversations
- ✅ No audio data lost
- ✅ Seamless continuation
- ✅ Visual feedback

### **Device Selection:**
- ✅ Choose best audio source
- ✅ Switch between devices
- ✅ Save preferences
- ✅ Better audio quality
- ✅ Flexible setup

---

## ⚠️ **Known Limitations**

### **Pause/Resume:**
- Pausing during chunk recording completes the current chunk first
- Resume starts a new chunk
- Very short pauses (< 1 second) may not be noticeable

### **Device Selection:**
- Device list depends on system configuration
- Some devices may not support loopback recording
- Device IDs may change after system restart

---

## 🚀 **Future Enhancements**

1. **Audio Level Monitoring**
   - Show real-time audio levels
   - Visual waveform display
   - Silence detection

2. **Advanced Device Features**
   - Multiple device capture
   - Device mixing
   - Audio filters

3. **Pause Improvements**
   - Instant pause (no chunk completion)
   - Pause timer display
   - Auto-resume after timeout

---

## 📝 **Summary**

### **What's New:**
- ✅ Pause/Resume recording
- ✅ Audio device selection
- ✅ Device preference saving
- ✅ Visual paused state
- ✅ Device selector modal
- ✅ Selected device display

### **What Works:**
- ✅ Seamless pause/resume
- ✅ No data loss
- ✅ Device switching
- ✅ Preference persistence
- ✅ Visual feedback
- ✅ Error handling

---

**All features are implemented and ready to use!** 🎉

---

*For technical details, see `backend/audio_capture.py` and `src/components/settings/AudioDeviceSelector.tsx`*

