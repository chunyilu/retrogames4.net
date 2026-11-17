# 🎮 retrogames4.net — 霓虹街機懷舊遊戲大廳

基於 HTML5、CSS3、JavaScript、HTML5 `<canvas>` 與 Tailwind CSS 建構的網頁端復古霓虹街機（Neon Synthwave）遊戲大廳。

---

## ✨ 專案簡介

`retrogames4.net` 是一個可在瀏覽器中直接暢玩的復古街機遊戲平台，融合了 80/90 年代 CRT 掃描線、霓虹發光美學與 Web Audio 合成器音效（Tone.js），並提供帳號註冊登入、個人戰績統計以及全球積分排行榜（Hall of Fame）。

### 🕹️ 收錄的可玩遊戲

1. **內嵌街機房（Arcade Room）：**
   - **Retro Breakout（霓虹打磚塊）：** 經典擋板彈球擊碎霓虹磚塊，支援全螢幕與觸控操作。
   - **Cyber Maze（賽博迷宮 - 街機內嵌版）：** 可在街機框體內一鍵切換遊玩的霓虹迷宮逃脫遊戲。
2. **遊戲寶庫（Games Vault）獨立遊戲：**
   - **🚀 Raiden（雷電：星際空襲）** `games/raiden/` — 縱向捲軸空戰射擊遊戲，包含 8 個關卡、武器升級系統、全畫面炸彈與巨型 Boss 戰。
   - **🥊 Streets of Neon（霓虹街頭）** `games/streets-of-neon/` — 2.5D 街機橫向捲軸動作格鬥遊戲，支援三連擊、跳躍飛踢與旋風必殺技（AoE）。
   - **⚔️ LCM Hero Adventure（最小公倍數勇者大冒險）** `games/lcm-hero/` — 2D 數學教育 JRPG，包含四大數學關卡區域、數學護盾回合制戰鬥、**短除法（Short Division）教學仙子**、裝備商店與 **Adaptive Edge AI** 離線自適應難度模型。
   - **🌕 Moon Festival: Jade Rabbit（中秋保衛戰：玉兔戰柚子怪）** `games/moon-festival/` — 玉兔太空射擊遊戲，橫跨多個星系保衛滿月。
   - **🧱 Block Stacker（霓虹俄羅斯方塊）** `games/block-stacker/` — 經典多格骨牌消除益智遊戲，支援暫存佇列（Hold）、連擊與加速挑戰。
   - **👻 Cyber Maze（賽博迷宮獨立版）** `games/cyber-maze/` — 穿越霓虹網格迷宮並抵達終點記錄高分。

---

## 📂 專案目錄結構

```text
.
├── index.html                  # 主頁面：主題橫幅、內嵌街機房、遊戲寶庫、排行榜與登入/註冊彈窗
├── AGENTS.md                   # AI 編碼代理開發規範與架構說明文件
├── package.json                # NPM 腳本與 Tailwind CSS 套件設定
├── tailwind.config.js          # Tailwind 主題設定（自訂 neon 配色與字型）
├── css/
│   ├── input.css               # Tailwind 指令入口檔案
│   ├── styles.css              # 自訂樣式：CRT 掃描線、霓虹光效、流星雨動畫與網格背景
│   └── tailwind.css            # 編譯產生的 Tailwind CSS 檔案
├── js/
│   ├── main.js                 # 核心大廳邏輯：音效、分類篩選、使用者驗證、排行榜 API 與內嵌迷宮
│   └── game.js                 # 內嵌 Retro Breakout 畫布遊戲與全螢幕切換控制
├── games/                      # 獨立可玩遊戲目錄
│   ├── raiden/                 # 雷電縱向射擊遊戲及貼圖資源
│   ├── streets-of-neon/        # 2.5D 街頭橫向格鬥遊戲
│   ├── lcm-hero/               # 2D 最小公倍數數學 JRPG
│   ├── moon-festival/          # 玉兔星際保衛戰射擊遊戲
│   ├── block-stacker/          # 霓虹方塊益智遊戲
│   └── cyber-maze/             # 賽博迷宮獨立版
└── docs/
    └── REGISTER_TROUBLESHOOTING.md # 後端服務冷啟動、CORS 與註冊 API 疑難排解指南
```

---

## 🚀 快速開始

### 環境需求

請確保本機已安裝 [Node.js](https://nodejs.org/) 與 `npm`。

### 1. 安裝相依套件

```bash
npm install
```

### 2. 編譯 Tailwind CSS

```bash
npm run build:css
```
*（編譯 `./css/input.css` 並輸出至 `./css/tailwind.css`）*

### 3. 開發模式監聽 CSS 變更

```bash
npm run watch:css
```

### 4. 執行網站

直接在瀏覽器中開啟 `index.html`，或使用任意靜態伺服器啟動本機預覽：

```bash
python3 -m http.server 8080
# 接著在瀏覽器造訪 http://localhost:8080
```

---

## 🛠️ 技術堆疊

- **前端核心：** HTML5、CSS3、JavaScript (ES6+)、HTML5 `<canvas>`
- **樣式與圖示：** Tailwind CSS、FontAwesome 6.4.0、Google Fonts (`Press Start 2P`、`Rajdhani`)
- **音訊合成：** Tone.js (`14.8.49`) & 原生 Web Audio API 合成器音效
- **後端介面：** 串接 `retrogames-service` REST API（支援離線 `localStorage` 自動降級快取）

---

## 🔗 程式碼儲存庫

GitHub: [https://github.com/chunyilu/retrogames4.net](https://github.com/chunyilu/retrogames4.net)

---

## 📄 開源授權條款 (License)

本專案採用 **GNU General Public License v3.0 (GPLv3)** 授權條款開源。
