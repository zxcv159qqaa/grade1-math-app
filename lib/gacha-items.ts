// 扭蛋物品定義
export interface GachaItem {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
}

// 所有可收集的物品
export const GACHA_ITEMS: GachaItem[] = [
  // 常見 (60% 機率)
  { id: 'dog', name: '小狗', emoji: '🐶', rarity: 'common', category: '動物' },
  { id: 'cat', name: '小貓', emoji: '🐱', rarity: 'common', category: '動物' },
  { id: 'rabbit', name: '兔子', emoji: '🐰', rarity: 'common', category: '動物' },
  { id: 'bear', name: '熊', emoji: '🐻', rarity: 'common', category: '動物' },
  { id: 'panda', name: '熊貓', emoji: '🐼', rarity: 'common', category: '動物' },
  { id: 'monkey', name: '猴子', emoji: '🐵', rarity: 'common', category: '動物' },
  
  // 稀有 (25% 機率)
  { id: 'tiger', name: '老虎', emoji: '🐯', rarity: 'rare', category: '動物' },
  { id: 'lion', name: '獅子', emoji: '🦁', rarity: 'rare', category: '動物' },
  { id: 'fox', name: '狐狸', emoji: '🦊', rarity: 'rare', category: '動物' },
  { id: 'koala', name: '無尾熊', emoji: '🐨', rarity: 'rare', category: '動物' },
  { id: 'penguin', name: '企鵝', emoji: '🐧', rarity: 'rare', category: '動物' },
  
  // 史詩 (12% 機率)
  { id: 'unicorn', name: '獨角獸', emoji: '🦄', rarity: 'epic', category: '魔法' },
  { id: 'dragon', name: '龍', emoji: '🐉', rarity: 'epic', category: '魔法' },
  { id: 'phoenix', name: '鳳凰', emoji: '🦅', rarity: 'epic', category: '魔法' },
  { id: 'alien', name: '外星人', emoji: '👽', rarity: 'epic', category: '太空' },
  
  // 傳說 (3% 機率)
  { id: 'trophy', name: '金盃', emoji: '🏆', rarity: 'legendary', category: '獲勵' },
  { id: 'crown', name: '王冠', emoji: '👑', rarity: 'legendary', category: '獲勵' },
  { id: 'star', name: '閃亮之星', emoji: '✨', rarity: 'legendary', category: '特殊' },
];

// 根據稀有度獲取物品池
function getItemsByRarity(rarity: GachaItem['rarity']): GachaItem[] {
  return GACHA_ITEMS.filter(item => item.rarity === rarity);
}

// 隨機抽取一個物品（帶稀有度權重）
export function drawGachaItem(): GachaItem {
  const rand = Math.random() * 100;
  
  let rarity: GachaItem['rarity'];
  if (rand < 3) {
    rarity = 'legendary'; // 3%
  } else if (rand < 15) {
    rarity = 'epic'; // 12%
  } else if (rand < 40) {
    rarity = 'rare'; // 25%
  } else {
    rarity = 'common'; // 60%
  }
  
  const pool = getItemsByRarity(rarity);
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

// 獲取稀有度的顏色
export function getRarityColor(rarity: GachaItem['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 border-gray-300 text-gray-700';
    case 'rare':
      return 'bg-blue-100 border-blue-300 text-blue-700';
    case 'epic':
      return 'bg-purple-100 border-purple-300 text-purple-700';
    case 'legendary':
      return 'bg-yellow-100 border-yellow-300 text-yellow-700';
  }
}

// 獲取稀有度的中文名稱
export function getRarityName(rarity: GachaItem['rarity']): string {
  switch (rarity) {
    case 'common':
      return '普通';
    case 'rare':
      return '稀有';
    case 'epic':
      return '史詩';
    case 'legendary':
      return '傳說';
  }
}
