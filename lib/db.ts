import { createClient } from '@libsql/client';

// 使用環境變數連接 Turso 雲端資料庫
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

// 初始化資料庫結構
export async function initDatabase() {
  // 學生表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 答題記錄表
  await db.execute(`
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
    )
  `);

  // 獎勵記錄表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      stars INTEGER DEFAULT 0,
      badges TEXT DEFAULT '[]',
      total_correct INTEGER DEFAULT 0,
      total_questions INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  // 學習進度表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      question_type TEXT NOT NULL,
      current_difficulty INTEGER DEFAULT 1,
      mastery_level REAL DEFAULT 0.0,
      last_practiced DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE(student_id, question_type)
    )
  `);

  // 用戶統計表（連續天數追蹤）
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      streak_days INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_practice_date DATE,
      total_practice_days INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE(student_id)
    )
  `);

  // 扭蛋收集表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      item_emoji TEXT NOT NULL,
      rarity TEXT NOT NULL,
      collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  // 挑戰記錄表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS challenge_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      challenge_type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      score INTEGER NOT NULL,
      correct_count INTEGER NOT NULL,
      total_count INTEGER NOT NULL,
      time_spent INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  // 創建預設學生（如果不存在）
  const existingStudent = await db.execute('SELECT id FROM students WHERE id = 1');
  if (existingStudent.rows.length === 0) {
    await db.execute({
      sql: 'INSERT INTO students (name) VALUES (?)',
      args: ['小朋友']
    });
    await db.execute({
      sql: 'INSERT INTO rewards (student_id) VALUES (1)',
      args: []
    });
    await db.execute({
      sql: 'INSERT INTO user_stats (student_id) VALUES (1)',
      args: []
    });
  }
}

// 數據庫操作函數
export const dbOperations = {
  // 獲取學生資訊
  getStudent: async (id: number) => {
    const result = await db.execute({
      sql: 'SELECT * FROM students WHERE id = ?',
      args: [id]
    });
    return result.rows[0] || null;
  },

  // 記錄答題
  recordAnswer: async (record: {
    student_id: number;
    question_type: string;
    difficulty: number;
    question: string;
    correct_answer: string;
    user_answer: string;
    is_correct: boolean;
    time_spent: number;
  }) => {
    return await db.execute({
      sql: `
        INSERT INTO answer_records 
        (student_id, question_type, difficulty, question, correct_answer, user_answer, is_correct, time_spent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        record.student_id,
        record.question_type,
        record.difficulty,
        record.question,
        record.correct_answer,
        record.user_answer,
        record.is_correct ? 1 : 0,
        record.time_spent
      ]
    });
  },

  // 更新獎勵
  updateRewards: async (studentId: number, stars: number, isCorrect: boolean) => {
    return await db.execute({
      sql: `
        UPDATE rewards 
        SET stars = stars + ?,
            total_correct = total_correct + ?,
            total_questions = total_questions + 1,
            last_updated = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `,
      args: [stars, isCorrect ? 1 : 0, studentId]
    });
  },

  // 獲取獎勵資訊
  getRewards: async (studentId: number) => {
    const result = await db.execute({
      sql: 'SELECT * FROM rewards WHERE student_id = ?',
      args: [studentId]
    });
    return result.rows[0] || null;
  },

  // 更新學習進度
  updateProgress: async (studentId: number, questionType: string, difficulty: number, masteryLevel: number) => {
    return await db.execute({
      sql: `
        INSERT INTO progress (student_id, question_type, current_difficulty, mastery_level, last_practiced)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(student_id, question_type) 
        DO UPDATE SET 
          current_difficulty = ?,
          mastery_level = ?,
          last_practiced = CURRENT_TIMESTAMP
      `,
      args: [studentId, questionType, difficulty, masteryLevel, difficulty, masteryLevel]
    });
  },

  // 獲取學習統計
  getStats: async (studentId: number) => {
    const recentAnswersResult = await db.execute({
      sql: `
        SELECT * FROM answer_records 
        WHERE student_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
      `,
      args: [studentId]
    });

    const progressByTypeResult = await db.execute({
      sql: `
        SELECT question_type, current_difficulty, mastery_level 
        FROM progress 
        WHERE student_id = ?
      `,
      args: [studentId]
    });

    const rewardsResult = await db.execute({
      sql: 'SELECT * FROM rewards WHERE student_id = ?',
      args: [studentId]
    });

    return {
      recentAnswers: recentAnswersResult.rows,
      progressByType: progressByTypeResult.rows,
      rewards: rewardsResult.rows[0] || null
    };
  },

  // 更新連續天數
  updateStreak: async (studentId: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    const statsResult = await db.execute({
      sql: 'SELECT * FROM user_stats WHERE student_id = ?',
      args: [studentId]
    });

    if (statsResult.rows.length === 0) {
      // 首次創建
      return await db.execute({
        sql: `
          INSERT INTO user_stats (student_id, streak_days, longest_streak, last_practice_date, total_practice_days)
          VALUES (?, 1, 1, ?, 1)
        `,
        args: [studentId, today]
      });
    }

    const stats = statsResult.rows[0] as any;
    const lastDate = stats.last_practice_date;
    
    if (lastDate === today) {
      // 今天已經練習過，不更新
      return stats;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = stats.streak_days;
    if (lastDate === yesterdayStr) {
      // 連續練習
      newStreak = stats.streak_days + 1;
    } else {
      // 中斷了，重新開始
      newStreak = 1;
    }

    const longestStreak = Math.max(stats.longest_streak, newStreak);

    return await db.execute({
      sql: `
        UPDATE user_stats 
        SET streak_days = ?, 
            longest_streak = ?,
            last_practice_date = ?,
            total_practice_days = total_practice_days + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `,
      args: [newStreak, longestStreak, today, studentId]
    });
  },

  // 獲取連續天數
  getStreak: async (studentId: number) => {
    const result = await db.execute({
      sql: 'SELECT * FROM user_stats WHERE student_id = ?',
      args: [studentId]
    });
    return result.rows[0] || null;
  },

  // 添加收藏品
  addCollection: async (studentId: number, item: { id: string; name: string; emoji: string; rarity: string }) => {
    return await db.execute({
      sql: `
        INSERT INTO collections (student_id, item_id, item_name, item_emoji, rarity)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [studentId, item.id, item.name, item.emoji, item.rarity]
    });
  },

  // 獲取收藏品列表
  getCollections: async (studentId: number) => {
    const result = await db.execute({
      sql: 'SELECT * FROM collections WHERE student_id = ? ORDER BY collected_at DESC',
      args: [studentId]
    });
    return result.rows;
  },

  // 記錄挑戰成績
  recordChallenge: async (record: {
    student_id: number;
    challenge_type: string;
    difficulty: string;
    score: number;
    correct_count: number;
    total_count: number;
    time_spent: number;
  }) => {
    return await db.execute({
      sql: `
        INSERT INTO challenge_records 
        (student_id, challenge_type, difficulty, score, correct_count, total_count, time_spent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        record.student_id,
        record.challenge_type,
        record.difficulty,
        record.score,
        record.correct_count,
        record.total_count,
        record.time_spent
      ]
    });
  },

  // 獲取挑戰排行榜
  getChallengeLeaderboard: async (challengeType: string, limit: number = 10) => {
    const result = await db.execute({
      sql: `
        SELECT c.*, s.name as student_name
        FROM challenge_records c
        JOIN students s ON c.student_id = s.id
        WHERE c.challenge_type = ?
        ORDER BY c.score DESC
        LIMIT ?
      `,
      args: [challengeType, limit]
    });
    return result.rows;
  },

  // 獲取個人最高分
  getPersonalBest: async (studentId: number, challengeType: string) => {
    const result = await db.execute({
      sql: `
        SELECT MAX(score) as best_score
        FROM challenge_records
        WHERE student_id = ? AND challenge_type = ?
      `,
      args: [studentId, challengeType]
    });
    return result.rows[0] || null;
  }
};

export default db;
