'use client';

import { motion } from 'framer-motion';

interface RewardDisplayProps {
  rewards: {
    stars: number;
    total_correct: number;
    total_questions: number;
  };
}

export default function RewardDisplay({ rewards }: RewardDisplayProps) {
  // 防止 NaN：確保所有值都是數字
  const stars = Number(rewards?.stars) || 0;
  const totalCorrect = Number(rewards?.total_correct) || 0;
  const totalQuestions = Number(rewards?.total_questions) || 0;
  
  const accuracy = totalQuestions > 0 
    ? Math.round((totalCorrect / totalQuestions) * 100) 
    : 0;

  // 計算獲得的獎章數量
  const badges = Math.floor(stars / 10);

  return (
    <div className="card mb-8">
      <div className="grid grid-cols-3 gap-4 text-center">
        {/* 星星數 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-2xl"
        >
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-yellow-700">{stars}</div>
          <div className="text-sm text-yellow-600">星星</div>
        </motion.div>

        {/* 獎章數 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl"
        >
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-purple-700">{badges}</div>
          <div className="text-sm text-purple-600">獎章</div>
        </motion.div>

        {/* 正確率 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl"
        >
          <div className="text-4xl mb-2">📊</div>
          <div className="text-2xl font-bold text-green-700">{accuracy}%</div>
          <div className="text-sm text-green-600">正確率</div>
        </motion.div>
      </div>

      {/* 進度條：距離下一個獎章 */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>距離下一個獎章</span>
          <span>{stars % 10} / 10 ⭐</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(stars % 10) * 10}%` }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full"
          />
        </div>
      </div>

      {/* 鼓勵文字 */}
      {totalQuestions > 0 && (
        <div className="text-center mt-4 text-gray-600">
          <p>已完成 {totalQuestions} 題，答對 {totalCorrect} 題！</p>
          {accuracy >= 80 && (
            <p className="text-green-600 font-semibold mt-1">👍 表現超棒！繼續加油！</p>
          )}
        </div>
      )}
    </div>
  );
}
