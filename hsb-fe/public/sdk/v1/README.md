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
- `hsbs-chat.css`: default widget styles.
- `latest.js`: compatibility alias that loads the current v1 loader.

## Runtime endpoints

The SDK calls the backend below using `apiBase`.

- `GET /api/ai/ping`: validates `siteKey`, active status, and allowed domain.
- `GET /api/ai/public/widget-config`: loads tenant widget design and behavior.
- `GET /api/ai/public/prompt-profile`: loads public PromptProfile and WelcomeBlocks.
- `POST /api/ai/complete4`: sends user messages through the FastAPI Brain flow.

All public calls send or include the SiteKey. Chat requests use the `X-HSBS-Site-Key` header.

## Test pages

- `/sdk-test-local.html`: uses `/sdk/v1/hsbs-loader.js` with `http://localhost:8080/api`.
- `/sdk-test-prod.html`: uses `/sdk/v1/hsbs-loader.js` with `https://www.hsbs.kr/api`.
