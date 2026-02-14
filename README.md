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
- 📝 **答題記錄**：詳細的答題歷史記錄
- 🎯 **弱點分析**：了解各題型的掌握程度

## 🚀 快速開始

### 方案一：使用已部署版本（推薦）

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

5. **啟動開發伺服器**
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
│   ├── layout.tsx           # 全域佈局
│   └── globals.css          # 全域樣式
├── components/              # React 組件
│   ├── QuestionCard.tsx     # 題目卡片組件
│   └── RewardDisplay.tsx    # 獎勵顯示組件
├── lib/                     # 核心功能庫
│   ├── db.ts                # 資料庫操作
│   └── question-generator.ts # 題目生成邏輯
├── scripts/                 # 工具腳本
│   └── init-db.js           # 資料庫初始化
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🎮 使用說明

### 學生使用
1. 開啟首頁，系統會自動生成題目
2. 閱讀題目和視覺化提示（emoji）
3. 點選答案選項
4. 答對會獲得星星和慶祝動畫
5. 自動載入下一題繼續練習

### 家長使用
1. 點擊首頁底部的「家長看這裡 →」
2. 查看學習總覽（星星數、正確率、完成題數）
3. 檢視各題型的掌握程度
4. 查看最近的答題記錄

## 🎯 題型說明

### 加法 (Addition)
- 範例：`3 + 2 = ?`
- 難度 1：數字 1-5
- 難度 2：數字 1-10
- 難度 3：數字 1-20

### 減法 (Subtraction)
- 範例：`5 - 2 = ?`
- 保證不會出現負數結果

### 比大小 (Compare)
- 範例：`3 __ 5`（選擇 >、<、=）
- 搭配視覺化圖示輔助理解

### 數數 (Counting)
- 範例：「數一數有幾個？」+ emoji 圖示
- 訓練數數能力

### 找缺失數字 (Missing Number)
- 範例：`3, __, 5`
- 訓練數字順序概念

## 🎨 自訂設定

### 修改難度範圍
編輯 `lib/question-generator.ts` 中的 `getRandomNumber` 函數：
```typescript
function getRandomNumber(difficulty: number): number {
  if (difficulty === 1) return Math.floor(Math.random() * 5) + 1;
  // 調整數字範圍
}
```

### 調整獎勵規則
編輯 `app/api/answer/route.ts`：
```typescript
const starsEarned = is_correct ? 1 : 0; // 修改答對得到的星星數
```

### 更改視覺元素
編輯 `lib/question-generator.ts` 中的 `generateVisual` 函數：
```typescript
const emojis = ['🍎', '⭐', '🎈', '🌸', '🐟']; // 自訂 emoji
```

## 📊 資料庫結構

使用 Turso 雲端 SQLite 資料庫：

- **students**：學生資料
- **answer_records**：答題記錄
- **rewards**：獎勵統計
- **progress**：學習進度追蹤

**為什麼用 Turso？**
- ✅ 免費雲端 SQLite（500 個資料庫，9GB 儲存）
- ✅ 與 Vercel 無伺服器環境完美相容
- ✅ 資料持久化，不會在部署時重置
- ✅ 全球分散式，低延遲
- ✅ 完全相容 SQLite 語法

## 🚢 部署到生產環境

### 選項 1：Vercel（推薦）

1. 註冊 [Vercel](https://vercel.com) 帳號
2. 設定 Turso 資料庫（見上方「設定 Turso 雲端資料庫」）
3. 在 Vercel 專案設定中加入環境變數：
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. 連接 GitHub 儲存庫並部署
5. 資料會永久保存在 Turso 雲端，不會在部署時重置！

### 選項 2：本地伺服器

```bash
# 建置生產版本
npm run build

# 啟動生產伺服器
npm start
```

### 選項 3：Docker 部署

創建 `Dockerfile`：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm run db:init
EXPOSE 3000
CMD ["npm", "start"]
```

建置和執行：
```bash
docker build -t grade1-math-app .
docker run -p 3000:3000 grade1-math-app
```

## 🔧 疑難排解

### 問題：資料庫連接失敗
- 檢查 `.env.local` 檔案是否正確設定
- 確認 `TURSO_DATABASE_URL` 和 `TURSO_AUTH_TOKEN` 正確
- 測試 Turso 連接：`turso db shell grade1-math-app`

### 問題：題目沒有顯示
- 檢查瀏覽器控制台是否有錯誤
- 確認 API 路由正常運作：訪問 `http://localhost:3000/api/question`

### 問題：獎勵沒有更新
- 檢查資料庫是否正確初始化
- 查看 API 回應：訪問 `http://localhost:3000/api/rewards`

## 🎯 未來擴充建議

- [ ] 增加更多題型（乘法、除法、時間認知）
- [ ] 多使用者支援（多個學生帳號）
- [ ] 音效系統（答對/答錯音效）
- [ ] 成就系統（連續答對獎勵）
- [ ] 學習提醒功能
- [ ] 匯出學習報告 PDF
- [ ] 家長設定面板（調整難度、題型）
- [ ] 離線模式支援

## 📝 技術棧

- **框架**：Next.js 15 (React 18)
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **動畫**：Framer Motion
- **資料庫**：Turso (libSQL / @libsql/client)
- **部署**：Vercel / 自架伺服器

## 📄 授權

MIT License - 自由使用和修改

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

用愛心打造 💖 為一年級小朋友設計 🎓
