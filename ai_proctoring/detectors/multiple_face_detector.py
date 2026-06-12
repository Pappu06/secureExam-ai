"""
Multiple Face Detector
=======================
Uses OpenCV's built-in Haar Cascade classifier to detect faces
in a frame. Triggers a violation if more than one face is detected.

No external model downloads required -- Haar cascade XML files
ship with the opencv-python package.
"""

import cv2
import logging

from config.settings import (
    FACE_CASCADE_SCALE_FACTOR,
    FACE_CASCADE_MIN_NEIGHBORS,
    VIOLATION_MULTIPLE_FACES,
    WARNING_MESSAGES,
)

logger = logging.getLogger(__name__)


class MultipleFaceDetector:
    """Detects when more than one face is visible in the webcam frame."""

    def __init__(self):
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

        if self.face_cascade.empty():
            raise RuntimeError(f"Failed to load face cascade from: {cascade_path}")

        logger.info("MultipleFaceDetector initialized (Haar cascade)")

    def detect(self, frame):
        """
        Analyze a single frame for multiple faces.

        Returns:
            dict | None: Violation event dict if more than 1 face detected, else None.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=FACE_CASCADE_SCALE_FACTOR,
            minNeighbors=FACE_CASCADE_MIN_NEIGHBORS,
            minSize=(60, 60),
        )

        face_count = len(faces)

        if face_count > 1:
            logger.warning(f"Multiple faces detected: {face_count} faces found")
            return {
                "type": VIOLATION_MULTIPLE_FACES,
                "message": WARNING_MESSAGES[VIOLATION_MULTIPLE_FACES],
                "details": {
                    "face_count": face_count,
                },
            }

        return None

    def release(self):
        """No resources to release for Haar cascade."""
        pass
