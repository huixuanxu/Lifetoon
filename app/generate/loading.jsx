import React, { useEffect, useRef, useState } from 'react'; 
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground, Dimensions, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export default function LoadingScreen() {
  const router = useRouter();
  const { prompt } = useLocalSearchParams(); 

  const BACKEND_IP = "10.48.163.119";
  
  const hasFetched = useRef(false);

  // 動態調配生圖趣味台詞
  const [dynamicHint, setDynamicHint] = useState("S 正在細心構思分鏡劇本...");

  useEffect(() => {
    const hintScripts = [
      "S 正在細心構思分鏡劇本...",
      "正在分析今天的心情，捕捉情緒色彩...",
      "正在描繪最初的分鏡：勾勒今日的事件起點...",
      "正在繪製精彩的情節：拿著畫筆努力填補細節中...",
      "正在努力構思：將妳的話語轉化為趣味分鏡...",
      "正在精心排版妳專屬的漫畫對話框...",
      "正在畫布上套用經典復古黑白網點...",
      "最後衝刺！正在將連連環漫畫打包送回妳的手機..."
    ];

    let currentHintIndex = 0;
    const hintInterval = setInterval(() => {
      currentHintIndex = (currentHintIndex + 1) % hintScripts.length;
      setDynamicHint(hintScripts[currentHintIndex]);
    }, 4500);

    return () => clearInterval(hintInterval);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const triggerImageGeneration = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); 

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
          signal: controller.signal, 
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`伺服器連線異常 (狀態碼: ${response.status})`);
        }

        const data = await response.json();
        console.log("📦 後端回傳的完整資料：", data);

        if (data && data.imageUrls) { 
          console.log("✨ 成功拿到圖片網址！開啟並行硬核預載入機制...");
          setDynamicHint("分鏡稿已完成！S 正在全力繪製所有漫畫格子... 🎨");
          
          // 🎯 核心修正：將原本的 for 迴圈改為 Promise.all 並行強制等待
          // 這樣 4 張圖會同時向 Pollinations 發起請求，迫使伺服器併發繪圖，速度快 4 倍！
          try {
            await Promise.all(
              data.imageUrls.map(async (url, index) => {
                // Image.prefetch 在成功時會回傳 true，若回傳 false 或拋出錯誤代表沒下載成功
                const success = await Image.prefetch(url);
                if (!success) {
                  console.warn(`⚠️ 第 ${index + 1} 張圖快取回傳 false，嘗試進行二次重試...`);
                  await Image.prefetch(url); // 進行一次自動重試
                }
                console.log(`✅ 第 ${index + 1} 張漫畫格子下載並快取成功！`);
              })
            );

            // 🎯 貼心緩衝：全數下載完後稍微定格 8000 毫秒
            // 確保手機作業系統順利將快取寫入磁碟，同時給使用者一個完美的視覺過渡
            setDynamicHint("最後衝刺！正在將連環漫畫打包送回妳的手機...");
            await new Promise(resolve => setTimeout(resolve, 8000));

          } catch (imgError) {
            // 如果遇到極極少數的網路波動導致部分失敗，記錄下來，延遲 15 秒緩衝讓前端後續有機會補載
            console.error("⚠️ 部分圖片預載期間發生異常:", imgError);
            setDynamicHint("正在努力優化畫面排版中...");
            await new Promise(resolve => setTimeout(resolve, 15000));
          }

          console.log("✨ 所有圖片快取檢驗完畢！正式跳轉至結果頁");
          
          router.replace({
            pathname: '/generate/result',
            params: { 
              imageUrls: JSON.stringify(data.imageUrls), 
              prompt: finalPrompt,
              storyboard: data.storyboard ? JSON.stringify(data.storyboard) : ''
            } 
          });
        } else {
          throw new Error("後端回傳成功，但找不到 imageUrls 欄位");
        }

      } catch (error) {
        clearTimeout(timeoutId); 
        console.error("❌ 前端生圖請求失敗:", error);
        
        if (error.name === 'AbortError') {
          Alert.alert("連線超時", "生圖時間過長（超過 180 秒），已被中斷。請確認後端終端機是否仍在運行！");
        } else {
          Alert.alert("生圖失敗", `無法完成繪製，錯誤原因：${error.message || '請確認後端伺服器是否正常運行！'}`);
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
      resizeMode="cover" 
    >
      <View style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.titleText}>Lifetoon</Text>
          <ActivityIndicator size="large" color="#4A6572" style={{ marginVertical: 20 }} />
          
          <Text style={styles.subtitleText}>{dynamicHint}</Text>
          
          <Text style={styles.hintText}>AI 正在進行黑白網點與分鏡排版繪製{"\n"}大約需要 1~2 分鐘，請耐心等待喔！</Text>
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
    fontSize: 15,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 8,
    marginTop: 10,
    textAlign: 'center',
    minHeight: 22, 
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});