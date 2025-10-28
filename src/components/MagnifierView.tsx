import { useEffect, useRef, useState } from "react";

/**
 * MagnifierView Component
 * - Uses real camera zoom if supported (Android Chrome, some desktop webcams)
 * - Falls back to smooth CSS zoom on unsupported devices (like iPhones)
 */
export default function MagnifierView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [zoom, setZoom] = useState(1);
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);
  const [supportsHardwareZoom, setSupportsHardwareZoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        // Detect zoom support
        const capabilities = videoTrack.getCapabilities();
        if ("zoom" in capabilities) {
          setSupportsHardwareZoom(true);
          const settings = videoTrack.getSettings();
          setZoom(settings.zoom || 1);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Camera access denied or unavailable.");
      }
    }

    startCamera();
  }, []);

  const handleZoom = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(e.target.value);
    setZoom(newZoom);

    if (supportsHardwareZoom && track) {
      try {
        await track.applyConstraints({
          advanced: [{ zoom: newZoom }] as any, // safe cast for TS
        });
      } catch (err) {
        console.warn("Zoom not supported on this device:", err);
        setSupportsHardwareZoom(false);
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center mt-4 w-full">
      {error ? (
        <p className="text-red-400 text-xl">{error}</p>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`rounded-lg w-full h-[80vh] object-cover border border-gray-700 transition-transform duration-150 ease-in-out`}
          style={
            !supportsHardwareZoom
              ? { transform: `scale(${zoom})` } // fallback zoom
              : undefined
          }
        />
      )}

      <input
        type="range"
        min="1"
        max="3"
        step="0.1"
        value={zoom}
        onChange={handleZoom}
        className="absolute bottom-10 w-3/4 accent-white"
      />
    </div>
  );
}
