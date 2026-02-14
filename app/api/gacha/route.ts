import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';
import { drawGachaItem, GACHA_ITEMS } from '@/lib/gacha-items';

const GACHA_COST = 10; // 10 顆星星抽一次

// 獲取收藏品列表
export async function GET() {
  try {
    const studentId = 1;
    const collections = await dbOperations.getCollections(studentId);
    
    // 計算收集進度
    const totalItems = GACHA_ITEMS.length;
    const collectedCount = collections.length;
    const progress = Math.round((collectedCount / totalItems) * 100);
    
    return NextResponse.json({
      success: true,
      collections,
      progress: {
        collected: collectedCount,
        total: totalItems,
        percentage: progress
      }
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// 抽扭蛋
export async function POST() {
  try {
    const studentId = 1;
    
    // 檢查星星數量
    const rewards = await dbOperations.getRewards(studentId);
    if (!rewards || (rewards.stars as number) < GACHA_COST) {
      return NextResponse.json(
        { 
          success: false, 
          error: `需要 ${GACHA_COST} 顆星星才能抽扭蛋`,
          currentStars: rewards?.stars || 0 
        },
        { status: 400 }
      );
    }
    
    // 抽取物品
    const item = drawGachaItem();
    
    // 扣除星星
    await dbOperations.updateRewards(studentId, -GACHA_COST, false);
    
    // 添加到收藏
    await dbOperations.addCollection(studentId, {
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      rarity: item.rarity
    });
    
    // 獲取更新後的星星數
    const updatedRewards = await dbOperations.getRewards(studentId);
    
    return NextResponse.json({
      success: true,
      item,
      remainingStars: updatedRewards?.stars || 0
    });
  } catch (error) {
    console.error('Error drawing gacha:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to draw gacha' },
      { status: 500 }
    );
  }
}
