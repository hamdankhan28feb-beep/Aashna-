import { useEffect, useRef, useState } from "react";

/**
 * Captures webcam video. Hand detection (MediaPipe) + model inference
 * (see services/modelService.ts) will hook into this component's video
 * element next — see docs/Architecture.md section 3.1 for the full flow.
 */
export function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isActive) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch((err) => setError(err.message));
    }

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isActive]);

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="aspect-video overflow-hidden rounded-md bg-slate-900">
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">Camera error: {error}</p>}

      <button
        onClick={() => setIsActive((v) => !v)}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        {isActive ? "Stop Camera" : "Start Camera"}
      </button>
    </div>
  );
}
