import { useEffect, useRef, useState } from "react";

/**
 * MagnifierView Component
 * Displays a live camera feed with zoom slider.
 */
export default function MagnifierView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Camera access denied or unavailable.");
      }
    }

    startCamera();
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center mt-4 w-full">
      {error ? (
        <p className="text-red-400 text-xl">{error}</p>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="rounded-lg w-full h-[80vh] object-cover border border-gray-700"
          style={{ transform: `scale(${zoom})` }}
        />
      )}

      <input
        type="range"
        min="1"
        max="3"
        step="0.1"
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        className="absolute bottom-10 w-3/4 accent-white"
      />
    </div>
  );
}
