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
    <TorchButton />
  );
}
