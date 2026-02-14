# 🚀 Turso 雲端資料庫部署指南

## 已完成的修改

✅ 將 `better-sqlite3` 改為 `@libsql/client`
✅ 修改 `lib/db.ts` 使用 Turso 異步 API
✅ 更新 `package.json` 依賴項
✅ 更新 `README.md` 加入 Turso 設定說明
✅ 創建 `.env.example` 環境變數範本

## 📋 部署步驟

### 1. 設定 Turso 雲端資料庫

```bash
# 安裝 Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 登入 Turso（會開啟瀏覽器）
turso auth login

# 創建資料庫
turso db create grade1-math-app

# 取得資料庫 URL
turso db show grade1-math-app --url
# 輸出範例：libsql://grade1-math-app-username.turso.io

# 創建驗證 token
turso db tokens create grade1-math-app
# 輸出範例：eyJhbGc...（一長串 token）
```

### 2. 在 Vercel 設定環境變數

登入 Vercel Dashboard：
1. 進入你的專案 `grade1-math-app`
2. 點擊 **Settings** > **Environment Variables**
3. 加入兩個環境變數：

```
Name: TURSO_DATABASE_URL
Value: libsql://grade1-math-app-yourusername.turso.io
Environment: Production, Preview, Development
```

```
Name: TURSO_AUTH_TOKEN
Value: eyJhbGc...（你的完整 token）
Environment: Production, Preview, Development
```

### 3. 推送程式碼到 GitHub

這些修改需要推送到 GitHub，Vercel 會自動重新部署。

執行以下指令（透過 github-repository-manager）：

1. **查看目前狀態**
   - 確認哪些檔案被修改了

2. **提交變更**
   - Commit message: "Migrate from local SQLite to Turso cloud database"
   - 修改的檔案：
     - package.json
     - lib/db.ts
     - README.md
     - .env.example（新增）

3. **推送到 GitHub**
   - Push 到 main 分支

### 4. 等待 Vercel 自動部署

推送後，Vercel 會：
1. 自動偵測變更
2. 安裝新的依賴（@libsql/client）
3. 重新建置應用
4. 使用 Turso 環境變數連接雲端資料庫
5. 部署完成！

### 5. 初始化資料庫

首次部署後，資料庫結構會在應用啟動時自動創建（透過 initDatabase() 函數）。

或者，你可以手動執行：

```bash
# 使用 Turso CLI 連接資料庫
turso db shell grade1-math-app

# 在 shell 中執行 SQL（複製貼上）
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS answer_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  question_type TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  stars INTEGER DEFAULT 0,
  badges TEXT DEFAULT '[]',
  total_correct INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  question_type TEXT NOT NULL,
  current_difficulty INTEGER DEFAULT 1,
  mastery_level REAL DEFAULT 0.0,
  last_practiced DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE(student_id, question_type)
);

INSERT INTO students (name) VALUES ('小朋友');
INSERT INTO rewards (student_id) VALUES (1);

-- 退出
.exit
```

## ✅ 驗證部署

部署完成後：
1. 訪問你的 Vercel 應用 URL
2. 嘗試回答幾題
3. 檢查家長報告頁面是否正常顯示統計
4. 重新整理頁面，確認資料有保存（不會消失）

## 🔍 疑難排解

### 錯誤：Database connection failed
- 檢查 Vercel 環境變數是否正確設定
- 確認 token 沒有複製錯誤（不要有空格）
- 重新生成 token：`turso db tokens create grade1-math-app`

### 資料沒有保存
- 確認環境變數在所有環境（Production, Preview, Development）都有設定
- 檢查 Vercel 部署日誌是否有錯誤
- 使用 Turso CLI 查看資料庫：`turso db shell grade1-math-app`

### 性能問題
- Turso 免費版已經很快，全球分散式
- 如需更高性能，可升級 Turso 付費方案

## 📊 監控資料庫

```bash
# 查看資料庫資訊
turso db show grade1-math-app

# 連接到資料庫 shell
turso db shell grade1-math-app

# 查看所有表格
.tables

# 查看學生資料
SELECT * FROM students;

# 查看答題記錄
SELECT * FROM answer_records ORDER BY created_at DESC LIMIT 10;

# 查看統計
SELECT * FROM rewards;
```

## 🎉 完成！

現在你的應用：
- ✅ 使用雲端資料庫，資料永久保存
- ✅ 與 Vercel 無伺服器環境完美相容
- ✅ 支援多人同時使用
- ✅ 全球低延遲存取
- ✅ 完全免費（免費額度非常充足）
