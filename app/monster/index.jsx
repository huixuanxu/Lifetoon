import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 🎯 共用你最漂亮的聊天室自訂樣式包
import { useLocalSearchParams } from 'expo-router'; // 🎯 引入接收參數的 Hook
import { styles } from '../../styles/chat.styles';

const normalmonsterImg = require("../../assets/images/monster.png"); 
const happymonsterImg = require("../../assets/images/happy_monster.png"); 

// 🎯 新加入：四大天王按鈕的圖片素材
const btnWishImg = require("../../assets/images/btn_wish.png");     // 願望
const btnSnackImg = require("../../assets/images/btn_snack.png");   // 點心
const btnMealImg = require("../../assets/images/btn_meal.png");     // 餐點
const btnSkillImg = require("../../assets/images/btn_skill.png");   // 技能

// 🎯 在元件外面或最上方，先建立好乾淨的圖片對照表
const FRUIT_IMAGES = {
  apple: require('../../assets/images/fruit_apple.png'),
  watermelon: require('../../assets/images/fruit_watermelon.png'),
  banana: require('../../assets/images/fruit_banana.png'),
  grape: require('../../assets/images/fruit_grape.png'),
  strawberry: require('../../assets/images/fruit_strawberry.png'),
  passion_fruit: require('@/assets/images/fruit_passion_fruit.png'),
  dragon_fruit: require('@/assets/images/fruit_dragon_fruit.png'),
  love_fruit: require('@/assets/images/fruit_love_fruit.png'),
  cherry: require('@/assets/images/fruit_cherry.png'),
  melon: require('@/assets/images/fruit_melon.png'),
  mango: require('@/assets/images/fruit_mango.png'),

};

// 🎯 【關鍵：放在元件外面！】全域背包儲存庫，不論頁面怎麼洗，這裡的記憶都不會掉！
if (typeof global.globalInventory === 'undefined') {
  global.globalInventory = [
    { 
      id: 'f1',
      name: '微光蘋果', 
      element: '光', 
      bonus_exp: 25, 
      iconKey: 'apple', 
      effect_text: '入口微酸，如心跳般緊張；甜味蔓延，化作勇氣的溫暖光芒。',
      quantity: 1
    }
  ];
}


export default function MonsterScreen() {
  const router = useRouter();

  // 👾 魔獸狀態控制
  const [hearts, setHearts] = useState(500);
  const [coins, setCoins] = useState(1250);
  const [monsterDialogue, setMonsterDialogue] = useState('今天會拿到什麼好吃的果實呢？期待～');
  
  // 🎯 【關鍵新加入】：控制魔獸目前表情的狀態
  // 'normal' (普通) 或 'happy' (開心)
  const [monsterMood, setMonsterMood] = useState('normal');

  // 🎯 【全新加入】：記錄目前正在餵食哪一顆水果。預設是 null (代表沒有在餵食)
  const [currentFeedingFruit, setCurrentFeedingFruit] = useState(null);

  // 🎯 拿到聊天頁面快遞過來的水果包裹
  const params = useLocalSearchParams();

  // 🎒 模擬背包中的果實數據（通常這會從後端或全域狀態撈取）
// ❌ 舊寫法：const [inventory, setInventory] = useState([ ... ]);
// ✅ 新寫法：直接綁定全域記憶庫
const [inventory, setInventory] = useState(global.globalInventory);
const [isBagOpen, setIsBagOpen] = useState(false);                  // 👈 確保這行在這裡！



// 🔍 【終極偵探線索】：每次包包一變動，就自動在黑色終端機印出來，讓我們看看到底有沒有塞成功！
  useEffect(() => {
    console.log("=== 🎒 當前包包記憶體實時內容 ===", inventory);
  }, [inventory]);


// 🎯 3. 核心接收器（終極除錯變數安全版）
  useEffect(() => {
    console.log("=== 📦 收到聊天室傳來的快遞參數 ===", {
      key: params.newFruitKey,
      name: params.newFruitName
    });

    if (params.newFruitKey && params.newFruitName) {
      try {
        // 🏆 確保 currentInv 宣告在最頂層，絕對不會 undefined！
        let currentInv = [];
        
        // 如果全域背包本來有東西，就搬過來；沒有的話就用空陣列
        if (global.globalInventory && Array.isArray(global.globalInventory)) {
          currentInv = [...global.globalInventory];
        }
        
        // 🕵️‍♂️ 檢查包包裡是否已有同款水果
        const existsIndex = currentInv.findIndex(item => item.iconKey === params.newFruitKey);
        
        if (existsIndex !== -1) {
          // 同款存在，數量 + 1
          currentInv[existsIndex] = {
            ...currentInv[existsIndex],
            quantity: (currentInv[existsIndex].quantity || 1) + 1
          };
          console.log(`✨ 偵測到同款 [${params.newFruitName}]，數量加 1！`);
        } else {
          // 全新水果，開新格子
          const spawnedFruit = {
            id: `fruit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            name: params.newFruitName,
            iconKey: params.newFruitKey,
            bonus_exp: parseInt(params.newFruitExp, 10) || 20,
            effect_text: params.newFruitText || '',
            element: '心', 
            quantity: 1
          };
          currentInv.push(spawnedFruit);
          console.log(`✨ 成功將全新水果 [${params.newFruitName}] 塞入新格子！`);
        }

        // 🔄 寫回全域記憶庫與 React 畫面狀態
        global.globalInventory = currentInv;
        setInventory(currentInv);
        
        // 🚀 撕掉網址簽收單，防止重複執行
        router.setParams({
          newFruitKey: undefined,
          newFruitName: undefined,
          newFruitExp: undefined,
          newFruitText: undefined,
        });

        // 自動打開小背包看成果
        setIsBagOpen(true); 

      } catch (err) {
        console.error("🚨 塞入背包時發生內部錯誤：", err);
      }
    }
  }, [params.newFruitKey, params.newFruitName]); // 雙重監聽，只要名字或 Key 一到立刻抓人！


  // 🍖 核心餵食邏輯（同樣要同步扣除全域記憶庫的數量）
  const handleFeedFruit = (fruit) => {
    setHearts(prev => prev + fruit.bonus_exp);

    // 🎒 扣除全域背包與狀態數量
    global.globalInventory = global.globalInventory.map(item => {
      if (item.iconKey === fruit.iconKey) {
        return { ...item, quantity: (item.quantity || 1) - 1 };
      }
      return item;
    }).filter(item => item.quantity > 0);

    // 🔄 同步更新畫面
    setInventory(global.globalInventory);
    
    // 魔獸台詞與開心特效
    setMonsterDialogue(`吃完${fruit.name}，${fruit.effect_text}`);
    setCurrentFeedingFruit(fruit.iconKey);
    setMonsterMood('happy');

    setTimeout(() => {
      setMonsterMood('normal'); 
      setCurrentFeedingFruit(null); 
    }, 4000);

    setIsBagOpen(false);
  };



  return (
    <ImageBackground 
      source={require('../../assets/images/LTbackground.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        
        {/* 🏆 頂部導覽列：100% 還原設計圖的「我的魔獸、愛心、金幣、齒輪」 */}
        <View style={[styles.header, { backgroundColor: 'rgba(255,255,255,0.7)', borderBottomWidth: 2, borderColor: '#111' }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.headerIconText}>〈</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontWeight: 'bold' }]}>我的魔獸</Text>
          </View>
          
          {/* 右側數值狀態 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#222' }}>❤ {hearts}</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#222' }}>$ {coins}</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.headerIconText, { fontSize: 20 }]}>⚙︎</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 舞台中央：魔獸本體與對話框 */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          
          {/* 🎯 建立一個相對定位的容器，方便水果黏在怪獸身邊 */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            position: 'relative', 
            marginBottom: 20 
            }}>
          
          {/* 👾 你的特製手繪小幽靈精靈（暫用高畫質日系插畫佔位，後續可換上你自己的 png 檔） */}
          <Image 
            source={monsterMood === 'happy' ? happymonsterImg : normalmonsterImg } // 👈 核心邏輯
            style={{ 
                width: 220, 
                height: 220, 
                resizeMode: 'contain', 
                marginBottom: 20 ,
                // 🏆 【資深微調】：如果是開心狀態，稍微變紅一点點（tintColor）增加滿足感 (可選)
                //tintColor: monsterMood === 'happy' ? 'rgba(255,200,200,0.1)' : null
            }} 
           />

           {/* 🍓 【核心新功能】：如果目前有正在餵食的水果，就在怪獸右側渲染出來 */}
            {currentFeedingFruit && (
            <Image
                source={FRUIT_IMAGES[currentFeedingFruit]} // 💡 動態抓取當前吃的水果圖片
                style={{
                width: 100,                // 讓水果稍微小一點，像個小道具
                height: 100,
                resizeMode: 'contain',
                position: 'absolute', 
          
                // 🎯 關鍵修正 2：改用 left 與 top 從怪獸的「左上角(0,0)」開始算
                // 150 代表從怪獸左邊邊緣往右推 150px，剛好貼在怪獸右手邊！
                left: 150,  
                // 80 代表從怪獸頭頂往下推 80px，剛好在怪獸手部附近！
                top: 80,   

                // 🏆 遊戲發光陰影
                shadowColor: '#FFFEEA',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
                }}
            />
            )}
            </View>

          {/* 💬 黃色醒目對話框：100% 還原設計圖的對話泡泡 */}
          <View style={{ 
            backgroundColor: '#FFCC22', 
            borderWidth: 2, 
            borderColor: '#111', 
            borderRadius: 20, 
            padding: 16, 
            width: '85%',
            position: 'relative',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 4
          }}>
            {/* 對話框小箭頭 */}
            <View style={{
              position: 'absolute',
              top: -10,
              left: '20%',
              width: 0,
              height: 0,
              borderLeftWidth: 10,
              borderLeftColor: 'transparent',
              borderRightWidth: 10,
              borderRightColor: 'transparent',
              borderBottomWidth: 10,
              borderBottomColor: '#111',
            }} />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111', textAlign: 'center', lineHeight: 20 }}>
              {monsterDialogue}
            </Text>
          </View>
        </View>

        {/* 🏁 底部四大天王按鈕：願望、點心、餐點、技能 */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          backgroundColor: '#FFFEEA', 
          borderWidth: 3, 
          borderColor: '#111', 
          paddingVertical: 20,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}>
             {/* 1. 願望按鈕 */}
            <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={0.7}>
                <Image 
                source={btnWishImg} 
                style={{ width: 60, height: 60, resizeMode: 'contain' }} 
                />
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: '#222' }}>願望</Text>
            </TouchableOpacity>

            {/* 2. 點心按鈕（點擊開啟餵食背包） */}
            <TouchableOpacity onPress={() => setIsBagOpen(true)} style={{ alignItems: 'center' }} activeOpacity={0.7}>
                <Image 
                source={btnSnackImg} 
                style={{ width: 60, height: 60, resizeMode: 'contain' }} 
                />
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: '#e67e22' }}>點心</Text>
            </TouchableOpacity>

            {/* 3. 餐點按鈕 */}
            <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={0.7}>
                <Image 
                source={btnMealImg} 
                style={{ width: 60, height: 60, resizeMode: 'contain' }} 
                />
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: '#222' }}>餐點</Text>
            </TouchableOpacity>

            {/* 4. 技能按鈕 */}
            <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={0.7}>
                <Image 
                source={btnSkillImg} 
                style={{ width: 60, height: 60, resizeMode: 'contain' }} 
                />
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: '#222' }}>技能</Text>
            </TouchableOpacity>

        </View>

        {/* 🎒 點心餵食彈窗 (升級：高抽屜上滑滾動 + 數量堆疊版) */}
        <Modal visible={isBagOpen} transparent animationType="slide">
          {/* 點擊背景可以關閉包包 */}
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setIsBagOpen(false)}
            style={{ 
              flex: 1, 
              justifyContent: 'flex-end', // 讓抽屜從底部探頭
              backgroundColor: 'rgba(0,0,0,0.5)' 
            }}
          >
            {/* 💼 點擊大抽屜本體時，阻止關閉事件 */}
            <TouchableOpacity 
              activeOpacity={1}
              style={{ 
                backgroundColor: '#fff', 
                borderTopLeftRadius: 28, 
                borderTopRightRadius: 28, 
                paddingTop: 16,
                paddingHorizontal: 24,
                paddingBottom: 40,
                height: '75%',            // 🎯 關鍵：拉高到螢幕的 75%，一開就有超大空間，可以直接往上滑！
                borderWidth: 3, 
                borderColor: '#000',      // 漫畫粗黑邊
              }}
            >
              {/* 抽屜頂部的小橫條（手遊經典裝飾，暗示可以下滑或這是一個抽屜） */}
              <View style={{
                width: 50,
                height: 6,
                backgroundColor: '#DDD',
                borderRadius: 3,
                alignSelf: 'center',
                marginBottom: 20
              }} />
                  
              {/* 頁首標題區 */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 20, 
              }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: '#000' }}>
                  故事凝結的果實背包
                </Text>
                
                <TouchableOpacity 
                  onPress={() => setIsBagOpen(false)}
                  style={{
                    //backgroundColor: '#EEE',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    //borderWidth: 2,
                    borderColor: '#000'
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '900', color: '#555' }}>關閉 ✕</Text>
                </TouchableOpacity>
              </View>

              {/* 水果網格清單 */}
              {inventory.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ textAlign: 'center', color: '#999', fontSize: 15, lineHeight: 24 }}>
                    背包空空的...{"\n"}快去故事煉金廚房提煉一些果實吧！
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={inventory}
                  keyExtractor={(item) => item.id}
                  numColumns={3} // 🎯 一行改成 3 個格子，視覺更像手遊背包，找東西超直覺！
                  showsVerticalScrollIndicator={true} // 開啟右側滑軌
                  style={{ flex: 1 }} // 撐滿抽屜剩餘空間，解鎖無限上滑滾動
                  contentContainerStyle={{ paddingBottom: 20, gap: 14 }}
                  columnWrapperStyle={{ gap: 12 }} // 格子左右間距
                  renderItem={({ item: fruit }) => (
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onPress={() => handleFeedFruit(fruit)}
                      style={{ 
                        flex: 1, // 均分寬度
                        height: 120,
                        backgroundColor: '#FFFEEA', 
                        borderWidth: 2, 
                        borderColor: '#000', 
                        borderRadius: 16, 
                        padding: 8, 
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        // 漫畫風輕微黑陰影
                        shadowColor: '#000',
                        shadowOffset: { width: 4, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 0,
                      }}
                    >
                      {/* 水果實體圖片 */}
                      <Image 
                        source={FRUIT_IMAGES[fruit.iconKey]} 
                        style={{ width: 50, height: 50, resizeMode: 'contain' }} 
                      />
                      
                      {/* 水果名字 */}
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#000', marginTop: 4 }} numberOfLines={1}>
                        {fruit.name}
                      </Text>

                      {/* 🔥 亮點：右下角手遊風【數量顯示標籤】 (例如: x3) */}
                      <View style={{ 
                        position: 'absolute', 
                        right: 6, 
                        bottom: 6, 
                        backgroundColor: '#FFCC22', // 亮黃色底
                        borderWidth: 0, 
                        borderColor: '#000', 
                        borderRadius: 10, 
                        paddingHorizontal: 5,
                        paddingVertical: 1,
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#000' }}>
                          x{fruit.quantity || 1}
                        </Text>
                      </View>

                      {/* 左上角經驗值小緞帶 */}
                      <View style={{ 
                        position: 'absolute', 
                        left: 6, 
                        top: 6, 
                        backgroundColor: '#FF8844', 
                        borderWidth: 0, 
                        borderColor: '#000', 
                        borderRadius: 5, 
                        paddingHorizontal: 3 
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#fff' }}>
                          +{fruit.bonus_exp}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>



        {/* 🎒 點心餵食彈窗 (Modal Bag) */}
        {/* <Modal visible={isBagOpen} transparent animationType="slide">
          <View style={{ 
            flex: 1, 
            justifyContent: 'flex-end', 
            backgroundColor: 'rgba(0,0,0,0.4)' 
            }}>
                
            <View style={{ 
                backgroundColor: '#fff', 
                borderTopLeftRadius: 24, 
                borderTopRightRadius: 24, 
                padding: 30, 
                minHeight: 300, 
                borderWidth: 3, 
                borderColor: '#111' 
                }}>
                    
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', // 💡 關鍵：自動把內容推向最左與最右兩端
                marginBottom: 25, // 稍微拉大與下方果實的間距
                paddingHorizontal: 10 // 讓按鈕不要死貼著最邊緣        
                 }}>
                
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111' }}>故事凝結的果實背包</Text>
                
                <TouchableOpacity onPress={() => setIsBagOpen(false)} >
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold', 
                    color: '#999' 
                    }}>關閉  ✕</Text>
                </TouchableOpacity>

              </View>

              {inventory.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#999', marginVertical: 40, fontSize: 14 }}>
                  背包空空的...快去故事煉金廚房提煉一些果實吧！
                </Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 15, paddingVertical: 10 }}>
                  {inventory.map(fruit => (
                    <TouchableOpacity 
                      key={fruit.id}
                      onPress={() => handleFeedFruit(fruit)}
                      style={{ 
                        width: 110, 
                        height: 150,
                        backgroundColor: '#FFFEEA', 
                        borderWidth: 2, 
                        borderColor: '#111', 
                        borderRadius: 16, 
                        padding: 10, 
                        alignItems: 'center',
                        justifyContent: 'center', // 上下置中
                     }}
                        
                    >
                      <Image 
                        source={ FRUIT_IMAGES[fruit.iconKey]} // 👈 用剛才建立的字典，透過字串金鑰撈出真正的 require
                        style={{ width: 80, height: 80, marginBottom: 5, resizeMode: 'contain' }} 
                      />
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#111', textAlign: 'center' }} numberOfLines={1}>{fruit.name}</Text>
                      <Text style={{ fontSize: 11, color: '#e67e22', fontWeight: 'bold', marginTop: 2 }}>EXP +{fruit.bonus_exp}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal> */}

      </View>
    </ImageBackground>
  );
}