import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

// Recommended video constraints for a good starting point
const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user', // Use 'environment' for the back camera on mobile
};

const Camera = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  // Function to capture the image
  const capture = useCallback(() => {
    // getScreenshot returns a data URL (base64 string) of the image
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  // Function to reset and retake the photo
  const retake = () => {
    setImgSrc(null);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-700 sm:p-6 md:p-8">
      <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-xl p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">
          Camera Capture
        </h2>

        {/* 1. Preview Area */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-300">
          {imgSrc ? (
            // Image Preview (captured image)
            <img 
              src={imgSrc} 
              alt="Captured" 
              className="w-full h-full object-cover" 
            />
          ) : (
            // Live Camera View
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              height="100%"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover" // Tailwind for responsive sizing
            />
          )}
        </div>

        {/* 2. Controls Area */}
        <div className="mt-6 flex justify-center space-x-4">
          {imgSrc ? (
            // Retake Button (shown after capture)
            <button
              onClick={retake}
              className="px-6 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Retake
            </button>
          ) : (
            // Capture Button (shown for live view)
            <button
              onClick={capture}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Capture
            </button>
          )}

          {/* Optional: Add a "Save" or "Use Photo" button here when imgSrc is available */}
        </div>
        
        <p className="mt-4 text-sm text-center text-gray-500">
            {imgSrc 
                ? "Previewing captured image. Click 'Retake' to restart." 
                : "Live camera feed. Click 'Capture' to take a photo."
            }
        </p>

      </div>
    </div>
  );
};

export default Camera;