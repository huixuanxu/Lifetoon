// constants/fruits.js
// 🎯 這裡就是你的水果素材資料庫，隨時可以往後疊加新水果！

export const FRUIT_DATABASE = [
  {
    iconKey: 'apple',
    name: '微光蘋果',
    element: '光',
    bonus_exp: 25,
    effect_text: '入口微酸，如心跳般緊張；甜味蔓延，化作勇氣的溫暖光芒。'
  },
  {
    iconKey: 'watermelon',
    name: '暖心西瓜',
    element: '水',
    bonus_exp: 30,
    effect_text: '清爽香甜，吃完後感到身心無比舒暢，暑氣全消！'
  },
  {
    iconKey: 'banana', // 💡 舉例：未來你想新增的
    name: '閃電香蕉',
    element: '雷',
    bonus_exp: 20,
    effect_text: '口感綿密，吃完後渾身充滿電流，精神百倍！'
  },
  //🎯 1. 百香熱情果 (passion_fruit)
  {
    iconKey: 'passion_fruit',
    name: '百香熱情果',
    element: '火',
    bonus_exp: 32,
    effect_text: '酸甜濃郁的漿果，吃下去的瞬間全身湧現無盡熱血，連眼神都燃燒了起來！'
  },
  // 🎯 2. 幻影火龍果 (dragon_fruit)
  {
    iconKey: 'dragon_fruit',
    name: '幻影火龍果',
    element: '暗',
    bonus_exp: 35,
    effect_text: '外表如惡魔鱗片般耀眼，帶有神祕的紫紅魔力，能大幅激發怪獸的潛在危險氣息。'
  },
  // 🎯 3. 心動真愛果 (love_fruit)
  {
    iconKey: 'love_fruit',
    name: '心動真愛果',
    element: '心',
    bonus_exp: 45, // 夢幻稀有果實，給高一點經驗！
    effect_text: '由最純粹的情感凝結而成的奇蹟之果，入口即化，能讓怪獸對妳的依戀度瞬間爆表！'
  },
  // 🎯 4. 緋紅櫻桃 (cherry)
  {
    iconKey: 'cherry',
    name: '緋紅櫻桃',
    element: '光',
    bonus_exp: 22,
    effect_text: '精緻小巧的雙生櫻桃，散發著微弱的光芒，吃完後怪獸的心情會變得像在跳舞一樣輕盈。'
  },
  // 🎯 5. 極光哈密瓜 (melon)
  {
    iconKey: 'melon',
    name: '極光哈密瓜',
    element: '風',
    bonus_exp: 38,
    effect_text: '擁有完美網紋的高貴果實，滿載清甜的風之魔力，能讓怪獸的動作變得無比優雅流暢。'
  },
  // 🎯 6. 烈陽芒果 (mango)
  {
    iconKey: 'mango',
    name: '烈陽芒果',
    element: '地',
    bonus_exp: 40,
    effect_text: '飽含夏日烈陽能量的厚實果肉，口感濃郁，能賦予怪獸如大地般穩重厚實的溫暖飽足感。'
  },
  // 💡 【新擴充座位 1】：想加草莓，直接這樣補
  {
    iconKey: 'strawberry', 
    name: '戀愛草莓',
    element: '愛',
    bonus_exp: 35,
    effect_text: '甜中帶點羞澀的酸，吃下去的瞬間，空氣彷彿都變成粉紅色的了！'
  },

  // 💡 【新擴充座位 2】：想加葡萄，直接這樣補
  {
    iconKey: 'grape',
    name: '深邃葡萄',
    element: '暗',
    bonus_exp: 28,
    effect_text: '充滿神祕成熟的果香，吃完後好像能看透某些複雜的心思。'
  },
];

// 🎲 封裝一個資深工程師愛用的「隨機抽水果」演算法
export const getRandomFruit = () => {
  const randomIndex = Math.floor(Math.random() * FRUIT_DATABASE.length);
  return FRUIT_DATABASE[randomIndex];
};