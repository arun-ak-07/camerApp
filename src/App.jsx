import { useEffect, useState } from "react";
import "./App.css";
import Camera from "./components/Camera";

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent automatic prompt
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // Show install prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log("User install choice:", outcome);

    // Reset state
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Main Camera Component */}
      <Camera />

      {/* Install App Button */}
      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-5 right-5 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Install App
        </button>
      )}
    </div>
  );
}

export default App;
