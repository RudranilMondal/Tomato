import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  UserCredential
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

export const app: FirebaseApp | null = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth: Auth | null = app ? getAuth(app) : null;

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

const GOOGLE_BRIDGE_URL = 'https://tomato-iota-lemon.vercel.app/google-mobile-auth';

function getMobileScheme(): string {
  const portal = (import.meta.env.VITE_APP_PORTAL || 'customer').toLowerCase();
  if (portal === 'partner') return 'com.g1bites.partner';
  if (portal === 'rider') return 'com.g1bites.rider';
  if (portal === 'admin') return 'com.g1bites.admin';
  return 'com.g1bites.customer';
}

async function signInWithGoogleNativeBridge(): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.');
  }

  const scheme = getMobileScheme();
  const bridgeUrl = `${GOOGLE_BRIDGE_URL}?scheme=${encodeURIComponent(scheme)}`;

  return new Promise<UserCredential>((resolve, reject) => {
    let settled = false;
    let urlHandle: { remove: () => Promise<void> } | null = null;
    let browserHandle: { remove: () => Promise<void> } | null = null;

    const cleanup = async () => {
      if (urlHandle) await urlHandle.remove().catch(() => {});
      if (browserHandle) await browserHandle.remove().catch(() => {});
    };

    const fail = async (err: Error) => {
      if (settled) return;
      settled = true;
      await cleanup();
      reject(err);
    };

    CapApp.addListener('appUrlOpen', async ({ url }) => {
      if (!url || !url.startsWith(`${scheme}://auth-callback`)) return;
      if (settled) return;
      settled = true;
      await cleanup();
      await Browser.close().catch(() => {});

      try {
        const hashIndex = url.indexOf('#');
        const queryIndex = url.indexOf('?');
        const rawParams =
          hashIndex >= 0
            ? url.slice(hashIndex + 1)
            : queryIndex >= 0
            ? url.slice(queryIndex + 1)
            : '';
        const params = new URLSearchParams(rawParams);
        const error = params.get('error');
        if (error) {
          reject(new Error(error));
          return;
        }
        const idToken = params.get('idToken');
        if (!idToken) {
          reject(new Error('Google sign-in did not return an ID token.'));
          return;
        }
        const credential = GoogleAuthProvider.credential(idToken);
        const userCred = await signInWithCredential(auth!, credential);
        resolve(userCred);
      } catch (e: any) {
        reject(e instanceof Error ? e : new Error(e?.message || 'Google sign-in failed.'));
      }
    }).then((h) => {
      urlHandle = h;
    });

    Browser.addListener('browserFinished', () => {
      setTimeout(() => {
        if (!settled) {
          const cancelled = new Error('Google sign-in cancelled.') as Error & { code?: string };
          cancelled.code = 'auth/popup-closed-by-user';
          fail(cancelled);
        }
      }, 600);
    }).then((h) => {
      browserHandle = h;
    });

    Browser.open({ url: bridgeUrl, presentationStyle: 'popover' }).catch((e) => {
      fail(e instanceof Error ? e : new Error('Unable to open browser for Google sign-in.'));
    });
  });
}

export async function signInWithGoogleFirebase(): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Please check your Firebase credentials in .env');
  }
  if (Capacitor.isNativePlatform()) {
    return await signInWithGoogleNativeBridge();
  }
  return await signInWithPopup(auth, googleAuthProvider);
}

export { firebaseConfig };
