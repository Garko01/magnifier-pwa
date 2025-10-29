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
  const [torchOn, setTorchOn] = useState(false);

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

        {/* ⚙️ Settings Panel */}
{/* ⚙️ Bottom Control Bar */}
<div
  className={`controls fixed bottom-0 left-0 z-[2016] w-full
    transition-all duration-500 ease-in-out
    ${showControls ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-full"}
  `}
>
  <div
    className="mx-auto max-w-[900px] flex items-center justify-center gap-5
      bg-[rgba(15,15,15,0.55)] backdrop-blur-md
      border-t border-[rgba(255,255,255,0.06)]
      rounded-t-[12px]
      shadow-[0_-2px_12px_rgba(0,0,0,0.4)]
      px-5 py-3 text-white text-sm select-none"
  >
    {/* Torch Button */}
    <button
      onClick={toggleTorch}
      className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all duration-200"
      aria-label="Toggle torch"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={torchOn ? "#ffcc00" : "white"}
        className="drop-shadow-[0_0_4px_rgba(255,255,255,0.3)] transition-colors duration-300"
      >
        <path d="M6 2h12v2h-12V2zm3 20h6v-10h-6v10zm3-12c1.1 0 2-.9 2-2V6h-4v2c0 1.1.9 2 2 2z" />
      </svg>
    </button>

    {/* Magnifier Zoom Slider (YouTube Volume Slider Style) */}
    <div className="flex items-center flex-1 justify-center">
      <div className="relative w-full h-[4px] rounded-full bg-[rgba(255,255,255,0.25)] overflow-visible group">
        {/* Native input range (invisible for native behavior) */}
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={handleZoom}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Filled portion — soft white glow */}
        <div
          className="absolute top-0 left-0 h-full bg-[rgba(255,255,255,0.9)] 
                     shadow-[0_0_6px_rgba(255,255,255,0.6)] rounded-full
                     transition-all duration-150 ease-out"
          style={{ width: `${((zoom - 1) / 2) * 100}%` }}
        />

        {/* Handle — small round dot like YouTube’s volume knob */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[12px] w-[12px]
                    bg-[rgba(255,255,255,0.95)] rounded-full
                    shadow-[0_0_10px_rgba(0,0,0,0.6),0_0_8px_rgba(255,255,255,0.7)]
                    border border-[rgba(255,255,255,0.5)]
                    transition-transform duration-150
                    group-hover:scale-125 active:scale-95"
          style={{ left: `calc(${((zoom - 1) / 2) * 100}% - 6px)` }}
        />
      </div>
    </div>
  </div>
</div>

    </div>
    );
}