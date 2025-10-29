// Extend the built-in MediaTrackCapabilities type
interface MediaTrackCapabilities {
  zoom?: {
    min: number;
    max: number;
    step: number;
  };
  torch?: boolean;
}
