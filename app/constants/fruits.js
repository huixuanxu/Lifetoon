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
  }
];

// 🎲 封裝一個資深工程師愛用的「隨機抽水果」演算法
export const getRandomFruit = () => {
  const randomIndex = Math.floor(Math.random() * FRUIT_DATABASE.length);
  return FRUIT_DATABASE[randomIndex];
};