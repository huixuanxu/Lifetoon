// import { useState } from 'react';
// import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground, // 🎯 就在這裡！把它光明正大帶進來
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
//import { styles } from '../../styles/chat.styles';
import { styles } from '../../styles/home.styles';

// 🎯 直接共用你最漂亮的聊天室自訂樣式

const BACKEND_IP = "localhost"; // 🎯 Windows 本機完全對齊

export default function GenerateComicAndFruitScreen() {
  //const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comicPanes, setComicPanes] = useState([]);
  const [generatedFruit, setGeneratedFruit] = useState(null);

  // 處理網頁版選取主角照片
  const handlePickImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // 呼叫後端發動煉金術
  const handleGenerate = async () => {
    if (!prompt.trim() || !imageFile) {
      return alert("請輸入故事文字並上傳主角照片！");
    }

    setLoading(true);
    setComicPanes([]); // 清空舊漫畫
    setGeneratedFruit(null); // 清空舊果實
    
    // 🎯 帶有檔案上傳，必須使用 FormData 格式
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("image", imageFile);

    try {
      const response = await fetch(`http://${BACKEND_IP}:5000/api/generate-image`, {
        method: "POST",
        body: formData, // 瀏覽器會自動封裝為 multipart/form-data
      });

      if (!response.ok) throw new Error("後端生成失敗");
      
      const data = await response.json();
      if (data.success) {
        setComicPanes(data.panes);
        setGeneratedFruit(data.fruit); // 成功捕獲果實！
      }
    } catch (error) {
      console.error(error);
      alert("生成出錯，請確認後端終端機狀態！");
    } finally {
      setLoading(false);
    }
  };

  return (
      // 🎯 1. 換上與聊天室一模一樣的羊皮紙/天空背景
      <ImageBackground 
        source={require('../../assets/images/LTbackground.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.container, { paddingBottom: 20 }]}>
          
          {/* 🎯 2. 套用聊天室專屬 Header，維持操作一致性 */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <Text style={styles.headerIconText}>〈</Text>
              </TouchableOpacity>
              <Text style={styles.mainTitle}>Lifetoon 奇幻故事煉金術</Text>
            </View>
            {/* <Text style={styles.mainTitle}>⋮</Text> */}
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 16, marginTop: 10 }}>
            
            {/* 🎯 3. 輸入故事的輸入框卡片（偽裝成與聊天泡泡同色系的文青區塊） */}
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#eee' }}>
              <TextInput
                placeholder="輸入一段今天發生的熱血或搞笑故事... (例如：今天排球比賽打出了超帥的左手扣殺！)"
                placeholderTextColor="#888" // 🎯 關鍵核心：強制指定預設詞顏色為灰色
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={4}
                style={{ color: '#111', backgroundColor: '#fff', padding: 12, borderRadius: 12, textAlignVertical: 'top', fontSize: 15, marginBottom: 16, height: 90, borderWidth: 1, borderColor: '#ddd', color: '#333' }}
              />

              {/* 相機上傳按鈕 */}
              {/* ✅ 換成符合手機原生規格的按鈕 */}
              <TouchableOpacity 
                onPress={async () => {
                  // 💡 提示：如果是在手機端，未來推薦用 expo-image-picker
                  // 現階段我們為了讓你的選取邏輯能跑，在網頁可用原生，但手機上要做防呆
                  if (typeof window !== 'undefined' && document) {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => handlePickImage(e);
                    input.click();
                  } else {
                    alert("手機端請串接 expo-image-picker 來開啟相簿喔！");
                  }
                }}
                style={{ 
                  padding: 12, 
                  backgroundColor: '#f0f4f8', 
                  borderRadius: 12, 
                  alignItems: 'center', 
                  marginBottom: 12, 
                  borderWidth: 1, 
                  borderColor: '#99aab8', 
                  borderStyle: 'dashed' 
                }}
              >
                <Text style={{ color: '#455a64', fontWeight: 'bold', fontSize: 14 }}>📷 上傳日常照片 (定義漫畫主角)</Text>
              </TouchableOpacity>

              {/* <label style={{ display: 'block', padding: 12, backgroundColor: '#f0f4f8', borderRadius: 12, textAlign: 'center', cursor: 'pointer', marginBottom: 12, border: '1px dashed #99aab8' }}>
                <Text style={{ color: '#455a64', fontWeight: 'bold', fontSize: 14 }}>📷 上傳日常照片 (定義漫畫主角)</Text>
                <input type="file" accept="image/*" onChange={handlePickImage} style={{ display: 'none' }} />
              </label> */}

              {imageFile && <Text style={{ textAlign: 'center', color: '#2e7d32', fontSize: 13, marginBottom: 10 }}>✨ 已選取: {imageFile.name}</Text>}

              {/* 發送煉金按鈕（套用與聊天室右下角發送鍵一致的風格） */}
              <TouchableOpacity 
                onPress={handleGenerate} 
                disabled={loading}
                activeOpacity={0.9}
                style={[
                  styles.warningAlertCard, // 💡 直接套用黃色看板的靈魂底色與圓角！
                  {
                    padding: 10,
                    marginTop: 10,
                    alignItems: 'center',    // 讓文字乖乖居中
                    justifyContent: 'center', // 垂直也居中
                    opacity: loading ? 0.6 : 1 // 載入中稍微變淡防呆
                  }
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#000" /> // 載入圈圈換成黑色，在黃底上更顯眼
                ) : (
                  <Text style={[
                    styles.alertTitle, // 💡 借用黃色看板的大標題字體與顏色
                    { fontSize: 16, textAlign: 'center' } // 微調成最適合按鈕的大小
                  ]}>
                    🪄 開始故事提煉
                  </Text>
                )}
              </TouchableOpacity>
              
            </View>

            {/* 🎯 4. 果實驚喜卡片區（完美模擬 S 吐給你的對話框聊天泡泡！） */}
            {generatedFruit && (
              <View style={[styles.messageRow, styles.aiRow, { marginBottom: 25 }]}>
                {/* S 的經典頭像 */}
                <View style={styles.avatarCircle}>
                  {/* <Text style={styles.avatarText}>S</Text> */}
                </View>
                
                {/* 果實泡泡卡片：底色與 aiBubble 對齊，加上黑線邊框感 */}
                <View style={[styles.aiBubble, { padding: 16, borderRadius: 18, maxWidth: '80%', borderWidth: 2, borderColor: '#333', alignItems: 'center', backgroundColor: '#ffffff' }]}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#e65100', marginBottom: 4 }}>🔮 故事凝結成了稀有果實！</Text>
                  
                  <Image source={{ uri: generatedFruit.icon_url }} style={{ width: 75, height: 75, my: 10 }} />
                  
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111' }}>{generatedFruit.name}</Text>
                  <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>屬性：【{generatedFruit.element}】 | EXP +{generatedFruit.bonus_exp}</Text>
                  
                  {/* 手繪文青感語錄 */}
                  <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#555', marginTop: 10, backgroundColor: '#f7f9fa', padding: 10, borderRadius: 8, textAlign: 'center', width: '100%', lineHeight: 18 }}>
                    「 {generatedFruit.effect_text} 」
                  </Text>
                  
                  {/* 餵食按鈕 */}
                  <TouchableOpacity 
                    onPress={() => alert(`餵食成功！怪獸高興地吃下了${generatedFruit.name}，增加了 ${generatedFruit.bonus_exp} 點經驗值！`)} 
                    style={{ backgroundColor: '#e67e22', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 12 }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>🍖 立刻餵給我的怪獸吃</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 🎯 5. 漫畫成果展示區（模擬使用者上傳漫畫的氣氛） */}
            {comicPanes.length > 0 && (
              <View style={{ gap: 20, marginBottom: 50, paddingHorizontal: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4a5568', marginBottom: -5 }}>📖 提煉出的連環漫畫：</Text>
                
                {comicPanes.map((pane, index) => (
                  <View key={index} style={[styles.messageRow, styles.userRow]}>
                    {/* 漫畫框線（2D動漫黑邊框，與你的貼圖要求呼應） */}
                    <View style={{ backgroundColor: 'white', borderWidth: 3, borderColor: '#111', borderRadius: 12, overflow: 'hidden', width: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 }}>
                      <Image source={{ uri: pane.image_url }} style={{ width: '100%', height: 260 }} resizeMode="cover" />
                      
                      {/* 漫畫底部對白 */}
                      <View style={{ padding: 12, backgroundColor: '#fff', borderTopWidth: 2, borderColor: '#111' }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', textAlign: 'center', color: '#222' }}>「 {pane.dialogue} 」</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

          </ScrollView>
        </View>
      </ImageBackground>
    );
  }

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: '#f5f7fa', padding: 20 }}>
//       <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 }}>👾 奇幻故事煉金術</Text>
//       <ImageBackground 
//       source={require('../../assets/images/LTbackground.png')} 
//       style={styles.backgroundImage}
//       resizeMode="cover"
//     ></ImageBackground>
//       {/* 輸入控制卡片 */}
//       <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 20, border: '1px solid #ddd' }}>
//         <TextInput
//           placeholder="輸入一段今天發生的熱血或搞笑故事... (例如：今天排球比賽打出了超帥的左手扣殺！)"
//           value={prompt}
//           onChangeText={setPrompt}
//           multiline
//           numberOfLines={4}
//           style={{ backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, textAlignVertical: 'top', fontSize: 16, marginBottom: 16, height: 100, border: '1px solid #eee' }}
//         />

//         {/* 原生上傳按鈕 */}
//         <label style={{ display: 'block', padding: 12, backgroundColor: '#e3f2fd', borderRadius: 8, textAlign: 'center', cursor: 'pointer', marginBottom: 12 }}>
//           <Text style={{ color: '#1e88e5', fontWeight: 'bold' }}>📷 上傳主角日常照片 (定義長相)</Text>
//           <input type="file" accept="image/*" onChange={handlePickImage} style={{ display: 'none' }} />
//         </label>
//         {imageFile && <p style={{ textAlign: 'center', color: 'green', fontSize: 14, margin: '0 0 10px 0' }}>已選取: {imageFile.name}</p>}

//         {/* 召喚按鈕 (帶有防重複點擊防呆變色) */}
//         <TouchableOpacity 
//           onPress={handleGenerate} 
//           disabled={loading}
//           style={{ backgroundColor: loading ? '#b0bec5' : '#1877f2', padding: 14, borderRadius: 8, alignItems: 'center' }}
//         >
//           {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>🪄 提煉故事（漫畫 + 果實）</Text>}
//         </TouchableOpacity>
//       </View>

//       {/* 🔮 果實驚喜卡片區 */}
//       {generatedFruit && (
//         <View style={{ backgroundColor: '#fff3e0', padding: 20, borderRadius: 16, border: '2px dashed #ffb74d', marginBottom: 25, alignItems: 'center' }}>
//           <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#e65100', marginBottom: 5 }}>🔮 故事凝結成了稀有果實！</Text>
//           <Image source={{ uri: generatedFruit.icon_url }} style={{ width: 80, height: 80, marginVertical: 10 }} />
//           <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>{generatedFruit.name}</Text>
//           <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>屬性：【{generatedFruit.element}】| 經驗值：+{generatedFruit.bonus_exp}</Text>
//           <Text style={{ fontSize: 14, fontStyle: 'italic', color: '#ff6d00', marginTop: 10, backgroundColor: '#fff', padding: 8, borderRadius: 6, width: '100%', textAlign: 'center' }}>
//             「 {generatedFruit.effect_text} 」
//           </Text>
          
//           <TouchableOpacity onPress={() => alert(`餵食成功！怪獸高興地吃下了${generatedFruit.name}，增加了 ${generatedFruit.bonus_exp} 點經驗值！`)} style={{ backgroundColor: '#ff9800', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, marginTop: 15 }}>
//             <Text style={{ color: 'white', fontWeight: 'bold' }}>🍖 立刻餵給我的怪獸吃</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* 📖 漫畫成果展示區 */}
//       {comicPanes.length > 0 && (
//         <View style={{ gap: 20, marginBottom: 50 }}>
//           <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>📖 本次故事連環漫畫：</Text>
//           {comicPanes.map((pane, index) => (
//             <View key={index} style={{ backgroundColor: 'white', border: '3px solid #000', borderRadius: 8, overflow: 'hidden' }}>
//               <Image source={{ uri: pane.image_url }} style={{ width: '100%', height: 280 }} />
//               <View style={{ padding: 12, backgroundColor: '#fff', borderTopWidth: 3, borderColor: '#000' }}>
//                 <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>「 {pane.dialogue} 」</Text>
//               </View>
//             </View>
//           ))}
//         </View>
//       )}
//     </ScrollView>
//   );
// }