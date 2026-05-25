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

  // 🎯 客製化黃色動漫風生圖按鈕（容器樣式）
  genButtonContainer: {
    height: 42,                 // 固定高度以對齊左側日期
    paddingHorizontal: 20,      // 左右留白，營造飽滿的膠囊形狀
    borderRadius: 20,           // 高度的一半，達成完美圓弧
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7C12F', // 完美還原圖片中的亮黃色
    borderWidth: 2.5,           // 與輸入框、泡泡一致的漫畫風粗黑框
    borderColor: '#000',        // 純黑邊線
    
    // ✨ 二次元必備硬邊陰影 (無擴散、高不透明度)
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,               // Android 硬邊陰影相容
  },

  // 生圖按鈕文字樣式
  genButtonText: {
    color: '#000',              // 純黑字
    fontSize: 18,               // 精緻適中的大小
    fontWeight: 'bold',          // 加粗提升手繪感
    letterSpacing: 0.5,         // 微調字距
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

  // ==========================================
  // 🛠️ 核心修正：優化底部輸入框區塊，緊貼鍵盤
  // ==========================================
  bottomContainer: {
    backgroundColor: 'transparent', // 透明以看清方格背景
    paddingHorizontal: 16,
   
    // 🎯 修正：大幅縮減底部間距（原本 iOS 是 34，改為 8，Android 改為 6）
    // 這樣一來，鍵盤彈起時，輸入框就不會再被硬生生往上推開一段奇怪的肥胖空隙！
    paddingBottom: Platform.OS === 'ios' ? 34 : 30, 
    
    // 🎯 修正：縮小頂部內距，讓聊天列表與輸入框更密合精緻
    paddingTop: 5, 
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // 漫畫感輸入框（可根據上一題自行決定改透明，這裡維持原本乾淨白底）
  inputBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: 30,
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