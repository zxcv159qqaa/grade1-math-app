'use client';

interface RewardDisplayProps {
  rewards: {
    stars?: number;
    total_stars?: number;
    total_correct?: number;
    correct_answers?: number;
    total_questions?: number;
  };
}

export default function RewardDisplay({ rewards }: RewardDisplayProps) {
  // 相容新舊 API 格式
  const stars = rewards.stars || rewards.total_stars || 0;
  const correctAnswers = rewards.total_correct || rewards.correct_answers || 0;
  const totalQuestions = rewards.total_questions || 0;

  const accuracy = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) 
    : 0;

  // 計算獲得的獎章數量
  const badges = Math.floor(stars / 10);
  const starsToNextBadge = 10 - (stars % 10);

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 mb-6 shadow-lg border-2 border-gray-200">
      <div className="grid grid-cols-3 gap-3 md:gap-5 text-center mb-6">
        {/* 星星數 */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border-2 border-gray-200">
          <div className="text-5xl md:text-6xl mb-2">⭐</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">{stars}</div>
          <div className="text-sm md:text-base font-medium text-gray-600 mt-1">星星</div>
        </div>

        {/* 獎章數 */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border-2 border-gray-200">
          <div className="text-5xl md:text-6xl mb-2">🏆</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">{badges}</div>
          <div className="text-sm md:text-base font-medium text-gray-600 mt-1">獎章</div>
        </div>

        {/* 正確率 */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border-2 border-gray-200">
          <div className="text-5xl md:text-6xl mb-2">📊</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">{accuracy}%</div>
          <div className="text-sm md:text-base font-medium text-gray-600 mt-1">正確率</div>
        </div>
      </div>

      {/* 進度條：距離下一個獎章 */}
      {totalQuestions > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 md:p-5 border-2 border-gray-200">
          <div className="flex items-center justify-between text-sm md:text-base font-bold text-gray-700 mb-3">
            <span className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              距離下一個獎章 0 / 10 <span className="text-2xl">⭐</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 md:h-5 overflow-hidden border-2 border-gray-300">
            <div
              style={{ width: `${(stars % 10) * 10}%` }}
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
            />
          </div>
          {starsToNextBadge > 0 && totalQuestions > 0 && (
            <div className="text-center mt-3 text-sm md:text-base font-semibold text-gray-700">
              {/* 統計資訊 */}
            </div>
          )}
        </div>
      )}

      {/* 鼓勵文字 */}
      {totalQuestions > 0 && (
        <div className="text-center mt-4 md:mt-5">
          <div className="bg-gray-50 rounded-xl p-3 md:p-4 border-2 border-gray-200">
            <p className="text-base md:text-lg font-bold text-gray-800">
              已完成 <span className="text-blue-600 text-xl">{totalQuestions}</span> 題，
              答對 <span className="text-green-600 text-xl">{correctAnswers}</span> 題！
            </p>
          </div>
        </div>
      )}
    </div>
  );
}