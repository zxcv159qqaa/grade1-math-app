'use client';

import { useState, useEffect } from 'react';
import { questionTypeNames } from '@/lib/question-generator';

interface Stats {
  recentAnswers: any[];
  progressByType: any[];
  rewards: any;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">載入中...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">無法載入資料</div>
      </div>
    );
  }

  const accuracy = stats.rewards?.total_questions > 0
    ? Math.round((stats.rewards.total_correct / stats.rewards.total_questions) * 100)
    : 0;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">📊 學習報告</h1>
          <p className="text-gray-600">查看孩子的學習進度和表現</p>
          <a href="/" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            ← 回到練習
          </a>
        </div>

        {/* 總覽卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="text-5xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-yellow-700">{stats.rewards?.stars || 0}</div>
            <div className="text-gray-600">獲得星星</div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-5xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-700">{accuracy}%</div>
            <div className="text-gray-600">正確率</div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-5xl mb-2">📝</div>
            <div className="text-3xl font-bold text-blue-700">{stats.rewards?.total_questions || 0}</div>
            <div className="text-gray-600">完成題數</div>
          </div>
        </div>

        {/* 各題型進度 */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">各題型表現</h2>
          {stats.progressByType && stats.progressByType.length > 0 ? (
            <div className="space-y-4">
              {stats.progressByType.map((progress: any) => (
                <div key={progress.question_type} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">
                      {questionTypeNames[progress.question_type as keyof typeof questionTypeNames] || progress.question_type}
                    </span>
                    <span className="text-sm text-gray-600">難度等級 {progress.current_difficulty}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.max(progress.mastery_level * 100, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">尚無學習記錄</p>
          )}
        </div>

        {/* 最近答題記錄 */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">最近答題記錄</h2>
          {stats.recentAnswers && stats.recentAnswers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">題目</th>
                    <th className="text-left py-2">類型</th>
                    <th className="text-center py-2">結果</th>
                    <th className="text-left py-2">時間</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAnswers.slice(0, 10).map((record: any) => (
                    <tr key={record.id} className="border-b last:border-b-0">
                      <td className="py-3">{record.question}</td>
                      <td className="py-3">
                        {questionTypeNames[record.question_type as keyof typeof questionTypeNames] || record.question_type}
                      </td>
                      <td className="py-3 text-center">
                        {record.is_correct ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <span className="text-red-600 font-bold">✗</span>
                        )}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {new Date(record.created_at).toLocaleString('zh-TW')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">尚無答題記錄</p>
          )}
        </div>
      </div>
    </main>
  );
}
