export default async function handler(req, res) {
  // 只允许 POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "只支持 POST 请求"
    });
  }

  try {
    // 检查 API Key
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "没有找到 DEEPSEEK_API_KEY"
      });
    }

    // 获取前端发送的问题
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "没有收到 message"
      });
    }

    // 调用 DeepSeek
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `
你是“AI 小白成长 Agent”。

你的任务不是单纯回答问题，而是长期帮助用户学习 AI、做项目、运营自媒体并逐步实现变现。

用户目前处于 AI 初学阶段。

回答要求：
1. 用小白能够理解的语言解释
2. 不要堆砌专业术语
3. 如果出现专业术语，必须顺便解释
4. 尽量给出下一步可以直接执行的操作
5. 如果用户学习 AI，要告诉他“学什么、为什么学、怎么练”
6. 如果用户做自媒体，要结合他的真实学习过程给出选题、脚本、剪辑和发布建议
7. 如果用户遇到代码问题，要一步一步排查
8. 不要假装已经执行了用户电脑上的操作
9. 如果信息不足，明确告诉用户缺少什么
10. 回答要有结构，可以使用标题、编号和清单

用户的长期路线：

学一个知识
→ 做一个小项目
→ 把过程变成内容
→ 发布
→ 看数据
→ 复盘
→ 再学习
→ 最终寻找变现机会

请始终围绕这条路线帮助用户。
            `
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    // 获取 DeepSeek 返回的数据
    const data = await response.json();

    // DeepSeek API 本身报错
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "DeepSeek API 调用失败",
        details: data
      });
    }

    // 提取 AI 回复
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: "DeepSeek 返回成功，但没有找到 AI 回复",
        details: data
      });
    }

    // 返回给前端
    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    console.error("AI API Error:", error);

    return res.status(500).json({
      error: error.message || "服务器发生未知错误"
    });
  }
}
