import { useEffect, useRef, useState } from "react";
import TorchButton from "./TorchButton";

// 🩵 Extend missing camera capability types for autofocus support
declare global {
  interface MediaTrackCapabilities {
    focusMode?: string[];
    focusDistance?: {
      min?: number;
      max?: number;
      step?: number;
    };
  }
}

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
  const [torchOn, setTorchOn] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  const [zoomRange, setZoomRange] = useState({ min: 1, max: 3, step: 0.1 });

  useEffect(() => {
    if (track) {
      const caps = track.getCapabilities?.();
      if (caps?.zoom) {
        setZoomRange({
          min: caps.zoom.min ?? 1,
          max: caps.zoom.max ?? 3,
          step: caps.zoom.step ?? 0.1,
        });
      }
    }
  }, [track]);

  const toggleTorch = async () => {
    if (!track) return;
    const capabilities = track.getCapabilities?.();
    if (!("torch" in capabilities)) return;

    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as any],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.error("Torch toggle failed:", err);
    }
  };

  // Start camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        const videoTrack = stream.getVideoTracks()[0];
        setTrack(videoTrack);

        // ✅ Autofocus (continuous) — only if supported
        const caps = videoTrack.getCapabilities?.();
        if (caps?.focusMode?.includes("continuous")) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ focusMode: "continuous" }] as any,
            });
            console.log("✅ Continuous autofocus enabled");
          } catch (err) {
            console.warn("⚠️ Autofocus apply failed:", err);
          }
        } else {
          console.log("ℹ️ Autofocus not available on this device");
        }

        // Zoom capability logging
        if (caps?.zoom) {
          console.log("🔍 Zoom range:", caps.zoom.min, "→", caps.zoom.max);
        } else {
          console.log("⚠️ No hardware zoom available");
        }

        // Set up video stream
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

  const handleZoomStart = () => {
    setIsSliding(true);
    setShowControls(true); // make sure panel stays visible while dragging
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  const handleZoomEnd = () => {
    setIsSliding(false);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setShowControls(false), 4000);
  };

  const handleZoom = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(e.target.value);
    setZoom(newZoom);

    if (supportsHardwareZoom && track) {
      try {
        await track.applyConstraints({ advanced: [{ zoom: newZoom }] as any });
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

{/* ⚙️ Bottom Control Bar */}
<div
  className={`controls fixed bottom-0 left-0 z-[2016] w-full
    flex items-center justify-center
    transition-all duration-500 ease-in-out
    px-[4vw] pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]
    ${showControls ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-full"}
  `}
>
  <div className="flex items-center justify-center w-full max-w-[80vw] md:max-w-[600px] sm:max-w-[600px] gap-[4vw] px-[2vw] mx-auto">
    {/* 🔦 Torch Button */}
    <button
      onClick={toggleTorch}
      className="flex-shrink-0 h-[56px] w-[56px] flex items-center justify-center
                 rounded-full bg-[rgba(15,15,15,0.55)] backdrop-blur-md
                 border border-[rgba(255,255,255,0.08)]
                 shadow-[0_2px_10px_rgba(0,0,0,0.45)]
                 hover:bg-[rgba(30,30,30,0.65)]
                 active:scale-95 transition-all duration-200"
      aria-label="Toggle torch"
    >

{torchOn ? (
  // 🔦 Torch ON — lucide-flashlight
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ffcc00"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-flashlight w-6 h-6 drop-shadow-[0_0_6px_rgba(255,220,80,0.6)] transition-all duration-300"
  >
    <path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z" />
    <line x1="6" x2="18" y1="6" y2="6" />
    <line x1="12" x2="12" y1="12" y2="12" />
  </svg>
) : (
  // 🔦 Torch OFF — lucide-flashlight-off
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-flashlight-off w-6 h-6 drop-shadow-[0_0_4px_rgba(255,255,255,0.3)] transition-all duration-300"
  >
    <path d="M16 16v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4" />
    <path d="M7 2h11v4c0 2-2 2-2 4v1" />
    <line x1="11" x2="18" y1="6" y2="6" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
)}

    </button>

    {/* 🎚️ Zoom Slider Pill — fully contained */}
    <div
      className="relative flex-1 h-[56px] flex items-center
                 bg-[rgba(15,15,15,0.55)] backdrop-blur-md
                 border border-[rgba(255,255,255,0.08)]
                 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.45)]
                 px-[4vw] sm:px-6"
    >
      {/* Invisible input */}
      <input
        type="range"
        min={zoomRange.min}
        max={zoomRange.max}
        step={zoomRange.step}
        value={zoom}
        onChange={handleZoom}
        onMouseDown={handleZoomStart}
        onTouchStart={handleZoomStart}
        onMouseUp={handleZoomEnd}
        onTouchEnd={handleZoomEnd}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
      />

      {/* Track */}
      <div
        className="w-[calc(100%-1rem)] mx-auto h-[6px] rounded-full bg-[rgba(255,255,255,0.25)] relative overflow-visible group"
      >
        {/* Fill */}
        <div
          className="absolute top-0 left-0 h-full bg-[rgba(255,255,255,0.9)]
                     shadow-[0_0_6px_rgba(255,255,255,0.6)] rounded-full
                     transition-all duration-150 ease-out"
          style={{
            width: `${((zoom - zoomRange.min) / (zoomRange.max - zoomRange.min)) * 100}%`
          }}
        />

        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[16px] w-[16px]
                    bg-[rgba(255,255,255,0.95)] rounded-full
                    shadow-[0_0_10px_rgba(0,0,0,0.6),0_0_8px_rgba(255,255,255,0.7)]
                    border border-[rgba(255,255,255,0.5)]
                    transition-transform duration-150
                    group-hover:scale-125 active:scale-95"
          style={{
            left: `calc(${Math.min(Math.max(
              ((zoom - zoomRange.min) / (zoomRange.max - zoomRange.min)) * 100,
              0
            ), 100)}% - 8px)`,
          }}
        />
      </div>
    </div>
  </div>
</div>

    </div>
    );
}