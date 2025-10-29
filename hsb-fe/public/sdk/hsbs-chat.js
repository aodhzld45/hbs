(function () {
  // ===== 기본값(로컬/운영 주석 유지) =====
  // const DEFAULT_API_BASE = 'https://www.hsbs.kr/api'; // 운영용
  const DEFAULT_API_BASE = 'http://localhost:8080/api';     // 로컬용

  // ===== 내부 유틸 =====
  const ss = window.sessionStorage;
  const onceKey = (k) => `hsbs_once_${k}`;

  function h(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }

  // CSS는 변수 기반으로 주입해서 서버 설정으로 쉽게 테마 변경
  function injectCss(vars) {
    const v = Object.assign({
      // 색상/치수 기본값
      '--hsbs-accent':      '#4f46e5',
      '--hsbs-bg':          '#111827',
      '--hsbs-bg-2':        '#0b0f1a',
      '--hsbs-border':      '#1f2937',
      '--hsbs-input-bg':    '#0f1422',
      '--hsbs-text':        '#e5e7eb',
      '--hsbs-z':           '2147483000',
      '--hsbs-panel-w':     '360px',
      '--hsbs-offset-x':    '20px',
      '--hsbs-offset-y':    '20px',
      '--hsbs-max-h':       '60vh',
      '--hsbs-radius':      '16px',
      '--hsbs-bubble-size': '56px',
      '--hsbs-send-radius': '10px',
      '--hsbs-send-text':   '"보내기"',
      '--hsbs-position':    'right',   // right|left
    }, vars || {});

    // 위치 계산(right/left)
    const isLeft = (v['--hsbs-position'] || 'right') === 'left';
    const sideRule = isLeft
      ? `left:var(--hsbs-offset-x); right:auto;`
      : `right:var(--hsbs-offset-x); left:auto;`;

    const css = `
    :root {
      --hsbs-accent:${v['--hsbs-accent']};
      --hsbs-bg:${v['--hsbs-bg']};
      --hsbs-bg-2:${v['--hsbs-bg-2']};
      --hsbs-border:${v['--hsbs-border']};
      --hsbs-input-bg:${v['--hsbs-input-bg']};
      --hsbs-text:${v['--hsbs-text']};
      --hsbs-z:${v['--hsbs-z']};
      --hsbs-panel-w:${v['--hsbs-panel-w']};
      --hsbs-offset-x:${v['--hsbs-offset-x']};
      --hsbs-offset-y:${v['--hsbs-offset-y']};
      --hsbs-max-h:${v['--hsbs-max-h']};
      --hsbs-radius:${v['--hsbs-radius']};
      --hsbs-bubble-size:${v['--hsbs-bubble-size']};
      --hsbs-send-radius:${v['--hsbs-send-radius']};
      --hsbs-send-text:${v['--hsbs-send-text']};
      --hsbs-position:${v['--hsbs-position']};
    }
    #hsbs-chat-bubble{
      position:fixed; ${sideRule} bottom:var(--hsbs-offset-y);
      width:var(--hsbs-bubble-size); height:var(--hsbs-bubble-size);
      border:none; border-radius:50%; display:flex; align-items:center; justify-content:center;
      background:var(--hsbs-accent); color:#fff; box-shadow:0 10px 25px rgba(0,0,0,.2);
      cursor:pointer; z-index:var(--hsbs-z)
    }
    #hsbs-chat-bubble img{ width:60%; height:60%; object-fit:contain; }
    #hsbs-chat-panel{
      position:fixed; ${sideRule} bottom:calc(var(--hsbs-offset-y) + 68px);
      width:var(--hsbs-panel-w); max-height:var(--hsbs-max-h);
      background:var(--hsbs-bg); color:var(--hsbs-text);
      border-radius:var(--hsbs-radius); box-shadow:0 20px 40px rgba(0,0,0,.35);
      display:none; flex-direction:column; overflow:hidden; z-index:var(--hsbs-z)
    }
    #hsbs-chat-header{ padding:12px 14px; font-weight:600; background:var(--hsbs-bg-2); border-bottom:1px solid var(--hsbs-border); display:flex; align-items:center; gap:8px }
    #hsbs-chat-header .logo{ width:20px; height:20px; object-fit:contain }
    #hsbs-chat-body{ padding:12px; gap:8px; display:flex; flex-direction:column; overflow:auto }
    .hsbs-msg{ padding:10px 12px; border-radius:12px; max-width:85% }
    .hsbs-user{ align-self:flex-end; background:#1f2937 }
    .hsbs-bot{ align-self:flex-start; background:#0d1220 }
    #hsbs-chat-footer{ display:flex; gap:8px; padding:10px; background:var(--hsbs-bg-2); border-top:1px solid var(--hsbs-border) }
    #hsbs-chat-input{ flex:1; padding:10px; border-radius:10px; border:1px solid #222733; background:var(--hsbs-input-bg); color:var(--hsbs-text) }
    #hsbs-chat-send{ padding:10px 14px; border-radius:var(--hsbs-send-radius); border:none; background:var(--hsbs-accent); color:#fff; cursor:pointer }
    #hsbs-chat-send[data-style="icon"]::before { content:"✈"; }
    #hsbs-chat-send[data-style="text"]::before { content:var(--hsbs-send-text); }
    #hsbs-chat-send[data-style="icon-text"]::before { content:"✈  "; }
    @media (max-width:480px){
      #hsbs-chat-panel{ ${isLeft ? 'left:8px; right:8px;' : 'right:8px; left:8px;'} width:auto; bottom:88px; }
    }`;
    const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  }

  function append($body, role, text){
    const div=h(`<div class="hsbs-msg ${role==='user'?'hsbs-user':'hsbs-bot'}"></div>`);
    div.textContent=text; $body.appendChild(div); $body.scrollTop=$body.scrollHeight; return div;
  }

  function resolveAssetUrl(resourceUrl, cfg) {
  if (!resourceUrl) return null;
  const u = String(resourceUrl).trim();

  // 이미 절대 URL이면 그대로 사용
  if (/^https?:\/\//i.test(u)) return u;

  // apiBase에서 '/api'를 떼어 사이트 루트(baseRoot) 계산
  const api = new URL(cfg.apiBase, window.location.href); // ex) http://localhost:8080/api
  const baseRootHref = api.href.replace(/\/api\/?$/, '/'); // -> http://localhost:8080/

  // 상대/루트 경로를 baseRoot 기준으로 절대 URL화
  return new URL(u, baseRootHref).href;                    // ex) /files/x.png -> http://localhost:8080/files/x.png
}

  // ===== 메인 초기화 =====
  async function init(opts){
    const cfg = Object.assign({
      apiBase: DEFAULT_API_BASE,
      siteKey: null,
      debug: false, // 강제 디버그(서버 설정과 OR)
    }, opts||{});

    if (!cfg.siteKey) {
      console.warn('[HSBS] siteKey가 없어 위젯을 표시하지 않습니다.');
      return;
    }

    // 1) 사전 검증: /ai/ping
    try {
      const r = await fetch(`${cfg.apiBase}/ai/ping?siteKey=${encodeURIComponent(cfg.siteKey)}`, { method:'GET', cache:'no-store' });
      if (r.status !== 204) {
        let detail = '';
        try {
          const ct = r.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await r.json();
            detail = j?.message ? `${j.code ?? 'ERROR'}: ${j.message}` : JSON.stringify(j);
          } else { detail = await r.text(); }
        } catch {}
        const msg = `[HSBS] ping 실패: ${r.status}${detail ? ' - ' + detail : ''}`;
        console.warn(msg);
        alert(msg);
        return;
      }
    } catch(e) {
      console.warn('[HSBS] ping 예외:', e);
      alert(`[HSBS] ping 예외: ${e?.message ?? e}`);
      return;
    }

    // 2) 위젯 설정 불러오기: /public/widget-config
    let wc = null;
    try {
      const res = await fetch(`${cfg.apiBase}/ai/public/widget-config?siteKey=${encodeURIComponent(cfg.siteKey)}`, {
        method:'GET', cache:'no-store',
        headers: { 'Accept':'application/json' }
      });
      if (!res.ok) throw new Error(`widget-config ${res.status}`);
      wc = await res.json();
    } catch (e) {
      console.warn('[HSBS] widget-config 로드 실패, 기본값으로 진행:', e?.message || e);
      wc = {};
    }

     // 3) 서버 응답 → merged 매핑 (필드명 1:1)
    const merged = {
      // 배치/위치
      position: wc.position || 'right',                 // 'left'|'right'
      offsetX: wc.offsetX ?? 20,
      offsetY: wc.offsetY ?? 20,
      panelWidthPx: wc.panelWidthPx ?? 360,
      zIndex: wc.zIndex ?? 2147483000,
      panelMaxHeightPx: wc.panelMaxHeightPx ?? null,    // px 값이면 아래서 px로 변환

      // 동작(Y/N → boolean)
      openOnLoad: wc.openOnLoad === 'Y',
      greetOncePerOpen: wc.greetOncePerOpen !== 'N',
      closeOnEsc: wc.closeOnEsc !== 'N',
      closeOnOutsideClick: wc.closeOnOutsideClick !== 'N',

      // 표시/브랜딩
      panelTitle: wc.panelTitle || 'HSBS Assistant',
      welcomeText: wc.welcomeText || '무엇을 도와드릴까요?',
      inputPlaceholder: wc.inputPlaceholder || '메시지를 입력하세요',
      sendButtonLabel: wc.sendButtonLabel || '보내기',
      bubbleIconEmoji: wc.bubbleIconEmoji || '💬',
      logoUrl: wc.logoUrl ? resolveAssetUrl(wc.logoUrl, cfg) : null,
      bubbleIconUrl: wc.bubbleIconUrl ? resolveAssetUrl(wc.bubbleIconUrl, cfg) : null,

      // 색상(서버 필드 그대로)
      primaryColor: wc.primaryColor || '#4f46e5',
      panelBgColor: wc.panelBgColor || '#111827',
      panelTextColor: wc.panelTextColor || '#e5e7eb',
      headerBgColor: wc.headerBgColor || '#0b0f1a',
      headerBorderColor: wc.headerBorderColor || '#1f2937',
      inputBgColor: wc.inputBgColor || '#0f1422',
      inputTextColor: wc.inputTextColor || '#e5e7eb',

      // 로깅
      debug: cfg.debug
    };

    // 4) CSS 변수 주입 (서버 컬러 매핑에 맞춤)
    injectCss({
      '--hsbs-accent': merged.primaryColor,
      '--hsbs-bg':     merged.panelBgColor,
      '--hsbs-bg-2':   merged.headerBgColor,
      '--hsbs-border': merged.headerBorderColor,
      '--hsbs-input-bg': merged.inputBgColor,
      '--hsbs-text':   merged.panelTextColor,
      '--hsbs-z': String(merged.zIndex),
      '--hsbs-panel-w': `${merged.panelWidthPx}px`,
      '--hsbs-offset-x': `${merged.offsetX}px`,
      '--hsbs-offset-y': `${merged.offsetY}px`,
      '--hsbs-position': merged.position,
      '--hsbs-send-text': JSON.stringify(merged.sendButtonLabel),
      ...(merged.panelMaxHeightPx ? {'--hsbs-max-h': `${merged.panelMaxHeightPx}px`} : {})
    });

    // 5) UI 구성 (버블: 로고/이모지)
    const bubbleImgUrl = merged.bubbleIconUrl || merged.logoUrl;
    const bubbleLabel  = bubbleImgUrl ? '' : (merged.bubbleIconEmoji || '💬');

    const $bubble = h(`<button id="hsbs-chat-bubble" aria-label="Open chat">${bubbleLabel}</button>`);
    if (bubbleImgUrl) {
      const img = document.createElement('img');
      img.alt = 'HSBS Icon';
      img.src = bubbleImgUrl;
      $bubble.appendChild(img);
    }
    const headerLogo = merged.logoUrl ? `<img class="logo" src="${merged.logoUrl}" alt="logo"/>` : '';

    const $panel = h(`<div id="hsbs-chat-panel" role="dialog" aria-label="HSBS Chat">
        <div id="hsbs-chat-header">${headerLogo}<span>${merged.panelTitle}</span></div>
        <div id="hsbs-chat-body"></div>
        <div id="hsbs-chat-footer">
          <input id="hsbs-chat-input" placeholder="${merged.inputPlaceholder}" />
          <button id="hsbs-chat-send" data-style="text"></button>
        </div>
      </div>`);
    document.body.appendChild($bubble);
    document.body.appendChild($panel);

    const $body=$panel.querySelector('#hsbs-chat-body');
    const $input=$panel.querySelector('#hsbs-chat-input');
    const $send =$panel.querySelector('#hsbs-chat-send');

    // 6) 동작(열기/환영문/ESC/바깥클릭)
    function openPanel() {
      $panel.style.display='flex';
      if (merged.greetOncePerOpen) {
        const k = onceKey('greet');
        if (!ss.getItem(k) && merged.welcomeText) {
          append($body,'bot',merged.welcomeText);
          ss.setItem(k,'1');
        }
      } else if (merged.welcomeText) {
        append($body,'bot',merged.welcomeText);
      }
      $input.focus();
    }
    function closePanel() { $panel.style.display='none'; ss.removeItem(onceKey('greet')); }

    $bubble.onclick=()=>{ ($panel.style.display==='flex') ? closePanel() : openPanel(); };

    if (merged.closeOnEsc) {
      window.addEventListener('keydown', (e)=>{
        if (e.key==='Escape' && $panel.style.display==='flex') closePanel();
      });
    }
    if (merged.closeOnOutsideClick) {
      document.addEventListener('click', (e)=>{
        if ($panel.style.display==='flex') {
          const t=e.target; if (!$panel.contains(t) && t!==$bubble) closePanel();
        }
      });
    }
    if (merged.openOnLoad) { openPanel(); }

    // 7) 디버그 로그
    const log = (...a)=> merged.debug && console.info('[HSBS]', ...a);
    log('widget-config(raw):', wc);
    log('widget-config(merged):', merged);

    // 8) 질문/응답
    async function ask(){
      const q=($input.value||'').trim(); if(!q) return;
      $input.value=''; append($body,'user',q);
      const bot=append($body,'bot','...');

      try{
        const res=await fetch(cfg.apiBase+'/ai/complete2',{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'X-HSBS-Site-Key': cfg.siteKey
          },
          body:JSON.stringify({ prompt:q })
        });

        if (!res.ok) {
          let msg='오류가 발생했습니다';
          if (res.status===401) msg='인증 정보가 없습니다. SiteKey를 확인해주세요.';
          else if (res.status===403) msg='이 사이트키는 비활성/삭제/도메인 불일치 또는 사용 제한 상태입니다.';
          else if (res.status===429) msg='쿼ота/레이트리밋 도달. 잠시 후 다시 시도해주세요.';
          else if (res.status>=500) msg='서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          try { const j = await res.json(); if (j?.message) msg += ` (${j.message})`; } catch {}
          bot.textContent=msg; log('error response', res.status, msg);
          return;
        }

        const data=await res.json();
        bot.textContent=data?.text??'(응답이 없습니다)';
      }catch(e){
        bot.textContent='네트워크 오류가 발생했습니다'; log('network error', e);
      }
      $body.scrollTop=$body.scrollHeight;
    }

    $send.onclick=ask;
    $input.addEventListener('keydown',e=>{ if(e.key==='Enter') ask(); });
  }

  // 공개 API
  window.HSBS={ init };
})();
