import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react'; // 🎯 確保引入了 useRef
import {
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Text,
  TouchableOpacity,
  View,
  Animated,
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

  // 🎬 核心動畫變數群組 (🏆 修正：移回元件內部最上方！)
  const fruitFlyAnim = useRef(new Animated.Value(0)).current;  // 控制水果飛行動畫 (0 到 1)
  const heartPopScale = useRef(new Animated.Value(1)).current; // 控制右上角總愛心縮放彈跳 (預設值設為 1)
  const numFlyAnim = useRef(new Animated.Value(0)).current;    // 控制 +EXP 數字向上飄移

  // 用來暫存當前正在飛的是哪一顆水果的資料，讓動畫元件可以抓到圖
  const [animatingFruit, setAnimatingFruit] = useState(null);
  const [showPlusNum, setShowPlusNum] = useState(false);       // 控制 +EXP 數字是否顯示

  // 👾 魔獸狀態控制
  const [hearts, setHearts] = useState(500);
  const [coins, setCoins] = useState(1250);
  const [monsterDialogue, setMonsterDialogue] = useState('今天會拿到什麼好吃的果實呢？期待～');
  
  // 🎯 控制魔獸目前表情的狀態：'normal' (普通) 或 'happy' (開心)
  const [monsterMood, setMonsterMood] = useState('normal');

  // 🎯 記錄目前正在餵食哪一顆水果。預設是 null
  const [currentFeedingFruit, setCurrentFeedingFruit] = useState(null);

  // 🎯 拿到聊天頁面快遞過來的水果包裹
  const params = useLocalSearchParams();

  // 🎒 綁定全域記憶庫
  const [inventory, setInventory] = useState(global.globalInventory);
  const [isBagOpen, setIsBagOpen] = useState(false);                  

  // 🔍 每次包包一變動，就自動在黑色終端機印出來
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
        let currentInv = [];
        
        if (global.globalInventory && Array.isArray(global.globalInventory)) {
          currentInv = [...global.globalInventory];
        }
        
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
  }, [params.newFruitKey, params.newFruitName]); 


  // 🍖 核心餵食邏輯
  const handleFeedFruit = (fruit) => {
    // 0. 準備工作：關閉背包，但先記錄這顆正在飛的水果
    setIsBagOpen(false);
    setAnimatingFruit(fruit);
    
    // 重置動畫初始值
    fruitFlyAnim.setValue(0);
    numFlyAnim.setValue(0);
    heartPopScale.setValue(1); // 愛心預設大小為 1

    // 🌟 第一階段動畫：水果從小變大，並從背包位置往上飛到怪獸旁邊
    Animated.timing(fruitFlyAnim, {
      toValue: 1,
      duration: 800, // 飛行 0.8 秒
      useNativeDriver: true,
    }).start(() => {
      
      // 🌟 第二階段：水果抵達怪獸嘴邊，觸發真正餵食與數值增加！
      setHearts(prev => prev + fruit.bonus_exp);
      setMonsterDialogue(`吃完${fruit.name}，${fruit.effect_text}`);
      setCurrentFeedingFruit(fruit.iconKey); // 讓水果出現在怪獸身邊
      setMonsterMood('happy');
      
      // 水果實體飛行動畫功成身退
      setAnimatingFruit(null);
      // 打開「+EXP」向上飄移數字
      setShowPlusNum(true);

      // 🌟 第三階段：同時引爆【右上角愛心放大彈跳】與【數字飄空動畫】
      Animated.parallel([
        // A. 愛心彈跳：先放大到 1.4 倍，再彈回 1 倍
        Animated.sequence([
          Animated.timing(heartPopScale, { toValue: 1.4, duration: 150, useNativeDriver: true }),
          Animated.spring(heartPopScale, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]),
        // B. 數字向上飄動並同時淡出 (0 到 1)
        Animated.timing(numFlyAnim, {
          toValue: 1,
          duration: 1000, // 飄移 1 秒鐘
          useNativeDriver: true,
        })
      ]).start(() => {
        // 動態結束後，隱藏飄浮數字
        setShowPlusNum(false);
      });
    }); 

    // 🎒 扣除全域背包與狀態數量
    global.globalInventory = global.globalInventory.map(item => {
      if (item.iconKey === fruit.iconKey) {
        return { ...item, quantity: (item.quantity || 1) - 1 };
      }
      return item;
    }).filter(item => item.quantity > 0);

    // 🔄 同步更新畫面
    setInventory(global.globalInventory);
    
    // 魔獸台詞與開心特效計時器
    setTimeout(() => {
      setMonsterMood('normal'); 
      setCurrentFeedingFruit(null); 
    }, 6000);
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/LTbackground.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >

      {/* 🎬 特效 A：飛天魔法果實 */}
      {animatingFruit && (
        <Animated.View style={{
          position: 'absolute',
          bottom: fruitFlyAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 420] }), 
          opacity: fruitFlyAnim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }), 
          transform: [
            { scale: fruitFlyAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.6, 0.8] }) }, 
            { rotate: fruitFlyAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) } 
          ],
          alignSelf: 'center',
          zIndex: 9999, 
        }}>
          <Image 
            source={FRUIT_IMAGES[animatingFruit.iconKey]} 
            style={{ width: 80, height: 80, resizeMode: 'contain' }} 
          />
        </Animated.View>
      )}

      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        
        {/* 🏆 頂部導覽列：100% 還原設計圖 */}
        <View style={[styles.header, { backgroundColor: 'rgba(255,255,255,0.7)', borderBottomWidth: 2, borderColor: '#111' }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.headerIconText}>〈</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontWeight: 'bold' }]}>我的魔獸</Text>
          </View>
          
          {/* 右側數值狀態 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, position: 'relative' }}>
            
            {/* 🎬 動態亮點：把原本的愛心文字包進 Animated.View 裡 */}
            <Animated.View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              transform: [{ scale: heartPopScale }] 
            }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FF4444' }}>❤ </Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#222' }}>{hearts}</Text>

              {/* 🚀 核心小亮點：飄出來的「+EXP 數字」 */}
              {showPlusNum && animatingFruit && (
                <Animated.View style={{
                  position: 'absolute',
                  left: 0, 
                  top: numFlyAnim.interpolate({ inputRange: [0, 1], outputRange: [-5, -40] }),
                  opacity: numFlyAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
                }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: '900', 
                    color: '#FF6600', 
                    textShadowColor: '#FFF', 
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 1,
                  }}>
                    +{animatingFruit.bonus_exp}
                  </Text>
                </Animated.View>
              )}
            </Animated.View>

            {/* 金幣穩定待在原地 */}
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#222' }}>$ {coins}</Text>
            
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.headerIconText, { fontSize: 20 }]}>⚙︎</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 舞台中央：魔獸本體與對話框 */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            position: 'relative', 
            marginBottom: 20 
          }}>
          
            {/* 👾 魔獸主體圖片 */}
            <Image 
              source={monsterMood === 'happy' ? happymonsterImg : normalmonsterImg } 
              style={{ 
                  width: 220, 
                  height: 220, 
                  resizeMode: 'contain', 
                  marginBottom: 20 ,
              }} 
            />

            {/* 🍓 餵食中的水果貼身小圖片 */}
            {currentFeedingFruit && (
              <Image
                source={FRUIT_IMAGES[currentFeedingFruit]} 
                style={{
                  width: 100,        
                  height: 100,
                  resizeMode: 'contain',
                  position: 'absolute', 
                  left: 150,  
                  top: 80,   
                  shadowColor: '#FFFEEA',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                }}
              />
            )}
          </View>

          {/* 💬 黃色醒目對話框 */}
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

        {/* 🏁 底部四大天王按鈕 */}
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
          <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={0.7}>
              <Image source={btnWishImg} style={{ width: 60, height: 60, resizeMode: 'contain' }} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: '#222' }}>願望</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsBagOpen(true)} style={{ alignItems: 'center' }} activeOpacity={0.7}>
              <Image source={btnSnackImg} style={{ width: 60, height: 60, resizeMode: 'contain' }} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: '#e67e22' }}>點心</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={0.7}>
              <Image source={btnMealImg} style={{ width: 60, height: 60, resizeMode: 'contain' }} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: '#222' }}>餐點</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={0.7}>
              <Image source={btnSkillImg} style={{ width: 60, height: 60, resizeMode: 'contain' }} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: '#222' }}>技能</Text>
          </TouchableOpacity>
        </View>

        {/* 🎒 點心餵食彈窗 */}
        <Modal visible={isBagOpen} transparent animationType="slide">
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setIsBagOpen(false)}
            style={{ 
              flex: 1, 
              justifyContent: 'flex-end', 
              backgroundColor: 'rgba(0,0,0,0.5)' 
            }}
          >
            <TouchableOpacity 
              activeOpacity={1}
              style={{ 
                backgroundColor: '#fff', 
                borderTopLeftRadius: 28, 
                borderTopRightRadius: 28, 
                paddingTop: 16,
                paddingHorizontal: 24,
                paddingBottom: 40,
                height: '50%',             
                borderWidth: 3, 
                borderColor: '#000',      
              }}
            >
              <View style={{
                width: 50,
                height: 6,
                backgroundColor: '#DDD',
                borderRadius: 3,
                alignSelf: 'center',
                marginBottom: 20
              }} />
                  
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 20, 
              }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: '#000' }}>
                  故事凝結的果實背包
                </Text>
                
                <TouchableOpacity onPress={() => setIsBagOpen(false)}>
                  <Text style={{ fontSize: 14, fontWeight: '900', color: '#555' }}>關閉 ✕</Text>
                </TouchableOpacity>
              </View>

{inventory.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
                  <Text style={{ textAlign: 'center', color: '#999', fontSize: 15, lineHeight: 24, marginBottom: 20 }}>
                    背包空空的...{"\n"}快去故事煉金廚房提煉一些果實吧！
                  </Text>
                  
                  {/* 🚀 全新加入：直通聊天室的黃金引導按鈕 */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setIsBagOpen(false); // 1. 先貼心關閉背包彈窗
                      router.push('/chat'); // 2. 絲滑秒轉回聊天室！（🎯 如果妳的聊天室路徑不同，記得修改這裡喔！）
                    }}
                    style={{
                      backgroundColor: '#FFCC22', // 亮黃色
                      borderWidth: 2,
                      borderColor: '#000',
                      borderRadius: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 24,
                      // 輕微漫畫風立體陰影
                      shadowColor: '#000',
                      shadowOffset: { width: 3, height: 3 },
                      shadowOpacity: 0.2,
                      shadowRadius: 0,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#000' }}>
                      找 S 聊天凝聚果實 ➔
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={inventory}
                  keyExtractor={(item) => item.id}
                  numColumns={3} 
                  showsVerticalScrollIndicator={true} 
                  style={{ flex: 1 }} 
                  contentContainerStyle={{ paddingBottom: 20, gap: 14 }}
                  columnWrapperStyle={{ gap: 12, justifyContent: 'flex-start' }} // 🎯 修正：整合靠左對齊，防禦變形！
                  renderItem={({ item: fruit }) => (
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onPress={() => handleFeedFruit(fruit)}
                      style={{ 
                        width: '30.5%', // 🎯 修正：限死格子百分比寬度
                        height: 150, 
                        backgroundColor: '#FFFEEA', 
                        borderWidth: 2, 
                        borderColor: '#000', 
                        borderRadius: 16, 
                        padding: 8, 
                        alignItems: 'center',
                        justifyContent: 'flex-start', 
                        position: 'relative',
                        shadowColor: '#000',
                        shadowOffset: { width: 4, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 0,
                      }}
                    >
                      <Image 
                        source={FRUIT_IMAGES[fruit.iconKey]} 
                        style={{ width: 65, height: 65, resizeMode: 'contain', marginTop: 6, marginBottom: 4 }}
                      />
                      
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#000', textAlign: 'center' }} numberOfLines={1}>
                        {fruit.name}
                      </Text>

                      <View style={{ borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, marginTop: 4 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF8844' }}>
                          EXP +{fruit.bonus_exp}
                        </Text>
                      </View>

                      <View style={{ 
                        position: 'absolute', 
                        right: 10, 
                        bottom: 10, 
                        backgroundColor: '#FFCC22', 
                        borderRadius: 10, 
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderColor: '#000',
                      }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#000' }}>
                          x{fruit.quantity || 1}
                        </Text>
                      </View> 
                    </TouchableOpacity> // 🎯 修正：原先此處誤寫成 </View> 導致標籤閉合錯誤
                  )}
                />
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

      </View>
    </ImageBackground>
  );
}