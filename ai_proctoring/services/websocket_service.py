"""
WebSocket Service
==================
Provides a Socket.IO server that the React frontend connects to
for receiving real-time proctoring alerts AND for receiving
webcam frames from the browser for AI analysis.

Events (server -> client):
- 'proctoring_alert': Emitted when a violation is detected.
- 'proctoring_status': Emitted when the proctoring server starts/stops.
- 'violation_history': Response to client's history request.

Events (client -> server):
- 'process_frame': Client sends a base64-encoded webcam frame for analysis.
- 'request_history': Client requests the full violation history.
"""

import socketio
import logging
from datetime import datetime, timezone

from config.settings import CORS_ALLOWED_ORIGINS

logger = logging.getLogger(__name__)


class WebSocketService:
    """Socket.IO server for real-time proctoring event communication."""

    def __init__(self, violation_manager=None):
        self.sio = socketio.AsyncServer(
            async_mode="aiohttp",
            cors_allowed_origins=CORS_ALLOWED_ORIGINS,
        )
        self._violation_manager = violation_manager
        self._webcam_service = None
        self._setup_events()
        logger.info("WebSocketService initialized")

    def set_webcam_service(self, webcam_service):
        """Set the WebcamService reference for frame processing."""
        self._webcam_service = webcam_service
        logger.info("WebcamService linked to WebSocketService")

    def _setup_events(self):
        """Register Socket.IO event handlers."""

        @self.sio.event
        async def connect(sid, environ):
            logger.info(f"Client connected: {sid}")
            await self.sio.emit("proctoring_status", {
                "status": "connected",
                "message": "AI Proctoring system active",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }, room=sid)

        @self.sio.event
        async def disconnect(sid):
            logger.info(f"Client disconnected: {sid}")

        @self.sio.event
        async def process_frame(sid, data):
            """
            Receive a base64-encoded webcam frame from the browser
            and forward it to the AI detector pipeline.
            """
            if self._webcam_service and data and "image" in data:
                await self._webcam_service.process_base64_frame(data["image"])

        @self.sio.event
        async def request_history(sid, data=None):
            """Client requests the full violation history."""
            if self._violation_manager:
                history = self._violation_manager.get_history()
                await self.sio.emit("violation_history", {
                    "history": history,
                    "summary": self._violation_manager.get_summary(),
                }, room=sid)

    async def emit_alert(self, violation_event):
        """
        Broadcast a proctoring alert to all connected clients.

        Args:
            violation_event: dict with 'type', 'message', and optional 'details'.
        """
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": violation_event["type"],
            "message": violation_event["message"],
        }

        await self.sio.emit("proctoring_alert", payload)
        logger.info(f"Alert emitted: {payload['type']}")

    def get_sio(self):
        """Return the underlying Socket.IO server instance for attaching to aiohttp."""
        return self.sio
