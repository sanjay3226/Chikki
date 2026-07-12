<div align="center">

<img src="cat-logo.png" width="160" alt="Chikki Logo" />

# Chikki AI 🐱

**A premium AI chatbot that actually remembers you.**
*Voice input · Persistent memory · 8 stunning themes · File uploads*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-7c6bff?style=for-the-badge)](https://YOUR-USERNAME.github.io/chikki)
[![Gemini API](https://img.shields.io/badge/Powered_by-Gemini_API-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-22d3a0?style=for-the-badge)](LICENSE)
[![No Backend](https://img.shields.io/badge/Backend-None_Required-fb923c?style=for-the-badge)](https://pages.github.com)

</div>

---

## ✨ What is Chikki?

Chikki is a **fully client-side AI chatbot** that runs in your browser with zero backend. It uses Google's **Gemini API** directly from the frontend — no server, no database, no setup.

> Unlike ChatGPT or other chatbots, Chikki stores your **full conversation history** in your browser, so the AI always has complete context of everything you've ever talked about.

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🧠 **Persistent Memory** | Full conversation history stored in `localStorage` — AI remembers everything |
| 🎤 **Voice Input** | Click the mic, speak your message — auto-transcribes & sends |
| 📎 **File Uploads** | Attach images, PDFs, code files — Gemini reads & analyzes them |
| 🌊 **Streaming Responses** | Word-by-word real-time AI responses (no waiting) |
| 🎨 **8 Themes** | Purple · Ocean · Midnight · Rose · Forest · Sunset · Nord · Candy |
| 💻 **Code Highlighting** | Syntax-highlighted code blocks with one-click copy |
| 📝 **Markdown Rendering** | Full markdown support — tables, lists, bold, code, quotes |
| 🤖 **6 Gemini Models** | Switch between Gemini 3.5 Flash, 3.1, 2.5 Pro and more |
| 🔍 **Search Chats** | Full-text search across all conversations |
| 📂 **Multi-conversation** | Create, rename, delete, and switch between chats |
| 🔄 **Regenerate** | Retry any AI response with one click |
| 📤 **Export** | Download all conversations as JSON |
| ✨ **Particle Background** | Animated particles that change color with theme |
| 📱 **Responsive** | Works on mobile with collapsible sidebar |

---

## 🎬 Quick Start

### Option 1 — Use directly (GitHub Pages)

👉 **[Open Chikki](https://YOUR-USERNAME.github.io/chikki)**

1. Click ⚙️ Settings
2. Paste your [free Gemini API key](https://aistudio.google.com/apikey)
3. Start chatting!

### Option 2 — Run locally

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/chikki.git
cd chikki

# Serve with Python (required for voice input)
python -m http.server 8080

# Open in browser
# http://localhost:8080
```

> ⚠️ **Don't open `index.html` directly** — voice input requires HTTP/HTTPS. Use the Python server or GitHub Pages.

---

## 🔑 Getting Your Free API Key

1. Go to **[Google AI Studio](https://aistudio.google.com/apikey)**
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy the key
5. In Chikki → click ⚙️ Settings → paste key → Save

> The key is stored **only in your browser** (`localStorage`). It's never sent to any server except Google's Gemini API.

---

## 🎨 Themes Preview

| Purple Night | Ocean Blue | Rose Blossom | Forest |
|:---:|:---:|:---:|:---:|
| 💜 Default | 🌊 Cool | 🌸 Romantic | 🌿 Fresh |

| Sunset | Nord | Midnight | Candy |
|:---:|:---:|:---:|:---:|
| 🌅 Warm | 🧊 Nordic | ⬛ Minimal | 🍬 Vivid |

Switch themes anytime in ⚙️ Settings → Theme section.

---

## 🤖 Supported Models

| Model | Speed | Best For |
|-------|-------|---------|
| **Gemini 3.5 Flash** ⭐ | ⚡ Fastest | Daily chats, coding, everything |
| Gemini 3.1 Flash Lite | ⚡⚡ Ultra fast | Quick Q&A, high volume |
| Gemini 3.1 Pro Preview | 🧠 Deep | Complex reasoning |
| Gemini 2.5 Flash | 🔬 Stable | Reliable tasks |
| Gemini 2.5 Flash Lite | ⚡ Light | Simple tasks |
| Gemini 2.5 Pro | 🔬 Capable | Long documents |

---

## 🏗️ Tech Stack

```
Chikki/
├── index.html      — UI structure (sidebar, chat, modals)
├── style.css       — Design system (8 themes, animations, glassmorphism)
├── app.js          — All logic (Gemini API, voice, storage, themes)
└── cat-logo.png    — Chikki mascot (AI-generated)
```

**Zero dependencies. No npm. No build step. No backend.**

| Layer | Technology |
|-------|-----------|
| Structure | Vanilla HTML5 |
| Styling | Vanilla CSS (CSS Variables, Glassmorphism) |
| Logic | Vanilla JavaScript (ES6+) |
| AI | Google Gemini API (streaming via SSE) |
| Voice | Web Speech API (built into browser) |
| Markdown | marked.js (CDN) |
| Code Highlight | highlight.js (CDN) |
| Icons | Lucide Icons (CDN) |
| Storage | localStorage (browser-native) |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Ctrl + K` | New conversation |
| `Escape` | Close modals |

---

## 🔒 Privacy

- ✅ **Your API key** is stored only in your browser's `localStorage`
- ✅ **Your conversations** are stored only in your browser's `localStorage`
- ✅ **No data** is ever sent to any server except Google's Gemini API (for AI responses)
- ✅ **No analytics**, no tracking, no cookies
- ✅ **Fully open source** — audit the code yourself

---

## 🛠️ Deploy to GitHub Pages

```bash
# 1. Fork or clone this repo
git clone https://github.com/YOUR-USERNAME/chikki.git

# 2. Push to your GitHub
cd chikki
git add .
git commit -m "🐱 Initial Chikki deploy"
git push origin main

# 3. Enable GitHub Pages
# GitHub Repo → Settings → Pages → Source: main branch → / (root)

# 4. Your app is live at:
# https://YOUR-USERNAME.github.io/chikki
```

---

## 📄 License

MIT License — free to use, modify, and share.

---

<div align="center">

Made with 💜 and lots of ☕

**[⭐ Star this repo](https://github.com/YOUR-USERNAME/chikki)** if Chikki made you smile! 🐱

</div>
