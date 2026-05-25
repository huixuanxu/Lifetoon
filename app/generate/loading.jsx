import React, { useEffect, useRef } from 'react'; // 🎯 引入 useRef
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground, Dimensions, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export default function LoadingScreen() {
  const router = useRouter();
  const { prompt } = useLocalSearchParams(); 

  const BACKEND_IP = "10.48.163.119";
  
  // 🎯 修正點 1：使用 HasFetched 防止 React 18 StrictMode 在開發環境下重複發送兩次請求
  const hasFetched = useRef(false);

  useEffect(() => {
    // 如果已經發起過請求，就直接攔截，避免重複觸發
    if (hasFetched.current) return;
    hasFetched.current = true;

    const triggerImageGeneration = async () => {
      // 🎯 修正點 2：建立一個允許等待 60 秒的超時控制器（防禦 Web 端自動斷線）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 允許大腦思考 60 秒

      try {
        console.log("🚀 開始向後端請求生圖，提示詞為:", prompt);
        const finalPrompt = prompt || "兩隻可愛的小兔子在星空下看書";

        const response = await fetch(`http://${BACKEND_IP}:5000/api/generate-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: finalPrompt,
          }),
          signal: controller.signal, // 🎯 將超時訊號注入 fetch
        });

        // 成功拿到回應，清除計時器
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`伺服器連線異常 (狀態碼: ${response.status})`);
        }

        const data = await response.json();

        if (data && data.imageUrl) {
          console.log("✨ 成功拿到圖片網址！準備跳轉至結果頁:", data.imageUrl);
          const safeUrl = encodeURIComponent(data.imageUrl);

          router.replace({
            pathname: '/generate/result',
            params: { imageUrl: safeUrl }
          });
        } else {
          throw new Error("後端回傳成功，但找不到 imageUrl 欄位");
        }

      } catch (error) {
        clearTimeout(timeoutId); // 發生錯誤也要清除計時器
        
        console.error("❌ 前端生圖請求失敗:", error);
        
        // 🎯 修正點 3：優化錯誤提示，分清楚是被迫中斷還是真的連不上
        if (error.name === 'AbortError') {
          alert("生圖時間過長（超過 60 秒），已被瀏覽器中斷。請檢查後端後台是否有在運行！");
        } else {
          alert("生圖失敗，請確認後端終端機是否報錯、或局域網 IP 是否正確！");
        }
        
        router.back();
      }
    };

    triggerImageGeneration();
  }, [prompt]);

  return (
    <ImageBackground 
      source={require('../../assets/images/LTbackground.png')} 
      style={styles.backgroundImage}
      resizeMode="cover" // 💡 保持覆蓋拉伸，確保底色與聊天室一致
    >
      <View style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.titleText}>Lifetoon</Text>
          <ActivityIndicator size="large" color="#4A6572" style={{ marginVertical: 20 }} />
          <Text style={styles.subtitleText}>S 正在揮灑畫筆中...</Text>
          <Text style={styles.hintText}>AI 正在進行黑白網點與分鏡排版{"\n"}大約需要 15 ~ 30 秒，請耐心等待喔！</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    minWidth: windowWidth,
    minHeight: windowHeight,
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingBox: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '85%',
    maxWidth: 450, 
    borderWidth: 2.5,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 8,
    marginTop: 10,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});