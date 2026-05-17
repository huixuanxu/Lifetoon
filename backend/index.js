const express = require('express');
const cors = require('cors');
require('dotenv').config(); // 🎯 啟動並讀取 .env 設定檔

const app = express();
const PORT = process.env.PORT || 5000;

// 中介軟體設定
app.use(cors());
app.use(express.json()); // 讓後端可以解析前端傳來的 JSON 資料

// 測試用的根路由
app.get('/', (req, res) => {
  res.send('Lifetoon 後端伺服器安全運行中！');
});

// 🎯 1. 聊天 API 轉接點（後端全權處理角色人設與資料簡化）
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // 🔒 從安全的環境變數讀取 Key

    // 💡 溫馨人設移到後端保護
    const systemInstruction = "你是一位溫暖的日記陪伴者，名字叫『S』。你正在和一位叫作小文的學生聊天。請根據使用者的對話給予簡短、溫馨、像朋友一樣富有同理心的回應，字數控制在 30-80 字左右，不要使用死板的官方腔調。";

    // 呼叫 Google Gemini API（🎯 修正 1：模型統一改為與你前端一致的 gemini-2.5-flash）
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { 
              parts: [{ text: `${systemInstruction}\n\n使用者剛剛說了：${message}` }] 
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 🎯 修正 2：在後端就先檢查並解析出乾淨的文字，簡化前端負擔
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const cleanText = data.candidates[0].content.parts[0].text;
      
      // 🔒 只回傳整理好的簡潔結構給前端
      res.json({ reply: cleanText }); 
    } else {
      console.error("Gemini 原始回應異常:", data);
      res.status(400).json({ error: "AI 拒絕回應或帳戶額度受限" });
    }

  } catch (error) {
    console.error("後端聊天錯誤:", error);
    res.status(500).json({ error: "伺服器內部錯誤" });
  }
});

// 🎯 2. 未來串接文字生圖的 API 預留點
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const imgApiKey = process.env.IMAGE_GEN_API_KEY; // 🔒 安全讀取

    // 這裡未來可以放 Replicate, OpenAI 或 Stability AI 的生圖呼叫
    // ... 生圖邏輯 ...

    res.json({ imageUrl: "https://example.com/generated-comic.png" });
  } catch (error) {
    res.status(500).json({ error: "生圖失敗" });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器已在 http://localhost:${PORT} 順利啟動`);
});