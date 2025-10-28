import { useState } from "react";

/**
 * TorchButton Component
 * Toggles the phone flashlight (if supported by the browser).
 */
export default function TorchButton() {
  const [isOn, setIsOn] = useState(false);
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);

  const toggleTorch = async () => {
    try {
      // Case 1: we already have a camera track
      if (track) {
        await track.applyConstraints({ advanced: [{ torch: !isOn } as any] });
        setIsOn(!isOn);
        return;
      }

      // Case 2: first-time toggle → ask for camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      const newTrack = stream.getVideoTracks()[0];
      const capabilities = newTrack.getCapabilities();

      if ("torch" in capabilities) {
        await newTrack.applyConstraints({ advanced: [{ torch: true } as any] });
        setIsOn(true);
        setTrack(newTrack);
      } else {
        alert("Torch is not supported on this device or browser.");
      }
    } catch (err) {
      console.error("Torch error:", err);
      alert("Unable to access camera or torch.");
    }
  };

  return (
    <button
      onClick={toggleTorch}
      className={`fixed bottom-5 right-5 rounded-full p-5 shadow-lg transition-colors ${
        isOn ? "bg-yellow-400 text-black" : "bg-white text-black"
      }`}
    >
      {isOn ? "💡 Torch On" : "💡 Torch Off"}
    </button>
  );
}
