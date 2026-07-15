"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X, Share, PlusSquare, Apple, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "wrpwa_install_dismissed_v1";
const INSTALL_CHECK_KEY = "wrpwa_install_check_v1";

function detectPlatform(): "ios" | "android" | "desktop" | "other" {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua) || (ua.includes("macintosh") && "ontouchend" in document);
  const isAndroid = /android/.test(ua);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  if (ua.includes("windows") || ua.includes("macintosh") || ua.includes("linux")) return "desktop";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "other">("other");

  useEffect(() => {
    setPlatform(detectPlatform());
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    // Wait at least one visit before prompting — track via timestamp
    const firstVisit = localStorage.getItem(INSTALL_CHECK_KEY);
    if (!firstVisit) {
      localStorage.setItem(INSTALL_CHECK_KEY, Date.now().toString());
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // For iOS (no beforeinstallprompt event), show instructions after a delay
    if (detectPlatform() === "ios") {
      const t = setTimeout(() => setVisible(true), 8000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(t);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-4 duration-500">
      <Card className="p-4 shadow-2xl border-emerald-200 bg-white">
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-700 flex items-center justify-center text-white">
            <Download className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-800 mb-0.5">
              Install Wilderness Romance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Add this trip guide to your home screen for offline access, full-screen
              map, and a native-app feel while you travel.
            </p>

            {platform === "ios" ? (
              <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <Apple className="w-3.5 h-3.5" /> iOS Install:
                </div>
                <div className="flex items-center gap-1.5">
                  <span>1.</span>
                  <span>Tap</span>
                  <Share className="w-3.5 h-3.5 inline text-blue-600" />
                  <span>Share button in Safari</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>2.</span>
                  <span>Choose</span>
                  <PlusSquare className="w-3.5 h-3.5 inline text-blue-600" />
                  <span>"Add to Home Screen"</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>3.</span>
                  <span>Tap "Add" — done!</span>
                </div>
              </div>
            ) : platform === "android" ? (
              <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> Android Install:
                </div>
                <div>1. Tap "Install" below or browser menu (⋮)</div>
                <div>2. Choose "Install app" or "Add to Home screen"</div>
                <div>3. Confirm — the app icon appears on your home screen</div>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1">
                  Desktop Install:
                </div>
                <div>
                  Click "Install" below — the app opens in its own window with
                  offline access.
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              {deferredPrompt && (
                <Button
                  onClick={install}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-700 to-amber-700 text-white border-0"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Install App
                </Button>
              )}
              <Button onClick={dismiss} size="sm" variant="outline">
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
