# Frontend Layer: Authentication & User Management (Angular)

This subsystem handles user onboarding, route protection, administrative controls, and reactive session state execution. It communicates securely with the **Central Authentication Service** using a modern, tokenless approach.

---

## 🏗️ Core Architectural Components

The layer is built entirely using Angular (v20) Standalone design patterns and functional paradigms, isolated within the `core/auth` domain:

### 1. `JwtHandlerService` (Session Synchronization Engine)
Orchestrates the active state of the client session. It manages account profiles (via Angular Signals), provides infrastructure cleanup routines (`purgeAuthSession`), and houses the highly synchronized, loop-free token refresh pipeline.

### 2. `withCredentialsInterceptor` (`HttpInterceptorFn`)
A transparent transport modifier registered at the very top of the HTTP pipeline. It clones all outbound API traffic to implicitly append `{ withCredentials: true }`. This signals the browser engine to attach local authentication cookies to cross-origin requests.

### 3. `httpErrorsHandlerInterceptor` (`HttpInterceptorFn`)
A global functional interceptor dedicated to trapping and mapping HTTP error footprints:
*   **Token Refresh Trigger:** Intercepts `JWT_EXPIRED` (401) responses, pauses downstream traffic, and waits for background session verification.
*   **Terminal Exception Mapping:** Catches system faults (e.g., `ACCESS_FORBIDDEN`, `SERVICE_UNAVAILABLE`) and forwards visual toast feedback via the `SnacksService`.

### 4. Route Guards (`CanActivateFn`)
*   **`AuthGuard`:** Evaluates local session signals to secure protected layout views (e.g., `/dashboard`). Evicts unauthenticated users directly to `/login`.
*   **`AdminGuard`:** Decodes verified configuration states to shield advanced system endpoints. Ensures the active identity contains strict `'ADMIN'` claims.

---

## 🔒 Tokenless Cookie Security Strategy (HttpOnly + SameSite=Lax)

To achieve maximum protection against Cross-Site Scripting (XSS) token theft vulnerabilities, the JavaScript layer **never captures, stores, or interacts with raw JWT strings**.

*   **Zero Local Footprint:** Tokens are completely absent from `localStorage`, `sessionStorage`, and memory variables.
*   **Browser-Enforced Security:** Authorization lifecycles rely entirely on **HttpOnly, Secure, SameSite=Lax** cookies managed implicitly by the browser's native engine.
*   **CORS Configuration:** Seamless cross-domain transport is guaranteed by the global chaining of the `withCredentialsInterceptor`.

---

## ⚙️ Reactive Token Synchronization (`exhaustMap` Pattern)

Simultaneous layout rendering often causes a cascade of parallel API requests to fail with a `JWT_EXPIRED` footprint at the exact same millisecond. To resolve this without spawning procedural lock variables, the application leverages an elegant **RxJS `exhaustMap` Semaphore Pattern** inside the `JwtHandlerService`.


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
    ├──► If Success (true) ─────────► Safely re-fire next(req) using newly issued cookies
    └──► If Admin Revocation (401) ─► Dispatches purgeAuthSession() & Forces redirect to /login
```

#### Detailed Lifecycle Breakdown:
1. **The Catch:** Multiple twin requests get knocked back by the backend due to an expired Access Cookie (`401 JWT_EXPIRED`).
2. **The Signal:** Every chattering request catches the status code and pushes a notification payload to `jwtHandlerService.refreshTokenSub.next(true)`.
3. **The Lockless Filter:** 
   * The primary signal enters the `exhaustMap` pipeline within the service constructor, launching a single active network request to `GET /users/refresh`.
   * While this call remains incomplete, the `exhaustMap` **drops all sibling incoming signals**, neutralizing token refresh spam.
4. **The Synchronized Wait:** Parallel requests switch their execution sequence to listen to the `refreshTokenReady` stream via `.pipe(take(1))` and remain suspended in a non-blocking wait state.
5. **The Safe Resolution:** 
   * `catchError` is strategically bound *inside* the `exhaustMap` scope. This ensures that a failing network transaction never breaks or halts the outer subscription engine.
   * When the backend writes the new cookies via `Set-Cookie`, the service fires `true` down the stream. The blocked requests re-run `next(req)` and proceed using the freshly baked cookies.

### ⛔ Critical Edge-Case: Administrative Session Revocation
If an administrator deletes or updates a user's account and clicks **"Revoke Session"**, the backend destroys the corresponding Refresh Token record. 
* When the revoked user's local Access Cookie expires, the background `exhaustMap` task fails with a structural `AUTHENTICATION_FAILED` (401) response.
* The internal `catchError` captures this event, safely packs the error payload, and transmits it down to the `refreshTokenReady` channel.
* The interceptor intercepts this fatal notification, blocks the cascading request retries from locking the application, invokes `purgeAuthSession()` to clear local state variables, and flushes the user straight back to the `/login` portal.

---

## 🔑 Polymorphic Credential Restoration Subsystem

The password reset journey utilizes a single, polymorphic standalone view component (`PasswordRestoreComponent`) that dynamically updates its presentation state and validation matrix by examining the active `ActivatedRoute` snapshot.

### 🧭 Route Mapping & Component States

| Current Flow | Target Route Syntax | Source Identifier | Mechanics & Internal Logic |
| :--- | :--- | :--- | :--- |
| **Request Link** | `/reset-password` | None (`formProcess = 'SendEmail'`) | Validates input via asynchronous `validateEmailExist` criteria. Spawns an anti-spam timeout rule via `authService.setTimerForResend`. |
| **Reset Execution**| `/reset-password/:id/:token` | Route Param or QueryParam (`formProcess = 'ResetPassword'`) | Clears all email requirements. Injects dynamic structural validations (`strongPasswordValidation` & match checks). Submits payload and routes cleanly to `/login`. |

### 🔒 Memory Leak Mitigation via Declarative Lifecycles
To secure the asynchronous nature of background timers and out-of-order component unmounting, manual array subscription aggregation (`this.subscriptions.add()`) is banned. 

Instead, the component uses the modern **`takeUntilDestroyed(destroyRef)`** operator. If a user triggers a reset notification and instantly bounces away from the view layout before the backend responds, the pipeline cancels elegantly. This stops zombie background events from showing invalid snack-bars on incorrect screens.

---

## 🛠️ Bootstrapping & Registration Pipeline (Angular 20 Standalone)

> 💡 **Architectural Note for Reviewers:** 
> Interceptors must be injected inside the standalone bootstrap structure in the correct linear order. 
> Transport filters (`withCredentialsInterceptor`) must run *before* the error mapping chains (`httpErrorsHandlerInterceptor`) to ensure that any recursively re-fired requests (`next(req)`) after a successful cookie refresh still go through the complete interceptor lifecycle. Reversing this order will bypass transport configurations on retries, creating unauthorized infinite loops.

Configure your `app.config.ts` as follows:

```typescript
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
        withCredentialsInterceptor,     // 1. Injects cross-origin cookies first
        httpErrorsHandlerInterceptor    // 2. Evaluates global API error responses second
      ])
    )
  ]
};
```




### Central Authentication Service Client Layer

An **Universal Angular 20** authentication service as a part of  **custom microservice ecosystem**

To be: Identity Provider with asymmetric RS256/ES256, key distribution via JWKS, full isolation of microservices.

A high-performance, **Zoneless Angular 20** application designed for real-time financial data streaming, processing, and viewport rendering optimization. This system serves as the client layer within a broader **custom microservice ecosystem**, connecting seamlessly to independent, custom-built Auth and high-frequency WebSocket streaming servers. 

The client ingests continuous data points via **WebSockets** at a rapid **50ms stream rate**, utilizing sophisticated **RxJS buffering**, **Angular Signals**, and **Virtual Scrolling** to maintain a butter-smooth 60 FPS UI under extreme data loads. 

### 🚀 Key Features

* **⚡ Angular 20 Zoneless & Signals**: Completely free from Zone.js overhead. Uses native Change Detection driven entirely by Angular Signals and RxJS streams for granular, high-performance UI updates.
* **📜 Smooth Virtual Scrolling**: DOM rendering is optimized by recycling views inside the viewport via ScrollingModule. Even with thousands of active tickers, the browser only renders elements currently visible on the screen, drastically reducing rendering overhead.
* **⏱️ 50ms Real-Time Ingestion**: Built to handle high-frequency data streams with a guaranteed microsecond processing pipeline.
* **📊 Smart RxJS Buffering**: Prevents UI freezing by buffering incoming WebSocket emissions and releasing them based on dynamic runtime refresh rates.
* **🔌 Resilient WebSockets**: Features automatic connection retry, backoff strategy, heartbeat ping/pong, and stream repetition on unexpected dropouts.
* **🔒 Secure JWT Auto-Refresh**: Seamlessly intercepts HTTP/WS requests to refresh expired tokens in the background, preventing session interruption.

### 🏗️ Architecture & Optimizations

### 1. Zoneless, Signals & Viewport Optimization

Since the application runs in **Zoneless mode** (completely free from Zone.js overhead), it avoids triggering heavy global change detection cycles on every 50ms WebSocket tick. Instead, UI updates are strictly reactive, driven by a combination of Angular Signals, RxJS streams, and DOM recycling. 

* **Granular Change Detection Control**: The component utilizes ChangeDetectionStrategy.OnPush and natively hooks into the Zoneless engine via the async pipe and dynamic Signals (bufferdTime, savedFilters).
* **RxJS-to-Signal Bridge**: User input from FormControl is seamlessly bridged into the reactive system using toSignal(). This enables lean, declarative tracking of state mutations (like calculating if a newly entered ticker filter is unique) without raw subscription overhead.
* **Viewport View Recycling**: ScrollingModule (Virtual Scrolling) ensures that regardless of the incoming stream volume or total table size, the DOM footprint remains constant. The browser only templates and tracks the nodes currently inside the active viewport.
* **Micro-Optimized DOM Updates**: To prevent the virtual scroll container from completely rebuilding DOM nodes when an updated batch arrives, a precise compound tracking function is implemented. It tracks elements by combining the unique asset symbol and its latest timestamp, allowing Angular to mutate only the text nodes that actually changed.

### Code Insight: Reactive Filters & Micro-Tracking

```// Bridging FormControls into the Signal graph for pure reactive states
private quotesFilterInputSignal = toSignal(
  this.quotesFilterFC.valueChanges.pipe(
    startWith(this.quotesFilterFC.value), 
    debounceTime(200)
  ),
  { initialValue: '' },
);

// Deriving pure calculated state from the UI input signal
public isNewFilterUnique = computed(() => {
  const rawValue = this.quotesFilterInputSignal();
  if (!rawValue) return false;
  
  const formattedValue = rawValue
    .split(',')
    .flatMap((el) => (el.trim() ? [el.trim().toUpperCase()] : []))
    .join(',');
    
  return formattedValue.length > 0 && !this.savedFilters().includes(formattedValue);
});

// Precision DOM node recycling for high-frequency 50ms streaming
trackQuotes(index: number, item: IRate): string {
  return item.symbol + item.time;
}
```

### 2. Business Logic Orchestration & RxJS Buffering Strategy

Data stream management is separated from the network transport layer into a dedicated QuotesDataService. It orchestrates high-frequency data ingestion, state flattening, and stream health monitoring using advanced RxJS reactive patterns. 

* **Dynamic Reactively Switched Buffering**: The application allows users to dynamically adjust the UI refresh rate at runtime. By piping a BehaviorSubject of the buffer time into a switchMap, the downstream buffer window updates instantly without dropping or resetting the underlying WebSocket connection.
* **High-Volume Flattening & Deduplication**: To maximize rendering performance, rapid raw data packets arriving every 50ms are accumulated inside bufferTime. The buffered batches are then flattened, and historical keys are overwritten inside a local stateful Map, ensuring only the latest unique financial rates are pushed to the UI.
* **Reactive Watchdog Pattern**: A silent health-check stream monitors data frequency. Every emission resets an internal RxJS timer. If the server stops producing data points for longer than the configured threshold (e.g., 5500ms), the watchdog instantly triggers a UI notification and shifts the stream status, even if the TCP connection remains technically alive.

### Code Insight: Buffer Toggling & Watchdog Execution
```
// 1. Dynamic Buffer Switching & State Flattening
private createQuoteStream(): void {
  this._quotesBufferTime$
    .pipe(
      switchMap((bufferPeriod) => {
        return this.wssCore.serverStream$.pipe(
          bufferTime(bufferPeriod),
          filter((buffer) => buffer.length > 0),
          map((bufferArrays) => {
            // Flatten rapid batches and deduplicate by unique symbol
            const flatBuffer = bufferArrays.flat();
            flatBuffer.forEach((rate) => this.quotesDataMap.set(rate.symbol, rate));
            return Array.from(this.quotesDataMap.values());
          }),
        );
      }),
      takeUntil(this.destroyQuoteStreams$),
    )
    .subscribe((quotesArray) => this._quotesData$.next(quotesArray));
}

// 2. Stream Inactivity Watchdog (Heartbeat Failure Detection)
private createWatchDogStream(): void {
  this.wssCore.serverStream$
    .pipe(
      switchMap(() =>
        timer(this.CONFIG.STREAM_TIMEOUT).pipe(
          map(() => false), // Stream is considered dead due to inactivity timeout
          startWith(true),  // Stream is healthy on fresh data point
        ),
      ),
      distinctUntilChanged(),
      takeUntil(this.destroyQuoteStreams$),
    )
    .subscribe((isActive) => {
      this.wssCore.streamActive !== isActive ? this.wssCore.setStreamActive(isActive) : null;
      if (!isActive) {
        this.snacksService.openSnack('Warning: No new data received...', 'Okay', 'error-snackBar');
      }
    });
}
```

### 3. Connection Resilience & WebSocket Lifecycle

The network layer is managed by a standalone WebSocketService built using rxjs/webSocket. Instead of basic reconnect loops, it implements production-grade resilience strategies to communicate with our standalone backend nodes: 

* **⚡ Exponential Backoff with Jitter**: Reconnection delays grow exponentially (Math.pow(2, attempt)) combined with a random jitter factor (0.7 to 1.3) to prevent thundering herd problems on the server.
* **🔒 Inline JWT Token Refresh**: If a connection drops due to token expiration, the reconnect pipeline intercepts the failure, triggers a silent background refresh flow via JwtHandlerService, and delays the reconnection attempt until a new token is obtained.
* **⏱️ EMA Network Latency Tracking**: Keeps the connection alive using a strict Ping/Pong heartbeat interval. To prevent erratic metric jumps in the UI, network latency is smoothed out in real-time using an **Exponential Moving Average (EMA)** algorithm.

### Code Insight: The Resilient Reconnect Loop
```
private reconnecting<T>(): MonoTypeOperatorFunction<T> {
  let retryAttemptNum = 0;
  
  const retryDelay = () => {
    retryAttemptNum++;
    const errorCode = this.closeConnectionErrorCode || 503;
    const error = SERVER_ERRORS.get(errorCode)!;

    // Max attempts reached or terminal server error
    if (error?.retryConnection === false || this.CONFIG.RETRY_ATTEMPTS + 1 === retryAttemptNum) {
      this.disconnectServer(error, errorCode);
      return EMPTY;
    }

    // Intercept connection loss due to expired JWT
    if (error?.authErr) {
      return this.jwtService.refreshTokenAndWait$().pipe(
        switchMap((tokenRefreshed) => {
          if (tokenRefreshed) {
            this._connectionState$.next('Reconnecting');
            return of(1); // Resume stream connection loop
          }
          this.disconnectServer(error, errorCode);
          return EMPTY;
        })
      );
    }

    // Standard reconnection with Exponential Backoff & Jitter
    if (error?.retryConnection) {
      const exponentDelay = Math.pow(2, retryAttemptNum) * this.CONFIG.RETRY_INTERVAL;
      const jitterRate = 0.7 + Math.random() * 0.6; // 0.7 - 1.3 jitter
      const finalDelay = Math.round(exponentDelay * jitterRate);
      
      this._connectionState$.next('Reconnecting');
      return of(1).pipe(delay(finalDelay));
    }

    this.disconnectServer(error, errorCode);
    return EMPTY;
  };

  return (source$) =>
    source$.pipe(
      repeat({ delay: retryDelay }), // Reconnect when stream completes cleanly
      retry({ delay: retryDelay })   // Reconnect when stream throws an error
    );
}
```

### ⚙️ Runtime Configuration

The application uses a **runtime configuration pattern** instead of build-time environment variables. This allows swapping environment targets, backend endpoints, and stream thresholds dynamically without rebuilding the Angular application artifact. 

The configuration is loaded at startup from public/env.config.prod.json and points directly to our active development mesh services: 
```
{
  "production": false,
  "TEST_WS_ENDPOINT": "wss://ppklrx85-3003.euw.devtunnels.ms",
  "AUTH_SERVER_ENDPOINT": "https://ppklrx85-3010.euw.devtunnels.ms/users/",
  "AUTH_SERVER_UI_ADDRESS": "https://ppklrx85-5001.euw.devtunnels.ms/apps/ssngrx/register/logout/:logout",
  "RETRY_INTERVAL": 1000,
  "RETRY_ATTEMPTS": 2,
  "STREAM_TIMEOUT": 5500,
  "PING_HEARTBEAT_INTERVAL": 15000,
  "SUCCESS_TIME_OUT": 2000,
  "BUFFER_TIME_DEFAULT": 500,
  "MIN_BUFFER_TIME": 50
}
```
### Key Parameter Breakdown

* **⚡ Stream Tuning**: 

  * BUFFER_TIME_DEFAULT & MIN_BUFFER_TIME: Controls the RxJS bufferTime window for bundling rapid high-frequency WebSocket updates before triggering UI Change Detection.
  * STREAM_TIMEOUT: The maximum allowed inactivity period before the stream is considered dead and triggers a fallback.
* **🔌 Resilient Connection**: 

  * RETRY_INTERVAL & RETRY_ATTEMPTS: Defines the backoff interval and maximum reconnection attempts for the WebSocket stream.
  * PING_HEARTBEAT_INTERVAL: Keeps the connection alive and instantly detects silent drops.

### 🛠️ Getting Started

### Prerequisites

* **Node.js**: v22+
* **Angular CLI**: v20.0.0+

### Available Scripts

* **npm run start**: Runs the app in development mode at http://localhost:4200/ with hot-reloading.
* **npm run build**: Compiles the application into production-ready static assets in the dist/ directory, optimized for maximum performance.

### 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
