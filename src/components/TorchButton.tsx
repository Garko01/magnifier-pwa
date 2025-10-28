import { useEffect, useState } from "react";

export default function TorchButton() {
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    async function setupTorch() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();

        if ("torch" in capabilities) {
          setSupported(true);
          setTrack(videoTrack);
        } else {
          setSupported(false);
        }
      } catch (err) {
        console.error("Torch not supported:", err);
      }
    }

    setupTorch();
  }, []);

  const toggleTorch = async () => {
    if (track) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }] as any,
        });
        setTorchOn(!torchOn);
      } catch (err) {
        console.error("Failed to toggle torch:", err);
      }
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={toggleTorch}
      className={`p-4 rounded-full transition-transform duration-200 bg-neutral-900 border border-gray-600 text-white shadow-md hover:scale-105 ${
        torchOn ? "text-yellow-400" : "text-gray-300"
      }`}
      aria-label="Toggle Torch"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
        />
      </svg>
    </button>
  );
}
