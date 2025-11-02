"""
System audio capture service for the FOMO backend.
Provides cross-platform system/loopback audio recording with chunked output,
structured logging, device discovery, and smoke testing utilities.
"""

from __future__ import annotations

import logging
import os
import platform
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional, Tuple

import numpy as np
import wave

try:  # Optional dependency, required for PortAudio-driven capture
    import sounddevice as sd  # type: ignore
except Exception:  # pragma: no cover - optional import guard
    sd = None  # type: ignore

try:  # Optional dependency, used for WASAPI loopback on Windows
    import soundcard as sc  # type: ignore
except Exception:  # pragma: no cover - optional import guard
    sc = None  # type: ignore


_LOG_LEVEL = os.getenv("FOMO_AUDIO_LOG_LEVEL", "INFO").upper()
logger = logging.getLogger("fomo.audio")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(_handler)
logger.setLevel(_LOG_LEVEL)
logger.propagate = False


def _unique(sequence):
    """Maintain order while removing duplicates."""
    seen = set()
    result = []
    for item in sequence:
        if item in seen:
            continue
        seen.add(item)
        result.append(item)
    return result


@dataclass
class DeviceDescriptor:
    """Normalized representation of an audio capture device."""

    backend: str
    backend_id: str
    name: str
    is_loopback: bool
    is_input: bool
    is_output: bool
    host_api: Optional[str] = None
    sample_rate: Optional[int] = None
    max_input_channels: Optional[int] = None
    extra: Dict[str, Any] = field(default_factory=dict)

    def as_payload(self, client_id: int) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "id": client_id,
            "name": self.name,
            "type": "output" if self.is_loopback else ("input" if self.is_input else "output"),
            "is_loopback": self.is_loopback,
            "backend": self.backend,
        }
        if self.host_api:
            payload["host_api"] = self.host_api
        if self.sample_rate:
            payload["default_sample_rate"] = self.sample_rate
        if self.max_input_channels is not None:
            payload["channels"] = self.max_input_channels
        return payload


class SoundDeviceRecorder:
    """Recorder wrapper around the sounddevice library."""

    def __init__(self, descriptor: DeviceDescriptor, sample_rate: int, channels: int, logger_: logging.Logger):
        if sd is None:  # pragma: no cover - guarded import
            raise RuntimeError("sounddevice backend is not available")
        self.descriptor = descriptor
        self.requested_sample_rate = sample_rate
        self.requested_channels = max(1, channels)
        self.logger = logger_
        self.stream: Optional[Any] = None
        self.actual_sample_rate = sample_rate
        self.actual_channels = channels

    def __enter__(self) -> "SoundDeviceRecorder":
        device_index = int(self.descriptor.backend_id)
        possible_rates = _unique([
            self.requested_sample_rate,
            self.descriptor.sample_rate,
            48000,
            44100,
            None,
        ])
        possible_channels = _unique([
            self.requested_channels,
            self.descriptor.max_input_channels or None,
            2,
            1,
        ])

        last_error: Optional[Exception] = None
        for channels in [c for c in possible_channels if c]:
            for rate in possible_rates:
                kwargs = {
                    "device": device_index,
                    "channels": int(channels),
                    "dtype": "float32",
                    "blocksize": 0,
                }
                if rate:
                    kwargs["samplerate"] = int(rate)
                try:
                    stream = sd.InputStream(**kwargs)  # type: ignore[arg-type]
                    stream.start()
                    self.stream = stream
                    self.actual_channels = int(channels)
                    self.actual_sample_rate = int(stream.samplerate)
                    self.logger.info(
                        "Opened sounddevice stream device_index=%s sample_rate=%s channels=%s",
                        device_index,
                        self.actual_sample_rate,
                        self.actual_channels,
                    )
                    return self
                except Exception as exc:  # pragma: no cover - depends on platform
                    last_error = exc
                    self.logger.debug(
                        "sounddevice open failed device_index=%s sample_rate=%s channels=%s error=%s",
                        device_index,
                        rate,
                        channels,
                        exc,
                    )
        if last_error is not None:
            raise last_error
        raise RuntimeError("Unable to open sounddevice input stream")

    def __exit__(self, exc_type, exc, tb):
        if self.stream is not None:
            try:
                self.stream.stop()
            finally:
                self.stream.close()
            self.stream = None

    def read(self, num_frames: int) -> np.ndarray:
        if self.stream is None:
            raise RuntimeError("SoundDeviceRecorder stream not initialized")
        data, overflowed = self.stream.read(num_frames)
        if overflowed:
            self.logger.warning("sounddevice overflow detected frames=%s", num_frames)
        return data


class SoundCardRecorder:
    """Recorder wrapper around the soundcard library (for WASAPI loopback, etc.)."""

    def __init__(self, descriptor: DeviceDescriptor, sample_rate: int, channels: int, logger_: logging.Logger):
        if sc is None:  # pragma: no cover - guarded import
            raise RuntimeError("soundcard backend is not available")
        self.descriptor = descriptor
        self.requested_sample_rate = sample_rate
        self.requested_channels = max(1, channels)
        self.logger = logger_
        self._recorder: Optional[Any] = None
        self.actual_sample_rate = sample_rate
        self.actual_channels = channels

    def __enter__(self) -> "SoundCardRecorder":
        device_obj = self._resolve_device()
        rates_to_try = [r for r in _unique([
            self.requested_sample_rate,
            self.descriptor.sample_rate,
            48000,
            44100,
        ]) if r]
        channels_to_try = [c for c in _unique([
            self.requested_channels,
            self.descriptor.max_input_channels,
            2,
            1,
        ]) if c]

        if not rates_to_try:
            rates_to_try = [self.requested_sample_rate]
        if not channels_to_try:
            channels_to_try = [self.requested_channels]

        last_error: Optional[Exception] = None
        for rate in rates_to_try:
            for channels in channels_to_try:
                try:
                    recorder = device_obj.recorder(samplerate=int(rate), channels=int(channels))
                    recorder.__enter__()
                    self._recorder = recorder
                    self.actual_sample_rate = int(rate)
                    self.actual_channels = int(channels)
                    self.logger.info(
                        "Opened soundcard recorder device='%s' sample_rate=%s channels=%s",
                        self.descriptor.name,
                        self.actual_sample_rate,
                        self.actual_channels,
                    )
                    return self
                except Exception as exc:  # pragma: no cover - depends on platform
                    last_error = exc
                    self.logger.debug(
                        "soundcard open failed device='%s' sample_rate=%s channels=%s error=%s",
                        self.descriptor.name,
                        rate,
                        channels,
                        exc,
                    )
        if last_error is not None:
            raise last_error
        raise RuntimeError("Unable to open soundcard recorder")

    def __exit__(self, exc_type, exc, tb):
        if self._recorder is not None:
            try:
                self._recorder.__exit__(exc_type, exc, tb)
            finally:
                self._recorder = None

    def read(self, num_frames: int) -> np.ndarray:
        if self._recorder is None:
            raise RuntimeError("SoundCardRecorder recorder not initialized")
        return self._recorder.record(numframes=num_frames)

    def _resolve_device(self):
        target, index_str = self.descriptor.backend_id.split(":", 1)
        index = int(index_str)
        if target == "speaker":
            speakers = sc.all_speakers()  # type: ignore[attr-defined]
            if index >= len(speakers):
                raise IndexError(f"Speaker index {index} out of range")
            return speakers[index]
        if target == "microphone":
            microphones = sc.all_microphones(include_loopback=True)  # type: ignore[attr-defined]
            if index >= len(microphones):
                raise IndexError(f"Microphone index {index} out of range")
            return microphones[index]
        raise ValueError(f"Unknown soundcard backend id: {self.descriptor.backend_id}")


class AudioCaptureService:
    """System audio capture with chunked recording and device management."""

    def __init__(self, chunk_duration: int = 120, segment_duration: int = 1, sample_rate: int = 44100):
        self.logger = logger
        self.chunk_duration = max(5, chunk_duration)
        env_chunk = os.getenv("FOMO_AUDIO_CHUNK_SECONDS")
        if env_chunk:
            try:
                self.chunk_duration = max(5, int(env_chunk))
            except ValueError:
                self.logger.warning("Invalid FOMO_AUDIO_CHUNK_SECONDS value: %s", env_chunk)
        self.segment_duration = max(1, segment_duration)
        env_segment = os.getenv("FOMO_AUDIO_SEGMENT_SECONDS")
        if env_segment:
            try:
                self.segment_duration = max(1, int(env_segment))
            except ValueError:
                self.logger.warning("Invalid FOMO_AUDIO_SEGMENT_SECONDS value: %s", env_segment)
        self.sample_rate = sample_rate
        env_rate = os.getenv("FOMO_AUDIO_SAMPLE_RATE")
        if env_rate:
            try:
                self.sample_rate = int(env_rate)
            except ValueError:
                self.logger.warning("Invalid FOMO_AUDIO_SAMPLE_RATE value: %s", env_rate)
        self.channels = max(1, int(os.getenv("FOMO_AUDIO_CHANNELS", "2")))
        self.data_dir = os.getenv("FOMO_AUDIO_DATA_DIR", "data")
        os.makedirs(self.data_dir, exist_ok=True)

        # Runtime state
        self.is_recording = False
        self.is_paused = False
        self.current_meeting_id: Optional[str] = None
        self.chunk_index = 0
        self.chunk_callback: Optional[Callable[[str, int, Optional[str]], None]] = None
        self.recording_thread: Optional[threading.Thread] = None
        self.selected_device_id: Optional[int] = None

        self._session_started_at: Optional[float] = None
        self._active_device_descriptor: Optional[DeviceDescriptor] = None
        self._active_sample_rate: Optional[int] = None
        self._active_channels: Optional[int] = None
        self._last_error: Optional[str] = None
        self._last_chunk_rms: Optional[float] = None
        self._last_chunk_path: Optional[str] = None

        self.pause_event = threading.Event()
        self.pause_event.set()
        self._stop_event = threading.Event()

        self._device_registry: Dict[int, DeviceDescriptor] = {}
        self._registry_lock = threading.Lock()
        self._state_lock = threading.Lock()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def start_recording(
        self,
        meeting_id: str,
        chunk_callback: Optional[Callable[[str, int, Optional[str]], None]] = None,
        device_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        if not meeting_id:
            raise ValueError("meeting_id is required to start recording")

        device_index, descriptor = self._select_device(device_id)
        try:
            probe_rate, probe_channels = self._probe_device(descriptor)
        except Exception as exc:
            self.logger.error("Audio device probe failed device='%s' error=%s", descriptor.name, exc)
            raise RuntimeError(f"Unable to open audio device '{descriptor.name}': {exc}") from exc

        with self._state_lock:
            if self.is_recording:
                raise RuntimeError("Recording already in progress")

            self.current_meeting_id = meeting_id
            self.chunk_index = 0
            self.chunk_callback = chunk_callback
            self.selected_device_id = device_index
            self._active_device_descriptor = descriptor
            self._active_sample_rate = probe_rate
            self._active_channels = probe_channels
            self._last_error = None
            self._last_chunk_rms = None
            self._last_chunk_path = None
            self._session_started_at = time.time()

            self.is_recording = True
            self.is_paused = False
            self.pause_event.set()
            self._stop_event.clear()

            thread = threading.Thread(
                target=self._record_loop,
                name=f"AudioRecorder-{meeting_id}",
                daemon=True,
            )
            self.recording_thread = thread

        thread.start()
        self.logger.info(
            "Started recording meeting=%s device_id=%s device='%s' backend=%s",
            meeting_id,
            device_index,
            descriptor.name,
            descriptor.backend,
        )

        payload = descriptor.as_payload(device_index)
        payload["sample_rate"] = probe_rate
        payload["channels"] = probe_channels
        payload["meeting_id"] = meeting_id
        payload["chunk_duration"] = self.chunk_duration
        return payload

    def pause_recording(self) -> Dict[str, Any]:
        with self._state_lock:
            if not self.is_recording:
                return {"success": False, "error": "No recording in progress"}
            if self.is_paused:
                return {"success": False, "error": "Recording already paused"}
            self.is_paused = True
            self.pause_event.clear()
            chunk_index = self.chunk_index
            meeting_id = self.current_meeting_id

        self.logger.info("Recording paused meeting=%s chunk_index=%s", meeting_id, chunk_index)
        return {
            "success": True,
            "status": "paused",
            "meeting_id": meeting_id,
            "chunk_index": chunk_index,
        }

    def resume_recording(self) -> Dict[str, Any]:
        with self._state_lock:
            if not self.is_recording:
                return {"success": False, "error": "No recording in progress"}
            if not self.is_paused:
                return {"success": False, "error": "Recording not paused"}
            self.is_paused = False
            self.pause_event.set()
            chunk_index = self.chunk_index
            meeting_id = self.current_meeting_id

        self.logger.info("Recording resumed meeting=%s chunk_index=%s", meeting_id, chunk_index)
        return {
            "success": True,
            "status": "recording",
            "meeting_id": meeting_id,
            "chunk_index": chunk_index,
        }

    def stop_recording(self) -> Dict[str, Any]:
        with self._state_lock:
            if not self.is_recording:
                return {"success": False, "error": "No recording in progress"}
            meeting_id = self.current_meeting_id
            selected_device = self.selected_device_id
            self.is_recording = False
            self.is_paused = False
            self.pause_event.set()
            self._stop_event.set()
            thread = self.recording_thread

        if thread:
            thread.join(timeout=10)
            if thread.is_alive():  # pragma: no cover - defensive
                self.logger.warning("Audio recording thread did not terminate cleanly")

        with self._state_lock:
            duration_seconds = 0
            if self._session_started_at:
                duration_seconds = int(max(0, time.time() - self._session_started_at))
            summary = {
                "success": self._last_error is None,
                "meeting_id": meeting_id,
                "total_chunks": self.chunk_index,
                "duration_seconds": duration_seconds,
                "device_id": selected_device,
                "last_error": self._last_error,
                "last_chunk_rms": self._last_chunk_rms,
            }
            self.current_meeting_id = None
            self.recording_thread = None
            self.selected_device_id = None
            self._active_device_descriptor = None
            self._active_sample_rate = None
            self._active_channels = None
            self._session_started_at = None

        self.logger.info("Stopped recording meeting=%s total_chunks=%s", meeting_id, summary["total_chunks"])
        return summary

    def get_status(self) -> Dict[str, Any]:
        with self._state_lock:
            status = {
                "is_recording": self.is_recording,
                "is_paused": self.is_paused,
                "meeting_id": self.current_meeting_id,
                "current_chunk": self.chunk_index,
                "chunk_duration": self.chunk_duration,
                "selected_device_id": self.selected_device_id,
                "last_error": self._last_error,
                "last_chunk_rms": self._last_chunk_rms,
            }
            if self._active_device_descriptor:
                status["selected_device_name"] = self._active_device_descriptor.name
                status["selected_device_backend"] = self._active_device_descriptor.backend
            if self._active_sample_rate:
                status["sample_rate"] = self._active_sample_rate
            if self._active_channels:
                status["channels"] = self._active_channels
            return status

    def get_available_devices(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        registry = self._ensure_device_registry(force_refresh)
        return [descriptor.as_payload(idx) for idx, descriptor in registry.items()]

    def run_smoke_test(self, duration: int = 5, device_id: Optional[int] = None) -> Dict[str, Any]:
        if duration <= 0:
            return {"success": False, "error": "Duration must be positive"}
        if self.is_recording:
            return {"success": False, "error": "Cannot run smoke test while recording"}

        try:
            device_index, descriptor = self._select_device(device_id)
        except Exception as exc:
            self.logger.error("Smoke test device selection failed: %s", exc)
            return {"success": False, "error": str(exc)}

        try:
            backend = self._create_backend(descriptor)
        except Exception as exc:
            self.logger.error("Smoke test backend init failed device='%s': %s", descriptor.name, exc)
            return {"success": False, "error": str(exc), "device": descriptor.name}

        audio_data: Optional[np.ndarray] = None
        try:
            with backend as recorder:
                sample_rate = recorder.actual_sample_rate
                frames_to_read = max(1, int(sample_rate * duration))
                remaining = frames_to_read
                segments: List[np.ndarray] = []
                while remaining > 0:
                    batch = min(remaining, int(sample_rate))
                    segment = recorder.read(batch)
                    if segment is None:
                        break
                    if isinstance(segment, np.ndarray):
                        segment = segment.astype(np.float32, copy=False)
                    else:
                        segment = np.asarray(segment, dtype=np.float32)
                    if segment.ndim == 1:
                        segment = segment[:, np.newaxis]
                    if segment.size == 0:
                        break
                    segments.append(np.copy(segment))
                    remaining -= segment.shape[0]
                if segments:
                    audio_data = np.concatenate(segments, axis=0)
        except Exception as exc:
            self.logger.error("Smoke test read failed: %s", exc)
            return {"success": False, "error": str(exc), "device": descriptor.name}

        if audio_data is None or audio_data.size == 0:
            return {"success": False, "error": "No audio captured", "device": descriptor.name}

        rms = float(np.sqrt(np.mean(np.square(audio_data.astype(np.float64)))))
        has_audio = bool(rms > 1e-4)
        return {
            "success": has_audio,
            "device": descriptor.name,
            "device_id": device_index,
            "duration": duration,
            "audio_level": rms,
            "has_audio": has_audio,
            "sample_rate": backend.actual_sample_rate,
            "channels": backend.actual_channels,
        }

    # ------------------------------------------------------------------
    # Static convenience wrappers
    # ------------------------------------------------------------------

    @staticmethod
    def list_audio_devices() -> List[Dict[str, Any]]:
        return get_audio_service().get_available_devices(force_refresh=True)

    @staticmethod
    def test_audio_capture(duration: int = 5, device_id: Optional[int] = None) -> Dict[str, Any]:
        return get_audio_service().run_smoke_test(duration=duration, device_id=device_id)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _ensure_device_registry(self, force_refresh: bool = False) -> Dict[int, DeviceDescriptor]:
        with self._registry_lock:
            if force_refresh or not self._device_registry:
                self._refresh_devices_locked()
            return dict(self._device_registry)

    def _refresh_devices_locked(self) -> None:
        descriptors: List[DeviceDescriptor] = []
        descriptors.extend(self._enumerate_sounddevice())
        descriptors.extend(self._enumerate_soundcard())
        if not descriptors:
            self.logger.warning("No audio capture devices discovered. Install a loopback device (e.g. BlackHole on macOS).")
        self._device_registry = {idx: descriptor for idx, descriptor in enumerate(descriptors)}

    def _enumerate_sounddevice(self) -> List[DeviceDescriptor]:
        descriptors: List[DeviceDescriptor] = []
        if sd is None:
            self.logger.debug("sounddevice not available for enumeration")
            return descriptors
        try:
            devices = sd.query_devices()  # type: ignore[attr-defined]
        except Exception as exc:
            self.logger.warning("sounddevice query_devices failed: %s", exc)
            return descriptors
        try:
            hostapis = sd.query_hostapis()  # type: ignore[attr-defined]
        except Exception:  # pragma: no cover - hostAPI query may fail on some systems
            hostapis = []
        for idx, device in enumerate(devices):
            max_input = int(device.get("max_input_channels", 0))
            max_output = int(device.get("max_output_channels", 0))
            hostapi_index = device.get("hostapi")
            hostapi_name = None
            if hostapis and hostapi_index is not None and hostapi_index < len(hostapis):
                hostapi_name = hostapis[hostapi_index].get("name")
            name = device.get("name") or f"Device {idx}"
            is_loopback = "loopback" in name.lower() or "monitor" in name.lower()
            is_input = max_input > 0 or is_loopback
            if not is_input:
                continue
            sample_rate = device.get("default_samplerate")
            try:
                sample_rate = int(sample_rate) if sample_rate else None
            except (TypeError, ValueError):  # pragma: no cover - defensive conversion
                sample_rate = None
            descriptor = DeviceDescriptor(
                backend="sounddevice",
                backend_id=str(idx),
                name=name,
                is_loopback=is_loopback,
                is_input=is_input,
                is_output=max_output > 0,
                host_api=hostapi_name,
                sample_rate=sample_rate,
                max_input_channels=max_input if max_input > 0 else (2 if is_loopback else None),
                extra={
                    "max_output_channels": max_output,
                    "hostapi_index": hostapi_index,
                },
            )
            descriptors.append(descriptor)
        return descriptors

    def _enumerate_soundcard(self) -> List[DeviceDescriptor]:
        descriptors: List[DeviceDescriptor] = []
        if sc is None:
            self.logger.debug("soundcard not available for enumeration")
            return descriptors
        try:
            speakers = sc.all_speakers()  # type: ignore[attr-defined]
            for idx, speaker in enumerate(speakers):
                name = getattr(speaker, "name", f"Speaker {idx}")
                descriptors.append(
                    DeviceDescriptor(
                        backend="soundcard",
                        backend_id=f"speaker:{idx}",
                        name=name,
                        is_loopback=True,
                        is_input=True,
                        is_output=True,
                        host_api="soundcard",
                        sample_rate=self.sample_rate,
                        max_input_channels=self.channels,
                        extra={"speaker_index": idx},
                    )
                )
        except Exception as exc:
            self.logger.warning("soundcard speaker enumeration failed: %s", exc)
        try:
            microphones = sc.all_microphones(include_loopback=True)  # type: ignore[attr-defined]
            for idx, microphone in enumerate(microphones):
                name = getattr(microphone, "name", f"Microphone {idx}")
                is_loopback = bool(getattr(microphone, "isloopback", False))
                descriptors.append(
                    DeviceDescriptor(
                        backend="soundcard",
                        backend_id=f"microphone:{idx}",
                        name=name,
                        is_loopback=is_loopback,
                        is_input=True,
                        is_output=False,
                        host_api="soundcard",
                        sample_rate=self.sample_rate,
                        max_input_channels=self.channels,
                        extra={"microphone_index": idx},
                    )
                )
        except Exception as exc:
            self.logger.warning("soundcard microphone enumeration failed: %s", exc)
        return descriptors

    def _select_device(self, requested_id: Optional[int]) -> Tuple[int, DeviceDescriptor]:
        registry = self._ensure_device_registry(force_refresh=True)
        if not registry:
            raise RuntimeError(
                "No audio capture devices detected. Install a virtual loopback device (e.g. BlackHole on macOS or enable WASAPI loopback on Windows)."
            )
        items = list(registry.items())

        if requested_id is not None and requested_id in registry:
            self.logger.info("Using user-selected audio device id=%s", requested_id)
            return requested_id, registry[requested_id]

        env_device_id = os.getenv("FOMO_AUDIO_DEVICE_ID")
        if env_device_id:
            try:
                env_index = int(env_device_id)
                if env_index in registry:
                    self.logger.info("Using audio device from FOMO_AUDIO_DEVICE_ID=%s", env_index)
                    return env_index, registry[env_index]
            except ValueError:
                self.logger.warning("Invalid FOMO_AUDIO_DEVICE_ID value: %s", env_device_id)

        env_device_name = os.getenv("FOMO_AUDIO_DEVICE_NAME") or os.getenv("FOMO_AUDIO_DEVICE")
        if env_device_name:
            env_lower = env_device_name.lower()
            for idx, descriptor in items:
                if env_lower in descriptor.name.lower():
                    self.logger.info("Using audio device from environment name match: %s", descriptor.name)
                    return idx, descriptor

        return self._choose_default_device(items)

    def _choose_default_device(self, devices: List[Tuple[int, DeviceDescriptor]]) -> Tuple[int, DeviceDescriptor]:
        system = platform.system().lower()
        loopbacks = [(idx, d) for idx, d in devices if d.is_loopback]

        if system == "windows":
            for idx, descriptor in loopbacks:
                host_api = (descriptor.host_api or "").lower()
                if descriptor.backend == "sounddevice" and "wasapi" in host_api:
                    return idx, descriptor
            if loopbacks:
                return loopbacks[0]

        if system == "darwin":
            for idx, descriptor in loopbacks:
                name_lower = descriptor.name.lower()
                if "blackhole" in name_lower or "loopback" in name_lower:
                    return idx, descriptor
            if loopbacks:
                return loopbacks[0]

        if system == "linux":
            for idx, descriptor in loopbacks:
                if "monitor" in descriptor.name.lower():
                    return idx, descriptor
            if loopbacks:
                return loopbacks[0]

        for idx, descriptor in devices:
            if descriptor.is_input:
                return idx, descriptor
        return devices[0]

    def _create_backend(self, descriptor: DeviceDescriptor):
        if descriptor.backend == "sounddevice":
            return SoundDeviceRecorder(descriptor, self.sample_rate, self.channels, self.logger)
        if descriptor.backend == "soundcard":
            return SoundCardRecorder(descriptor, self.sample_rate, self.channels, self.logger)
        raise ValueError(f"Unsupported audio backend '{descriptor.backend}'")

    def _probe_device(self, descriptor: DeviceDescriptor) -> Tuple[int, int]:
        backend = self._create_backend(descriptor)
        with backend as recorder:
            return recorder.actual_sample_rate, recorder.actual_channels

    def _record_loop(self) -> None:
        descriptor = self._active_device_descriptor
        meeting_id = self.current_meeting_id
        if descriptor is None:
            self.logger.error("Recording loop started without active device descriptor")
            return

        try:
            backend = self._create_backend(descriptor)
        except Exception as exc:
            self._handle_recording_error("backend_init_failed", exc)
            return

        buffer_segments: List[np.ndarray] = []
        frames_collected = 0
        try:
            with backend as recorder:
                sample_rate = recorder.actual_sample_rate
                channels = recorder.actual_channels
                with self._state_lock:
                    self._active_sample_rate = sample_rate
                    self._active_channels = channels

                frames_per_chunk = max(1, int(sample_rate * self.chunk_duration))
                frames_per_segment = max(1, int(sample_rate * self.segment_duration))
                self.logger.info(
                    "Recording loop active meeting=%s device='%s' sample_rate=%s channels=%s chunk_duration=%s",
                    meeting_id,
                    descriptor.name,
                    sample_rate,
                    channels,
                    self.chunk_duration,
                )

                while True:
                    if self._stop_event.is_set() or not self.is_recording:
                        break
                    if not self.pause_event.wait(timeout=0.25):
                        continue
                    if self._stop_event.is_set() or not self.is_recording:
                        break

                    try:
                        segment = recorder.read(frames_per_segment)
                    except Exception as exc:
                        raise RuntimeError(f"Audio read failed: {exc}") from exc

                    if segment is None:
                        continue
                    if isinstance(segment, np.ndarray):
                        segment = segment.astype(np.float32, copy=False)
                    else:
                        segment = np.asarray(segment, dtype=np.float32)
                    if segment.ndim == 1:
                        segment = segment[:, np.newaxis]

                    frames = segment.shape[0]
                    if frames == 0:
                        continue

                    buffer_segments.append(np.copy(segment))
                    frames_collected += frames

                    if frames_collected >= frames_per_chunk:
                        audio_chunk = np.concatenate(buffer_segments, axis=0)
                        buffer_segments.clear()
                        frames_collected = 0
                        self._emit_chunk(audio_chunk, sample_rate, channels)

                if buffer_segments:
                    audio_chunk = np.concatenate(buffer_segments, axis=0)
                    buffer_segments.clear()
                    if audio_chunk.size > 0:
                        self._emit_chunk(audio_chunk, sample_rate, channels, final=True)

        except Exception as exc:
            self._handle_recording_error("record_loop_failure", exc)
        finally:
            with self._state_lock:
                self._active_sample_rate = None
                self._active_channels = None
            self.logger.info("Recording loop stopped meeting=%s", meeting_id)

    def _emit_chunk(self, audio_data: np.ndarray, sample_rate: int, channels: int, final: bool = False) -> None:
        if audio_data.ndim == 1:
            audio_data = audio_data[:, np.newaxis]
        if audio_data.size == 0:
            return

        chunk_channels = audio_data.shape[1]
        rms = float(np.sqrt(np.mean(np.square(audio_data.astype(np.float64)))))
        filepath = self._save_chunk(audio_data, self.chunk_index, sample_rate, chunk_channels)

        self._last_chunk_rms = rms
        self._last_chunk_path = filepath

        self.logger.info(
            "Chunk saved meeting=%s chunk_index=%s frames=%s rms=%.6f final=%s path=%s",
            self.current_meeting_id,
            self.chunk_index,
            audio_data.shape[0],
            rms,
            final,
            filepath,
        )

        if self.chunk_callback:
            try:
                self.chunk_callback(filepath, self.chunk_index, self.current_meeting_id)
            except Exception as exc:  # pragma: no cover - callback user code
                self.logger.error("Chunk callback error chunk=%s error=%s", self.chunk_index, exc, exc_info=True)

        self.chunk_index += 1

    def _save_chunk(self, audio_data: np.ndarray, chunk_index: int, sample_rate: int, channels: int) -> str:
        meeting_id = self.current_meeting_id or "meeting"
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"{meeting_id}_chunk_{chunk_index:04d}_{timestamp}.wav"
        filepath = os.path.join(self.data_dir, filename)

        audio_clipped = np.clip(audio_data, -1.0, 1.0)
        audio_int16 = (audio_clipped * 32767).astype(np.int16)

        with wave.open(filepath, "wb") as wf:
            wf.setnchannels(max(1, int(channels)))
            wf.setsampwidth(2)
            wf.setframerate(int(sample_rate))
            wf.writeframes(audio_int16.tobytes())

        return filepath

    def _handle_recording_error(self, reason: str, exc: Exception) -> None:
        message = f"{reason}: {exc}"
        self.logger.error(
            "Recording error reason=%s meeting=%s error=%s",
            reason,
            self.current_meeting_id,
            exc,
            exc_info=True,
        )
        with self._state_lock:
            self._last_error = message
            self.is_recording = False
            self.is_paused = False
            self.pause_event.set()
            self._stop_event.set()


# Global instance shared by the Flask app
_audio_service = AudioCaptureService()


def get_audio_service() -> AudioCaptureService:
    """Expose the singleton audio capture service."""
    return _audio_service
