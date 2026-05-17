import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
// 引入與結構完全分開管理的自訂樣式
import { styles } from '../styles/chat.styles'; 

export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef(null);
  
  // 🎯 1. 定義你的電腦區域網路 IP 位址
  const BACKEND_IP = "10.186.92.119";

  // 預設的初始對話紀錄
  const [messages, setMessages] = useState([
    { id: '1', sender: 'ai', text: '嗨~，今天過得如何？', isError: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false); // 控制 AI 思考中的載入狀態

  // 處理訊息發送與非同步核心邏輯
  const handleSend = async () => {
    // 【防呆機制】如果輸入框為空，或者 AI 正在載入中，直接攔拦截不發送
    if (!inputText.trim() || isAiLoading) return;

    const userRawText = inputText.trim();

    // 1. 先將使用者的訊息渲染到畫面中
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userRawText,
      isError: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAiLoading(true); // 鎖定狀態：打字思考中
    
    // 讓對話列表自動平滑滾動到最底部
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // 🎯 2. 發送網路請求至你自己的安全後端 API（不需要再帶上金鑰與人設了）
      const response = await fetch(
        `http://${BACKEND_IP}:5000/api/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userRawText // 傳送使用者輸入的文字給後端
          })
        }
      );

      // 3. 攔截非 200 的異常狀態碼
      if (!response.ok) {
        let debugHint = `後端連線異常 (狀態碼: ${response.status})`;
        if (response.status === 429) {
          debugHint = `🚨 【偵錯提示】超過免費額度上限！請稍等 1 分鐘後再試。`;
        } else if (response.status === 400) {
          debugHint = `🚨 【偵錯提示】後端請求異常，可能是 Google 額度限制或金鑰錯誤。`;
        } else if (response.status === 500) {
          debugHint = `🚨 【偵錯提示】後端伺服器內部錯誤（請檢查 backend 終端機報錯）。`;
        }
        throw new Error(debugHint);
      }

      // 4. 成功收到後端回應，解析資料
      const data = await response.json();
      
      // 🎯 【關鍵修正】直接讀取後端整理、簡化後的 data.reply 欄位
      if (data && data.reply) {
        const aiReplyText = data.reply;
        
        // 將 AI 的正確回應塞入對話
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
      // 無論成功或失敗，都關閉載入圈圈，並滾動到最低端
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
      <View style={styles.container}>
        
        {/* 頂部導覽列 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.headerIconText}>〈</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>8月29日(三)</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.headerIconText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* 聊天訊息列表 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          style={styles.chatList}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          
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

        {/* 虛擬鍵盤抗遮擋 */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
        >
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
        </KeyboardAvoidingView>

      </View>
    </ImageBackground>
  );
}