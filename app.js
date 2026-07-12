/* =====================================================
   Chikki — app.js
   AI Chatbot with Memory, Voice Input, Themes
   ===================================================== */

// ===== CONFIG =====
const DEFAULT = {
  apiKey: 'AQ.Ab8RN6Jlmiqntaadvv-k9mv73mJ-sdcAEBIt4WxCoglKcCkSMA',
  model: 'gemini-3.5-flash',
  systemPrompt: 'You are Chikki, a friendly, witty, and intelligent AI assistant. You remember everything in our conversation history. Be helpful, concise when needed, thorough when required. Use markdown for better formatting. Add a personal, warm touch to your responses.',
  temperature: 0.7,
  theme: 'purple',
  readAloud: false
};

const KEYS = {
  convs: 'chikki_conversations',
  settings: 'chikki_settings',
  activeConv: 'chikki_active',
  theme: 'chikki_theme'
};

const THEMES = [
  { id: 'purple',   label: 'Purple',   colors: ['#7c6bff', '#a78bfa', '#0d0d12'] },
  { id: 'ocean',    label: 'Ocean',    colors: ['#0ea5e9', '#38bdf8', '#060d1a'] },
  { id: 'midnight', label: 'Dark',     colors: ['#ffffff', '#cccccc', '#000000'] },
  { id: 'rose',     label: 'Rose',     colors: ['#f43f5e', '#fb7185', '#140a10'] },
  { id: 'forest',   label: 'Forest',   colors: ['#059669', '#34d399', '#080f0a'] },
  { id: 'sunset',   label: 'Sunset',   colors: ['#ea580c', '#fb923c', '#120a04'] },
  { id: 'nord',     label: 'Nord',     colors: ['#5e81ac', '#88c0d0', '#1c2333'] },
  { id: 'candy',    label: 'Candy',    colors: ['#a21caf', '#e879f9', '#0f080f'] },
];

const MODEL_LABELS = {
  'gemini-3.5-flash':       'Gemini 3.5 Flash ⚡',
  'gemini-3.1-flash-lite':  'Gemini 3.1 Flash Lite',
  'gemini-3.1-pro-preview': 'Gemini 3.1 Pro',
  'gemini-2.5-flash':       'Gemini 2.5 Flash',
  'gemini-2.5-flash-lite':  'Gemini 2.5 Lite',
  'gemini-2.5-pro':         'Gemini 2.5 Pro',
};

// ===== STATE =====
let state = {
  convs: {},
  activeId: null,
  settings: { ...DEFAULT },
  generating: false,
  abort: null,
  searchQ: '',
  recording: false,
  recognition: null,
  attachments: [],   // [{ name, type, b64, dataUrl, isImage }]
};

// ===== DOM =====
const $ = id => document.getElementById(id);
const D = {
  sidebar: $('sidebar'),
  overlay: $('sidebar-overlay'),
  convList: $('conv-list'),
  search: $('search-input'),
  btnNew: $('btn-new-chat'),
  btnToggle: $('btn-toggle-sidebar'),
  btnClear: $('btn-clear-all'),
  btnExport: $('btn-export'),
  btnSettingsFoot: $('btn-settings-foot'),
  btnSettings: $('btn-settings'),
  welcome: $('welcome-screen'),
  msgsArea: $('messages-area'),
  msgsContainer: $('messages-container'),
  typingIndicator: $('typing-indicator'),
  input: $('message-input'),
  btnSend: $('btn-send'),
  btnStop: $('btn-stop'),
  btnMic: $('btn-mic'),
  btnAttach: $('btn-attach'),
  fileInput: $('file-input'),
  attachPreview: $('attach-preview'),
  title: $('current-title'),
  modelBadge: $('model-badge'),
  modelLabel: $('model-label'),
  apiBanner: $('no-api-banner'),
  toastCont: $('toast-container'),
  // Settings
  settingsModal: $('settings-modal'),
  apiKeyInput: $('api-key-input'),
  modelSelect: $('model-select'),
  sysPrompt: $('sys-prompt'),
  tempSlider: $('temp-slider'),
  tempDisp: $('temp-disp'),
  tempVal: $('temp-val'),
  toggleKey: $('toggle-key-vis'),
  themeGrid: $('theme-grid'),
  readAloudToggle: $('read-aloud-toggle'),
  // Confirm
  confirmModal: $('confirm-modal'),
  confirmTitle: $('confirm-title'),
  confirmMsg: $('confirm-msg'),
};

let confirmCb = null;

// ===== STORAGE =====
const store = {
  get: (k, fb = null) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { console.warn(e); } }
};

// ===== FILE UPLOAD =====
function initFileUpload() {
  D.btnAttach.addEventListener('click', () => {
    if (state.generating) return;
    D.fileInput.click();
  });

  D.fileInput.addEventListener('change', async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) { showToast(`${file.name} is too large (max 20MB)`, 'error'); continue; }
      try {
        const attachment = await readFile(file);
        state.attachments.push(attachment);
      } catch { showToast(`Could not read ${file.name}`, 'error'); }
    }

    D.fileInput.value = '';
    renderAttachPreview();
  });
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const b64 = dataUrl.split(',')[1];
      resolve({
        id: uid(),
        name: file.name,
        type: file.type,
        b64,
        dataUrl,
        isImage: file.type.startsWith('image/'),
        size: file.size,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderAttachPreview() {
  D.attachPreview.innerHTML = '';
  if (state.attachments.length === 0) {
    D.attachPreview.classList.remove('visible');
    return;
  }
  D.attachPreview.classList.add('visible');

  state.attachments.forEach(att => {
    const chip = document.createElement('div');
    chip.className = 'attach-chip';
    chip.dataset.id = att.id;

    if (att.isImage) {
      chip.innerHTML = `
        <img src="${att.dataUrl}" alt="${esc(att.name)}" />
        <span class="attach-chip-name">${esc(att.name)}</span>
        <button class="remove-attach" data-id="${att.id}" title="Remove">
          <svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg>
        </button>`;
    } else {
      chip.innerHTML = `
        <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path><polyline points='14 2 14 8 20 8'></polyline></svg>
        <span class="attach-chip-name">${esc(att.name)}</span>
        <span style="font-size:10px;color:var(--text-muted);flex-shrink:0">${fmtSize(att.size)}</span>
        <button class="remove-attach" data-id="${att.id}" title="Remove">
          <svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg>
        </button>`;
    }

    chip.querySelector('.remove-attach').addEventListener('click', (e) => {
      e.stopPropagation();
      state.attachments = state.attachments.filter(a => a.id !== att.id);
      renderAttachPreview();
    });

    D.attachPreview.appendChild(chip);
  });
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

// ===== PARTICLES =====
function initParticles() {
  const canvas = $('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function getColor() {
    const el = document.documentElement;
    const style = getComputedStyle(el);
    return style.getPropertyValue('--particle-color').trim() || 'rgba(124,107,255,0.3)';
  }

  function spawnParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.2,
      fade: (Math.random() - 0.5) * 0.005,
    };
  }

  function init() {
    particles = Array.from({ length: 80 }, spawnParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const color = getColor();
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.alpha += p.fade;
      if (p.alpha <= 0 || p.alpha > 0.7) p.fade *= -1;
      if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
        Object.assign(p, spawnParticle());
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color.replace(/[\d.]+\)$/, `${p.alpha})`);
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); init(); });
}

// ===== TEXT TO SPEECH (READ ALOUD) =====
let currentUtterance = null;

function speakText(text, onStart, onEnd) {
  // Cancel any ongoing speech
  stopSpeaking();
  
  if (!text) return;
  
  // Clean markdown and code blocks
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks entirely
    .replace(/`[^`]+`/g, '') // remove inline code
    .replace(/[*#_\-~>]/g, '') // remove markdown symbols
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // replace links with text
    .replace(/&amp;/g, 'and')
    .replace(/&lt;/g, 'less than')
    .replace(/&gt;/g, 'greater than')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Choose voice
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft'))) || 
                voices.find(v => v.lang.startsWith('en')) || 
                voices[0];
                
  if (voice) utterance.voice = voice;
  utterance.rate = 1.05; // Slightly speed up for natural conversation
  
  utterance.onstart = () => { if (onStart) onStart(); };
  utterance.onend = () => { 
    if (onEnd) onEnd(); 
    currentUtterance = null; 
  };
  utterance.onerror = () => { 
    if (onEnd) onEnd(); 
    currentUtterance = null; 
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
  currentUtterance = null;
  // Notify message components to update their speaker states
  document.dispatchEvent(new CustomEvent('speechstopped'));
}

// ===== VOICE INPUT =====
// ===== VOICE INPUT (MULTIMODAL ON GEMINI) =====
let mediaRecorder = null;
let audioChunks = [];
let voiceTimer = null;
let recordingStartTime = 0;

function initVoice() {
  D.btnMic.addEventListener('click', async () => {
    if (state.generating) return;
    
    if (state.recording) {
      stopVoiceRecording();
    } else {
      await startVoiceRecording();
    }
  });
}

async function startVoiceRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    
    // Check supported MIME types for recording
    let mimeType = 'audio/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/ogg';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/mp4';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = ''; // Let browser decide
    }

    const options = mimeType ? { mimeType } : {};
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      // Release microphone stream tracks
      stream.getTracks().forEach(track => track.stop());

      const finalMimeType = mediaRecorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunks, { type: finalMimeType });
      
      if (audioBlob.size < 1000) {
        showToast('No audio detected', 'error');
        return;
      }

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result;
        const b64 = dataUrl.split(',')[1];
        
        // Push as audio attachment
        const attId = uid();
        const durationSec = Math.round((Date.now() - recordingStartTime) / 1000);
        const name = `Voice Note (${durationSec}s).${finalMimeType.split('/')[1].split(';')[0]}`;
        
        state.attachments.push({
          id: attId,
          name,
          type: finalMimeType.split(';')[0],
          b64,
          dataUrl,
          isImage: false,
          size: audioBlob.size
        });
        
        showToast('Voice note recorded!', 'success');
        
        // Auto-send the voice command
        sendMessage();
      };
      reader.readAsDataURL(audioBlob);
    };

    state.recording = true;
    recordingStartTime = Date.now();
    D.btnMic.classList.add('recording');
    D.btnMic.innerHTML = '<i data-lucide="mic-off"></i>';
    D.input.placeholder = '🎤 Recording voice... click mic again to stop & send';
    lucide.createIcons();
    
    mediaRecorder.start(250); // Get chunks every 250ms
    
    // Auto stop after 30 seconds to prevent huge files
    voiceTimer = setTimeout(() => {
      if (state.recording) {
        stopVoiceRecording();
        showToast('Recording automatically stopped (30s limit)', 'info');
      }
    }, 30000);

  } catch (err) {
    console.error('Microphone access denied or error:', err);
    showToast('Could not access microphone: ' + err.message, 'error');
  }
}

function toggleVoiceRecording() {
  // Unused helper, backward compatibility
}

function stopVoiceRecording() {
  if (voiceTimer) clearTimeout(voiceTimer);
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  state.recording = false;
  D.btnMic.classList.remove('recording');
  D.btnMic.innerHTML = '<i data-lucide="mic"></i>';
  D.input.placeholder = 'Message Chikki… or press 🎤 to speak';
  lucide.createIcons();
}

// ===== THEME SYSTEM =====
function buildThemeGrid() {
  D.themeGrid.innerHTML = '';
  const current = state.settings.theme || 'purple';

  THEMES.forEach(t => {
    const div = document.createElement('div');
    div.className = `theme-swatch${t.id === current ? ' active' : ''}`;
    div.dataset.themeId = t.id;

    const grad = `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`;
    div.innerHTML = `
      <div class="swatch-preview" style="background: ${grad};"></div>
      <div class="swatch-check"><i data-lucide="check"></i></div>
      <span class="swatch-label">${t.label}</span>`;

    div.addEventListener('click', () => {
      document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
      div.classList.add('active');
      state.settings.theme = t.id;
      applyTheme(t.id);
    });

    D.themeGrid.appendChild(div);
  });
  lucide.createIcons();
}

function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
  store.set(KEYS.theme, themeId);

  // Update theme-color meta tag for PWA mobile status bar
  const themeColors = {
    purple: '#0d0d12',
    ocean: '#060d1a',
    midnight: '#000000',
    rose: '#140a10',
    forest: '#080f0a',
    sunset: '#120a04',
    nord: '#1c2333',
    candy: '#0f080f'
  };
  const metaTheme = $('theme-color-meta');
  if (metaTheme) {
    metaTheme.setAttribute('content', themeColors[themeId] || '#0d0d12');
  }

  // Adjust hljs theme for light-ish themes
  const lightThemes = ['nord'];
  const hljsEl = $('hljs-theme');
  if (hljsEl) {
    hljsEl.href = lightThemes.includes(themeId)
      ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css'
      : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
  }
}

// ===== LOAD STATE =====
function loadState() {
  state.convs = store.get(KEYS.convs, {});
  state.settings = { ...DEFAULT, ...store.get(KEYS.settings, {}) };
  state.activeId = store.get(KEYS.activeConv, null);
  if (state.activeId && !state.convs[state.activeId]) state.activeId = null;

  const savedTheme = store.get(KEYS.theme, DEFAULT.theme);
  state.settings.theme = savedTheme;
  applyTheme(savedTheme);
}

// ===== STORAGE HELPERS =====
const saveConvs = () => store.set(KEYS.convs, state.convs);
const saveSets = () => store.set(KEYS.settings, state.settings);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ===== CONV MANAGEMENT =====
function createConv(firstMsg = null) {
  const id = uid();
  const conv = {
    id, title: firstMsg ? trunc(firstMsg, 40) : 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  state.convs[id] = conv;
  saveConvs();
  return conv;
}

function trunc(s, n) {
  const c = s.replace(/\n/g, ' ').trim();
  return c.length > n ? c.slice(0, n) + '…' : c;
}

function setActive(id) {
  stopSpeaking();
  state.activeId = id;
  store.set(KEYS.activeConv, id);
  renderConvList();
  renderMessages();
  if (window.innerWidth <= 768) closeSidebar();
}

function addMsg(convId, role, content, attachments = []) {
  const c = state.convs[convId];
  if (!c) return null;
  const msg = { id: uid(), role, content, attachments, ts: new Date().toISOString() };
  c.messages.push(msg);
  c.updatedAt = new Date().toISOString();
  saveConvs();
  return msg;
}

// ===== RENDER CONV LIST =====
function renderConvList() {
  const q = state.searchQ.toLowerCase().trim();
  const convs = Object.values(state.convs)
    .filter(c => !q || c.title.toLowerCase().includes(q) || c.messages.some(m => m.content.toLowerCase().includes(q)))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  D.convList.innerHTML = '';

  if (convs.length === 0) {
    D.convList.innerHTML = `<div class="empty-conv">
      <i data-lucide="message-square-dashed"></i>
      <p>${q ? 'No results' : 'No chats yet'}</p>
    </div>`;
    lucide.createIcons();
    return;
  }

  const lbl = document.createElement('span');
  lbl.className = 'conv-group-label';
  lbl.textContent = q ? `Results (${convs.length})` : 'Recent';
  D.convList.appendChild(lbl);

  convs.forEach(conv => {
    const el = document.createElement('div');
    el.className = `conv-item${conv.id === state.activeId ? ' active' : ''}`;
    el.dataset.id = conv.id;
    el.innerHTML = `
      <div class="conv-icon"><i data-lucide="message-circle"></i></div>
      <span class="conv-title">${esc(conv.title)}</span>
      <div class="conv-actions">
        <button class="conv-btn" data-a="rename" title="Rename"><i data-lucide="pencil"></i></button>
        <button class="conv-btn del" data-a="delete" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>`;

    el.addEventListener('click', e => {
      if (e.target.closest('.conv-actions')) return;
      addRipple(el, e);
      setActive(conv.id);
    });

    el.querySelector('[data-a="rename"]').addEventListener('click', e => { e.stopPropagation(); startRename(el, conv); });
    el.querySelector('[data-a="delete"]').addEventListener('click', e => {
      e.stopPropagation();
      showConfirm(`Delete "${conv.title}"?`, 'This chat will be permanently deleted.', () => {
        delete state.convs[conv.id];
        if (state.activeId === conv.id) { state.activeId = null; store.set(KEYS.activeConv, null); }
        saveConvs(); renderConvList();
        if (!state.activeId) showWelcome();
        showToast('Chat deleted', 'success');
      });
    });

    D.convList.appendChild(el);
  });
  lucide.createIcons();
}

function startRename(el, conv) {
  const titleEl = el.querySelector('.conv-title');
  const inp = document.createElement('input');
  inp.className = 'conv-edit-input';
  inp.type = 'text';
  inp.value = conv.title;
  titleEl.replaceWith(inp);
  inp.focus(); inp.select();
  const done = () => {
    conv.title = inp.value.trim() || conv.title;
    saveConvs();
    renderConvList();
    if (state.activeId === conv.id) D.title.textContent = conv.title;
  };
  inp.addEventListener('blur', done);
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); inp.blur(); }
    if (e.key === 'Escape') { inp.value = conv.title; inp.blur(); }
  });
}

// ===== RENDER MESSAGES =====
function showWelcome() {
  D.welcome.style.display = 'flex';
  D.msgsArea.style.display = 'none';
  D.title.textContent = 'Chikki AI';
}

function showChat() {
  D.welcome.style.display = 'none';
  D.msgsArea.style.display = 'flex';
}

function renderMessages() {
  if (!state.activeId) { showWelcome(); return; }
  const conv = state.convs[state.activeId];
  if (!conv) { showWelcome(); return; }

  showChat();
  D.title.textContent = conv.title;

  [...D.msgsContainer.children].forEach(k => { if (k.id !== 'typing-indicator') k.remove(); });
  conv.messages.forEach(m => appendMsgDOM(m, false));
  D.msgsContainer.appendChild(D.typingIndicator);
  scrollBottom();
}

function appendMsgDOM(msg, animate = true) {
  const isUser = msg.role === 'user';
  const div = document.createElement('div');
  div.className = `message ${isUser ? 'user' : 'ai'}`;
  div.dataset.id = msg.id;
  if (!animate) div.style.animation = 'none';

  // Build attachment HTML for user messages
  let attachHtml = '';
  if (isUser && msg.attachments?.length) {
    msg.attachments.forEach(att => {
      if (att.isImage) {
        attachHtml += `<img src="${att.dataUrl}" class="msg-uploaded-img" alt="${esc(att.name)}" />`;
      } else if (att.type.startsWith('audio/')) {
        attachHtml += `<div class="msg-audio-wrap" style="margin-bottom: 8px;">
          <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; color: var(--text-primary);">
            <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z'></path><path d='M19 10v2a7 7 0 0 1-14 0v-2'></path><line x1='12' y1='19' x2='12' y2='23'></line><line x1='8' y1='23' x2='16' y2='23'></line></svg>
            Voice Note
          </div>
          <audio src="${att.dataUrl}" controls style="max-width: 100%; height: 32px; border-radius: 99px; outline: none;"></audio>
        </div>`;
      } else {
        attachHtml += `<div class="msg-file-chip">
          <svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path><polyline points='14 2 14 8 20 8'></polyline></svg>
          ${esc(att.name)} &nbsp;<span style="opacity:0.6;font-size:11px">${fmtSize(att.size)}</span>
        </div>`;
      }
    });
  }

  div.innerHTML = `
    <div class="message-header">
      <div class="msg-avatar ${isUser ? 'user' : 'ai'}">
        ${isUser ? '👤' : `<img src="cat-logo.png" style="width:24px;height:24px;border-radius:6px;object-fit:cover;" alt="Chikki">`}
      </div>
      <span class="msg-role">${isUser ? 'You' : 'Chikki'}</span>
      <span class="msg-time">${fmtTime(msg.ts)}</span>
    </div>
    <div class="msg-bubble">
      ${attachHtml}
      <div class="msg-content">${isUser ? esc(msg.content).replace(/\n/g,'<br>') : renderMD(msg.content)}</div>
    </div>
    <div class="msg-actions">
      <button class="msg-act-btn" data-a="copy"><i data-lucide="copy"></i> Copy</button>
      ${!isUser ? `<button class="msg-act-btn" data-a="speak"><i data-lucide="volume-2"></i> Listen</button>` : ''}
      ${!isUser ? `<button class="msg-act-btn" data-a="regen"><i data-lucide="refresh-cw"></i> Retry</button>` : ''}
    </div>`;

  const speakBtn = div.querySelector('[data-a="speak"]');
  if (speakBtn) {
    const updateIcon = (speaking) => {
      speakBtn.innerHTML = speaking
        ? '<i data-lucide="volume-x"></i> Stop'
        : '<i data-lucide="volume-2"></i> Listen';
      lucide.createIcons();
    };

    speakBtn.addEventListener('click', function() {
      const isSpeakingThis = window.speechSynthesis.speaking && currentUtterance && currentUtterance.msgId === msg.id;
      if (isSpeakingThis) {
        stopSpeaking();
        updateIcon(false);
      } else {
        speakText(msg.content, 
          () => {
            if (currentUtterance) currentUtterance.msgId = msg.id;
            updateIcon(true);
          },
          () => updateIcon(false)
        );
      }
    });

    // Reset speaker icon if speech is stopped from another trigger (e.g. typing)
    document.addEventListener('speechstopped', () => updateIcon(false));
  }

  div.querySelector('[data-a="copy"]').addEventListener('click', function() {
    navigator.clipboard.writeText(msg.content).then(() => {
      this.innerHTML = '<i data-lucide="check"></i> Copied!';
      this.classList.add('ok'); lucide.createIcons();
      setTimeout(() => { this.innerHTML = '<i data-lucide="copy"></i> Copy'; this.classList.remove('ok'); lucide.createIcons(); }, 2000);
    });
  });

  const regen = div.querySelector('[data-a="regen"]');
  if (regen) regen.addEventListener('click', () => regenerate(msg.id));

  D.msgsContainer.insertBefore(div, D.typingIndicator);
  lucide.createIcons();
  return div;
}

// ===== MARKDOWN =====
marked.setOptions({ highlight: (code, lang) => {
  if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value;
  return hljs.highlightAuto(code).value;
}, breaks: true, gfm: true });

const mdRenderer = new marked.Renderer();
mdRenderer.code = (code, language) => {
  const lang = language || 'text';
  let hl;
  try { hl = hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value; }
  catch { hl = esc(code); }
  const bid = 'cb' + uid();
  return `<div class="code-wrap" id="${bid}">
    <div class="code-header">
      <span class="code-lang">${lang}</span>
      <button class="copy-code-btn" onclick="copyCode('${bid}',this)">
        <svg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='9' y='9' width='13' height='13' rx='2' ry='2'></rect><path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path></svg>
        Copy
      </button>
    </div>
    <pre><code class="hljs language-${lang}">${hl}</code></pre>
  </div>`;
};
marked.use({ renderer: mdRenderer });

const renderMD = text => { try { return marked.parse(text || ''); } catch { return esc(text); } };

window.copyCode = (bid, btn) => {
  const code = document.getElementById(bid)?.querySelector('code')?.textContent || '';
  navigator.clipboard.writeText(code).then(() => {
    btn.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 15 4 10'></polyline></svg> Copied!`;
    btn.classList.add('done');
    setTimeout(() => {
      btn.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='9' y='9' width='13' height='13' rx='2' ry='2'></rect><path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path></svg> Copy`;
      btn.classList.remove('done');
    }, 2000);
  });
};

// ===== SEND MESSAGE =====
async function sendMessage() {
  const text = D.input.value.trim();
  const hasAttachments = state.attachments.length > 0;
  if (!text && !hasAttachments || state.generating) return;

  stopSpeaking();

  if (!state.settings.apiKey) { openSettings(); showToast('Add your Gemini API key first!', 'error'); return; }

  if (!state.activeId) {
    const label = text || state.attachments[0]?.name || 'File upload';
    const conv = createConv(label);
    state.activeId = conv.id;
    store.set(KEYS.activeConv, conv.id);
    showChat();
    D.title.textContent = conv.title;
    renderConvList();
  }

  const isVoiceCommand = hasAttachments && state.attachments.every(att => att.type.startsWith('audio/')) && !text;
  const inputText = text || (isVoiceCommand ? "Respond to this voice command." : `[Attached ${state.attachments.length} file(s)]`);
  const currentAttachments = [...state.attachments];

  D.input.value = '';
  autoResize();
  state.attachments = [];
  renderAttachPreview();

  // Build user message content for display
  const userMsg = addMsg(state.activeId, 'user', inputText, currentAttachments);
  appendMsgDOM(userMsg);
  renderConvList();

  const conv = state.convs[state.activeId];
  if (conv.messages.length === 1) autoTitle(state.activeId, inputText);

  scrollBottom();
  await streamResponse();
}

// ===== STREAM AI RESPONSE =====
async function streamResponse() {
  if (!state.activeId) return;
  const conv = state.convs[state.activeId];

  state.generating = true;
  state.abort = new AbortController();
  setGenUI(true);

  // Build Gemini API messages with multimodal support
  const apiMsgs = conv.messages
    .filter(m => m.content || m.attachments?.length)
    .map(m => {
      const parts = [];
      // Add attachments as inline data
      if (m.attachments?.length) {
        m.attachments.forEach(att => {
          parts.push({
            inline_data: {
              mime_type: att.type || 'application/octet-stream',
              data: att.b64
            }
          });
        });
      }
      if (m.content) parts.push({ text: m.content });
      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts
      };
    });

  const body = {
    contents: apiMsgs,
    generationConfig: { temperature: parseFloat(state.settings.temperature), topP: 0.95, maxOutputTokens: 8192 },
    ...(state.settings.systemPrompt ? { systemInstruction: { parts: [{ text: state.settings.systemPrompt }] } } : {})
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.settings.model}:streamGenerateContent?alt=sse`;

  // Placeholder message
  const aiId = uid();
  const placeholder = { id: aiId, role: 'ai', content: '', ts: new Date().toISOString() };
  conv.messages.push(placeholder);

  const div = document.createElement('div');
  div.className = 'message ai';
  div.dataset.id = aiId;
  div.innerHTML = `
    <div class="message-header">
      <div class="msg-avatar ai"><i data-lucide="sparkles"></i></div>
      <span class="msg-role">Chikki</span>
      <span class="msg-time">${fmtTime(placeholder.ts)}</span>
    </div>
    <div class="msg-bubble">
      <div class="msg-content" id="sc-${aiId}"><span class="streaming-cursor"></span></div>
    </div>
    <div class="msg-actions">
      <button class="msg-act-btn" data-a="copy"><i data-lucide="copy"></i> Copy</button>
      <button class="msg-act-btn" data-a="regen"><i data-lucide="refresh-cw"></i> Retry</button>
    </div>`;

  D.msgsContainer.insertBefore(div, D.typingIndicator);
  lucide.createIcons();

  const contentEl = $(`sc-${aiId}`);
  let fullText = '';

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': state.settings.apiKey
      },
      body: JSON.stringify(body),
      signal: state.abort.signal
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API Error ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const j = line.slice(5).trim();
        if (!j || j === '[DONE]') continue;
        try {
          const chunk = JSON.parse(j)?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (chunk) {
            fullText += chunk;
            contentEl.innerHTML = renderMD(fullText) + '<span class="streaming-cursor"></span>';
            scrollBottom();
          }
        } catch { /* ignore */ }
      }
    }

  } catch (e) {
    if (e.name !== 'AbortError') {
      fullText = fullText || `⚠️ **Error:** ${e.message}`;
      showToast(e.message, 'error');
    }
  } finally {
    placeholder.content = fullText || '*(No response)*';
    contentEl.innerHTML = renderMD(placeholder.content);

    // Auto read aloud if enabled and request wasn't aborted
    if (state.settings.readAloud && placeholder.content && (!state.abort || !state.abort.signal.aborted)) {
      // Find the speak button for this new message to update its icon live
      const msgDiv = document.querySelector(`.message[data-id="${aiId}"]`);
      const speakBtn = msgDiv?.querySelector('[data-a="speak"]');
      const updateIcon = (speaking) => {
        if (speakBtn) {
          speakBtn.innerHTML = speaking
            ? '<i data-lucide="volume-x"></i> Stop'
            : '<i data-lucide="volume-2"></i> Listen';
          lucide.createIcons();
        }
      };

      speakText(placeholder.content,
        () => {
          if (currentUtterance) currentUtterance.msgId = aiId;
          updateIcon(true);
        },
        () => updateIcon(false)
      );
    }

    div.querySelector('[data-a="copy"]').addEventListener('click', function() {
      navigator.clipboard.writeText(placeholder.content).then(() => {
        this.innerHTML = '<i data-lucide="check"></i> Copied!'; this.classList.add('ok'); lucide.createIcons();
        setTimeout(() => { this.innerHTML = '<i data-lucide="copy"></i> Copy'; this.classList.remove('ok'); lucide.createIcons(); }, 2000);
      });
    });
    div.querySelector('[data-a="regen"]').addEventListener('click', () => regenerate(aiId));

    saveConvs();
    renderConvList();
    state.generating = false;
    state.abort = null;
    setGenUI(false);
    scrollBottom();
  }
}

async function regenerate(msgId) {
  if (state.generating || !state.activeId) return;
  const conv = state.convs[state.activeId];
  const idx = conv.messages.findIndex(m => m.id === msgId);
  if (idx === -1) return;
  conv.messages.splice(idx);
  saveConvs(); renderMessages();
  await streamResponse();
}

async function autoTitle(convId, firstMsg) {
  if (!state.settings.apiKey) return;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`;
    const body = {
      contents: [{ role: 'user', parts: [{ text: `Generate a catchy chat title (max 5 words, no quotes, no punctuation) for: "${firstMsg.slice(0, 200)}"` }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 20 }
    };
    const res = await fetch(url, { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': state.settings.apiKey
      }, 
      body: JSON.stringify(body) 
    });
    const data = await res.json();
    const title = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (title && state.convs[convId]) {
      state.convs[convId].title = title;
      saveConvs(); renderConvList();
      if (state.activeId === convId) D.title.textContent = title;
    }
  } catch { /* silent */ }
}

// ===== UI HELPERS =====
function setGenUI(v) {
  D.btnSend.style.display = v ? 'none' : 'flex';
  D.btnStop.style.display = v ? 'flex' : 'none';
  D.input.disabled = v;
  if (!v) D.input.focus();
}

const scrollBottom = () => { D.msgsArea.scrollTop = D.msgsArea.scrollHeight; };

function autoResize() {
  D.input.style.height = 'auto';
  D.input.style.height = Math.min(D.input.scrollHeight, 180) + 'px';
}

const esc = t => { const d = document.createElement('div'); d.appendChild(document.createTextNode(t)); return d.innerHTML; };

function fmtTime(iso) {
  try {
    const d = new Date(iso), now = new Date(), diff = now - d;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

function addRipple(el, e) {
  const r = document.createElement('div');
  r.className = 'ripple';
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
  el.appendChild(r);
  setTimeout(() => r.remove(), 700);
}

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="t-icon">${type === 'success' ? '✓' : '⚠'}</span><span>${esc(msg)}</span>`;
  D.toastCont.appendChild(t);
  setTimeout(() => t.remove(), 3300);
}

// ===== CONFIRM =====
function showConfirm(title, msg, cb) {
  D.confirmTitle.textContent = title;
  D.confirmMsg.textContent = msg;
  confirmCb = cb;
  D.confirmModal.classList.add('open');
}
function closeConfirm() { D.confirmModal.classList.remove('open'); confirmCb = null; }

// ===== SETTINGS =====
function openSettings() {
  D.apiKeyInput.value = state.settings.apiKey;
  D.modelSelect.value = state.settings.model;
  D.sysPrompt.value = state.settings.systemPrompt;
  D.tempSlider.value = state.settings.temperature;
  D.tempDisp.textContent = state.settings.temperature;
  D.tempVal.textContent = state.settings.temperature;
  D.readAloudToggle.checked = !!state.settings.readAloud;
  buildThemeGrid();
  D.settingsModal.classList.add('open');
  setTimeout(() => D.apiKeyInput.focus(), 120);
}

function closeSettings() { D.settingsModal.classList.remove('open'); }

function saveSettings() {
  state.settings.apiKey = D.apiKeyInput.value.trim();
  state.settings.model = D.modelSelect.value;
  state.settings.systemPrompt = D.sysPrompt.value.trim();
  state.settings.temperature = parseFloat(D.tempSlider.value);
  state.settings.readAloud = D.readAloudToggle.checked;
  // theme already updated live via swatch click
  saveSets();
  closeSettings();
  updateModelBadge();
  updateApiBanner();
  showToast('Settings saved!', 'success');
}

function updateModelBadge() {
  D.modelLabel.textContent = MODEL_LABELS[state.settings.model] || state.settings.model;
}

function updateApiBanner() {
  D.apiBanner.style.display = state.settings.apiKey ? 'none' : 'flex';
}

// ===== SIDEBAR =====
function toggleSidebar() { D.sidebar.classList.toggle('collapsed'); updateOverlay(); }
function closeSidebar() { D.sidebar.classList.add('collapsed'); updateOverlay(); }
function updateOverlay() {
  if (window.innerWidth <= 768) {
    D.overlay.classList.toggle('visible', !D.sidebar.classList.contains('collapsed'));
  }
}

// ===== EXPORT =====
function exportConvs() {
  const blob = new Blob([JSON.stringify(state.convs, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `chikki-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Chats exported!', 'success');
}

// ===== EVENTS =====
function bindEvents() {
  D.btnNew.addEventListener('click', () => {
    stopSpeaking();
    state.activeId = null;
    store.set(KEYS.activeConv, null);
    renderConvList(); showWelcome();
    D.input.focus();
  });

  D.btnToggle.addEventListener('click', toggleSidebar);
  D.overlay.addEventListener('click', closeSidebar);

  [D.btnSettings, D.btnSettingsFoot].forEach(b => b.addEventListener('click', openSettings));
  D.modelBadge.addEventListener('click', openSettings);

  $('close-settings').addEventListener('click', closeSettings);
  $('cancel-settings').addEventListener('click', closeSettings);
  $('save-settings').addEventListener('click', saveSettings);
  D.settingsModal.addEventListener('click', e => { if (e.target === D.settingsModal) closeSettings(); });

  D.toggleKey.addEventListener('click', () => {
    const isPwd = D.apiKeyInput.type === 'password';
    D.apiKeyInput.type = isPwd ? 'text' : 'password';
    D.toggleKey.innerHTML = `<i data-lucide="${isPwd ? 'eye-off' : 'eye'}"></i>`;
    lucide.createIcons();
  });

  D.tempSlider.addEventListener('input', () => {
    const v = parseFloat(D.tempSlider.value).toFixed(1);
    D.tempDisp.textContent = v; D.tempVal.textContent = v;
  });

  $('close-confirm').addEventListener('click', closeConfirm);
  $('cancel-confirm').addEventListener('click', closeConfirm);
  $('ok-confirm').addEventListener('click', () => { if (confirmCb) confirmCb(); closeConfirm(); });
  D.confirmModal.addEventListener('click', e => { if (e.target === D.confirmModal) closeConfirm(); });

  D.btnClear.addEventListener('click', () => {
    if (!Object.keys(state.convs).length) { showToast('No chats to clear', 'error'); return; }
    showConfirm('Clear All Chats?', 'All conversations will be permanently deleted.', () => {
      state.convs = {}; state.activeId = null;
      saveConvs(); store.set(KEYS.activeConv, null);
      renderConvList(); showWelcome();
      showToast('All chats cleared!', 'success');
    });
  });

  D.btnExport.addEventListener('click', exportConvs);
  D.btnSend.addEventListener('click', sendMessage);
  D.btnStop.addEventListener('click', () => { if (state.abort) state.abort.abort(); stopSpeaking(); });

  D.input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  D.input.addEventListener('input', autoResize);

  D.search.addEventListener('input', e => { state.searchQ = e.target.value; renderConvList(); });

  document.querySelectorAll('.prompt-card').forEach(c => {
    c.addEventListener('click', e => {
      addRipple(c, e);
      D.input.value = c.dataset.prompt;
      autoResize();
      sendMessage();
    });
  });

  D.apiBanner.addEventListener('click', openSettings);

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); D.btnNew.click(); }
    if (e.key === 'Escape') { closeSettings(); closeConfirm(); }
  });
}

// ===== PWA INSTALLATION TRIGGER =====
let deferredPrompt = null;

function initPWAInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installGroup = $('pwa-install-group');
    if (installGroup) installGroup.style.display = 'flex';
  });

  const installBtn = $('btn-pwa-install');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      deferredPrompt = null;
      const installGroup = $('pwa-install-group');
      if (installGroup) installGroup.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const installGroup = $('pwa-install-group');
    if (installGroup) installGroup.style.display = 'none';
    showToast('Chikki installed successfully! 🎉', 'success');
  });
}

// ===== INIT =====
function init() {
  loadState();
  bindEvents();
  initVoice();
  initFileUpload();
  initPWAInstall();
  initParticles();
  renderConvList();
  updateModelBadge();
  updateApiBanner();
  lucide.createIcons();

  // Register service worker for PWA offline capability
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('ServiceWorker registered successfully:', reg.scope))
        .catch(err => console.warn('ServiceWorker registration failed:', err));
    });
  }

  // Collapse sidebar by default on mobile screen size
  if (window.innerWidth <= 768) {
    closeSidebar();
  }

  if (state.activeId && state.convs[state.activeId]) renderMessages();
  else showWelcome();

  setTimeout(() => D.input.focus(), 150);
  if (!state.settings.apiKey) setTimeout(openSettings, 700);

  console.log('%c🐾 Chikki loaded!', 'color:#a78bfa;font-size:16px;font-weight:800;');
}

document.addEventListener('DOMContentLoaded', init);
