'use client';

import { useState } from 'react';
import { GachaItem, getRarityColor, getRarityName } from '@/lib/gacha-items';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStars: number;
  onGachaDraw: () => void;
}

export default function GachaModal({ isOpen, onClose, currentStars, onGachaDraw }: GachaModalProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnItem, setDrawnItem] = useState<GachaItem | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const handleDraw = async () => {
    if (currentStars < 10) {
      alert('需要 10 顆星星才能抽扭蛋！');
      return;
    }

    setIsDrawing(true);
    setShowResult(false);

    try {
      const response = await fetch('/api/gacha', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // 動畫效果：延遲顯示結果
        setTimeout(() => {
          setDrawnItem(data.item);
          setShowResult(true);
          setIsDrawing(false);
          onGachaDraw();
        }, 1500);
      } else {
        alert(data.error || '抽扭蛋失敗');
        setIsDrawing(false);
      }
    } catch (error) {
      console.error('Error drawing gacha:', error);
      alert('抽扭蛋時發生錯誤');
      setIsDrawing(false);
    }
  };

  const handleClose = () => {
    setDrawnItem(null);
    setShowResult(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        {/* 標題 */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎰</div>
          <h2 className="text-2xl font-bold text-gray-800">扭蛋機</h2>
          <p className="text-gray-600 mt-2">10 顆星星抽一次</p>
        </div>

        {/* 當前星星數 */}
        <div className="text-center mb-6">
          <div className="text-lg text-gray-700">
            你有 <span className="text-2xl font-bold text-yellow-600">{currentStars}</span> ⭐
          </div>
        </div>

        {/* 抽取中動畫 */}
        {isDrawing && (
          <div className="text-center py-8">
            <div className="text-6xl animate-bounce mb-4">🎁</div>
            <div className="text-gray-600">抽取中...</div>
          </div>
        )}

        {/* 抽取結果 */}
        {showResult && drawnItem && (
          <div className="text-center py-8">
            <div className="text-8xl mb-4 animate-pulse">{drawnItem.emoji}</div>
            <div className={`inline-block px-4 py-2 rounded-lg border-2 ${getRarityColor(drawnItem.rarity)} mb-2`}>
              {getRarityName(drawnItem.rarity)}
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{drawnItem.name}</div>
            <div className="text-sm text-gray-600">{drawnItem.category}</div>
          </div>
        )}

        {/* 操作按鈕 */}
        {!isDrawing && !showResult && (
          <div className="space-y-3">
            <button
              onClick={handleDraw}
              disabled={currentStars < 10}
              className={`w-full py-3 px-6 rounded-lg font-bold text-white ${
                currentStars >= 10
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {currentStars >= 10 ? '抽一次 (10⭐)' : '星星不足'}
            </button>
            <button
              onClick={handleClose}
              className="w-full py-3 px-6 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              關閉
            </button>
          </div>
        )}

        {showResult && (
          <button
            onClick={handleClose}
            className="w-full py-3 px-6 rounded-lg font-bold text-white bg-blue-500 hover:bg-blue-600"
          >
            確定
          </button>
        )}
      </div>
    </div>
  );
}
