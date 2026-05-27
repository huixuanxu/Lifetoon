import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  // 最外層容器，確保撐滿整個螢幕
  container: {
    flex: 1,
  },
  // 背景圖片樣式：確保圖片覆蓋全螢幕且固定
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // 頂部導覽列：已完全移除 border 相關程式碼，消除了上方的小細線
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20, // 針對 iOS 留出安全區域高度
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent', // 設為透明以露出完整的方格背景
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginLeft: 16,
  },
  headerIconText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
  },
  // 聊天訊息滾動區域
  chatList: {
    flex: 1,
    backgroundColor: 'transparent', // 透明才能露出下層固定的方格背景
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  // 單條對話列的外層 Row 佈局
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  aiRow: {
    justifyContent: 'flex-start', // AI 靠左
  },
  userRow: {
    justifyContent: 'flex-end', // 使用者靠右
  },
  // AI 專屬：純黑圓形大頭貼
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // 核心：日系漫畫感對話泡泡
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 2.5,        // 漫畫風粗黑框
    borderColor: '#000',     // 純黑邊線
    backgroundColor: '#FFF',  // 泡泡內部填滿純白，蓋住方格線以便閱讀
    // 輕微的硬邊陰影，增加二次元立體感
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 2,
  },
  aiBubble: {
    borderTopLeftRadius: 4, // 模擬對話框左上角的小尖角
  },
  userBubble: {
    borderTopRightRadius: 4, // 模擬對話框右上角的小尖角
  },
  bubbleText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    fontWeight: '500',
  },
  // 正在輸入/思考中的載入樣式
  loadingBubble: {
    backgroundColor: '#EAEAEA',
    borderColor: '#666',
  },
  // 底部輸入框區塊
  bottomContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // 留出 iOS 底部安全線高度
    paddingTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 漫畫感輸入框
  inputBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    maxHeight: 120,
  },
  // 純黑圓形傳送按鈕
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#666', // 載入中時按鈕變灰
  },
  sendIconText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});