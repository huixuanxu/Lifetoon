import React, { useState, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Image,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';

// 引入與結構完全分開管理的自訂樣式
import { styles } from '../styles/chat.styles';
// 🎯 【關鍵核心】：精確補上這一行，把你的水果素材演算法接過來！
import { getRandomFruit } from './constants/fruits';

// 🍓 如果你的聊天頁還沒有果實圖片字典，請補在元件外面（路徑要對齊你的 assets 喔！）
const FRUIT_IMAGES = {
  apple: require('../assets/images/fruit_apple.png'),
  watermelon: require('../assets/images/fruit_watermelon.png'),
  banana: require('../assets/images/fruit_banana.png'),
  grape: require('../assets/images/fruit_grape.png'),
  strawberry: require('../assets/images/fruit_strawberry.png'),
  passion_fruit: require('@/assets/images/fruit_passion_fruit.png'),
  dragon_fruit: require('@/assets/images/fruit_dragon_fruit.png'),
  love_fruit: require('@/assets/images/fruit_love_fruit.png'),
  cherry: require('@/assets/images/fruit_cherry.png'),
  melon: require('@/assets/images/fruit_melon.png'),
  mango: require('@/assets/images/fruit_mango.png'),
};

export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef(null);
  
  // 🎯 【Demo 命門提醒】：後天去到評審展示會場，如果連了會場的 Wi-Fi，
  // 請務必把這裡的 IP 改成妳筆電當下分到的最新 IPv4 位址！
  const BACKEND_IP = "10.48.163.119";

  // 預設的初始對話紀錄
  const [messages, setMessages] = useState([
    { id: '1', sender: 'ai', text: '嗨~，今天過得如何？', isError: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false); // 控制 AI 思考中的載入狀態

  // 🍊 全新自訂彈窗控制狀態
  const [isFruitModalOpen, setIsFruitModalOpen] = useState(false); // 控制彈窗顯示
  const [rewardFruit, setRewardFruit] = useState(null);            // 記錄當前抽中的果實資料

  // 🎯 動態計算目前的日期與星期（格式：8月29日(三)）
  const currentDateText = useMemo(() => {
    const today = new Date();
    const month = today.getMonth() + 1; // 月份從 0 開始算，所以要 +1
    const date = today.getDate();
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const dayOfWeek = days[today.getDay()];
    return `${month}月${date}日(${dayOfWeek})`;
  }, []);

  // 🎯 處理點擊「🎨 生成漫畫」按鈕的邏輯
  const handleGenerateImage = () => {
    const userConversations = messages
      .filter(m => m.sender === 'user')
      .map(m => m.text)
      .join('，'); // 💡 優化：改用中文全形逗號拼接，完美契合後端智慧切分演算法！

    if (!userConversations) {
      Alert.alert("提示", "先跟 S 聊聊天吧！有了今天的心情對話，才能幫你畫成專屬漫畫喔。");
      return;
    }

    console.log("🎬 即將打包傳送至生圖通道的內容:", userConversations);

    router.push({
      pathname: '/generate/loading',
      params: { prompt: userConversations }
    });
  };

  // 🎯 處理點擊「🍊 生成果實」按鈕的邏輯
  const handleGenerateFruit = () => {
    console.log("=== 🚨 偵錯點 1：按鈕成功被點擊了！ ===");

    const userConversations = messages
      .filter(m => m.sender === 'user')
      .map(m => m.text)
      .join('，');

    if (!userConversations || userConversations.trim() === "") {
      Alert.alert("提示", "先跟 S 聊聊天吐露心聲吧！有了今天的心情點滴，才能凝聚成魔獸的果實喔。");
      return;
    }

    console.log("=== 🚨 偵錯點 2：抓到的對話內容為 ===", userConversations);

    try {
      // 🎲 核心功能：隨機抽出一顆果實
      const fruit = getRandomFruit(); 
      console.log("=== 🚨 偵錯點 3：成功抽到的水果是 ===", fruit.name);

      // 🏆 關鍵改動：不再彈出醜 alert，而是把水果塞給狀態，並把精美 Modal 打開！
      setRewardFruit(fruit);
      setIsFruitModalOpen(true);

    } catch (error) {
      console.error("=== 🚨 前端抽卡炸爐了 ===", error);
    }
  };

  // 處理訊息發送與非同步核心邏輯
  const handleSend = async () => {
    if (!inputText.trim() || isAiLoading) return;

    const userRawText = inputText.trim();

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userRawText,
      isError: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAiLoading(true); 
    
    // 發送後立使對話列表自動平滑滾動到最底部
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // 💡 核心修正：打包聊天歷史紀錄，並過濾掉 id: '1' 的初始 AI 招呼語
    // 這樣歷史紀錄就會乾淨地從 user 開頭，嚴格遵守 Gemini 的交替規範，絕不報 400 錯誤！
    const historyPayload = messages
      .filter(m => m.id !== '1')
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

    try {
      const response = await fetch(
        `http://${BACKEND_IP}:5000/api/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userRawText,
            history: historyPayload // 💡 核心注入：讓 S 擁有真正的對話記憶能力！
          })
        }
      );

      if (!response.ok) {
        let debugHint = `後端連線異常 (狀態碼: ${response.status})`;
        if (response.status === 429) {
          debugHint = `🚨 【偵錯提示】超過免費額度上限！請稍等 1 分鐘後再試。`;
        } else if (response.status === 400) {
          debugHint = `🚨 【偵錯提示】後端請求異常，可能是 Google 歷史格式限制或金鑰錯誤。`;
        } else if (response.status === 500) {
          debugHint = `🚨 【偵錯提示】後端伺服器內部錯誤（請檢查 backend 終端機報錯）。`;
        }
        throw new Error(debugHint);
      }

      const data = await response.json();
      
      if (data && data.reply) {
        const aiReplyText = data.reply;
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReplyText.trim(),
          isError: false
        }]);
      } else {
        throw new Error("⚠️ 【偵錯提示】後端回傳格式不正確，找不到 reply 欄位。");
      }

    } catch (error) {
      console.error("【開發者主控台報錯】:", error);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: error.message || "無法連線至後端伺服器，請確認電腦後端是否有正常開啟運行。",
        isError: true
      }]);
    } finally {
      setIsAiLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // 渲染每一條聊天泡泡
  const renderMessageItem = ({ item }) => {
    const isAI = item.sender === 'ai';
    
    const bubbleStyle = [
      styles.bubble, 
      isAI ? styles.aiBubble : styles.userBubble,
      item.isError && { borderColor: '#D32F2F', backgroundColor: '#FFEBEE' }
    ];

    const textStyle = [
      styles.bubbleText,
      item.isError && { color: '#D32F2F', fontWeight: 'bold', fontSize: 13 }
    ];

    return (
      <View style={[styles.messageRow, isAI ? styles.aiRow : styles.userRow]}>
        {isAI && (
          <View style={[styles.avatarCircle, item.isError && { backgroundColor: '#D32F2F' }]}>
            <Text style={styles.avatarText}>{item.isError ? "!" : "S"}</Text>
          </View>
        )}
        <View style={bubbleStyle}>
          <Text style={textStyle}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../assets/images/LTbackground.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* 🎯 核心優化：重新校正 KeyboardAvoidingView 參數
        - 雙平台皆使用 'padding' 行為，讓整體結構在鍵盤彈起時向上推擠
        - 針對 iOS 與 Android 給予不同的高度補償量 (Offset)，徹底拉開輸入框與鍵盤的距離
      */}
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 15} 
        style={{ flex: 1 }}
      >
        {/* 主內容容器 */}
        <View style={[styles.container, { flex: 1 }]}>
          
          {/* 頂部導覽列：新增生成果實按鈕 */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                onPress={() => router.back()} 
                activeOpacity={0.7}
                style={{ paddingRight: 6 }}
              >
                <Text style={styles.headerIconText}>〈</Text>
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { fontSize: 15, textAlign: 'left' }]}>
                {currentDateText}
              </Text>
            </View>
            
            {/* 右側按鈕群組：漫畫與果實並排 */}
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              
              {/* 🎯 新加入：生成果實按鈕 */}
              <TouchableOpacity 
                onPress={handleGenerateFruit} 
                activeOpacity={0.8}
                style={[styles.genButtonContainer, { backgroundColor: '#FF8844', borderColor: '#111' }]} // 💡 給果實按鈕一個亮眼的橘色
              >
                <Text style={styles.genButtonText}>生成果實</Text>
              </TouchableOpacity>

              {/* 原本的生成漫畫按鈕 */}
              <TouchableOpacity 
                onPress={handleGenerateImage} 
                activeOpacity={0.8}
                style={styles.genButtonContainer} 
              >
                <Text style={styles.genButtonText}>生成漫畫</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 聊天訊息列表：維持 flex: 1，並確保鍵盤彈起時 FlatList 能自動縮小尺寸 */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id}
            style={[styles.chatList, { flex: 1 }]} 
            contentContainerStyle={styles.chatContainer}
            // 當鍵盤彈起、對話視窗變動時，再度強制滾動到底部，保證隨時看得到最新對話
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={isAiLoading ? (
              <View style={[styles.messageRow, styles.aiRow]}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>S</Text>
                </View>
                <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color="#000" />
                </View>
              </View>
            ) : null}
          />

          {/* 底部的輸入區塊 */}
          <View style={styles.bottomContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputBox}
                placeholder={isAiLoading ? "S 正在聆聽中..." : "寫點今天的事吧..."}
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline
                editable={!isAiLoading} 
                scrollEnabled={false} 
              />
              <TouchableOpacity 
                style={[styles.sendButton, isAiLoading && styles.disabledButton]} 
                onPress={handleSend}
                activeOpacity={0.8}
                disabled={isAiLoading}
              >
                <Text style={styles.sendIconText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>

      {/* ================= 🍊 故事魔法果實 - 硬派漫畫風彈窗 ================= */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isFruitModalOpen}
        onRequestClose={() => setIsFruitModalOpen(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // 降低背景亮度
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          
          {/* 🌟 1. 芥末黃外層 (加上超粗漫畫框線) */}
          <View style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: '#D1A317', // 芥末黃/金黃色
            borderWidth: 3,           // 超粗黑框
            borderColor: '#000',      // 純黑線
            borderRadius: 8,          // 輕微圓角
            padding: 16,
            alignItems: 'center',
            // 強烈漫畫陰影 (Offset 更遠)
            shadowColor: '#000',
            shadowOffset: { width: 8, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 0,
          }}>
            
            {/* 🌟 2. 內層白色切角卡片 (硬派復刻版) */}
            <View style={{
              backgroundColor: '#fff',
              width: '100%',
              borderWidth: 3,          // 粗黑框
              borderColor: '#000',
              borderRadius: 4,         // 輕微圓角
              padding: 20,
              alignItems: 'center',
              marginBottom: 16,
              position: 'relative',
            }}>
              {/* 🎯 漫畫風格強烈切角裝飾線条 (復刻成功！) */}
              <View style={{ position: 'absolute', left: 6, top: 12, bottom: 12, width: 2, backgroundColor: '#000' }} />
              <View style={{ position: 'absolute', right: 6, top: 12, bottom: 12, width: 2, backgroundColor: '#000' }} />

              <Text style={{ fontSize: 13, color: '#333', fontWeight: '900', letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' }}>
                獲得果實
              </Text>
              
              {/* 果實名稱 */}
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#000', marginBottom: 16 }}>
                {rewardFruit?.name}
              </Text>

              {/* 果實實體圖片 */}
              {rewardFruit && (
                <Image 
                  source={FRUIT_IMAGES[rewardFruit.iconKey]} 
                  style={{ width: 120, height: 120, resizeMode: 'contain', marginVertical: 8 }}
                />
              )}

              {/* 果實效果敘述 */}
              <Text style={{ fontSize: 13, color: '#000', textAlign: 'center', lineHeight: 20, marginTop: 12, paddingHorizontal: 6 }}>
                {rewardFruit?.effect_text}
              </Text>
            </View>

            {/* 🌟 3. 二選一漫畫按鈕群組 (並排設計) */}
            <View style={{ flexDirection: 'row', width: '100%', gap: 10, justifyContent: 'center', marginTop: 10 }}>
              
              {/* ✅ 按鈕 A：收藏水果 (留下來聊 - 升級悄悄存檔版) */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  // 🎯 核心秘密外送：直接在聊天頁把水果寫進怪獸頁的全域背包！
                  try {
                    if (typeof global.globalInventory !== 'undefined' && Array.isArray(global.globalInventory)) {
                      
                      // 🕵️‍♂️ 1. 檢查全域背包裡有沒有同款水果
                      const existsIndex = global.globalInventory.findIndex(item => item.iconKey === rewardFruit.iconKey);
                      
                      if (existsIndex !== -1) {
                        // 同款存在，數量 + 1
                        global.globalInventory[existsIndex] = {
                          ...global.globalInventory[existsIndex],
                          quantity: (global.globalInventory[existsIndex].quantity || 1) + 1
                        };
                      } else {
                        // 全新水果，開新格子
                        const spawnedFruit = {
                          id: `fruit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                          name: rewardFruit.name,
                          iconKey: rewardFruit.iconKey,
                          bonus_exp: parseInt(rewardFruit.bonus_exp, 10) || 20,
                          effect_text: rewardFruit.effect_text || '',
                          element: '心', 
                          quantity: 1
                        };
                        global.globalInventory.push(spawnedFruit);
                      }
                      console.log(`📦 [收藏成功] 已悄悄將 ${rewardFruit.name} 送進全域背包庫！`);
                    }
                  } catch (e) {
                    console.error("🚨 收藏水果時寫入全域失敗：", e);
                  }

                  // 🎬 2. 存完後，優雅地關閉彈窗，讓玩家留在聊天室繼續聊
                  setIsFruitModalOpen(false);
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#666', // 灰色
                  borderWidth: 2,
                  borderColor: '#000',
                  borderRadius: 30,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#fff' }}>收藏水果</Text>
              </TouchableOpacity>

              {/* 按鈕 B：立即餵食 (直接跳轉) - 給他醒目的黃色 */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setIsFruitModalOpen(false); // 關閉彈窗
                  // 🚀 核心快遞跳轉邏輯
                  router.push({
                    pathname: '/monster',
                    params: {
                      newFruitKey: rewardFruit.iconKey,
                      newFruitName: rewardFruit.name,
                      newFruitExp: rewardFruit.bonus_exp,
                      newFruitText: rewardFruit.effect_text,
                    }
                  });
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#FFCC22', // 亮黃色
                  borderWidth: 2,          // 粗框
                  borderColor: '#000',
                  borderRadius: 30,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#000' }}>立即餵食 ➔ </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}