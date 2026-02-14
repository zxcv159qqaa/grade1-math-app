# 🎓 小學一年級數學練習 App

專為小學一年級學生設計的數學學習應用，包含加減法、比大小、數數等多種題型，並搭配獎勵系統激勵學習。

## ✨ 功能特色

### 學生端
- 🎯 **多種題型**：加法、減法、比大小、數數、找缺失數字
- 🎨 **視覺化學習**：使用 emoji 和圖形輔助理解
- ⭐ **獎勵系統**：答對得星星，集滿 10 顆換獎章
- 🎉 **即時反饋**：答對有慶祝動畫，答錯給予鼓勵
- 📊 **自動調整難度**：根據答題表現調整題目難度

### 家長端
- 📈 **學習報告**：查看孩子的學習進度和正確率
- 📝 **答題記錄**：詳細的答題死史記錄
- 🎯 **弱點分析**：了解各題型的掌握程度

## 🚀 快速開始

### 方案一：使用已部署版本（推覦）

直接使用 Vercel 部署的線上版本，無需安裝任何東西：
- 學生練習：https://your-app.vercel.app
- 家長報告：https://your-app.vercel.app/dashboard

可以在 iPad/手機的 Safari 開啟，並「加入主畫面」當作 App 使用！

### 方案二：本地開發

#### 環境需求
- Node.js 18.0 或以上版本
- npm 或 yarn 套件管理器

#### 安裝步驟

1. **安裝相依套件**
```bash
npm install
```

2. **設定 Turso 雲端資料庫**

本專案使用 Turso 雲端 SQLite 資料庫（免費）：

```bash
# 安裝 Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 登入
turso auth login

# 創建資料庫
turso db create grade1-math-app

# 取得資料庫 URL
turso db show grade1-math-app --url

# 創建驗證 token
turso db tokens create grade1-math-app
```

3. **設定環境變數**

複製 `.env.example` 為 `.env.local` 並填入你的 Turso 資訊：
```bash
cp .env.example .env.local
```

編輯 `.env.local`：
```
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

4. **初始化資料庫**

透過 Turso CLI 執行：
```bash
turso db shell grade1-math-app < scripts/init-db.sql
```

或在啟動應用時會自動初始化。

5. **啟勡開發伺服器**
```bash
npm run dev
```

4. **開啟瀏覽器**
```
http://localhost:3000
```

學生練習：`http://localhost:3000`
家長報告：`http://localhost:3000/dashboard`

#### iPad/手機訪問（同一 WiFi）
啟動後終端會顯示網路 IP（如 `http://192.168.1.100:3000`），在 iPad 瀏覽器輸入該網址即可使用。

## 📦 專案結構

```
grade1-math-app/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 學生答題主頁
│   ├── dashboard/           # 家長儀表板
│   ├── api/                 # API 路由
│   │   ├── question/        # 題目生成 API
│   │   ├── answer/          # 答題記錄 API
│   │   ├── rewards/         # 獎勵查詢 API
│   │   └── stats/           # 統計資料 API
│   ├── layout.tsx          # App 公共布局（SEO、PWA）
│   └── globals.css           # 全域樊點

├── components/              # 共享組件
│   ├── QuestionCard.tsx    # 題目卡片組件
│   ├── AnswerButton.tsx    # 答案按阖組件
│   ├── RewardDisplay.tsx   # 瓞蒍展示\ngung

---
🚀 **部署狀態**：使用 Turso 雲端資料庫 | 最後更新：2026-02-14
