# AGENTS.md — `retrogames4.net`

This document provides project context, architecture overview, conventions, and development workflows for AI coding agents working in the `retrogames4.net` repository.

---

## 1. Project Overview

**`retrogames4.net`** is a browser-based retro arcade games portal featuring a neon synthwave aesthetic, an interactive embedded arcade cabinet, a filterable games catalog ("Games Vault"), user authentication, and global/personal score leaderboards ("Hall of Fame").

- **Frontend Stack:** Vanilla HTML5, CSS3, ES6+ JavaScript, HTML5 `<canvas>`, Tailwind CSS, FontAwesome 6.4.0, and Tone.js (`14.8.49`) for Web Audio synth sound effects.
- **Backend Service:** Connects to a dedicated REST API (`retrogames-service`), defaulting to `https://retrogames-service.onrender.com` (overridable via `window.API_BASE_URL`).
- **Hosting:** Static site compatible with GitHub Pages or any static web server.

---

## 2. Repository Structure

```text
.
├── index.html                  # Main landing page, embedded arcade cabinet, vault catalog, leaderboard & auth modals
├── package.json                # NPM scripts and Tailwind CSS CLI devDependencies
├── tailwind.config.js          # Tailwind configuration (custom `neon` palette and fonts)
├── css/
│   ├── input.css               # Tailwind directives entry point + imports `./styles.css`
│   ├── styles.css              # Custom styles: CRT scanlines, neon glows, synth-grid, Mid-Autumn animations
│   └── tailwind.css            # Compiled Tailwind CSS output (generated via `npm run build:css`)
├── js/
│   ├── main.js                 # Core portal logic: Tone.js audio, vault filtering, auth, score API & leaderboards, in-arcade Cyber Maze
│   └── game.js                 # Embedded "Retro Breakout" canvas game & fullscreen handler
├── games/                      # Standalone playable games launched from the Vault
│   ├── block-stacker/
│   │   └── index.html          # Self-contained polyomino/Tetris-style puzzle game (HTML/CSS/JS + Web Audio)
│   ├── cyber-maze/
│   │   ├── index.html          # Standalone Cyber Maze page
│   │   ├── style.css           # Cyber Maze styles
│   │   └── game.js             # Standalone Cyber Maze canvas logic & score submission
│   ├── moon-festival/
│   │   └── index.html          # Self-contained Mid-Autumn Festival space shooter ("Jade Rabbit vs Grapefruit Monsters")
│   └── raiden/
│       ├── index.html          # Self-contained vertical scrolling shoot-'em-up game
│       └── assets/             # Spritesheets, stage backgrounds, tilemaps, and boss graphics
└── docs/
    └── REGISTER_TROUBLESHOOTING.md # Troubleshooting guide for backend cold starts, CORS, and `/register`
```

---

## 3. Build & Development Commands

- **Install dependencies:**
  ```bash
  npm install
  ```
- **Compile Tailwind CSS (one-off build):**
  ```bash
  npm run build:css
  ```
  *(Runs `tailwindcss -i ./css/input.css -o ./css/tailwind.css`)*
- **Watch Tailwind CSS during development:**
  ```bash
  npm run watch:css
  ```
- **Run locally:**
  Open `index.html` directly in a browser or serve the root directory with any static HTTP server (e.g., `npx serve .` or `python3 -m http.server 8080`).

> **Note on Tailwind CSS loading:** `index.html` currently includes the Tailwind CDN script alongside custom config and `./css/styles.css`, while `npm run build:css` compiles `./css/input.css` into `./css/tailwind.css`. Keep `tailwind.config.js`, the inline `tailwind.config` in `index.html`, and `css/styles.css` synchronized when modifying theme tokens.

---

## 4. Visual Design & Theme Conventions

Maintain the **Neon Synthwave / Retro Arcade** look and feel across all pages and games:

### Color Palette (`neon.*`)
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `neon-dark` | `#0a0a12` (or `#070711` in standalone games) | Primary page & canvas background |
| `neon-card` | `#121225` | Cards, modals, HUD panels, maze walls |
| `neon-pink` | `#ff007f` | Primary accents, CTAs, bricks, player highlights |
| `neon-cyan` | `#00f3ff` | Secondary accents, borders, HUD text, shields |
| `neon-purple` | `#9d00ff` | Subtle borders, gradients, badges |
| `neon-yellow` | `#ffe600` | Scores, rankings, paddles, Mid-Autumn Festival accents |

### Typography
- **Arcade / Pixel UI (`font-arcade`):** `'Press Start 2P', monospace` — used for buttons, HUDs, scores, badges, and modal titles.
- **Section Headings (`font-heading`):** `'Rajdhani', sans-serif` — used for large section headers and card titles.
- **Body & Data:** `'Inter', sans-serif` (`font-sans`) and `'Courier New', monospace` (`font-mono`).

### Signature Visual Effects (`css/styles.css`)
- `.scanlines`: Fixed full-screen CRT scanline overlay (`pointer-events: none`).
- `.synth-grid`: Cyan/pink perspective grid background.
- `.glow-pink`, `.glow-cyan`, `.glow-yellow` & `.text-glow-*`: Neon box-shadow and text-shadow utilities.
- Respect `prefers-reduced-motion: reduce` when adding new CSS keyframe animations.

---

## 5. Architecture & Code Conventions

### Global Scope & HTML Event Handlers
- `index.html` uses vanilla `<script>` tags (`./js/main.js` and `./js/game.js`) without a module bundler.
- Functions referenced by inline HTML attributes (`onclick="..."`) or shared across scripts **must** be explicitly attached to `window` at the bottom of `js/main.js` or `js/game.js` (e.g., `window.startGame`, `window.submitGameScore`, `window.filterVault`, `window.launchDemo`, `window.toggleSound`).

### Backend API & Offline-First Persistence (`js/main.js`)
- **Base URL:** `const API_BASE_URL = window.API_BASE_URL || 'https://retrogames-service.onrender.com';`
- **Endpoints:**
  - `POST /register` — `{ email, password }` (min 6 chars password)
  - `POST /login` — `{ email, password }` -> stores user object in `localStorage` under **`retrogames4User`**.
  - `POST /scores` — Submits score payload containing both snake_case and camelCase keys for backend compatibility:
    ```json
    {
      "user_id": "<id>",
      "userId": "<id>",
      "game_id": "<gameId>",
      "gameId": "<gameId>",
      "score": 1000,
      "email": "user@example.com"
    }
    ```
  - `GET /scores/<game_id>` (fallback: `GET /scores/leaderboard/<game_id>`) — Retrieves top scores for a game. Falls back to `renderFallbackLeaderboard(gameId)` if offline or if the Render free-tier instance is cold-starting.
  - `GET /users/<user_id>/scores` — Retrieves personal score history. Cached in `localStorage` under **`retrogames4_scores_<userId>`**.

### Security & DOM Manipulation
- Always sanitize dynamic user strings (such as usernames/emails rendered in leaderboards) with `escapeHtml(str)` before inserting into `innerHTML`.

### Game Development Guidelines (`games/*` & `js/game.js`)
When creating a new game or modifying an existing one:
1. **Controls:** Support both desktop keyboard (`Arrow` keys + `WASD` / `Space`) and mobile touch controls (on-screen virtual buttons or touch joysticks with `touch-action: manipulation` and `{ passive: false }` where appropriate).
2. **Audio:** Gate Web Audio API / `Tone.start()` calls behind user interaction and respect mute state, catching audio context errors gracefully.
3. **Responsive Canvas:** Handle `window` resize and fullscreen changes (`toggleGameFullscreen` / CSS fallback) without breaking game state.
4. **Score Submission:** Read `retrogames4User` from `localStorage` (or call `window.submitGameScore(gameId, score, options)` if embedded) and POST to `${API_BASE_URL}/scores` on game over/win.
5. **Vault & Leaderboard Registration:** When adding a new game with slug `<game-id>`:
   - Add its display name to `GAME_NAMES` in `js/main.js`.
   - Add a launch route in `launchDemo(title)` in `js/main.js`.
   - Add fallback high scores in `renderFallbackLeaderboard(gameId)` in `js/main.js`.
   - Add a game card in `#gamesGrid` and a leaderboard tab button (`#leaderboardTab-<game-id>`) in `index.html`.
   - Include a "BACK TO VAULT" button (`../../index.html#catalog`) in the standalone game's top navigation bar.
