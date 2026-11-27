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
      aria-modal="true"
      aria-label={`Install ${meta.name}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          color: '#1E1E24',
          borderRadius: '26px',
          padding: '32px 24px 24px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.32)',
          border: '1px solid #F3E8E2',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Close install prompt"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '34px',
            height: '34px',
            borderRadius: '999px',
            backgroundColor: '#F3F4F6',
            border: 'none',
            color: '#4B5563',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <img
          src="/logo-192.png"
          alt={meta.name}
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '22px',
            objectFit: 'cover',
            boxShadow: '0 10px 26px rgba(240, 74, 0, 0.28)'
          }}
        />

        <div>
          <div
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#F04A00',
              backgroundColor: '#FFF1EB',
              padding: '4px 10px',
              borderRadius: '999px',
              marginBottom: '8px'
            }}
          >
            Official Web App
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 6px', color: '#1E1E24' }}>
            Install {meta.name}
          </h2>
          <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
            {meta.subtitle}
          </p>
        </div>

        {!ios && (
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              width: '100%',
              backgroundColor: '#F04A00',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '14px 20px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(240, 74, 0, 0.28)',
              marginTop: '4px'
            }}
          >
            <Download size={18} />
            Install {meta.name}
          </button>
        )}

        {(ios || showManualHint) && (
          <div
            style={{
              width: '100%',
              fontSize: '13px',
              color: '#374151',
              backgroundColor: '#FFF8F5',
              border: '1px solid #F3E8E2',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              lineHeight: 1.4,
              boxSizing: 'border-box'
            }}
          >
            {ios ? (
              <Share size={16} color="#F04A00" style={{ flexShrink: 0 }} />
            ) : (
              <Download size={16} color="#F04A00" style={{ flexShrink: 0 }} />
            )}
            <span>
              {ios
                ? `Tap Share in Safari, then "Add to Home Screen" to install ${meta.name}.`
                : `Open your browser menu (⋮) and tap "Install app" or "Add to Home screen".`}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6B7280',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          Continue in browser
        </button>
      </div>
    </div>
  );
};
