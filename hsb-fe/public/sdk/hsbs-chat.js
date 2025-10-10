(function () {
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

  function init(opts){
    const cfg=Object.assign({ apiBase:'/api', welcome:'무엇을 도와드릴까요?' }, opts||{});
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
        const res=await fetch(cfg.apiBase+'/ai/complete',{
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body:JSON.stringify({ prompt:q })
        });
        const data=await res.json();
        bot.textContent=data?.text??'(응답이 없습니다)';
      }catch(e){ bot.textContent='오류가 발생했습니다'; }

      $body.scrollTop=$body.scrollHeight;
    }
    $send.onclick=ask; $input.addEventListener('keydown',e=>{ if(e.key==='Enter') ask(); });
  }

  window.HSBS={ init };
})();
