const express = require('express');
const cors = require('cors');
const multer = require('multer'); // 🎯 新增：處理照片上傳的套件
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() }); // 將上傳的照片暫存於記憶體

// 中介軟體設定
app.use(cors());
app.use(express.json());

// 測試用的根路由
app.get('/', (req, res) => {
  res.send('Lifetoon 後端伺服器安全運行中！');
});

// 🎯 1. 溫馨聊天陪伴 API (S)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const systemInstruction = "你是一位溫暖的日記陪伴者，名字叫『S』。請根據使用者的對話給予簡短、溫馨、像朋友一樣富有同理心的回應，字數控制在 30-80 字左右，不要使用死板的官方腔調。";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\n使用者剛剛說了：${message}` }] }]
        })
      }
    );

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      res.json({ reply: data.candidates[0].content.parts[0].text }); 
    } else {
      res.status(400).json({ error: "AI 拒絕回應" });
    }
  } catch (error) {
    console.error("後端聊天錯誤:", error);
    res.status(500).json({ error: "伺服器內部錯誤" });
  }
});

// 🎯 2. 【全新核心】連環漫畫 + 遊戲果實「雙效生成」API
// upload.single('image') 代表前端表單傳過來的照片欄位叫做 'image'
app.post('/api/generate-image', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body; // 使用者輸入的故事文字
    const apiKey = process.env.GEMINI_API_KEY;

    if (!prompt) {
      return res.status(400).json({ error: "請提供故事文字！" });
    }

    console.log("🎬 收到故事大綱，開始提煉:", prompt);

    // 💡 逼 Gemini 同時產出「2格漫畫分鏡」與「怪獸果實屬性」
    const systemInstruction = `你是一位遊戲策劃兼頂級美術指導。
      1. 拆解成 2 格漫畫分鏡與對白。
      2. 根據故事的整體情緒氛圍（如悲傷、快樂、熱血），設計一顆給怪獸吃的「奇幻果實」。

      ⚠️【極度重要：奇幻果實的 Prompt 視覺風格規範】
      當你為果實設計 "image_prompt" 時，必須「使用英文」並嚴格遵循以下日系療癒可愛風格設定。

      (Core Subject): [例如: An exotic apple sliced in half, showing geometric crystal seeds inside].
      (Core Style): CASUAL JAPANESE HAND-DRAWN ILLUSTRATION style, COZY AND HEALING VIBE (必須用 casual hand-drawn 和 cozy來打破幾何感).
      (Texture - CRITICAL): ROUGH SKETCH OUTLINES with colored pencils (粗糙鉛筆/色鉛筆線條勾勒輪廓). PASTEL CRAYON and watercolor paper texture (粉蠟筆和水彩紙紋理).
      (Lighting): SOFT WARM GLOW emanating from within, translucent pulp (從內部透出的柔和暖光).
      (Composition): Clean isolated on white background, Japanese game item art.
      (NEVER APPEAR - CRITICAL BAN LIST): ABSOLUTELY NO GEOMETRIC LOW-POLY, NO SMOOTH 3D RENDERING, NO FLAT DIGITAL ILLUSTRATION, NO METAL, NO MODERN TECHNOLOGY. (⚠️ 強制禁止：幾何低多邊形、平滑3D、平塗數位插畫、金屬、現代科技。)
      請嚴格以 JSON 格式回傳，絕對不要包含任何 \`\`\`json 等 Markdown 標籤，格式範例如下：
      {
        "panes": [
          {"pane": 1, "prompt": "美式漫畫風，主角在跑", "dialogue": "快遲到了！"},
          {"pane": 2, "prompt": "美式漫畫風，主角到了", "dialogue": "呼，安全過關！"}
        ],
        "fruit": {
          "name": "微光蘋果",
          "element": "光",
          "bonus_exp": 30,
          "effect_text": "入口即化，如心跳般緊張:甜味蔓延，化作勇氣的溫暖光芒！",          
        }
      }`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\n使用者故事：${prompt}` }] }]
        })
      }
    );

    const data = await response.json();
    let jsonText = data.candidates[0].content.parts[0].text.trim();
    
    // 🔒 鋼鐵防呆機制：確保 AI 就算亂吐格式，後端也不會崩潰
    let gameResult;
    try {
      jsonText = jsonText.replace(/```json|```/g, '').trim();
      gameResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Gemini 格式化失敗，啟用後備罐頭方案");
      gameResult = {
        panes: [{ pane: 1, prompt: "預設場景", dialogue: "這段劇情精彩得連 AI 都驚呆了！" }],
        fruit: { name: "奇幻驚喜軟糖", element: "光", bonus_exp: 15, effect_text: "怪獸吃完高興地跳了起來！" }
      };
    }

    // 💡 為漫畫分鏡配對隨機高品質美式/日系測試圖格 (Picsum 佔代，未來可換成真正的 Stable Diffusion 生圖)
    const finalComicPanes = gameResult.panes.map((pane, index) => ({
      pane_id: pane.pane,
      image_url: `https://picsum.photos/seed/comic_${index}_${Date.now()}/400/400`,
      dialogue: pane.dialogue
    }));

    // 💡 依據果實屬性，自動配對一顆精美的怪獸果實圖示
    const elementImages = {
      "火": "https://img.icons8.com/isometric/512/chili-pepper.png",
      "水": "https://img.icons8.com/isometric/512/blueberry.png",
      "草": "https://img.icons8.com/isometric/512/watermelon.png",
      "光": "https://img.icons8.com/isometric/512/star.png",
      "暗": "https://img.icons8.com/isometric/512/mushroom.png"
    };
    gameResult.fruit.icon_url = elementImages[gameResult.fruit.element] || "https://img.icons8.com/isometric/512/apple.png";

    // 🔒 一魚兩吃：同時回傳連環漫畫與怪獸果實！
    res.json({ 
      success: true, 
      panes: finalComicPanes, 
      fruit: gameResult.fruit 
    });

  } catch (error) {
    console.error("後端雙效生成錯誤:", error);
    res.status(500).json({ error: "伺服器內部錯誤" });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器已在 http://localhost:${PORT} 順利啟動`);
});