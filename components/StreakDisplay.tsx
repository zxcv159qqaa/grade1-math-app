'use client';

import { useEffect, useState } from 'react';

interface StreakData {
  streak_days: number;
  longest_streak: number;
  last_practice_date: string | null;
  total_practice_days: number;
}

export default function StreakDisplay() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const response = await fetch('/api/streak');
      const data = await response.json();
      if (data.success) {
        setStreak(data.streak);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
        <div className="text-center text-gray-500">載入中...</div>
      </div>
    );
  }

  if (!streak) {
    return null;
  }

  const isToday = streak.last_practice_date === new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
      <div className="flex items-center justify-between">
        {/* 連續天數 */}
        <div className="flex items-center gap-3">
          <div className="text-4xl">
            {streak.streak_days > 0 ? '🔥' : '⭐'}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {streak.streak_days} 天
            </div>
            <div className="text-sm text-gray-600">連續練習</div>
          </div>
        </div>

        {/* 最長紀錄 */}
        <div className="text-center">
          <div className="text-xl font-bold text-gray-800">
            {streak.longest_streak}
          </div>
          <div className="text-xs text-gray-600">最長紀錄</div>
        </div>

        {/* 總天數 */}
        <div className="text-center">
          <div className="text-xl font-bold text-gray-800">
            {streak.total_practice_days}
          </div>
          <div className="text-xs text-gray-600">累計天數</div>
        </div>
      </div>

      {/* 狀態提示 */}
      <div className="mt-4 text-center">
        {isToday ? (
          <div className="text-sm text-green-600 font-medium">
            ✓ 今天已練習！繼續保持！
          </div>
        ) : (
          <div className="text-sm text-orange-600 font-medium">
            還沒練習哦！開始答題來延續連勝！
          </div>
        )}
      </div>

      {/* 激勵語句 */}
      {streak.streak_days > 0 && (
        <div className="mt-3 text-center text-xs text-gray-500">
          {streak.streak_days >= 30 && '🏆 太厉害了！一個月連續練習！'}
          {streak.streak_days >= 7 && streak.streak_days < 30 && '💪 一週連續！繼續加油！'}
          {streak.streak_days >= 3 && streak.streak_days < 7 && '🎯 三天達成！繼續努力！'}
          {streak.streak_days < 3 && '🌱 好的開始！繼續保持！'}
        </div>
      )}
    </div>
  );
}
