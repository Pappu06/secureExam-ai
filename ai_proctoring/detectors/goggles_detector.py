"""
Goggles / Sunglasses Detector
==============================
Uses OpenCV Haar Cascades for face and eye detection, combined
with eye-region brightness analysis to detect when a student's
eyes are hidden by dark sunglasses or goggles.

Detection strategy (requires BOTH conditions to flag):
1. Face IS detected but NO eyes are found by BOTH eye cascades.
   We use two cascades for robustness:
   - haarcascade_eye_tree_eyeglasses.xml (handles glasses well)
   - haarcascade_eye.xml (standard fallback)
   If EITHER cascade finds at least one eye, we consider eyes visible.

2. AND the eye region brightness is significantly darker than the
   cheek region (indicating dark opaque lenses).

Both conditions must be true to trigger a violation. This prevents
false positives from eye cascade misses alone.

Normal transparent prescription glasses will NOT trigger this
detector because:
  - The eyeglasses-aware cascade reliably detects eyes through clear lenses.
  - The brightness ratio stays close to 1.0 with clear glass.
"""

import cv2
import numpy as np
import logging

from config.settings import (
    GOGGLES_EYE_BRIGHTNESS_RATIO,
    FACE_CASCADE_SCALE_FACTOR,
    FACE_CASCADE_MIN_NEIGHBORS,
    VIOLATION_GOGGLES,
    WARNING_MESSAGES,
)

logger = logging.getLogger(__name__)


class GogglesDetector:
    """Detects goggles or dark sunglasses using Haar cascades + brightness analysis."""

    def __init__(self):
        # Load Haar cascades (bundled with opencv-python)
        face_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        eye_path = cv2.data.haarcascades + "haarcascade_eye.xml"
        eye_glasses_path = cv2.data.haarcascades + "haarcascade_eye_tree_eyeglasses.xml"

        self.face_cascade = cv2.CascadeClassifier(face_path)
        self.eye_cascade = cv2.CascadeClassifier(eye_path)
        self.eye_glasses_cascade = cv2.CascadeClassifier(eye_glasses_path)

        if self.face_cascade.empty():
            raise RuntimeError(f"Failed to load face cascade from: {face_path}")
        if self.eye_cascade.empty():
            raise RuntimeError(f"Failed to load eye cascade from: {eye_path}")
        if self.eye_glasses_cascade.empty():
            logger.warning("Could not load eye_tree_eyeglasses cascade, using eye cascade only")
            self.eye_glasses_cascade = None

        # Consecutive frames with no eyes detected (adds temporal smoothing)
        self._no_eyes_streak = 0
        self._STREAK_THRESHOLD = 5  # Must miss eyes for 5 consecutive frames

        logger.info("GogglesDetector initialized (Haar cascades, dual-eye-detector)")

    def detect(self, frame):
        """
        Analyze a single frame for goggles/sunglasses.

        Returns:
            dict | None: Violation event dict if detected, else None.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Enhance contrast for better detection
        gray = cv2.equalizeHist(gray)

        # Step 1: Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=FACE_CASCADE_SCALE_FACTOR,
            minNeighbors=FACE_CASCADE_MIN_NEIGHBORS,
            minSize=(80, 80),
        )

        if len(faces) == 0:
            self._no_eyes_streak = 0
            return None  # No face visible, nothing to check

        # Use the largest face
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        face_roi_gray = gray[y : y + h, x : x + w]

        # Step 2: Try to detect eyes within the upper half of the face
        upper_face = face_roi_gray[0 : int(h * 0.6), :]

        # Try the glasses-aware cascade first (more reliable with spectacles)
        eyes_found = 0
        if self.eye_glasses_cascade is not None:
            eyes_glasses = self.eye_glasses_cascade.detectMultiScale(
                upper_face,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=(15, 15),
            )
            eyes_found = max(eyes_found, len(eyes_glasses))

        # Also try the standard eye cascade
        eyes_standard = self.eye_cascade.detectMultiScale(
            upper_face,
            scaleFactor=1.1,
            minNeighbors=3,
            minSize=(15, 15),
        )
        eyes_found = max(eyes_found, len(eyes_standard))

        # Step 3: Brightness analysis (on the original, non-equalized grayscale)
        gray_orig = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_orig = gray_orig[y : y + h, x : x + w]

        eye_region = face_orig[int(h * 0.15) : int(h * 0.45), int(w * 0.1) : int(w * 0.9)]
        cheek_region = face_orig[int(h * 0.55) : int(h * 0.85), int(w * 0.1) : int(w * 0.9)]

        if eye_region.size == 0 or cheek_region.size == 0:
            self._no_eyes_streak = 0
            return None

        eye_brightness = float(np.mean(eye_region))
        cheek_brightness = float(np.mean(cheek_region))

        # Avoid division by zero
        if cheek_brightness < 1.0:
            self._no_eyes_streak = 0
            return None

        brightness_ratio = eye_brightness / cheek_brightness

        # Step 4: Decision -- require BOTH conditions for a flag
        is_no_eyes = eyes_found == 0
        is_dark_lenses = brightness_ratio < GOGGLES_EYE_BRIGHTNESS_RATIO

        if is_no_eyes and is_dark_lenses:
            self._no_eyes_streak += 1
        else:
            self._no_eyes_streak = 0
            return None

        # Only flag after a sustained streak to avoid momentary false positives
        if self._no_eyes_streak >= self._STREAK_THRESHOLD:
            logger.warning(
                f"Goggles detected -- no eyes for {self._no_eyes_streak} frames, "
                f"brightness_ratio={brightness_ratio:.2f}"
            )
            return {
                "type": VIOLATION_GOGGLES,
                "message": WARNING_MESSAGES[VIOLATION_GOGGLES],
                "details": {
                    "eyes_detected": eyes_found,
                    "eye_brightness": round(eye_brightness, 2),
                    "cheek_brightness": round(cheek_brightness, 2),
                    "brightness_ratio": round(brightness_ratio, 3),
                    "streak_frames": self._no_eyes_streak,
                },
            }

        return None

    def release(self):
        """No resources to release for Haar cascade."""
        pass
