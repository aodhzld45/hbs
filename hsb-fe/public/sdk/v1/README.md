# HSBS Chat SDK v1

`/sdk/v1` is the official public distribution path for the HSBS chatbot widget.

## Loader install

```html
<script
  src="https://www.hsbs.kr/sdk/v1/hsbs-loader.js"
  data-site-key="{YOUR_SITE_KEY}"
  data-api-base="https://www.hsbs.kr/api"
  data-theme="auto"
  defer
></script>
```

Use same-origin `/api` when the widget is installed on `hsbs.kr` itself. Use an absolute API URL such as `https://www.hsbs.kr/api` only when embedding the SDK from another domain.

## Explicit install

```html
<script src="https://www.hsbs.kr/sdk/v1/hsbs-chat.js"></script>
<script>
  window.HSBS.init({
    siteKey: "{YOUR_SITE_KEY}",
    apiBase: "https://www.hsbs.kr/api",
    theme: "auto"
  });
</script>
```

## Files

- `hsbs-loader.js`: one-line install loader. Reads `data-site-key`, `data-api-base`, `data-theme`, and optional `data-debug`.
- `hsbs-chat.js`: browser IIFE core that exposes `window.HSBS`.
- `hsbs-chat.d.ts`: public TypeScript contract for SDK options, widget instance, and events.
- `hsbs-chat.css`: default widget styles.
- `latest.js`: compatibility alias that loads the current v1 loader.
- `hsbs-manifest.json`: SHA-384/SHA-256 integrity metadata for pinned SDK assets.

## Events

The SDK supports callback hooks on `window.HSBS.init(options)` and DOM `CustomEvent`s on `document`.

- `onReady` / `hsbs:ready`
- `onOpen` / `hsbs:open`
- `onClose` / `hsbs:close`
- `onMessage` / `hsbs:message`
- `onError` / `hsbs:error`
- `onQuotaExceeded` / `hsbs:quotaExceeded`

`window.HSBS.init()` returns a `Promise<HSBSWidgetInstance | null>`.

## Stability options

The SDK has short validation/config timeouts, a separate chat timeout, offline handling, and a bounded retry policy for chat requests.

- `pingTimeoutMs`: SiteKey validation timeout. Default `5000`.
- `configTimeoutMs`: WidgetConfig timeout. Default `5000`.
- `completeTimeoutMs`: chat request timeout. Default `15000`.
- `options.retryMaxAttempts`: total chat attempts including the first request. Default `2`, max `5`.
- `options.retryBaseDelayMs`: exponential backoff base delay. Default `500`.
- `options.retryMaxDelayMs`: maximum backoff delay. Default `4000`.
- `options.retryOnStatusCodes`: comma string or number array. Default `408,502,503,504`.

WidgetConfig `options` may override user-facing fallback text.

- `offlineMessage`
- `timeoutMessage`
- `networkErrorMessage`
- `quotaExceededMessage`
- `serverErrorMessage`
- `retryButtonLabel`

Default automatic retry is intentionally conservative. The SDK does not retry `401`, `403`, or `429` by default because those usually mean invalid credentials, forbidden domain, or quota exhaustion.

```html
<script
  src="https://www.hsbs.kr/sdk/v1/hsbs-loader.js"
  data-site-key="{YOUR_SITE_KEY}"
  data-api-base="https://www.hsbs.kr/api"
  data-retry-max-attempts="3"
  data-retry-base-delay-ms="600"
  data-retry-max-delay-ms="5000"
  data-retry-on-status-codes="408,502,503,504"
  defer
></script>
```

## Error codes

`onError` and `hsbs:error` use stable error codes.

| Code | Meaning |
| --- | --- |
| `SITE_KEY_MISSING` | `siteKey` was not provided. |
| `PING_FAILED` | SiteKey validation returned a non-204 response. |
| `PING_ERROR` | SiteKey validation failed due to network/timeout error. |
| `OFFLINE` | Browser is offline. |
| `WIDGET_CONFIG_LOAD_FAILED` | WidgetConfig load failed; SDK continues with defaults. |
| `CHAT_UNAUTHORIZED` | Chat request returned 401. |
| `CHAT_FORBIDDEN` | Chat request returned 403. |
| `CHAT_HTTP_ERROR` | Chat request returned a non-success status not covered by a specific code. |
| `CHAT_SERVER_ERROR` | Chat request returned 5xx. |
| `CHAT_TIMEOUT` | Chat request timed out. |
| `CHAT_NETWORK_ERROR` | Chat request failed at network level. |
| `QUOTA_EXCEEDED` | Chat request returned 429. |

## CSP

For same-origin install on `hsbs.kr`, keep SDK and API paths same-origin when possible.

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://www.hsbs.kr;
  style-src 'self' https://www.hsbs.kr;
  connect-src 'self' https://www.hsbs.kr;
  img-src 'self' https: data:;
  frame-ancestors 'self';
```

For third-party embedding, add the host page origin to the SiteKey allowed domains and allow HSBS assets/API in CSP.

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://www.hsbs.kr;
  style-src 'self' https://www.hsbs.kr;
  connect-src 'self' https://www.hsbs.kr;
  img-src 'self' https://www.hsbs.kr https: data:;
```

If your policy blocks dynamically injected stylesheets, prefer explicit install and include `hsbs-chat.css` with a normal `<link>` tag.

## SRI and hash manifest

Pinned assets expose SHA metadata at:

```text
https://www.hsbs.kr/sdk/v1/hsbs-manifest.json
```

Loader install with SRI:

```html
<script
  src="https://www.hsbs.kr/sdk/v1/hsbs-loader.js"
  integrity="sha384-wEWagSyJ3TwxVDZVOcCkLzseVXlzeg9jbv5FOb/v9QCqXsKc41oON/lF61nQON7M"
  crossorigin="anonymous"
  data-site-key="{YOUR_SITE_KEY}"
  data-api-base="https://www.hsbs.kr/api"
  defer
></script>
```

Strict SRI install:

```html
<link
  rel="stylesheet"
  href="https://www.hsbs.kr/sdk/v1/hsbs-chat.css"
  integrity="sha384-52g+GWXN9ysvK9hhHNrN/VZVLjWSAMs7uxvcIeWVy68yPULWH2Ds+iAPKzGwhoHm"
  crossorigin="anonymous"
/>
<script
  src="https://www.hsbs.kr/sdk/v1/hsbs-chat.js"
  integrity="sha384-GB0GK4aYkz7JDVfOGafEr/l5pJk87DuW3aAm7+9IUS7I3Ee1h3+ogM9UrgST7j4g"
  crossorigin="anonymous"
></script>
<script>
  window.HSBS.init({
    siteKey: "{YOUR_SITE_KEY}",
    apiBase: "https://www.hsbs.kr/api"
  });
</script>
```

Use `/sdk/v1/hsbs-loader.js` or `/sdk/v1/hsbs-chat.js` for pinned v1 behavior. Keep `latest.js` only for controlled internal tests because it may follow future v1-compatible loader updates.

## Size options

The public SDK reads responsive size settings from WidgetConfig `options` or from `window.HSBS.init({ options })`.

```js
window.HSBS.init({
  siteKey: "HSBS-DEMO-DARK",
  apiBase: "https://www.hsbs.kr/api",
  options: {
    sizePreset: "large-portfolio",
    desktopBubbleSizePx: 128,
    mobileBubbleSizePx: 80,
    desktopPanelWidthPx: 340,
    desktopPanelHeightPx: 480,
    mobileFullscreen: true
  }
});
```

Supported presets:

- `compact`
- `standard`
- `large-portfolio`

## Runtime endpoints

The SDK calls the backend below using `apiBase`.

- `GET /api/ai/ping`: validates `siteKey`, active status, and allowed domain.
- `GET /api/ai/public/widget-config`: loads tenant widget design and behavior.
- `GET /api/ai/public/prompt-profile`: loads public PromptProfile and WelcomeBlocks.
- `POST /api/ai/complete4`: sends user messages through the FastAPI Brain flow.

All public calls send or include the SiteKey. Chat requests use the `X-HSBS-Site-Key` header.

## Test pages

- `/sdk/v1/sdk-test-local.html`: local Phase 2 test console using `http://localhost:8080/api`.
- `/sdk/v1/sdk-test-prod.html`: production Phase 2 test console using same-origin `/api`.

Both test pages expose the same cases:

- normal flow: `ping -> widget-config -> prompt-profile -> complete4`
- bad API: unavailable API base / ping failure
- timeout: forced short `completeTimeoutMs`
- retry: bounded automatic retry using `408,502,503,504`
- quota: use with a low SiteKey `dailyCallLimit` to verify `hsbs:quotaExceeded`
- forbidden: remove the current domain from the SiteKey allowlist to verify 403 handling
