import React, { useEffect, useRef, useState } from "react";

// Responsive & Professional Camera Component
// Features: Live camera view, capture, retake, and preview
// Technologies: React + Vite + Tailwind CSS

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);

  // Start camera
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsStreaming(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }

  // Stop camera
  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }

  // Capture photo
  function capture() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    setPhotoDataUrl(dataUrl);
    stopCamera();
  }

  // Retake photo
  function retake() {
    setPhotoDataUrl(null);
    startCamera();
  }

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
      <div className="w-full max-w-2xl bg-gray-950/60 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-wide">Camera</h2>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        <div className="relative aspect-video bg-black flex items-center justify-center">
          {!photoDataUrl ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-b-2xl"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <img
              src={photoDataUrl}
              alt="Captured"
              className="w-full h-full object-cover rounded-b-2xl"
            />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        <div className="p-5 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!photoDataUrl ? (
            <button
              onClick={capture}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg font-medium transition-transform hover:scale-105"
            >
              Capture
            </button>
          ) : (
            <button
              onClick={retake}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg font-medium transition-transform hover:scale-105"
            >
              Retake
            </button>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
