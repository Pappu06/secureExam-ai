"""
SecureExam AI -- Proctoring Server
===================================
Main entry point for the Python AI Proctoring Module.

Starts:
1. A Socket.IO server on port 5001 (configurable in settings.py)
2. Listens for webcam frames from the React frontend via WebSocket
3. Processes frames through AI detectors and emits real-time alerts

Usage:
    python main.py

Make sure to install dependencies first:
    pip install -r requirements.txt
"""

import sys
import os
import asyncio
import logging
from aiohttp import web

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(BASE_DIR, "logs")

os.makedirs(LOGS_DIR, exist_ok=True)

# Add project root to sys.path so modules can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.settings import SOCKET_HOST, SOCKET_PORT
from services.violation_manager import ViolationManager
from services.websocket_service import WebSocketService
from services.webcam_service import WebcamService

# -- Logging Configuration -------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)-30s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(
            os.path.join(os.path.dirname(__file__), "logs", "proctoring.log"),
            mode="a",
            encoding="utf-8",
        ),
    ],
)

logger = logging.getLogger("main")


async def start_server():
    """Initialize all services and start the aiohttp + Socket.IO server."""

    logger.info("=" * 60)
    logger.info("  SecureExam AI Proctoring Server Starting")
    logger.info("=" * 60)

    # 1. Initialize services
    violation_manager = ViolationManager()
    ws_service = WebSocketService(violation_manager=violation_manager)
    webcam_service = WebcamService(violation_manager, ws_service)

    # Link WebcamService into WebSocketService for frame routing
    ws_service.set_webcam_service(webcam_service)

    # 2. Create aiohttp app and attach Socket.IO
    app = web.Application()
    sio = ws_service.get_sio()
    sio.attach(app)

    # 3. Add a health check endpoint
    async def health_check(request):
        return web.json_response({
            "status": "running",
            "service": "SecureExam AI Proctoring",
            "mode": "browser-stream",
            "violations_recorded": len(violation_manager.get_history()),
            "summary": violation_manager.get_summary(),
        })

    # 4. Add endpoint to get violation history
    async def get_violations(request):
        return web.json_response({
            "history": violation_manager.get_history(),
            "summary": violation_manager.get_summary(),
        })

    app.router.add_get("/health", health_check)
    app.router.add_get("/violations", get_violations)

    # 5. Cleanup handler
    async def on_cleanup(app):
        webcam_service.release()
        logger.info("Server cleanup complete")

    app.on_cleanup.append(on_cleanup)

    # 6. Start the server
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, SOCKET_HOST, SOCKET_PORT)
    await site.start()

    logger.info(f"Proctoring server running on http://{SOCKET_HOST}:{SOCKET_PORT}")
    logger.info(f"  Health check:   http://localhost:{SOCKET_PORT}/health")
    logger.info(f"  Violations API: http://localhost:{SOCKET_PORT}/violations")
    logger.info("  Mode: Waiting for browser webcam frames via WebSocket")
    logger.info("=" * 60)

    # Keep running until interrupted
    try:
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, asyncio.CancelledError):
        logger.info("Shutting down proctoring server...")
    finally:
        await runner.cleanup()


def ensure_logs_dir():
    """Create the logs directory if it doesn't exist."""
    logs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
    os.makedirs(logs_dir, exist_ok=True)


if __name__ == "__main__":
    ensure_logs_dir()

    print()
    print("  +==========================================+")
    print("  |   SecureExam AI Proctoring Server v2.0   |")
    print("  +==========================================+")
    print("  |  Mode: Browser WebSocket Stream          |")
    print("  |  Detections:                             |")
    print("  |    * Goggles / Sunglasses                |")
    print("  |    * Multiple Faces                      |")
    print("  |    * Low Light Conditions                |")
    print("  +==========================================+")
    print()

    try:
        asyncio.run(start_server())
    except KeyboardInterrupt:
        print("\nServer stopped.")
