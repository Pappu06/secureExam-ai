import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const PROCTORING_SERVER_URL = "http://localhost:5001";
const FRAME_INTERVAL_MS = 1000; // Send 1 frame per second
const FRAME_QUALITY = 0.6; // JPEG quality (0-1)

/**
 * WebcamMonitor — Captures webcam feed, streams frames to
 * the Python AI server, and relays violation alerts back
 * via the onViolation callback.
 *
 * This is the SINGLE Socket.IO connection point to the proctoring server.
 */
function WebcamMonitor({ isActive = true, onViolation }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const [connected, setConnected] = useState(false);

  // Keep onViolation in a ref so the socket listener always has the latest
  const onViolationRef = useRef(onViolation);
  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  // START / STOP WEBCAM + SOCKET based on isActive prop
  useEffect(() => {
    if (!isActive) {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // Clear frame streaming interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setConnected(false);
      return;
    }

    // --- Connect to the Python proctoring server ---
    const socket = io(PROCTORING_SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[WebcamMonitor] Connected to proctoring server");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[WebcamMonitor] Disconnected from proctoring server");
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.log("[WebcamMonitor] Connection error:", err.message);
      setConnected(false);
    });

    // --- Listen for AI proctoring alerts and relay them up ---
    socket.on("proctoring_alert", (data) => {
      console.log("[WebcamMonitor] Violation received:", data.type);
      if (onViolationRef.current) {
        onViolationRef.current(data);
      }
    });

    // --- Start the webcam ---
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
        });

        streamRef.current = stream;
        setCameraError(false);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // --- Start streaming frames to Python server ---
        intervalRef.current = setInterval(() => {
          if (
            videoRef.current &&
            canvasRef.current &&
            socketRef.current?.connected &&
            videoRef.current.readyState >= 2 // HAVE_CURRENT_DATA
          ) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get base64 JPEG and emit to server
            const base64Data = canvas.toDataURL("image/jpeg", FRAME_QUALITY);
            socketRef.current.emit("process_frame", { image: base64Data });
          }
        }, FRAME_INTERVAL_MS);
      } catch (error) {
        console.log("Camera access denied:", error);
        setCameraError(true);
      }
    };

    startWebcam();

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setConnected(false);
    };
  }, [isActive]);

  if (cameraError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-red-100 border-b border-red-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-700 text-sm font-medium">Camera Error</span>
          </div>
        </div>
        <div className="p-4 text-center">
          <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <p className="text-xs text-red-600 font-medium">Camera access denied</p>
          <p className="text-xs text-red-500 mt-1">Please allow camera access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
          <span className={`text-sm font-medium ${isActive ? "text-emerald-700" : "text-gray-500"}`}>
            {isActive ? "Live" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {connected && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AI Active
            </span>
          )}
          <span className="text-gray-500 text-xs font-medium">AI Proctoring</span>
        </div>
      </div>

      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full aspect-video object-cover bg-gray-100"
      />

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default WebcamMonitor;