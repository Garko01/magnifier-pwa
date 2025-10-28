import { useEffect, useRef, useState } from "react";
import TorchButton from "./TorchButton";

/**
 * MagnifierView
 * - Camera zoom + torch with auto-hide settings panel
 * - Keeps screen awake using Wake Lock API
 */
export default function MagnifierView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [zoom, setZoom] = useState(1);
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);
  const [supportsHardwareZoom, setSupportsHardwareZoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        const videoTrack = stream.getVideoTracks()[0];
        setTrack(videoTrack);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const capabilities = videoTrack.getCapabilities();
        if ("zoom" in capabilities) {
          setSupportsHardwareZoom(true);
          const settings = videoTrack.getSettings();
          setZoom(settings.zoom || 1);
        }

        // ✅ Prevent screen sleep
        if ("wakeLock" in navigator) {
          // @ts-ignore - Wake Lock API not yet typed in TS
          const lock = await navigator.wakeLock.request("screen");
          wakeLockRef.current = lock;
          lock.addEventListener("release", () =>
            console.log("Screen Wake Lock released"),
          );
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Camera access denied or unavailable.");
      }
    }

    startCamera();

    // Cleanup
    return () => {
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, []);

  const handleZoom = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(e.target.value);
    setZoom(newZoom);

    if (supportsHardwareZoom && track) {
      try {
        await track.applyConstraints({
          advanced: [{ zoom: newZoom }] as any,
        });
      } catch (err) {
        console.warn("Zoom not supported on this device:", err);
        setSupportsHardwareZoom(false);
      }
    }
  };

  // 🕒 Auto-hide panel after inactivity
  const handleUserActivity = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setShowControls(false), 4000);
  };

  useEffect(() => {
    window.addEventListener("touchstart", handleUserActivity);
    window.addEventListener("mousemove", handleUserActivity);
    return () => {
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("mousemove", handleUserActivity);
    };
  }, []);

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full bg-black text-white overflow-hidden">
            {/* 🔍 Title */}
            <h1 className="text-[18px] font-semibold mt-3 mb-2 select-none">Magnifyer</h1>

            {/* 📷 Camera */}
            {error ? (
            <p className="text-red-400 text-xl">{error}</p>
            ) : (
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-lg w-full h-full object-cover border border-gray-700 transition-transform duration-150 ease-in-out"
                style={!supportsHardwareZoom ? { transform: `scale(${zoom})` } : undefined}
            />
            )}

            {/* ⚙️ Settings Panel (fixed at bottom / right) */}
            <div
            className={`fixed z-20 flex flex-col items-center justify-center gap-4 p-4 
                bg-black/50 backdrop-blur-md rounded-t-3xl border-t border-gray-700
                transition-opacity duration-500 ease-in-out
                portrait:bottom-0 portrait:left-0 portrait:w-full portrait:rounded-none
                landscape:top-1/2 landscape:right-3 landscape:-translate-y-1/2 landscape:rounded-2xl
                ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
            >
            <TorchButton />
            <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={handleZoom}
                className="w-3/4 sm:w-1/2 accent-white"
            />
            </div>
        </div>
    );
}