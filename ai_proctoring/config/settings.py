"""
AI Proctoring Configuration Settings
=====================================
Central configuration for all proctoring thresholds,
cooldowns, and server settings.
"""

# -- Detection Thresholds -----------------------------------------------

# Low Light Detection
LOW_LIGHT_THRESHOLD = 60          # Mean brightness below this = low light
LOW_LIGHT_DURATION = 3.0          # Seconds the frame must stay dark before triggering

# Goggles / Sunglasses Detection
# Ratio of eye-region brightness to face brightness.
# If eye brightness / face brightness < this ratio, flag as goggles.
GOGGLES_EYE_BRIGHTNESS_RATIO = 0.45
# If face is detected but ZERO eyes are detected, flag as goggles.
# This is a secondary check using Haar cascade eye detection.
GOGGLES_MIN_EYE_DETECTIONS = 1

# Multiple Face Detection
# Haar cascade scaleFactor and minNeighbors for tuning
FACE_CASCADE_SCALE_FACTOR = 1.3
FACE_CASCADE_MIN_NEIGHBORS = 5

# -- Anti-Spam Protection -----------------------------------------------

WARNING_COOLDOWN = 5              # Seconds between repeated warnings of the same type

# -- WebSocket Server ---------------------------------------------------

SOCKET_HOST = "0.0.0.0"
SOCKET_PORT = 5001                # Separate from the Node.js backend (5000)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

# -- Webcam Settings ----------------------------------------------------

WEBCAM_DEVICE_INDEX = 0           # Default webcam
FRAME_PROCESS_INTERVAL = 0.3     # Seconds between processing frames (~3 FPS analysis)

# -- Violation Types ----------------------------------------------------

VIOLATION_GOGGLES = "GOGGLES_DETECTED"
VIOLATION_MULTIPLE_FACES = "MULTIPLE_FACES"
VIOLATION_LOW_LIGHT = "LOW_LIGHT"

# -- Warning Messages ---------------------------------------------------

WARNING_MESSAGES = {
    VIOLATION_GOGGLES: "Please remove goggles or sunglasses. Your eyes must remain visible during the examination.",
    VIOLATION_MULTIPLE_FACES: "Multiple faces detected. Only the registered student should be visible.",
    VIOLATION_LOW_LIGHT: "Lighting is too low. Please move to a well-lit environment.",
}
