import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getRedirectResult,
  signInWithRedirect,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../../lib/firebase';

const SCHEME_STORAGE_KEY = 'g1bites_mobile_oauth_scheme';
const REDIRECT_PENDING_KEY = 'g1bites_mobile_oauth_pending';

export const GoogleMobileAuthBridge: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [deepLink, setDeepLink] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const schemeParam = searchParams.get('scheme');
  if (schemeParam) {
    sessionStorage.setItem(SCHEME_STORAGE_KEY, schemeParam);
  }
  const scheme = schemeParam || sessionStorage.getItem(SCHEME_STORAGE_KEY) || 'com.g1bites.customer';

  useEffect(() => {
    let active = true;

    async function handleOAuth() {
      if (!auth) {
        if (!active) return;
        setStatus('error');
        setErrorMsg('Firebase is not configured.');
        return;
      }

      try {
        const result = await getRedirectResult(auth);
        if (result) {
          sessionStorage.removeItem(REDIRECT_PENDING_KEY);
          const oauthCred = GoogleAuthProvider.credentialFromResult(result);
          const idToken = oauthCred?.idToken || '';
          if (!idToken) {
            throw new Error('Missing Google ID token from redirect result.');
          }
          const hash = new URLSearchParams({
            idToken,
            name: result.user.displayName || '',
            email: result.user.email || '',
            photo: result.user.photoURL || ''
          }).toString();
          const target = `${scheme}://auth-callback#${hash}`;
          if (!active) return;
          setDeepLink(target);
          setStatus('ready');
          window.location.replace(target);
          return;
        }

        const pending = sessionStorage.getItem(REDIRECT_PENDING_KEY);
        if (!pending) {
          sessionStorage.setItem(REDIRECT_PENDING_KEY, '1');
          await signInWithRedirect(auth, googleAuthProvider);
          return;
        }

        // If pending was set but no result came back (user cancelled or storage cleared), allow retry
        sessionStorage.removeItem(REDIRECT_PENDING_KEY);
        if (!active) return;
        setStatus('error');
        setErrorMsg('Sign-in was cancelled or did not complete. Tap below to try again.');
      } catch (err: any) {
        sessionStorage.removeItem(REDIRECT_PENDING_KEY);
        if (!active) return;
        setStatus('error');
        setErrorMsg(err?.message || 'Google Sign-In failed.');
      }
    }

    handleOAuth();
    return () => {
      active = false;
    };
  }, [scheme]);

  const handleRetry = async () => {
    if (!auth) return;
    setStatus('loading');
    setErrorMsg('');
    sessionStorage.setItem(REDIRECT_PENDING_KEY, '1');
    await signInWithRedirect(auth, googleAuthProvider);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#FFF8F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '28px 24px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(30, 30, 36, 0.08)',
          border: '1px solid #F3E8E2'
        }}
      >
        <img
          src="/logo.png"
          alt="G1 Bites"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            objectFit: 'cover',
            marginBottom: '14px'
          }}
        />
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1E1E24', margin: '0 0 8px' }}>
          G1 Bites Sign-In
        </h1>

        {status === 'loading' && (
          <p style={{ fontSize: '14px', color: '#4B5563', margin: 0 }}>
            Connecting to Google... Please wait.
          </p>
        )}

        {status === 'ready' && (
          <div>
            <p style={{ fontSize: '14px', color: '#4B5563', margin: '0 0 18px' }}>
              Signed in! Returning you to the G1 Bites app...
            </p>
            <a
              href={deepLink}
              style={{
                display: 'inline-block',
                backgroundColor: '#F04A00',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
                padding: '12px 20px',
                borderRadius: '12px'
              }}
            >
              Return to G1 Bites App
            </a>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p style={{ fontSize: '14px', color: '#B91C1C', margin: '0 0 16px' }}>{errorMsg}</p>
            <button
              type="button"
              onClick={handleRetry}
              style={{
                backgroundColor: '#F04A00',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Continue with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
