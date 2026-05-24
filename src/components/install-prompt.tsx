import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "intech_install_dismissed_at";
const DISMISS_DAYS = 7;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

function dismissedRecently() {
  try {
    const v = localStorage.getItem(DISMISS_KEY);
    if (!v) return false;
    return Date.now() - Number(v) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone() || dismissedRecently()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => {
      setShow(false);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS has no beforeinstallprompt — show manual banner
    if (isIOS()) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setShow(false);
    setIosHelp(false);
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
      setDeferred(null);
    } else if (isIOS()) {
      setIosHelp(true);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none">
      <div className="mx-auto max-w-2xl pointer-events-auto rounded-2xl border bg-card text-card-foreground shadow-hover overflow-hidden">
        {!iosHelp ? (
          <div className="flex items-center gap-3 p-3 sm:p-4">
            <img
              src="/icon-192.png"
              alt="Intech app icon"
              width={48}
              height={48}
              loading="lazy"
              className="h-12 w-12 rounded-xl shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-tight truncate">Install Intech app</p>
              <p className="text-xs text-muted-foreground leading-snug">
                Faster shopping, offline-friendly, one tap from your home screen.
              </p>
            </div>
            <Button size="sm" onClick={install} className="gap-1.5">
              <Download className="h-4 w-4" />
              Install
            </Button>
            <button
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">Add Intech to your Home Screen</p>
              <button
                onClick={dismiss}
                aria-label="Close"
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-5">
              <li className="flex items-center gap-1.5">
                Tap the Share icon <Share className="h-4 w-4 inline" /> in Safari
              </li>
              <li>Scroll and tap <span className="font-medium text-foreground">Add to Home Screen</span></li>
              <li>Tap <span className="font-medium text-foreground">Add</span> in the top-right</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export function InstallAppButton({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  if (!deferred && !isIOS()) return null;

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else {
      // iOS — dispatch a custom event the InstallPrompt can listen to, or just alert
      alert(
        "To install: tap the Share icon in Safari, then choose 'Add to Home Screen'.",
      );
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={onClick} className={className}>
      <Download className="h-4 w-4 mr-1.5" />
      Install app
    </Button>
  );
}
