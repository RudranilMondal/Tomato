import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Share, X } from 'lucide-react';

type PortalKey = 'customer' | 'partner' | 'rider' | 'admin';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PORTAL_META: Record<
  PortalKey,
  { name: string; subtitle: string; manifest: string; themeColor: string }
> = {
  customer: {
    name: 'G1 Bites',
    subtitle: 'Install the Customer App for faster ordering & live tracking',
    manifest: '/manifest-customer.webmanifest',
    themeColor: '#F04A00'
  },
  partner: {
    name: 'G1 Bites Partner',
    subtitle: 'Install the Restaurant Partner App for instant order alerts',
    manifest: '/manifest-partner.webmanifest',
    themeColor: '#F04A00'
  },
  rider: {
    name: 'G1 Bites Rider',
    subtitle: 'Install the Delivery Rider App for quick route & pickup access',
    manifest: '/manifest-rider.webmanifest',
    themeColor: '#F04A00'
  },
  admin: {
    name: 'G1 Bites Admin',
    subtitle: 'Install the Admin Console as a standalone desktop/mobile app',
    manifest: '/manifest-admin.webmanifest',
    themeColor: '#1E1E24'
  }
};

const SKIP_ROUTES = [
  '/privacy-policy',
  '/privacy',
  '/delete-account',
  '/account-deletion',
  '/terms',
  '/support',
  '/contact',
  '/ecosystem',
  '/quad',
  '/google-mobile-auth'
];

function getPortalFromPath(pathname: string): PortalKey {
  const p = pathname.toLowerCase();
  if (p.startsWith('/partner') || p.startsWith('/restaurant')) return 'partner';
  if (p.startsWith('/rider') || p.startsWith('/delivery')) return 'rider';
  if (p.startsWith('/admin')) return 'admin';
  return 'customer';
}

function isRunningAsPwaOrNative(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  if (window.matchMedia?.('(display-mode: fullscreen)').matches) return true;
  if (window.matchMedia?.('(display-mode: minimal-ui)').matches) return true;
  if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) return true;
  if (document.referrer?.startsWith('android-app://')) return true;
  if ((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()) {
    return true;
  }
  return false;
}

function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Capture beforeinstallprompt globally so it is never missed before React mounts
let capturedPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    capturedPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('g1bites:pwa-prompt-ready'));
  });
}

export const PwaInstallPrompt: React.FC = () => {
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const meta = PORTAL_META[portal];

  const [isPwa, setIsPwa] = useState<boolean>(() => isRunningAsPwaOrNative());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => capturedPrompt
  );
  const [dismissed, setDismissed] = useState(false);
  const [showManualHint, setShowManualHint] = useState(false);
  const [visible, setVisible] = useState(false);

  // Keep manifest, apple-mobile-web-app-title, theme-color, and title synced to active portal
  useEffect(() => {
    const manifestLink = document.getElementById('app-manifest') as HTMLLinkElement | null;
    if (manifestLink && manifestLink.getAttribute('href') !== meta.manifest) {
      manifestLink.setAttribute('href', meta.manifest);
    }
    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleTitle) appleTitle.setAttribute('content', meta.name);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', meta.themeColor);
  }, [meta]);

  useEffect(() => {
    if (isPwa) return;

    const onReady = () => {
      setDeferredPrompt(capturedPrompt);
      setVisible(true);
    };
    const onInstalled = () => {
      capturedPrompt = null;
      setDeferredPrompt(null);
      setIsPwa(true);
      setVisible(false);
    };

    window.addEventListener('g1bites:pwa-prompt-ready', onReady);
    window.addEventListener('appinstalled', onInstalled);

    // Show prompt automatically on browser visit (either native prompt or iOS/browser install guide)
    const timer = window.setTimeout(() => {
      if (!isRunningAsPwaOrNative()) {
        setVisible(true);
      }
    }, 900);

    return () => {
      window.removeEventListener('g1bites:pwa-prompt-ready', onReady);
      window.removeEventListener('appinstalled', onInstalled);
      window.clearTimeout(timer);
    };
  }, [isPwa]);

  const isSkippedRoute = SKIP_ROUTES.some((r) => location.pathname.toLowerCase().startsWith(r));
  if (isPwa || dismissed || !visible || isSkippedRoute) {
    return null;
  }

  const ios = isIosDevice();

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        capturedPrompt = null;
        setDeferredPrompt(null);
        setVisible(false);
      }
      return;
    }
    setShowManualHint((prev) => !prev);
  };

  return (
    <div
      role="dialog"
      aria-label={`Install ${meta.name}`}
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '420px',
        zIndex: 9999,
        backgroundColor: '#1E1E24',
        color: '#FFFFFF',
        borderRadius: '18px',
        padding: '12px 14px',
        boxShadow: '0 14px 36px rgba(0, 0, 0, 0.28)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="/logo-192.png"
          alt={meta.name}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            objectFit: 'cover',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(240, 74, 0, 0.35)'
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '14px', lineHeight: 1.2 }}>{meta.name}</div>
          <div style={{ fontSize: '12px', color: '#D1D5DB', lineHeight: 1.35, marginTop: '2px' }}>
            {meta.subtitle}
          </div>
        </div>

        {!ios && (
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              backgroundColor: '#F04A00',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              flexShrink: 0
            }}
          >
            <Download size={14} />
            Install
          </button>
        )}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install prompt"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            padding: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <X size={16} />
        </button>
      </div>

      {(ios || showManualHint) && (
        <div
          style={{
            fontSize: '12px',
            color: '#F3F4F6',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {ios ? <Share size={14} color="#FF7A45" style={{ flexShrink: 0 }} /> : <Download size={14} color="#FF7A45" style={{ flexShrink: 0 }} />}
          <span>
            {ios
              ? `Tap Share in Safari, then "Add to Home Screen" to install ${meta.name}.`
              : `Open your browser menu (⋮) and tap "Install app" or "Add to Home screen" to install ${meta.name}.`}
          </span>
        </div>
      )}
    </div>
  );
};
