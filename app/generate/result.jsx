import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground, 
  Dimensions 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// 🎯 取得當前裝置的螢幕寬度與高度
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export default function ResultScreen() {
  const router = useRouter();
  
  // 接收從 loading.jsx 傳過來的 AI 圖片網址
  const params = useLocalSearchParams();
  
  // 安全檢查：確保拿到的是字串網址，防止被解析成 [object Object]
  let imageUrl = params.imageUrl;
  if (typeof imageUrl === 'object' && imageUrl !== null) {
    imageUrl = imageUrl.imageUrl || Object.values(imageUrl)[0];
  }

  // 解碼網址
  const validImageUrl = imageUrl ? decodeURIComponent(imageUrl) : null;

  return (
    <ImageBackground 
      source={require('../../assets/images/LTbackground.png')} 
      style={styles.backgroundImage}
      resizeMode="cover" // 🎯 統一改為 cover，與 Loading 頁面保持完全一致
    >
      {/* 加上外層遮罩，並控制安全間距避免手機瀏海/底部白條遮擋 */}
      <View style={styles.overlayContainer}>
        
        {/* 頂部標題 */}
        <Text style={styles.headerTitle}>✨ 你的專屬 Lifetoon ✨</Text>

        {/* 🎯 漫畫相框區塊：改用 flex 讓它在手機上能自適應伸縮，不再跑版 */}
        <View style={styles.comicFrame}>
          {validImageUrl && validImageUrl.startsWith('http') ? (
            <Image 
              source={{ uri: validImageUrl }} 
              style={styles.comicImage} 
              resizeMode="contain" // 確保各種比例的圖都能完整塞在格子裡
            />
          ) : (
            <View style={styles.errorPlaceholder}>
              <Text style={styles.errorText}>找不到生成的圖片 😢</Text>
              <Text style={styles.errorSubText}>請檢查後端是否回傳正確網址</Text>
            </View>
          )}
        </View>

        {/* 溫馨提示字樣 */}
        <Text style={styles.captionText}>「每一天，都是值得被珍藏的漫畫格子。」</Text>

        {/* 底部按鈕操作區 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => router.replace('/chat')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>再聊一會兒</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>回到首頁</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
  );
}

// 🎨 樣式設定
const styles = StyleSheet.create({
  backgroundImage: {
    // 🎯 完全同步 LoadingScreen 的背景屬性
    flex: 1,
    width: '100%',
    height: '100%',
    minWidth: windowWidth,
    minHeight: windowHeight,
  },
  overlayContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40, // 加大上下 Padding，保護手機的瀏海與底部導航列
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    letterSpacing: 1,
  },
  comicFrame: {
    // 🎯 核心修復：讓外框具有彈性，小螢幕自動縮小，大螢幕最高只長到 500
    flex: 1,
    width: '100%',
    maxWidth: 380, 
    maxHeight: 500, 
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,           
    borderWidth: 3,
    borderColor: '#222',   
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 }, 
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comicImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#FFF', 
  },
  errorPlaceholder: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorSubText: {
    color: '#999',
    fontSize: 11,
    marginTop: 4,
  },
  captionText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 380,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 0.47,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#222',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#4A6572',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#FFF',
  },
  secondaryButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
  },
});