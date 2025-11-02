"""Smoke test for the audio capture service.

This script records a short sample of system audio and ensures that the
captured signal is non-silent. It can be executed manually or from CI to
validate that the required loopback device is available on the host.
"""

from __future__ import annotations

import argparse
import sys
from typing import Optional

try:
    from ..audio_capture import AudioCaptureService
except ImportError:  # pragma: no cover - allow execution as a script
    from audio_capture import AudioCaptureService  # type: ignore


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Smoke test for system audio capture")
    parser.add_argument(
        "--duration",
        type=int,
        default=6,
        help="Duration in seconds to sample audio (default: 6).",
    )
    parser.add_argument(
        "--device-id",
        type=int,
        default=None,
        help="Optional index of the audio capture device to use.",
    )
    parser.add_argument(
        "--min-rms",
        type=float,
        default=1e-4,
        help="Minimum RMS threshold to consider the capture non-silent.",
    )
    parser.add_argument(
        "--allow-missing-device",
        action="store_true",
        help="Return success when no capture device is available (useful for CI without audio).")
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)

    if args.duration < 5 or args.duration > 30:
        raise SystemExit("Duration must be between 5 and 30 seconds for the smoke test.")

    service = AudioCaptureService(chunk_duration=max(5, args.duration))
    result = service.run_smoke_test(duration=args.duration, device_id=args.device_id)

    if not result.get("success"):
        error_message = result.get("error") or f"Audio level too low (RMS={result.get('audio_level')})"
        if args.allow_missing_device and error_message and "No audio capture devices" in error_message:
            print(f"[SKIP] {error_message}")
            return 0
        raise SystemExit(f"Smoke test failed: {error_message}")

    audio_level = float(result.get("audio_level", 0.0))
    if audio_level < args.min_rms:
        raise SystemExit(
            f"Smoke test failed: RMS {audio_level:.6f} below threshold {args.min_rms:.6f}"
        )

    print("Audio smoke test passed:")
    print(f"  Device: {result.get('device')} (id={result.get('device_id')})")
    print(f"  Duration: {result.get('duration')} seconds")
    print(f"  RMS: {audio_level:.6f}")
    print(f"  Sample rate: {result.get('sample_rate')} Hz, channels: {result.get('channels')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
