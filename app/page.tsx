import { useState, useEffect } from 'react';
import { Question } from '@/lib/question-generator';
import QuestionCard from '@/components/QuestionCard';
import StreakDisplay from '@/components/StreakDisplay';
import GachaModal from '@/components/GachaModal';
import { useSound } from '@/hooks/useSound';

export default function Home() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showGacha, setShowGacha] = useState(false);
  const [gachaResult, setGachaResult] = useState<any>(null);
  const [rewards, setRewards] = useState({ coins: 0, stars: 0 });

  const { playCorrect, playIncorrect, playGacha } = useSound();

  // Fetch question from API
  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/question');
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      setQuestion(data);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch streak on mount
  useEffect(() => {
    fetch('/api/streak')
      .then(res => res.json())
      .then(data => setStreak(data.streak))
      .catch(err => console.error('Error fetching streak:', err));
  }, []);

  // Fetch rewards on mount
  useEffect(() => {
    fetch('/api/rewards')
      .then(res => res.json())
      .then(data => setRewards({ coins: data.coins || 0, stars: data.stars || 0 }))
      .catch(err => console.error('Error fetching rewards:', err));
  }, []);

  // Initial question load
  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleAnswer = async (selectedAnswer: number) => {
    if (!question) return;

    const isCorrect = selectedAnswer === question.answer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      playCorrect();
      setCorrectCount(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);

      try {
        await fetch('/api/streak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streak: newStreak })
        });

        // Award rewards
        const rewardResponse = await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correct: true })
        });
        const rewardData = await rewardResponse.json();
        setRewards({ coins: rewardData.coins || 0, stars: rewardData.stars || 0 });

        // Gacha at 5-streak intervals
        if (newStreak > 0 && newStreak % 5 === 0) {
          playGacha();
          const gachaResponse = await fetch('/api/gacha', { method: 'POST' });
          const gacha = await gachaResponse.json();
          setGachaResult(gacha);
          setShowGacha(true);
        }
      } catch (error) {
        console.error('Error updating streak/rewards:', error);
      }
    } else {
      playIncorrect();
      setIncorrectCount(prev => prev + 1);
      setStreak(0);
      try {
        await fetch('/api/streak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streak: 0 })
        });
      } catch (error) {
        console.error('Error resetting streak:', error);
      }
    }

    setTimeout(() => {
      setFeedback(null);
      fetchQuestion();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-purple-800">
          一年級數學練習
        </h1>

        <div className="mb-6 flex flex-col gap-4">
          <StreakDisplay streak={streak} />
          
          {/* Inline Rewards Display */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">我的獎勵</h2>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-4xl mb-2">🪙</div>
                <div className="text-2xl font-bold text-yellow-600">{rewards.coins}</div>
                <div className="text-sm text-gray-600">金幣</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-blue-600">{rewards.stars}</div>
                <div className="text-sm text-gray-600">星星</div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">載入中...</div>
        ) : question ? (
          <QuestionCard
            question={question}
            onAnswer={handleAnswer}
            feedback={feedback}
          />
        ) : (
          <div className="text-center text-gray-600">無法載入題目</div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">統計資料</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{correctCount}</div>
              <div className="text-gray-600">答對</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{incorrectCount}</div>
              <div className="text-gray-600">答錯</div>
            </div>
          </div>
        </div>
      </div>

      {showGacha && gachaResult && (
        <GachaModal
          result={gachaResult}
          onClose={() => setShowGacha(false)}
        />
      )}
    </div>
  );
}