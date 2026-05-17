import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  // 背景 ImageBackground 的樣式
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // ScrollView 的內容容器
  container: {
    flex: 1,
    backgroundColor: 'transparent', // 保持透明才能露出背景圖
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // 留出狀態列高度
    paddingBottom: 40,
  },

  // 1️⃣ 頂部 System 對話框區域
  systemChatArea: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  // 對話框本體：漫畫風粗黑框
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 45, // 留出 System 標籤的高度
    paddingBottom: 20,
    width: '100%',
    position: 'relative',
    // 模擬漫畫硬邊陰影
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3, 
  },
  // System 標籤：右上角斜角
  systemLabelContainer: {
    position: 'absolute',
    top: 10,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  systemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
    marginRight: 6,
  },
  closeX: {
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
  },
  // 大號標題：嗨主角...
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: 16,
  },
  // 輸入導航區塊
  navigationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // 偽裝輸入框
  fakeInputBox: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    flex: 1,
    maxWidth: 240,
  },
  placeholderText: {
    fontSize: 15,
    color: '#999',
  },
  // 純黑圓形箭頭按鈕
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    transform: [{ rotate: '-15deg' }], // 箭頭稍微斜一點更有感
  },

  // 2️⃣ 黃色警示看板
  warningAlertCard: {
    backgroundColor: '#FEDC28', // 正黃色
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  alertText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 22,
    fontWeight: '500',
  },

// 3️⃣ 下方響應式卡片區域（平板並排、窄螢幕滾動磁吸）
  responsiveCardSection: {
    marginTop: 10,
    marginBottom: 40,
    width: '100%',
  },
  
  // 橫向滾動的內容容器
  scrollContentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  
  // 🎯 寬螢幕/平板專用樣式：讓三張卡片在畫面上完美等距置中並排，並自動拉滿寬度
  wideScreenJustify: {
    width: '100%',
    justifyContent: 'center', 
    paddingHorizontal: 0,
  },
  
  // 包裹單張 StoryCard 的外框
  cardWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});