
(function(){

  const saved = localStorage.getItem('sf-theme') || 'dark';
  document.body.classList.add('theme-' + saved);
  const ts = document.querySelector('.theme-switch');
  if(ts){
    ts.querySelectorAll('button').forEach(b=>{
      if(b.dataset.theme === saved) b.classList.add('active');
      b.addEventListener('click',()=>{
        document.body.classList.remove('theme-dark','theme-midnight','theme-noir');
        document.body.classList.add('theme-' + b.dataset.theme);
        localStorage.setItem('sf-theme', b.dataset.theme);
        ts.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
      });
    });
  }

  window.addEventListener('mousemove', e=>{
    document.documentElement.style.setProperty('--mx', e.clientX + 'px');
    document.documentElement.style.setProperty('--my', e.clientY + 'px');
  });

  document.querySelectorAll('.btn-primary').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      btn.style.transform = `translate(${x*0.2}px, ${y*0.3}px)`;
    });
    btn.addEventListener('mouseleave',()=>btn.style.transform='');
  });

  const heroMock = document.getElementById('heroMock');
  if(heroMock){
    const frame = heroMock.querySelector('.mock-frame');
    heroMock.addEventListener('mousemove',e=>{
      const r = heroMock.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - 0.5;
      const y = (e.clientY - r.top)/r.height - 0.5;
      frame.style.transform = `rotateX(${-y*5}deg) rotateY(${x*5}deg)`;
    });
    heroMock.addEventListener('mouseleave',()=>frame.style.transform='');
  }

  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:0.12});
  document.querySelectorAll('.reveal,.signal,.feature,.testi,.price,.tile,.opp-card').forEach(el=>{
    el.classList.add('reveal');io.observe(el);
  });


  const ticker = document.getElementById('tickerTrack');
  if(ticker){
    const items = [
      ['AI Study Tools','+82%'],['Faceless YouTube','+61%'],['Minimal SaaS UI','+44%'],
      ['AI Resume Tools','+78%'],['Therapist Portals','+33%'],['Indie Newsletters','+27%'],
      ['NFT Tools','-14%'],['Notion Templates','+19%'],['AI Voice Cloning','+54%'],
      ['Micro SaaS','+38%'],['Solopreneur Brands','+22%'],['Glass UI','+12%']
    ];
    const html = items.map(([n,v])=>`<span>${n} ${v.startsWith('+')?`<b>${v}</b>`:`<i>${v}</i>`}</span>`).join('');
    ticker.innerHTML = html + html;
  }

  document.querySelectorAll('.faq details').forEach(d=>{
    d.addEventListener('toggle',()=>{
      if(d.open){
        document.querySelectorAll('.faq details').forEach(o=>{if(o!==d)o.open=false});
      }
    });
  });

  const liveTimes = document.querySelectorAll('[data-live-time]');
  function fmt(){return new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
  if(liveTimes.length){
    liveTimes.forEach(e=>e.textContent=fmt());
    setInterval(()=>liveTimes.forEach(e=>e.textContent=fmt()),1000);
  }

  const counters = document.querySelectorAll('[data-count]');
  const co = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const el = e.target;
      const target = +el.dataset.count;
      let cur=0;const step=target/60;
      (function tick(){cur+=step;if(cur>=target){el.textContent=target.toLocaleString();return}el.textContent=Math.floor(cur).toLocaleString();requestAnimationFrame(tick)})();
      co.unobserve(el);
    });
  });
  counters.forEach(c=>co.observe(c));
})();