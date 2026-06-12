"""
Violation Manager
==================
Tracks violation history, enforces per-type cooldowns to prevent
warning spam, and maintains an in-memory log for admin review.
"""

import time
import logging
from datetime import datetime, timezone

from config.settings import WARNING_COOLDOWN

logger = logging.getLogger(__name__)


class ViolationManager:
    """
    Manages violation cooldowns and maintains a complete violation history.

    - Enforces WARNING_COOLDOWN seconds between repeated warnings of the same type.
    - Stores every violation with timestamp for admin review.
    """

    def __init__(self):
        self._last_warning_time = {}   # { violation_type: last_epoch }
        self._violation_history = []   # Complete log of all violations
        logger.info(f"ViolationManager initialized -- cooldown: {WARNING_COOLDOWN}s")

    def should_emit(self, violation_type):
        """
        Check if enough time has elapsed since the last warning of this type.

        Args:
            violation_type: The violation type string (e.g. "MULTIPLE_FACES")

        Returns:
            bool: True if the warning should be emitted, False if still in cooldown.
        """
        now = time.time()
        last_time = self._last_warning_time.get(violation_type, 0)

        if (now - last_time) >= WARNING_COOLDOWN:
            self._last_warning_time[violation_type] = now
            return True

        return False

    def record(self, violation_event):
        """
        Record a violation in the in-memory history.

        Args:
            violation_event: dict with 'type', 'message', and optional 'details'.
        """
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": violation_event["type"],
            "message": violation_event["message"],
            "details": violation_event.get("details", {}),
        }
        self._violation_history.append(entry)
        logger.info(f"Violation recorded: {entry['type']} at {entry['timestamp']}")

    def get_history(self):
        """
        Get the complete violation history.

        Returns:
            list[dict]: All recorded violations.
        """
        return list(self._violation_history)

    def get_summary(self):
        """
        Get a summary count of each violation type.

        Returns:
            dict: { violation_type: count }
        """
        summary = {}
        for v in self._violation_history:
            vtype = v["type"]
            summary[vtype] = summary.get(vtype, 0) + 1
        return summary

    def clear(self):
        """Clear all history and cooldown state."""
        self._last_warning_time.clear()
        self._violation_history.clear()
        logger.info("ViolationManager cleared")
