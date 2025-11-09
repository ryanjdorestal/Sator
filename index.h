const char HTML_CONTENT[] PROGMEM = R"====(
<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>

<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;600;700&display=swap" rel="stylesheet">

<title>Sator Rover</title>

<style>
  :root{
    --bg:#e8e3c8;
    --card:#fff;
    --ink:#111;
    --ink-muted:#555;
    --brand:#0b6bff;
    --danger:#e53935;
    --green-dark:#2e6f40;    
    --shadow:0 6px 24px rgba(0,0,0,.12);
    --pad:14px;               
    --card-gap:14px;          
  }

  *{box-sizing:border-box}
  html,body{height:100%}

  /* safe-area + even visual padding */
  body{
    margin:0;
    font-family:'Inconsolata', monospace;
    background:var(--bg);
    color:var(--ink);
    min-height:100dvh;

    display:flex;
    justify-content:center;
    align-items:flex-start;

    padding-top:    calc(var(--pad) + env(safe-area-inset-top,0px));
    padding-left:   calc(var(--pad) + env(safe-area-inset-left,0px));
    padding-right:  calc(var(--pad) + env(safe-area-inset-right,0px));
    padding-bottom: max(var(--pad), env(safe-area-inset-bottom,0px));
  }

  .wrap{
    width: min(95vw, 860px);
    display:grid;
    grid-template-columns:1fr;
    gap:0;                      
    margin-inline:auto;
  }

  @media (min-width: 900px){
    .wrap{
      grid-template-columns:1fr minmax(280px,340px);
      column-gap:22px;          
      row-gap:0;             
    }
  }

  .card{
    background:var(--card);
    border-radius:18px;
    box-shadow:var(--shadow);
    padding:18px;
    margin-bottom: var(--card-gap);  
  }
  .wrap > :last-child .card:last-child,
  .wrap > .card:last-child{
    margin-bottom: var(--card-gap);
  }

  .title,
  .servo h2{
    margin:0 0 14px;
    font-weight:700;
    letter-spacing:.3px;
    color:var(--green-dark);
  }

  .status{
    font-size:.9rem;
    color:var(--ink-muted);
    display:flex;
    gap:8px;
    align-items:center;
  }
  .dot{width:10px;height:10px;border-radius:50%;background:#bbb}
  .dot.ok{background:#26a269}
  .dot.bad{background:#e53935}

  .dpad{
    display:grid;
    grid-template-areas:
      ". up ."
      "left stop right"
      ". down .";
    grid-template-columns:1fr 1fr 1fr;
    grid-template-rows:88px 88px 88px;
    gap:18px;
    place-items:center;
  }
  @media (max-width: 420px){
    .dpad{ grid-template-rows:76px 76px 76px; gap:14px; }
  }

  .pad{
    width:120px; height:88px;
    background:#fff; border:none; border-radius:18px; box-shadow:var(--shadow);
    display:grid; place-items:center; cursor:pointer; transition:transform .06s,filter .06s;
  }
  @media (max-width: 420px){
    .pad{ width:104px; height:80px; border-radius:16px; }
  }
  .pad:active{transform:scale(.98);filter:brightness(.97)}
  .svg{width:28px;height:28px;display:block}
  .up{grid-area:up}.down{grid-area:down}.left{grid-area:left}.right{grid-area:right}

  .stop{
    grid-area:stop; width:108px; height:108px; border-radius:50%;
    background:#fff; border:none; box-shadow:var(--shadow);
    position:relative; cursor:pointer; transition:transform .06s;
  }
  .stop:active{transform:scale(.97)}
  .stop::before{
    content:""; position:absolute; inset:9px; border-radius:50%;
    background:var(--danger); box-shadow:inset 0 6px 12px rgba(0,0,0,.18);
  }
  @media (max-width: 420px){
    .stop{ width:96px; height:96px; }
    .stop::before{ inset:8px; }
  }

  .side{display:grid}
  .servo{display:grid; gap:12px}

  .row{display:flex; gap:10px; width:100%}
  .sbtn{
    flex:1; height:56px; border:none; border-radius:14px; background:#fff; box-shadow:var(--shadow);
    display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; transition:transform .06s;
  }
  .sbtn:active{transform:scale(.98)}
  .slabel{font-weight:600; color:var(--ink)}
  .sbtn svg{width:16px;height:16px;fill:var(--brand)}

  @media (max-width: 360px){
    .row{flex-direction:column}
  }
</style>
</head><body>
<div class="wrap">
  <!-- Rover drive card -->
  <div class="card">
    <h2 class="title">Sator Rover</h2>
    <div class="status"><span id="wsDot" class="dot"></span><span id="wsText">Connecting…</span></div>

    <div class="dpad">
      <!-- Drive commands (Momentary Control) -->
      <button class="pad up" data-cmd="1"><svg class="svg" viewBox="0 0 24 24"><path d="M12 6l7 12H5z"/></svg></button>
      <button class="pad left" data-cmd="4"><svg class="svg" viewBox="0 0 24 24"><path d="M6 12l12 7V5z"/></svg></button>
      <button class="stop" data-cmd="0"></button>
      <button class="pad right" data-cmd="8"><svg class="svg" viewBox="0 0 24 24"><path d="M18 12L6 5v14z"/></svg></button>
      <button class="pad down" data-cmd="2"><svg class="svg" viewBox="0 0 24 24"><path d="M12 18L5 6h14z"/></svg></button>
    </div>
  </div>

  <!-- Sensor cards -->
  <div class="side">
    <div class="card servo">
      <h2>Soil Moisture Sensor</h2>
      <div class="row">
        <!-- Servo A commands (Click-to-run duration) -->
        <button class="sbtn" data-cmd="16"><svg viewBox="0 0 24 24"><path d="M12 6l7 12H5z"/></svg><span class="slabel">Up</span></button>
        <button class="sbtn" data-cmd="32"><svg viewBox="0 0 24 24"><path d="M12 18L5 6h14z"/></svg><span class="slabel">Down</span></button>
      </div>
    </div>

    <div class="card servo">
      <h2>NPK + pH Sensor</h2>
      <div class="row">
        <!-- Servo B commands (Click-to-run duration) -->
        <button class="sbtn" data-cmd="64"><svg viewBox="0 0 24 24"><path d="M12 6l7 12H5z"/></svg><span class="slabel">Up</span></button>
        <button class="sbtn" data-cmd="128"><svg viewBox="0 0 24 24"><path d="M12 18L5 6h14z"/></svg><span class="slabel">Down</span></button>
      </div>
    </div>
  </div>
</div>

<script>
  let ws;
  const dot=document.getElementById('wsDot'), txt=document.getElementById('wsText');

  function setWS(msg,ok){
    dot.className='dot '+(ok?'ok':(msg==='Connecting…'?'':'bad'));
    txt.textContent=msg;
  }

  function connectWS(){
    try{
      // Use the same port as defined in the Arduino sketch (81)
      ws = new WebSocket('ws://' + location.hostname + ':81/');
      ws.addEventListener('open',  ()=>setWS('Connected', true));
      ws.addEventListener('close', ()=>{
        setWS('Disconnected. Retrying…', false);
        setTimeout(connectWS, 5000); // Attempt reconnect
      });
      ws.addEventListener('error', ()=>setWS('Error', false));
    }catch(e){ setWS('Error', false); }
  }
  connectWS();

  function sendCmd(n){ if(ws && ws.readyState===1) ws.send(String(n)); }

  // --- Drive Control Logic (Momentary/Hold-to-run for 1, 2, 4, 8) ---
  const driveCommands = [1, 2, 4, 8];
  document.querySelectorAll('.dpad [data-cmd]').forEach(b => {
    const cmd = parseInt(b.dataset.cmd, 10);

    // Only apply hold-to-run logic to directional pads
    if (driveCommands.includes(cmd)) {
      // Start movement on press/touch
      b.addEventListener('mousedown', () => sendCmd(cmd));
      b.addEventListener('touchstart', (e) => { e.preventDefault(); sendCmd(cmd); });

      // Stop movement on release
      b.addEventListener('mouseup', () => sendCmd(0));
      b.addEventListener('touchend', () => sendCmd(0));
      // Prevents long-press context menu on mobile, ensuring touchend fires
      b.addEventListener('contextmenu', (e) => { e.preventDefault(); sendCmd(0); });
    }
  });
  
  // --- Global Stop Button (Single click for 0) ---
  document.querySelector('.stop[data-cmd="0"]').addEventListener('click', () => sendCmd(0));

  // --- Servo Controls Logic (Click-to-run duration for 16, 32, 64, 128) ---
  document.querySelectorAll('.servo .sbtn').forEach(b => {
    b.addEventListener('click', e => sendCmd(parseInt(e.currentTarget.dataset.cmd, 10)));
  });

  // --- Keyboard Shortcuts (Non-blocking for key combinations) ---
  let keysDown = {};
  const driveKeys = {
    'ArrowUp': 1, 'ArrowDown': 2, 'ArrowLeft': 4, 'ArrowRight': 8
  };

  addEventListener('keydown', e => {
    if (e.key === ' ') { // Global stop
      e.preventDefault();
      sendCmd(0);
      keysDown = {}; // Clear active keys on global stop
      return;
    }
    const cmd = driveKeys[e.key];
    if (cmd && !keysDown[e.key]) {
      e.preventDefault();
      sendCmd(cmd);
      keysDown[e.key] = true;
    }
  });

  addEventListener('keyup', e => {
    const cmd = driveKeys[e.key];
    if (cmd) {
      e.preventDefault();
      delete keysDown[e.key];
      // Only send stop (0) if no other directional key is currently held down
      if (Object.keys(keysDown).length === 0) {
        sendCmd(0);
      }
    }
  });

</script>
</body></html>
)====";
