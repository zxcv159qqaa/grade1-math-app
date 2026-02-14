'use client';

import { useEffect, useState } from 'react';
import { Flame, Star, Trophy, Target, CheckCircle, AlertCircle } from 'lucide-react';

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
      <div className="bg-white rounded-3xl border-4 border-gray-300 p-6 shadow-lg">
        <div className="text-center text-gray-500">載入中...</div>
      </div>
    );
  }

  if (!streak) {
    return null;
  }

  const isToday = streak.last_practice_date === new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-3xl border-8 border-orange-300 p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        {/* 連續天數 */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl border-4 border-orange-300">
            {streak.streak_days > 0 ? (
              <Flame className="w-10 h-10 text-orange-600 animate-pulse" />
            ) : (
              <Star className="w-10 h-10 text-yellow-600" />
            )}
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-800">
              {streak.streak_days} 天
            </div>
            <div className="text-sm text-gray-600 font-bold">連續練習</div>
          </div>
        </div>

        {/* 最長紀錄 */}
        <div className="text-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 border-4 border-purple-300">
          <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800">
            {streak.longest_streak}
          </div>
          <div className="text-xs text-gray-600 font-bold">最長紀錄</div>
        </div>

        {/* 總天數 */}
        <div className="text-center bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-4 border-4 border-blue-300">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800">
            {streak.total_practice_days}
          </div>
          <div className="text-xs text-gray-600 font-bold">累計天數</div>
        </div>
      </div>

      {/* 狀態提示 */}
      <div className="mt-4 text-center">
        {isToday ? (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border-4 border-green-300">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700 font-bold">今天已練習！繼續保持！</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 rounded-full border-4 border-orange-300">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-orange-700 font-bold">還沒練習哦！開始答題來延續連勝！</span>
          </div>
        )}
      </div>

      {/* 激勵語句 */}
      {streak.streak_days > 0 && (
        <div className="mt-3 text-center">
          {streak.streak_days >= 30 && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 px-4 py-2 rounded-full border-4 border-yellow-400">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-800 font-bold">太厉害了！一個月連續練習！</span>
            </div>
          )}
          {streak.streak_days >= 7 && streak.streak_days < 30 && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full border-4 border-blue-300">
              <Flame className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800 font-bold">一週連續！繼續加油！</span>
            </div>
          )}
          {streak.streak_days >= 3 && streak.streak_days < 7 && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border-4 border-purple-300">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-800 font-bold">三天達成！繼續努力！</span>
            </div>
          )}
          {streak.streak_days < 3 && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border-4 border-green-300">
              <Star className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800 font-bold">好的開始！繼續保持！</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
