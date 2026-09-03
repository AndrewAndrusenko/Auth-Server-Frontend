# Frontend Layer: Authentication & User Management (Angular)

This subsystem handles user onboarding, secure route protection, administrative controls, polymorphic credential restoration, and reactive session synchronization. It communicates with the **Central Authentication Service (Auth Service / Internal IdP)** using a secure, cookie-encapsulated JWT architecture driven by modern client-side security best practices.

---

## 🏗️ Core Architectural Components

The module is engineered entirely using modern Angular Standalone design patterns, functional paradigms, and the Signals reactivity ecosystem. Code artifacts are consolidated within the `features/auth` and `core/auth` structure to enforce a clean separation of concerns:

### 1. `JwtHandlerService` (Session Synchronization Engine)
Orchestrates the active state of the client session. It manages account profiles via Angular Signals, provides infrastructure cleanup routines (`purgeAuthSession`), and houses the highly synchronized, loop-free token refresh pipeline driven by RxJS.

### 2. `withCredentialsInterceptor` (`HttpInterceptorFn`)
A transparent transport-level modifier registered at the very top of the HTTP pipeline. Adhering to the **Single Responsibility Principle (SRP)**, its sole purpose is to clone outbound API traffic to explicitly append `{ withCredentials: true }`. This signals the browser engine to attach local authentication cookies to cross-origin requests natively.

### 3. `httpErrorsHandlerInterceptor` (`HttpInterceptorFn`)
A global functional interceptor dedicated to trapping, mapping, and reacting to HTTP network footprints and server errors:
*   **Token Refresh Trigger:** Intercepts `JWT_EXPIRED` (401) responses, pauses downstream traffic, and waits for background session verification.
*   **Terminal Exception Mapping:** Catches system faults (e.g., `ACCESS_FORBIDDEN`, `SERVICE_UNAVAILABLE`, `AUTHENTICATION_FAILED`) and forwards visual feedback toast notifications via the `SnacksService`.

### 4. Route Guards (`CanActivateFn`)
*   **`AuthGuard`:** Evaluates local session signals to secure protected client layouts (e.g., `/dashboard`). Evicts unauthenticated users directly to `/login`.
*   **`AdminGuard`:** Safeguards administrative route configurations by ensuring the active user identity payload contains required `'ADMIN'` clearance roles.

---

## 🔒 Cookie-Encapsulated JWT Security Strategy (HttpOnly + SameSite=Lax)

To achieve maximum protection against Cross-Site Scripting (XSS) token theft vulnerabilities, the JavaScript layer **never captures, stores, or interacts with raw JWT strings**.

*   **Zero Local Footprint:** Tokens are completely absent from `localStorage`, `sessionStorage`, and global window variables.
*   **Browser-Enforced Security:** Authorization lifecycles rely entirely on **HttpOnly, Secure, SameSite=Lax** cookies managed implicitly by the browser's native engine. This architecture avoids the pitfalls of obsolete and heavily restricted `SameSite=None` third-party cookie patterns.
*   **CORS Pipeline:** Seamless cross-domain transport is guaranteed by the global chaining of the `withCredentialsInterceptor` before any error handlers process the traffic.

---

## ⚙️ Reactive Token Synchronization (`exhaustMap` Pattern)

Simultaneous layout rendering often causes a cascade of parallel API requests to fail with a `JWT_EXPIRED` footprint at the exact same millisecond. To resolve this without spawning procedural, error-prone lock variables (like `isRefreshing = true/false`) in the interceptor, the application leverages an elegant **RxJS `exhaustMap` Semaphore Pattern** inside the `JwtHandlerService`.

### 🔄 The Synchronization Pipeline

```text
[ Concurrent Requests ] ──► ( httpErrorsHandlerInterceptor ) ──► [ Catch 401 / JWT_EXPIRED ]
                                                                          │
    ┌─────────────────────────────────────────────────────────────────────┘
    ▼
[ jwtHandlerService.refreshTokenSub.next(true) ]
    │
    ├──► Signal 1 ──► [ exhaustMap Active ] ──► Fires GET /users/refresh to Backend
    ├──► Signal 2 ──► [ exhaustMap Busy ]   ──► IGNORED (Dropped, preventing API flood)
    └──► Signal 3 ──► [ exhaustMap Busy ]   ──► IGNORED (Dropped, preventing API flood)
                                                                          │
    ┌─────────────────────────────────────────────────────────────────────┘
    ▼
[ All In-Flight Requests Subscribe to: refreshTokenReady.pipe(take(1)) ]
    │
    ├──► If Success (true) ─────────► Safely re-fire original next(req) with new cookies
    └──► If Admin Revocation (401) ─► Dispatches purgeAuthSession() & Forces redirect to /login
```

#### Detailed Lifecycle Breakdown:
1. **The Catch:** Multiple concurrent requests get knocked back by the backend due to an expired Access Cookie (`401 JWT_EXPIRED`).
2. **The Signal:** Every chattering request catches the status code and pushes a notification payload to `jwtHandlerService.refreshTokenSub.next(true)`.
3. **The Lockless Filter:** 
   * The primary signal enters the `exhaustMap` pipeline within the service constructor, launching a single active network request to `GET /users/refresh`.
   * While this network call is in-flight, the `exhaustMap` **drops all sibling incoming signals**, neutralizing token refresh spam and network flooding.
4. **The Synchronized Wait:** Parallel requests switch their execution sequence to listen to the `refreshTokenReady` stream via `.pipe(take(1))` and remain suspended in a non-blocking wait state.
5. **The Safe Resolution:** 
   * `catchError` is strategically bound *inside* the inner observable of the `exhaustMap` scope. This critical encapsulation ensures that a failing network transaction transforms into an atomic state emission rather than breaking or halting the outer subscription engine.
   * When the backend writes the new cookies via `Set-Cookie`, the service fires `true` down the stream. The blocked requests re-run `next(req)` and proceed using the freshly baked cookies natively attached by the browser.

### ⛔ Critical Edge-Case: Administrative Session Revocation
Administrators have the capability to instantly wipe or drop any user's active session records from the backend administration dashboard by purging their Refresh Token. 
* When the revoked user's local Access Cookie expires, the background `exhaustMap` task fails with a structural `AUTHENTICATION_FAILED` (401) response.
* The internal `catchError` captures this event, safely packs the error payload, and transmits it down to the `refreshTokenReady` channel.
* The interceptor captures this fatal notification, blocks the cascading request retries from causing infinite retry loops, invokes `purgeAuthSession()` to clear local state variables, and flushes the user straight back to the `/login` portal.

---

## 🔑 Polymorphic Flow Subsystems & Defensive Routing

The architecture reuse-optimizes individual standalone views to behave dynamically based on url parameter entry contexts, employing defensive validation techniques.

### 1. Polymorphic Account Restoration (`PasswordRestoreComponent`)
The password reset journey utilizes a single view component that morphs its state and validation rules by examining the active `ActivatedRoute` snapshot map:
*   **State A: Requesting Reset Link (`formProcess == 'SendEmail'`)**
    *   Triggered via default `/reset-password` navigation. Active inputs evaluate identity parameters via async `validateEmailExist` criteria, setting an anti-spam resend cooldown timeout.
*   **State B: Executing Credential Overwrite (`formProcess == 'ResetPassword'`)**
    *   Triggered if initialized with url parameters (via parametric `/reset-password/:id/:token` or query-string layouts `/reset-password?id=X&token=Y`). Email constraints are detached, injecting strict complexity configurations (`strongPasswordValidation`) and matching validations.

### 2. Defensive Parameter Validation (`EmailConfirmComponent`)
Handles inbound validation links dispatched to user mailboxes. To protect network resources, the engine performs explicit defensive guard boundary evaluation on entry:
*   **Universal Parameter Mapping:** The routing layer scans both `paramMap` and `queryParamMap` properties to safely capture context variables regardless of whether the email template utilized semantic tokens or classic query string variables.
*   **Guard Clauses:** Strict boolean verification (`if (!id || !token)`) filters out incomplete requests at the initialization boundary, blocking corrupted or partial URLs from dispatching futile network traffic to the database.

---

## 💎 Modern Angular Functional Architecture & API Best Practices

The application completely moves away from legacy, object-oriented framework boilerplate, adhering strictly to modern functional APIs and signal-driven reactive design:

*   **Functional Dependency Injection:** All service, router, and configuration dependencies are loaded directly within the class execution scope using the functional `inject()` API tokens, entirely eliminating heavy, non-inlined class constructors.
*   **Signal-Based I/O Properties:** Traditional decorator-based inputs and outputs are replaced with modern `input()`, `input.required()`, and `output()` function wrappers. This ensures incoming values behave as pure reactive signals, forcing strict compliance with compile-time type validation.
*   **Functional View Queries:** DOM element references and child component mappings are handled via compile-time stable `viewChild()` and `viewChildren()` functional queries instead of legacy, error-prone $@ViewChild$ metadata decorators.
*   **Declarative Component Lifecycles (`effect` + `onCleanup`):** Legacy `ngAfterViewInit` lifecycle hooks are completely banned. Input-driven data stream bindings and asynchronous setup procedures are evaluated inside declarative constructor `effect()` blocks. The native `onCleanup` hook is leveraged to cleanly tear down and invalidate previous execution contexts or stale async subscriptions whenever reactive signal boundaries mutate.
*   **Memory Leak Mitigation via `DestroyRef`:** Manual subscription arrays (`this.subscriptions.add()`) are eliminated. Out-of-order component unmounting and asynchronous execution delays are guarded via the declarative **`takeUntilDestroyed(destroyRef)`** operator. If a user triggers a long-lived HTTP transaction or background timer and instantly navigates away from the layout before the stream engine resolves, the context tears down cleanly, preventing ghost operations or detached memory leak threads.

---

## 🛠️ Bootstrapping & Registration Pipeline (Angular Standalone)

> 💡 **Architectural Note for Reviewers:** 
> Interceptors must be injected inside the standalone bootstrap structure in the correct linear order. 
> Transport filters (`withCredentialsInterceptor`) must run *before* the error mapping chains (`httpErrorsHandlerInterceptor`) to ensure that any recursively re-fired requests (`next(req)`) after a successful cookie refresh still go through the complete interceptor lifecycle. Reversing this order will bypass transport configurations on retries, creating unauthorized infinite loops.

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { withCredentialsInterceptor } from './core/interceptors/with-credentials.interceptor';
import { httpErrorsHandlerInterceptor } from './core/interceptors/http-errors.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        withCredentialsInterceptor,     // 1. Injects cross-origin cookies first (Transport Level)
        httpErrorsHandlerInterceptor    // 2. Evaluates global API error responses second (Business/Error Level)
      ])
    )
  ]
};`
