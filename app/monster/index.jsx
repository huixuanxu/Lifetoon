import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    ImageBackground,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// 🎯 共用你最漂亮的聊天室自訂樣式包
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
  apple: require("../../assets/images/fruit_apple.png"),
  watermelon: require("../../assets/images/fruit_watermelon.png"),
};


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

  // 🎒 模擬背包中的果實數據（通常這會從後端或全域狀態撈取）
  const [inventory, setInventory] = useState([
    { 
        id: 'f1',
        name: '微光蘋果', 
        element: '光', 
        bonus_exp: 25, 
        iconKey: 'apple', // 👈 改用字串來記錄
        effect_text: '入口微酸，如心跳般緊張；甜味蔓延，化作勇氣的溫暖光芒。' 
    },
    { 
        id: 'f2',
         name: '暖心西瓜', 
         element: '水', 
         bonus_exp: 30, 
         iconKey: 'watermelon', // 👈 改用字串來記錄
         effect_text: '清爽香甜，吃完後感到身心無比舒暢，暑氣全消！' 
    }
  ]);

  const [isBagOpen, setIsBagOpen] = useState(false); // 控制點心背包彈窗

  // 🍖 核心餵食邏輯
  const handleFeedFruit = (fruit) => {
    // 1. 增加魔獸的心心（經驗值）
    setHearts(prev => prev + fruit.bonus_exp);

    // 2. 餵完後將該果實從背包扣除
    setInventory(prev => prev.filter(item => item.id !== fruit.id));
    
    // 3. 讓魔獸說出專屬的特效台詞（100% 呼應你的卡片與設計圖！）
    setMonsterDialogue(`吃完${fruit.name}，${fruit.effect_text}`);
    
    // 🎯 記錄目前正在吃哪顆水果（這會讓水果圖出現在怪獸旁邊）
    setCurrentFeedingFruit(fruit.iconKey);
    // 🎯 【關鍵邏輯】：吃完立刻變成開心的樣子！
    setMonsterMood('happy');

    //【資深提示】：建立一個「開心冷卻時間」
    // 我們不能讓它永遠開心下去，不然遊戲太單調。
    // 設定 4 秒後（4000 毫秒），它會自動變回普通的樣子。
    setTimeout(() => {
      setMonsterMood('normal'); // 自動切換回來
      setCurrentFeedingFruit(null); // 🎯 恢復成 null，水果就會隱形
    }, 4000);

    
    // 4. 關閉背包
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
          borderTopWidth: 3, 
          borderColor: '#111', 
          paddingVertical: 14,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24
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

        {/* 🎒 點心餵食彈窗 (Modal Bag) */}
        <Modal visible={isBagOpen} transparent animationType="slide">
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
                    }}>關閉 ✕</Text>
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
        </Modal>

      </View>
    </ImageBackground>
  );
}