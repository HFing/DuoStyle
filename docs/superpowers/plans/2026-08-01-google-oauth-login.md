# DuoStyle Google OAuth Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace DuoStyle's prompt-based fake Google login with Google OAuth 2.0 authorization-code login backed by the existing Spring Security HTTP session.

**Architecture:** Spring Security owns the Google redirect/callback and persists authentication in `JSESSIONID`. A focused OIDC user service validates the verified email, provisions or reuses the database user, maps local roles to authorities, and the frontend restores state through `/auth/me` after the backend redirects home.

**Tech Stack:** Java 25, Spring Boot 4.1, Spring Security OAuth2 Client/OIDC, JPA, JUnit 5/Mockito, React 19, Vite, Node test runner.

## Global Constraints

- Accept identity only from Google's verified OIDC claims; never accept an email posted by the browser.
- Keep the existing session-based authentication and `JSESSIONID` cookie.
- Read `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` from environment configuration.
- Never place Google credentials in committed source files.
- Redirect success to `http://localhost:5173/?googleLogin=success` and failure to `http://localhost:5173/?googleLogin=error` by default.
- Do not add token storage, JWT, account linking UI, or production deployment behavior.

---

### Task 1: Database-backed OIDC user provisioning

**Files:**
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/security/GoogleOidcUserService.java`
- Create: `backend/src/test/java/com/DuoStyle/DuoStyle/security/GoogleOidcUserServiceTest.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/repository/UserRepository.java`

**Interfaces:**
- Consumes: `OidcUserRequest`, Google claims `email`, `email_verified`, `name`, and local `UserRepository`/`RoleRepository`.
- Produces: `GoogleOidcUserService.loadUser(OidcUserRequest): OidcUser`, whose name is the normalized local email and whose authorities are the local role names.

- [ ] **Step 1: Write failing tests** for rejecting absent/unverified email, reusing an existing case-insensitive email, and creating an enabled user with `ROLE_USER` and a random encoded unusable password.
- [ ] **Step 2: Run** `mvnw.cmd -Dtest=GoogleOidcUserServiceTest test` from `backend`; expect failure because `GoogleOidcUserService` and `findByEmailIgnoreCase` do not exist.
- [ ] **Step 3: Implement minimal provisioning** by extending `OidcUserService`, calling `super.loadUser`, validating `Boolean.TRUE.equals(oidcUser.getEmailVerified())`, normalizing with `trim().toLowerCase(Locale.ROOT)`, reusing `findByEmailIgnoreCase`, and returning a `DefaultOidcUser` with local `SimpleGrantedAuthority` values and name key `email`.
- [ ] **Step 4: Run the focused test** and expect all cases to pass.

### Task 2: Spring Security OAuth wiring and removal of fake backend login

**Files:**
- Create: `backend/src/test/java/com/DuoStyle/DuoStyle/security/GoogleOAuthSecurityTest.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/config/SecurityConfig.java`
- Modify: `backend/src/main/resources/application.yaml`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/controller/AuthController.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/UserService.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/UserServiceImpl.java`
- Delete: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/request/GoogleLoginRequest.java`

**Interfaces:**
- Consumes: `GoogleOidcUserService` from Task 1 and Spring's `/oauth2/authorization/google` plus `/login/oauth2/code/google` endpoints.
- Produces: configured OAuth login that redirects to `${app.frontend-url}/?googleLogin=success` or `${app.frontend-url}/?googleLogin=error`.

- [ ] **Step 1: Write a failing security test** asserting the Google authorization endpoint responds with a redirect and the obsolete `POST /api/v1/auth/google` no longer authenticates a caller.
- [ ] **Step 2: Run** `mvnw.cmd -Dtest=GoogleOAuthSecurityTest test`; expect failure because OAuth login is not configured and the fake endpoint remains.
- [ ] **Step 3: Add client registration properties** under `spring.security.oauth2.client.registration.google` using `${GOOGLE_CLIENT_ID}`, `${GOOGLE_CLIENT_SECRET}`, `${GOOGLE_REDIRECT_URI:http://localhost:8080/login/oauth2/code/google}`, scopes `openid,profile,email`, and authorization grant type `authorization_code`.
- [ ] **Step 4: Configure `.oauth2Login(...)`** with `userInfoEndpoint(...oidcUserService(googleOidcUserService))`, success URL `${app.frontend-url}/?googleLogin=success`, and failure URL `${app.frontend-url}/?googleLogin=error`; permit OAuth endpoints and remove the fake endpoint from the public matcher.
- [ ] **Step 5: Remove the obsolete DTO, controller method, service method, and imports.**
- [ ] **Step 6: Run the focused security test** and expect it to pass.

### Task 3: Frontend OAuth redirect and callback parsing

**Files:**
- Create: `frontend/src/google-auth.js`
- Create: `frontend/src/google-auth.test.js`
- Modify: `frontend/src/pages/LoginPage.jsx`
- Modify: `frontend/src/pages/RegisterPage.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Produces: `getGoogleAuthorizationUrl(apiOrigin = 'http://localhost:8080'): string` and `readGoogleLoginResult(search): 'success' | 'error' | null`.
- Consumes: the backend redirect result and existing `api.get('/auth/me')`, `handleLoginSuccess`, toast, cart reload, and navigation behavior.

- [ ] **Step 1: Write failing Node tests** asserting the exact authorization URL and safe parsing of `googleLogin=success`, `googleLogin=error`, and unsupported/missing values.
- [ ] **Step 2: Run** `npm test -- src/google-auth.test.js`; expect module-not-found failure.
- [ ] **Step 3: Implement the two pure helpers** with `URLSearchParams` and no Google SDK dependency.
- [ ] **Step 4: Run the focused frontend test** and expect it to pass.
- [ ] **Step 5: Replace both prompt handlers** with `window.location.assign(getGoogleAuthorizationUrl())`; remove fake POST bodies and unused Google-specific error state changes.
- [ ] **Step 6: Handle OAuth return in `App.jsx`**: on `success`, call `/auth/me`, feed the user through existing login success behavior, and clean the query; on `error`, navigate to login with a Vietnamese cancellation/failure message and clean the query.
- [ ] **Step 7: Run all frontend tests** with `npm test` and expect zero failures.

### Task 4: Configuration guidance and full verification

**Files:**
- Modify or create if absent: `backend/.env.example`

**Interfaces:**
- Documents the exact variables the developer must copy into the ignored `backend/.env` file.

- [ ] **Step 1: Add non-secret example keys** `GOOGLE_CLIENT_ID=`, `GOOGLE_CLIENT_SECRET=`, and `GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google` without copying real credentials.
- [ ] **Step 2: Run backend tests** with `mvnw.cmd test` from `backend`; expect exit code 0.
- [ ] **Step 3: Run frontend tests and production build** with `npm test` then `npm run build` from `frontend`; expect exit code 0 for both.
- [ ] **Step 4: Search for the removed fake flow** using `rg -n "window\.prompt|/auth/google|GoogleLoginRequest|GOOGLE_ID_TOKEN_OAUTH2" backend/src frontend/src`; expect no matches.
- [ ] **Step 5: Report manual local setup**: place credentials in `backend/.env`, ensure the Google test user is listed under Audience, start backend/frontend, click Google, and verify `/auth/me` returns the signed-in user after callback.
