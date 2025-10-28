import React, { useState, useRef, useEffect, useCallback } from 'react';

// Recommended video constraints for a good starting point
const videoConstraints = {
  // Use 'user' for front camera, or 'environment' for the back camera on mobile
  facingMode: 'user', 
  // Set preferred resolution
  width: { ideal: 1280 }, 
  height: { ideal: 1280 }, // Increased height to make it more square-ish
};

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  // 1. Setup camera stream on component mount/when needed
  useEffect(() => {
    // Function to initialize the camera stream
    const enableStream = async () => {
      // Clear any previous error
      setError(null);

      // Check for browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Your browser does not support required camera APIs.");
        return;
      }
      
      try {
        // Stop any existing stream before starting a new one
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
        });
        
        // Connect the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        setStream(newStream);

      } catch (err) {
        // Handle permissions or device errors
        console.error("Camera access error:", err);
        setError("Unable to access camera. Please check permissions or device availability.");
      }
    };

    // Only enable stream if we are in the live view state
    if (!imgSrc) {
      enableStream();
    }

    // Cleanup: Stop the stream when the component unmounts or state changes
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [imgSrc]); // Dependencies: Re-run when imgSrc is cleared (retake)

  // 2. Capture function using video and canvas refs
  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video stream resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame onto the canvas
      const ctx = canvas.getContext('2d');
      // Apply the same horizontal flip to the image that was applied to the video element
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation
      
      // Get the image data URL
      const imageSrc = canvas.toDataURL('image/jpeg', 0.9); // Quality 0.9
      setImgSrc(imageSrc);
      
      // Stop the video stream immediately after capture
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  }, [stream]);

  // Function to reset and retake the photo
  const retake = () => {
    setImgSrc(null);
    // useEffect handles restarting the stream
  };
  
  // 3. Render logic
  return (
    // Main Container: Dark background for professional/focused look
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-900 sm:p-6 md:p-8">
      
      {/* Component Card */}
      <div className="w-full max-w-xl h-full bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8">
        
        <h2 className="text-3xl font-extrabold mb-2 text-center text-white tracking-tight">
          Photo Capture
        </h2>
        {/* <p className="text-center text-gray-400 mb-6">
          Align your face perfectly within the circular guide.
        </p> */}

        {/* 1. Preview Area - Now uses aspect-square for height, or could use a fixed height */}
        <div className="relative w-full h-full **aspect-square** rounded-lg overflow-hidden border-4 border-white/20 bg-black">
          {error ? (
             // Display error message if camera access failed
             <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 text-white p-4">
                <p className="text-center font-bold text-lg">{error}</p>
             </div>
          ) : imgSrc ? (
            // Image Preview (captured image)
            <img 
              src={imgSrc} 
              alt="Captured" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <>
              {/* Live Camera View using <video> element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted // Muted is required for autoplay in most browsers
                className="w-full h-full object-cover"
                // Flip video horizontally for 'user' facing mode (mirror effect)
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Hidden Canvas for capturing screenshot (MUST be present) */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* FACE CAPTURE OVERLAY (Only visible during live feed) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Face Guide: Perfect white circle outline */}
                <div className="
                  w-4/5 h-4/5 md:w-3/5 md:h-4/5 
                  border-4 border-white/70 
                  **rounded-full** shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]
                  transition-all duration-300
                ">
                  {/* <div className="absolute inset-0 flex flex-col justify-end items-center mb-4">
                    <span className="text-white/80 text-sm tracking-wide">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 align-sub" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Center your head
                    </span>
                  </div> */}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. Controls Area */}
        <div className="mt-8 flex justify-center space-x-6">
          {imgSrc ? (
            <>
              {/* Retake Button (shown after capture) */}
              <button
                onClick={retake}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition duration-150 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                🔄 Retake
              </button>
              {/* Use Photo Button */}
              <button
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition duration-150 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                ✅ Use Photo
              </button>
            </>
          ) : (
            // Capture Button (shown for live view)
            <button
              onClick={capture}
              // Disable capture if there is an error or stream hasn't started
              disabled={!!error || !stream}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition duration-150 shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-800 
                ${(error || !stream) ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'}`}
            >
              {/* Shutter icon using an inner ring */}
              <div className="w-10 h-10 bg-white border-4 border-blue-800 rounded-full"></div>
            </button>
          )}

        </div>
        
        {/* Status Message */}
        <p className="mt-6 text-sm text-center text-gray-400">
            {error ? (
                <span className="text-red-400 font-medium">ERROR: {error}</span>
            ) : imgSrc ? (
                "Image captured. Click 'Use Photo' to proceed or 'Retake' to try again." 
            ) : (
                "Live feed active. Ensure good lighting and a neutral background before capturing."
            )}
        </p>

      </div>
    </div>
  );
};

export default Camera;
