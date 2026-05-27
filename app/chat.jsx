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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
// 引入與結構完全分開管理的自訂樣式
import { styles } from '../styles/chat.styles'; 

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

  // 動態計算目前的日期與星期
  const currentDateText = useMemo(() => {
    const today = new Date();
    const month = today.getMonth() + 1; 
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
      // 🎯 核心修復：把剛剛缺少的 ${BACKEND_IP} 變數完美補回，解決 Unexpected token 語法崩潰！
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
      {/* 🎯 鍵盤防擋終極修正方案 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20} // 微調 Offset 確保無論手機平板、輸入框都能在鍵盤上方留出呼吸空間
        style={{ flex: 1 }}
      >
        {/* 主內容容器 */}
        <View style={[styles.container, { flex: 1 }]}>
          
          {/* 頂部導覽列 */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                onPress={() => router.back()} 
                activeOpacity={0.7}
                style={{ paddingRight: 6 }}
              >
                <Text style={styles.headerIconText}>〈</Text>
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { textAlign: 'left' }]}>
                {currentDateText}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={handleGenerateImage} 
              activeOpacity={0.8}
              style={styles.genButtonContainer} 
            >
              <Text style={styles.genButtonText}>生成漫畫</Text>
            </TouchableOpacity>
          </View>

          {/* 聊天訊息列表 */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id}
            style={[styles.chatList, { flex: 1 }]} 
            contentContainerStyle={styles.chatContainer}
            // 🎯 優化：當鍵盤彈起、或內容長度改變時，自動平滑滾動到最底部
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
    </ImageBackground>
  );
}