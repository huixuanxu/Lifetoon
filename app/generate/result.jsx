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

  // 1. 參數解析
  const rawUrls = params.imageUrls || '';
  const rawStoryboard = params.storyboard || '';

  const validUrls = useMemo(() => {
    if (!rawUrls) return [];
    try {
      const decodedRaw = decodeURIComponent(rawUrls);
      const parsed = JSON.parse(decodedRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [rawUrls]);

  const aiStoryboard = useMemo(() => {
    if (!rawStoryboard) return null;
    try {
      return JSON.parse(decodeURIComponent(rawStoryboard));
    } catch (e) { return null; }
  }, [rawStoryboard]);

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
          >
            {validUrls.map((url, index) => (
              <View key={`panel-${index}`} style={styles.singlePanelFrame}>
                {/* 這裡的 url 由於已經被 Loading 頁面 prefetch，會直接光速從快取讀取出來 */}
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
});