import assert from 'node:assert/strict';
import test from 'node:test';

import { getGoogleAuthorizationUrl, readGoogleLoginResult } from './utils/google-auth.ts';

test('Google login starts at the Spring Security authorization endpoint', () => {
  assert.equal(
    getGoogleAuthorizationUrl(),
    'http://localhost:8080/oauth2/authorization/google',
  );
});

test('Google callback accepts only supported result values', () => {
  assert.equal(readGoogleLoginResult('?googleLogin=success'), 'success');
  assert.equal(readGoogleLoginResult('?googleLogin=error'), 'error');
  assert.equal(readGoogleLoginResult('?googleLogin=unknown'), null);
  assert.equal(readGoogleLoginResult(''), null);
});
