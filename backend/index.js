const express = require('express');
const cors = require('cors');
require('dotenv').config(); // 🎯 啟動並讀取 .env 設定檔

const Replicate = require('replicate');

// 🎯 修正：顯式將 auth token 傳入實例中，徹底解決 401 找不到金鑰的問題
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const app = express();
const PORT = process.env.PORT || 5000;

// 中介軟體設定
app.use(cors());
app.use(express.json()); // 讓後端可以解析前端傳來的 JSON 資料

// 🎯 這裡新增一個輕量延遲小工具（用來對應 429 被限流時的等待）
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 測試用的根路由
app.get('/', (req, res) => {
  res.send('Lifetoon 後端伺服器安全運行中！');
});

// 🎯 1. 聊天 API 轉接點 (已加入 429 自動重試防禦)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 

    const systemInstruction = `
      你是一位溫暖的日記陪伴者，名字叫『S』。
      請根據使用者的對話給予簡短、溫馨、富有同理心的回應。
      
      【重要任務】：為了稍後能幫使用者畫出專屬漫畫，請在安慰對方的同時，自然地用一個問句引導使用者講出「當下的環境細節」
      （例如：天氣、時間、地點、手邊在做什麼）。
      
      範例：
      使用者：「我好累，專案還沒做完」
      你的回應：「天啊辛苦了！抱抱你🥺 你現在還待在圖書館或是電腦桌前嗎？窗外天黑了嗎？」

      字數請嚴格控制在 40-80 字左右，不要使用死板的官方腔調。
      不重複問已經問過的問題，也不要一次問太多問題，保持對話自然流暢。
    `;

    let geminiData = null;
    let retryCount = 0;
    const maxRetries = 2;

    // 🌟 切入點：使用迴圈包覆 fetch 流程，偵測到 429 立即自動重試
    while (retryCount <= maxRetries) {
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

      geminiData = await response.json();

      // 🔍 攔截免費版 429 Quota Exceeded 錯誤
      if (geminiData.error && geminiData.error.code === 429) {
        console.warn(`⚠️ 聊天 API 觸發 Gemini 429 限流。等待 2.5 秒後進行第 ${retryCount + 1} 次重試...`);
        retryCount++;
        await delay(2500); // 乖乖等待 2.5 秒
        continue; // 進入下一次迴圈重新 fetch
      }

      break; // 如果沒報 429，就直接跳出重試迴圈
    }

    if (geminiData && geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
      const cleanText = geminiData.candidates[0].content.parts[0].text;
      res.json({ reply: cleanText }); 
    } else {
      console.error("Gemini 原始回應異常:", geminiData);
      res.status(400).json({ error: "AI 拒絕回應或帳戶額度受限" });
    }

  } catch (error) {
    console.error("後端聊天錯誤:", error);
    res.status(500).json({ error: "伺服器內部錯誤" });
  }
});

// 🎯 2. 文字生成漫畫圖 API 節點 (已加入 429 自動重試防禦)
app.post('/api/generate-image', async (req, res) => {
  const { prompt: userDiaryText } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    console.log("🎨 收到原始日記:", userDiaryText);

    // ==========================================
    // 🌟 第一步：請 Gemini 把日記轉成英文生圖咒語 (加入 429 防禦)
    // ==========================================
    let englishPrompt = "a simple comic strip story";
    let retryCount = 0;
    const maxRetries = 2;

   const translationInstruction = `
      你是一個專業的日系漫畫分鏡提示詞專家。
      請將以下使用者的心情日記，轉換成適合給 Stable Diffusion XL 算圖的「純英文關鍵字(Prompt)」。

      ⚠️ 為了確保 AI 能畫出有分鏡框線的漫畫，請嚴格遵守以下結構：
      1. 提取日記中 2 到 3 個最關鍵的具體元素（例如：書桌、黑夜、排球、笑臉）。
      2. 絕對不要使用 "Top panel", "Panel 1" 這種分段或條列式的寫法。
      3. 所有的英文提示詞必須是「一個連續的字串」，全部用逗號分隔，不要有完整的句子。

      【🌟 固定主角設定】（必須放在最前面）：
      1girl, solo, young asian female student, soft anime appearance, simple modern casual outfit, consistent hairstyle,

      【範例輸出】（請嚴格模仿這種逗號分隔的格式）：
      1girl, solo, young asian female student, soft anime appearance, simple modern casual outfit, consistent hairstyle, sitting at desk, typing on keyboard, dark night window, playing volleyball earlier, exhausted but determined

      Diary:
      ${userDiaryText}
    `;

    // 🌟 切入點：使用迴圈包覆翻譯 fetch 流程
    while (retryCount <= maxRetries) {
      try {
        console.log(`🪄 正在請 Gemini 翻譯並重塑繪圖咒語... (第 ${retryCount + 1} 次嘗試)`);
        
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: translationInstruction }] }]
            })
          }
        );

        const geminiData = await geminiResponse.json();
        
        // 🔍 攔截免費版 429 Quota Exceeded 錯誤
        if (geminiData.error && geminiData.error.code === 429) {
          console.warn(`⚠️ 生圖翻譯觸發 Gemini 429 限流。等待 2.5 秒後進行下一次重試...`);
          retryCount++;
          await delay(2500); 
          continue; 
        }

        if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
          englishPrompt = geminiData.candidates[0].content.parts[0].text.trim();
          console.log(`✨ Gemini 咒語轉換成功！最終英文 Prompt: ${englishPrompt}`);
        }
        break; // 成功拿到或非 429 狀況就退出迴圈
      } catch (translationError) {
        console.error("⚠️ 咒語翻譯階段發生錯誤:", translationError.message);
        retryCount++;
        if (retryCount > maxRetries) {
          // 萬一真的重試到極限都失敗，使用安全降級備用詞，確保生圖流程不中斷
          englishPrompt = `japanese manga illustration, ${userDiaryText}`;
          break;
        }
        await delay(1000);
      }
    }

    // ==========================================
    // 🌟 第二步：融入「黑白日漫」魔法詞，並送交 Replicate (保持原樣)
    // ==========================================
   const comicPrompt = `
      masterpiece, absurdres, ultra detailed, highest quality,

      // 強制漫畫排版魔法詞
      professional serialized japanese manga page,
      comic book page layout, multiple panels, divided panels,
      4 to 5 clearly separated rectangular comic panels,
      thick clean black panel borders,
      consistent panel spacing,
      balanced manga composition,

      // 帶入 Gemini 整理出的日記關鍵字與主角
      ${englishPrompt},

      // 畫風與細節
      beautiful manga face, sharp clean jawline, smooth flat anime facial planes, small simplified manga nose, minimal clean lips, large expressive anime eyes, perfect face symmetry,
      clean crisp black ink lineart, professional manga pen brush strokes, precise contour lines,
      high contrast screentone shading, dense japanese manga screentones, dramatic hatch shadows,
      clean monochrome only, greyscale,

      sharp detailed background, clear room interior perspective,
      cinematic emotional storytelling, slice of life japanese manga atmosphere,

      no blur, no sketchiness, no unfinished lines
      `;

    const negativePrompt = `
      blurry,
      soft focus,
      lowres,
      bad face,
      deformed face,
      messy anatomy,
      rough sketch,
      unfinished drawing,
      duplicate character,
      multiple heads,
      poor lineart,
      washed out shading,
      empty background,
      low detail room,
      abstract composition,
      watermark,
      logo,
      text,
      color,
      photorealistic,
      3d render
      `;

    console.log("🚀 正在呼叫 Replicate SDXL 產生黑白條漫...");
    
    const output = await replicate.run(
      "jamesliuzx/manga:f0bdba9facf64f87b4beac6757180b3a5f8f9751c1cd6c03f22d289fe2ed2cf4", 
      {
        input: {
          prompt: comicPrompt,
          negative_prompt: negativePrompt,
          width: 768,
          height: 1024,     
          num_outputs: 1,    
          // scheduler: "Euler a",
          // guidance_scale: 7.0,
          // num_inference_steps: 28
        }
      }
    );

  // ==========================================
  // 🌟 第三步：解析 Replicate 回傳 (保持原樣，僅修正最後關卡)
  // ==========================================
  // ==========================================
  // 解析 Replicate 回傳
  // ==========================================

  if (!output) {
    throw new Error("Replicate 沒有回傳任何內容");
  }

  let finalImageUrl;

  // Replicate 通常回傳陣列
  if (Array.isArray(output)) {
    finalImageUrl = output[0].toString();
  }
  // 單一 URL object
  else {
    finalImageUrl = output.toString();
  }

  console.log("🎉 最終圖片網址:", finalImageUrl);

  res.json({
    imageUrl: finalImageUrl
  });

  } catch (error) {
    console.error("🚨 生圖流程最終發生錯誤:", error);
    res.status(500).json({ error: "圖片生成失敗", details: error.message });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器已在 http://localhost:${PORT} 順利啟動`);
});