
(function(){
  const saved = localStorage.getItem('sf-theme') || 'dark';
  document.body.classList.add('theme-' + saved);

  
  window.addEventListener('mousemove',e=>{
    document.documentElement.style.setProperty('--mx', e.clientX+'px');
    document.documentElement.style.setProperty('--my', e.clientY+'px');
  });

  
  const burger = document.querySelector('.mobile-burger');
  const side = document.querySelector('.app-side');
  if(burger && side){
    burger.addEventListener('click',()=>side.classList.toggle('open'));
    document.addEventListener('click',e=>{
      if(!side.contains(e.target) && !burger.contains(e.target)) side.classList.remove('open');
    });
  }


  const here = location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.app-nav a').forEach(a=>{
    if(a.getAttribute('href') === here) a.classList.add('active');
  });


  window.SFLoad = async function(){
    if(window.__SFDATA) return window.__SFDATA;
    try{
      const r = await fetch('assets/data.json');
      window.__SFDATA = await r.json();
      return window.__SFDATA;
    }catch(e){console.warn('data load failed',e);return null}
  };


  let toastWrap = document.querySelector('.toast-wrap');
  if(!toastWrap){toastWrap=document.createElement('div');toastWrap.className='toast-wrap';document.body.appendChild(toastWrap)}
  window.SFToast = function(msg){
    const t = document.createElement('div');
    t.className = 'toast lg';
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(()=>{t.style.opacity=0;t.style.transform='translateY(20px)';setTimeout(()=>t.remove(),300)},2400);
  };


  const lt = document.getElementById('liveTime');
  function fmtTime(){return new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
  if(lt){lt.textContent=fmtTime();setInterval(()=>lt.textContent=fmtTime(),1000)}


  document.querySelectorAll('[data-count]').forEach(el=>{
    const target=+el.dataset.count;let cur=0;const step=target/60;
    (function tick(){cur+=step;if(cur>=target){el.textContent=target.toLocaleString();return}el.textContent=Math.floor(cur).toLocaleString();requestAnimationFrame(tick)})();
  });

  const palette = document.getElementById('palette');
  const psearch = document.getElementById('paletteSearch');
  const plist = document.getElementById('paletteList');
  if(palette){
    const cmds = [
      {label:'Open Dashboard',cat:'Navigate',href:'dashboard.html'},
      {label:'Open Trend Radar',cat:'Navigate',href:'radar.html'},
      {label:'Open Hook Generator',cat:'Navigate',href:'hooks.html'},
      {label:'Open Landing Analyzer',cat:'Navigate',href:'analyzer.html'},
      {label:'Open Viral UI Explorer',cat:'Navigate',href:'explorer.html'},
      {label:'Open Opportunity Engine',cat:'Navigate',href:'opportunity.html'},
      {label:'Open Settings',cat:'Navigate',href:'settings.html'},
      {label:'Open Pricing',cat:'Navigate',href:'pricing.html'},
      {label:'View Changelog',cat:'Navigate',href:'changelog.html'},
      {label:'Read Docs',cat:'Navigate',href:'docs.html'},
      {label:'Sign out',cat:'Account',href:'login.html'}
    ];
    function renderP(q=''){
      const items = cmds.filter(c=>c.label.toLowerCase().includes(q.toLowerCase()));
      plist.innerHTML = items.map((c,i)=>`<div class="palette-item ${i===0?'active':''}" data-href="${c.href}">${c.label}<span class="pi-cat">${c.cat}</span></div>`).join('');
      plist.querySelectorAll('.palette-item').forEach(el=>{
        el.addEventListener('click',()=>location.href = el.dataset.href);
      });
    }
    renderP();
    psearch && psearch.addEventListener('input',e=>renderP(e.target.value));
    document.addEventListener('keydown',e=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault();palette.classList.toggle('open');
        if(palette.classList.contains('open'))setTimeout(()=>psearch.focus(),50);
      }
      if(e.key==='Escape')palette.classList.remove('open');
    });
    palette.addEventListener('click',e=>{if(e.target===palette)palette.classList.remove('open')});
  }
})();


async function SFInitFeed(){
  const feed = document.getElementById('liveFeed');
  if(!feed) return;
  const data = await SFLoad();
  if(!data) return;
  function add(){
    const [t,d] = data.feed[Math.floor(Math.random()*data.feed.length)];
    const time = new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const item = document.createElement('div');
    item.className='feed-item';
    item.innerHTML=`<span class="fi-dot"></span><div><b style="color:#fff">${t}</b><div style="color:#9a9a9a;font-size:11px;margin-top:2px">${d}</div></div><span class="fi-time">${time}</span>`;
    feed.prepend(item);
    while(feed.children.length>8)feed.lastChild.remove();
  }
  for(let i=0;i<5;i++)add();
  setInterval(add,3000);
}

function SFInitHeatmap(id){
  const hm = document.getElementById(id||'heatmap');
  if(!hm) return;
  let html='';
  for(let i=0;i<14*7;i++){
    const r = Math.random();
    let cls='';
    if(r>0.85)cls='l4';else if(r>0.65)cls='l3';else if(r>0.4)cls='l2';else if(r>0.2)cls='l1';
    html+=`<span class="${cls}"></span>`;
  }
  hm.innerHTML = html;
}

async function SFInitTrends(id){
  const t = document.getElementById(id||'trendsTable');
  if(!t) return;
  const data = await SFLoad();
  if(!data) return;
  const rows = data.trends.map(tr=>{
    const dir = tr.momentum>=0?'up':'down';
    const sign = tr.momentum>=0?'+':'';
    return `<div class="trend-row"><span>${tr.name}</span><span class="${dir}">${sign}${tr.momentum}%</span><span class="col-hide">${tr.competition}</span><span class="col-hide">${tr.platform}</span><span class="col-hide">${tr.product}</span><span><b>${tr.score}</b></span></div>`;
  }).join('');
  t.innerHTML = `<div class="trend-row head"><span>Niche</span><span>Momentum</span><span class="col-hide">Comp.</span><span class="col-hide">Best</span><span class="col-hide">Product</span><span>Score</span></div>` + rows;
}
async function SFInitHooks(){
  const btn = document.getElementById('hookBtn');
  const out = document.getElementById('hookOutput');
  if(!btn||!out) return;
  const data = await SFLoad();
  function run(){
    const n = document.getElementById('hookNiche').value || 'AI';
    const a = document.getElementById('hookAud').value || 'creators';
    const p = document.getElementById('hookPlat').value;
    const list = (data && data.hookTemplates[p]) || [];
    out.innerHTML='';
    const items = [...list].sort(()=>Math.random()-0.5).slice(0,6);
    items.forEach((t,i)=>{
      setTimeout(()=>{
        const text = t.replace(/{n}/g,n).replace(/{a}/g,a);
        const score = (Math.random()*2+7.5).toFixed(1);
        const item = document.createElement('div');
        item.className='hook-item';
        item.innerHTML = `<span class="hk-num">0${i+1}</span><span class="hk-text">${text}</span><span class="hk-score">★ ${score}</span><button class="hk-copy">Copy</button>`;
        item.querySelector('.hk-copy').addEventListener('click',()=>{
          navigator.clipboard.writeText(text);SFToast('Hook copied to clipboard');
        });
        out.appendChild(item);
      },i*100);
    });
  }
  btn.addEventListener('click',run);
  run();
}


async function SFInitOpportunities(){
  const wrap = document.getElementById('oppGrid');
  if(!wrap) return;
  const data = await SFLoad();
  if(!data) return;
  wrap.innerHTML = data.opportunities.map(o=>`
    <article class="opp-card lg">
      <div class="opp-tag">${o.tag}</div>
      <h3>${o.title}</h3>
      <div class="opp-stats">
        <div><span>Demand</span><b>${o.demand}</b></div>
        <div><span>Competition</span><b>${o.competition}</b></div>
        <div><span>Potential</span><b>${o.potential}</b></div>
      </div>
      <div class="opp-bar"><span style="width:${o.score}%"></span></div>
    </article>
  `).join('');
}

function SFInitAnalyzer(){
  const btn = document.getElementById('analyzerBtn');
  const input = document.getElementById('analyzerUrl');
  const result = document.getElementById('analyzerResult');
  if(!btn) return;
  function score(seed){
    let h=0;for(let i=0;i<seed.length;i++)h=(h*31+seed.charCodeAt(i))%1000;
    return 55 + (h % 40);
  }
  btn.addEventListener('click',()=>{
    const url = input.value.trim() || 'example.com';
    btn.textContent = 'Analyzing...';btn.disabled=true;
    setTimeout(()=>{
      const s = score(url);
      const headline = Math.min(99, s + Math.floor(Math.random()*15));
      const cta = Math.min(99, s + Math.floor(Math.random()*15));
      const trust = Math.min(99, s + Math.floor(Math.random()*15));
      const hier = Math.min(99, s + Math.floor(Math.random()*15));
      const dash = 301.6;
      const off = dash * (1 - s/100);
      result.querySelector('[data-ring]').setAttribute('stroke-dashoffset', off);
      result.querySelector('[data-score]').textContent = s;
      result.querySelector('[data-url]').textContent = url;
      result.querySelectorAll('[data-metric]').forEach((el,i)=>{
        const v=[headline,cta,trust,hier][i];
        el.querySelector('.m-value').textContent=v+'/100';
        el.querySelector('.m-bar span').style.width=v+'%';
      });
      result.classList.add('on');
      btn.textContent='Analyze again';btn.disabled=false;
    },1100);
  });
}

async function SFInitExplorer(){
  const wrap = document.getElementById('masonry');
  if(!wrap) return;
  const data = await SFLoad();
  if(!data) return;
  function render(f){
    wrap.innerHTML = data.tiles.filter(t=>f==='all'||t.cat===f)
      .map(t=>`<div class="tile ${t.cat}"><div class="tile-preview"></div><div class="tile-foot"><span>${t.name}</span><span class="tag">${t.meta}</span></div></div>`).join('');
  }
  render('all');
  document.querySelectorAll('.filter').forEach(b=>{
    b.addEventListener('click',()=>{
      document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      render(b.dataset.filter);
    });
  });
}


function SFInitSettings(){
  document.querySelectorAll('.toggle').forEach(t=>{
    t.addEventListener('click',()=>{t.classList.toggle('on');SFToast('Preference saved')});
  });
  const save = document.getElementById('saveProfile');
  if(save) save.addEventListener('click',e=>{e.preventDefault();SFToast('Profile updated')});
}