/* global __dirname, Buffer */
const express = require('express');
const cors = require('cors');
const { GoogleGenAI, Type } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() }); // 將上傳的照片暫存於記憶體（留作未來擴充使用）

// 中介軟體設定
app.use(cors());
app.use(express.json());

// 確保存放快取圖片的資料夾存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}
// 開放靜態資源路由，讓手機可以透過網址讀取後端本地圖片
app.use('/images', express.static(imagesDir));

// 💡 取得環境變數中的 API Keys
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY, 
  process.env.GEMINI_API_KEY_2
].filter(Boolean);

let currentKeyIndex = 0;

// 原本的輪替金鑰（維持給聊天機器人使用）
function getNextApiKey() {
  if (GEMINI_KEYS.length === 0) {
    console.error("❌ 錯誤：未設定 API Key");
    return null;
  }
  const key = GEMINI_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
  return key;
}

function getGeminiInstance() {
  const apiKey = getNextApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// 🎯 強行鎖定第二組付費 Key 給 Imagen 使用，確保額度與權限充足
function getPaidGeminiInstance() {
  // 優先拿第二組（付費版），若沒設定則回退第一組
  const paidKey = GEMINI_KEYS[1] || GEMINI_KEYS[0];
  if (!paidKey) {
    console.error("❌ 錯誤：未設定付費版 API Key");
    return null;
  }
  return new GoogleGenAI({ apiKey: paidKey });
}

// 測試用的根路由，方便瀏覽器檢查後端狀態
app.get('/', (req, res) => {
  res.send('🚀 Lifetoon 後端伺服器安全運行中！');
});

// ==========================================
// 💬 路由 1：聊天機器人 (S)
// ==========================================
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  
  // 💡 格式化歷史紀錄，完美契合新版 @google/genai SDK 規範
  const formattedHistory = (history || [])
    .filter(h => h.text || h.message || h.content)
    .map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text || h.message || h.content }]
    }));

  const contents = [...formattedHistory, { role: "user", parts: [{ text: message }] }];
  const ai = getGeminiInstance();
  
  if (!ai) return res.status(500).json({ error: "API Key 未設定" });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: `你是一位溫暖的青少年陪伴者「S」。請簡短（40-80字）、溫馨地回應，並適時用一個問句引導對方分享生活細節。保持自然，不要官腔。`,
        temperature: 0.7,
      }
    });
    res.json({ reply: response.text });
  } catch (err) {
    console.error("聊天錯誤:", err);
    res.json({ reply: "抱歉，我現在有點累了，但你可以點右上角生成漫畫看看！✨" });
  }
});

// ==========================================
// 🎨 路由 2：生成漫畫分鏡 (已全面升級為官方 Imagen 模型)
// ==========================================
app.post('/api/generate-image', async (req, res) => {
  const { prompt: userDiaryText } = req.body;
  
  // 🎯 提示詞優化：Imagen 偏好流暢自然敘述
  const characterPrompt = "A simple 2D anime girl style illustration. The girl has clear facial features with two perfect eyes, wearing round glasses, light freckles on her face, dark hair tied in a low ponytail. She is wearing a white collared shirt under a v-neck cable knit sweater. She is a teenager. ";
  const styleSuffix = ", simple 2D manga style, clean black ink outlines, minimalist line art, flat cell shading, pure black and white comic book panel, no 3D rendering, 3:4 aspect ratio";
  
  const ai = getGeminiInstance();
  let finalPanels = [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `將此日記轉化為 4-6 格漫畫腳本: ${userDiaryText}`,
      config: {
        systemInstruction: `你是一位資深漫畫分鏡師。請根據日記生成 4-6 格漫畫。
注意：主角是一位戴圓框眼鏡的女孩，體型嬌小，年齡約16歲。
你的 sdxlPrompt 欄位只需寫出該格分鏡中主角的「動作」、「表情」與「極簡場景描述」(例如: Close up shot, looking nervous at a simple school desk, minimalist classroom background)。請用英文撰寫，保持簡潔，不要有複雜的光影描述，也不要在 sdxlPrompt 裡描述主角的服裝與髮型。`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storyboard: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  panelNumber: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  thoughtBubbles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sdxlPrompt: { type: Type.STRING, description: "具體畫面與動作描述，英文" }
                },
                required: ["panelNumber", "description", "thoughtBubbles", "sdxlPrompt"]
              }
            }
          },
          required: ["storyboard"]
        },
        temperature: 0.6,
      }
    });

    const parsed = JSON.parse(response.text);
    finalPanels = parsed.storyboard || [];
  } catch (error) {
    console.error("❌ Gemini 生成分鏡失敗，啟用保底機制:", error);
    finalPanels = Array.from({ length: 4 }, (_, i) => ({
      panelNumber: i + 1,
      description: "生活",
      thoughtBubbles: ["今天發生了這樣的事..."],
      sdxlPrompt: "sitting at desk, looking thoughtful"
    }));
  }

  console.log(`\n🎨 喚醒 Gemini Imagen 模型，開始併發產生 ${finalPanels.length} 張專屬漫畫...`);
  
  try {
    // 🎯 核心大招：利用 Promise.all 同時發送請求給 Imagen 模型加速生成
    const imageUrls = await Promise.all(
      finalPanels.map(async (panel, index) => {
        const cleanPrompt = panel.sdxlPrompt.replace(/\n/g, ' ');
        const fullPrompt = `${characterPrompt}${cleanPrompt}${styleSuffix}`;
        
        const imgAi = getPaidGeminiInstance(); 
        if (!imgAi) throw new Error("無法取得付費生圖實例");

        try {
          const imgResponse = await imgAi.models.generateImages({
            model: 'imagen-3.0-generate-002', // 💡 升級為官方高畫質正式生圖模型
            prompt: fullPrompt,
            config: {
              numberOfImages: 1,
              aspectRatio: '3:4',
              outputMimeType: 'image/jpeg',
            }
          });

          // 1. 提取 Gemini 吐回來圖片的 Base64 原始資料
          const base64Data = imgResponse.generatedImages[0].image.imageBytes;
          
          // 2. 將圖片寫入後端本地資料夾中
          const fileName = `panel-${Date.now()}-${index}.jpg`;
          const filePath = path.join(imagesDir, fileName);
          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          
          // 3. 自動組成當前區域網路連線 IP 的標準 HTTP 網址
          const localUrl = `http://${req.headers.host}/images/${fileName}`;
          console.log(`[Imagen 圖片 ${index + 1} 生成成功]: ${localUrl}`);
          return localUrl;

        } catch (imgErr) {
          console.error(`❌ 第 ${index + 1} 格 Imagen 生圖失敗，啟用安全降級保底:`, imgErr);
          // 備援方案：避免會場網路卡頓或敏感詞阻斷，自動呼叫 Pollinations 補圖，確保 APP 絕不閃退
          return `https://image.pollinations.ai/p/${encodeURIComponent(fullPrompt)}?width=768&height=1024&nologo=true&seed=${Date.now() + index}`;
        }
      })
    );

    // 完美回傳給前端
    res.json({ 
      imageUrls: imageUrls, 
      storyboard: finalPanels 
    });

  } catch (flowError) {
    console.error("❌ 生圖流程重大核心阻斷:", flowError);
    res.status(500).json({ error: "生圖核心崩潰，請檢查後端日誌" });
  }
});

// 啟動伺服器，綁定 0.0.0.0 確保局域網內的手機 Expo 順利連線
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Lifetoon 後端已啟動於 Port ${PORT}`));