import React from "react";
import { 
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions // 🎯 引入動態偵測螢幕寬度的 Hook
 } from "react-native";
import { useRouter } from 'expo-router';

import Header from "../components/HomeHeader";
import StoryCard from "../components/StoryCard";

import { styles } from "../styles/home.styles";

const bg = require("../assets/images/LTbackground.png");
const comicPhoneImg = require("../assets/images/homeimage01.png"); //

export default function Home() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions(); // 🎯 即時取得當前螢幕總寬度

  // 📐 計算排版邏輯
  const CARD_WIDTH = 250; // 每張卡片的寬度
  const CARD_GAP = 16;    // 卡片之間的間距
  const TOTAL_CARDS_WIDTH = CARD_WIDTH * 3 + CARD_GAP * 2; // 三張卡片加上間距的總寬度
  const HORIZONTAL_PADDING = 48; // 左右兩側預留的 Padding 總和
  
  // 💡 關鍵判斷：如果螢幕總寬度扣掉邊距後，大於三張卡片的總寬度，就代表是「寬螢幕/平板」
  const isWideScreen = windowWidth - HORIZONTAL_PADDING >= TOTAL_CARDS_WIDTH;

  const goToChat = () => {
    router.push('/chat');
  };

  return (
    <ImageBackground source={bg} style={styles.backgroundImage} resizeMode="cover">
        <ScrollView 
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          <Header />

          {/* SYSTEM 對話導航區域 */}
          <View style={styles.systemChatArea}>
            <View style={styles.speechBubble}>
              <View style={styles.systemLabelContainer}>
                <Text style={styles.systemTitle}>SYSTEM</Text>
                <Text style={styles.closeX}>✕</Text>
              </View>

              <Text style={styles.mainTitle}>嗨主角</Text>
              <Text style={styles.mainTitle}>聊聊今天的劇情？</Text>

              <TouchableOpacity style={styles.navigationInputRow} onPress={goToChat} activeOpacity={0.8}>
                  <View style={styles.fakeInputBox}>
                      <Text style={styles.placeholderText}>故事發生中...</Text>
                  </View>
                  <View style={styles.arrowButton}>
                      <Text style={styles.arrowText}>➤</Text>
                  </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 黃色醒目看板 */}
          <View style={styles.warningAlertCard}>
            <Text style={styles.alertTitle}>【喚醒世界：建立主角檔案】</Text>
            <Text style={styles.alertText}>請前往『主角管理系統』填寫基本資訊，正式開啟故事篇章 ＞＞＞</Text>
          </View>

          {/* 🎯 下方響應式卡片區域：窄螢幕可滑動，寬螢幕直接並排呈現在畫面上 */}
          <View style={styles.responsiveCardSection}>
            <ScrollView
              horizontal // 開啟橫向排列
              showsHorizontalScrollIndicator={false} // 隱藏橫向滾動條
              // 💡 寬螢幕時禁用滑動（因為已經全顯示了），窄螢幕時允許滑動
              scrollEnabled={!isWideScreen} 
              // 💡 窄螢幕時開啟分頁滑動效果，讓卡片一張張停在中間
              pagingEnabled={!isWideScreen} 
              // 根據螢幕寬度動態調整卡片容器的樣式（寬螢幕居中並排，窄螢幕靠左滑動）
              contentContainerStyle={[
                styles.scrollContentContainer,
                isWideScreen ? styles.wideScreenJustify : { paddingHorizontal: (windowWidth - CARD_WIDTH) / 2 }
              ]}
              // 窄螢幕滑動時的磁吸效果設定
              snapToInterval={CARD_WIDTH + CARD_GAP}
              snapToAlignment="center"
              decelerationRate="fast"
            >
              {/* 卡片 1：今日任務 */}
              <View style={[styles.cardWrapper, { marginRight: CARD_GAP }]}>
                <StoryCard 
                  title="今日任務" 
                  status="執行中 0 項" 
                />
              </View>

              {/* 卡片 2：故事集 */}
              <View style={[styles.cardWrapper, { marginRight: CARD_GAP }]}>
                <StoryCard 
                  title="待定義的故事" 
                  subtitle="序章：故事的起源" 
                  status="探索中"
                  image={comicPhoneImg} //
                />
              </View>

              {/* 卡片 3：主角資料 */}
              <View style={styles.cardWrapper}>
                <StoryCard 
                  title="解鎖稱號" 
                  subtitle="新生的故事主角"
                  status="已獲得 0 項" 
                />
              </View>
            </ScrollView>
          </View>

        </ScrollView>
    </ImageBackground>
  );
}