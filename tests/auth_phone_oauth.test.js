import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SUPABASE_URL = 'http://127.0.0.1:54321';

test('AUTH SUITE: Supabase Phone OTP and Google OAuth Configuration', async (t) => {
  const configPath = path.join(rootDir, 'supabase', 'config.toml');
  assert.ok(fs.existsSync(configPath), 'supabase/config.toml must exist');
  const configContent = fs.readFileSync(configPath, 'utf8');

  await t.test('1. config.toml keeps phone OTP on hold without tracked test numbers', () => {
    assert.match(configContent, /\[auth\.sms\]\s*[\s\S]*?enabled\s*=\s*false/, 'auth.sms must be on hold (enabled = false)');
    assert.ok(!configContent.includes('919876543210 = "123456"'), 'Fixed test OTP mappings must not be present in tracked config');
  });

  await t.test('2. config.toml enables auth.external.google with local callback and redirects', () => {
    assert.match(configContent, /\[auth\.external\.google\]\s*[\s\S]*?enabled\s*=\s*true/, 'Google OAuth must be enabled');
    assert.ok(configContent.includes('http://127.0.0.1:54321/auth/v1/callback'), 'OAuth callback must point to local auth callback');
    assert.ok(configContent.includes('http://localhost:3000'), 'Redirects must allow localhost:3000');
    assert.ok(configContent.includes('http://127.0.0.1:3000'), 'Redirects must allow 127.0.0.1:3000');
  });

  await t.test('3. Auth modals enforce real Supabase verification without simulated OTP fallback', () => {
    const unifiedPath = path.join(rootDir, 'src', 'components', 'auth', 'UnifiedAuthModal.tsx');
    const riderAuthPath = path.join(rootDir, 'src', 'components', 'rider', 'RiderAuthModal.tsx');
    const customerAuthPath = path.join(rootDir, 'src', 'components', 'customer', 'AuthScreen.tsx');

    const unifiedContent = fs.readFileSync(unifiedPath, 'utf8');
    const riderContent = fs.readFileSync(riderAuthPath, 'utf8');
    const customerContent = fs.readFileSync(customerAuthPath, 'utf8');

    assert.ok(unifiedContent.includes('supabase.auth.signInWithOtp'), 'UnifiedAuthModal must use Supabase signInWithOtp');
    assert.ok(unifiedContent.includes('supabase.auth.verifyOtp'), 'UnifiedAuthModal must use Supabase verifyOtp');
    assert.ok(riderContent.includes('supabase.auth.signInWithOtp'), 'RiderAuthModal must use Supabase signInWithOtp');
    assert.ok(riderContent.includes('supabase.auth.verifyOtp'), 'RiderAuthModal must use Supabase verifyOtp');
    assert.ok(customerContent.includes('supabase.auth.signInWithOtp'), 'AuthScreen must use Supabase signInWithOtp');
    assert.ok(customerContent.includes('supabase.auth.verifyOtp'), 'AuthScreen must use Supabase verifyOtp');
  });

  await t.test('4. Live Google OAuth authorize endpoint redirects to Google accounts OAuth', async () => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/authorize?provider=google`, { redirect: 'manual' });
    assert.equal(res.status, 302, 'Authorize endpoint must return HTTP 302 Found');
    const location = res.headers.get('location');
    assert.ok(location, 'Location header must be present');
    assert.ok(location.startsWith('https://accounts.google.com/o/oauth2/v2/auth'), 'Location must point to Google OAuth endpoint');
    assert.ok(location.includes('http%3A%2F%2F127.0.0.1%3A54321%2Fauth%2Fv1%2Fcallback'), 'Redirect URI must be encoded local callback');
  });
});
