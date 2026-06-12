"""
Webcam Service
===============
Processes frames received from the frontend via WebSocket.
Decodes base64-encoded images, runs them through all AI
detectors, and uses the ViolationManager + WebSocketService
to emit real-time alerts.

NOTE: The webcam hardware is now accessed exclusively by the
React frontend. This service only receives and analyzes frames.
"""

import cv2
import base64
import asyncio
import logging
import numpy as np

from config.settings import FRAME_PROCESS_INTERVAL
from detectors import GogglesDetector, MultipleFaceDetector, LowLightDetector

logger = logging.getLogger(__name__)


class WebcamService:
    """
    Frame analysis pipeline (hardware-free).

    Receives base64 JPEG frames from the browser via WebSocket,
    decodes them into OpenCV matrices, processes them through
    the detector chain, and emits alerts via the WebSocket
    service when violations are detected.
    """

    def __init__(self, violation_manager, websocket_service=None):
        self._violation_manager = violation_manager
        self._websocket_service = websocket_service

        # Initialize all detectors
        self._detectors = [
            MultipleFaceDetector(),
            GogglesDetector(),
            LowLightDetector(),
        ]

        # Throttle: track last processed time to avoid overload
        self._last_process_time = 0

        logger.info(
            f"WebcamService initialized with {len(self._detectors)} detectors"
        )

    def set_websocket_service(self, ws_service):
        """Set the WebSocket service reference (for circular dependency)."""
        self._websocket_service = ws_service

    async def process_base64_frame(self, base64_data):
        """
        Decode a base64-encoded image and run it through detectors.

        Args:
            base64_data: Base64 string of the JPEG image.
                         May optionally include the data URI prefix
                         (e.g. 'data:image/jpeg;base64,...').
        """
        try:
            # Strip data URI prefix if present
            if "," in base64_data:
                base64_data = base64_data.split(",", 1)[1]

            # Decode base64 to bytes
            img_bytes = base64.b64decode(base64_data)

            # Convert bytes to numpy array
            np_arr = np.frombuffer(img_bytes, dtype=np.uint8)

            # Decode into an OpenCV BGR frame
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                logger.warning("Failed to decode frame from base64 data")
                return

            # Run through the detector pipeline
            await self._process_frame(frame)

        except Exception as e:
            logger.error(f"Error processing base64 frame: {e}", exc_info=True)

    async def _process_frame(self, frame):
        """Run a single frame through all detectors."""
        for detector in self._detectors:
            try:
                result = detector.detect(frame)

                if result is not None:
                    violation_type = result["type"]

                    # Check cooldown before emitting
                    if self._violation_manager.should_emit(violation_type):
                        # Record the violation
                        self._violation_manager.record(result)

                        # Emit via WebSocket
                        if self._websocket_service:
                            await self._websocket_service.emit_alert(result)

            except Exception as e:
                detector_name = type(detector).__name__
                logger.error(f"Error in {detector_name}: {e}", exc_info=True)

    def release(self):
        """Release detector resources."""
        for detector in self._detectors:
            try:
                detector.release()
            except Exception as e:
                logger.error(f"Error releasing detector: {e}")

        logger.info("All detector resources cleaned up")
