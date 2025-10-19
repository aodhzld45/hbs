(function () {
  //  기본값을 '로컬'로 고정
  // const DEFAULT_API_BASE = 'https://www.hsbs.kr/api'; // 운영용 (주석 유지)
  const DEFAULT_API_BASE = 'http://localhost:8080/api';     // 로컬용

  function injectCss() {
    const css = `
    #hsbs-chat-bubble{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border:none;border-radius:50%;
      display:flex;align-items:center;justify-content:center;background:#4f46e5;color:#fff;box-shadow:0 10px 25px rgba(0,0,0,.2);cursor:pointer;z-index:2147483000}
    #hsbs-chat-panel{position:fixed;right:20px;bottom:88px;width:360px;max-height:60vh;background:#111827;color:#e5e7eb;
      border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,.35);display:none;flex-direction:column;overflow:hidden;z-index:2147483000}
    #hsbs-chat-header{padding:12px 14px;font-weight:600;background:#0b0f1a;border-bottom:1px solid #1f2937}
    #hsbs-chat-body{padding:12px;gap:8px;display:flex;flex-direction:column;overflow:auto}
    .hsbs-msg{padding:10px 12px;border-radius:12px;max-width:85%}
    .hsbs-user{align-self:flex-end;background:#1f2937}
    .hsbs-bot{align-self:flex-start;background:#0d1220}
    #hsbs-chat-footer{display:flex;gap:8px;padding:10px;background:#0b0f1a;border-top:1px solid #1f2937}
    #hsbs-chat-input{flex:1;padding:10px;border-radius:10px;border:1px solid #222733;background:#0f1422;color:#e5e7eb}
    #hsbs-chat-send{padding:10px 14px;border-radius:10px;border:none;background:#4f46e5;color:#fff;cursor:pointer}
    @media (max-width:480px){#hsbs-chat-panel{right:8px;left:8px;width:auto;bottom:88px;}}
    `;
    const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  }

  function h(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }
  function append($body, role, text){
    const div=h(`<div class="hsbs-msg ${role==='user'?'hsbs-user':'hsbs-bot'}"></div>`);
    div.textContent=text; $body.appendChild(div); $body.scrollTop=$body.scrollHeight; return div;
  }

  async function init(opts){
    const cfg=Object.assign({ apiBase: DEFAULT_API_BASE, welcome:'무엇을 도와드릴까요?', siteKey:null }, opts||{});
    if (!cfg.siteKey) {
      console.warn('[HSBS] siteKey가 없어 위젯을 표시하지 않습니다.');
      return;  // ← 말풍선/패널 생성 안 함
    }    

    // 1) 서버 사전 검증: /api/ai/ping (204만 통과)
    try {
      const r = await fetch(
        `${cfg.apiBase}/ai/ping?siteKey=${encodeURIComponent(cfg.siteKey)}`,
        { method:'GET', cache:'no-store' }
      );
      if (r.status !== 204) {
        // 에러 바디 파싱(전역 핸들러 {code,message} 가정)
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
        alert(msg);               // ← 알림으로도 확인
        return;                   // UI 생성 중단
      }
    } catch (e) {
      console.warn('[HSBS] ping 예외:', e);
      alert(`[HSBS] ping 예외: ${e?.message ?? e}`);
      return;
    }

    // 2) 통과 시 UI 주입
    injectCss();
    const $bubble=h(`<button id="hsbs-chat-bubble" aria-label="Open chat">💬</button>`);
    const $panel =h(`<div id="hsbs-chat-panel" role="dialog" aria-label="HSBS Chat">
        <div id="hsbs-chat-header">HSBS Assistant</div>
        <div id="hsbs-chat-body"></div>
        <div id="hsbs-chat-footer">
          <input id="hsbs-chat-input" placeholder="메시지를 입력하세요" />
          <button id="hsbs-chat-send">보내기</button>
        </div>
      </div>`);
    document.body.appendChild($bubble); document.body.appendChild($panel);

    const $body=$panel.querySelector('#hsbs-chat-body');
    const $input=$panel.querySelector('#hsbs-chat-input');
    const $send =$panel.querySelector('#hsbs-chat-send');

    $bubble.onclick=()=>{
      const open=$panel.style.display==='flex';
      $panel.style.display=open?'none':'flex';
      if(!open && cfg.welcome) append($body,'bot',cfg.welcome);
      $input.focus();
    };

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
          // 상세 메시지(전역 핸들러 {code,message})가 있으면 보강
          try {
            const j = await res.json();
            if (j?.message) msg = msg + ' (' + j.message + ')';
          } catch {}
          bot.textContent=msg;
          return;
        }

        const data=await res.json();
        bot.textContent=data?.text??'(응답이 없습니다)';
      }catch(e){ bot.textContent='네트워크 오류가 발생했습니다'; }

      $body.scrollTop=$body.scrollHeight;
    }

    $send.onclick=ask;
    $input.addEventListener('keydown',e=>{ if(e.key==='Enter') ask(); });
  }

  window.HSBS={ init };
})();
