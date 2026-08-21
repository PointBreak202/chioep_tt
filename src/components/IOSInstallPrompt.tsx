"use client";

import { useState, useEffect } from "react";
import { Share, X } from "lucide-react";

export default function IOSInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if we are on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);

    // Check if the app is already installed and running in standalone mode
    const isStandaloneMode =
      ("standalone" in window.navigator && window.navigator.standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;

    // Check if the user has previously dismissed the prompt
    const hasDismissed = localStorage.getItem("ios-install-prompt-dismissed");

    setIsIOS(isIOSDevice);
    setIsStandalone(!!isStandaloneMode);

    if (isIOSDevice && !isStandaloneMode && !hasDismissed) {
      setShowPrompt(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("ios-install-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 bg-zinc-900 border-t border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-md mx-auto relative flex flex-col gap-3">
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close prompt"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="pr-8">
          <h3 className="text-white font-semibold mb-1">Install COEP Timetable</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Install this app on your iPhone for the best experience.
          </p>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg p-3 mt-2 flex items-center gap-3 text-sm text-zinc-300 border border-zinc-700/50">
          <div className="flex-1 flex flex-col gap-2">
            <span className="flex items-center gap-2">
              1. Tap the <Share className="w-4 h-4 text-blue-400" /> Share button below
            </span>
            <span>
              2. Scroll down and tap <strong>"Add to Home Screen"</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
