<div align="center">

<img src="cat-logo.png" width="140" style="border-radius:28px;" alt="Chikki Logo" />

# Chikki AI 🐱

**A beast-mode, client-side PWA chatbot that actually remembers you.**
*Persistent IndexedDB Memory · Direct Voice Input · Offline Cache · 8 Stunning Themes · PC Folder Sync*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-7c6bff?style=for-the-badge)](https://sanjay3226.github.io/Chikki)
[![Gemini API](https://img.shields.io/badge/Powered_by-Gemini_API-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-22d3a0?style=for-the-badge&logo=pwa)](https://web.dev/explore/progressive-web-apps)
[![No Backend](https://img.shields.io/badge/Backend-None_Required-fb923c?style=for-the-badge)](https://pages.github.com)

</div>

---

## ✨ What is Chikki?

Chikki is a **fully client-side Progressive Web App (PWA) chatbot** designed to run seamlessly on both mobile devices and PCs with zero backend dependencies. Unlike simple wrappers, Chikki is built for **GitHub Pages** deployment with maximum reliability: it replaces volatile browser caching with **IndexedDB storage**, extracts **persistent AI memories** in the background, and supports **real-time directory syncing** on desktop computers.

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **Persistent AI Memory** | Chikki automatically extracts key facts about you in the background and injects them into the Gemini prompt context. |
| 🗄️ **IndexedDB Storage** | Completely replaces standard `localStorage` with a robust, asynchronous IndexedDB client to prevent data loss. |
| 📂 **PC Local Directory Sync** | Desktop users can link a local folder to sync conversation backups in real-time. |
| 🎤 **Native Voice Capture** | Sends microphone audio blobs directly to the Gemini API. No browser Speech-to-Text needed. |
| 🔊 **Voice Synthesis** | Fluid read-aloud support with customizable speech rates and selectable language voices. |
| ❄️ **PWA & Offline Cache** | Installs as a standalone native app. Caches static assets to boot instantly and support offline launches. |
| 🎨 **8 Premium Themes** | Translucent glassmorphism styling utilizing dynamic HSL color blending: *Purple, Ocean, Midnight, Rose, Forest, Sunset, Nord, and Candy*. |
| 📎 **Multi-File Uploads** | Attach code files, texts, PDFs, or images for immediate visual/textual analysis. |
| 🌊 **SSE Streaming** | Word-by-word streaming responses with responsive inline error bubble fallback. |
| 💻 **Code Highlight & Copy** | Syntax-highlighted code blocks with line-number guides and one-click copy buttons. |
| 🔍 **Full-Text Search** | Quickly search through your entire chat history in the sidebar. |

---

## 🎬 Quick Start

### Option 1 — Open Live App
👉 **[Launch Chikki AI](https://sanjay3226.github.io/Chikki)**

1. Open **⚙️ Settings** (bottom left corner).
2. The app comes pre-configured with a secure embedded default key. You can also paste your own [free Gemini API key](https://aistudio.google.com/apikey).
3. Select your model, theme, and start chatting!

### Option 2 — Run Locally
```bash
# Clone the repository
git clone https://github.com/sanjay3226/Chikki.git
cd Chikki

# Start a local static server (required for microphone and directory sync permissions)
python -m http.server 8080

# Open your browser and navigate to:
# http://localhost:8080
```

---

## 🧠 The AI Memory Brain

After every conversational turn, Chikki triggers a background extraction task:
1. Gemini analyzes the query/response turn to extract permanent facts about you (e.g. your name, project configurations, favorite stacks, likes/dislikes).
2. Facts are parsed into structured JSON and written into the **IndexedDB memory store**.
3. During future messages, the top facts are retrieved and prepended as `[PERSISTENT MEMORY CONTEXT]` inside the Gemini system prompt instructions.
4. You can view, manage, and delete saved facts at any time by clicking the **🧠 Memories** badge in the sidebar.

---

## 📂 PC Folder Sync (File System Access API)

On desktop browsers (Chrome, Edge, Opera), click the **PC Local Sync** button in Settings:
- Select a folder on your computer (e.g. `Documents/Chikki`).
- Grant read/write permission when prompted.
- Chikki will now save automatic real-time JSON backups of your settings, conversations, and memories directly into your local folder!

---

## 🤖 Supported Models

| Model Name | Purpose | Speed |
|------------|---------|-------|
| **Gemini 3.5 Flash** ⭐ | Default model, wittiest, fastest response, multimodal capabilities. | Ultra Fast ⚡ |
| **Gemini 3.1 Flash Lite** | Extremely resource-light, great for basic lookup. | Instant ⚡ |
| **Gemini 3.1 Pro** | Deep logic, advanced math, and structured programming analysis. | Intelligent 🧠 |
| **Gemini 2.5 Pro** | Legacy reasoning engine. | Stable |

---

## 🏗️ Technical Stack

- **Zero dependencies. No NPM build step. Pure Vanilla Web Engineering.**

```
Chikki/
├── index.html      — UI layout, modals, input panels, PWA tags
├── style.css       — Glassmorphic styling, HSL variables, responsive dynamic layouts
├── app.js          — IndexedDB storage wrappers, Gemini stream, TTS/STT, file sync handlers
├── sw.js           — Progressive Web App service worker for offline caching
├── manifest.json   — PWA standalone installer configurations
└── cat-logo.png    — App cartoon mascot image
```

- **Markdown Engine**: `marked.js`
- **Syntax Highlighter**: `highlight.js`
- **Icons Resource**: `Lucide Icons`
- **Typography**: Google Fonts (`Plus Jakarta Sans`, `JetBrains Mono`)

---

## 🔒 Privacy & Safety

- 🗝️ **Your Key, Your Space**: API keys are saved strictly in your local browser sandbox. They are never transmitted to third-party databases.
- 💬 **No Cloud Databases**: Conversations are stored inside browser-encrypted IndexedDB partitions.
- 🚫 **Zero Telemetry**: No trackers, no cookies, and no analytical trackers are embedded.

---

## 📄 License

This project is licensed under the MIT License — feel free to customize, fork, and self-host!

<div align="center">

Made with 💜 and lots of coffee ☕
**[⭐ Star this repo](https://github.com/sanjay3226/Chikki)** if Chikki made you smile! 🐱

</div>
