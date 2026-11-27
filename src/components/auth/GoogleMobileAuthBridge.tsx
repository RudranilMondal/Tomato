import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleAuthProvider } from '../../lib/firebase';

export const GoogleMobileAuthBridge: React.FC = () => {
  const [searchParams] = useSearchParams();
  const scheme = searchParams.get('scheme') || 'com.g1bites.customer';

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [deepLink, setDeepLink] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setStatus('error');
      setErrorMsg('Firebase is not configured.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const oauthCred = GoogleAuthProvider.credentialFromResult(result);
      const idToken = oauthCred?.idToken || '';

      if (!idToken) {
        throw new Error('Missing Google ID token from sign-in.');
      }

      const hash = new URLSearchParams({
        idToken,
        name: result.user.displayName || '',
        email: result.user.email || '',
        photo: result.user.photoURL || ''
      }).toString();

      const target = `${scheme}://auth-callback#${hash}`;
      setDeepLink(target);
      setStatus('ready');
      window.location.replace(target);
    } catch (err: any) {
      setStatus('error');
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Sign-in popup was closed. Tap below to try again.');
      } else {
        setErrorMsg(err?.message || 'Google Sign-In failed.');
      }
    }
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

        {status === 'idle' && (
          <div>
            <p style={{ fontSize: '14px', color: '#4B5563', margin: '0 0 18px' }}>
              Tap below to sign in with your Google account and return to the app.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                backgroundColor: '#F04A00',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                padding: '13px 20px',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Continue with Google
            </button>
          </div>
        )}

        {status === 'loading' && (
          <p style={{ fontSize: '14px', color: '#4B5563', margin: 0 }}>
            Signing in with Google... Please complete in the popup.
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
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#F04A00',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
                padding: '13px 20px',
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
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                backgroundColor: '#F04A00',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                padding: '13px 20px',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Try Again with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
