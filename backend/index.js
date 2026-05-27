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
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}
app.use('/images', express.static(imagesDir));

// 工具：強制延遲函數，用於避免 API 瞬間流量過大
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY, 
  process.env.GEMINI_API_KEY_2
].filter(Boolean);

let currentKeyIndex = 0;

function getNextApiKey() {
  if (GEMINI_KEYS.length === 0) return null;
  const key = GEMINI_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
  return key;
}

function getGeminiInstance() {
  const apiKey = getNextApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function getPaidGeminiInstance() {
  const paidKey = GEMINI_KEYS[1] || GEMINI_KEYS[0];
  return paidKey ? new GoogleGenAI({ apiKey: paidKey }) : null;
}

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
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
        systemInstruction: `你是一位溫暖的青少年陪伴者「S」。請簡短（40-80字）、溫馨地回應，並適時用一個問句引導對方分享生活細節。`,
        temperature: 0.7,
      }
    });
    res.json({ reply: response.text });
  } catch (err) {
    res.json({ reply: "抱歉，我現在有點累了，但你可以點右上角生成漫畫看看！✨" });
  }
});

// ==========================================
// 🎨 生成漫畫 (已修正頻率與多樣性)
// ==========================================
app.post('/api/generate-image', async (req, res) => {
  const { prompt: userDiaryText } = req.body;
  
  const characterPrompt = "A simple 2D anime girl style illustration. The girl has clear facial features, round glasses, light freckles, dark hair in a low ponytail. She is wearing a white collared shirt under a v-neck cable knit sweater. ";
  const styleSuffix = ", simple 2D manga style, clean black ink outlines, minimalist line art, pure black and white comic book panel, high contrast, 3:4 aspect ratio";
  
  const ai = getGeminiInstance();
  let finalPanels = [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `將此日記轉化為 4 格漫畫腳本: ${userDiaryText}`,
      config: {
        // 🎯 關鍵優化：強制要求視覺多樣性
        systemInstruction: `你是一位資深漫畫分鏡師。請生成 4 格漫畫。
必須遵循：
1. 每一格必須使用不同的「鏡頭角度」(如：Close-up, Wide shot, Bird's eye view, Side view)。
2. 主角戴圓框眼鏡、短馬尾、針織背心。
3. sdxlPrompt 欄位只需描述該格的「動作、表情、獨特鏡頭角度、極簡場景」。保持簡潔英文。`,
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
                  sdxlPrompt: { type: Type.STRING }
                },
                required: ["panelNumber", "description", "sdxlPrompt"]
              }
            }
          },
          required: ["storyboard"]
        },
        temperature: 0.7, // 稍微提高溫度，讓分鏡更有創意
      }
    });

    const parsed = JSON.parse(response.text);
    finalPanels = parsed.storyboard || [];
  } catch (error) {
    console.error("腳本生成失敗:", error);
    finalPanels = [1,2,3,4].map(i => ({ panelNumber: i, description: "日記場景", sdxlPrompt: "standing and smiling, close up shot" }));
  }

  console.log(`\n🎨 開始逐格生成漫畫...`);
  const imageUrls = [];

  // 🎯 核心修正：將 Promise.all 改為 for 迴圈 + 延遲，防止 429
  for (let i = 0; i < finalPanels.length; i++) {
    const panel = finalPanels[i];
    const fullPrompt = `${characterPrompt}${panel.sdxlPrompt}${styleSuffix}`;
    const imgAi = getPaidGeminiInstance();
    
    try {
      console.log(`正在生成第 ${i+1} 張圖...`);
      const imgResponse = await imgAi.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt,
        config: { numberOfImages: 1, aspectRatio: '3:4' }
      });

      const base64Data = imgResponse.generatedImages[0].image.imageBytes;
      const fileName = `panel-${Date.now()}-${i}.jpg`;
      const filePath = path.join(imagesDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      
      imageUrls.push(`http://${req.headers.host}/images/${fileName}`);
      
      // 🎯 每個請求後強制等待 3 秒，這能大幅降低被擋的機率
      await sleep(3000); 

    } catch (imgErr) {
      console.error(`第 ${i+1} 格生圖失敗，降級使用 Pollinations`);
      imageUrls.push(`https://image.pollinations.ai/p/${encodeURIComponent(fullPrompt)}?width=768&height=1024&nologo=true&seed=${Date.now() + i}`);
    }
  }

  res.json({ imageUrls, storyboard: finalPanels });
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Lifetoon 後端已啟動於 Port ${PORT}`));