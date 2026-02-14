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
  }
};

export default db;