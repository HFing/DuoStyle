export function getGoogleAuthorizationUrl(apiOrigin = 'http://localhost:8080') {
  return `${apiOrigin.replace(/\/$/, '')}/oauth2/authorization/google`;
}

export function readGoogleLoginResult(search: string) {
  const result = new URLSearchParams(search).get('googleLogin');
  return result === 'success' || result === 'error' ? result : null;
}
