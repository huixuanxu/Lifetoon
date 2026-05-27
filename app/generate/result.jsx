import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground, 
  ScrollView,
  useWindowDimensions 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  // 1. 參數解析與安全解碼
  const rawUrls = params.imageUrls || '';
  const rawStoryboard = params.storyboard || '';
  const rawFruit = params.fruit || ''; // 🎯 完美捕獲從前一頁傳過來的果實資料

  // 2. 解析並自動修復 Pollinations 網址重疊的 Bug
  const validUrls = useMemo(() => {
    if (!rawUrls) return [];
    try {
      const decodedRaw = decodeURIComponent(rawUrls);
      const parsed = JSON.parse(decodedRaw);
      if (!Array.isArray(parsed)) return [];

      // 🛡️ 防呆機制：如果網址不小心疊加了兩次 Pollinations 開頭，自動將其還原為乾淨網址
      return parsed.map(url => {
        if (typeof url === 'string' && url.includes('image.pollinations.ai/p/')) {
          const parts = url.split('image.pollinations.ai/p/');
          const purePrompt = parts[parts.length - 1].replace(/^\/+/, '');
          return `https://image.pollinations.ai/p/${purePrompt}`;
        }
        return url;
      });
    } catch (e) {
      return [];
    }
  }, [rawUrls]);

  // 3. 解析分鏡腳本
  const aiStoryboard = useMemo(() => {
    if (!rawStoryboard) return null;
    try {
      return JSON.parse(decodeURIComponent(rawStoryboard));
    } catch (e) { return null; }
  }, [rawStoryboard]);

  // 4. 解析果實資料 (來自 monster_fruit 分支的靈魂結晶)
  const generatedFruit = useMemo(() => {
    if (!rawFruit) return null;
    try {
      return JSON.parse(decodeURIComponent(rawFruit));
    } catch (e) { return null; }
  }, [rawFruit]);

  // 5. 對白對齊處理
  const displayDialogues = useMemo(() => {
    if (aiStoryboard && aiStoryboard.length > 0) {
      return aiStoryboard.map(panel => 
        Array.isArray(panel.thoughtBubbles) ? panel.thoughtBubbles.join('\n') : (panel.thoughtBubbles || '')
      );
    }
    return Array(validUrls.length).fill("記錄今天的一刻...");
  }, [aiStoryboard, validUrls.length]);

  const dynamicContentStyles = { maxWidth: isTablet ? 520 : 380 };

  return (
    <ImageBackground 
      source={require('../../assets/images/LTbackground.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlayContainer}>
        <Text style={[styles.headerTitle, { fontSize: isTablet ? 28 : 22 }]}>✨ 你的專屬 Lifetoon ✨</Text>

        {validUrls.length > 0 ? (
          <ScrollView 
            style={[styles.comicScrollView, dynamicContentStyles]}
            contentContainerStyle={styles.comicContentContainer}
            showsVerticalScrollIndicator={false}
          >
            
            {/* 🔮 核心整合：如果前一頁有生成果實，在這個黃金位置華麗登場！ */}
            {generatedFruit && (
              <View style={styles.fruitCard}>
                <Text style={styles.fruitTitle}>🔮 故事凝結成了稀有果實！</Text>
                <Image source={{ uri: generatedFruit.icon_url }} style={styles.fruitIcon} />
                <Text style={styles.fruitName}>{generatedFruit.name}</Text>
                <Text style={styles.fruitMeta}>屬性：【{generatedFruit.element}】 | EXP +{generatedFruit.bonus_exp}</Text>
                
                <Text style={styles.fruitEffect}>
                  「 {generatedFruit.effect_text || '蘊含著今日故事的神祕力量。'} 」
                </Text>
                
                <TouchableOpacity 
                  onPress={() => alert(`餵食成功！怪獸高興地吃下了${generatedFruit.name}，增加了 ${generatedFruit.bonus_exp} 點經驗值！`)} 
                  style={styles.feedButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.feedButtonText}>🍖 立刻餵給我的怪獸吃</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 📖 連環漫畫展示區 */}
            {validUrls.map((url, index) => (
              <View key={`panel-${index}`} style={styles.singlePanelFrame}>
                <Image source={{ uri: url }} style={styles.comicImage} resizeMode="cover" />
                
                <View style={[
                  styles.speechBubble, 
                  { maxWidth: isTablet ? '65%' : '75%' }, 
                  index % 2 === 0 ? { right: 20 } : { left: 20 }
                ]}>
                  <Text style={styles.bubbleText}>{displayDialogues[index]}</Text>
                  <View style={styles.bubbleArrow} />
                </View>

                <View style={styles.panelBadge}>
                  <Text style={styles.badgeText}>{index + 1} / {validUrls.length}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.errorFrame, dynamicContentStyles]}>
            <Text style={styles.errorText}>畫布準備中...</Text>
          </View>
        )}

        {/* 底部導覽按鈕 */}
        <View style={[styles.buttonRow, dynamicContentStyles]}>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => router.replace('/chat')}>
            <Text style={styles.secondaryButtonText}>再聊一會兒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>回到首頁</Text>
          </TouchableOpacity>
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
  },
  overlayContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  comicScrollView: {
    flex: 1,
    width: '100%',
  },
  comicContentContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  singlePanelFrame: {
    width: '100%',
    aspectRatio: 3/4,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#000',
    marginBottom: 40,
    position: 'relative',
    overflow: 'hidden', 
  },
  comicImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEE',
  },
  speechBubble: {
    position: 'absolute',
    bottom: 20, 
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    zIndex: 10,
  },
  bubbleArrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#000',
    transform: [{ rotate: '45deg' }],
  },
  bubbleText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  panelBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#000',
    padding: 5,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  errorFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 0.47,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#FFF',
  },
  primaryButton: {
    backgroundColor: '#4A6572',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
  },
  secondaryButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  /* 🎯 補足怪獸果實卡片的精緻樣式 */
  fruitCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFB74D',
    borderStyle: 'dashed',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fruitTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 4,
  },
  fruitIcon: {
    width: 75,
    height: 75,
    marginVertical: 8,
  },
  fruitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  fruitMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  fruitEffect: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#555',
    marginTop: 10,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    width: '100%',
    lineHeight: 18,
  },
  feedButton: {
    backgroundColor: '#E67E22',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  feedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
});