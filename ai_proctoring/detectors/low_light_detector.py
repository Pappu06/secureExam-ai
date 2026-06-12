"""
Low Light Detector
===================
Converts the frame to grayscale and measures mean brightness.
If the brightness stays below the configured threshold for
a sustained duration (default 3 seconds), it triggers a violation.
"""

import cv2
import time
import numpy as np
import logging

from config.settings import (
    LOW_LIGHT_THRESHOLD,
    LOW_LIGHT_DURATION,
    VIOLATION_LOW_LIGHT,
    WARNING_MESSAGES,
)

logger = logging.getLogger(__name__)


class LowLightDetector:
    """Detects sustained low-light conditions in the webcam feed."""

    def __init__(self):
        self._low_light_start = None  # Timestamp when low-light first detected
        logger.info(
            f"LowLightDetector initialized -- threshold: {LOW_LIGHT_THRESHOLD}, "
            f"duration: {LOW_LIGHT_DURATION}s"
        )

    def detect(self, frame):
        """
        Analyze a single frame for low light conditions.

        The detector only triggers after the brightness has been
        below the threshold for LOW_LIGHT_DURATION seconds continuously.

        Returns:
            dict | None: Violation event dict if low light sustained, else None.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        brightness = float(np.mean(gray))

        if brightness < LOW_LIGHT_THRESHOLD:
            now = time.time()

            if self._low_light_start is None:
                # First frame below threshold — start the timer
                self._low_light_start = now
                return None

            elapsed = now - self._low_light_start

            if elapsed >= LOW_LIGHT_DURATION:
                logger.warning(
                    f"Low light detected — brightness: {brightness:.1f} "
                    f"(threshold: {LOW_LIGHT_THRESHOLD}), sustained for {elapsed:.1f}s"
                )
                return {
                    "type": VIOLATION_LOW_LIGHT,
                    "message": WARNING_MESSAGES[VIOLATION_LOW_LIGHT],
                    "details": {
                        "brightness": round(brightness, 2),
                        "threshold": LOW_LIGHT_THRESHOLD,
                        "sustained_seconds": round(elapsed, 1),
                    },
                }

            # Still accumulating — not long enough yet
            return None
        else:
            # Brightness is fine — reset the timer
            self._low_light_start = None
            return None

    def release(self):
        """No resources to release for this detector."""
        pass
