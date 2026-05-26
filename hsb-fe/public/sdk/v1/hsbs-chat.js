(function () {
  if (window.HSBS && typeof window.HSBS.init === 'function') {
    console.warn('[HSBS] 이미 로드되었습니다, 중복된 스크립트는 스킵되었습니다.');
    return;
  }

  const DEFAULT_API_BASE = '/api';

  // ===== 내부 유틸 =====
  const ss = window.sessionStorage;
  const onceKey = (k) => `hsbs_once_${k}`;

  function escapeCssString(s) {
    return JSON.stringify(String(s || '')).replace(/\\u/g, '\\u');
  }
 
  // 아바타(원형) 엘리먼트 생성: 이미지 → 이모지 → 이니셜
  function createCircleAvatar({ size = 28, imgUrl, emoji = '💬', initial = 'H', title }) {
    const wrap = document.createElement('div');
    wrap.className = 'hsbs-avatar';
    wrap.style.width = `${size}px`;
    wrap.style.height = `${size}px`;
    if (title) wrap.title = title;

    if (imgUrl) {
      const img = document.createElement('img');
      img.alt = title || 'icon';
      img.src = imgUrl;
      img.onload = () => {
        wrap.appendChild(img);
      };
      img.onerror = () => {
        wrap.appendChild(document.createTextNode(emoji || initial));
      };
      return wrap; // onload/onerror 후 자식 결정
    }
    // 이미지가 없으면 이모지/이니셜 즉시
    wrap.appendChild(document.createTextNode(emoji || initial || 'H'));
    return wrap;
  }

  // 스타일 시트 로드: hsbs-chat.css (같은 경로 기준). 디자인은 CSS에서, 값은 #hsbs-root 변수로 주입.
  function ensureWidgetStylesheet() {
    if (document.getElementById('hsbs-widget-css')) return;
    var link = document.createElement('link');
    link.id = 'hsbs-widget-css';
    link.rel = 'stylesheet';
    link.href = (function () {
      var script = document.currentScript || document.querySelector('script[src*="hsbs-chat"]');
      if (script && script.src) {
        return script.src.replace(/hsbs-chat[^.]*\.js(\?.*)?$/, 'hsbs-chat.css');
      }
      return 'hsbs-chat.css';
    })();
    document.head.appendChild(link);
  }
  
  function appendMessage($body, role, text) {
    const div = document.createElement('div');
    div.className = 'hsbs-msg ' + (role === 'user' ? 'hsbs-user' : 'hsbs-bot');
    div.textContent = text;
    $body.appendChild(div);
    $body.scrollTop = $body.scrollHeight;
    return div;
  }

  function resolveAssetUrl(resourceUrl, cfg) {
    if (!resourceUrl) return null;
    const u = String(resourceUrl).trim();
    if (/^https?:\/\//i.test(u)) return u; // 절대 URL
    const api = new URL(cfg.apiBase, window.location.href); // ex) http://localhost:8080/api
    const baseRootHref = api.href.replace(/\/api\/?$/, '/'); // -> http://localhost:8080/
    return new URL(u, baseRootHref).href; // ex) /files/x.png -> http://localhost:8080/files/x.png
  }

  // PromptProfile - welcomeBlocksJson 부분 start
  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  // siteKey 기준 welcomeBlocksJson 캐시 키
  const ppWelcomeKey = (siteKey) => `hsbs_pp_welcome_${siteKey}`;

  // siteKey -> PromptProfile welcomeBlocksJson (public)
  async function fetchWelcomeBlocksJsonBySiteKey(cfg) {
    const cacheK = ppWelcomeKey(cfg.siteKey);
    const cacheTsK = cacheK + '_ts';
    const ttlMs = 10 * 60 * 1000; // 10분
  
    const cached = ss.getItem(cacheK);
    const ts = Number(ss.getItem(cacheTsK) || 0);
  
    const endpoints = [
      `${cfg.apiBase}/ai/public/prompt-profile?siteKey=${encodeURIComponent(cfg.siteKey)}`,
      `${cfg.apiBase}/ai/public/prompt-profile-welcome?siteKey=${encodeURIComponent(cfg.siteKey)}`,
    ];
  
    // 1) 먼저 항상 서버 최신 시도
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) continue;
  
        const data = await res.json();
        const json = data?.welcomeBlocksJson;
  
        if (typeof json === 'string' && json.trim()) {
          ss.setItem(cacheK, json);
          ss.setItem(cacheTsK, String(Date.now()));
          return json; // 최신 성공
        }
      } catch {}
    }
  
    // 2) 서버 실패/빈값이면 캐시 폴백 (TTL 안 지났으면 캐시, 지나도 캐시라도 반환)
    if (cached) {
      // (선택) TTL 지났으면 여기서 캐시 제거할 수도 있음
      if (Date.now() - ts >= ttlMs) { ss.removeItem(cacheK); ss.removeItem(cacheTsK); }
      return cached;
    }
  
    return null;
  }

  // welcomeBlocksJson -> DOM 렌더
  function renderWelcomeBlocks($body, welcomeBlocksJson, cfg, onClickPayload) {
    const prev = $body.querySelector('.hsbs-wb-wrap');
    if (prev) prev.remove();
    const root = safeJsonParse(welcomeBlocksJson);
    const items = Array.isArray(root) ? root : Array.isArray(root?.items) ? root.items : [];
    if (!items.length) return null;

    // wrapper (간격/정렬)
    const $wrap = document.createElement('div');
    $wrap.className = 'hsbs-wb-wrap';

    // 카드/이미지/텍스트 렌더
    items
      .slice()
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
      .forEach((it) => {
        if (!it || typeof it !== 'object') return;

        const type = String(it.type || '').toLowerCase();
        const d = it.data || {};

        // 공통 카드 컨테이너
        const $card = document.createElement('div');
        $card.className = 'hsbs-wb-card';

        if (type === 'text') {
          if (d.title) {
            const $t = document.createElement('div');
            $t.className = 'hsbs-wb-title';
            $t.textContent = d.title;
            $card.appendChild($t);
          }
          const $p = document.createElement('div');
          $p.className = 'hsbs-wb-text';
          $p.textContent = d.body || d.text || '';
          $card.appendChild($p);
          $wrap.appendChild($card);
          return;
        }

        if (type === 'image') {
          const imgPath = d.imagePath || d.url || '';
          if (imgPath) {
            const $img = document.createElement('img');
            $img.className = 'hsbs-wb-img';
            $img.alt = d.alt || '';
            $img.src = resolveAssetUrl(imgPath, cfg) || imgPath;
            $card.appendChild($img);
          }
          if (d.caption) {
            const $cap = document.createElement('div');
            $cap.className = 'hsbs-wb-caption';
            $cap.textContent = d.caption;
            $card.appendChild($cap);
          }
          $wrap.appendChild($card);
          return;
        }

        // card
        if (type === 'card') {
          const $row = document.createElement('div');
          $row.className = 'hsbs-wb-row';

          // left image
          const $thumb = document.createElement('div');
          $thumb.className = 'hsbs-wb-thumb';

          const imgPath = d.imagePath || '';
          if (imgPath) {
            const $img = document.createElement('img');
            $img.alt = '';
            $img.src = resolveAssetUrl(imgPath, cfg) || imgPath;
            $thumb.appendChild($img);
          } else {
            const $no = document.createElement('div');
            $no.className = 'hsbs-wb-noimg';
            $no.textContent = 'no image';
            $thumb.appendChild($no);
          }

          // right content
          const $content = document.createElement('div');
          $content.className = 'hsbs-wb-content';

          const $title = document.createElement('div');
          $title.className = 'hsbs-wb-title';
          $title.textContent = d.title || '';
          $content.appendChild($title);

          if (d.desc) {
            const $desc = document.createElement('div');
            $desc.className = 'hsbs-wb-desc';
            $desc.textContent = d.desc;
            $content.appendChild($desc);
          }

          $row.appendChild($thumb);
          $row.appendChild($content);
          $card.appendChild($row);

          // buttons (오른쪽 정렬)
          const btns = Array.isArray(d.buttons) ? d.buttons : [];
          if (btns.length) {
            const $btnWrap = document.createElement('div');
            $btnWrap.className = 'hsbs-wb-btn-wrap';

            btns.forEach((b) => {
              if (!b?.label || !b?.payload) return;
              const $b = document.createElement('button');
              $b.type = 'button';
              $b.className = 'hsbs-wb-btn';
              $b.textContent = b.label;
              $b.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                onClickPayload && onClickPayload(String(b.payload));
              });              
              $btnWrap.appendChild($b);
            });

            $card.appendChild($btnWrap);
          }

          $wrap.appendChild($card);
          return;
        }

        // cards(여러 카드)까지 나중에 확장 가능
      });

    $body.appendChild($wrap);
    $body.scrollTop = $body.scrollHeight;
    return $wrap;
  }

  function renderWelcomeTextOnce($body, text) {
    let el = $body.querySelector('.hsbs-welcome-text');
    if (!el) {
      el = document.createElement('div');
      el.className = 'hsbs-msg hsbs-bot hsbs-welcome-text';
      // body 맨 위에 고정(원하면 append로 변경 가능)
      $body.appendChild(el);
    }
    el.textContent = text;
    $body.scrollTop = $body.scrollHeight;
  }
  // end

  // 이전 위젯 상태 관리(재 init 시 정리용)
  let widgetState = null;

  function teardown() {
    if (!widgetState) return;
    const { root, bubble, panel, escHandler, outsideHandler } = widgetState;
    try {
      if (escHandler) window.removeEventListener('keydown', escHandler);
      if (outsideHandler) document.removeEventListener('click', outsideHandler);

      // root가 있으면 root만 제거하면 bubble/panel도 같이 제거됨
      if (root && root.parentNode) root.parentNode.removeChild(root);
      else {
        if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble);
        if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
      }
    } catch (e) {
      console.warn('[HSBS] teardown 예외:', e);
    } finally {
      widgetState = null;
    }
  }

  // ===== 메인 초기화 =====
  async function init(opts) {
    const cfg = Object.assign(
      {
        apiBase: DEFAULT_API_BASE,
        siteKey: null,
        debug: false, // 강제 디버그(서버 설정과 OR)
      },
      opts || {}
    );

    if (!cfg.siteKey) {
      console.warn('[HSBS] siteKey가 없어 위젯을 표시하지 않습니다.');
      return;
    }

    // 기존 위젯 있으면 정리 (재 init 대비)
    teardown();

    // 1) 사전 검증: /ai/ping
    try {
      const r = await fetch(`${cfg.apiBase}/ai/ping?siteKey=${encodeURIComponent(cfg.siteKey)}`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (r.status !== 204) {
        let detail = '';
        try {
          const ct = r.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await r.json();
            detail = j?.message ? `${j.code ?? 'ERROR'}: ${j.message}` : JSON.stringify(j);
          } else {
            detail = await r.text();
          }
        } catch {}
        const msg = `[HSBS] ping 실패: ${r.status}${detail ? ' - ' + detail : ''}`;
        console.warn(msg);
        if (cfg.debug) console.warn(msg);
        return;
      }
    } catch (e) {
      console.warn('[HSBS] ping 예외:', e);
      if (cfg.debug) console.warn('[HSBS] ping 예외:', e);
      return;
    }

    // 2) 위젯 설정 불러오기: /public/widget-config
    let wc = null;
    try {
      const res = await fetch(`${cfg.apiBase}/ai/public/widget-config?siteKey=${encodeURIComponent(cfg.siteKey)}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`widget-config ${res.status}`);
      wc = await res.json();
    } catch (e) {
      console.warn('[HSBS] widget-config 로드 실패, 기본값으로 진행:', e?.message || e);
      wc = {};
    }

    // 2-1) PromptProfile welcomeBlocksJson 로드 (public)
    let welcomeBlocksJson = null;
    try {
      welcomeBlocksJson = await fetchWelcomeBlocksJsonBySiteKey(cfg);
    } catch (e) {
      if (cfg.debug) console.warn('[HSBS] welcomeBlocksJson 로드 실패:', e);
    }

    // 3) 서버 응답 → merged 매핑
    const opt = wc && wc.options ? wc.options : {};

    const merged = {
      // 배치/위치
      position: wc.position || 'right', // 'left'|'right'
      offsetX: wc.offsetX ?? 20,
      offsetY: wc.offsetY ?? 20,
      panelWidthPx: wc.panelWidthPx ?? 360,
      zIndex: wc.zIndex ?? 2147483000,
      panelMaxHeightPx: wc.panelMaxHeightPx ?? null,

      // 스타일(크기/타이포/그림자) — 관리자에서 설정 가능
      panelBorderRadiusPx: wc.panelBorderRadiusPx ?? null,
      bubbleSizePx: wc.bubbleSizePx ?? null,
      bubbleIconSizePx: wc.bubbleIconSizePx ?? wc.bubble_icon_size_px ?? null,
      inputBorderRadiusPx: wc.inputBorderRadiusPx ?? null,
      sendButtonRadiusPx: wc.sendButtonRadiusPx ?? null,
      fontFamily: wc.fontFamily || null,
      fontSizeBasePx: wc.fontSizeBasePx ?? null,
      headerFontSizePx: wc.headerFontSizePx ?? null,
      boxShadow: wc.boxShadow || null,
      bubbleBoxShadow: wc.bubbleBoxShadow || null,
      sendButtonStyle: (wc.sendButtonStyle === 'icon' || wc.sendButtonStyle === 'icon-text') ? wc.sendButtonStyle : 'text',

      // 동작(Y/N → boolean)
      openOnLoad: wc.openOnLoad === 'Y',
      greetOncePerOpen: wc.greetOncePerOpen !== 'N',
      closeOnEsc: wc.closeOnEsc !== 'N',
      closeOnOutsideClick: wc.closeOnOutsideClick !== 'N',

      // 표시/브랜딩
      brandName: wc.brandName || 'HSBS',
      panelTitle: wc.panelTitle || 'HSBS Assistant',
      welcomeText: wc.welcomeText || '무엇을 도와드릴까요?',
      inputPlaceholder: wc.inputPlaceholder || '메시지를 입력하세요',
      sendButtonLabel: wc.sendButtonLabel || '보내기',
      bubbleIconEmoji: wc.bubbleIconEmoji || '💬',
      logoUrl: wc.logoUrl ? resolveAssetUrl(wc.logoUrl, cfg) : null,
      bubbleIconUrl: wc.bubbleIconUrl ? resolveAssetUrl(wc.bubbleIconUrl, cfg) : null,

      // 색상
      primaryColor: wc.primaryColor || '#4f46e5',
      panelBgColor: wc.panelBgColor || '#111827',
      panelTextColor: wc.panelTextColor || '#e5e7eb',
      headerBgColor: wc.headerBgColor || '#0b0f1a',
      headerBorderColor: wc.headerBorderColor || '#1f2937',
      inputBgColor: wc.inputBgColor || '#0f1422',
      inputTextColor: wc.inputTextColor || '#e5e7eb',

      welcomeBlocksJson: welcomeBlocksJson,

      // 초기 추천 질문(퀵리플라이)
      welcomeQuickReplies: (() => {
        let arr = [];

        // options.welcomeQuickReplies 배열 우선
        if (Array.isArray(opt.welcomeQuickReplies)) {
          arr = opt.welcomeQuickReplies;
        }
        // 혹시 나중에 JSON 문자열로 줄 수도 있으니 백업 플랜
        else if (typeof opt.welcomeQuickRepliesJson === 'string' && opt.welcomeQuickRepliesJson.trim()) {
          try {
            const parsed = JSON.parse(opt.welcomeQuickRepliesJson);
            if (Array.isArray(parsed)) arr = parsed;
          } catch (e) {
            console.warn('[HSBS] welcomeQuickRepliesJson 파싱 실패:', e);
          }
        }

        return arr
          .filter(
            (r) =>
              r &&
              typeof r.label === 'string' &&
              typeof r.payload === 'string' &&
              r.label.trim() &&
              r.payload.trim()
          )
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      })(),

      // 로깅
      debug: cfg.debug,
    };

    // 4) 스타일 시트 로드 + 위젯 루트 생성 + CSS 변수는 #hsbs-root 에만 주입
    ensureWidgetStylesheet();

    const $root = document.createElement('div');
    $root.id = 'hsbs-root';
    $root.dataset.position = merged.position === 'left' ? 'left' : 'right';

    // CSS 변수(스코프: #hsbs-root) — 스타일 시트(hsbs-chat.css)에서 참조
    $root.style.setProperty('--hsbs-accent', merged.primaryColor);
    $root.style.setProperty('--hsbs-bg', merged.panelBgColor);
    $root.style.setProperty('--hsbs-bg-2', merged.headerBgColor);
    $root.style.setProperty('--hsbs-border', merged.headerBorderColor);
    $root.style.setProperty('--hsbs-input-bg', merged.inputBgColor);
    $root.style.setProperty('--hsbs-text', merged.panelTextColor);
    $root.style.setProperty('--hsbs-z', String(merged.zIndex));
    $root.style.setProperty('--hsbs-panel-w', `${merged.panelWidthPx}px`);
    $root.style.setProperty('--hsbs-offset-x', `${merged.offsetX}px`);
    $root.style.setProperty('--hsbs-offset-y', `${merged.offsetY}px`);
    $root.style.setProperty('--hsbs-send-text', escapeCssString(merged.sendButtonLabel));
    if (merged.panelMaxHeightPx) $root.style.setProperty('--hsbs-max-h', `${merged.panelMaxHeightPx}px`);
    if (merged.panelBorderRadiusPx != null) $root.style.setProperty('--hsbs-radius', `${merged.panelBorderRadiusPx}px`);
    if (merged.bubbleSizePx != null) $root.style.setProperty('--hsbs-bubble-size', `${merged.bubbleSizePx}px`);
    $root.style.setProperty('--hsbs-bubble-inner-size', `${merged.bubbleIconSizePx ?? 36}px`);
    if (merged.inputBorderRadiusPx != null) $root.style.setProperty('--hsbs-input-radius', `${merged.inputBorderRadiusPx}px`);
    if (merged.sendButtonRadiusPx != null) $root.style.setProperty('--hsbs-send-radius', `${merged.sendButtonRadiusPx}px`);
    if (merged.fontFamily) $root.style.setProperty('--hsbs-font-family', merged.fontFamily);
    if (merged.fontSizeBasePx != null) $root.style.setProperty('--hsbs-font-size', `${merged.fontSizeBasePx}px`);
    if (merged.headerFontSizePx != null) $root.style.setProperty('--hsbs-header-font-size', `${merged.headerFontSizePx}px`);
    if (merged.boxShadow) $root.style.setProperty('--hsbs-box-shadow', merged.boxShadow);
    if (merged.bubbleBoxShadow) $root.style.setProperty('--hsbs-bubble-shadow', merged.bubbleBoxShadow);

    // 5) UI 구성 — 버블(아이콘/이모지/이니셜)
    const brandInitial = (merged.brandName && merged.brandName.trim().charAt(0).toUpperCase()) || 'H';
    const bubbleImgUrl = merged.bubbleIconUrl || merged.logoUrl;
    const bubbleEmoji = merged.bubbleIconEmoji || '💬';

    // 버블 버튼
    const $bubble = document.createElement('button');
    $bubble.id = 'hsbs-chat-bubble';
    $bubble.type = 'button';
    $bubble.setAttribute('aria-label', 'Open chat');
    $bubble.setAttribute('aria-expanded', 'false');
    $bubble.setAttribute('aria-controls', 'hsbs-chat-panel');
    const bubbleInnerSizePx = merged.bubbleIconSizePx ?? 36;
    const $bubbleInner = document.createElement('div');
    $bubbleInner.className = 'inner';
    $bubbleInner.style.width = bubbleInnerSizePx + 'px';
    $bubbleInner.style.height = bubbleInnerSizePx + 'px';
    $bubbleInner.appendChild(
      createCircleAvatar({
        size: bubbleInnerSizePx,
        imgUrl: bubbleImgUrl,
        emoji: bubbleEmoji,
        initial: brandInitial,
        title: '채팅 아이콘',
      })
    );
    $bubble.appendChild($bubbleInner);

    // 패널 스켈레톤
    const $panel = document.createElement('div');
    $panel.id = 'hsbs-chat-panel';
    $panel.setAttribute('role', 'dialog');
    $panel.setAttribute('aria-label', 'HSBS Chat');
    $panel.setAttribute('aria-modal', 'false');

    const $header = document.createElement('div');
    $header.id = 'hsbs-chat-header';

    const $body = document.createElement('div');
    $body.id = 'hsbs-chat-body';

    const $footer = document.createElement('div');
    $footer.id = 'hsbs-chat-footer';

    // 헤더(로고 아바타 + 타이틀)
    $header.appendChild(
      createCircleAvatar({
        size: 20,
        imgUrl: merged.logoUrl,
        emoji: bubbleEmoji,
        initial: brandInitial,
        title: '브랜드 로고',
      })
    );
    const $title = document.createElement('span');
    $title.textContent = merged.panelTitle;
    $header.appendChild($title);

    // 푸터(입력창 + 전송 버튼)
    const $input = document.createElement('input');
    $input.id = 'hsbs-chat-input';
    $input.placeholder = merged.inputPlaceholder;
    $input.type = 'text';

    const $send = document.createElement('button');
    $send.id = 'hsbs-chat-send';
    $send.type = 'button';
    $send.dataset.style = merged.sendButtonStyle || 'text';
    $send.setAttribute('aria-label', merged.sendButtonLabel || '보내기');


    $footer.appendChild($input);
    $footer.appendChild($send);

    $panel.appendChild($header);
    $panel.appendChild($body);
    $panel.appendChild($footer);

    $root.appendChild($bubble);
    $root.appendChild($panel);
    document.body.appendChild($root);

    // 5-1) 초기 추천 질문(퀵리플라이) DOM 준비
    const quickReplies = merged.welcomeQuickReplies || [];
    let $quickWrap = null;

    if (quickReplies.length > 0) {
      $quickWrap = document.createElement('div');
      $quickWrap.className = 'hsbs-quick-wrap';

      quickReplies.forEach((qr) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hsbs-quick-btn';
        btn.textContent = qr.label;
        btn.addEventListener('click', () => {
          ask(qr.payload);
        });
        $quickWrap.appendChild(btn);
      });
    }

    // 6) 동작(열기/환영문/ESC/바깥클릭)
    function openPanel() {
      $panel.style.display = 'flex';
      $bubble.setAttribute('aria-expanded', 'true');


      const k = onceKey(`greet_${cfg.siteKey}`);

      // 환영영역: blocks 우선 -> 없으면 welcomeText
      const renderWelcome = () => {
        // 중복 방지: 기존 환영영역(텍스트/블록) 정리
        const prevText = $body.querySelector('.hsbs-welcome-text');
        if (prevText) prevText.remove();
      
        const prevBlocks = $body.querySelector('.hsbs-wb-wrap');
        if (prevBlocks) prevBlocks.remove();
      
        let rendered = false;
      
        // 1) 텍스트 먼저
        if (merged.welcomeText) {
          renderWelcomeTextOnce($body, merged.welcomeText);
          rendered = true;
        }
      
        // 2) 그 다음 blocks
        if (merged.welcomeBlocksJson) {
          renderWelcomeBlocks($body, merged.welcomeBlocksJson, cfg, (payload) => ask(payload));
          rendered = true;
        }
      
        return rendered;
      };

      if (merged.greetOncePerOpen) {
        if (!ss.getItem(k)) {
          renderWelcome();
          ss.setItem(k, '1');
        }
      } else {
        renderWelcome();
      }

      // 퀵리플라이 버튼 표시 (한 번만 붙이기)
      if ($quickWrap && !$quickWrap.isConnected) {
        $body.appendChild($quickWrap);
      }

      $input.focus();
    }

    function closePanel() {
      $panel.style.display = 'none';
      $bubble.setAttribute('aria-expanded', 'false');
      ss.removeItem(onceKey(`greet_${cfg.siteKey}`));
    }

    $bubble.onclick = () => {
      $panel.style.display === 'flex' ? closePanel() : openPanel();
    };

    const log = (...a) => merged.debug && console.info('[HSBS]', ...a);
    log('widget-config(raw):', wc);
    log('widget-config(merged):', merged);

    let escHandler = null;
    let outsideHandler = null;

    if (merged.closeOnEsc) {
      escHandler = (e) => {
        if (e.key === 'Escape' && $panel.style.display === 'flex') closePanel();
      };
      window.addEventListener('keydown', escHandler);
    }

    if (merged.closeOnOutsideClick) {
      outsideHandler = (e) => {
        if ($panel.style.display === 'flex') {
          const t = e.target;
          if (!$panel.contains(t) && !$bubble.contains(t)) closePanel();
        }
      };
      document.addEventListener('click', outsideHandler);
    }

    if (merged.openOnLoad) {
      openPanel();
    }

    let isSending = false;

    // 8) 질문/응답
    async function ask(textOverride) {
      if (isSending) return;

      const raw =
        textOverride != null && String(textOverride).trim() !== ''
          ? String(textOverride)
          : $input.value || '';

      const q = raw.trim();
      if (!q) return;

      $input.value = '';
      appendMessage($body, 'user', q);
      const bot = appendMessage($body, 'bot', '...');

      isSending = true;
      $send.disabled = true;

      let t = null; // ✅ finally에서 접근 가능하게 바깥에 선언

      try {
        const controller = new AbortController();
        const timeoutMs = 15000;
        t = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(cfg.apiBase + '/ai/complete4', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'X-HSBS-Site-Key': cfg.siteKey,
          },
          body: JSON.stringify({ prompt: q }),
        });

        if (!res.ok) {
          let msg = '오류가 발생했습니다';
          if (res.status === 401) msg = '인증 정보가 없습니다. SiteKey를 확인해주세요.';
          else if (res.status === 403)
            msg = '이 사이트키는 비활성/삭제/도메인 불일치 또는 사용 제한 상태입니다.';
          else if (res.status === 429)
            msg = '쿼타/레이트리밋 도달. 관리자에게 문의 바랍니다.';
          else if (res.status >= 500) msg = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          try {
            const j = await res.json();
            if (j?.message) msg += ` (${j.message})`;
          } catch {}
          bot.textContent = msg;
          log('error response', res.status, msg);
          return;
        }

        const data = await res.json();
        bot.textContent = data?.text ?? '(응답이 없습니다)';
      } catch (e) {
        if (e && (e.name === 'AbortError' || String(e).includes('AbortError'))) {
          bot.textContent = '응답이 지연되어 요청을 취소했습니다. 잠시 후 다시 시도해주세요.';
        } else {
          bot.textContent = '네트워크 오류가 발생했습니다';
        }
        log('network error', e);
      } finally {
        if (t) clearTimeout(t); // ✅ 안전
        isSending = false;
        $send.disabled = false;
        $body.scrollTop = $body.scrollHeight;
      }
    }


    $send.onclick = () => ask();
    $input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') ask();
    });

    // 현재 위젯 상태 저장 (재 init / destroy용)
    widgetState = {
      root: $root,
      bubble: $bubble,
      panel: $panel,
      escHandler,
      outsideHandler,
    };
  }

  // 공개 API
  window.HSBS = {
    init,
    destroy: teardown,
  };
})();
