# DuoStyle Google OAuth Login Design

## Goal

Replace the browser-trusted fake Google login with Google OAuth 2.0/OpenID Connect while preserving DuoStyle's existing Spring Security session authentication.

## Architecture

- The frontend sends the browser to `http://localhost:8080/oauth2/authorization/google`.
- Spring Security starts the Google authorization-code flow.
- Google returns the browser to `http://localhost:8080/login/oauth2/code/google`.
- The backend accepts only a Google identity whose email claim is present and verified.
- The backend finds the local user by normalized email or creates a new enabled `ROLE_USER` account.
- Spring Security stores the authenticated user in the existing `JSESSIONID` session.
- The success handler redirects to `http://localhost:5173/?googleLogin=success`; the failure handler redirects with `googleLogin=error`.
- On return, the frontend calls `/api/v1/auth/me` using credentials and restores the existing application login state.

## Backend Components

- Configure Google's OAuth client registration from environment variables.
- Add a focused OAuth user service that validates Google claims and provisions the local user.
- Keep authorities based on local database roles, not claims supplied by the browser.
- Configure OAuth success and failure redirects in `SecurityConfig`.
- Remove the public `POST /api/v1/auth/google` endpoint and its request DTO/service contract.

## Frontend Components

- Replace both prompt-based Google handlers with a full-page redirect to the backend authorization endpoint.
- Parse the OAuth result once when the application loads.
- On success, fetch `/auth/me`, update the existing user/cart state, show a success message, and clean the query string.
- On error, return to the login page, show a Vietnamese error, and clean the query string.

## Configuration

`backend/.env` supplies `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and optionally `GOOGLE_REDIRECT_URI`. Secrets are never committed. The documented local redirect URI is `http://localhost:8080/login/oauth2/code/google`.

## Error Handling

- Missing/unverified Google email fails authentication and returns to the login page.
- Missing local `ROLE_USER` is created consistently with normal registration behavior.
- Existing accounts with the same email are reused instead of duplicated.
- OAuth cancellation returns a visible failure message and does not create a session.

## Testing

- Backend unit tests cover provisioning a new Google user, reusing an existing user, verified-email validation, and local role authorities.
- Security/controller tests cover the OAuth entry point and removal of the fake endpoint contract where practical.
- Frontend tests cover the generated OAuth URL and parsing success/failure return parameters.
- Run the backend test suite and frontend tests/build before completion.
